'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const YAML = require('yaml');

const { migrateRepository } = require('../scripts/migrate-plugins-to-cli-shape.cjs');

const ROOT = path.resolve(__dirname, '..');
const PRE = path.join(ROOT, 'test', 'fixtures', 'pre-migration');
const POST = path.join(ROOT, 'test', 'fixtures', 'post-migration');
const CASES = [
  ['3d-graphics', 'spline-3d-integration'],
  ['architecture-patterns', 'context-architect'],
  ['data-analytics', 'visual-storytelling'],
  ['data-analytics', 'flint-chart-plugin'],
  ['converters', 'md-to-pdf'],
];
const COMPONENTS = [
  ['data-analytics', 'storytelling-requirements'],
  ['data-analytics', 'datasource-connectors'],
  ['data-analytics', 'data-preparation'],
  ['data-analytics', 'visual-vocabulary'],
  ['data-analytics', 'delivery-ascii-dashboard'],
  ['data-analytics', 'delivery-html-dashboard'],
  ['media-graphics', 'delivery-svg-markdown'],
];

function copyDir(source, target) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.cpSync(source, target, { recursive: true });
}

function fixtureRepo() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'mall-migration-'));
  for (const [category, name] of CASES) {
    copyDir(path.join(PRE, name), path.join(root, 'plugins', category, name));
  }
  for (const [category, name] of COMPONENTS) {
    copyDir(
      path.join(PRE, 'visual-storytelling-components', name),
      path.join(root, 'plugins', category, name),
    );
  }
  fs.writeFileSync(path.join(root, 'VERSION'), '2.0.0\n');
  fs.writeFileSync(path.join(root, 'CHANGELOG.md'), '# Changelog\n');
  return root;
}

