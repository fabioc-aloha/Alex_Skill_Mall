---
name: "meditation"
description: "Consolidate session learning into permanent architecture — extract patterns into skills, instructions, prompts, or memory"
lastReviewed: 2026-05-13
---

# Meditation

Transform session insights into durable knowledge. Most sessions don't need it; some have a pattern worth keeping.

## When to Fire

- User says "let's meditate", "consolidate", or invokes `/meditate`
- End of a significant work session
- After solving a hard problem with a reusable insight
- Before a long break from a project

**Skip when**: the session was routine execution of patterns already encoded. Meditation on every session produces noise; the discipline is to write only what's new and portable.

## The Five Steps

### 1. Review

Scan the session honestly:

- What problems did we solve?
- What mistakes did we make?
- What patterns emerged that weren't already encoded?
- What would help future sessions?

### 2. Extract

Separate signal from noise. For each candidate pattern, ask: *"Is this already covered by an existing skill, instruction, or memory?"* If yes, skip. If no, route by type:

| If pattern is... | Create / update |
|---|---|
| Reusable domain knowledge | Skill (`.github/skills/<name>/SKILL.md`) |
| Always-on behavior or rule | Instruction (`.github/instructions/<name>.instructions.md`) |
| Repeatable workflow / slash command | Prompt (`.github/prompts/<name>.prompt.md`) |
| Automatable mechanical task (skill-owned) | Skill script (`.github/skills/<name>/scripts/*.cjs`) |
| Automatable mechanical task (cross-cutting) | Repo script (`scripts/<name>.cjs`) |
| User preference (cross-project) | User memory (`/memories/<name>.md`) |
| Project / repo convention | Repo memory (`/memories/repo/<name>.md`) |
| Cross-session handoff (next session needs to know) | Repo file (`HANDOFF.md` at repo root) — NOT session memory |

### 3. Write

Each artifact gets correct frontmatter, concrete examples (not abstractions), and tables with real data. Avoid the "capabilities list" anti-pattern — describe behavior, not features.

For skills and instructions: include a **Trigger** or **When to fire** section so future sessions know when the pattern applies.

### 4. Chronicle (optional)

If the session arc was substantial, write to `.github/episodic/meditation-YYYY-MM-DD-<topic>.md`:

```markdown
# Meditation: <Topic>

**Date**: YYYY-MM-DD
**Focus**: What we worked on

## Accomplished
- [Key outcomes]

## Patterns Extracted
- [What became skills / instructions / memory]

## Lessons
- [Insights worth remembering]

## Open Questions
- [What remains unresolved]
```

Skip the chronicle for short sessions or when nothing new emerged.

### 5. Handoff (when ending a session)

If the user is closing the thread, write to repo-root `HANDOFF.md`:

```markdown
# Session Handoff

Last updated: YYYY-MM-DD HH:MM

## Just shipped
- [SHAs / files / outcomes]

## In progress
- [Specific next step + file paths]

## Pending queue
- [ ] [Ordered todos]

## Resume point
- [Where to pick up]
```

## Quality Bar

A meditation is complete when:

- New patterns are persisted, not just acknowledged
- Nothing important lives only in the context window
- Existing artifacts were checked for duplication before writing new ones
- The session can be closed without losing the thread

## Brain Retraining (longer cycles)

The five-step protocol above is per-session. The Supervisor brain also retrains on a longer cadence against two evidence streams:

1. **Mall reality.** New skills, retired stores, and updated patterns in `Alex_ACT_Plugin_Mall` mean Edition's references and bundled trifectas drift. Run `/audit-coherence` and review the Mall catalog for promotion candidates.
2. **Supervisor self-audit.** The `brain-qa` semantic-review queue, ACT-pass markers that came out wrong, and dogfooding friction observed during curation are Supervisor's primary signal on baseline-brain quality. Heirs own their local and Mall-installed skills; baseline-brain bugs surface through Supervisor's own loops, not through an inbound feedback channel.

| Cadence | Action |
| --- | --- |
| Weekly | Walk the `brain-qa` semantic-review queue. Hotfix any `critical` findings same-day. |
| Monthly | `/audit-mall` for staleness, link rot, and new store proposals. `/audit-coherence` for cross-repo drift. |
| Quarterly | Full retraining pass: walk the `brain-qa` semantic-review queue, review every Edition skill against its Mall counterpart, evolve the CT trifecta against accumulated audit signals, retire bundled trifectas that aren't earning their tokens. Lands as an ADR per [docs/templates/quarterly-retraining-ADR.md](../../../docs/templates/quarterly-retraining-ADR.md). |
| Per release | `brain-qa` muscle pass clean (deterministic exit 0), CT instructions intact, changelog reflects retraining outcomes, announcement written to shared memory. |

The `brain-qa` workflow itself is documented in [brain-curation-rules.instructions.md § brain-qa Workflow](../../instructions/brain-curation-rules.instructions.md). Edits to Edition (heir-operational artifacts) originate in Edition; edits to framework / always-on disciplines originate in Supervisor and mirror to Edition. Supervisor self-modification always waits on explicit approval.

Retraining is critical thinking applied to the brain itself. Each cycle treats the current brain as a hypothesis and tests it against evidence from Supervisor's own audit loops and the Mall. Skipping a cycle is the same Cardinal Rule 3 violation as skipping `act-pass`.

### Cardinal Rule 3 audit criteria

When the quarterly pass runs, Cardinal Rule 3 ("apply critical thinking, and evolve it") is being honored if:

- Every Edition release ships with the four CT instructions (`critical-thinking`, `act-pass`, `system-prompt-skepticism`, `problem-framing-audit`) intact and unweakened
- The curation log records at least one CT-trifecta refinement per quarter driven by real evidence
- `brain-qa` passes on the CT files before any release

If a quarter passes with no CT evolution and no evidence that none was needed, that is a flag, not a feature.

## Anti-Patterns

| Anti-pattern | Correction |
|---|---|
| Writing a meditation note for every session | Most sessions are routine execution; only write when something new emerged |
| Duplicating an existing skill / memory under a new name | Always grep first: is this already covered? |
| Aspirational notes ("we should do X someday") | Memory is for what was learned, not what was wished |
| Long prose chronicles when a one-line memory suffices | Match artifact size to insight size |
| Skipping the duplication check to "just capture it" | Adds noise that the next session has to filter |

## Related

- [meditation.instructions.md](../../instructions/meditation.instructions.md) — when this skill fires
- [/meditate prompt](../../prompts/meditate.prompt.md) — slash-command entry
- [memory-triggers.instructions.md](../../instructions/memory-triggers.instructions.md) — automatic triggers between meditations

## Falsifiability

- This skill adds no value if meditation sessions produce no actionable items (skill extractions, pattern recognitions, or architecture insights) over a 90-day window
- The protocol is wrong if chronicles written per this format are never consulted in future sessions
- Stale if the memory tier structure changes and this skill references obsolete storage locations
