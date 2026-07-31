---
description: "Emit or install the Copilot CLI settings block for the seven public Microsoft ecosystem plugins (Azure, Fabric, Power BI, M365 Agents Toolkit). Invokes the `setup-enterprise-stack` skill from `alex-act-enterprise`."
lastReviewed: 2026-07-30
---

# /setup-enterprise

Load the `setup-enterprise-stack` skill and run its three-mode flow (emit / consent-install / audit) against the user's Copilot CLI configuration.

Steps:

1. Load skill: [setup-enterprise-stack](../skills/setup-enterprise-stack/SKILL.md).
2. Ask the user which mode they want: **emit only** (safe default), **consent-gated auto-install**, or **audit only**. If the user does not answer, default to emit.
3. Check prerequisites per the skill's Prerequisites section. Warn about missing subscriptions / licenses but do not refuse to emit.
4. Verify the Copilot CLI version (`copilot --version` >= 1.0.75). If missing or too old, direct the user to <https://github.com/github/copilot-cli> and stop.
5. Execute the chosen mode.
6. Report what changed (or, in emit mode, what the user must paste).

Fires only when the user explicitly asks — `/setup-enterprise` is not auto-invoked. The skill body carries the JSON block, the prerequisite table, and the consent-gate rules.
