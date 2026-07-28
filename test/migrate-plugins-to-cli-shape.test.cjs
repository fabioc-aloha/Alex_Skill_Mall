'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

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
  const values = {};
  for (const line of match[1].split('\n')) {
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
