---
description: "Read-only Copilot CLI plugin inventory. Reports what plugins are installed at user vs repo scope, which have updates available, and which Alex ACT constellation plugins are missing from an expected install. Invokes the `plugin-management` skill in audit-only mode; does not modify anything."
lastReviewed: 2026-07-30
---

# /plugin-status

Load the `plugin-management` skill and run its audit-only mode against the user's Copilot CLI configuration and both settings files.

If the generic skill tool is unavailable for a plugin-shipped skill, execute
the numbered audit steps directly. Do not report `plugin-management` as missing
when its installed folder exists.

Steps:

1. Load skill: [plugin-management](../skills/plugin-management/SKILL.md).
2. Verify Copilot CLI is installed (`copilot --version`); if missing, direct the user to the install docs and stop.
3. Run `copilot plugin list` and capture the output.
4. Read `~/.copilot/settings.json` (user scope) if present.
5. Read `.github/copilot/settings.json` in the current workspace if present.
6. Cross-reference to produce a report with these sections:
   - **User-scope plugins**: from `~/.copilot/settings.json` `enabledPlugins`
   - **Repo-scope plugins**: from `.github/copilot/settings.json` `enabledPlugins`
   - **Direct-installed plugins**: from `~/.copilot/installed-plugins/_direct/`
   - **Registered marketplaces**: from `extraKnownMarketplaces` in both files
   - **Alex ACT constellation status**: which of the four constellation plugins (`alex-act-core`, `alex-act-illustrator-plugin`, `alex-act-enterprise`, `alex-act-msft`) are installed vs missing
   - **Updates available**: any plugin where installed version < latest available (best-effort — offers to run `/update-plugins` for the detail)
7. Do not modify anything. Do not run install / update / remove commands.

Fires only when the user explicitly asks — `/plugin-status` is not auto-invoked. The audit is safe on any workspace, online or off.
