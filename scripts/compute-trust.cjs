#!/usr/bin/env node
/**
 * compute-trust.cjs
 *
 * Phase 3d of PLAN-mall-automation v3 / ADR-008.
 *
 * Reads catalog/stores/<store>.json + scoring/github-stats.json and computes
 * a 0-100 trust score per plugin, with the signal breakdown ALWAYS published
 * alongside (per ADR-008 § Trust scoring formula — published signals are
 * load-bearing; trust without provenance is worse than no trust).
 *
 * Six-signal formula:
 *
 *   STORE-LEVEL signals (computed once per store, copied to every plugin):
 *     provenance     0 or +50  Mall-as-store gets +50; third-party gets 0
 *     maintenance    0-15      based on last_commit recency
 *     adoption       0-10      based on stars + contributors (log-scaled)
 *     license        0-10      OSI-approved=10, clear non-permissive=7, no-license=0
 *
 *   PLUGIN-LEVEL signals (computed per plugin, added on top):
 *     frontmatter    0-10      description + version + lastReviewed presence
 *     readme         0-5       README excerpt >= 50 chars
 *
 *   plugin.trust_score = store_score + plugin_score (capped at 100)
 *
 * Outputs:
 *   - catalog/stores/<store>.json: adds store_trust + per-plugin trust_score/trust_signals
 *   - scoring/trust-audit.json: aggregate per-store + score distribution
 *
 * Path resolution:
 *   - plugin-mall: provenance=true, signals derived from supported-stores.json
 *                  (license field) + this repo's own git history (last commit)
 *   - third-party: provenance=false, signals derived from scoring/github-stats.json
 *
 * Idempotent: re-running with unchanged inputs produces identical output.
 *
 * Usage:
 *   node scripts/compute-trust.cjs
 *   node scripts/compute-trust.cjs --store plugin-mall   # single-store mode
 *   node scripts/compute-trust.cjs --dry-run             # report, don't write
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..');
const CATALOG_STORES_DIR = path.join(REPO_ROOT, 'catalog', 'stores');
const SUPPORTED_PATH = path.join(REPO_ROOT, 'sources', 'supported-stores.json');
const STATS_PATH = path.join(REPO_ROOT, 'scoring', 'github-stats.json');
const TRUST_AUDIT_PATH = path.join(REPO_ROOT, 'scoring', 'trust-audit.json');

const STORE_ARG_IDX = process.argv.indexOf('--store');
const SINGLE_STORE = STORE_ARG_IDX > -1 ? process.argv[STORE_ARG_IDX + 1] : null;
const DRY_RUN = process.argv.includes('--dry-run');

// --- License classification (drives the license signal) ---

// OSI-approved permissive + copyleft licenses. Score 10.
const OSI_APPROVED = new Set([
  'MIT', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'ISC',
  'GPL-2.0', 'GPL-3.0', 'GPL-2.0-only', 'GPL-2.0-or-later',
  'GPL-3.0-only', 'GPL-3.0-or-later', 'LGPL-2.1', 'LGPL-3.0',
  'AGPL-3.0', 'MPL-2.0', 'CDDL-1.0', 'EPL-2.0', 'Zlib', 'Unlicense', '0BSD',
]);

// Clear but non-permissive licenses. Score 7. (Mall ships PolyForm-NC here per ADR-008.)
const CLEAR_NON_PERMISSIVE = new Set([
  'PolyForm-Noncommercial-1.0.0',
  'PolyForm-Small-Business-1.0.0',
  'CC-BY-4.0', 'CC-BY-SA-4.0',
  'CC-BY-NC-4.0', 'CC-BY-NC-SA-4.0',
  'BUSL-1.1',
  'SSPL-1.0',
  'Elastic-2.0',
]);

function scoreLicense(spdxId) {
  if (!spdxId || spdxId === 'NOASSERTION') return 0;
  if (OSI_APPROVED.has(spdxId)) return 10;
  if (CLEAR_NON_PERMISSIVE.has(spdxId)) return 7;
  // Unknown SPDX -> half credit (license is named but we don't recognize it)
  return 5;
}

// --- Maintenance signal: last_commit recency ---

function scoreMaintenance(lastCommitIso) {
  if (!lastCommitIso) return 0;
  const ageDays = (Date.now() - new Date(lastCommitIso).getTime()) / (1000 * 60 * 60 * 24);
  if (ageDays < 30) return 15;     // active
  if (ageDays < 90) return 12;
  if (ageDays < 180) return 9;
  if (ageDays < 365) return 6;     // year-stale
  if (ageDays < 730) return 3;     // two-year-stale
  return 0;                         // older than 2 years
}

// --- Adoption signal: stars + contributors ---

function scoreAdoption(stars, contributors) {
  // Log-scaled to avoid the "popular owner repo dominates" trap. Heuristic:
  //   stars >= 1000 + contributors >= 5  -> 10
  //   stars >= 200  + contributors >= 3  -> 7
  //   stars >= 50   + contributors >= 2  -> 5
  //   stars >= 10                         -> 3
  //   any                                 -> 1 (still on GitHub at all)
  const s = stars || 0;
  const c = contributors || 0;
  if (s >= 1000 && c >= 5) return 10;
  if (s >= 200 && c >= 3) return 7;
  if (s >= 50 && c >= 2) return 5;
  if (s >= 10) return 3;
  if (s > 0) return 1;
  return 0;
}

// --- Plugin-level frontmatter signal ---

function scoreFrontmatter(plugin) {
  const std = plugin.frontmatter?.standard || {};
  let score = 0;
  if (std.description) score += 5;     // description is the most important
  if (std.version) score += 3;
  if (std.lastReviewed) score += 2;
  return score;
}

function scoreReadme(plugin) {
  const excerpt = plugin.readme_excerpt;
  if (!excerpt) return 0;
  if (excerpt.length >= 50) return 5;
  if (excerpt.length >= 20) return 3;
  return 1;
}

// --- Store-level trust assembly ---

function computeStoreSignals(registryEntry, githubStats) {
  // plugin-mall: provenance + license from registry (no GitHub stats path).
  // third-party: signals from github-stats.json.
  if (registryEntry.name === 'plugin-mall') {
    // Mall self-trust:
    //   - provenance: +50 (the load-bearing first-party signal)
    //   - maintenance: 15 (curation flow updates continuously)
    //   - adoption: 10 (fleet's primary marketplace)
    //   - license: scoreLicense(registry.license) — 7 for PolyForm-NC per ADR-008
    return {
      provenance: 50,
      maintenance: 15,
      adoption: 10,
      license: scoreLicense(registryEntry.license),
      license_name: registryEntry.license || null,
      stars: null,
      contributors: null,
      last_commit: null,
      archived: false,
      note: 'first-party (Mall self-entry); maintenance + adoption pinned per ADR-008 § Trust scoring formula',
    };
  }

  // Third-party: derive from GitHub stats. Missing data = 0 signal (honest).
  const stats = githubStats?.stores?.[registryEntry.name];
  if (!stats || stats.error) {
    return {
      provenance: 0,
      maintenance: 0,
      adoption: 0,
      license: 0,
      license_name: null,
      stars: null,
      contributors: null,
      last_commit: null,
      archived: false,
      stats_error: stats?.error || 'missing from github-stats.json',
    };
  }

  return {
    provenance: 0,
    maintenance: stats.archived ? 0 : scoreMaintenance(stats.pushed_at),
    adoption: scoreAdoption(stats.stars, stats.contributor_count),
    license: scoreLicense(stats.license_spdx),
    license_name: stats.license_spdx,
    stars: stats.stars,
    contributors: stats.contributor_count,
    last_commit: stats.pushed_at,
    archived: stats.archived,
  };
}

function sumStoreScore(signals) {
  return (signals.provenance || 0)
    + (signals.maintenance || 0)
    + (signals.adoption || 0)
    + (signals.license || 0);
}

// --- Per-plugin trust ---

function computePluginTrust(plugin, storeScore, storeSignals) {
  const pluginSignals = {
    store: storeScore,
    frontmatter: scoreFrontmatter(plugin),
    readme: scoreReadme(plugin),
  };
  const raw = pluginSignals.store + pluginSignals.frontmatter + pluginSignals.readme;
  const score = Math.min(100, raw);
  return {
    score,
    signals: {
      ...pluginSignals,
      // Store-level breakdown surfaced per plugin too — heirs reading a single
      // plugin entry should see why the store earned its share of the score.
      store_breakdown: storeSignals,
    },
  };
}

// --- Per-store driver ---

function processStore(filePath, registry, githubStats) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const registryEntry = registry.stores.find((s) => s.name === data.store);
  if (!registryEntry) {
    return { error: `store ${data.store} missing from supported-stores.json` };
  }

  const storeSignals = computeStoreSignals(registryEntry, githubStats);
  const storeScore = sumStoreScore(storeSignals);

  data.store_trust = {
    score: storeScore,
    signals: storeSignals,
  };

  let minPluginScore = 100;
  let maxPluginScore = 0;
  for (const plugin of data.plugins || []) {
    const trust = computePluginTrust(plugin, storeScore, storeSignals);
    plugin.trust_score = trust.score;
    plugin.trust_signals = trust.signals;
    if (trust.score < minPluginScore) minPluginScore = trust.score;
    if (trust.score > maxPluginScore) maxPluginScore = trust.score;
  }

  if (!DRY_RUN) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
  }

  return {
    store: data.store,
    store_score: storeScore,
    plugin_count: data.plugins?.length || 0,
    min_plugin_score: data.plugins?.length ? minPluginScore : null,
    max_plugin_score: data.plugins?.length ? maxPluginScore : null,
    provenance: !!storeSignals.provenance,
    signals: storeSignals,
  };
}

// --- Main ---

function main() {
  if (!fs.existsSync(CATALOG_STORES_DIR)) {
    console.error(`ERROR: ${CATALOG_STORES_DIR} not found. Run scan-sources.cjs first.`);
    process.exit(1);
  }
  if (!fs.existsSync(SUPPORTED_PATH)) {
    console.error(`ERROR: ${SUPPORTED_PATH} not found.`);
    process.exit(1);
  }

  const registry = JSON.parse(fs.readFileSync(SUPPORTED_PATH, 'utf-8'));
  const githubStats = fs.existsSync(STATS_PATH)
    ? JSON.parse(fs.readFileSync(STATS_PATH, 'utf-8'))
    : { stores: {} };

  if (!fs.existsSync(STATS_PATH)) {
    console.warn(`WARN: ${STATS_PATH} missing. All third-party stores will score 0 on maintenance + adoption + license signals.`);
    console.warn(`      Run scripts/fetch-github-stats.cjs first to populate.`);
  }

  const files = fs.readdirSync(CATALOG_STORES_DIR)
    .filter((f) => f.endsWith('.json'))
    .filter((f) => !SINGLE_STORE || f === `${SINGLE_STORE}.json`);

  if (files.length === 0) {
    console.error(`No matching store files (--store ${SINGLE_STORE})`);
    process.exit(1);
  }

  console.log(`compute-trust: ${files.length} stores`);
  console.log(`Dry run: ${DRY_RUN}`);
  console.log('');

  const auditStores = [];
  let totalPlugins = 0;
  let scoreDistribution = { '0-19': 0, '20-39': 0, '40-59': 0, '60-79': 0, '80-100': 0 };
  // Capture per-store in-memory plugin scores so the distribution stat
  // doesn't read stale disk content during --dry-run (DRY_RUN skips writes).
  const inMemoryPluginScores = [];

  for (const f of files) {
    const result = processStore(path.join(CATALOG_STORES_DIR, f), registry, githubStats);
    if (result.error) {
      console.log(`ERROR ${f.padEnd(40)} ${result.error}`);
      continue;
    }
    const prov = result.provenance ? ' [first-party]' : '';
    const range = result.plugin_count
      ? `min=${result.min_plugin_score} max=${result.max_plugin_score}`
      : '';
    console.log(`${result.store.padEnd(40)} store=${result.store_score.toString().padStart(3)} (${result.plugin_count} plugins ${range})${prov}`);
    auditStores.push(result);
    totalPlugins += result.plugin_count;
    // Re-read just-mutated in-memory object via DRY-RUN-aware path: in DRY mode
    // we re-process to compute the same scores in memory, in WRITE mode we read disk.
    if (DRY_RUN) {
      // Recompute per-plugin scores for the distribution stat (mirrors processStore logic)
      const dataRereaded = JSON.parse(fs.readFileSync(path.join(CATALOG_STORES_DIR, f), 'utf-8'));
      for (const p of dataRereaded.plugins || []) {
        const ps = result.store_score + scoreFrontmatter(p) + scoreReadme(p);
        inMemoryPluginScores.push(Math.min(100, ps));
      }
    }
  }

  // Aggregate score distribution across all plugins
  if (DRY_RUN) {
    for (const s of inMemoryPluginScores) {
      if (s < 20) scoreDistribution['0-19']++;
      else if (s < 40) scoreDistribution['20-39']++;
      else if (s < 60) scoreDistribution['40-59']++;
      else if (s < 80) scoreDistribution['60-79']++;
      else scoreDistribution['80-100']++;
    }
  } else {
    for (const f of files) {
      const data = JSON.parse(fs.readFileSync(path.join(CATALOG_STORES_DIR, f), 'utf-8'));
      for (const p of data.plugins || []) {
        const s = p.trust_score || 0;
        if (s < 20) scoreDistribution['0-19']++;
        else if (s < 40) scoreDistribution['20-39']++;
        else if (s < 60) scoreDistribution['40-59']++;
        else if (s < 80) scoreDistribution['60-79']++;
        else scoreDistribution['80-100']++;
      }
    }
  }

  // Trust audit summary. Pin generated_at to prior value if nothing semantic
  // changed — keeps the pipeline end-to-end idempotent so the weekly cron
  // doesn't open a PR when upstream sources haven't moved.
  const newAudit = {
    total_stores: auditStores.length,
    total_plugins: totalPlugins,
    score_distribution: scoreDistribution,
    stores_by_score: [...auditStores].sort((a, b) => b.store_score - a.store_score),
  };
  let priorAudit = null;
  if (fs.existsSync(TRUST_AUDIT_PATH)) {
    try { priorAudit = JSON.parse(fs.readFileSync(TRUST_AUDIT_PATH, 'utf-8')); } catch { /* invalid; will overwrite */ }
  }
  const semanticallyUnchanged = priorAudit
    && JSON.stringify({ ...priorAudit, generated_at: undefined })
       === JSON.stringify({ ...newAudit, generated_at: undefined });
  const audit = {
    generated_at: semanticallyUnchanged ? priorAudit.generated_at : new Date().toISOString(),
    ...newAudit,
  };

  if (!DRY_RUN) {
    fs.writeFileSync(TRUST_AUDIT_PATH, JSON.stringify(audit, null, 2) + '\n');
  }

  console.log('');
  console.log('=== Trust scoring summary ===');
  console.log(`Total plugins:       ${totalPlugins}`);
  console.log(`Output:              catalog/stores/*.json + scoring/trust-audit.json`);
  console.log('');
  console.log('Score distribution (plugin trust_score):');
  for (const [bucket, count] of Object.entries(scoreDistribution)) {
    const pct = (100 * count / totalPlugins).toFixed(1);
    console.log(`  ${bucket.padEnd(6)} ${count.toString().padStart(5)} (${pct}%)`);
  }
  console.log('');
  console.log('Top 10 stores by store_score:');
  for (const s of audit.stores_by_score.slice(0, 10)) {
    const prov = s.provenance ? ' [first-party]' : '';
    console.log(`  ${s.store_score.toString().padStart(3)}  ${s.store.padEnd(40)} (${s.plugin_count} plugins)${prov}`);
  }
}

main();
