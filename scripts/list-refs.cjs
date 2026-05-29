#!/usr/bin/env node
/**
 * list-refs.cjs
 *
 * Reads catalog/stores/<store>.json (skeleton + normalized frontmatter produced
 * by scan-sources.cjs + normalize-frontmatter.cjs) and adds:
 *
 *   plugins[*].available_refs = {
 *     default: <default-branch-name>,       // e.g. "main"
 *     default_sha: <40-char SHA>,           // the SHA the default branch currently points at
 *     tags: [<tag>, ...]                     // descending semver order; empty if none
 *   }
 *
 *   plugins[*].source_url = <updated to point at default_sha, not "main">
 *
 * Plus updates the store-level metadata:
 *   - scanned_ref: <default_sha>  (the SHA the catalog was generated against)
 *
 * Design rationale (per empirical Phase 3c survey, 2026-05-29):
 *   Only 11 of 46 source stores use git tags; most have just 1. Per-plugin
 *   tag-touches-path filtering is overkill in this ecosystem. We surface
 *   store-level tags as candidates; the user's `/mall-install <name>@<tag>`
 *   command resolves at install time by checking out that tag and reading
 *   the plugin from there.
 *
 * Path resolution:
 *   - Third-party store: `git -C $SOURCES_DIR/<local_dir_name || name>`
 *   - plugin-mall: `git -C $REPO_ROOT`
 *
 * Idempotent: re-running over an unchanged source tree produces identical output.
 *
 * Usage:
 *   SOURCES_DIR=/tmp/sources node scripts/list-refs.cjs
 *   node scripts/list-refs.cjs --store plugin-mall   # single-store mode
 *   node scripts/list-refs.cjs --dry-run             # report, don't write
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..');
const SOURCES_DIR = process.env.SOURCES_DIR || path.join(REPO_ROOT, '..', 'MALL');
const CATALOG_STORES_DIR = path.join(REPO_ROOT, 'catalog', 'stores');

const STORE_ARG_IDX = process.argv.indexOf('--store');
const SINGLE_STORE = STORE_ARG_IDX > -1 ? process.argv[STORE_ARG_IDX + 1] : null;
const DRY_RUN = process.argv.includes('--dry-run');

// --- git helpers ---

function gitCapture(repoPath, args) {
  try {
    return execSync(`git ${args}`, { cwd: repoPath, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  } catch {
    return null;
  }
}

function resolveStoreRepoPath(store) {
  // plugin-mall lives in this repo; third-party stores under SOURCES_DIR.
  if (store === 'plugin-mall') return REPO_ROOT;
  return path.join(SOURCES_DIR, store);
}

function getDefaultBranch(repoPath) {
  // Try in order: symbolic-ref origin/HEAD; then HEAD; then 'main' or 'master' presence.
  const sym = gitCapture(repoPath, 'symbolic-ref --short refs/remotes/origin/HEAD');
  if (sym) return sym.replace(/^origin\//, '');
  const head = gitCapture(repoPath, 'symbolic-ref --short HEAD');
  if (head) return head;
  // Fallback probes
  for (const candidate of ['main', 'master']) {
    if (gitCapture(repoPath, `rev-parse --verify refs/heads/${candidate}`)) return candidate;
  }
  return null;
}

function getRefSha(repoPath, ref) {
  return gitCapture(repoPath, `rev-parse --verify ${ref}`);
}

function listTags(repoPath) {
  const out = gitCapture(repoPath, 'tag --sort=-v:refname');
  if (!out) return [];
  return out.split('\n').map((t) => t.trim()).filter(Boolean);
}

// --- Per-store driver ---

function discoverStoreRefs(storeName, registryEntry) {
  // Resolve the actual on-disk path. For third-party, the registry's
  // local_dir_name overrides the store name.
  const dirName = storeName === 'plugin-mall'
    ? null
    : (registryEntry?.local_dir_name || storeName);
  const repoPath = storeName === 'plugin-mall' ? REPO_ROOT : path.join(SOURCES_DIR, dirName);

  if (!fs.existsSync(path.join(repoPath, '.git'))) {
    return { error: `not a git repo: ${repoPath}` };
  }

  const defaultBranch = getDefaultBranch(repoPath);
  if (!defaultBranch) {
    return { error: 'cannot determine default branch' };
  }
  const defaultSha = getRefSha(repoPath, defaultBranch);
  const tags = listTags(repoPath);

  return { defaultBranch, defaultSha, tags, repoPath };
}

function applyRefsToStore(filePath, registry) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const refs = discoverStoreRefs(data.store, registry.stores.find((s) => s.name === data.store));

  if (refs.error) {
    data.refs_error = refs.error;
    if (!DRY_RUN) fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
    return { plugins: data.plugins?.length || 0, tags: 0, error: refs.error };
  }

  delete data.refs_error;

  // Update store-level scanned_ref from "main" to the actual SHA the catalog was built against.
  data.scanned_ref = refs.defaultSha;

  // Build the available_refs object once per store — every plugin shares the same
  // ref discovery since we're not doing per-plugin tag-touches-path filtering in v1.
  const availableRefs = {
    default: refs.defaultBranch,
    default_sha: refs.defaultSha,
    tags: refs.tags,
  };

  // Update source_url to use the actual SHA instead of the placeholder "main"
  // ref. Also attach available_refs to every plugin.
  const remote = (data.source_repo || '').replace(/\.git$/, '');
  for (const plugin of data.plugins || []) {
    plugin.available_refs = availableRefs;
    if (remote && plugin.source_path) {
      plugin.source_url = `${remote}/tree/${refs.defaultSha}/${plugin.source_path}`;
    }
  }

  if (!DRY_RUN) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
  }

  return {
    plugins: data.plugins?.length || 0,
    tags: refs.tags.length,
    defaultBranch: refs.defaultBranch,
    defaultSha: refs.defaultSha,
  };
}

// --- Main ---

function main() {
  if (!fs.existsSync(CATALOG_STORES_DIR)) {
    console.error(`ERROR: ${CATALOG_STORES_DIR} not found. Run scan-sources.cjs first.`);
    process.exit(1);
  }

  const supportedPath = path.join(REPO_ROOT, 'sources', 'supported-stores.json');
  const registry = JSON.parse(fs.readFileSync(supportedPath, 'utf-8'));

  const files = fs.readdirSync(CATALOG_STORES_DIR)
    .filter((f) => f.endsWith('.json'))
    .filter((f) => !SINGLE_STORE || f === `${SINGLE_STORE}.json`);

  if (files.length === 0) {
    console.error(`No matching store files (--store ${SINGLE_STORE})`);
    process.exit(1);
  }

  console.log(`list-refs: ${files.length} stores`);
  console.log(`SOURCES_DIR: ${SOURCES_DIR}`);
  console.log(`REPO_ROOT:   ${REPO_ROOT}`);
  console.log(`Dry run: ${DRY_RUN}`);
  console.log('');

  let withTags = 0;
  let withoutTags = 0;
  let errors = 0;
  let totalPlugins = 0;
  let totalTags = 0;

  for (const f of files) {
    const result = applyRefsToStore(path.join(CATALOG_STORES_DIR, f), registry);
    totalPlugins += result.plugins;
    const name = f.replace(/\.json$/, '');
    if (result.error) {
      console.log(`ERROR ${name.padEnd(40)} ${result.error}`);
      errors++;
    } else {
      const tagSummary = result.tags > 0
        ? `${result.tags.toString().padStart(3)} tags`
        : '  - tags';
      console.log(`OK    ${name.padEnd(40)} ${tagSummary}  @ ${result.defaultBranch}=${result.defaultSha.substring(0, 7)}  (${result.plugins} plugins)`);
      if (result.tags > 0) withTags++; else withoutTags++;
      totalTags += result.tags;
    }
  }

  console.log('');
  console.log('=== Refs discovery summary ===');
  console.log(`Stores with tags:    ${withTags}`);
  console.log(`Stores without tags: ${withoutTags}`);
  console.log(`Stores with errors:  ${errors}`);
  console.log(`Total tags surfaced: ${totalTags}`);
  console.log(`Total plugins:       ${totalPlugins}`);
}

main();
