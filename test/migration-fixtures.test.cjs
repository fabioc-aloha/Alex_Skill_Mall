'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const PRE = path.join(ROOT, 'test', 'fixtures', 'pre-migration');
const POST = path.join(ROOT, 'test', 'fixtures', 'post-migration');
const PLUGINS = [
  'spline-3d-integration',
  'context-architect',
  'visual-storytelling',
  'flint-chart-plugin',
  'md-to-pdf',
];
const PLUGIN_FIELDS = new Set([
  'name', 'version', 'description', 'author', 'homepage', 'repository',
  'license', 'keywords', 'category', 'tags', 'agents', 'skills', 'commands',
  'hooks', 'extensions', 'mcpServers', 'lspServers',
]);
const SKILL_FRONTMATTER_FIELDS = new Set(['name', 'description', 'lastReviewed']);
const PRESERVED_PLUGIN_FIELDS = new Set([
  'name', 'version', 'description', 'keywords', 'category',
  'homepage', 'repository', 'license', 'tags',
]);

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function json(filePath) {
  return JSON.parse(read(filePath));
}

function hash(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function frontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  assert.ok(match, 'expected YAML frontmatter');
  const keys = match[1]
    .split(/\r?\n/)
    .filter((line) => /^[A-Za-z][A-Za-z0-9_-]*\s*:/.test(line))
    .map((line) => line.match(/^([A-Za-z][A-Za-z0-9_-]*)\s*:/)[1]);
  return { keys, body: raw.slice(match[0].length) };
}

function assertBodyPreserved(before, after) {
  assert.equal(frontmatter(read(after)).body, frontmatter(read(before)).body);
}

