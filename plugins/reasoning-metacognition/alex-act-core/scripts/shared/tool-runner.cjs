// @ts-check
'use strict';

const path = require('node:path');
const { execFileSync, spawnSync } = require('node:child_process');

function envKeyForTool(tool) {
    return `ACT_TOOL_${String(tool).replace(/[^a-zA-Z0-9]/g, '_').toUpperCase()}`;
}

// Windows lookup cache so we do not re-run `where.exe` per invocation.
const windowsResolveCache = new Map();

function resolveWindowsTool(tool) {
    if (path.isAbsolute(tool)) return tool;
    if (windowsResolveCache.has(tool)) return windowsResolveCache.get(tool);
    const probe = spawnSync('where.exe', [tool], { encoding: 'utf8' });
    if (probe.status !== 0 || !probe.stdout) {
        throw new Error(`Tool not found in PATH: ${tool}`);
    }
    // Prefer .cmd/.exe/.bat over .ps1 so execFileSync can spawn without a PowerShell host.
    const candidates = probe.stdout.split(/\r?\n/).filter(Boolean).map((line) => line.trim());
    const preferred = candidates.find((c) => /\.(cmd|exe|bat)$/i.test(c)) || candidates[0];
    windowsResolveCache.set(tool, preferred);
    return preferred;
}

function runTool(tool, args, options = {}) {
    const overrideScript = process.env[envKeyForTool(tool)];
    if (overrideScript) {
        return execFileSync(process.execPath, [overrideScript, ...args], options);
    }
    const isWindows = process.platform === 'win32';
    if (!isWindows) return execFileSync(tool, args, options);
    // Resolve the absolute .cmd/.exe path so we can drop `shell: true` and avoid the
    // Node DEP0190 argument-concatenation vulnerability with user-supplied paths.
    const resolved = resolveWindowsTool(tool);
    return execFileSync(resolved, args, { ...options, shell: false });
}

module.exports = { runTool, envKeyForTool };
