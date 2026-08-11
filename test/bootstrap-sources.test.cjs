'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const { buildCloneArgs, buildTagFetchArgs } = require('../scripts/lib/source-bootstrap.cjs');

test('source bootstrap enables Windows long paths and preserves clone arguments as data', () => {
  assert.deepEqual(
    buildCloneArgs('https://github.com/example/store.git', 'C:/Temp/source with spaces', 1),
    [
      '-c', 'core.longpaths=true',
      'clone', '--depth', '1',
      'https://github.com/example/store.git',
      'C:/Temp/source with spaces',
    ],
  );
  assert.deepEqual(
    buildCloneArgs('https://github.com/example/store.git;echo unsafe', 'C:/Temp/source', 0),
    [
      '-c', 'core.longpaths=true',
      'clone',
      'https://github.com/example/store.git;echo unsafe',
      'C:/Temp/source',
    ],
  );
});

test('source bootstrap tag fetch is shell-free and long-path aware', () => {
  assert.deepEqual(buildTagFetchArgs('C:/Temp/source with spaces'), [
    '-c', 'core.longpaths=true',
    '-C', 'C:/Temp/source with spaces',
    'fetch', '--tags', '--depth=1', '--quiet',
  ]);
});
