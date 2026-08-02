'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

function write(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

function writeJson(filePath, value) {
  write(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function createSourcePlugin() {
  const source = fs.mkdtempSync(path.join(os.tmpdir(), 'mall-source-plugin-'));
  writeJson(path.join(source, 'plugin.json'), {
    name: 'fixture-plugin',
    version: '1.2.3',
    description: 'Fixture plugin used to verify the publication pipeline.',
    author: { name: 'Fixture Author' },
    license: 'MIT',
    skills: '.github/skills',
    agents: '.github/agents',
    commands: '.github/prompts',
  });
  write(path.join(source, 'README.md'), '# Fixture Plugin\n\nA tested fixture plugin.\n');
  write(path.join(source, '.github', 'skills', 'fixture-skill', 'SKILL.md'), [
    '---',
    'name: fixture-skill',
    'description: "Runs the fixture workflow. Use when testing Mall publication."',
    'lastReviewed: 2026-08-01',
    '---',
    '',
    '# Fixture Skill',
    '',
    '[`Source instruction`](../../instructions/not-vendored.instructions.md)',
    '',
  ].join('\n'));
  write(path.join(source, '.github', 'prompts', 'fixture.prompt.md'), [
    '---',
    'description: "Run the fixture workflow."',
    '---',
    '',
    '# /fixture',
    '',
  ].join('\n'));
  writeJson(path.join(source, '.github', 'config', 'fixture.json'), { enabled: true });
  return source;
}

function createMallRoot() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'mall-publish-'));
  fs.mkdirSync(path.join(root, 'plugins'), { recursive: true });
  return root;
}

test('packagePlugin normalizes a source plugin into the curated Mall shape', (t) => {
  const sourceRoot = createSourcePlugin();
  const repoRoot = createMallRoot();
  t.after(() => fs.rmSync(sourceRoot, { recursive: true, force: true }));
  t.after(() => fs.rmSync(repoRoot, { recursive: true, force: true }));
  const { packagePlugin, validatePluginDirectory } = require('../scripts/lib/plugin-package.cjs');

  const result = packagePlugin({
    repoRoot,
    sourceRoot,
    category: 'productivity',
    repository: 'https://github.com/example/fixture-plugin',
    ref: 'v1.2.3',
    submittedBy: 'fixture-user',
    evidence: 'Used in a real fixture workflow.',
    includes: [{ source: '.github/config', target: 'config' }],
    apply: true,
  });

  const target = path.join(repoRoot, 'plugins', 'productivity', 'fixture-plugin');
  const manifest = JSON.parse(fs.readFileSync(path.join(target, 'plugin.json'), 'utf8'));
  const metadata = JSON.parse(fs.readFileSync(path.join(target, '.mall-metadata.json'), 'utf8'));
  assert.equal(result.target, target);
  assert.equal(manifest.skills, 'skills/');
  assert.equal(manifest.commands, 'commands/');
  assert.equal(fs.existsSync(path.join(target, 'skills', 'fixture-skill', 'SKILL.md')), true);
  assert.equal(fs.existsSync(path.join(target, 'commands', 'fixture.md')), true);
  assert.equal(fs.existsSync(path.join(target, 'config', 'fixture.json')), true);
  assert.equal(metadata.upstream.repo, 'https://github.com/example/fixture-plugin');
  assert.equal(metadata.upstream.ref, 'v1.2.3');
  assert.equal(metadata.submission.submitted_by, 'fixture-user');
  assert.equal(metadata.link_rewrites.length, 1);
  assert.match(
    fs.readFileSync(path.join(target, 'skills', 'fixture-skill', 'SKILL.md'), 'utf8'),
    /`Source instruction`/,
  );
  assert.equal(validatePluginDirectory(target).ok, true);
});

test('packagePlugin defaults to dry-run and does not write the destination', (t) => {
  const sourceRoot = createSourcePlugin();
  const repoRoot = createMallRoot();
  t.after(() => fs.rmSync(sourceRoot, { recursive: true, force: true }));
  t.after(() => fs.rmSync(repoRoot, { recursive: true, force: true }));
  const { packagePlugin } = require('../scripts/lib/plugin-package.cjs');

  const result = packagePlugin({
    repoRoot,
    sourceRoot,
    category: 'productivity',
    repository: 'https://github.com/example/fixture-plugin',
    ref: 'v1.2.3',
  });

  assert.equal(result.applied, false);
  assert.equal(fs.existsSync(path.join(repoRoot, 'plugins', 'productivity', 'fixture-plugin')), false);
});

