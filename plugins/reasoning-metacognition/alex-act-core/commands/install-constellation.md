---
description: "Routes legacy Core setup requests to Manager's canonical constellation and workspace-capability workflow. Use when an older caller invokes Core's compatibility command."
lastReviewed: 2026-08-04
---

# /install-constellation

This is a compatibility command. Manager owns constellation lifecycle and
workspace capability selection. Route the user to
`/alex-act-manager install-constellation`; do not run a second Core-owned
lifecycle flow.

If the generic skill tool is unavailable, continue with the numbered redirect
below. The redirect is self-contained and does not require Core's legacy skill.

Steps:

1. Run `copilot plugin list` and verify `alex-act-manager@alex-mall` is installed.
2. If Manager is absent, explain that Manager, Core, and the seventeen-file bootstrap are the non-optional brain spine. Provide `copilot plugin install alex-act-manager@alex-mall`, then stop until Manager is loaded.
3. Invoke `/alex-act-manager install-constellation`.
4. Preserve Manager's separate consent gates for user settings, instruction bootstrap, workspace files, optional workspace capabilities, and private identifiers.
5. Report that the Core command routed successfully; Manager owns the resulting activation report.

Fires only when the user explicitly asks. Idempotent — safe to re-run; skips plugins already at latest.
