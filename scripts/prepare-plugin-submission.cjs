#!/usr/bin/env node
'use strict';

const path = require('node:path');
const { renderMarketplace } = require('./render-marketplace.cjs');
const { packagePlugin, parseArgs, parseIncludes, resolveSource } = require('./lib/plugin-package.cjs');

const repoRoot = path.resolve(__dirname, '..');

function usage() {
  console.log('Usage: npm run submit:prepare -- --source <local-path> --category <name> --repository <url> --ref <tag|sha> --submitted-by <github-user> --evidence <summary> [--include src=dest] [--apply]');
  console.log('Dry-run is the default. This command never commits, pushes, or merges.');
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) { usage(); return; }
  for (const key of ['source', 'category', 'repository', 'ref', 'submitted-by', 'evidence']) {
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
      submittedBy: args['submitted-by'],
      evidence: args.evidence,
      includes: parseIncludes(args.include),
      apply: args.apply === true,
      replace: false,
    });
    if (result.applied) renderMarketplace({ repoRoot });
    console.log(JSON.stringify(result, null, 2));
    if (result.applied) {
      console.log('Next: npm run submit:validate -- --plugin <category>/<plugin-name>, then commit and open a PR. A CODEOWNER must approve before merge.');
    }
  } finally {
    resolved.cleanup();
  }
}

try { main(); }
catch (error) { console.error(`ERROR: ${error.message}`); usage(); process.exitCode = 1; }
