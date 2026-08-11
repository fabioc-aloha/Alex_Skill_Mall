'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

test('mixed component plugins are not mislabeled as skill-only', (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'mall-scan-shape-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, 'skills', 'sample'), { recursive: true });
  fs.mkdirSync(path.join(root, 'agents'), { recursive: true });
  fs.writeFileSync(path.join(root, 'skills', 'sample', 'SKILL.md'), '# skill\n');
  fs.writeFileSync(path.join(root, 'agents', 'sample.agent.md'), '# agent\n');
  fs.writeFileSync(path.join(root, 'plugin.json'), JSON.stringify({ name: 'sample' }));

  const { classifyFrontmatter, inferShape } = require('../scripts/scan-sources.cjs');
  assert.equal(inferShape(root, classifyFrontmatter(root)), 'mixed');
});

test('skill frontmatter preserves folded descriptions and nested metadata', (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'mall-scan-yaml-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(root, 'SKILL.md'), `---
name: data-manager-api-audience-ingestion
description: >-
  Guides developers through managing audience members using
  the Data Manager API. Use when uploading an audience.
metadata:
  version: 1.1
  category: GoogleAds
---

# Data Manager API Audience Ingestion
`);

  const { classifyFrontmatter } = require('../scripts/scan-sources.cjs');
  const frontmatter = classifyFrontmatter(root);
  assert.equal(frontmatter.kind, 'skill-md');
  assert.equal(frontmatter.raw.description,
    'Guides developers through managing audience members using the Data Manager API. Use when uploading an audience.');
  assert.deepEqual(frontmatter.raw.metadata, { version: 1.1, category: 'GoogleAds' });
});

test('skill frontmatter parses Windows CRLF without a dangling carriage return', (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'mall-scan-crlf-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const source = [
    '---',
    'name: text-to-speech',
    'description: Convert text to speech. Use when generating voiceovers.',
    'metadata: {"provider": "ElevenLabs"}',
    '---',
    '',
    '# Text to Speech',
    '',
  ].join('\r\n');
  fs.writeFileSync(path.join(root, 'SKILL.md'), source);

  const { classifyFrontmatter } = require('../scripts/scan-sources.cjs');
  const frontmatter = classifyFrontmatter(root);
  assert.equal(frontmatter.kind, 'skill-md');
  assert.equal(frontmatter.raw.description,
    'Convert text to speech. Use when generating voiceovers.');
  assert.deepEqual(frontmatter.raw.metadata, { provider: 'ElevenLabs' });
});

test('scan dedup prefers production plugins over skills and testing copies', () => {
  const { dedupeCandidates } = require('../scripts/scan-sources.cjs');
  const selected = dedupeCandidates([
    { name: 'sample', relPath: 'skills/sample', absPath: 'skills' },
    { name: 'sample', relPath: 'testing/plugins/sample', absPath: 'testing' },
    { name: 'sample', relPath: 'plugins/sample', absPath: 'plugins' },
  ]);
  assert.deepEqual(selected.map((candidate) => candidate.relPath), ['plugins/sample']);
});

test('snapshot reconciliation uses the same production precedence', () => {
  const { dedupePlugins } = require('../scripts/reconcile-catalog-snapshots.cjs');
  const selected = dedupePlugins([
    { name: 'sample', source_path: 'skills/sample' },
    { name: 'sample', source_path: 'testing/plugins/sample' },
    { name: 'sample', source_path: 'plugins/sample' },
  ]);
  assert.deepEqual(selected.map((plugin) => plugin.source_path), ['plugins/sample']);
});