test('replacement fails closed when existing bundled resources are omitted', (t) => {
  const sourceRoot = createSourcePlugin();
  const repoRoot = createMallRoot();
  t.after(() => fs.rmSync(sourceRoot, { recursive: true, force: true }));
  t.after(() => fs.rmSync(repoRoot, { recursive: true, force: true }));
  const { packagePlugin } = require('../scripts/lib/plugin-package.cjs');

  packagePlugin({
    repoRoot,
    sourceRoot,
    category: 'productivity',
    repository: 'https://github.com/example/fixture-plugin',
    ref: 'v1.2.3',
    includes: [{ source: '.github/config', target: 'config' }],
    apply: true,
  });

  assert.throws(() => packagePlugin({
    repoRoot,
    sourceRoot,
    category: 'productivity',
    repository: 'https://github.com/example/fixture-plugin',
    ref: 'v1.2.4',
    replace: true,
  }), /existing bundled resources require explicit --include mappings/);
});

test('submission validation rejects secrets and payloads above 100 files', (t) => {
  const sourceRoot = createSourcePlugin();
  const repoRoot = createMallRoot();
  t.after(() => fs.rmSync(sourceRoot, { recursive: true, force: true }));
  t.after(() => fs.rmSync(repoRoot, { recursive: true, force: true }));
  const { packagePlugin, validatePluginDirectory } = require('../scripts/lib/plugin-package.cjs');
  packagePlugin({
    repoRoot,
    sourceRoot,
    category: 'productivity',
    repository: 'https://github.com/example/fixture-plugin',
    ref: 'v1.2.3',
    apply: true,
  });
  const target = path.join(repoRoot, 'plugins', 'productivity', 'fixture-plugin');
  write(path.join(target, '.env'), 'TOKEN=not-a-real-secret\n');
  fs.appendFileSync(path.join(target, 'skills', 'fixture-skill', 'SKILL.md'), '\n[Missing](missing.md)\n');
  for (let index = 0; index < 100; index++) {
    write(path.join(target, 'skills', 'fixture-skill', 'resources', `${index}.txt`), 'x\n');
  }

  const result = validatePluginDirectory(target);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.code === 'FORBIDDEN_FILE'));
  assert.ok(result.errors.some((error) => error.code === 'FILE_LIMIT_EXCEEDED'));
  assert.ok(result.errors.some((error) => error.code === 'MARKDOWN_LINK_INVALID'));
});

test('maintainer curated plan refreshes first-party state before rendering and checks', () => {
  const { buildPlan } = require('../scripts/maintain-mall.cjs');
  assert.deepEqual(buildPlan('curated'), [
    ['node', ['scripts/scan-sources.cjs', '--store', 'plugin-mall']],
    ['node', ['scripts/normalize-frontmatter.cjs', '--store', 'plugin-mall']],
    ['node', ['scripts/list-refs.cjs', '--store', 'plugin-mall']],
    ['node', ['scripts/compute-trust.cjs']],
    ['node', ['scripts/render-marketplace.cjs']],
    ['node', ['scripts/render-catalog.cjs']],
    ['npm', ['test']],
    ['npm', ['run', 'validate']],
  ]);
});

test('maintenance CLI help is side-effect free and npm runs through Node', () => {
  const { parseMode, resolveNpmInvocation } = require('../scripts/maintain-mall.cjs');
  assert.deepEqual(parseMode(['--help']), { help: true, mode: null });
  assert.deepEqual(parseMode(['--check']), { help: false, mode: 'check' });
  assert.deepEqual(
    resolveNpmInvocation(['test'], {
      npmExecPath: 'C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js',
      nodeExecPath: 'C:/Program Files/nodejs/node.exe',
      fileExists: () => true,
    }),
    {
      executable: 'C:/Program Files/nodejs/node.exe',
      args: ['C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js', 'test'],
    },
  );
});

