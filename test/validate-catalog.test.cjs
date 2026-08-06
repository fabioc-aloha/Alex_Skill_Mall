'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { validateCatalog } = require('../scripts/validate-catalog.cjs');
const REPO_ROOT = path.resolve(__dirname, '..');

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + '\n');
}

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'mall-validator-'));
  const stores = [
    { name: 'plugin-mall', remote: 'https://example.invalid/mall.git', pluginDir: 'plugins', quality: 'first-party', provenance: true },
    { name: 'upstream', remote: 'https://example.invalid/upstream.git', pluginDir: '.', quality: 'community', provenance: false },
  ];
  writeJson(path.join(root, 'sources', 'supported-stores.json'), { schema_version: '2.0', stores });
  for (const store of stores) {
    writeJson(path.join(root, 'catalog', 'stores', `${store.name}.json`), {
      store: store.name,
      scanned_ref: 'a'.repeat(40),
      plugin_count: 1,
      store_trust: { score: store.provenance ? 82 : 35 },
      plugins: [{
        name: `${store.name}-skill`,
        source_url: `https://example.invalid/tree/${'a'.repeat(40)}/${store.name}-skill`,
        trust_score: store.provenance ? 82 : 45,
        trust_signals: { store: store.provenance ? 82 : 35, frontmatter: 5, readme: 5, store_breakdown: { provenance: store.provenance ? 50 : 0 } },
      }],
    });
    fs.mkdirSync(path.join(root, 'catalog', 'stores'), { recursive: true });
    fs.writeFileSync(path.join(root, 'catalog', 'stores', `${store.name}.md`), `# ${store.name}\n`);
  }
  writeJson(path.join(root, 'catalog', 'index.json'), {
    schema_version: '3.0', store_count: 2, plugin_count: 2,
    plugins: stores.map((store) => ({
      name: `${store.name}-skill`, store: store.name,
      trust_score: store.provenance ? 82 : 45,
      installable: !store.reference_only,
    })),
  });
  fs.mkdirSync(path.join(root, 'sources'), { recursive: true });
  fs.writeFileSync(path.join(root, 'sources', 'SOURCES.md'), '# Sources\n');
  writeJson(path.join(root, 'plugins', 'test-category', 'curated-skill', 'plugin.json'), {
    name: 'curated-skill',
    version: '1.0.0',
    description: 'Curated fixture skill.',
    author: { name: 'Fixture' },
  });
  writeJson(path.join(root, 'plugins', 'test-category', 'curated-skill', '.mall-metadata.json'), {
    source: { store: 'fixture' },
  });
  writeJson(path.join(root, 'plugins', 'test-category', 'legacy-unmigrated', 'plugin.json'), {
    name: 'legacy-unmigrated',
    version: '1.0.0',
    description: 'Not migrated yet.',
    author: 'legacy-author',
  });
  writeJson(path.join(root, '.github', 'plugin', 'marketplace.json'), {
    name: 'alex-mall',
    owner: { name: 'fabioc-aloha' },
    plugins: [{
      name: 'curated-skill',
      source: 'plugins/test-category/curated-skill',
      strict: true,
    }],
  });
  return root;
}

function cleanup(root) { fs.rmSync(root, { recursive: true, force: true }); }
function codes(result) { return result.errors.map((entry) => entry.code); }

test('valid generated catalog passes', () => {
  const root = fixture();
  try { assert.equal(validateCatalog(root).ok, true, JSON.stringify(validateCatalog(root))); }
  finally { cleanup(root); }
});

test('duplicate registry names fail', () => {
  const root = fixture();
  try {
    const p = path.join(root, 'sources', 'supported-stores.json');
    const registry = JSON.parse(fs.readFileSync(p, 'utf8'));
    registry.stores[1].name = 'plugin-mall';
    writeJson(p, registry);
    assert.ok(codes(validateCatalog(root)).includes('REGISTRY_NAME_DUPLICATE'));
  } finally { cleanup(root); }
});

test('provenance must identify exactly plugin-mall', () => {
  const root = fixture();
  try {
    const p = path.join(root, 'sources', 'supported-stores.json');
    const registry = JSON.parse(fs.readFileSync(p, 'utf8'));
    registry.stores[1].provenance = true;
    writeJson(p, registry);
    assert.ok(codes(validateCatalog(root)).includes('PROVENANCE_INVALID'));
  } finally { cleanup(root); }
});

test('registry and store JSON sets must agree', () => {
  const root = fixture();
  try {
    fs.rmSync(path.join(root, 'catalog', 'stores', 'upstream.json'));
    assert.ok(codes(validateCatalog(root)).includes('STORE_SET_MISMATCH'));
  } finally { cleanup(root); }
});

