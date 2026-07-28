#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const STANDARD_PLUGIN_FIELDS = new Set([
  'name', 'version', 'description', 'author', 'homepage', 'repository',
  'license', 'keywords', 'category', 'tags',
]);
const AUTHOR_FIELDS = new Set(['name', 'email', 'url']);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + '\n');
}

function copyDirectory(source, target) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.cpSync(source, target, { recursive: true });
}

function listPluginDirectories(repoRoot) {
  const pluginsRoot = path.join(repoRoot, 'plugins');
  if (!fs.existsSync(pluginsRoot)) throw new Error(`plugins directory missing: ${pluginsRoot}`);
  const plugins = [];
  for (const category of fs.readdirSync(pluginsRoot, { withFileTypes: true })) {
    if (!category.isDirectory() || category.name.startsWith('.')) continue;
    const categoryPath = path.join(pluginsRoot, category.name);
    for (const plugin of fs.readdirSync(categoryPath, { withFileTypes: true })) {
      if (!plugin.isDirectory() || plugin.name.startsWith('.')) continue;
      const pluginPath = path.join(categoryPath, plugin.name);
      if (fs.existsSync(path.join(pluginPath, 'plugin.json'))) {
        plugins.push({ category: category.name, name: plugin.name, path: pluginPath });
      }
    }
  }
  return plugins;
}

function artifactPaths(value) {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(artifactPaths);
  if (value && typeof value === 'object') return Object.values(value).flatMap(artifactPaths);
  return [];
}

function validateDeclaredArtifacts(pluginDir, manifest) {
  for (const relative of artifactPaths(manifest.artifacts || {})) {
    const resolved = path.resolve(pluginDir, relative);
    if (!resolved.startsWith(path.resolve(pluginDir) + path.sep) || !fs.existsSync(resolved)) {
      throw new Error(`${manifest.name}: declared artifact missing: ${relative}`);
    }
  }
}

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) throw new Error('expected YAML frontmatter');
  const values = {};
  for (const line of match[1].split(/\r?\n/)) {
    const parsed = line.match(/^([A-Za-z][A-Za-z0-9_-]*)\s*:\s*(.*)$/);
    if (!parsed) continue;
    let value = parsed[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    values[parsed[1]] = value;
  }
  return { values, body: raw.slice(match[0].length) };
}

function yamlString(value) {
  return JSON.stringify(String(value));
}

function normalizeSkill(filePath) {
  const { values, body } = parseFrontmatter(fs.readFileSync(filePath, 'utf8'));
  if (!values.name || !values.description) throw new Error(`${filePath}: skill name and description required`);
  const lines = ['---', `name: ${values.name}`, `description: ${yamlString(values.description)}`];
  const reviewed = values.lastReviewed || values.currency || values.date_added;
  if (reviewed) lines.push(`lastReviewed: ${reviewed}`);
  lines.push('---', '');
  fs.writeFileSync(filePath, lines.join('\n') + body);
}

function normalizeAgent(filePath, pluginName) {
  const { values, body } = parseFrontmatter(fs.readFileSync(filePath, 'utf8'));
  const description = values.description || '';
  if (!description) throw new Error(`${filePath}: agent description required`);
  const normalized = description.endsWith('.') ? description : `${description}.`;
  fs.writeFileSync(filePath, [
    '---',
    `name: ${pluginName}`,
    `description: ${yamlString(normalized)}`,
    '---',
    '',
  ].join('\n') + body);
}

function normalizeCommand(filePath) {
  const { values, body } = parseFrontmatter(fs.readFileSync(filePath, 'utf8'));
  if (!values.description) throw new Error(`${filePath}: command description required`);
  fs.writeFileSync(filePath, [
    '---',
    `description: ${yamlString(values.description)}`,
    '---',
    '',
  ].join('\n') + body);
}

function normalizeAuthor(author) {
  if (typeof author === 'string') return { standard: { name: author }, extensions: {} };
  const standard = {};
  const extensions = {};
  for (const [key, value] of Object.entries(author || {})) {
    if (AUTHOR_FIELDS.has(key)) standard[key] = value;
    else extensions[key] = value;
  }
  if (!standard.name) standard.name = 'ACT Plugin Mall';
  return { standard, extensions };
}

function buildManifest(oldManifest, components) {
  const output = {};
  for (const key of STANDARD_PLUGIN_FIELDS) {
    if (key === 'author' || oldManifest[key] === undefined) continue;
    output[key] = oldManifest[key];
  }
  const author = normalizeAuthor(oldManifest.author);
  output.author = author.standard;
  if (components.commands) output.commands = 'commands/';
  if (components.mcpServers) output.mcpServers = components.mcpServers;
  return { output, authorExtensions: author.extensions };
}

