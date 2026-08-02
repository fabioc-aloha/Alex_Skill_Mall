# Changelog

All notable changes to `alex-act-enterprise` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.2] - 2026-08-01

### Fixed

- Updated living version and publication status after v0.1.1 reached `alex-mall`.

## [0.1.1] - 2026-08-01

### Fixed

- Aligned manifest and README scope guidance with the existing repo-scope default and `--user` opt-in.
- Removed empty-scaffold and pending-publication language after the skill and Mall entry shipped.
- Qualified the plugin command as `/alex-act-enterprise setup-enterprise`.

### Scope default flipped to repo (2026-07-30)

Per the constellation `PLUGIN-INTEGRATION.md` § 2 (adopted 2026-07-30 in Steward commit `ab6eb9c`), `setup-enterprise-stack` now defaults its target-block writes to **repo scope** (`.github/copilot/settings.json`) instead of user scope. The seven plugins the skill emits (Azure, Fabric-consumption/-skills/-operations/-authoring, Power BI, M365 Agents Toolkit) are project-specific tools; loading them at user scope means every non-Microsoft workspace pays the context cost for skills the heir will never invoke there.

Users who want the plugins available in every workspace (regardless of project) can pass `--user` to opt into user scope.

Changes:

- Added a "Scope decision" section at the top of the flow — decide scope before choosing mode. Two-row table (repo default vs. user opt-in) with the "am I this? vs. am I working on this?" heuristic from PLUGIN-INTEGRATION § 2.
- Emit-mode instructions now target `.github/copilot/settings.json` by default and note that the file gets committed (teammates inherit on clone). User-scope instructions preserved for the `--user` path.
- Consent-gated auto-install merges into the scope-decided target file. `marketplace add` still writes to `~/.copilot/settings.json` regardless of scope choice (that is where CLI reads marketplace registration).
- Audit mode reads the scope-decided settings file and adds an "other scope" column to surface accidental cross-scope enablement.
- Safety rules extended: never silently pick user scope; warn on cross-scope collisions; remind the heir the repo file gets committed.
- Anti-patterns table extended: skipping the scope-decision step is now an anti-pattern.

Frontmatter description updated to name the repo-scope default and the `--user` opt-in.

No breaking change to existing installs — heirs who already applied at user scope stay as-is; the next `/setup-enterprise` invocation defaults to repo but detects the existing user-scope enablement in audit mode.

### Content port — `setup-enterprise-stack` skill + `/setup-enterprise` prompt (2026-07-30)

First shipped content. Config-template skill + slash-command prompt that emit the seven-plugin `enabledPlugins` + `extraKnownMarketplaces` block from Steward's user-brain inventory § 184.

Contents:

- `.github/skills/setup-enterprise-stack/SKILL.md` — three-mode flow (emit only, consent-gated auto-install, audit only), prerequisite table for Azure / Fabric / Power BI / M365 subscriptions, safety rules against overwriting existing `~/.copilot/settings.json` entries.
- `.github/prompts/setup-enterprise.prompt.md` — thin `/setup-enterprise` slash-command wrapper that loads the skill and runs the three-mode flow.

Manifest updated:

- `shape`: `empty-scaffold` → `one-skill + one-prompt (config-template only)`
- `$comment`: refreshed to note the skill + prompt now ship
- `assets.skills[]`: `[]` → `[".github/skills/setup-enterprise-stack/SKILL.md"]`
- `assets.prompts[]`: `[]` → `[".github/prompts/setup-enterprise.prompt.md"]`

Content sourced directly from Steward's [`brain/user-brain-inventory.md` § 184](https://github.com/fabioc-aloha/Alex_ACT_Steward/blob/main/brain/user-brain-inventory.md) — no upstream heir to port from (this plugin is 100% Steward-authored).

### Scaffold (2026-07-30)

Initial repository scaffold following the proven `alex-act-core` / `alex-act-illustrator-plugin` shape.

Contents:

- `manifest.json` — Mall-side plugin metadata (identity, target marketplace, empty assets arrays).
- `README.md` — Plugin overview + target settings block from Steward's user-brain inventory § 184.
- `LICENSE` — MIT.
- `.github/copilot-instructions.md` — Identity discovery file for Copilot Chat + CLI.
- Empty per-folder READMEs under `.github/{skills,instructions,prompts,agents}/` documenting the growth protocol.
- `.vscode/settings.json` — Self-dogfooding for this plugin's own discovery.
- `.gitignore`, `.markdownlint.json` — Consistent with sibling plugins.

No shipped assets yet. First content candidate is the `setup-enterprise-stack` skill; requires a proposal in `Alex_ACT_Steward/constellation/proposals/` with Fabio approval per `constellation/act/CURATION-RULES.md`.
