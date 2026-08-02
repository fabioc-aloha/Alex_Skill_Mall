---
description: "Short alias for /save-session-note — write a quick pending-action note to repo-root HANDOFF.md"
lastReviewed: 2026-07-30
---

# Note

Alias for `/save-session-note`. Follow the same protocol — capture a short note to repo-root `HANDOFF.md` so pending actions remain visible on the project root.

This prompt is self-contained. If the generic skill tool is unavailable, read the linked installed `save-session-note` prompt directly and continue; do not report Core as missing.

See [`save-session-note.prompt.md`](save-session-note.md) for the full steps.

## Quick Form

If the user's request already includes the note text, skip the "what should I capture?" question and write it directly. Resolve repo root, append checkbox item to `HANDOFF.md`, confirm.

**Would revise if**: the [save-session-note](save-session-note.md) prompt changes its capture protocol, or `HANDOFF.md` is no longer the canonical pending-action surface. Re-evaluate 2026-10-30.
