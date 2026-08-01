#!/usr/bin/env node
'use strict';

const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { renderMarketplace } = require('./render-marketplace.cjs');
const { packagePlugin, parseArgs, parseIncludes, resolveSource } = require('./lib/plugin-package.cjs');

const repoRoot = path.resolve(__dirname, '..');

function usage() {
  console.log('Usage: npm run vendor -- --source <path|owner/repo|url> --category <name> --repository <url> --ref <tag|sha> [--include src=dest] [--replace] [--apply] [--maintain]');
  console.log('Dry-run is the default. --apply writes the curated payload. --replace is required for an existing plugin.');
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) { usage(); return; }
  for (const key of ['source', 'category', 'repository', 'ref']) {
    if (!args[key]) throw new Error(`--${key} is required`);
  }
  const resolved = resolveSource(args.source, args.ref);
  try {
    const result = packagePlugin({
      repoRoot,
      sourceRoot: resolved.sourceRoot,
      category: args.category,
      repository: args.repository,
      ref: args.ref,
      submittedBy: args['submitted-by'] || 'mall-admin',
      evidence: args.evidence || null,
      includes: parseIncludes(args.include),
      apply: args.apply === true,
      replace: args.replace === true,
    });
    if (result.applied) renderMarketplace({ repoRoot });
    console.log(JSON.stringify(result, null, 2));
    if (result.applied && args.maintain) {
      const child = spawnSync(process.execPath, [path.join(__dirname, 'maintain-mall.cjs'), '--curated'], {
        cwd: repoRoot, encoding: 'utf8', stdio: 'inherit', shell: false,
      });
      if (child.status !== 0) process.exitCode = child.status || 1;
    }
  } finally {
    resolved.cleanup();
  }
}

try { main(); }
catch (error) { console.error(`ERROR: ${error.message}`); usage(); process.exitCode = 1; }
