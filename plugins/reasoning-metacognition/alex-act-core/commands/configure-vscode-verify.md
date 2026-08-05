---
description: "Routes legacy Core VS Code baseline audits to Manager's canonical read-only verifier. Use when an older workflow invokes Core's compatibility command."
lastReviewed: 2026-08-04
---

# Configure VS Code - Verify

Manager owns the portable user baseline and its deterministic audit runtime.
Core no longer carries a second baseline source.

If the generic skill tool is unavailable, continue with the numbered redirect
below. Do not report either plugin as missing from that signal alone.

Steps:

1. Verify `alex-act-manager@alex-mall` is installed with `copilot plugin list`.
2. If Manager is absent, provide `copilot plugin install alex-act-manager@alex-mall` and stop until it is loaded.
3. Invoke `/alex-act-manager configure-vscode-verify`.
4. Preserve Manager's read-only behavior and report its result without rewriting user settings.

## Would Revise If

Remove this compatibility prompt after **2026-11-04** if supported hosts migrate
all callers to Manager and no invocation still reaches the Core namespace.
