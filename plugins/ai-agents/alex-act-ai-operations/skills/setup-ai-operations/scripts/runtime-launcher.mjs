#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const runtimeRoot = process.env.ALEX_ACT_AI_OPERATIONS_RUNTIME_ROOT
  || join(homedir(), '.copilot', 'plugin-data', 'alex-act-ai-operations', 'runtime');
const [route, ...args] = process.argv.slice(2);
const routes = {
  elevenlabs: process.platform === 'win32'
    ? join(runtimeRoot, 'Scripts', 'elevenlabs-mcp.exe')
    : join(runtimeRoot, 'bin', 'elevenlabs-mcp'),
};
const target = routes[route];

if (!target) {
  console.error(`Unknown AI Operations runtime route: ${route || '(missing)'}`);
  process.exit(2);
}
if (!existsSync(target)) {
  console.error(`AI Operations runtime is not provisioned: ${target}`);
  console.error('Run /alex-act-ai-operations setup-ai-operations.');
  process.exit(3);
}

const child = spawn(target, args, {
  env: process.env,
  stdio: 'inherit',
  windowsHide: true,
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal));
}
child.on('error', (error) => {
  console.error(`AI Operations runtime launch failed: ${error.message}`);
  process.exit(1);
});
child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 1);
});