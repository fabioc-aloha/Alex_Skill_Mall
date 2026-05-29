---
description: "Guided removal of a source store from sources/supported-stores.json — coherence check first, comment-out for one cycle, then delete"
lastReviewed: 2026-05-29
---

# /prune-source

Remove a source store from the Mall's registry. Runs [staleness-discipline](../skills/staleness-discipline/SKILL.md) classification first, then a coherence check against Edition references, then the two-step reversible removal (comment-out → observe → delete).

## Steps

1. Apply [staleness-discipline](../skills/staleness-discipline/SKILL.md) to classify the proposed removal. Confirm at least one staleness signal fires (link unreachable, upstream archived, no activity 18+ months, license drift, replaced by superior alternative, persistent breakage).
2. **Coherence check**: grep `Alex_ACT_Edition/.github/` for the store name. If any Edition skill/instruction/prompt/agent references plugins from this store:
   - Stop. Surface the references to Supervisor first.
   - The Edition references must be fixed (or migrated to an alternative source) before the source store is pruned.
3. **Reversible removal (step 1 of 2)**: Comment out the entry in `sources/supported-stores.json` rather than deleting. Add a line above it: `// pruned-pending: YYYY-MM-DD reason: <reason>`.
4. Commit `[behaviour] prune source (pending): <name> — <reason>`.
5. Push. Let one weekly cron cycle run with the source commented out. Verify the catalog refresh PR shows the expected removal (store missing from `catalog/stores/`, plugin count drops by the right amount, no other unintended diffs).
6. **Reversible removal (step 2 of 2)**: After one clean cycle, delete the commented-out entry. Update the comment to `// pruned: YYYY-MM-DD reason: <reason> (delete: YYYY-MM-DD)` as an archival note above the surrounding entry.
7. Commit `[behaviour] prune source (delete): <name>`.

## Re-add procedure (if needed later)

If a pruned store revives, do not silently re-add. Run `/add-source` from scratch — past acceptance does not transfer; the scorecard must re-evaluate against current state.

## Boundaries

- Do not delete a source store entry in one commit. The two-step (comment-out → observe → delete) is the safety net against silent catalog breakage.
- Do not prune without the coherence check. Edition references break silently otherwise.
- Do not prune `plugin-mall` itself. The self-entry is constitutional; removal would require an ADR-008 amendment.
- Do not prune for "I don't like the maintainer" or other subjective reasons. The staleness signals are the bar; document the firing signal in the commit message.

## Would Revise If

Revise this prompt by **2026-08-29** (90 days) or sooner if:
- The two-step removal causes a registry-vs-catalog drift that ships to a release ≥1 time (the reversible pattern is leaking)
- Coherence check is skipped 2+ times and Edition references break (gate not enforced)
- Pruned stores are re-added within 30 days of removal 2+ times (premature pruning — staleness signals miscalibrated)
