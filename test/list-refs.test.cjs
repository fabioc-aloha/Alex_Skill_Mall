'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { execFileSync } = require('node:child_process');
const { discoverStoreRefs } = require('../scripts/list-refs.cjs');

test('valid branch metacharacters remain Git data and never reach a shell', (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'mall-ref-safety-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  execFileSync('git', ['init'], { cwd: root, stdio: 'ignore' });
  execFileSync('git', ['config', 'user.email', 'audit@example.invalid'], { cwd: root });
  execFileSync('git', ['config', 'user.name', 'Audit'], { cwd: root });
  fs.writeFileSync(path.join(root, 'README.md'), '# Fixture\n');
  execFileSync('git', ['add', 'README.md'], { cwd: root });
  execFileSync('git', ['commit', '-m', 'fixture'], { cwd: root, stdio: 'ignore' });
  execFileSync('git', ['branch', '-m', 'main;whoami'], { cwd: root });
  const parent = path.dirname(root);
  const name = path.basename(root);
  const result = discoverStoreRefs('fixture', { local_dir_name: name, name: 'fixture' }, parent);
  assert.equal(result.error, undefined);
  assert.equal(result.defaultBranch, 'main;whoami');
  assert.match(result.defaultSha, /^[0-9a-f]{40}$/);
});