function buildMallMetadata(oldManifest, authorExtensions, migration) {
  const metadata = {};
  if (Object.keys(authorExtensions).length) metadata.author_extensions = authorExtensions;
  for (const [key, value] of Object.entries(oldManifest)) {
    if (STANDARD_PLUGIN_FIELDS.has(key) || key === 'author') continue;
    metadata[key] = value;
  }
  if (migration) metadata.migration = migration;
  return metadata;
}

function moveRootSkill(workDir, pluginName, artifactPath) {
  const source = path.join(workDir, artifactPath);
  const skillDir = path.join(workDir, 'skills', pluginName);
  fs.mkdirSync(skillDir, { recursive: true });
  fs.renameSync(source, path.join(skillDir, 'SKILL.md'));

  const excluded = new Set(['plugin.json', 'README.md', '.mall-metadata.json', 'skills', 'agents', 'commands']);
  for (const entry of fs.readdirSync(workDir, { withFileTypes: true })) {
    if (excluded.has(entry.name)) continue;
    fs.renameSync(path.join(workDir, entry.name), path.join(skillDir, entry.name));
  }
  normalizeSkill(path.join(skillDir, 'SKILL.md'));
}

function moveAgent(workDir, pluginName, artifactPath) {
  const agentsDir = path.join(workDir, 'agents');
  fs.mkdirSync(agentsDir, { recursive: true });
  const target = path.join(agentsDir, `${pluginName}.agent.md`);
  fs.renameSync(path.join(workDir, artifactPath), target);
  normalizeAgent(target, pluginName);
}

function adaptCommandBody(raw) {
  return raw
    .replace(
      '1. **Load the `chart-big-idea` skill** and produce a Chart Brief. Look in `.github/skills/local/chart-big-idea/SKILL.md` first (heir-installed), then `.github/skills/chart-big-idea/SKILL.md` (baseline).',
      '1. **Load the installed `chart-big-idea` skill** and produce a Chart Brief.',
    )
    .replace(
      '2. **Load the `flint-chart` skill.** Look in `.github/skills/local/flint-chart/SKILL.md` first (heir-installed), then `.github/skills/flint-chart/SKILL.md` (baseline). If neither is present, tell the user to install the plugin and stop.',
      '2. **Load the installed `flint-chart` skill.** If it is unavailable, tell the user to reinstall or enable the plugin and stop.',
    )
    .replace(
      '8. **Verify — look at what you rendered.** Load the `render-verify` skill (`.github/skills/local/render-verify/SKILL.md` first, then `.github/skills/render-verify/SKILL.md`).',
      '8. **Verify — look at what you rendered.** Load the installed `render-verify` skill.',
    );
}

function moveCommands(workDir, promptPaths) {
  const commandsDir = path.join(workDir, 'commands');
  fs.mkdirSync(commandsDir, { recursive: true });
  for (const relative of promptPaths) {
    const source = path.join(workDir, relative);
    const base = path.basename(relative).replace(/\.prompt\.md$/, '.md');
    const target = path.join(commandsDir, base);
    fs.renameSync(source, target);
    normalizeCommand(target);
    fs.writeFileSync(target, adaptCommandBody(fs.readFileSync(target, 'utf8')));
  }
  const promptsDir = path.join(workDir, 'prompts');
  if (fs.existsSync(promptsDir) && fs.readdirSync(promptsDir).length === 0) fs.rmdirSync(promptsDir);
}

function vendorBundleSkills(repoRoot, workDir, components) {
  for (const component of components || []) {
    const [category, name] = component.split('/');
    const source = path.join(repoRoot, 'plugins', category, name, 'SKILL.md');
    if (!fs.existsSync(source)) throw new Error(`bundle component missing: ${component}`);
    const targetDir = path.join(workDir, 'skills', name);
    fs.mkdirSync(targetDir, { recursive: true });
    fs.copyFileSync(source, path.join(targetDir, 'SKILL.md'));
    normalizeSkill(path.join(targetDir, 'SKILL.md'));
  }
}

function adaptVisualWrapper(filePath) {
  let raw = fs.readFileSync(filePath, 'utf8');
  raw = raw.replaceAll('.github/skills/local/', 'skills/');
  fs.writeFileSync(filePath, raw);
}

