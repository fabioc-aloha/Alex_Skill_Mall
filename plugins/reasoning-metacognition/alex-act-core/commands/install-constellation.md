---
description: "Install the four Alex ACT constellation plugins at user scope, activate direct installs, and separately bootstrap Core's always-on instructions. Use for first setup or partial-install repair. Consent-gated and idempotent."
lastReviewed: 2026-08-01
---

# /install-constellation

Use the linked [`install-constellation`](../skills/install-constellation/SKILL.md)
skill as the detailed contract. If the generic skill tool is unavailable for a
plugin-shipped skill, continue with the numbered steps below. Do not claim the
skill or plugin is missing based only on the skill tool's inventory.

Steps:

1. Verify Copilot CLI version (`copilot --version` >= 1.0.75); if missing or too old, stop.
2. Run `copilot plugin list` to detect any constellation plugins already installed.
3. Ask which plugins to install and tenant-check MSFT (Microsoft employee and on corporate network) before including it.
4. Register `alex-mall` if needed, then install approved plugins in order: Core, Illustrator, Enterprise, MSFT.
5. Merge `enabledPlugins` without replacing existing entries. Marketplace keys use `<plugin>@alex-mall`; direct MSFT uses the bare key `alex-act-msft`.
6. Verify each install through `copilot plugin list`, settings, and the corresponding installed `plugin.json` tree.
7. Run the skill's **Step 6 — ACT discipline bootstrap** as a separate consent gate. Show the seventeen files, machine-wide scope, byte total, token estimate, and overlap scan before writing anything.
8. Write the bootstrap receipt only after a successful copy; verify from an empty directory as defined by the skill.
9. Run **Step 7 — Report** with installed, skipped, failed, activation, and bootstrap status. If bootstrap was declined, say the skills are available but the always-on discipline layer is not.
10. Point at namespaced next steps: `/alex-act-enterprise setup-enterprise-stack`, `/alex-act-msft setup-msft-stack`, and `/alex-act-illustrator-plugin install-visual-companions` when applicable.

Fires only when the user explicitly asks. Idempotent — safe to re-run; skips plugins already at latest.
