'use strict';

function buildCloneArgs(remote, target, depth) {
  const args = ['-c', 'core.longpaths=true', 'clone'];
  if (depth > 0) args.push('--depth', String(depth));
  args.push(remote, target);
  return args;
}

function buildTagFetchArgs(target) {
  return [
    '-c', 'core.longpaths=true',
    '-C', target,
    'fetch', '--tags', '--depth=1', '--quiet',
  ];
}

module.exports = { buildCloneArgs, buildTagFetchArgs };
