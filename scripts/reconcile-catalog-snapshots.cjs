#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

function pluginPriority(plugin) {
  const parts = String(plugin.source_path || '').split('/');
  if (parts.includes('testing') || parts.includes('test')) return 0;
  if (parts.includes('plugins')) return 3;
  if (parts.includes('skills')) return 2;
  return 1;
}

function dedupePlugins(plugins) {
  const selected = new Map();
  for (const plugin of plugins) {
    const current = selected.get(plugin.name);
    if (!current
      || pluginPriority(plugin) > pluginPriority(current)
      || (pluginPriority(plugin) === pluginPriority(current)
        && String(plugin.source_path).localeCompare(String(current.source_path)) < 0)) {
      selected.set(plugin.name, plugin);
    }
  }
  return [...selected.values()].sort((left, right) => left.name.localeCompare(right.name));
}

function main() {
  const registry = JSON.parse(fs.readFileSync(
    path.join(ROOT, 'sources', 'supported-stores.json'), 'utf8'));
  const byName = new Map(registry.stores.map((store) => [store.name, store]));
  const storesRoot = path.join(ROOT, 'catalog', 'stores');
  let removed = 0;
  for (const file of fs.readdirSync(storesRoot).filter((name) => name.endsWith('.json'))) {
    const target = path.join(storesRoot, file);
    const store = JSON.parse(fs.readFileSync(target, 'utf8'));
    const before = store.plugins.length;
    store.plugins = dedupePlugins(store.plugins);
    store.plugin_count = store.plugins.length;
    store.reference_only = Boolean(byName.get(store.store)?.reference_only);
    removed += before - store.plugins.length;
    fs.writeFileSync(target, `${JSON.stringify(store, null, 2)}\n`);
  }
  console.log(`Reconciled catalog snapshots; removed ${removed} duplicate row(s).`);
}

if (require.main === module) main();

module.exports = { dedupePlugins, pluginPriority };
