'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const FILE_LIMIT = 100;
const PATH_COMPONENTS = Object.freeze({
  skills: 'skills',
  agents: 'agents',
  commands: 'commands',
  hooks: 'hooks',
  extensions: 'extensions',
  lspServers: 'lsp',
});
const FORBIDDEN_NAMES = new Set([
  '.env', '.npmrc', 'id_rsa', 'id_ed25519', 'credentials.json',
]);
const FORBIDDEN_EXTENSIONS = new Set(['.key', '.pem', '.p12', '.pfx']);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function walkFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walkFiles(fullPath));
    else files.push(fullPath);
  }
  return files;
}

function isInside(root, target) {
  const relative = path.relative(path.resolve(root), path.resolve(target));
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function copyEntry(source, target, { renamePrompts = false } = {}) {
  const stat = fs.lstatSync(source);
  if (stat.isSymbolicLink()) throw new Error(`symbolic links are not allowed: ${source}`);
  if (stat.isDirectory()) {
    fs.mkdirSync(target, { recursive: true });
    for (const entry of fs.readdirSync(source)) {
      const targetName = renamePrompts
        ? entry.replace(/\.prompt\.md$/, '.md')
        : entry;
      copyEntry(path.join(source, entry), path.join(target, targetName), { renamePrompts });
    }
    return;
  }
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

function componentPaths(value) {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value) && value.every((item) => typeof item === 'string')) return value;
  return [];
}

function copyComponent(sourceRoot, workRoot, field, targetName, manifest) {
  const sources = componentPaths(manifest[field]);
  if (sources.length === 0) return false;
  const targetRoot = path.join(workRoot, targetName);
  let copied = 0;
  for (const relativeSource of sources) {
    const source = path.resolve(sourceRoot, relativeSource);
    if (!isInside(sourceRoot, source)) {
      throw new Error(`${field} path is outside source: ${relativeSource}`);
    }
    if (!fs.existsSync(source)) {
      if (field === 'agents') continue;
      throw new Error(`${field} path is missing: ${relativeSource}`);
    }
    if (fs.statSync(source).isDirectory()) {
      for (const entry of fs.readdirSync(source)) {
        const targetNameForEntry = field === 'commands'
          ? entry.replace(/\.prompt\.md$/, '.md')
          : entry;
        copyEntry(
          path.join(source, entry),
          path.join(targetRoot, targetNameForEntry),
          { renamePrompts: field === 'commands' },
        );
        copied++;
      }
    } else {
      const targetFile = field === 'commands'
        ? path.basename(source).replace(/\.prompt\.md$/, '.md')
        : path.basename(source);
      copyEntry(source, path.join(targetRoot, targetFile), { renamePrompts: field === 'commands' });
      copied++;
    }
  }
  return copied > 0 && walkFiles(targetRoot).length > 0;
}

function frontmatter(raw) {
  const match = raw.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n/);
  if (!match) return {};
  const values = {};
  for (const line of match[1].split(/\r?\n/)) {
    const pair = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!pair) continue;
    values[pair[1]] = pair[2].trim().replace(/^['"]|['"]$/g, '');
  }
  return values;
}

function normalizedLinkCandidates(targetPath) {
  const candidates = [];
  if (targetPath.endsWith('.prompt.md')) {
    candidates.push({ path: targetPath.replace(/\.prompt\.md$/, '.md'), reason: 'prompt-renamed' });
  }
  if (targetPath.startsWith('../skills/')) {
    candidates.push({ path: `../../${targetPath.slice('../skills/'.length)}`, reason: 'skill-root-normalized' });
  }
  if (targetPath.endsWith('.instructions.md') && !path.basename(targetPath).startsWith('alex-act-')) {
    candidates.push({
      path: path.join(path.dirname(targetPath), `alex-act-${path.basename(targetPath)}`).replaceAll('\\', '/'),
      reason: 'bootstrap-prefixed',
    });
  }
  return candidates;
}

