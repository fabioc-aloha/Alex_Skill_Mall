---
description: "Bootstrap repository-scoped VS Code workspace files for a plugin-native Alex ACT workspace. Use when a new repository lacks Markdown Preview CSS, the current repo needs the explicit bootstrap-workspace repair path, or workspace settings and .gitignore must be reconciled without touching user settings."
lastReviewed: 2026-08-02
---

# /bootstrap-workspace

Use this through `/alex-act-manager bootstrap-workspace`.

Use the linked [`bootstrap-workspace`](../skills/bootstrap-workspace/SKILL.md) skill as the detailed contract. If the generic skill tool is unavailable for the plugin-shipped skill, read the linked installed `SKILL.md` directly and continue with the numbered fallback below.

1. Resolve the target repository. Default to the current workspace root unless the user gave an explicit `--target` path.
2. Confirm this is repository scope only. Do not mutate user settings. If the user wants user-scope VS Code changes, stop and point them to `/alex-act-manager configure-vscode`.
3. Read the linked skill if you need the installed contract details before continuing.
4. Run the bootstrap script in preview mode first, without `--apply`, and capture the exact JSON plan.
5. Show the exact JSON plan to the user. Call out the CSS action, settings action, `.gitignore` action, bytes, SHA-256, and any skipped settings.
6. Ask for explicit consent. Apply only after a clear yes.
7. If consent is granted, run the same script with `--apply` against the same target.
8. Verify the result by checking the reported paths, actions, bytes, SHA-256, and whether the run is now idempotent.
9. Report the final state clearly: what changed, what was preserved, what was skipped, and any rollback note.
10. If the user asks why workspace-local CSS is used here, explain that workspace-relative local CSS is supported for repository scope, while user-scope absolute local file guidance is not supported. User-scope CSS guidance must use HTTPS and belongs in `/alex-act-manager configure-vscode`.

## Fallback notes

- Preview is mandatory before apply.
- The script is deterministic. Do not improvise settings edits by hand when the script is available.
- Preserve existing workspace CSS byte-for-byte.
- Preserve any existing `markdown.styles` value, including custom arrays and `null`.
- Never use network fetches in this workflow.

## Would Revise If

Revise this prompt by **2026-11-02** if the numbered fallback stops matching the linked skill contract, if it still depends on generic skill-tool availability, or if it produces user-scope mutation confusion.
