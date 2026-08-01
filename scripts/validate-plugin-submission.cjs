#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { renderMarketplace } = require('./render-marketplace.cjs');
const { parseArgs, validatePluginDirectory } = require('./lib/plugin-package.cjs');

const repoRoot = path.resolve(__dirname, '..');

function changedPlugins(base) {
  const result = spawnSync('git', ['diff', '--name-only', `${base}...HEAD`, '--', 'plugins/'], {
    cwd: repoRoot, encoding: 'utf8', shell: false,
  });
  if (result.status !== 0) throw new Error(result.stderr.trim() || 'git diff failed');
  return [...new Set(result.stdout.split(/\r?\n/).filter(Boolean).map((file) => {
    const parts = file.replaceAll('\\', '/').split('/');
    return parts.length >= 3 ? `${parts[1]}/${parts[2]}` : null;
  }).filter(Boolean))].sort();
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  let plugins = [];
  if (args.plugin) plugins = String(args.plugin).split(',').map((item) => item.trim()).filter(Boolean);
  else if (args.changed) {
    if (!args.base) throw new Error('--base is required with --changed');
    plugins = changedPlugins(args.base);
  } else throw new Error('use --plugin <category/name> or --changed --base <git-ref>');
  if (plugins.length === 0 && args['allow-none']) {
    console.log('No changed plugin directories; continuing with repository-level checks.');
    return;
  }
  if (plugins.length === 0) throw new Error('no changed plugin directories found');

  const failures = [];
  for (const plugin of plugins) {
    const pluginDir = path.resolve(repoRoot, 'plugins', plugin);
    if (!pluginDir.startsWith(path.join(repoRoot, 'plugins') + path.sep) || !fs.existsSync(pluginDir)) {
      failures.push({ plugin, errors: [{ code: 'PLUGIN_MISSING', message: 'plugin directory does not exist' }] });
      continue;
    }
    const validation = validatePluginDirectory(pluginDir);
    if (!validation.ok) failures.push({ plugin, errors: validation.errors });
    else console.log(`PASS ${plugin} (${validation.fileCount} files)`);
  }

  const temp = path.join(os.tmpdir(), `alex-mall-marketplace-${process.pid}.json`);
  try {
    renderMarketplace({ repoRoot, outputPath: temp });
    const tracked = path.join(repoRoot, '.github', 'plugin', 'marketplace.json');
    if (!fs.existsSync(tracked) || !fs.readFileSync(temp).equals(fs.readFileSync(tracked))) {
      failures.push({ plugin: 'marketplace', errors: [{ code: 'MARKETPLACE_STALE', message: 'run node scripts/render-marketplace.cjs and commit the result' }] });
    }
  } finally { fs.rmSync(temp, { force: true }); }

  if (failures.length) {
    console.error(JSON.stringify({ ok: false, failures }, null, 2));
    process.exit(1);
  }
  console.log(`Validated ${plugins.length} plugin submission(s).`);
}

try { main(); }
catch (error) { console.error(`ERROR: ${error.message}`); process.exitCode = 1; }