function rewriteUnshippableMarkdownLinks(workRoot) {
  const rewrites = [];
  for (const filePath of walkFiles(workRoot).filter((file) => file.endsWith('.md'))) {
    let fenced = false;
    const lines = fs.readFileSync(filePath, 'utf8').split(/(?<=\n)/);
    const output = lines.map((line) => {
      if (/^\s*```/.test(line)) { fenced = !fenced; return line; }
      if (fenced) return line;
      const rewrite = (match, image, label, targetPath, suffix = '') => {
        const target = path.resolve(path.dirname(filePath), targetPath);
        if (isInside(workRoot, target) && fs.existsSync(target)) return match;
        for (const candidate of normalizedLinkCandidates(targetPath)) {
          const candidateTarget = path.resolve(path.dirname(filePath), candidate.path);
          if (isInside(workRoot, candidateTarget) && fs.existsSync(candidateTarget)) {
            rewrites.push({
              file: path.relative(workRoot, filePath).replaceAll('\\', '/'),
              from: targetPath,
              to: candidate.path,
              reason: candidate.reason,
            });
            return `${image}[${label}](${candidate.path}${suffix})`;
          }
        }
        if (image) return match;
        rewrites.push({
          file: path.relative(workRoot, filePath).replaceAll('\\', '/'),
          label: label.replaceAll('`', ''),
          target: targetPath,
          reason: 'not-vendored',
        });
        return `\`${label.replaceAll('`', '')}\``;
      };
      let rewritten = line.replace(
        /(!?)\[(`[^`]+`)\]\((?!https?:|mailto:|#)([^)#?]+)([?#][^)]+)?\)/g,
        rewrite,
      );
      const segments = rewritten.split(/(`[^`\n]*`)/g);
      rewritten = segments.map((segment, index) => {
        if (index % 2 === 1) return segment;
        return segment.replace(
          /(!?)\[([^\]]+)\]\((?!https?:|mailto:|#)([^)#?]+)([?#][^)]+)?\)/g,
          rewrite,
        );
      }).join('');
      return rewritten;
    });
    fs.writeFileSync(filePath, output.join(''));
  }
  return rewrites;
}

