#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const REQUIRED_NUMERIC_SIGNALS = ['store', 'frontmatter', 'readme'];

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
