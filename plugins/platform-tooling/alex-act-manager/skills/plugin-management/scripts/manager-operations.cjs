#!/usr/bin/env node
'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const DEFAULT_MARKETPLACE_URL = 'https://raw.githubusercontent.com/fabioc-aloha/Alex_Skill_Mall/main/.github/plugin/marketplace.json';
const WORKSPACE_BASELINE = Object.freeze({
  settings: {
    'markdown.styles': ['.vscode/markdown-light.css'],
  },
  mergeMode: {
    'markdown.styles': 'set-if-absent',
  },
});

function parseWorkspaceArgs(args) {
  const parsed = { apply: false, refreshCss: false, target: process.cwd() };
  for (let index = 0; index < args.length; index++) {
    const value = args[index];
    if (value === '--apply') parsed.apply = true;
    else if (value === '--refresh-css') parsed.refreshCss = true;
    else if (value === '--target') {
      if (!args[index + 1] || args[index + 1].startsWith('--')) throw new Error('--target requires a path');
      parsed.target = args[++index];
    } else throw new Error(`unknown argument: ${value}`);
  }
  return parsed;
}

function parseMarketplaceArgs(args) {
  const parsed = { file: null, url: DEFAULT_MARKETPLACE_URL, plugins: [] };
  for (let index = 0; index < args.length; index++) {
    const value = args[index];
    if (value === '--file' || value === '--url' || value === '--plugins') {
      if (!args[index + 1] || args[index + 1].startsWith('--')) throw new Error(`${value} requires a value`);
      parsed[value.slice(2)] = args[++index];
    } else throw new Error(`unknown argument: ${value}`);
  }
  parsed.plugins = String(parsed.plugins).split(',').map((name) => name.trim()).filter(Boolean);
  if (!parsed.plugins.length) throw new Error('--plugins requires at least one plugin name');
  return parsed;
}

function defaultUserSettingsPath() {
  if (process.platform === 'win32') {
    if (!process.env.APPDATA) throw new Error('APPDATA is required to resolve VS Code user settings');
    return path.join(process.env.APPDATA, 'Code', 'User', 'settings.json');
  }
  if (process.platform === 'darwin') {
    return path.join(os.homedir(), 'Library', 'Application Support', 'Code', 'User', 'settings.json');
  }
  return path.join(os.homedir(), '.config', 'Code', 'User', 'settings.json');
}

function parseUserSettingsArgs(args) {
  const parsed = { apply: false, removeLocalCss: false, targetSettings: defaultUserSettingsPath() };
  for (let index = 0; index < args.length; index++) {
    const value = args[index];
    if (value === '--apply') parsed.apply = true;
    else if (value === '--remove-local-css') parsed.removeLocalCss = true;
    else if (value === '--target-settings') {
      if (!args[index + 1] || args[index + 1].startsWith('--')) {
        throw new Error('--target-settings requires a path');
      }
      parsed.targetSettings = args[++index];
    } else throw new Error(`unknown argument: ${value}`);
  }
  return parsed;
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function stripJsonc(text) {
  let output = '';
  let inString = false;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let index = 0; index < text.length; index++) {
    const character = text[index];
    const next = text[index + 1];
    if (lineComment) {
      if (character === '\n' || character === '\r') {
        lineComment = false;
        output += character;
      }
      continue;
    }
    if (blockComment) {
      if (character === '*' && next === '/') {
        blockComment = false;
        index++;
      }
      continue;
    }
    if (inString) {
      output += character;
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === '"') inString = false;
      continue;
    }
    if (character === '"') {
      inString = true;
      output += character;
    } else if (character === '/' && next === '/') {
      lineComment = true;
      index++;
    } else if (character === '/' && next === '*') {
      blockComment = true;
      index++;
    } else {
      output += character;
    }
  }
  return output.replace(/,\s*([}\]])/g, '$1');
}

