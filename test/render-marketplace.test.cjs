'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const POST = path.join(ROOT, 'test', 'fixtures', 'post-migration');
const FIXTURES = new Map([
  ['spline-3d-integration', '3d-graphics'],
  ['context-architect', 'architecture-patterns'],
  ['visual-storytelling', 'data-analytics'],
  ['flint-chart-plugin', 'data-analytics'],
  ['md-to-pdf', 'converters'],
]);
const TOP_LEVEL_FIELDS = new Set(['name', 'owner', 'metadata', 'plugins']);
const ENTRY_FIELDS = new Set(['name', 'description', 'version', 'source', 'strict']);

function createFixtureRepo() {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'mall-render-'));
  for (const [name, category] of FIXTURES) {
    const target = path.join(repoRoot, 'plugins', category, name);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.cpSync(path.join(POST, name), target, { recursive: true });
  }
  const external = path.join(repoRoot, 'catalog');
  fs.mkdirSync(external, { recursive: true });
  fs.writeFileSync(path.join(external, 'index.json'), JSON.stringify({
    plugin_count: 1,
    plugins: [{ name: 'must-not-leak', source_url: 'https://example.invalid/plugin' }],
  }));
  return repoRoot;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

test('renderer emits deterministic strict curated-only marketplace output', (t) => {
  const repoRoot = createFixtureRepo();
  t.after(() => fs.rmSync(repoRoot, { recursive: true, force: true }));
  const { renderMarketplace } = require('../scripts/render-marketplace.cjs');

  const first = renderMarketplace({ repoRoot });
  const outputPath = path.join(repoRoot, '.github', 'plugin', 'marketplace.json');
  const firstBytes = fs.readFileSync(outputPath);
  const marketplace = readJson(outputPath);
  const second = renderMarketplace({ repoRoot });

  assert.equal(first.count, FIXTURES.size);
  assert.equal(second.count, FIXTURES.size);
  assert.deepEqual(fs.readFileSync(outputPath), firstBytes);
  assert.deepEqual(Object.keys(marketplace).filter((key) => !TOP_LEVEL_FIELDS.has(key)), []);
  assert.equal(marketplace.name, 'alex-mall');
  assert.deepEqual(marketplace.owner, { name: 'fabioc-aloha' });
  assert.deepEqual(marketplace.metadata, {
    description: 'Alex ACT Plugin Mall curated local plugins',
    version: '3.0.0',
  });
  assert.deepEqual(
    marketplace.plugins.map((plugin) => plugin.name),
    [...FIXTURES.keys()].sort(),
  );
  assert.equal(marketplace.plugins.some((plugin) => plugin.name === 'must-not-leak'), false);

  for (const plugin of marketplace.plugins) {
    assert.deepEqual(Object.keys(plugin).filter((key) => !ENTRY_FIELDS.has(key)), []);
    assert.equal(plugin.strict, true);
    assert.equal(typeof plugin.description, 'string');
    assert.equal(typeof plugin.version, 'string');
    assert.match(plugin.source, /^plugins\/[a-z0-9-]+\/[a-z0-9-]+$/);
    assert.equal(fs.existsSync(path.join(repoRoot, ...plugin.source.split('/'), 'plugin.json')), true);
  }
});

test('renderer fails closed on a legacy string author', (t) => {
  const repoRoot = createFixtureRepo();
  t.after(() => fs.rmSync(repoRoot, { recursive: true, force: true }));
  const { renderMarketplace } = require('../scripts/render-marketplace.cjs');
  const manifestPath = path.join(repoRoot, 'plugins', 'converters', 'md-to-pdf', 'plugin.json');
  const manifest = readJson(manifestPath);
  manifest.author = 'legacy-author';
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

  assert.throws(
    () => renderMarketplace({ repoRoot }),
    /md-to-pdf: author must be an object with a non-empty name/,
  );
  assert.equal(fs.existsSync(path.join(repoRoot, '.github', 'plugin', 'marketplace.json')), false);
});

test('renderer fails closed on duplicate manifest names', (t) => {
  const repoRoot = createFixtureRepo();
  t.after(() => fs.rmSync(repoRoot, { recursive: true, force: true }));
  const { renderMarketplace } = require('../scripts/render-marketplace.cjs');
  const manifestPath = path.join(repoRoot, 'plugins', 'converters', 'md-to-pdf', 'plugin.json');
  const manifest = readJson(manifestPath);
  manifest.name = 'context-architect';
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

  assert.throws(() => renderMarketplace({ repoRoot }), /manifest name must match folder name/);
  assert.equal(fs.existsSync(path.join(repoRoot, '.github', 'plugin', 'marketplace.json')), false);
});