test('package scripts expose maintainer and contributor commands', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  assert.equal(pkg.scripts.vendor, 'node scripts/vendor-plugin.cjs');
  assert.equal(pkg.scripts.maintain, 'node scripts/maintain-mall.cjs');
  assert.equal(pkg.scripts['admin:configure-approval'], 'node scripts/configure-approval-gate.cjs');
  assert.equal(pkg.scripts['submit:prepare'], 'node scripts/prepare-plugin-submission.cjs');
  assert.equal(pkg.scripts['submit:validate'], 'node scripts/validate-plugin-submission.cjs');
});

test('admin approval payload requires the plugin check and CODEOWNER review', () => {
  const { protectionPayload } = require('../scripts/configure-approval-gate.cjs');
  const payload = protectionPayload();
  assert.deepEqual(payload.required_status_checks.contexts, ['Validate proposed plugins']);
  assert.equal(payload.enforce_admins, false);
  assert.equal(payload.required_pull_request_reviews.require_code_owner_reviews, true);
  assert.equal(payload.required_pull_request_reviews.required_approving_review_count, 0);
  assert.equal(payload.required_pull_request_reviews.require_last_push_approval, false);
  assert.equal(payload.restrictions, null);
  assert.equal(Object.hasOwn(payload.required_pull_request_reviews, 'dismissal_restrictions'), false);
  assert.equal(payload.required_conversation_resolution, true);
});

test('contributor PR workflow validates without auto-merging', () => {
  const workflow = fs.readFileSync(path.join(ROOT, '.github', 'workflows', 'validate-plugin-pr.yml'), 'utf8');
  const codeowners = fs.readFileSync(path.join(ROOT, '.github', 'CODEOWNERS'), 'utf8');
  assert.match(workflow, /submit:validate/);
  assert.doesNotMatch(workflow, /pull_request:\s*\n\s+paths:/);
  assert.match(workflow, /npm install --ignore-scripts/);
  assert.doesNotMatch(workflow, /npm ci|cache: npm/);
  assert.match(workflow, /npm test/);
  assert.match(workflow, /npm run validate/);
  assert.doesNotMatch(workflow, /gh pr merge|--auto/);
  assert.match(codeowners, /\/plugins\/\s+@fabioc-aloha/);
  const scanWorkflow = fs.readFileSync(path.join(ROOT, '.github', 'workflows', 'scan-sources.yml'), 'utf8');
  const installIndex = scanWorkflow.indexOf('npm install --ignore-scripts');
  const bootstrapIndex = scanWorkflow.indexOf('node scripts/bootstrap-sources.cjs');
  assert.ok(installIndex >= 0, 'scan workflow must install declared dependencies');
  assert.ok(installIndex < bootstrapIndex, 'dependency installation must precede Mall scripts');
  assert.match(scanWorkflow, /statuses: write/);
  assert.match(scanWorkflow, /statuses\/\$HEAD_SHA/);
  assert.match(scanWorkflow, /context="Validate proposed plugins"/);
  assert.match(scanWorkflow, /gh pr merge[^\n]+--auto/);
});

test('generated storefront advertises canonical admin and contributor flows', () => {
  const renderer = fs.readFileSync(path.join(ROOT, 'scripts', 'render-catalog.cjs'), 'utf8');
  const storefront = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
  for (const content of [renderer, storefront]) {
    assert.match(content, /Maintainer operations/);
    assert.match(content, /Publish a plugin/);
    assert.match(content, /Start with Alex ACT Core/);
    assert.match(content, /alex-act-core@alex-mall/);
    assert.match(content, /alex-act-illustrator-plugin@alex-mall/);
    assert.match(content, /alex-act-enterprise@alex-mall/);
    assert.match(content, /\/alex-act-core install-constellation/);
    assert.match(content, /alex-act-msft.*is private/);
    assert.match(content, /npm install --ignore-scripts/);
    assert.match(content, /npm run vendor/);
    assert.match(content, /npm run submit:prepare/);
    assert.match(content, /branch protection/);
    assert.doesNotMatch(content, /flint-chart-plugin@alex-mall/);
  }
  assert.doesNotMatch(renderer, /lines\.push\('npm ci'\)/);
});
