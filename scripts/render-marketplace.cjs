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
const COPILOT_WINDOWS_FILE_LIMIT = 100;

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
      const metadataPath = path.join(pluginDir, '.mall-metadata.json');
      if (!fs.existsSync(manifestPath) || !fs.existsSync(metadataPath)) continue;
      plugins.push({
        category: category.name,
        folder: folder.name,
        pluginDir,
        manifestPath,
        metadataPath,
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

function countFiles(directory) {
  let count = 0;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    count += entry.isDirectory() ? countFiles(fullPath) : 1;
  }
  return count;
}

function requireSourceSpec(spec, pluginName) {
  if (!spec || typeof spec !== 'object' || Array.isArray(spec)) {
    throw new Error(`${pluginName}: delivery.source must be an object`);
  }
  if (spec.source !== 'github') {
    throw new Error(`${pluginName}: delivery.source.source must be "github"`);
  }
  for (const field of ['repo', 'ref']) {
    if (typeof spec[field] !== 'string' || !spec[field].trim()) {
      throw new Error(`${pluginName}: delivery.source.${field} must be a non-empty string`);
    }
  }
  const entry = { source: spec.source, repo: spec.repo, ref: spec.ref };
  if (spec.path !== undefined) {
    if (typeof spec.path !== 'string' || !spec.path.trim()) {
      throw new Error(`${pluginName}: delivery.source.path must be a non-empty string`);
    }
    entry.path = spec.path;
  }
  return entry;
}

// Object sources have no natural ordering, so dedup and sort on a stable string.
function sourceKey(source) {
  if (typeof source === 'string') return source;
  return `${source.repo}@${source.ref}${source.path ? `/${source.path}` : ''}`;
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
  const delivery = readJson(plugin.metadataPath).delivery;
  const fromSource = Boolean(delivery) && delivery.mode === 'source';
  if (!fromSource) {
    // The limit binds only payloads the Mall vendors and installs from disk.
    const fileCount = countFiles(plugin.pluginDir);
    if (fileCount > COPILOT_WINDOWS_FILE_LIMIT) {
      throw new Error(
        `${name}: ${fileCount} files exceed the Copilot CLI 1.0.75 Windows payload limit of ${COPILOT_WINDOWS_FILE_LIMIT}`,
      );
    }
  }

  return {
    name,
    description: requireString(manifest, 'description', name),
    version: requireString(manifest, 'version', name),
    source: fromSource
      ? requireSourceSpec(delivery.source, name)
      : ['plugins', plugin.category, plugin.folder].join('/'),
    strict: true,
  };
}

function validateEntries(entries) {
  const names = new Set();
  const sources = new Set();
  for (const entry of entries) {
    const key = sourceKey(entry.source);
    if (names.has(entry.name)) throw new Error(`duplicate plugin name: ${entry.name}`);
    if (sources.has(key)) throw new Error(`duplicate plugin source: ${key}`);
    names.add(entry.name);
    sources.add(key);
  }
}

function renderMarketplace({ repoRoot, outputPath = null } = {}) {
  if (!repoRoot) throw new Error('repoRoot is required');
  const entries = listCuratedPlugins(repoRoot)
    .map(buildEntry)
    .sort((left, right) => left.name.localeCompare(right.name) || sourceKey(left.source).localeCompare(sourceKey(right.source)));
  if (entries.length === 0) throw new Error('no migrated curated plugins found');
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
