'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const retiredPlugin = {
  name: 'withdrawn-plugin',
  shape: 'mixed',
  trust_score: 95,
  source_url: 'https://example.invalid/tree/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/plugins/testing/withdrawn-plugin',
  frontmatter: { standard: { version: '1.0.0', description: 'A withdrawn fixture plugin.' } },
  retirement: {
    state: 'withdrawn',
    message: 'Use the supported successor for new installations.',
    replacement: { name: 'successor-plugin', marketplace: 'alex-mall' },
  },
};

test('catalog renderers preserve withdrawn plugins and show their replacement command', () => {
  const {
    buildIndex,
    renderCategoryMd,
    renderStoreMd,
  } = require('../scripts/render-catalog.cjs');
  const store = {
    store: 'plugin-mall',
    reference_only: false,
    plugin_count: 1,
    plugins: [retiredPlugin],
  };

  const index = buildIndex([store]);
  assert.equal(index.plugins[0].installable, false);
  assert.deepEqual(index.plugins[0].retirement, retiredPlugin.retirement);

  for (const rendered of [
    renderStoreMd(store),
    renderCategoryMd('testing', [retiredPlugin], [store]),
  ]) {
    assert.match(rendered, /withdrawn-plugin/);
    assert.match(rendered, /Use the supported successor/);
    assert.match(rendered, /copilot plugin install successor-plugin@alex-mall/);
  }
});