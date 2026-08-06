#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const REQUIRED_NUMERIC_SIGNALS = ['store', 'frontmatter', 'readme'];
const MARKETPLACE_PATH = '.github/plugin/marketplace.json';

function finding(code, relativePath, message) {
  return { code, path: relativePath.replace(/\\/g, '/'), message };
}

function readJson(root, relativePath, errors) {
  try { return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8')); }
  catch {
    errors.push(finding('JSON_INVALID', relativePath, 'Required JSON is missing or malformed'));
    return null;
  }
}

// Object sources have no natural ordering, so compare them as a stable string.
function sourceKey(source) {
  if (typeof source === 'string') return source;
  return `${source.repo}@${source.ref}${source.path ? `/${source.path}` : ''}`;
}

function curatedPlugins(root) {
  const pluginsRoot = path.join(root, 'plugins');
  if (!fs.existsSync(pluginsRoot)) return [];
  const plugins = [];
  for (const category of fs.readdirSync(pluginsRoot, { withFileTypes: true })) {
    if (!category.isDirectory() || category.name.startsWith('.')) continue;
    const categoryPath = path.join(pluginsRoot, category.name);
    for (const plugin of fs.readdirSync(categoryPath, { withFileTypes: true })) {
      if (!plugin.isDirectory() || plugin.name.startsWith('.')) continue;
      const pluginRoot = path.join(categoryPath, plugin.name);
      const metadataPath = path.join(pluginRoot, '.mall-metadata.json');
      if (!fs.existsSync(path.join(pluginRoot, 'plugin.json'))
        || !fs.existsSync(metadataPath)) continue;
      let delivery = null;
      try {
        delivery = JSON.parse(fs.readFileSync(metadataPath, 'utf8')).delivery;
      } catch {
        delivery = null;
      }
      plugins.push({
        name: plugin.name,
        source: delivery && delivery.mode === 'source' && delivery.source
          ? sourceKey(delivery.source)
          : `plugins/${category.name}/${plugin.name}`,
      });
    }
  }
  return plugins;
}

function validateMarketplace(root, errors) {
  if (!fs.existsSync(path.join(root, MARKETPLACE_PATH))) return;
  const marketplace = readJson(root, MARKETPLACE_PATH, errors);
  if (!marketplace) return;
  if (marketplace.name !== 'alex-mall' || marketplace.owner?.name !== 'fabioc-aloha' || !Array.isArray(marketplace.plugins)) {
    errors.push(finding('MARKETPLACE_SHAPE_INVALID', MARKETPLACE_PATH, 'Expected alex-mall, owner fabioc-aloha, and a plugins array'));
    return;
  }

  const curated = curatedPlugins(root);
  const expected = new Map(curated.map((plugin) => [plugin.name, plugin.source]));
  const actual = new Map();
  for (const plugin of marketplace.plugins) {
    const spec = plugin && plugin.source;
    const sourceIsPath = typeof spec === 'string';
    const sourceIsOrigin = Boolean(spec) && typeof spec === 'object' && !Array.isArray(spec);
    if (!plugin || typeof plugin.name !== 'string' || (!sourceIsPath && !sourceIsOrigin) || plugin.strict !== true) {
      errors.push(finding('MARKETPLACE_ENTRY_INVALID', MARKETPLACE_PATH, 'Every entry needs name, source, and strict=true'));
      continue;
    }
    if (sourceIsPath) {
      if (!/^plugins\/[a-z0-9-]+\/[a-z0-9-]+$/.test(spec)) {
        errors.push(finding('MARKETPLACE_SOURCE_INVALID', MARKETPLACE_PATH, `${plugin.name} source must stay inside plugins/<category>/<name>`));
      }
    } else if (spec.source !== 'github' || typeof spec.repo !== 'string' || typeof spec.ref !== 'string') {
      errors.push(finding('MARKETPLACE_SOURCE_INVALID', MARKETPLACE_PATH, `${plugin.name} origin source needs source=github plus repo and ref`));
    }
    if (actual.has(plugin.name)) {
      errors.push(finding('MARKETPLACE_NAME_DUPLICATE', MARKETPLACE_PATH, `Duplicate marketplace name: ${plugin.name}`));
    }
    actual.set(plugin.name, sourceKey(spec));
  }

  if (expected.size !== actual.size || [...expected].some(([name, source]) => actual.get(name) !== source)) {
    errors.push(finding('MARKETPLACE_CURATED_SET_MISMATCH', MARKETPLACE_PATH, 'Marketplace names and sources must match curated plugin folders exactly'));
  }
}

function validateCatalog(root = process.cwd()) {
  const absoluteRoot = path.resolve(root);
  const errors = [];
  const registry = readJson(absoluteRoot, 'sources/supported-stores.json', errors);
  const index = readJson(absoluteRoot, 'catalog/index.json', errors);
  if (!registry || !index) return result(errors, 0, 0);

  if (registry.schema_version !== '2.0' || !Array.isArray(registry.stores)) {
    errors.push(finding('REGISTRY_SCHEMA_INVALID', 'sources/supported-stores.json', 'Expected schema_version 2.0 and a stores array'));
    return result(errors, 0, 0);
  }

  const names = registry.stores.map((store) => store && store.name).filter(Boolean);
  const uniqueNames = new Set(names);
  if (uniqueNames.size !== names.length) {
    errors.push(finding('REGISTRY_NAME_DUPLICATE', 'sources/supported-stores.json', 'Store names must be unique'));
  }
  for (const store of registry.stores) {
    if (!store || typeof store.name !== 'string' || !/^[a-z0-9][a-z0-9-]*$/.test(store.name) ||
        !Object.prototype.hasOwnProperty.call(store, 'remote') || typeof store.pluginDir !== 'string' || typeof store.quality !== 'string') {
      errors.push(finding('REGISTRY_ENTRY_INVALID', 'sources/supported-stores.json', 'Every store needs a kebab-case name, remote, pluginDir, and quality'));
    }
  }

  const provenance = registry.stores.filter((store) => store && store.provenance === true);
  if (provenance.length !== 1 || provenance[0].name !== 'plugin-mall') {
    errors.push(finding('PROVENANCE_INVALID', 'sources/supported-stores.json', 'Exactly plugin-mall must carry provenance=true'));
  }

  const storesDir = path.join(absoluteRoot, 'catalog', 'stores');
  let jsonFiles = [];
  try { jsonFiles = fs.readdirSync(storesDir).filter((name) => name.endsWith('.json')).sort(); }
  catch { errors.push(finding('STORE_SET_MISMATCH', 'catalog/stores', 'Store catalog directory is missing')); }
  const fileNames = new Set(jsonFiles.map((name) => name.slice(0, -5)));
  if (uniqueNames.size !== fileNames.size || [...uniqueNames].some((name) => !fileNames.has(name))) {
    errors.push(finding('STORE_SET_MISMATCH', 'catalog/stores', 'Registry names and per-store JSON files must match exactly'));
  }

  let pluginSum = 0;
  for (const fileName of jsonFiles) {
    const relativePath = `catalog/stores/${fileName}`;
    const store = readJson(absoluteRoot, relativePath, errors);
    if (!store) continue;
    const expectedName = fileName.slice(0, -5);
    if (store.store !== expectedName || !Array.isArray(store.plugins)) {
      errors.push(finding('STORE_SHAPE_INVALID', relativePath, 'Store name must match the filename and plugins must be an array'));
      continue;
    }
    pluginSum += store.plugins.length;
    if (!fs.existsSync(path.join(storesDir, `${expectedName}.md`))) {
      errors.push(finding('STORE_MARKDOWN_MISSING', `catalog/stores/${expectedName}.md`, 'Every store JSON requires rendered Markdown'));
    }
    for (const plugin of store.plugins) {
      if (typeof plugin.trust_score !== 'number' || plugin.trust_score < 0 || plugin.trust_score > 100) {
        errors.push(finding('TRUST_SCORE_INVALID', relativePath, 'Plugin trust_score must be between 0 and 100'));
      }
      const signals = plugin.trust_signals;
      if (!signals || REQUIRED_NUMERIC_SIGNALS.some((key) => typeof signals[key] !== 'number') ||
          !signals.store_breakdown || typeof signals.store_breakdown !== 'object') {
        errors.push(finding('TRUST_SIGNALS_MISSING', relativePath, 'Plugin trust_signals must contain store, frontmatter, readme, and store_breakdown'));
      }
    }
  }

  if (index.store_count !== jsonFiles.length) {
    errors.push(finding('STORE_COUNT_MISMATCH', 'catalog/index.json', 'store_count must equal per-store JSON count'));
  }
  if (index.plugin_count !== pluginSum || !Array.isArray(index.plugins) || index.plugins.length !== pluginSum) {
    errors.push(finding('PLUGIN_COUNT_MISMATCH', 'catalog/index.json', 'plugin_count and index plugins must equal summed store plugins'));
  }
  if (!fs.existsSync(path.join(absoluteRoot, 'sources', 'SOURCES.md'))) {
    errors.push(finding('SOURCES_MARKDOWN_MISSING', 'sources/SOURCES.md', 'Rendered source registry is missing'));
  }
  validateMarketplace(absoluteRoot, errors);

  return result(errors, jsonFiles.length, pluginSum);
}

function result(errors, stores, plugins) {
  return { ok: errors.length === 0, errors, stores, plugins };
}

if (require.main === module) {
  const json = process.argv.includes('--json');
  const rootIndex = process.argv.indexOf('--root');
  const root = rootIndex >= 0 ? process.argv[rootIndex + 1] : process.cwd();
  if (rootIndex >= 0 && !root) {
    console.error('--root requires a path');
    process.exit(2);
  }
  const output = validateCatalog(root);
  if (json) process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
  else {
    console.log(`Mall validation: ${output.ok ? 'PASS' : 'FAIL'}`);
    console.log(`Stores: ${output.stores}`);
    console.log(`Plugins: ${output.plugins}`);
    for (const error of output.errors) console.log(`${error.path}: ${error.code} - ${error.message}`);
  }
  process.exit(output.ok ? 0 : 1);
}

module.exports = { validateCatalog };
