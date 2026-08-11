#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';

const PACKAGE = 'elevenlabs-mcp==0.12.2';
const APPLY = process.argv.includes('--apply');
const rootIndex = process.argv.indexOf('--runtime-root');
const RUNTIME_ROOT = rootIndex >= 0
  ? resolve(process.argv[rootIndex + 1] ?? '')
  : join(homedir(), '.copilot', 'plugin-data', 'alex-act-ai-operations', 'runtime');
const consumed = new Set(['--apply']);
if (rootIndex >= 0) {
  consumed.add('--runtime-root');
  consumed.add(process.argv[rootIndex + 1]);
}
const unknown = process.argv.slice(2).filter((arg) => !consumed.has(arg));

if (unknown.length) {
  console.error(`Unknown argument(s): ${unknown.join(', ')}`);
  process.exit(2);
}
if (!RUNTIME_ROOT) {
  console.error('--runtime-root requires a non-empty path');
  process.exit(2);
}

const python = process.env.ALEX_ACT_AI_OPS_PYTHON || 'python';
const pythonVersion = execFileSync(python, ['--version'], { encoding: 'utf8' }).trim();

console.log(`mode:     ${APPLY ? 'apply' : 'preview'}`);
console.log(`python:   ${python} (${pythonVersion})`);
console.log(`runtime:  ${RUNTIME_ROOT}`);
console.log(`package:  ${PACKAGE}`);
console.log('policy:   exact PyPI package; no index override; plugin-private virtual environment');
console.log('hosted:   Hugging Face authenticates through its first-party MCP flow');

if (!APPLY) {
  console.log('\nPreview only. Re-run with --apply after reviewing the package and target.');
  process.exit(0);
}

mkdirSync(RUNTIME_ROOT, { recursive: true });
const venvPython = process.platform === 'win32'
  ? join(RUNTIME_ROOT, 'Scripts', 'python.exe')
  : join(RUNTIME_ROOT, 'bin', 'python');

execFileSync(python, ['-m', 'venv', RUNTIME_ROOT], { stdio: 'inherit' });
execFileSync(venvPython, [
  '-m', 'pip', 'install',
  '--disable-pip-version-check',
  '--no-input',
  PACKAGE,
], {
  stdio: 'inherit',
  env: { ...process.env, PIP_DISABLE_PIP_VERSION_CHECK: '1' },
});

console.log('\nProvisioned ElevenLabs runtime. Reload the host, then run npm run verify.');
