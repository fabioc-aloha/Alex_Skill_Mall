---
description: "Apply baseline VS Code user-scope settings for fleet policy compliance"
lastReviewed: 2026-06-30
---

# Configure VS Code

Use this on first session setup (or when moving to a new machine) to apply a stable user-level VS Code policy.

This prompt is self-contained. If the generic skill tool is unavailable, continue with the numbered steps; do not report Manager as missing. For repository-scoped Markdown CSS and settings, use `/alex-act-manager bootstrap-workspace` instead.

This prompt owns user-scope settings only. Workspace settings remain project-owned and are provisioned through `/alex-act-manager bootstrap-workspace`.

## Objective

Produce and apply a portable settings payload at user scope so workspace settings do not override fleet behavior.

## Source of truth

The baseline payload lives at `<plugin-management-skill>/resources/welcome-baseline.json` (`settings` object). Resolve the installed Manager skill path first. Both `/alex-act-manager configure-vscode` (apply) and `/alex-act-manager configure-vscode-verify` (audit) load from the same file.

## Apply Steps

1. Load the baseline from `<plugin-management-skill>/resources/welcome-baseline.json` (`settings` object).

2. Detect user settings path:
   - Windows: `%APPDATA%\Code\User\settings.json`
   - macOS: `~/Library/Application Support/Code/User/settings.json`
   - Linux: `~/.config/Code/User/settings.json`

3. Preview with the deterministic Manager runtime:

  ```text
  node <plugin-management-skill>/scripts/manager-operations.cjs configure-vscode
  ```

4. Review `changes`, `unsupportedLocalMarkdownStyles`, and `hadComments`.
  - Object-valued location maps merge recursively; user-owned entries survive.
  - Absolute local `markdown.styles` is reported and remains unchanged unless the user separately requests removal.
  - Comment-rich JSONC fails closed on apply; merge the reported keys in VS Code's JSONC editor so comments survive.

5. With explicit consent and a comment-free settings file, apply:

  ```text
  node <plugin-management-skill>/scripts/manager-operations.cjs configure-vscode --apply
  ```

6. Verify applied keys by rerunning preview and report exactly which keys changed and which were already compliant.

## Guardrails

- User-scope only. Do not write these keys to workspace `.vscode/settings.json`.
- Do not write an absolute local path to user-scope `markdown.styles`. Use an HTTPS stylesheet at user scope, or route local CSS to `/alex-act-manager bootstrap-workspace` for workspace-relative setup.
- Stable settings only — the baseline file is the source of truth; do not inline payload here.
- Preserve all unrelated existing user settings.
- Never round-trip comment-rich JSONC through `JSON.stringify` or `ConvertTo-Json`.

## Would Revise If

Revisit this prompt by **2026-08-26** (90 days) or sooner if any of the following fires: the workflow it invokes ceases to produce its intended output (skill body changed but prompt steps stale); the visible markers / verification steps in its body are consistently skipped; or the slash-command name is no longer discoverable in the prompt picker.
