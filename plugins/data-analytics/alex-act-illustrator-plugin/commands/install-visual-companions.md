---
description: "Offer to install nine marketplace plugins that compose visual-authoring workflows around Illustrator (chart rendering, screenshot verification, whiteboard iteration, PR annotation). Consent-gated, per-plugin — never bundled without explicit heir approval."
lastReviewed: 2026-08-01
---

# /install-visual-companions

Invokes the [install-visual-companions](../skills/install-visual-companions/SKILL.md) skill to offer the 9 visual-workflow companion plugins for consent-gated per-plugin install.

Steps:

1. Load the `install-visual-companions` skill.
2. Ask the heir which companions they want (default option: the 4-plugin vision-loop bundle — `storytelling-requirements + visual-artifact-qa + chart-interpretation + eyeball`).
3. For each requested plugin, verify existence in its claimed marketplace via `copilot plugin marketplace browse <marketplace>` (anti-hallucination discipline).
4. Register `alex-mall` marketplace if not already registered.
5. Run `copilot plugin install <name>@<marketplace>` for each verified plugin.
6. Print install-time caveats for the plugins that need manual post-install steps (`chromium-control-canvas`, `eyeball`, `napkin`, `visual-pr` — Playwright-based, ~100 MiB Chromium download each).
7. Report installed / skipped / caveats-outstanding, and note whether the vision-loop bundle is complete.

**Would revise if**: the `install-visual-companions` skill is retired, the 9-plugin catalog changes, or Fabio reassigns visual-companion ownership back to Core.
