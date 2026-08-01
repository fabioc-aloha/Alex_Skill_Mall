#!/usr/bin/env node
'use strict';

const { spawnSync } = require('node:child_process');
const { parseArgs } = require('./lib/plugin-package.cjs');

function protectionPayload() {
  return {
    required_status_checks: {
      strict: true,
      contexts: ['Validate proposed plugins'],
    },
    enforce_admins: false,
    required_pull_request_reviews: {
      dismiss_stale_reviews: true,
      require_code_owner_reviews: true,
      required_approving_review_count: 0,
      require_last_push_approval: false,
    },
    restrictions: null,
    required_linear_history: false,
    allow_force_pushes: false,
    allow_deletions: false,
    block_creations: false,
    required_conversation_resolution: true,
    lock_branch: false,
    allow_fork_syncing: true,
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const repository = args.repository || 'fabioc-aloha/Alex_Skill_Mall';
  const branch = args.branch || 'main';
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository)) {
    throw new Error('--repository must use owner/repo format');
  }
  if (!/^[A-Za-z0-9._/-]+$/.test(branch)) throw new Error('invalid --branch');
  const endpoint = `repos/${repository}/branches/${encodeURIComponent(branch)}/protection`;
  const payload = protectionPayload();
  console.log(JSON.stringify({ endpoint, apply: args.apply === true, payload }, null, 2));
  if (!args.apply) {
    console.log('Dry-run only. Re-run with --apply after reviewing the payload.');
    return;
  }
  const result = spawnSync('gh', ['api', '--method', 'PUT', endpoint, '--input', '-'], {
    input: JSON.stringify(payload),
    encoding: 'utf8',
    shell: false,
  });
  if (result.status !== 0) {
    const details = [result.stderr, result.stdout].map((value) => value.trim()).filter(Boolean).join('\n');
    throw new Error(details || 'gh api branch protection update failed');
  }
  console.log('Branch protection applied. Contributor PRs now require the validation check and CODEOWNER approval.');
}

if (require.main === module) {
  try { main(); }
  catch (error) { console.error(`ERROR: ${error.message}`); process.exitCode = 1; }
}

module.exports = { protectionPayload };