function isLocalStylesheet(value) {
  if (!Array.isArray(value) || value.length === 0) return false;
  return value.some((entry) => typeof entry === 'string'
    && !/^https?:\/\//i.test(entry)
    && (path.isAbsolute(entry) || /^[A-Za-z]:[\\/]/.test(entry)));
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function mergeBaselineValue(current, desired) {
  if (!isPlainObject(current) || !isPlainObject(desired)) return desired;
  return Object.fromEntries(Object.entries(desired).reduce((entries, [key, value]) => {
    const merged = Object.hasOwn(current, key) ? mergeBaselineValue(current[key], value) : value;
    entries.push([key, merged]);
    return entries;
  }, Object.entries(current)));
}

function buildUserSettingsPlan(targetSettings, apply, removeLocalCss = false) {
  const settingsFile = path.resolve(targetSettings);
  const baselineFile = path.resolve(__dirname, '..', 'resources', 'welcome-baseline.json');
  if (!fs.existsSync(baselineFile)) throw new Error(`user baseline missing at ${baselineFile}`);
  const baseline = JSON.parse(fs.readFileSync(baselineFile, 'utf8')).settings;
  const existed = fs.existsSync(settingsFile);
  let current = {};
  let hadComments = false;
  if (existed) {
    const raw = fs.readFileSync(settingsFile, 'utf8');
    hadComments = /\/\/|\/\*/.test(raw);
    try {
      current = JSON.parse(stripJsonc(raw)) || {};
    } catch (error) {
      throw new Error(`${settingsFile} is not valid JSON/JSONC: ${error.message}`);
    }
  }
  const merged = { ...current };
  const changes = [];
  const compliant = [];
  for (const [key, desired] of Object.entries(baseline)) {
    const target = mergeBaselineValue(merged[key], desired);
    if (JSON.stringify(merged[key]) === JSON.stringify(target)) compliant.push(key);
    else {
      changes.push({ key, from: merged[key], to: target });
      merged[key] = target;
    }
  }
  const unsupportedLocalMarkdownStyles = isLocalStylesheet(current['markdown.styles'])
    ? current['markdown.styles']
    : null;
  if (removeLocalCss && unsupportedLocalMarkdownStyles) {
    changes.push({ key: 'markdown.styles', from: current['markdown.styles'], to: null });
    delete merged['markdown.styles'];
  }
  return {
    target: settingsFile,
    apply,
    baseline: baselineFile,
    action: !existed ? 'create' : changes.length ? 'merge' : 'preserve',
    changes,
    compliant,
    hadComments,
    unsupportedLocalMarkdownStyles,
    removeLocalCss,
    _merged: merged,
  };
}

function applyUserSettingsPlan(plan) {
  if (plan.hadComments && plan.action !== 'preserve') {
    throw new Error('user settings contain comments; merge the reported keys in the VS Code JSONC editor to preserve them');
  }
  if (plan.action !== 'preserve') writeAtomic(plan.target, `${JSON.stringify(plan._merged, null, 2)}\n`);
}

function publicUserSettingsPlan(plan) {
  const { _merged, ...output } = plan;
  return output;
}

function mergeWorkspaceSettings(workspaceRoot, baseline = WORKSPACE_BASELINE) {
  const settingsFile = path.join(workspaceRoot, '.vscode', 'settings.json');
  const existed = fs.existsSync(settingsFile);
  let existing = {};
  let hadComments = false;
  if (existed) {
    const raw = fs.readFileSync(settingsFile, 'utf8');
    hadComments = /\/\/|\/\*/.test(raw);
    try {
      existing = JSON.parse(stripJsonc(raw)) || {};
    } catch (error) {
      return { ok: false, error: `${settingsFile} is not valid JSON/JSONC: ${error.message}` };
    }
  }

  const merged = { ...existing };
  const changes = [];
  const skipped = [];
  for (const [key, desired] of Object.entries(baseline.settings || {})) {
    const mode = baseline.mergeMode?.[key] || 'enforce';
    if (mode === 'set-if-absent' && Object.hasOwn(merged, key)) {
      skipped.push({ key, mode, reason: 'workspace-has-key' });
      continue;
    }
    if (JSON.stringify(merged[key]) !== JSON.stringify(desired)) {
      changes.push({ key, from: merged[key], to: desired });
      merged[key] = desired;
    }
  }

  return { ok: true, settingsFile, existed, hadComments, changes, skipped, merged };
}

function writeAtomic(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temporary = `${file}.tmp-${process.pid}`;
  fs.writeFileSync(temporary, content, 'utf8');
  fs.renameSync(temporary, file);
}

function planGitignore(target) {
  const file = path.join(target, '.gitignore');
  if (!fs.existsSync(file)) return { action: 'none', file, content: null, changes: [] };
  const original = fs.readFileSync(file, 'utf8');
  const lines = original.split(/\r?\n/);
  const broad = /^(?:\/)?\.vscode\/?$/;
  const index = lines.findIndex((line) => broad.test(line.trim()));
  if (index < 0) return { action: 'none', file, content: original, changes: [] };

  lines.splice(index, 1, '.vscode/*', '!.vscode/settings.json', '!.vscode/markdown-light.css');
  const content = `${lines.join('\n').replace(/\n+$/, '')}\n`;
  return {
    action: 'narrow-vscode-rule',
    file,
    content,
    changes: ['replace broad .vscode ignore with two tracked-file exceptions'],
  };
}

function buildWorkspacePlan(target, apply, refreshCss = false) {
  const workspace = path.resolve(target);
  if (!fs.existsSync(workspace) || !fs.statSync(workspace).isDirectory()) {
    throw new Error(`workspace target is not a directory: ${workspace}`);
  }

  const skillsRoot = path.resolve(__dirname, '..', '..');
  const cssSource = path.join(skillsRoot, 'bootstrap-workspace', 'resources', 'markdown-light.css');
  if (!fs.existsSync(cssSource)) throw new Error(`packaging defect: Markdown CSS missing at ${cssSource}`);
  const cssContent = fs.readFileSync(cssSource);
  const cssDestination = path.join(workspace, '.vscode', 'markdown-light.css');
  const cssExists = fs.existsSync(cssDestination);
  const currentCssHash = cssExists ? sha256(fs.readFileSync(cssDestination)) : null;
  const sourceCssHash = sha256(cssContent);
  const cssMatchesSource = currentCssHash === sourceCssHash;
  const settings = mergeWorkspaceSettings(workspace);
  if (!settings.ok) throw new Error(settings.error);

  return {
    target: workspace,
    apply,
    css: {
      action: !cssExists ? 'create' : refreshCss && !cssMatchesSource ? 'refresh' : 'preserve',
      source: cssSource,
      destination: cssDestination,
      bytes: cssContent.length,
      sha256: sourceCssHash,
      currentSha256: currentCssHash,
      matchesSource: cssMatchesSource,
    },
    settings: {
      action: !settings.existed ? 'create' : settings.changes.length ? 'merge' : 'preserve',
      destination: settings.settingsFile,
      changes: settings.changes,
      skipped: settings.skipped,
      hadComments: settings.hadComments,
    },
    gitignore: planGitignore(workspace),
    _settingsResult: settings,
    _cssContent: cssContent,
  };
}

function applyWorkspacePlan(plan) {
  if (plan.css.action === 'create' || plan.css.action === 'refresh') {
    fs.mkdirSync(path.dirname(plan.css.destination), { recursive: true });
    const temporary = `${plan.css.destination}.tmp-${process.pid}`;
    fs.writeFileSync(temporary, plan._cssContent);
    fs.renameSync(temporary, plan.css.destination);
    if (sha256(fs.readFileSync(plan.css.destination)) !== plan.css.sha256) {
      throw new Error('Markdown CSS hash verification failed after copy');
    }
  }
  if (plan.settings.action !== 'preserve') {
    writeAtomic(plan._settingsResult.settingsFile, `${JSON.stringify(plan._settingsResult.merged, null, 2)}\n`);
  }
  if (plan.gitignore.action !== 'none') writeAtomic(plan.gitignore.file, plan.gitignore.content);
}

function publicWorkspacePlan(plan) {
  const { _settingsResult, _cssContent, ...output } = plan;
  const { content, ...gitignore } = output.gitignore;
  return { ...output, gitignore };
}

async function loadMarketplace(args) {
  if (args.file) return JSON.parse(fs.readFileSync(args.file, 'utf8'));
  const response = await fetch(args.url, {
    headers: { 'user-agent': 'alex-act-manager-marketplace-version-check' },
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`marketplace fetch failed: HTTP ${response.status}`);
  return response.json();
}

function selectMarketplaceRecords(marketplace, requested) {
  if (!Array.isArray(marketplace.plugins)) throw new Error('marketplace plugins array is missing');
  return requested.map((name) => {
    const matches = marketplace.plugins.filter((plugin) => plugin.name === name);
    if (!matches.length) throw new Error(`plugin record not found: ${name}`);
    if (matches.length > 1) throw new Error(`duplicate plugin records found: ${name}`);
    const { version, source } = matches[0];
    if (!version || !source) throw new Error(`plugin record is incomplete: ${name}`);
    return { name, version, source };
  });
}

async function main() {
  const [command, ...args] = process.argv.slice(2);
  if (command === 'configure-vscode') {
    const parsed = parseUserSettingsArgs(args);
    const plan = buildUserSettingsPlan(parsed.targetSettings, parsed.apply, parsed.removeLocalCss);
    if (parsed.apply) applyUserSettingsPlan(plan);
    process.stdout.write(`${JSON.stringify(publicUserSettingsPlan(plan), null, 2)}\n`);
    return;
  }
  if (command === 'bootstrap-workspace') {
    const parsed = parseWorkspaceArgs(args);
    const plan = buildWorkspacePlan(parsed.target, parsed.apply, parsed.refreshCss);
    if (parsed.apply) applyWorkspacePlan(plan);
    process.stdout.write(`${JSON.stringify(publicWorkspacePlan(plan), null, 2)}\n`);
    return;
  }
  if (command === 'marketplace-versions') {
    const parsed = parseMarketplaceArgs(args);
    const marketplace = await loadMarketplace(parsed);
    process.stdout.write(`${JSON.stringify(selectMarketplaceRecords(marketplace, parsed.plugins), null, 2)}\n`);
    return;
  }
  throw new Error(`unknown command: ${command || '<missing>'}`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`ERROR: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = {
  DEFAULT_MARKETPLACE_URL,
  WORKSPACE_BASELINE,
  applyUserSettingsPlan,
  applyWorkspacePlan,
  buildUserSettingsPlan,
  buildWorkspacePlan,
  defaultUserSettingsPath,
  isLocalStylesheet,
  mergeBaselineValue,
  loadMarketplace,
  mergeWorkspaceSettings,
  parseMarketplaceArgs,
  parseUserSettingsArgs,
  parseWorkspaceArgs,
  planGitignore,
  selectMarketplaceRecords,
  stripJsonc,
  publicUserSettingsPlan,
  writeAtomic,
};
