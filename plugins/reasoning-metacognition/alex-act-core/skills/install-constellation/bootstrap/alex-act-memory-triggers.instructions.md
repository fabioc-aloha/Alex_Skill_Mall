---
description: "Automatic memory-formation triggers — detect user corrections, preference statements, session-ending state, significant decisions, and repeated patterns; hand off to memory-management skill for tier selection and writing mechanics"
applyTo: "**"
lastReviewed: 2026-07-31
---

# Memory Triggers

Automatic prompts to form memories. Don't wait to be asked — recognize trigger conditions and hand off to the [memory-management skill](../../memory-management/SKILL.md) for tier selection and writing mechanics.

## Trigger Conditions

| Trigger | Memory Type | Action |
|---------|-------------|--------|
| **User corrects me** | User or Repo | Write what I got wrong + correct approach |
| **Same pattern 3×** | Skill candidate | Propose: "This seems worth capturing as a skill" |
| **Error → fix cycle** | Post-mortem | Write failure analysis to episodic |
| **User states preference** | User memory | Capture preference immediately |
| **Session ending with unfinished or load-bearing state** | **Repo file** (`HANDOFF.md`), **not** session memory | Write/refresh repo-level `HANDOFF.md` so the next session can pick up. See § Cross-Session Continuity below. |
| **Significant decision** | Chronicle | Record in episodic with rationale |
| **New project convention** | Repo memory | Write to `/memories/repo/` |

## Trigger Detection

### User Correction

Phrases that indicate correction:

- "No, I meant..."
- "That's not right"
- "Actually..."
- "Not what I asked for"
- "Try again"

**Response**: Acknowledge, understand the gap, hand off to the memory-management skill if the correction reveals a pattern.

### Pattern Recognition

Track mentally:

- Have I done this before this session?
- Did I do this in a previous session (check episodic)?
- Is this generalizable beyond this specific case?

**At 3× threshold**: "I've applied this pattern multiple times. Worth capturing as a skill?"

### Preference Detection

User statements that encode preferences:

- "I prefer..."
- "Always do X"
- "Don't do Y"
- "I like when you..."
- Consistent behavior corrections

**Response**: Acknowledge and persist immediately to user memory via the memory-management skill.

### Time Awareness

After extended work with state the next session must recover:

- Many tool calls
- Multiple files touched
- Complex reasoning chains

**Action**: Write or refresh `HANDOFF.md` when the session is ending or continuity is at risk. Do not interrupt active flow merely because a time threshold passed.

## Cross-Session Continuity — handoffs go to repo files, not session memory

The natural phrase "session handoff" reads like exactly what `/memories/session/` is for. It is not. The tier that carries handoff content is the **repo-root `HANDOFF.md` file**, because session memory clears at conversation end by design. The [memory-management skill](../../memory-management/SKILL.md) carries the tier-selection detail and templates; the rule this instruction owns is *"reach for the repo file first, not `/memories/session/`, when the user asks for a session handoff."*

## Anti-Patterns

| Don't | Do Instead |
|-------|------------|
| Write every observation | Filter for patterns and preferences |
| Duplicate across tiers | Choose most appropriate tier (memory-management skill) |
| Write without structure | Use templates from the memory-management skill (handoff, post-mortem, chronicle) |
| Overwrite without reason | Append or version if content evolving |

## Related

- [memory-management skill](../../memory-management/SKILL.md) — tier selection, writing templates (handoff / chronicle / post-mortem), and cross-session continuity mechanics
- [pii-memory-filter.instructions.md](alex-act-pii-memory-filter.instructions.md) — the write-boundary filter that applies to every write this instruction triggers

## Would Revise If

- Proactive memory formation creates noise: >50% of persisted memories are unused in subsequent sessions
- Storage bloat: memory tiers grow past useful size without producing retrieval hits
- The 3× pattern threshold is too low (triggers on coincidence) or too high (misses real patterns)
