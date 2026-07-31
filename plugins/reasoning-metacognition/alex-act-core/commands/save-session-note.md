---
description: "Save session state for handoff in repo-root HANDOFF.md"
lastReviewed: 2026-07-30
---

# Save Session Note

Capture a short observation, reminder, or open thread in repo-root `HANDOFF.md` so pending actions stay visible to the user across sessions.

## Steps

1. **Get the note from the user** — one or two sentences. If they didn't include one in the request, ask: "What should I capture?"
2. **Resolve repo root**:
   - If in a git repo, use the top-level root.
   - If not in a git repo, use the current workspace root.
3. **Upsert `HANDOFF.md`** at repo root. If missing, create this structure:

   ```markdown
   # Session Handoff

   Last updated: YYYY-MM-DD HH:MM

   ## Pending Actions
   - [ ] <user note>

   ## Resume Hint
   - Open this file first in the next session.
   ```

   If it exists, update `Last updated` and append the new item under `## Pending Actions` as `- [ ] <user note>`.
4. **Confirm** by quoting the line added to `HANDOFF.md` and its file path.

## Notes

- Canonical handoff artifact is repo-root `HANDOFF.md`.
- Keep notes terse and action-oriented.
- The shared `Alex_ACT_Memory` bus is not a lightweight scratch surface — its contract requires structured, contract-valid entries per file (see [ai-memory-setup](../skills/ai-memory-setup/SKILL.md)). Cross-session notes stay local; publish to Memory only via a channel-appropriate structured entry.

## Would Revise If

Revisit this prompt by **2026-10-30** (90 days) or sooner if any of the following fires: the workflow it invokes ceases to produce its intended output (skill body changed but prompt steps stale); the visible markers / verification steps in its body are consistently skipped; or the slash-command name is no longer discoverable in the prompt picker.
