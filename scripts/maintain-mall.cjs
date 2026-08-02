#!/usr/bin/env node
'use strict';

const path = require('node:path');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');

const repoRoot = path.resolve(__dirname, '..');

function usage() {
  console.log('Usage: node scripts/maintain-mall.cjs [--curated|--full|--check]');
  console.log('Defaults to --curated. --full requires SOURCES_DIR and GH_TOKEN or GITHUB_TOKEN.');
}

function parseMode(args = process.argv.slice(2)) {
  if (args.includes('--help') || args.includes('-h')) return { help: true, mode: null };
  const flags = args.filter((arg) => ['--curated', '--full', '--check'].includes(arg));
  if (flags.length > 1) throw new Error(`choose one maintenance mode: ${flags.join(', ')}`);
  const unknown = args.find((arg) => arg.startsWith('-') && !flags.includes(arg));
  if (unknown) throw new Error(`unknown option: ${unknown}`);
  return { help: false, mode: flags.length ? flags[0].slice(2) : 'curated' };
}

function resolveNpmInvocation(args, options = {}) {
  const nodeExecPath = options.nodeExecPath || process.execPath;
  const fileExists = options.fileExists || fs.existsSync;
  let npmExecPath = options.npmExecPath || process.env.npm_execpath;
  if (!npmExecPath) {
    const candidate = path.join(path.dirname(nodeExecPath), 'node_modules', 'npm', 'bin', 'npm-cli.js');
    if (fileExists(candidate)) npmExecPath = candidate;
  }
  if (!npmExecPath) {
    throw new Error('npm CLI not found; run through npm run maintain or install npm beside Node.js');
  }
  return { executable: nodeExecPath, args: [npmExecPath, ...args] };
}

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
  if (command === 'npm') {
    const invocation = resolveNpmInvocation(args);
    executable = invocation.executable;
    commandArgs = invocation.args;
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
  const parsed = parseMode();
  if (parsed.help) { usage(); return; }
  const mode = parsed.mode;
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

module.exports = { buildPlan, parseMode, resolveNpmInvocation };
