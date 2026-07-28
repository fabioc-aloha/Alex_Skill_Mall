#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const MARKETPLACE = Object.freeze({
  name: 'alex-mall',
  owner: { name: 'fabioc-aloha' },
  metadata: {
    description: 'Alex ACT Plugin Mall curated local plugins',
    version: '3.0.0',
  },
});
const NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    throw new Error(`${filePath}: invalid JSON: ${error.message}`);
  }
}

function listCuratedPlugins(repoRoot) {
  const pluginsRoot = path.join(repoRoot, 'plugins');
  if (!fs.existsSync(pluginsRoot)) throw new Error(`plugins directory missing: ${pluginsRoot}`);
  const plugins = [];
  for (const category of fs.readdirSync(pluginsRoot, { withFileTypes: true })) {
    if (!category.isDirectory() || category.name.startsWith('.')) continue;
    const categoryPath = path.join(pluginsRoot, category.name);
    for (const folder of fs.readdirSync(categoryPath, { withFileTypes: true })) {
      if (!folder.isDirectory() || folder.name.startsWith('.')) continue;
      const pluginDir = path.join(categoryPath, folder.name);
      const manifestPath = path.join(pluginDir, 'plugin.json');
      if (!fs.existsSync(manifestPath)) continue;
      plugins.push({
        category: category.name,
        folder: folder.name,
        pluginDir,
        manifestPath,
      });
    }
  }
  return plugins;
}

function requireString(manifest, field, pluginName) {
  if (typeof manifest[field] !== 'string' || !manifest[field].trim()) {
    throw new Error(`${pluginName}: ${field} must be a non-empty string`);
  }
  return manifest[field];
}

function buildEntry(plugin) {
  const manifest = readJson(plugin.manifestPath);
  const name = requireString(manifest, 'name', plugin.folder);
  if (!NAME_PATTERN.test(name)) throw new Error(`${plugin.folder}: invalid plugin name: ${name}`);
  if (name !== plugin.folder) {
    throw new Error(`${plugin.folder}: manifest name must match folder name (found ${name})`);
  }
  if (!manifest.author || typeof manifest.author !== 'object' || Array.isArray(manifest.author)
    || typeof manifest.author.name !== 'string' || !manifest.author.name.trim()) {
    throw new Error(`${name}: author must be an object with a non-empty name`);
  }

  return {
    name,
    description: requireString(manifest, 'description', name),
    version: requireString(manifest, 'version', name),
    source: ['plugins', plugin.category, plugin.folder].join('/'),
    strict: true,
  };
}

function validateEntries(entries) {
  const names = new Set();
  const sources = new Set();
  for (const entry of entries) {
    if (names.has(entry.name)) throw new Error(`duplicate plugin name: ${entry.name}`);
    if (sources.has(entry.source)) throw new Error(`duplicate plugin source: ${entry.source}`);
    names.add(entry.name);
    sources.add(entry.source);
  }
}

function renderMarketplace({ repoRoot, outputPath = null } = {}) {
  if (!repoRoot) throw new Error('repoRoot is required');
  const entries = listCuratedPlugins(repoRoot)
    .map(buildEntry)
    .sort((left, right) => left.name.localeCompare(right.name) || left.source.localeCompare(right.source));
  if (entries.length === 0) throw new Error('no curated plugins found');
  validateEntries(entries);

  const output = {
    name: MARKETPLACE.name,
    owner: MARKETPLACE.owner,
    metadata: MARKETPLACE.metadata,
    plugins: entries,
  };
  const destination = outputPath || path.join(repoRoot, '.github', 'plugin', 'marketplace.json');
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, JSON.stringify(output, null, 2) + '\n');
  return { count: entries.length, outputPath: destination };
}

function main() {
  const repoRoot = path.resolve(__dirname, '..');
  try {
    const result = renderMarketplace({ repoRoot });
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(`ERROR: ${error.message}`);
    process.exitCode = 1;
  }
}

if (require.main === module) main();

module.exports = { renderMarketplace };