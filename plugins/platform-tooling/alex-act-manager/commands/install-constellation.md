---
description: "Install or repair the Alex ACT brain spine and optional plugins, bootstrap Core instructions, and configure optional capabilities per workspace. Use for first setup or partial-install repair. Consent-gated and idempotent."
lastReviewed: 2026-08-01
---

# /install-constellation

Use the linked [`install-constellation`](../skills/install-constellation/SKILL.md)
skill as the detailed contract. If the generic skill tool is unavailable for a
plugin-shipped skill, continue with the numbered steps below. Do not claim the
skill or plugin is missing based only on the skill tool's inventory.

Steps:

1. Verify Copilot CLI version (`copilot --version` >= 1.0.75); if missing or too old, stop.
2. Run `copilot plugin list` to detect installed versions. Resolve the exact current public versions from `alex-mall`'s `.github/plugin/marketplace.json` through the plugin-management version script; do not infer versions from flattened `marketplace browse` output.
3. Ask which plugins to install and tenant-check MSFT (Microsoft employee and on corporate network) before including it.
4. Register `alex-mall` if needed, then install approved plugins in order: Core, Illustrator, Enterprise, MSFT.
5. Merge `enabledPlugins` without replacing existing entries. Marketplace keys use `<plugin>@alex-mall`; direct MSFT uses the bare key `alex-act-msft`.
6. Verify each install through `copilot plugin list`, settings, and the corresponding installed `plugin.json` tree.
7. Audit the portable VS Code user baseline. Show missing and drifted keys, then ask for separate user-settings consent before invoking `/alex-act-manager configure-vscode`. Do not copy Fabio-specific editor preferences. If user `markdown.styles` contains a local absolute path, report it and separately offer removal; never substitute another local absolute path.
8. Run the skill's **Step 7 — ACT discipline bootstrap** as a separate consent gate. Show the seventeen files, machine-wide scope, byte total, token estimate, and overlap scan before writing anything.
9. Write the bootstrap receipt only after a successful copy. Deterministic receipt, count, and SHA-256 checks are the default verification. Offer the clean-directory AI smoke only after separate consent and a warning that it starts a model session and may consume material time, tokens, and credits.
10. Preview `/alex-act-manager bootstrap-workspace` for the current repository. Show the JSON plan and ask for separate workspace consent before copying `.vscode/markdown-light.css`, setting relative `markdown.styles` when absent, or narrowing `.gitignore`. Preserve differing CSS unless the user explicitly approves refresh from the bundled canonical copy.
11. Preview `/alex-act-manager configure-workspace-capabilities`. Keep Manager and Core `true`, ask which optional plugins should be enabled, disabled, or inherited, and warn before including private/internal identifiers. Ask for separate workspace capabilities consent before applying `.github/copilot/settings.json`.
12. Rerun the workspace capability preview and require `action: preserve`. Report the Agent Plugins and MCP workspace controls needed to reconcile VS Code's separately stored runtime state.
13. Run **Step 10 — Report** with seven activation rows: `installed`, `enabled`, `instruction-loaded`, `skill-invokable`, `user-settings`, `workspace`, and `workspace-capabilities`. A generic skill-tool rejection is `host-limited`, not a package-missing verdict, when the installed file exists and the namespaced command fallback works.
14. Point at namespaced next steps: `/alex-act-enterprise setup-enterprise`, `/alex-act-msft setup-msft`, and `/alex-act-illustrator-plugin install-visual-companions` when applicable.

Fires only when the user explicitly asks. Idempotent — safe to re-run; skips plugins already at latest.
