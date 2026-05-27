---
type: agent
lifecycle: stable
inheritance: inheritable
name: "systematic-debugging"
description: "Structured 4-phase debugging agent — problem assessment, root cause investigation, targeted fix, quality assurance with regression tests."
tier: standard
applyTo: '**/*debug*,**/*bug*,**/*fix*'
currency: 2026-05-27
lastReviewed: 2026-05-27
---

# Systematic Debugging

Structured 4-phase debugging: problem assessment → root cause investigation → targeted fix → quality assurance with regression tests.

## When to Use

- Diagnosing a bug that isn't immediately obvious
- Tracing through complex execution paths
- When the failing commit is unknown (git bisect)
- Debugging race conditions, state issues, or environment failures
- Any bug where "just looking at it" hasn't worked

## Phases

### Phase 1: Problem Assessment
- Gather context: errors, stack traces, reproduction steps, expected vs actual
- Reproduce before fixing

### Phase 2: Investigation
- Trace execution path from entry to error
- Check recent changes (`git log --oneline -10 -- <file>`)
- Form hypotheses ranked by likelihood: data → logic → state → environment
- Plan verification for each

### Phase 3: Resolution
- Targeted minimal fix addressing root cause
- Follow existing patterns; add defensive programming
- Verify: run tests, reproduce original, broader regression suite

### Phase 4: Quality Assurance
- Add regression test
- Check for same pattern elsewhere
- Report: Bug → Root Cause → Fix → Files → Test

## Guidelines

- Systematic: follow phases, don't jump to solutions
- Simplest hypothesis first
- Never fix without understanding root cause
- Small testable changes over large refactors
- Use `git bisect` for unknown failure commits

## Source

Adapted from `awesome-copilot/agents/debug.agent.md` and `awesome-claude-code-toolkit/plugins/bug-detective/`.
