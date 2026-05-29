#!/usr/bin/env node
/**
 * bootstrap-sources.cjs
 *
 * Shallow-clones every third-party source store from sources/supported-stores.json
 * into $SOURCES_DIR. Used by the scan-sources.yml workflow to materialize source
 * repos in the runner workspace. Operators running locally can either run this
 * script (against an empty SOURCES_DIR) or point SOURCES_DIR at an existing
 * MALL layout (e.g. C:/Development/MALL).
 *
 * The 'plugin-mall' self-entry is filtered out: this repo is already checked out,
 * cloning it from itself would be wasteful and could race the workflow.
 *
 * Per mall-self-curation/SKILL.md § The plugin-mall self-entry.
 *
 * Usage:
 *   SOURCES_DIR=/tmp/sources node scripts/bootstrap-sources.cjs
 *   node scripts/bootstrap-sources.cjs --depth 1     # default: shallow
 *   node scripts/bootstrap-sources.cjs --depth 0     # full history
 *   node scripts/bootstrap-sources.cjs --force       # re-clone existing dirs (destructive)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..');
const SOURCES_DIR = process.env.SOURCES_DIR || path.join(REPO_ROOT, '..', 'MALL');
const SUPPORTED_PATH = path.join(REPO_ROOT, 'sources', 'supported-stores.json');

const FORCE = process.argv.includes('--force');
const depthIdx = process.argv.indexOf('--depth');
const depth = depthIdx > -1 ? Number(process.argv[depthIdx + 1]) : 1;

if (!fs.existsSync(SUPPORTED_PATH)) {
  console.error(`ERROR: ${SUPPORTED_PATH} not found.`);
  process.exit(1);
}

const SUPPORTED = JSON.parse(fs.readFileSync(SUPPORTED_PATH, 'utf-8'));

if (!fs.existsSync(SOURCES_DIR)) {
  fs.mkdirSync(SOURCES_DIR, { recursive: true });
  console.log(`Created SOURCES_DIR: ${SOURCES_DIR}`);
}

let cloned = 0;
let skipped = 0;
let failed = 0;
let noRemote = 0;
let filtered = 0;
const failures = [];

console.log(`Bootstrap source clones into: ${SOURCES_DIR}`);
console.log(`Stores in registry: ${SUPPORTED.stores.length}`);
console.log(`Depth: ${depth === 0 ? 'full history' : depth}`);
console.log('');

for (const s of SUPPORTED.stores) {
  // Skip the Mall self-entry — bootstrap clones third-party only.
  if (s.name === 'plugin-mall') {
    console.log(`FILTER: ${s.name} (Mall self-entry; scanned via REPO_ROOT, not cloned)`);
    filtered++;
    continue;
  }

  const dirName = s.local_dir_name || s.name;
  const target = path.join(SOURCES_DIR, dirName);

  if (!s.remote) {
    console.log(`NOREMOTE: ${s.name}`);
    noRemote++;
    continue;
  }

  if (fs.existsSync(target) && !FORCE) {
    console.log(`SKIP: ${s.name} (exists at ${dirName})`);
    skipped++;
    continue;
  }

  if (FORCE && fs.existsSync(target)) {
    console.log(`FORCE: removing existing ${dirName}`);
    fs.rmSync(target, { recursive: true, force: true });
  }

  const depthFlag = depth > 0 ? `--depth ${depth}` : '';
  const cmd = `git clone ${depthFlag} "${s.remote}" "${target}"`;
  try {
    execSync(cmd, { stdio: ['ignore', 'pipe', 'pipe'], timeout: 120000 });
    console.log(`CLONE: ${s.name} -> ${dirName}`);
    cloned++;
  } catch (err) {
    const msg = err.stderr ? err.stderr.toString().trim().split('\n').pop() : err.message;
    console.log(`FAIL:  ${s.name}: ${msg}`);
    failed++;
    failures.push({ name: s.name, remote: s.remote, error: msg });
  }
}

console.log('');
console.log('=== Bootstrap summary ===');
console.log(`Cloned:   ${cloned}`);
console.log(`Skipped:  ${skipped} (already present, no --force)`);
console.log(`Filtered: ${filtered} (plugin-mall self-entry)`);
console.log(`NoRemote: ${noRemote}`);
console.log(`Failed:   ${failed}`);

if (failed > 0) {
  console.log('');
  console.log('Failures:');
  for (const f of failures) {
    console.log(`  ${f.name} (${f.remote}): ${f.error}`);
  }
  process.exit(1);
}
