---
description: "Update installed Copilot CLI plugins to their latest stable versions with per-plugin diff summaries and per-breaking-change consent. Reads each plugin's CHANGELOG between the installed version and the latest available. Three modes: audit only (default), update non-breaking only, update all (with per-breaking consent). Invokes the `update-plugins` skill."
lastReviewed: 2026-07-30
---

# /update-plugins

Load the `update-plugins` skill and run its diff-summary + consent-gated update flow.

Steps:

1. Load skill: [update-plugins](../skills/update-plugins/SKILL.md).
2. Run `copilot plugin list` to enumerate every installed plugin.
3. For each plugin, query the latest available stable version (marketplace or GitHub source, no prereleases).
4. Where installed < latest, fetch and parse the plugin's CHANGELOG between the two versions. Extract any `Breaking` / `Removed` sections.
5. Produce the per-plugin diff summary table (Plugin | Installed | Latest | Breaking? | Summary).
6. Ask the user which mode: **audit only** (default — prints the table and stops), **update non-breaking only**, or **update all with per-breaking consent**.
7. Execute the chosen mode. For any breaking-change plugin, ask individually before updating it.
8. Re-verify installed versions after each update.
9. Report updated / skipped / deferred with reasons.

Fires only when the user explicitly asks. Never runs `copilot plugin update --all` without the per-plugin diff summary. Safe to re-run; idempotent when everything is current.