function cleanup(root) {
  fs.rmSync(root, { recursive: true, force: true });
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

function snapshot(dir) {
  const out = {};
  for (const file of walk(dir)) {
    const relative = path.relative(dir, file).replaceAll('\\', '/');
    out[relative] = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  }
  return out;
}

function hash(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function json(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function normalizedArtifact(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8').replaceAll('\r\n', '\n');
  const match = raw.match(/^---\n([\s\S]*?)\n---\n/);
  assert.ok(match, `${filePath}: expected frontmatter`);
  const values = YAML.parse(match[1]);
  return { values, body: raw.slice(match[0].length) };
}

function assertTreesEquivalent(actualDir, expectedDir, label) {
  const actualFiles = walk(actualDir).map((file) => path.relative(actualDir, file).replaceAll('\\', '/')).sort();
  const expectedFiles = walk(expectedDir).map((file) => path.relative(expectedDir, file).replaceAll('\\', '/')).sort();
  assert.deepEqual(actualFiles, expectedFiles, `${label}: file set`);
  for (const relative of expectedFiles) {
    const actual = path.join(actualDir, relative);
    const expected = path.join(expectedDir, relative);
    if (relative.endsWith('.json')) {
      assert.deepEqual(json(actual), json(expected), `${label}: ${relative}`);
    } else if (
      path.basename(relative) === 'SKILL.md'
      || relative.endsWith('.agent.md')
      || relative.startsWith('commands/')
    ) {
      assert.deepEqual(normalizedArtifact(actual), normalizedArtifact(expected), `${label}: ${relative}`);
    } else {
      assert.equal(hash(actual), hash(expected), `${label}: ${relative}`);
    }
  }
}

function selectedNames() {
  return CASES.map(([, name]) => name);
}

test('converter output matches independently authored post fixtures', () => {
  const root = fixtureRepo();
  try {
    const summary = migrateRepository({ repoRoot: root, pluginNames: selectedNames() });
    assert.equal(summary.migrated, 5);
    assert.equal(summary.errors.length, 0);
    for (const [category, name] of CASES) {
      assertTreesEquivalent(
        path.join(root, 'plugins', category, name),
        path.join(POST, name),
        name,
      );
    }
    assert.equal(fs.readFileSync(path.join(root, 'VERSION'), 'utf8'), '2.0.0\n');
    assert.equal(fs.readFileSync(path.join(root, 'CHANGELOG.md'), 'utf8'), '# Changelog\n');
  } finally {
    cleanup(root);
  }
});

test('full migration processes bundles before their component sources', () => {
  const root = fixtureRepo();
  try {
    const summary = migrateRepository({ repoRoot: root });
    assert.equal(summary.migrated, CASES.length + COMPONENTS.length);
    assert.equal(summary.errors.length, 0);
  } finally {
    cleanup(root);
  }
});

test('dry run reports selected migrations without writing', () => {
  const root = fixtureRepo();
  try {
    const before = snapshot(root);
    const summary = migrateRepository({
      repoRoot: root,
      pluginNames: ['spline-3d-integration'],
      dryRun: true,
    });
    assert.equal(summary.planned, 1);
    assert.equal(summary.migrated, 0);
    assert.deepEqual(snapshot(root), before);
  } finally {
    cleanup(root);
  }
});

test('dry run exercises conversion logic and fails on an invalid MCP declaration', () => {
  const root = fixtureRepo();
  try {
    const mcpPath = path.join(root, 'plugins', 'data-analytics', 'flint-chart-plugin', 'mcp.json');
    fs.writeFileSync(mcpPath, JSON.stringify({ unsupported: {} }, null, 2) + '\n');
    assert.throws(
      () => migrateRepository({ repoRoot: root, pluginNames: ['flint-chart-plugin'], dryRun: true }),
      /unsupported MCP config/,
    );
    assert.equal(fs.existsSync(path.join(root, '.mall-metadata.json')), false);
  } finally {
    cleanup(root);
  }
});

test('valid YAML block descriptions and missing skill names normalize from plugin identity', () => {
  const root = fixtureRepo();
  try {
    const skillPath = path.join(root, 'plugins', '3d-graphics', 'spline-3d-integration', 'SKILL.md');
    const raw = fs.readFileSync(skillPath, 'utf8');
    const body = raw.slice(raw.indexOf('\n---\n', 4) + 5);
    fs.writeFileSync(skillPath, [
      '---',
      'description: >',
      '  Integrates Spline scenes into web projects.',
      '  Use when adding interactive 3D content.',
      '---',
      body,
    ].join('\n'));

    const summary = migrateRepository({ repoRoot: root, pluginNames: ['spline-3d-integration'] });
    assert.equal(summary.migrated, 1);
    const normalized = normalizedArtifact(path.join(
      root, 'plugins', '3d-graphics', 'spline-3d-integration',
      'skills', 'spline-3d-integration', 'SKILL.md',
    ));
    assert.equal(normalized.values.name, 'spline-3d-integration');
    assert.equal(
      normalized.values.description,
      'Integrates Spline scenes into web projects. Use when adding interactive 3D content.\n',
    );
  } finally {
    cleanup(root);
  }
});

test('frontmatter delimiters tolerate trailing horizontal whitespace', () => {
  const root = fixtureRepo();
  try {
    const skillPath = path.join(root, 'plugins', '3d-graphics', 'spline-3d-integration', 'SKILL.md');
    const raw = fs.readFileSync(skillPath, 'utf8');
    fs.writeFileSync(skillPath, raw.replace(/^---/, '--- '));
    const summary = migrateRepository({ repoRoot: root, pluginNames: ['spline-3d-integration'] });
    assert.equal(summary.migrated, 1);
  } finally {
    cleanup(root);
  }
});

test('malformed skill YAML recovers from plugin manifest and records the adaptation', () => {
  const root = fixtureRepo();
  try {
    const skillPath = path.join(root, 'plugins', '3d-graphics', 'spline-3d-integration', 'SKILL.md');
    const raw = fs.readFileSync(skillPath, 'utf8');
    const frontmatterMatch = raw.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
    assert.ok(frontmatterMatch);
    const body = raw.slice(frontmatterMatch[0].length);
    fs.writeFileSync(skillPath, [
      '---',
      'name: spline-3d-integration',
      'description: Invalid compact mapping: browser integration',
      'lastReviewed: 2026-05-26',
      '---',
      body,
    ].join('\n'));

    migrateRepository({ repoRoot: root, pluginNames: ['spline-3d-integration'] });
    const pluginRoot = path.join(root, 'plugins', '3d-graphics', 'spline-3d-integration');
    const normalized = normalizedArtifact(path.join(pluginRoot, 'skills', 'spline-3d-integration', 'SKILL.md'));
    assert.equal(normalized.values.description, json(path.join(pluginRoot, 'plugin.json')).description);
    assert.equal(normalized.body, body.replaceAll('\r\n', '\n'));
    assert.deepEqual(json(path.join(pluginRoot, '.mall-metadata.json')).migration.frontmatter_recovery, {
      source: 'plugin.json',
      skills: ['spline-3d-integration'],
    });
  } finally {
    cleanup(root);
  }
});

test('duplicate nested skill manifest is preserved as Mall metadata and not shipped', () => {
  const root = fixtureRepo();
  try {
    const pluginRoot = path.join(root, 'plugins', '3d-graphics', 'spline-3d-integration');
    const upstreamManifest = {
      name: 'spline-3d-integration',
      version: '9.9.9',
      compatibility: ['upstream-runtime'],
    };
    fs.writeFileSync(
      path.join(pluginRoot, 'manifest.json'),
      JSON.stringify(upstreamManifest, null, 2) + '\n',
    );

    migrateRepository({ repoRoot: root, pluginNames: ['spline-3d-integration'] });
    assert.equal(
      fs.existsSync(path.join(pluginRoot, 'skills', 'spline-3d-integration', 'manifest.json')),
      false,
    );
    assert.deepEqual(
      json(path.join(pluginRoot, '.mall-metadata.json')).upstream_skill_manifest,
      upstreamManifest,
    );
  } finally {
    cleanup(root);
  }
});

test('second migration is byte-idempotent', () => {
  const root = fixtureRepo();
  try {
    migrateRepository({ repoRoot: root, pluginNames: selectedNames() });
    const before = snapshot(root);
    const summary = migrateRepository({ repoRoot: root, pluginNames: selectedNames() });
    assert.equal(summary.migrated, 0);
    assert.equal(summary.skipped, 5);
    assert.deepEqual(snapshot(root), before);
  } finally {
    cleanup(root);
  }
});

test('missing declared artifact fails closed', () => {
  const root = fixtureRepo();
  try {
    fs.rmSync(path.join(root, 'plugins', '3d-graphics', 'spline-3d-integration', 'SKILL.md'));
    assert.throws(
      () => migrateRepository({ repoRoot: root, pluginNames: ['spline-3d-integration'] }),
      /declared artifact.*SKILL\.md/i,
    );
  } finally {
    cleanup(root);
  }
});

test('unshippable relative Markdown links become audited inline references', () => {
  const root = fixtureRepo();
  try {
    const skillPath = path.join(root, 'plugins', '3d-graphics', 'spline-3d-integration', 'SKILL.md');
    fs.appendFileSync(
      skillPath,
      '\n[Missing resource](references/missing.md)\n[Context agent](../../architecture-patterns/context-architect/AGENT.md)\n',
    );
    migrateRepository({ repoRoot: root, pluginNames: ['spline-3d-integration'] });
    const pluginRoot = path.join(root, 'plugins', '3d-graphics', 'spline-3d-integration');
    const migrated = fs.readFileSync(
      path.join(pluginRoot, 'skills', 'spline-3d-integration', 'SKILL.md'),
      'utf8',
    );
    assert.match(migrated, /`Missing resource`/);
    assert.match(migrated, /`Context agent`/);
    assert.deepEqual(json(path.join(pluginRoot, '.mall-metadata.json')).link_rewrites, [
      {
        file: 'SKILL.md',
        label: 'Missing resource',
        target: 'references/missing.md',
        reason: 'missing-source',
      },
      {
        file: 'SKILL.md',
        label: 'Context agent',
        target: '../../architecture-patterns/context-architect/AGENT.md',
        reason: 'cross-plugin',
      },
    ]);
  } finally {
    cleanup(root);
  }
});

test('root skill relocation rewrites links between moved and retained files', () => {
  const root = fixtureRepo();
  try {
    const pluginRoot = path.join(root, 'plugins', '3d-graphics', 'spline-3d-integration');
    fs.appendFileSync(path.join(pluginRoot, 'SKILL.md'), '\n[Overview](README.md)\n');
    fs.appendFileSync(path.join(pluginRoot, 'README.md'), '\n[Skill](SKILL.md)\n');

    migrateRepository({ repoRoot: root, pluginNames: ['spline-3d-integration'] });
    const skill = fs.readFileSync(
      path.join(pluginRoot, 'skills', 'spline-3d-integration', 'SKILL.md'),
      'utf8',
    );
    const readme = fs.readFileSync(path.join(pluginRoot, 'README.md'), 'utf8');
    assert.match(skill, /\[Overview\]\(\.\.\/\.\.\/README\.md\)/);
    assert.match(readme, /\[Skill\]\(skills\/spline-3d-integration\/SKILL\.md\)/);
    assert.deepEqual(
      json(path.join(pluginRoot, '.mall-metadata.json')).relocation_link_rewrites,
      [
        { file: 'README.md', from: 'SKILL.md', to: 'skills/spline-3d-integration/SKILL.md' },
        { file: 'SKILL.md', from: 'README.md', to: '../../README.md' },
      ],
    );
  } finally {
    cleanup(root);
  }
});