test('index counts must reconcile with store JSON', () => {
  const root = fixture();
  try {
    const p = path.join(root, 'catalog', 'index.json');
    const index = JSON.parse(fs.readFileSync(p, 'utf8'));
    index.plugin_count = 99;
    writeJson(p, index);
    assert.ok(codes(validateCatalog(root)).includes('PLUGIN_COUNT_MISMATCH'));
  } finally { cleanup(root); }
});

test('marketplace is mandatory', () => {
  const root = fixture();
  try {
    fs.rmSync(path.join(root, '.github', 'plugin', 'marketplace.json'));
    assert.ok(codes(validateCatalog(root)).includes('MARKETPLACE_MISSING'));
  } finally { cleanup(root); }
});

test('store count, names, and refs must be publication-safe', () => {
  const root = fixture();
  try {
    const p = path.join(root, 'catalog', 'stores', 'upstream.json');
    const store = JSON.parse(fs.readFileSync(p, 'utf8'));
    store.plugin_count = 99;
    store.refs_error = 'broken';
    store.scanned_ref = 'main';
    store.plugins.push({ ...store.plugins[0] });
    store.plugins[0].source_url = 'https://example.invalid/tree/main/skill';
    writeJson(p, store);
    const found = codes(validateCatalog(root));
    for (const code of [
      'STORE_PLUGIN_COUNT_MISMATCH', 'STORE_REFS_ERROR', 'STORE_REF_INVALID',
      'STORE_PLUGIN_DUPLICATE', 'PLUGIN_SOURCE_REF_INVALID',
    ]) assert.ok(found.includes(code), code);
  } finally { cleanup(root); }
});

test('plugin source URLs are mandatory', () => {
  const root = fixture();
  try {
    const p = path.join(root, 'catalog', 'stores', 'upstream.json');
    const store = JSON.parse(fs.readFileSync(p, 'utf8'));
    delete store.plugins[0].source_url;
    writeJson(p, store);
    assert.ok(codes(validateCatalog(root)).includes('PLUGIN_SOURCE_URL_MISSING'));
  } finally { cleanup(root); }
});

test('index installability must match reference-only registry state', () => {
  const root = fixture();
  try {
    const registryPath = path.join(root, 'sources', 'supported-stores.json');
    const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
    registry.stores[1].reference_only = true;
    writeJson(registryPath, registry);
    assert.ok(codes(validateCatalog(root)).includes('PLUGIN_INSTALLABILITY_INVALID'));
  } finally { cleanup(root); }
});

test('every store requires rendered markdown', () => {
  const root = fixture();
  try {
    fs.rmSync(path.join(root, 'catalog', 'stores', 'upstream.md'));
    assert.ok(codes(validateCatalog(root)).includes('STORE_MARKDOWN_MISSING'));
  } finally { cleanup(root); }
});

test('trust scores and signals are bounded and present', () => {
  const root = fixture();
  try {
    const p = path.join(root, 'catalog', 'stores', 'upstream.json');
    const store = JSON.parse(fs.readFileSync(p, 'utf8'));
    store.plugins[0].trust_score = 101;
    delete store.plugins[0].trust_signals.readme;
    writeJson(p, store);
    const result = validateCatalog(root);
    assert.ok(codes(result).includes('TRUST_SCORE_INVALID'));
    assert.ok(codes(result).includes('TRUST_SIGNALS_MISSING'));
  } finally { cleanup(root); }
});

test('marketplace entries must reconcile exactly with curated plugin folders', () => {
  const root = fixture();
  try {
    const marketplacePath = path.join(root, '.github', 'plugin', 'marketplace.json');
    const marketplace = JSON.parse(fs.readFileSync(marketplacePath, 'utf8'));
    marketplace.plugins = [];
    writeJson(marketplacePath, marketplace);
    assert.ok(codes(validateCatalog(root)).includes('MARKETPLACE_CURATED_SET_MISMATCH'));
  } finally { cleanup(root); }
});

test('marketplace sources must stay inside the curated plugins tree', () => {
  const root = fixture();
  try {
    const marketplacePath = path.join(root, '.github', 'plugin', 'marketplace.json');
    const marketplace = JSON.parse(fs.readFileSync(marketplacePath, 'utf8'));
    marketplace.plugins[0].source = 'catalog/stores/upstream';
    writeJson(marketplacePath, marketplace);
    assert.ok(codes(validateCatalog(root)).includes('MARKETPLACE_SOURCE_INVALID'));
  } finally { cleanup(root); }
});

test('workflow runs tests and validation before immediate merge', () => {
  const workflow = fs.readFileSync(path.join(REPO_ROOT, '.github', 'workflows', 'scan-sources.yml'), 'utf8');
  const testIndex = workflow.indexOf('run: npm test');
  const validateIndex = workflow.indexOf('run: npm run validate');
  const mergeIndex = workflow.indexOf('gh pr merge');
  assert.ok(testIndex >= 0, 'workflow must run npm test');
  assert.ok(validateIndex > testIndex, 'validation must run after tests');
  assert.ok(mergeIndex > validateIndex, 'merge must occur only after tests and validation');
});