function validateRelativeMarkdownLinks(pluginDir, add) {
  for (const filePath of walkFiles(pluginDir).filter((file) => file.endsWith('.md'))) {
    let fenced = false;
    const lines = fs.readFileSync(filePath, 'utf8').split(/(?<=\n)/);
    const check = (match, targetPath) => {
      const target = path.resolve(path.dirname(filePath), targetPath);
      if (!isInside(pluginDir, target) || !fs.existsSync(target)) {
        add(
          'MARKDOWN_LINK_INVALID',
          `${path.relative(pluginDir, filePath)} has a broken relative link: ${targetPath}`,
        );
      }
      return match;
    };
    for (const line of lines) {
      if (/^\s*```/.test(line)) { fenced = !fenced; continue; }
      if (fenced) continue;
      line.replace(
        /!?\[`[^`]+`\]\((?!https?:|mailto:|#)([^)#?]+)(?:[?#][^)]+)?\)/g,
        (match, targetPath) => check(match, targetPath),
      );
      const segments = line.split(/(`[^`\n]*`)/g);
      segments.forEach((segment, index) => {
        if (index % 2 === 1) return;
        segment.replace(
          /!?\[[^\]]+\]\((?!https?:|mailto:|#)([^)#?]+)(?:[?#][^)]+)?\)/g,
          (match, targetPath) => check(match, targetPath),
        );
      });
    }
  }
}

function validatePluginDirectory(pluginDir) {
  const errors = [];
  const add = (code, message) => errors.push({ code, message });
  const manifestPath = path.join(pluginDir, 'plugin.json');
  const metadataPath = path.join(pluginDir, '.mall-metadata.json');
  let manifest = null;
  try { manifest = readJson(manifestPath); }
  catch { add('MANIFEST_INVALID', 'plugin.json is missing or malformed'); }
  try { readJson(metadataPath); }
  catch { add('METADATA_INVALID', '.mall-metadata.json is missing or malformed'); }

  if (manifest) {
    if (!NAME_PATTERN.test(manifest.name || '') || manifest.name !== path.basename(pluginDir)) {
      add('NAME_INVALID', 'manifest name must be kebab-case and match the plugin folder');
    }
    if (typeof manifest.version !== 'string' || !manifest.version.trim()) add('VERSION_MISSING', 'version is required');
    if (typeof manifest.description !== 'string' || !manifest.description.trim()) add('DESCRIPTION_MISSING', 'description is required');
    if (!manifest.author || typeof manifest.author !== 'object' || Array.isArray(manifest.author)
      || typeof manifest.author.name !== 'string' || !manifest.author.name.trim()) {
      add('AUTHOR_INVALID', 'author must be an object with a non-empty name');
    }
    for (const field of Object.keys(PATH_COMPONENTS)) {
      for (const relative of componentPaths(manifest[field])) {
        const resolved = path.resolve(pluginDir, relative);
        if (!isInside(pluginDir, resolved) || !fs.existsSync(resolved)) {
          add('COMPONENT_PATH_INVALID', `${field} path is missing or escapes the plugin: ${relative}`);
        }
      }
    }
  }

  const files = walkFiles(pluginDir);
  if (files.length > FILE_LIMIT) add('FILE_LIMIT_EXCEEDED', `${files.length} files exceed the ${FILE_LIMIT}-file limit`);
  for (const filePath of files) {
    const relative = path.relative(pluginDir, filePath).replaceAll('\\', '/');
    const stat = fs.lstatSync(filePath);
    if (stat.isSymbolicLink()) add('SYMLINK_FORBIDDEN', `${relative} is a symbolic link`);
    const base = path.basename(filePath).toLowerCase();
    if (FORBIDDEN_NAMES.has(base) || FORBIDDEN_EXTENSIONS.has(path.extname(base))) {
      add('FORBIDDEN_FILE', `${relative} may contain credentials or private material`);
    }
  }

  const skillsRoot = path.join(pluginDir, 'skills');
  if (fs.existsSync(skillsRoot)) {
    for (const skillPath of walkFiles(skillsRoot).filter((file) => path.basename(file) === 'SKILL.md')) {
      const values = frontmatter(fs.readFileSync(skillPath, 'utf8'));
      if (!values.name || !values.description) {
        add('SKILL_FRONTMATTER_INVALID', `${path.relative(pluginDir, skillPath)} needs name and description`);
      }
    }
  }
  const commandsRoot = path.join(pluginDir, 'commands');
  if (fs.existsSync(commandsRoot)) {
    for (const commandPath of walkFiles(commandsRoot).filter((file) => file.endsWith('.md'))) {
      if (!frontmatter(fs.readFileSync(commandPath, 'utf8')).description) {
        add('COMMAND_FRONTMATTER_INVALID', `${path.relative(pluginDir, commandPath)} needs description`);
      }
    }
  }
  validateRelativeMarkdownLinks(pluginDir, add);
  return { ok: errors.length === 0, errors, fileCount: files.length, name: manifest?.name || null };
}

function listArtifacts(workRoot, relativeRoot) {
  const root = path.join(workRoot, relativeRoot);
  return walkFiles(root).map((file) => path.relative(workRoot, file).replaceAll('\\', '/')).sort();
}

function packagePlugin({
  repoRoot,
  sourceRoot,
  category,
  repository,
  ref,
  submittedBy = 'mall-maintainer',
  evidence = null,
  includes = [],
  apply = false,
  replace = false,
} = {}) {
  if (!repoRoot || !sourceRoot || !category) throw new Error('repoRoot, sourceRoot, and category are required');
  if (!NAME_PATTERN.test(category)) throw new Error(`invalid category: ${category}`);
  const absoluteSource = path.resolve(sourceRoot);
  const sourceManifestPath = path.join(absoluteSource, 'plugin.json');
  if (!fs.existsSync(sourceManifestPath)) throw new Error(`plugin.json missing: ${sourceManifestPath}`);
  const sourceManifest = readJson(sourceManifestPath);
  if (!NAME_PATTERN.test(sourceManifest.name || '')) throw new Error('plugin manifest name must be kebab-case');

  const target = path.join(path.resolve(repoRoot), 'plugins', category, sourceManifest.name);
  const existingMetadataPath = path.join(target, '.mall-metadata.json');
  let existingMetadata = {};
  if (fs.existsSync(existingMetadataPath)) {
    try { existingMetadata = readJson(existingMetadataPath); }
    catch { /* malformed metadata is replaced and validated below */ }
  }
  const existingBundled = existingMetadata.artifacts?.bundled || [];
  const includedTargets = new Set(includes.map((include) => include.target));
  const missingBundled = existingBundled.filter((targetName) => !includedTargets.has(targetName));
  if (replace && missingBundled.length) {
    throw new Error(
      `existing bundled resources require explicit --include mappings: ${missingBundled.join(', ')}`,
    );
  }
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'mall-package-'));
  const workRoot = path.join(tempRoot, sourceManifest.name);
  fs.mkdirSync(workRoot, { recursive: true });
  try {
    const outputManifest = { ...sourceManifest };
    for (const [field, targetName] of Object.entries(PATH_COMPONENTS)) {
      delete outputManifest[field];
      if (copyComponent(absoluteSource, workRoot, field, targetName, sourceManifest)) {
        outputManifest[field] = `${targetName}/`;
      }
    }
    delete outputManifest.mcpServers;
    if (sourceManifest.mcpServers && typeof sourceManifest.mcpServers === 'object') {
      outputManifest.mcpServers = sourceManifest.mcpServers;
    } else if (copyComponent(absoluteSource, workRoot, 'mcpServers', 'mcp', sourceManifest)) {
      outputManifest.mcpServers = 'mcp/';
    }
    for (const rootFile of ['README.md', 'CHANGELOG.md', 'LICENSE']) {
      const source = path.join(absoluteSource, rootFile);
      if (fs.existsSync(source)) copyEntry(source, path.join(workRoot, rootFile));
    }
    for (const include of includes) {
      const source = path.resolve(absoluteSource, include.source);
      const includeTarget = path.resolve(workRoot, include.target);
      if (!isInside(absoluteSource, source) || !fs.existsSync(source)) throw new Error(`include source invalid: ${include.source}`);
      if (!isInside(workRoot, includeTarget)) throw new Error(`include target invalid: ${include.target}`);
      copyEntry(source, includeTarget);
    }
    writeJson(path.join(workRoot, 'plugin.json'), outputManifest);
    const linkRewrites = rewriteUnshippableMarkdownLinks(workRoot);
    writeJson(path.join(workRoot, '.mall-metadata.json'), {
      ...existingMetadata,
      upstream: {
        ...(existingMetadata.upstream || {}),
        repo: repository || outputManifest.repository?.url || null,
        ref: ref || null,
        license: outputManifest.license || null,
      },
      submission: {
        schema_version: '1.0',
        submitted_by: submittedBy,
        evidence,
      },
      artifacts: {
        skills: listArtifacts(workRoot, 'skills'),
        agents: listArtifacts(workRoot, 'agents'),
        prompts: listArtifacts(workRoot, 'commands'),
        bundled: includes.map((include) => include.target),
      },
      link_rewrites: linkRewrites,
    });

    const validation = validatePluginDirectory(workRoot);
    if (!validation.ok) {
      throw new Error(validation.errors.map((error) => `${error.code}: ${error.message}`).join('; '));
    }
    if (apply) {
      if (fs.existsSync(target) && !replace) throw new Error(`target exists; use --replace to refresh: ${target}`);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      const backup = `${target}.backup-${process.pid}`;
      if (fs.existsSync(target)) fs.renameSync(target, backup);
      try {
        fs.cpSync(workRoot, target, { recursive: true });
        fs.rmSync(backup, { recursive: true, force: true });
      } catch (error) {
        fs.rmSync(target, { recursive: true, force: true });
        if (fs.existsSync(backup)) fs.renameSync(backup, target);
        throw error;
      }
    }
    return { applied: apply, target, validation };
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

function resolveSource(source, ref = null) {
  if (fs.existsSync(source)) return { sourceRoot: path.resolve(source), cleanup() {} };
  if (!ref) throw new Error('--ref is required for remote sources');
  const remote = /^https?:\/\//.test(source) ? source : `https://github.com/${source}.git`;
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'mall-vendor-source-'));
  const run = (args) => {
    const result = spawnSync('git', args, { encoding: 'utf8', shell: false });
    if (result.status !== 0) throw new Error(result.stderr.trim() || `git ${args[0]} failed`);
  };
  try {
    run(['clone', '--filter=blob:none', '--no-checkout', remote, tempRoot]);
    run(['-C', tempRoot, 'fetch', '--depth', '1', 'origin', ref]);
    run(['-C', tempRoot, 'checkout', '--detach', 'FETCH_HEAD']);
    return { sourceRoot: tempRoot, cleanup: () => fs.rmSync(tempRoot, { recursive: true, force: true }) };
  } catch (error) {
    fs.rmSync(tempRoot, { recursive: true, force: true });
    throw error;
  }
}

function parseArgs(argv) {
  const args = { _: [] };
  for (let index = 0; index < argv.length; index++) {
    const token = argv[index];
    if (!token.startsWith('--')) { args._.push(token); continue; }
    const key = token.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith('--')) args[key] = true;
    else {
      args[key] = key === 'include' && typeof args[key] === 'string'
        ? `${args[key]},${next}`
        : next;
      index++;
    }
  }
  return args;
}

function parseIncludes(value) {
  if (!value) return [];
  return String(value).split(',').filter(Boolean).map((entry) => {
    const [source, target] = entry.split('=');
    if (!source || !target) throw new Error('--include entries use source=target');
    return { source, target };
  });
}

module.exports = {
  FILE_LIMIT,
  packagePlugin,
  parseArgs,
  parseIncludes,
  resolveSource,
  validatePluginDirectory,
};