function convertPlugin(repoRoot, plugin, dryRun) {
  const manifestPath = path.join(plugin.path, 'plugin.json');
  const oldManifest = readJson(manifestPath);
  if (fs.existsSync(path.join(plugin.path, '.mall-metadata.json'))) {
    return { status: 'skipped', name: plugin.name };
  }
  validateDeclaredArtifacts(plugin.path, oldManifest);
  if (dryRun) return { status: 'planned', name: plugin.name };

  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'mall-plugin-convert-'));
  const workDir = path.join(tempRoot, plugin.name);
  copyDirectory(plugin.path, workDir);
  try {
    const artifacts = oldManifest.artifacts || {};
    const skillPaths = [
      ...(typeof artifacts.skill === 'string' ? [artifacts.skill] : []),
      ...(Array.isArray(artifacts.skills) ? artifacts.skills : []),
    ];
    const agentPaths = [
      ...(typeof artifacts.agent === 'string' ? [artifacts.agent] : []),
      ...(Array.isArray(artifacts.agents) ? artifacts.agents : []),
    ];
    const promptPaths = [
      ...(typeof artifacts.prompt === 'string' ? [artifacts.prompt] : []),
      ...(Array.isArray(artifacts.prompts) ? artifacts.prompts : []),
    ];

    for (const relative of agentPaths) moveAgent(workDir, plugin.name, relative);
    if (promptPaths.length) moveCommands(workDir, promptPaths);

    let mcpServers = null;
    if (typeof artifacts.mcp === 'string') {
      const mcpPath = path.join(workDir, artifacts.mcp);
      const mcp = readJson(mcpPath);
      mcpServers = mcp.mcpServers || mcp.servers;
      if (!mcpServers || typeof mcpServers !== 'object') throw new Error(`${plugin.name}: unsupported MCP config`);
      fs.rmSync(mcpPath);
    }

    if (skillPaths.length === 1 && skillPaths[0] === 'SKILL.md') {
      moveRootSkill(workDir, plugin.name, 'SKILL.md');
    } else {
      for (const relative of skillPaths) normalizeSkill(path.join(workDir, relative));
    }
    if (oldManifest.bundle) {
      vendorBundleSkills(repoRoot, workDir, oldManifest.components);
      adaptVisualWrapper(path.join(workDir, 'skills', plugin.name, 'SKILL.md'));
    }

    const components = {
      skills: skillPaths.length > 0 || oldManifest.bundle,
      agents: agentPaths.length > 0,
      commands: promptPaths.length > 0,
      mcpServers,
    };
    const migration = oldManifest.bundle
      ? { strategy: 'vendor-components', reason: 'Copilot CLI has no plugin dependency field; the bundle must be self-contained.' }
      : plugin.name === 'flint-chart-plugin'
        ? { prompt_to_command: 'commands/render-chart.md', mcp_to_inline_manifest: true, evidence: 'Copilot CLI 1.0.73 strict marketplace and invocation smoke tests' }
        : plugin.name === 'md-to-pdf'
          ? { strategy: 'colocate-script-with-skill', reason: 'The skill invokes the support script as a relative resource.' }
          : null;
    const { output, authorExtensions } = buildManifest(oldManifest, components);
    writeJson(path.join(workDir, 'plugin.json'), output);
    writeJson(path.join(workDir, '.mall-metadata.json'), buildMallMetadata(oldManifest, authorExtensions, migration));

    const backup = `${plugin.path}.migration-backup-${process.pid}`;
    fs.renameSync(plugin.path, backup);
    try {
      copyDirectory(workDir, plugin.path);
      fs.rmSync(backup, { recursive: true, force: true });
    } catch (error) {
      fs.rmSync(plugin.path, { recursive: true, force: true });
      fs.renameSync(backup, plugin.path);
      throw error;
    }
    return { status: 'migrated', name: plugin.name };
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

function migrateRepository({ repoRoot, pluginNames = null, categories = null, dryRun = false } = {}) {
  if (!repoRoot) throw new Error('repoRoot is required');
  const selectedNames = pluginNames ? new Set(pluginNames) : null;
  const selectedCategories = categories ? new Set(categories) : null;
  const all = listPluginDirectories(repoRoot);
  const selected = all.filter((plugin) =>
    (!selectedNames || selectedNames.has(plugin.name))
    && (!selectedCategories || selectedCategories.has(plugin.category)));
  if (selectedNames) {
    const found = new Set(selected.map((plugin) => plugin.name));
    const missing = [...selectedNames].filter((name) => !found.has(name));
    if (missing.length) throw new Error(`plugins not found: ${missing.join(', ')}`);
  }

  const summary = { planned: 0, migrated: 0, skipped: 0, errors: [] };
  for (const plugin of selected) {
    const result = convertPlugin(repoRoot, plugin, dryRun);
    summary[result.status]++;
  }
  return summary;
}

function parseListFlag(flag) {
  const index = process.argv.indexOf(flag);
  if (index < 0) return null;
  const value = process.argv[index + 1];
  if (!value || value.startsWith('--')) throw new Error(`${flag} requires a comma-separated value`);
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

function main() {
  const repoRoot = path.resolve(__dirname, '..');
  try {
    const summary = migrateRepository({
      repoRoot,
      pluginNames: parseListFlag('--plugins'),
      categories: parseListFlag('--categories'),
      dryRun: process.argv.includes('--dry-run'),
    });
    console.log(JSON.stringify(summary, null, 2));
  } catch (error) {
    console.error(`ERROR: ${error.message}`);
    process.exitCode = 1;
  }
}

if (require.main === module) main();

module.exports = { migrateRepository };
