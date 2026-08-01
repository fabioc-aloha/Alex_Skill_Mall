#!/usr/bin/env node
'use strict';

const path = require('node:path');
const { spawnSync } = require('node:child_process');

const repoRoot = path.resolve(__dirname, '..');

function buildPlan(mode = 'curated') {
  if (mode === 'check') return [
    ['node', ['scripts/render-marketplace.cjs']],
    ['npm', ['test']],
    ['npm', ['run', 'validate']],
  ];
  if (mode === 'curated') return [
    ['node', ['scripts/scan-sources.cjs', '--store', 'plugin-mall']],
    ['node', ['scripts/normalize-frontmatter.cjs', '--store', 'plugin-mall']],
    ['node', ['scripts/list-refs.cjs', '--store', 'plugin-mall']],
    ['node', ['scripts/compute-trust.cjs']],
    ['node', ['scripts/render-marketplace.cjs']],
    ['node', ['scripts/render-catalog.cjs']],
    ['npm', ['test']],
    ['npm', ['run', 'validate']],
  ];
  if (mode === 'full') return [
    ['node', ['scripts/bootstrap-sources.cjs']],
    ['node', ['scripts/scan-sources.cjs']],
    ['node', ['scripts/normalize-frontmatter.cjs']],
    ['node', ['scripts/list-refs.cjs']],
    ['node', ['scripts/fetch-github-stats.cjs']],
    ['node', ['scripts/compute-trust.cjs']],
    ['node', ['scripts/render-marketplace.cjs']],
    ['node', ['scripts/render-catalog.cjs']],
    ['npm', ['test']],
    ['npm', ['run', 'validate']],
  ];
  throw new Error(`unknown maintenance mode: ${mode}`);
}

function runStep(command, args) {
  let executable = command;
  let commandArgs = args;
  if (command === 'node') executable = process.execPath;
  if (command === 'npm' && process.env.npm_execpath) {
    executable = process.execPath;
    commandArgs = [process.env.npm_execpath, ...args];
  }
  const result = spawnSync(executable, commandArgs, {
    cwd: repoRoot,
    env: process.env,
    stdio: 'inherit',
    shell: false,
  });
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed`);
}

function main() {
  const flag = process.argv.find((arg) => ['--curated', '--full', '--check'].includes(arg));
  const mode = flag ? flag.slice(2) : 'curated';
  if (mode === 'full' && !process.env.SOURCES_DIR) throw new Error('SOURCES_DIR is required for --full');
  if (mode === 'full' && !process.env.GH_TOKEN && !process.env.GITHUB_TOKEN) {
    throw new Error('GH_TOKEN or GITHUB_TOKEN is required for --full');
  }
  const plan = buildPlan(mode);
  console.log(`Mall maintenance mode: ${mode}`);
  for (const [command, args] of plan) {
    console.log(`\n> ${command} ${args.join(' ')}`);
    runStep(command, args);
  }
  console.log('\nMall maintenance completed. Review git diff before committing.');
}

if (require.main === module) {
  try { main(); }
  catch (error) { console.error(`ERROR: ${error.message}`); process.exitCode = 1; }
}

module.exports = { buildPlan };
