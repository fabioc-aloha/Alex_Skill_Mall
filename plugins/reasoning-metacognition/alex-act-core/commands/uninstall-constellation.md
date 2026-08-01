---
description: "Generate a machine-tailored PowerShell script that cleanly uninstalls the Alex ACT constellation (Core, Illustrator, Enterprise, MSFT), the fifteen user-scope discipline instructions, and the four enabledPlugins entries. Writes to the workspace root as `.act-uninstall.ps1` (fallback ~/.copilot/tmp/); auto-appends to .gitignore if the workspace is git-tracked. Requires closing VS Code to run because Windows locks plugin trees. Preserves marketplace registrations; backs up settings.json."
lastReviewed: 2026-08-01
---

# /uninstall-constellation

Load the `uninstall-constellation` skill and run its detect-generate-guide flow.

Steps:

1. Load skill: [uninstall-constellation](../skills/uninstall-constellation/SKILL.md).
2. Verify Copilot CLI is installed (`copilot --version`); if missing, stop.
3. Read state:
   - `copilot plugin list` (which constellation plugins are installed and at what version)
   - `~/.copilot/instructions/.alex-act-bootstrap.json` (which discipline files to sweep)
   - `~/.copilot/settings.json` (which `enabledPlugins` entries are candidates for the safety-net prune)
4. Present the heir with a preview table (plugin count, bootstrap file count, `enabledPlugins` count, marketplaces preserved) and get explicit consent to generate the script.
5. Locate the target directory:
   - Preferred: `<workspace_root>/.act-uninstall.ps1` if a workspace is open and its root is writable.
   - Fallback: `~/.copilot/tmp/uninstall-constellation-<YYYYMMDD-HHmm>.ps1` if no workspace or unwritable.
6. Generate the script with exact machine state baked in as constants (plugin identifiers, exact filename list from the receipt, `enabledPlugins` keys). Do not use globs or runtime discovery — freezing state at generation time is what makes the script safe to run out-of-band.
7. If `<workspace_root>/.git/` exists, auto-append `.act-uninstall.ps1` to `.gitignore` (create if missing, skip if entry already present).
8. Print run instructions clearly:
   - Close ALL VS Code windows (File → Exit)
   - Open a fresh PowerShell (not integrated terminal)
   - `cd` to the workspace root (or tmp folder for fallback)
   - Run `.\.act-uninstall.ps1` (or the full path for fallback)
9. Report the exact file written, .gitignore update state, and the reinstall path.
10. Do NOT force through the Windows file lock. The script executes outside VS Code — that is the design.

Fires only when the heir explicitly asks. Preserves marketplace registrations. Takes a settings.json backup unconditionally. The generated script includes a VS Code guard, verification of all four state dimensions (plugins + bootstrap + receipt + settings.json), and self-deletes only on fully clean verification.