function markdownLinks(raw) {
  const withoutFences = raw.replace(/^\s*```[\s\S]*?^\s*```\s*$/gm, '');
  return [...withoutFences.matchAll(/\[[^\]]+\]\((?!https?:|mailto:|#)([^)#]+)(?:#[^)]+)?\)/g)]
    .map((match) => match[1]);
}

function walk(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else files.push(full);
  }
  return files;
}

test('post fixtures use the Copilot-native manifest allowlist', () => {
  for (const name of PLUGINS) {
    const manifest = json(path.join(POST, name, 'plugin.json'));
    assert.equal(manifest.name, name);
    assert.equal(typeof manifest.author, 'object', `${name}: author must be object`);
    assert.equal(typeof manifest.author.name, 'string', `${name}: author.name required`);
    assert.deepEqual(
      Object.keys(manifest).filter((key) => !PLUGIN_FIELDS.has(key)),
      [],
      `${name}: legacy plugin fields remain`,
    );
    assert.ok(fs.existsSync(path.join(POST, name, '.mall-metadata.json')));
  }
});

test('standard metadata and removed legacy fields are preserved exactly', () => {
  for (const name of PLUGINS) {
    const before = json(path.join(PRE, name, 'plugin.json'));
    const after = json(path.join(POST, name, 'plugin.json'));
    const metadata = json(path.join(POST, name, '.mall-metadata.json'));

    for (const key of Object.keys(before)) {
      if (PRESERVED_PLUGIN_FIELDS.has(key)) {
        assert.deepEqual(after[key], before[key], `${name}: changed ${key}`);
      } else if (key === 'author') {
        const expected = typeof before.author === 'string'
          ? { name: before.author }
          : Object.fromEntries(
            Object.entries(before.author).filter(([field]) => ['name', 'email', 'url'].includes(field)),
          );
        assert.deepEqual(after.author, expected, `${name}: author normalization`);
        const extensions = typeof before.author === 'object'
          ? Object.fromEntries(
            Object.entries(before.author).filter(([field]) => !['name', 'email', 'url'].includes(field)),
          )
          : {};
        if (Object.keys(extensions).length) {
          assert.deepEqual(metadata.author_extensions, extensions, `${name}: author extensions`);
        }
      } else {
        assert.deepEqual(metadata[key], before[key], `${name}: legacy ${key}`);
      }
    }
  }
});

test('post fixture layouts cover skills, agents, commands, MCP, scripts, and bundles', () => {
  assert.ok(fs.existsSync(path.join(POST, 'spline-3d-integration', 'skills', 'spline-3d-integration', 'SKILL.md')));
  assert.ok(fs.existsSync(path.join(POST, 'context-architect', 'agents', 'context-architect.agent.md')));
  assert.ok(fs.existsSync(path.join(POST, 'md-to-pdf', 'skills', 'md-to-pdf', 'md-to-pdf.cjs')));

  const visualSkills = fs.readdirSync(path.join(POST, 'visual-storytelling', 'skills'));
  assert.deepEqual(visualSkills.sort(), [
    'data-preparation', 'datasource-connectors', 'delivery-ascii-dashboard',
    'delivery-html-dashboard', 'delivery-svg-markdown', 'storytelling-requirements',
    'visual-storytelling', 'visual-vocabulary',
  ]);
  assert.ok(fs.existsSync(path.join(POST, 'visual-storytelling', 'agents', 'visual-storytelling.agent.md')));

  const flint = json(path.join(POST, 'flint-chart-plugin', 'plugin.json'));
  assert.equal(flint.commands, 'commands/');
  assert.deepEqual(Object.keys(flint.mcpServers).sort(), ['flint', 'playwright']);
  assert.ok(fs.existsSync(path.join(POST, 'flint-chart-plugin', 'commands', 'render-chart.md')));
  assert.equal(fs.existsSync(path.join(POST, 'flint-chart-plugin', 'mcp.json')), false);
});

test('legacy skill and agent frontmatter is normalized', () => {
  for (const filePath of walk(POST)) {
    if (path.basename(filePath) === 'SKILL.md') {
      const { keys } = frontmatter(read(filePath));
      assert.deepEqual(
        keys.filter((key) => !SKILL_FRONTMATTER_FIELDS.has(key)),
        [],
        `${path.relative(POST, filePath)}: legacy skill frontmatter`,
      );
    }
    if (filePath.endsWith('.agent.md')) {
      const { keys } = frontmatter(read(filePath));
      assert.deepEqual(keys, ['name', 'description']);
      assert.match(path.basename(filePath), /^[a-z0-9-]+\.agent\.md$/);
    }
  }
});

test('artifact bodies and support resources remain equivalent', () => {
  assertBodyPreserved(
    path.join(PRE, 'spline-3d-integration', 'SKILL.md'),
    path.join(POST, 'spline-3d-integration', 'skills', 'spline-3d-integration', 'SKILL.md'),
  );
  for (const dir of ['examples', 'guides']) {
    const before = path.join(PRE, 'spline-3d-integration', dir);
    const after = path.join(POST, 'spline-3d-integration', 'skills', 'spline-3d-integration', dir);
    for (const source of walk(before)) {
      const relative = path.relative(before, source);
      assert.equal(hash(source), hash(path.join(after, relative)));
    }
  }

  assertBodyPreserved(
    path.join(PRE, 'context-architect', 'AGENT.md'),
    path.join(POST, 'context-architect', 'agents', 'context-architect.agent.md'),
  );
  assertBodyPreserved(
    path.join(PRE, 'md-to-pdf', 'SKILL.md'),
    path.join(POST, 'md-to-pdf', 'skills', 'md-to-pdf', 'SKILL.md'),
  );
  assert.equal(
    hash(path.join(PRE, 'md-to-pdf', 'md-to-pdf.cjs')),
    hash(path.join(POST, 'md-to-pdf', 'skills', 'md-to-pdf', 'md-to-pdf.cjs')),
  );

  for (const skill of ['chart-big-idea', 'flint-chart', 'render-verify']) {
    assert.equal(
      hash(path.join(PRE, 'flint-chart-plugin', 'skills', skill, 'SKILL.md')),
      hash(path.join(POST, 'flint-chart-plugin', 'skills', skill, 'SKILL.md')),
    );
  }
});

test('adapted command and bundled skill references are plugin-local', () => {
  const command = read(path.join(POST, 'flint-chart-plugin', 'commands', 'render-chart.md'));
  assert.doesNotMatch(command, /\.github\/skills/);
  assert.match(command, /chart-big-idea/);
  assert.match(command, /render-verify/);

  const wrapper = read(path.join(POST, 'visual-storytelling', 'skills', 'visual-storytelling', 'SKILL.md'));
  assert.doesNotMatch(wrapper, /\.github\/skills\/local/);
  for (const name of [
    'storytelling-requirements', 'datasource-connectors', 'data-preparation',
    'visual-vocabulary', 'delivery-ascii-dashboard', 'delivery-svg-markdown',
    'delivery-html-dashboard',
  ]) {
    assert.match(wrapper, new RegExp(`skills/${name}/SKILL\\.md`));
  }
});

test('all relative Markdown links in post skills and commands resolve', () => {
  for (const filePath of walk(POST).filter((file) => file.endsWith('.md'))) {
    for (const target of markdownLinks(read(filePath))) {
      const resolved = path.resolve(path.dirname(filePath), target);
      assert.ok(fs.existsSync(resolved), `${path.relative(POST, filePath)} -> ${target}`);
    }
  }
});
