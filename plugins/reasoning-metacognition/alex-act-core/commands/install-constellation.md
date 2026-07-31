---
description: "Install the four Alex ACT constellation plugins (alex-act-core, alex-act-illustrator-plugin, alex-act-enterprise, alex-act-msft) at user scope in the correct order, with a tenant check before installing alex-act-msft (Microsoft-internal only). Consent-gated. Idempotent. Invokes the `install-constellation` skill."
lastReviewed: 2026-07-30
---

# /install-constellation

Load the `install-constellation` skill and run its four-plugin install flow.

Steps:

1. Load skill: [install-constellation](../skills/install-constellation/SKILL.md).
2. Verify Copilot CLI version (`copilot --version` >= 1.0.75); if missing or too old, stop.
3. Run `copilot plugin list` to detect any of the four constellation plugins already installed.
4. Ask the user which plugins to install ("all four" is the default) and, if `alex-act-msft` is in the list, tenant-check per the skill's Step 2 (Microsoft employee + on corp network).
5. Register the `alex-mall` marketplace (needed for Core, Illustrator, Enterprise). MSFT does not need a marketplace — it installs directly from private GitHub via `gh auth`.
6. Install each approved plugin in order — Core → Illustrator → Enterprise from `alex-mall`; MSFT via `copilot plugin install fabioc-aloha/alex-act-msft`.
7. Merge `enabledPlugins` entries into `~/.copilot/settings.json` (preserve existing entries).
8. Re-verify each install via `copilot plugin info <name>` at user scope.
9. Report installed / skipped / failed with reasons.
10. Point at next steps: `/setup-enterprise` in Microsoft-ecosystem projects; `/setup-msft` for internal Microsoft signals (if installed).

Fires only when the user explicitly asks. Idempotent — safe to re-run; skips plugins already at latest.
