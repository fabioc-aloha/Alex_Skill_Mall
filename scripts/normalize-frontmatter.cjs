#!/usr/bin/env node
/**
 * normalize-frontmatter.cjs
 *
 * Phase 3b of PLAN-mall-automation v3 / ADR-008.
 *
 * Reads catalog/stores/<store>.json (produced by scan-sources.cjs) and adds
 * a three-layer normalized view of each plugin's frontmatter:
 *
 *   plugins[*].frontmatter.standard  — universal fields across all shapes:
 *                                       name, description, version, lastReviewed, shape
 *   plugins[*].frontmatter.extended  — shape-specific + heir-decision-relevant:
 *                                       applyTo, tools, mode, category, tags,
 *                                       license, requires, author
 *   plugins[*].frontmatter.raw       — verbatim source (already populated by scan)
 *
 * Rules (per PLAN v3 § Frontmatter normalization):
 *   - If the source lacks a field, set it to null (never invent).
 *   - frontmatter.raw stays untouched; this script never mutates the verbatim layer.
 *   - description fallback for plugins with no frontmatter: first non-heading
 *     line of README, ≤ 200 chars (the readme_excerpt already captured by scan).
 *
 * Idempotent: re-running over an already-normalized catalog produces identical output.
 *
 * Usage:
 *   node scripts/normalize-frontmatter.cjs
 *   node scripts/normalize-frontmatter.cjs --store plugin-mall   # single-store mode
 *   node scripts/normalize-frontmatter.cjs --dry-run             # report stats, don't write
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const CATALOG_STORES_DIR = path.join(REPO_ROOT, 'catalog', 'stores');

const STORE_ARG_IDX = process.argv.indexOf('--store');
const SINGLE_STORE = STORE_ARG_IDX > -1 ? process.argv[STORE_ARG_IDX + 1] : null;
const DRY_RUN = process.argv.includes('--dry-run');

// --- Helpers ---

function asArray(v) {
  if (v == null || v === '') return null;
  if (Array.isArray(v)) return v.length ? v : null;
  if (typeof v === 'string') {
    // Tolerate comma-separated strings: "a,b,c" -> ["a","b","c"]
    const arr = v.split(',').map((s) => s.trim()).filter(Boolean);
    return arr.length ? arr : null;
  }
  return null;
}

function asString(v) {
  if (v == null) return null;
  if (typeof v === 'string') return v.trim() || null;
  if (typeof v === 'number') return String(v);
  return null;
}

function pick(raw, ...keys) {
  // Returns the first non-null/non-empty value among the given keys.
  for (const k of keys) {
    const v = raw[k];
    if (v != null && v !== '') return v;
  }
  return null;
}

// --- Normalizer ---

function buildStandard(plugin) {
  const raw = plugin.frontmatter?.raw || {};
  return {
    name: asString(pick(raw, 'name')) || plugin.name || null,
    description: asString(pick(raw, 'description')) || plugin.readme_excerpt || null,
    version: asString(pick(raw, 'version')) || null,
    lastReviewed: asString(pick(raw, 'lastReviewed', 'last_reviewed', 'date_added')) || null,
    shape: plugin.shape || null,
  };
}

function buildExtended(plugin) {
  const raw = plugin.frontmatter?.raw || {};
  return {
    applyTo: asString(pick(raw, 'applyTo', 'apply_to', 'applies_to')),
    tools: asArray(pick(raw, 'tools', 'allowed-tools', 'allowedTools')),
    mode: asString(pick(raw, 'mode')),
    category: asString(pick(raw, 'category')),
    tags: asArray(pick(raw, 'tags', 'topics', 'keywords')),
    license: asString(pick(raw, 'license', 'licence')),
    requires: asArray(pick(raw, 'requires', 'dependencies', 'deps')),
    author: asString(pick(raw, 'author', 'authors', 'created_by')),
  };
}

function normalizePlugin(plugin) {
  if (!plugin.frontmatter) {
    plugin.frontmatter = { kind: 'none', raw: {} };
  }
  plugin.frontmatter.standard = buildStandard(plugin);
  plugin.frontmatter.extended = buildExtended(plugin);
  return plugin;
}

// --- Per-store driver ---

function normalizeStore(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const stats = {
    plugins: 0,
    withStandardName: 0,
    withStandardDescription: 0,
    withStandardVersion: 0,
    withStandardLastReviewed: 0,
    withExtendedLicense: 0,
    withExtendedTags: 0,
    withExtendedCategory: 0,
  };
  for (const plugin of data.plugins || []) {
    normalizePlugin(plugin);
    stats.plugins++;
    if (plugin.frontmatter.standard.name) stats.withStandardName++;
    if (plugin.frontmatter.standard.description) stats.withStandardDescription++;
    if (plugin.frontmatter.standard.version) stats.withStandardVersion++;
    if (plugin.frontmatter.standard.lastReviewed) stats.withStandardLastReviewed++;
    if (plugin.frontmatter.extended.license) stats.withExtendedLicense++;
    if (plugin.frontmatter.extended.tags) stats.withExtendedTags++;
    if (plugin.frontmatter.extended.category) stats.withExtendedCategory++;
  }
  if (!DRY_RUN) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
  }
  return stats;
}

// --- Main ---

function main() {
  if (!fs.existsSync(CATALOG_STORES_DIR)) {
    console.error(`ERROR: ${CATALOG_STORES_DIR} not found. Run scan-sources.cjs first.`);
    process.exit(1);
  }

  const files = fs.readdirSync(CATALOG_STORES_DIR)
    .filter((f) => f.endsWith('.json'))
    .filter((f) => !SINGLE_STORE || f === `${SINGLE_STORE}.json`);

  if (files.length === 0) {
    console.error(`No matching store files in ${CATALOG_STORES_DIR}`);
    process.exit(1);
  }

  console.log(`Normalize frontmatter: ${files.length} stores`);
  console.log(`Dry run: ${DRY_RUN}`);
  console.log('');

  const grand = {
    plugins: 0,
    withStandardName: 0,
    withStandardDescription: 0,
    withStandardVersion: 0,
    withStandardLastReviewed: 0,
    withExtendedLicense: 0,
    withExtendedTags: 0,
    withExtendedCategory: 0,
  };

  for (const f of files) {
    const stats = normalizeStore(path.join(CATALOG_STORES_DIR, f));
    process.stdout.write(`${f.replace(/\.json$/, '').padEnd(40)} ${stats.plugins.toString().padStart(5)} plugins  `);
    process.stdout.write(`std-desc=${stats.withStandardDescription}  ver=${stats.withStandardVersion}  cat=${stats.withExtendedCategory}\n`);
    for (const k of Object.keys(grand)) grand[k] += stats[k] || 0;
  }

  console.log('');
  console.log('=== Aggregate (across all stores scanned) ===');
  console.log(`Plugins:                 ${grand.plugins}`);
  console.log(`With standard.name:        ${grand.withStandardName.toString().padStart(5)}  (${(100 * grand.withStandardName / grand.plugins).toFixed(1)}%)`);
  console.log(`With standard.description: ${grand.withStandardDescription.toString().padStart(5)}  (${(100 * grand.withStandardDescription / grand.plugins).toFixed(1)}%)`);
  console.log(`With standard.version:     ${grand.withStandardVersion.toString().padStart(5)}  (${(100 * grand.withStandardVersion / grand.plugins).toFixed(1)}%)`);
  console.log(`With standard.lastReviewed: ${grand.withStandardLastReviewed.toString().padStart(5)} (${(100 * grand.withStandardLastReviewed / grand.plugins).toFixed(1)}%)`);
  console.log(`With extended.license:     ${grand.withExtendedLicense.toString().padStart(5)}  (${(100 * grand.withExtendedLicense / grand.plugins).toFixed(1)}%)`);
  console.log(`With extended.tags:        ${grand.withExtendedTags.toString().padStart(5)}  (${(100 * grand.withExtendedTags / grand.plugins).toFixed(1)}%)`);
  console.log(`With extended.category:    ${grand.withExtendedCategory.toString().padStart(5)}  (${(100 * grand.withExtendedCategory / grand.plugins).toFixed(1)}%)`);
}

main();
