#!/usr/bin/env node
/**
 * fetch-github-stats.cjs
 *
 * Fetches per-store GitHub metadata (stars, contributors, last_commit, license)
 * via `gh api` and writes scoring/github-stats.json. The trust scorer
 * (compute-trust.cjs) reads this file to drive the maintenance + adoption +
 * license-name signals.
 *
 * Caches with 24h TTL: re-running within the window skips refetches.
 *
 * Per-store extraction strategy:
 *   - Parse owner/repo from supported-stores.json remote URL
 *   - GET /repos/{owner}/{repo}                       -> stars, default_branch,
 *                                                        pushed_at, license, archived
 *   - GET /repos/{owner}/{repo}/commits?per_page=1     -> last_commit_sha + date
 *     (only when pushed_at is stale; else trust pushed_at)
 *   - GET /repos/{owner}/{repo}/contributors?per_page=1&anon=true (HEAD link parse)
 *                                                      -> contributor_count
 *
 * plugin-mall: skipped here (it's THIS repo; the workflow already has its data).
 * Local fallback when gh CLI / token missing: read locally captured stats if any.
 *
 * Usage:
 *   GITHUB_TOKEN=<token> node scripts/fetch-github-stats.cjs
 *   node scripts/fetch-github-stats.cjs --force  # ignore 24h cache
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..');
const SUPPORTED_PATH = path.join(REPO_ROOT, 'sources', 'supported-stores.json');
const STATS_PATH = path.join(REPO_ROOT, 'scoring', 'github-stats.json');
const FORCE = process.argv.includes('--force');
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

// Ensure scoring/ exists
fs.mkdirSync(path.dirname(STATS_PATH), { recursive: true });

function parseGithubRepo(remoteUrl) {
  // https://github.com/owner/repo.git -> { owner: 'owner', repo: 'repo' }
  if (!remoteUrl) return null;
  const m = remoteUrl.match(/github\.com[\/:]([^/]+)\/([^/]+?)(?:\.git)?$/);
  if (!m) return null;
  return { owner: m[1], repo: m[2] };
}

function ghApi(endpoint) {
  // Returns parsed JSON or null on failure. Quiet — failure modes are common
  // (rate limit, network, repo moved); the trust scorer treats missing data
  // as "no signal" not as "low signal".
  try {
    const out = execSync(`gh api ${endpoint}`, {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 30000,
    }).trim();
    return JSON.parse(out);
  } catch {
    return null;
  }
}

function ghApiContributorCount(owner, repo) {
  // GitHub returns a paginated list with Link header containing rel="last".
  // We capture the response header rather than the body to extract the page count.
  try {
    const out = execSync(
      `gh api -i /repos/${owner}/${repo}/contributors?per_page=1`,
      { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 30000 }
    );
    // Parse `Link:` header for rel="last" page number
    const linkLine = out.split('\n').find((l) => /^link:/i.test(l));
    if (!linkLine) {
      // Single page = single contributor (or anon-only); fall back to length
      const bodyStart = out.indexOf('\n\n');
      if (bodyStart < 0) return null;
      const body = out.slice(bodyStart + 2).trim();
      try { return JSON.parse(body).length; } catch { return null; }
    }
    const m = linkLine.match(/page=(\d+)>;\s*rel="last"/);
    return m ? Number(m[1]) : null;
  } catch {
    return null;
  }
}

function fetchStoreStats(store) {
  const repo = parseGithubRepo(store.remote);
  if (!repo) return { error: 'unparseable remote: ' + store.remote };

  const meta = ghApi(`/repos/${repo.owner}/${repo.repo}`);
  if (!meta) return { error: 'gh api /repos returned no data', remote: store.remote };

  const contributorCount = ghApiContributorCount(repo.owner, repo.repo);

  return {
    owner: repo.owner,
    repo: repo.repo,
    stars: meta.stargazers_count ?? 0,
    forks: meta.forks_count ?? 0,
    open_issues: meta.open_issues_count ?? 0,
    default_branch: meta.default_branch || null,
    pushed_at: meta.pushed_at || null,
    archived: !!meta.archived,
    license_spdx: meta.license?.spdx_id || null,
    license_name: meta.license?.name || null,
    contributor_count: contributorCount,
    fetched_at: new Date().toISOString(),
  };
}

function loadCache() {
  if (!fs.existsSync(STATS_PATH)) return { stores: {} };
  try {
    return JSON.parse(fs.readFileSync(STATS_PATH, 'utf-8'));
  } catch {
    return { stores: {} };
  }
}

function isCacheFresh(entry) {
  if (FORCE || !entry?.fetched_at) return false;
  const age = Date.now() - new Date(entry.fetched_at).getTime();
  return age < CACHE_TTL_MS && !entry.error;
}

function main() {
  const supported = JSON.parse(fs.readFileSync(SUPPORTED_PATH, 'utf-8'));
  const cache = loadCache();
  // Pin top-level generated_at to prior value if nothing changed semantically
  // (all stores cache-hit). Keeps the pipeline end-to-end idempotent so the
  // weekly cron doesn't open a PR when upstream sources haven't moved.
  const stats = { generated_at: null, stores: {} };

  let fetched = 0;
  let cached = 0;
  let errors = 0;
  let skipped = 0;

  for (const store of supported.stores) {
    // Skip plugin-mall self-entry (this repo's own stats are computed differently
    // by compute-trust.cjs from local provenance signal + license field; the
    // public Mall repo doesn't need its own stargazer count for self-trust).
    if (store.name === 'plugin-mall') {
      stats.stores[store.name] = {
        self_entry: true,
        provenance: true,
        note: 'plugin-mall self-entry; trust scoring derives from provenance + license fields in supported-stores.json',
      };
      skipped++;
      continue;
    }

    const cached_entry = cache.stores?.[store.name];
    if (isCacheFresh(cached_entry)) {
      stats.stores[store.name] = cached_entry;
      cached++;
      continue;
    }

    process.stdout.write(`FETCH ${store.name.padEnd(40)} ... `);
    const result = fetchStoreStats(store);
    if (result.error) {
      console.log(`ERROR: ${result.error}`);
      stats.stores[store.name] = { ...result, fetched_at: new Date().toISOString() };
      errors++;
    } else {
      const archivedFlag = result.archived ? ' [archived]' : '';
      console.log(`${result.stars} stars, ${result.contributor_count ?? '?'} contributors, ${result.license_spdx || 'no-license'}${archivedFlag}`);
      stats.stores[store.name] = result;
      fetched++;
    }
  }

  // Top-level generated_at: bump only if any per-store record actually changed.
  // Otherwise preserve prior to keep downstream files byte-stable.
  const priorStores = cache.stores || {};
  const semanticallyChanged = fetched > 0 || JSON.stringify(stats.stores) !== JSON.stringify(priorStores);
  stats.generated_at = semanticallyChanged
    ? new Date().toISOString()
    : (cache.generated_at || new Date().toISOString());

  fs.writeFileSync(STATS_PATH, JSON.stringify(stats, null, 2) + '\n');

  console.log('');
  console.log('=== github-stats summary ===');
  console.log(`Fetched (fresh):    ${fetched}`);
  console.log(`Cached (24h fresh): ${cached}`);
  console.log(`Skipped (self):     ${skipped}`);
  console.log(`Errors:             ${errors}`);
  console.log(`Output:             ${STATS_PATH}`);
}

main();
