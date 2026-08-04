# Changelog

All notable changes to `alex-act-core` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.7.0] - 2026-08-03

### Added

- Added compatibility support for preview-first user baseline merging and
  explicit workspace CSS refresh, preserving nested user settings and failing
  closed rather than erasing JSONC comments.

## [0.6.7] - 2026-08-03

### Fixed

- Kept Agent Skills enabled while disabling VS Code's experimental generic
  skill resolver, which cannot invoke plugin-contributed skills in VS Code
  1.131 (`microsoft/vscode#314772`).

## [0.6.6] - 2026-08-02

### Changed

- Synchronized the shared constellation install guide with the coordinated Core, Illustrator, Enterprise, and MSFT patch versions.

## [0.6.5] - 2026-08-02

### Fixed

- Replaced source-relative instruction links with stable artifact identifiers so all 17 user-scope bootstrap files resolve in their deployed flat directory.
- Namespaced 33 copyable Core command references while preserving prompt declarations and Markdown link labels.
- Removed stale forward-shipment claims for capabilities already present in Core.

### Validation

- Preserved source-to-bootstrap byte parity across all 17 bootstrapped instructions and passed the full 25-test Core suite.

## [0.6.4] - 2026-08-02

### Added

- Added a reset-free end-user `INSTALL.md` covering full constellation setup, Core instruction bootstrap, activation verification, optional workloads, and updates.

## [0.6.3] - 2026-08-02

### Fixed

- Registered new marketplaces before installing plugins in the generic consent-gated apply flow, so marketplace-qualified installs resolve on first use.

## [0.6.2] - 2026-08-02

### Fixed

- Consolidated workspace bootstrap and marketplace-version resolution into one deterministic Core operations runtime, preserving both features while keeping the full Mall payload within the 100-file Windows limit.

## [0.6.1] - 2026-08-02

### Fixed

- Consolidated workspace settings parsing into the bootstrap runtime so the complete Mall payload stays within the 100-file Windows limit without removing capability.

## [0.6.0] - 2026-08-02

### Added

- Added `/alex-act-core bootstrap-workspace`, a preview-first deterministic repository setup flow for workspace-relative Markdown Preview CSS, JSONC-safe set-if-absent settings, and selective `.gitignore` tracking.
- Added exact `alex-mall` marketplace-record version resolution through `plugin-management/scripts/marketplace-versions.cjs`.

### Changed

- Generalized installed-file fallback across every Core namespaced command when the host's generic skill tool rejects a plugin-shipped skill.
- Added compact bootstrap-only repair, deterministic receipt/hash verification by default, separately consented AI smoke testing, and four-plane activation reporting to `install-constellation`.
- Corrected CSS scope guidance: local stylesheets are workspace-relative; user-scope `markdown.styles` guidance uses HTTPS rather than an absolute local path.

- Moved the shared-Memory project-isolation boundary to its enforcement points: the always-on `memory-triggers` instruction now routes every shared write through `ai-memory-setup`, and that skill owns the detailed stripping, direct-write, refusal, validation, and local-fallback procedure.

### Removed

- Removed the standalone pattern-applied `cross-project-isolation.instructions.md`. Its workspace-relative `applyTo` paths could fail open when a shared-Memory write originated from another repository, while duplicating policy already required by `ai-memory-setup`.

## [0.5.1] - 2026-08-01

### Fixed

- Updated living version and publication status after the v0.5.0 feature release reached `alex-mall`.

## [0.5.0] - 2026-08-01

### Added

- Added `ALEX-FINCH.md` as a stable Core entry point for Alex Finch personality and voice. The file is explicitly non-runtime and does not change bootstrap or plugin assets.
- Added a focused personality-reference regression test covering the canonical Steward link, current Core counts, and the non-activation boundary.
- Added `alex-finch-personality.instructions.md`, a concise always-on runtime contract derived from the canonical Steward profile, plus its byte-identical bootstrap resource.

### Changed

- Updated `markdown-mermaid` guidance and both bundled preview styles to use one frame owner, shrink-wrap compact diagrams, and reserve horizontal scrolling for graphs that cannot preserve the documented label floor.
- Consolidated the complete Alex Finch source of truth into `Alex_ACT_Steward/brain/alex-finch.md`; Core now keeps a short pointer instead of a second editable copy.
- Expanded the separately consented instruction bootstrap from 16 to 17 files so installed heirs receive Alex Finch's stable personality and voice contract.

### Fixed

- Aligned install, plugin-management, uninstall, and manifest guidance with the current 18-instruction contract: 16 bootstrap resources and 2 pattern-applied instructions.
- Qualified cross-plugin follow-up commands with their installed plugin namespace.
- Removed the empty `agents` component declaration from `plugin.json`; Core intentionally ships zero agents.
- Replaced stale v0.1.0 counts in `.github/copilot-instructions.md` with the live v0.4.2 composition.

## [0.4.2] - 2026-08-01

### Fixed - fresh-install and plugin CLI contracts

1. Fresh installs now honestly require `/alex-act-core install-constellation`. `greeting-checkin` is post-bootstrap repair and update only because the instruction itself is copied by Step 6.
2. Unsupported Copilot CLI 1.0.77 subcommands `plugin info`, `plugin remove`, and `plugin search` were removed from active guidance. Supported paths now use `plugin list`, `marketplace browse`, `uninstall`, settings inspection, and installed `plugin.json` fallback checks.
3. The install prompt now includes a separately consented Step 6 bootstrap path and a final structured report.
4. Direct `alex-act-msft` install now explicitly merges bare `alex-act-msft: true` into `enabledPlugins` and surfaces the direct-install deprecation warning.
5. Plugin command prompts are now self-contained when the VS Code generic skill tool omits installed plugin skills, and they no longer report missing capability from that tool result alone.
6. `plugin.json` and `manifest.json` living counts were corrected to 18 instructions, with 16 bootstrapped.
7. A new `npm test` gate now runs 8 tests covering supported verbs, first-run command path, prompt fallback, bootstrap count, source and mirror SHA equality, receipt parity, and metadata parity.

Evidence: helper-repo transcript session `b85246f6-4075-414c-a5d9-41b84d5c97f5`, VS Code 1.131, Copilot CLI 1.0.77, and `helper/meta/plugin-testing-feedback.md`.

Patch scope: no skill, prompt, or instruction additions or removals. The 16-file bootstrap set is unchanged.

## [0.4.1] - 2026-08-01

### Added — bootstrap drift detection in `session-health-monitoring`

Closes the chicken-and-egg gap that shipped in v0.4.0: `greeting-checkin` was designed to detect bootstrap drift on greeting messages, but it can only fire if it's physically present at `~/.copilot/instructions/`. After a user runs `copilot plugin update --all` on Core (v0.3.1 → v0.4.0 or later), the plugin tree updates but the always-on discipline layer at `~/.copilot/instructions/` still has the previous bootstrap set. Users who never re-run `install-constellation` after an update stay on the old discipline layer forever, and `greeting-checkin` can't detect it because the bump doesn't install it.

`session-health-monitoring` has been part of the bootstrap since v0.3.0, so it's present on every user machine that ran `install-constellation` at least once. Patching its body with a once-per-session drift check gives us a fallback path that reaches users `greeting-checkin` can't.

**How it works** (documented in the instruction body):

1. Reads `~/.copilot/instructions/.alex-act-bootstrap.json` for `coreVersion` (the version that installed the current bootstrap)
2. Reads `~/.copilot/installed-plugins/alex-mall/alex-act-core/plugin.json` for `version` (the currently installed Core plugin)
3. Reads `~/.copilot/instructions/.alex-act-session-hint.json` for `driftNudgeSurfacedThisSession` (once-per-session guard)
4. If versions differ AND no nudge given yet this session, prints a one-line non-blocking nudge: *"Alex ACT discipline layer is from Core v`<X>` but installed Core is v`<Y>`. Run `/alex-act-core install-constellation` (Step 6 refreshes the bootstrap)."*
5. Writes `driftNudgeSurfacedThisSession: true` to the session hint file — no repeats within the same session

**Do-NOT-fire guards**:

- Either file missing (fresh install — `install-constellation` owns that path)
- Versions match exactly
- Nudge already surfaced this session
- Greeting patterns (deferred to `greeting-checkin`; no double-nudge)
- User invoked `/alex-act-core install-constellation` in the same session

**What ships**:

- **Modified**: `.github/instructions/session-health-monitoring.instructions.md` — new `## Bootstrap Drift Detection (Alex ACT constellation)` section; `description` frontmatter expanded to mention drift-detection; `lastReviewed` bumped to 2026-08-01
- **Modified**: `.github/skills/install-constellation/bootstrap/alex-act-session-health-monitoring.instructions.md` — byte-identical mirror
- **Modified**: `plugin.json` version 0.4.0 → 0.4.1
- **Modified**: `manifest.json` version 0.4.0 → 0.4.1

**No new files, no bootstrap count change.** Bootstrap payload remains 16 files, ~78 KB / ~20K tokens.

**Design constraints** — the drift-detection lives in `session-health-monitoring` because it's the least-scope-creeping home for a session-level health signal. Alternative placements considered:

- `plugin-management` skill (but skills fire on description-match, not deterministically — cannot guarantee it runs)
- `update-plugins` skill (only fires if user goes through `/alex-act-core update-plugins`, not bare `copilot plugin update --all`)
- `sessionStart` hook (plugin-native but hooks don't fire in VS Code Chat per empirical probes — CLI-only)

Only an always-on instruction that is already in the pre-v0.4.0 bootstrap can reach every user with a stale discipline layer. `session-health-monitoring` is the only fit.

## [0.4.0] - 2026-08-01

### Added — `/uninstall-constellation` skill + prompt + `greeting-checkin` install-experience overhaul (lifecycle capstone)

Two related improvements that together give the constellation a complete, honest lifecycle surface:

**1. `/uninstall-constellation` skill + prompt.** Closes the constellation lifecycle. `/install-constellation` and `/update-plugins` shipped in prior releases; there was no matching uninstall surface, so heirs who wanted to remove Alex ACT had to reverse each step manually. Detect + generate + guide pattern: reads state, generates a machine-tailored PowerShell script at `<workspace_root>/.act-uninstall.ps1` (fallback `~/.copilot/tmp/`), and instructs the heir to run it from a fresh PowerShell after closing VS Code (the honest workaround for Windows os error 5 on locked plugin trees).

**2. `greeting-checkin` always-on instruction + install-experience overhaul.** Reduces the first-time install from ~8 manual steps to 4:

1. `copilot plugin marketplace add fabioc-aloha/Alex_Skill_Mall`
2. `copilot plugin install alex-act-core@alex-mall`
3. Reload VS Code
4. Open Chat, type a greeting ("hi", "hello", "getting started", etc.) — Core detects incomplete setup and offers full setup through a single consolidated consent gate

`greeting-checkin` is a new always-on instruction (added to the bootstrap payload, growing it 15 → 16 files, ~65 KB → ~78 KB, ~16.7K → ~20K tokens) that fires on short greeting messages (≤40 chars matching `hi`, `hello`, `hey`, `howdy`, `good morning`, `help`, `getting started`, etc.). It runs a silent four-dimensional state check (bootstrap receipt, installed plugins, enabledPlugins entries, Mall update availability), classifies state as `healthy` / `incomplete` / `drifted` / `updates-available`, and offers the corresponding action through a consolidated consent gate. If state is healthy, responds to the greeting normally with no mention of setup.

Cache-backed via a new session-state hint file at `~/.copilot/instructions/.alex-act-session-hint.json` (documented in `plugin-management` skill § Session-state hint file) — one check per hour per session tops. Never installs, updates, or modifies state without explicit user consent.

**What ships**:

- **New**: `.github/instructions/greeting-checkin.instructions.md` (always-on; ships in bootstrap payload)
- **New**: `.github/skills/install-constellation/bootstrap/alex-act-greeting-checkin.instructions.md` (bootstrap copy)
- **New**: `.github/skills/uninstall-constellation/SKILL.md` (detect + generate + guide flow)
- **New**: `.github/prompts/uninstall-constellation.prompt.md` (`/uninstall-constellation` slash command)
- **Updated**: `.github/skills/install-constellation/SKILL.md` — added Invocation modes section describing manual vs auto-invoked-from-greeting-checkin vs repair; Step 6 bootstrap payload count updated 15 → 16 (added greeting-checkin row + receipt array entry + token/byte estimates)
- **Updated**: `.github/skills/plugin-management/SKILL.md` — added Session-state hint file section documenting the `.alex-act-session-hint.json` schema and semantics
- **Updated**: `.github/skills/update-plugins/SKILL.md` — added Mall catalog fetch helper section (reusable by greeting-checkin for the silent update-availability check)
- **Updated**: `README.md` — added "Quick install (4 steps)" section at top
- **Updated**: `manifest.json` — instruction count 17 → 18, bootstrap payload 15 → 16, shape and description reflect the greeting-checkin addition

**Companion Steward documentation**:

- [`USER-EXPERIENCE.md` § Stage 1](https://github.com/fabioc-aloha/Alex_ACT_Steward/blob/main/constellation/USER-EXPERIENCE.md) — rewrites Stage 1 as the 4-step install flow
- [`USER-EXPERIENCE.md` § Stage 6](https://github.com/fabioc-aloha/Alex_ACT_Steward/blob/main/constellation/USER-EXPERIENCE.md) — Remove the constellation (uninstall walkthrough)
- [`PLUGIN-INTEGRATION.md` § 3](https://github.com/fabioc-aloha/Alex_ACT_Steward/blob/main/constellation/PLUGIN-INTEGRATION.md) — greeting-checkin discovery pattern under the update model

**Design validated end-to-end 2026-08-01** on Fabio's machine for the uninstall path: proof-of-concept script generated by hand to Steward workspace root ran cleanly from a fresh PowerShell after closing VS Code — 4 plugins uninstalled, 15 bootstrap files swept, receipt removed, settings.json backed up and pruned, script self-deleted. Test surfaced the "CLI auto-cleans `enabledPlugins`" behavior (step [3/4] correctly reported 0/4 as a no-op), which informed the honest-signal reporting in the shipped uninstall skill.

Minor bump when released per Steward's version-management convention: additive change (2 new skills, 1 new instruction, 1 new prompt, +1 bootstrap file), no removed items, no renamed items, no behavior change for existing surfaces.

## [0.3.1] - 2026-08-01

### Changed — install-constellation Step 7 visual-companions catalog moved to Illustrator

Per Fabio directive: *"The visual companions should be bundled with the illustrator."* The 9-plugin visual-workflow-companions catalog + install offer that v0.3.0 shipped in `install-constellation` Step 7 (via commit `a2de9d4`) has moved ownership to `alex-act-illustrator-plugin` v0.6.0's new `install-visual-companions` skill (2026-08-01). Reverses the 2026-07-31 Option A (route-only) decision recorded in [Steward's illustrator/plan.md](https://github.com/fabioc-aloha/Alex_ACT_Steward/blob/main/illustrator/plan.md) — "visual-workflow ownership belongs with the visual-authoring plugin that anchors it" is a stronger architectural fit than "constellation-installer offers all downstream companions".

**What changed in this skill**:

- `install-constellation/SKILL.md` § "Optional: visual workflow companions" — replaced the 9-plugin catalog + install-time caveats + vision-loop composition + verified-status list with a routing pointer at Illustrator's `/install-visual-companions`. The single-source-of-truth for the catalog now lives in Illustrator to prevent drift across two plugins.
- `install-constellation/SKILL.md` § Consent flow Step 1 — the "do not offer visual-workflow companions here" note now names Illustrator's `/install-visual-companions` as the correct offer surface.
- `install-constellation/SKILL.md` § Step 7 Report bullet — simplified from "name the specific companion plugins that fit + print install commands + caveats" to "tell them to invoke `/install-visual-companions` after this install completes".

**No behavior change for heirs on the four-plugin core install** — the constellation install flow (Core, Illustrator, Enterprise, MSFT with tenant-check) is unchanged. Only the visual-companions offer surface moved.

**Upgrade path**: heirs already on v0.3.0 upgrade to v0.3.1 as a patch; the routing pointer in this skill assumes Illustrator v0.6.0+ is installed alongside (which any heir who completed `install-constellation` already has, since Illustrator is Stage 2 of the four-plugin flow). Older Illustrator (v0.5.1 or earlier) does not carry `install-visual-companions` — heirs would need to update Illustrator to see the new offer surface.

Patch bump (0.3.0 → 0.3.1) rationale per Steward's version-management convention: internal doc-reorganization + cross-plugin ownership move, no removed skills, no renamed skills, no behavior change for heir workflows on the primary path.

Companion Illustrator release: `alex-act-illustrator-plugin` v0.6.0 (2026-08-01) ships the new `install-visual-companions` skill + `/install-visual-companions` prompt with the full catalog.

## [0.3.0] - 2026-08-01

### Changed — instruction inventory consolidated to align with the plugin-delivery boundary (D-batch)

v0.2.x shipped 34 instruction files, treating the instruction folder as the primary curation surface. That framing predated the empirical verification recorded in v0.2.0's CHANGELOG that `plugin.json` has no `instructions` component field and Copilot CLI's loading-order model covers only agents, skills, and MCP servers. The instruction inventory needed to be triaged against that boundary: which instructions carry content the plugin can actually deliver, and which are routing-only pointers whose job is already done by the paired skill's description-match discovery?

The D-batch (2026-07-31) performed that triage across seven passes:

- **D1** (`5e75a40`) — folded 7 routing-only instructions into their paired skills. Semantic review found 4 of the 7 carried content absent from the paired skill (three of it safety-relevant); each block was merged into the skill body before the instruction was removed. `plugin-management.instructions.md` was one of the seven — its routing table now lives in `plugin-management/SKILL.md` § When to fire.
- **D2** (`a5e0c07`) — folded 2 differently-named routing instructions into their targets, aligning the instruction names with the skills they routed to.
- **D3** (`8f15511`) — promoted 3 always-on instructions to Core skills (`worldview` → skill; two others regrouped); fixed broken ACT canon links.
- **D4** (`1f04d8b`) — merged `knowledge-coverage` into `epistemic-calibration` (they were addressing the same content class with different vocabulary).
- **D5** (`84c9fdc`) — expanded the `install-constellation` bootstrap payload from 7 to 13 files. Added `alex-act-lint-discipline`, `alex-act-no-deferred-debt`, `alex-act-emotional-intelligence`, `alex-act-reliance-nudges`, `alex-act-session-health-monitoring`, `alex-act-proactive-awareness` — each earning always-on status because their trigger is a per-message signal (feeling state, epistemic behavior, context-capacity, session-boundary) that cannot be recovered post-hoc. Mutual cross-refs added between `emotional-intelligence` and `reliance-nudges` because they read complementary axes of every user message.
- **D6** (`8ffd3b2`) — split reference-heavy instructions into rule-only + skill pairs, keeping the always-on load minimal.
- **D6.1** (`39b4423`) — reclassified `tool-awareness` D6→D3 mid-execution after audit found its three rules were absorbed into `platform-awareness` skill; description-match discovery covered the trigger vocabulary, so the always-on rule was redundant.

**Net effect**:

- Instruction count: 34 → 17
- Bootstrap payload: 7 → 15 files (adds the D5 six + `worldview` + `memory-triggers`)
- Bootstrap byte size: ~24 KB → 65.4 KB
- Bootstrap token cost: ~7K → ~16.7K always-on tokens per session at user scope
- Zero renamed / removed skills, prompts, or agents that heirs invoke by name

**Migration**: heirs installing v0.3.0 fresh receive the 15-file bootstrap on their first `/install-constellation` Step 6. Heirs upgrading from v0.2.x will see Step 6's idempotency check detect the `coreVersion` mismatch and offer to rewrite the receipt with 8 additional bootstrap files. Consent-gated as always; declining leaves the workspace on the 7-file discipline set.

### Added — `plugin-management` verify-marketplace-exists Safety rule

`plugin-management/SKILL.md` (`df8b676`) grew a new Safety rule: verify a plugin exists in its claimed marketplace via `copilot plugin marketplace browse` before install, especially when the plugin name came from an external agent's recommendation. Description-match discovery + LLM inference can hallucinate plugin names — this rule closes the anti-hallucination gap. Learned from the 4-round GH-APP-SUPPORT feedback loop (§ 5.1 in-session plugin discovery gap). Matching anti-pattern row added.

### Added — `install-constellation` visual workflow companions Step 7

`install-constellation/SKILL.md` (`a2de9d4`) gained an "Optional: visual workflow companions" section cataloguing 9 marketplace plugins that compose with Core's constellation to close common visual-authoring workloads: `chromium-control-canvas` + `eyeball` + `diagram-viewer` + `napkin` + `image-annotations` + `chart-interpretation` + `visual-artifact-qa` + `visual-pr` + `storytelling-requirements`. Includes the vision-loop composition pattern (`chromium-control-canvas.screenshot → chart-interpretation → image-annotations` + `eyeball` for claim-audit) — the pattern that closed GH-APP-SUPPORT § 5.5's P1 recommendation ("multimodal vision as first-class runtime capability") by composition rather than new runtime capability.

**Step 1 explicitly does NOT offer these companions** — they belong in Step 7 with per-plugin consent, never bundled with the core 4-plugin install. Step 7 report bullet updated to name the specific companion plugins that fit the heir's declared workload (never listing all 9 unconditionally).

### Known follow-up carried forward

- The `bootstrap/` copies still ship without a diff-time verification against `.github/instructions/`. Same falsifier as v0.2.1.
- Steward's `constellation/PLUGIN-INTEGRATION.md` § 4 was reconciled against the D-batch state on 2026-08-01 (Steward commit `1c336b9`), and Steward's `constellation/USER-EXPERIENCE.md` on the same date (Steward commit `b2f602d`). Both now cite the 17-instruction + 15-file bootstrap counts consistent with this release.

## [0.2.1] - 2026-07-30

### Fixed — the v0.2.0 bootstrap had no source to copy from on Mall installs

v0.2.0 shipped the ACT discipline bootstrap as `install-constellation` Step 6, and on a Mall install it could not run. The step specified what to copy, how to name it, when to ask, and how to record the result — but never where the files come from.

That omission was invisible during authoring because a direct GitHub install clones the whole repository, so `.github/instructions/` happens to be on disk. A Mall install vendors a component-shape subset (skills, commands, scripts, config) and deliberately excludes instructions, since instructions are not a `plugin.json` component type. The 69-file Mall payload contained zero instruction files, so Step 6 had nothing to copy on the very install path the public READMEs now advertise as primary.

Root cause was a conflation: "the platform will not *load* these from a plugin path" is true, and it does not imply "these should not *ship*." Step 6 never needed the platform to load them; it needed to read them off disk and copy them.

**Fix**:

- The seven instruction files now ship inside the skill at `skills/install-constellation/bootstrap/`, already carrying their `alex-act-` target names, byte-identical to `.github/instructions/`. Present in every install path.
- Step 6 gained a **Source** subsection with an explicit three-row resolution order: skill-bundled `bootstrap/` first, plugin-root `.github/instructions/` as a direct-install fallback, and an explicit failure message otherwise.
- Missing source now stops the step and reports a packaging defect. It never silently no-ops, and it never falls back to fetching over the network.
- Two anti-pattern rows added (assuming files are on disk without resolving; network fallback) and one falsifier added for drift between the bundled copies and their sources.

Payload grows from 69 to 76 files, within the 100-file Copilot CLI Windows limit.

Found by running the round-trip acceptance check against the published artifact — the one check from the original proposal that had never been executed end to end.

### Known follow-up

`bootstrap/` holds copies, and copies rot. Core has no test harness today, so nothing yet fails a build when a source instruction is edited and its bundled copy is not. Tracked as a falsifier in the skill; needs either a release-time diff check or a generation step.

## [0.2.0] - 2026-07-30

### Added — ACT discipline bootstrap, closing the instruction-scope gap (2026-07-30)

A `copilot plugin install` delivers a plugin's skills, prompts, and agents but **not** its instructions. `plugin.json` has no `instructions` component field and the CLI's loading-order model covers only agents, skills, and MCP servers. Claude Code documents the same boundary ("to ship instructions that load into Claude's context, put them in a skill") and Open Plugin Spec v1.0 defines the portable core as `skills/` plus `mcp.json` only. This is architecture, not a defect.

Consequence before this change: heirs installing Core received its skills while all 34 instructions stayed inactive, including the ACT discipline layer that governs *how* those skills fire.

**Verified fix**: `~/.copilot/instructions/` is read by the Copilot CLI **and** VS Code Chat, with no settings change required. Probed 2026-07-30 against CLI 1.0.77 and VS Code 1.131 using a sentinel instruction with `applyTo: '**'`; both surfaces discovered, parsed, and applied it.

- **`install-constellation/SKILL.md`** — new **Step 6, ACT discipline bootstrap**, between the settings merge and the report (the former Step 6 is now Step 7). Copies seven of Core's unconditional instructions to `~/.copilot/instructions/` under an `alex-act-` filename prefix, writes a `.alex-act-bootstrap.json` receipt, and verifies from an empty directory. Separately consent-gated from the plugin install, since user scope reaches every workspace on the machine. Includes an overlap scan against the current workspace's `.github/instructions/`, because instruction scopes compose rather than replace and a same-named repo-scope file would double-load. Idempotency keyed on the receipt's `coreVersion`.
- **`plugin-management/SKILL.md`** — new **Instruction bootstrap files (user scope)** section owning the shared rules for any plugin that bootstraps instructions: mandatory filename prefix, mandatory receipt, never glob-delete, scan for overlap first, consent separately from install. Ships read-receipt and remove-bootstrap procedures plus the empty-directory verification check. Two new entries in Safety rules.

**Scoped deliberately.** Seven files, roughly 37 KB, about 9.4K always-on tokens: `act-pass`, `problem-framing-audit`, `epistemic-calibration`, `system-prompt-skepticism`, `critical-thinking`, `terminal-command-safety`, `pii-memory-filter`. Core's other 10 unconditional instructions stay plugin-resident. Bootstrapping all 17 would cost roughly 20.5K tokens in every workspace on the machine, which inverts the minimal-user-scope principle. Behavioral and craft instructions degrade gracefully when absent; these seven do not.

**Not adopted here**: converting instructions to skills. That is the vendor-documented answer and it is correct for the 17 pattern-applied instructions, which is a separate change. It is wrong for the unconditional set, because skills fire on model description-match rather than deterministically, and "the model decides whether to apply the discipline" is the failure mode the discipline exists to prevent.

### Added — Batch 11: Plugin management operational surface (2026-07-30)

Seven artifacts implementing the plugin-management model defined in Steward's `constellation/PLUGIN-INTEGRATION.md` § 4. Closes the gap where heirs had to invoke raw `copilot plugin` commands with no scope guidance, no diff summaries, and no breaking-change protection.

**Skills (3)**:

- **`plugin-management/SKILL.md`** — general Copilot CLI plugin operations. Command reference (install / list / update / remove / marketplace add / marketplace list / marketplace remove / search / info). Scope precedence rules (user vs repo, first-loaded-wins for skills, last-wins for MCP). Settings shape (`enabledPlugins`, `extraKnownMarketplaces`). Safe merge-not-overwrite settings edits with a documented merge algorithm. Three install modes (emit only / consent-gated apply / audit only). Scope-decision heuristic ("am I this? → user; am I working on this? → repo") with a concrete plugin-type table. Safety rules + anti-patterns table.
- **`install-constellation/SKILL.md`** — Alex ACT-specific install list. Four-plugin table with user-scope defaults + install order (Core → Illustrator → Enterprise → MSFT). Six-step consent flow: (1) confirm target list, (2) tenant-check for MSFT (Microsoft employee + on corp network — fail closed on either "no"), (3) marketplace registration, (4) install commands in order, (5) settings merge, (6) report. Idempotent (skips already-installed). Delegates to plugin-management for mechanical commands.
- **`update-plugins/SKILL.md`** — safe `copilot plugin update` wrap. Version resolution (latest stable = highest non-prerelease GitHub Release). CHANGELOG reading in Keep-a-Changelog format between installed and latest, aggregating `### Breaking` + `### Removed` sections. Per-plugin diff summary table before running anything. Three modes (audit only / non-breaking only / all with per-breaking consent). Session-start reminder pattern that pairs with install-constellation. Never runs `update --all` without the per-plugin flow.

**Prompts (3)**:

- **`/plugin-status`** — read-only Copilot CLI plugin inventory. Reports user-scope, repo-scope, direct-installed plugins, registered marketplaces, Alex ACT constellation status, and updates-available detection. Invokes `plugin-management` in audit-only mode. Safe on any workspace, online or off.
- **`/install-constellation`** — four-plugin install flow. Verifies CLI version, detects existing installs, asks which plugins + tenant-checks MSFT, registers marketplaces, installs in order, merges `enabledPlugins`, verifies each install via `copilot plugin info`, reports installed / skipped / failed with reasons.
- **`/update-plugins`** — update flow with diff summary. Enumerates installed plugins, queries latest stable, parses CHANGELOGs, produces per-plugin table, asks for mode, executes with per-breaking consent, re-verifies installed versions after each update.

**Instruction (1)**:

- **`plugin-management.instructions.md`** — always-on router. Ten-row routing table mapping heir requests ("install X plugin", "install Alex ACT", "update my plugins", "add the Alex mall", "should X be user scope or repo scope?", etc.) to the correct sibling skill or prompt. Two universal rules: (1) emit before apply, (2) merge, don't overwrite. When-quiet list for adjacent scopes (VS Code extensions → configure-vscode, Memory sibling → ai-memory-setup, brain authoring → skill-creator/etc.). `applyTo` scoped to `**/copilot/settings.json,**/.copilot/**,**/*plugin*,**/*mall*,**/*marketplace*`.

**Manifest updates**:

- `shape`: `thirty-three-instructions + thirty-skills + nine-prompts` → `thirty-four-instructions + thirty-three-skills + twelve-prompts`
- `$comment`: refreshed to include Batch 11 counts
- `description`: refreshed to include the Batch 11 content set + reference the constellation `PLUGIN-INTEGRATION.md` grounding
- `assets.skills[]`: 30 → 33 (plugin-management, install-constellation, update-plugins appended)
- `assets.instructions[]`: 33 → 34 (plugin-management appended)
- `assets.prompts[]`: 9 → 12 (plugin-status, install-constellation, update-plugins appended)

**Composition with earlier batches**:

- `plugin-management` skill delegates from and to Batch 10's `configure-vscode` prompts (VS Code settings scope) and Batch 10's `ai-memory-setup` skill (Memory sibling scope) — the three concerns (Copilot CLI plugins vs VS Code settings vs Memory repo) are kept separate.
- The always-on `plugin-management` instruction composes with `no-deferred-debt` (Batch 4) and `problem-framing-audit` (Batch 1 + skill Batch 2): when a plugin update surfaces stale references or the heir's scope framing looks off, the always-on partners fire in the same session.
- `install-constellation` + `update-plugins` compose with `configure-vscode` / `configure-vscode-verify` (Batch 10) for a full first-run experience: VS Code settings + Copilot CLI plugins + Memory sibling all set up together.

**Grounding**:

Content grounded in Steward's [`constellation/PLUGIN-INTEGRATION.md`](https://github.com/fabioc-aloha/Alex_ACT_Steward/blob/main/constellation/PLUGIN-INTEGRATION.md) (adopted 2026-07-30) — the constellation's canonical source for pull-at-install distribution model, user-vs-repo scope split, and manual update workflow.

**Follow-up (not blocking release)**:

- `alex-act-enterprise`'s `setup-enterprise-stack` skill defaults to `~/.copilot/settings.json` (user scope) for its target block. Per PLUGIN-INTEGRATION § 2, azure / fabric / powerbi / m365 are project-specific and should default to `.github/copilot/settings.json` (repo scope) with an explicit `--user` opt-in. Fix ships in enterprise repo, not Core.
- Future proposal: session-start hint from `install-constellation` when constellation plugins have updates available — currently the pattern is documented in `update-plugins/SKILL.md` § Session-start reminder pattern but not wired into `install-constellation`'s startup.

### Audit remediation batch (2026-07-30)

Six-item severity-ranked fix batch closing the standing audit findings against v0.1.0 content. Covers a High-severity security defect in the shared runtime, three Medium documentation-parity issues, and one Low count-accuracy fix.

**Security — `.github/scripts/shared/tool-runner.cjs`** (High):

- `execFileSync` on Windows was called with `shell: true` to resolve `.cmd`/`.bat` shims for `pandoc` / `mmdc` / other Node-CLI tools. That path re-parses the argument vector through `cmd.exe`, which reintroduces the DEP0190 command-injection surface even when caller code passed args as an array. A synthetic probe demonstrated the defect: passing `['-e', 'console.log("SAFE_CHILD")', '&', 'echo', 'CORE_INJECTION_MARKER']` executed both the intended command and the injected `echo` because `cmd.exe` treated `&` as a command separator.
- Replaced with a `resolveWindowsTool()` helper that uses `where.exe` to resolve the tool name to an absolute path (preferring `.cmd`, `.exe`, then `.bat`), caches the result per tool, then invokes `execFileSync(resolved, args, { shell: false })`. Argument injection is now structurally impossible because the child process never sees a shell.
- Verified post-fix: same probe now returns only `SAFE_CHILD` with no injected marker output, and `md-to-html` / `md-to-txt` / `md-to-word` / `docx-to-md` all round-trip successfully against a sample workspace. No user-facing behavior change; internal safety upgrade only.

**Documentation parity — README + copilot-instructions + manifest $comment + agents/README** (Medium):

- Removed "empty scaffold" language from Core's public identity surfaces. As of Batch 10, 72 baseline items ship (33 always-on instructions + 30 skills + 9 slash-command prompts) plus a shared runtime for the bundled converters. README status line, layout tree, "What Core is NOT" section, and Install prerequisites now describe the actual shipped state; copilot-instructions status paragraph updated; manifest `$comment` refreshed.
- Removed the incorrect "Not a document conversion or lint runner" claim from README's "What Core is NOT" — Core ships 6 converters and `lint-clean-markdown`. Replaced with a positive claim that visual-authoring capability lives in the illustrator plugin, not Core.
- `.github/agents/README.md` updated: Core intentionally ships zero worker agents (agents come from heir workspaces or specialization plugins), so "Empty in v0.1.0. Content ships here through..." was inaccurate. Reframed to reflect the design intent.

**Compatibility — `.github/instructions/agent-delegation.instructions.md`** (Medium):

- Original instruction stated "Before authoring any markdown document... the model must check whether a loaded worker SA matches the task." Core ships 0 agents; a heir without any prior `markdown-author`/`illustrator`/`document-assembler` workers in their agent set would find the instruction referencing named workers that do not exist.
- Reframed as **conditional**: the instruction fires only when a matching worker is currently loaded in the session. The three workers (`markdown-author`, `illustrator`, `document-assembler`) are named as common examples heirs may install, not as required infrastructure. If no matching worker is loaded, the parent handles the work directly and the instruction adds no friction. Added an anti-pattern entry against fabricating a worker name that is not loaded.

**Missing baseline — `.github/config/welcome-baseline.json`** (Medium):

- `/configure-vscode` and its verify counterpart both reference `.github/config/welcome-baseline.json` to load the ACT-critical settings they apply or audit. That file did not exist in Core, so both prompts had a broken load step.
- Added a Core-scoped baseline (spec_version 1.0) with 23 settings across 7 categories: update infrastructure, chat agent core (chat.useAgentSkills / chat.includeReferencedInstructions / chat.agent.enabled), Copilot chat features (memory tiers / codesearch / deferred tool loading / skill picker), terminal safety, UX cohesion, experimental opt-outs (implicitContext / symbolTools.cacheStable), and safety locks against dangerous Claude Agent permission modes.

**Steward-only assumption softening — `humanizer/SKILL.md` + `risk-analysis.instructions.md`** (Medium):

- `humanizer/SKILL.md` referenced Steward's `markdown-author` agent and Cardinal Rule 2 (Steward-only em-dash ban) as if they were baseline heir infrastructure. Reworded to name them as example patterns some project brains ship, not requirements the humanizer skill depends on.
- `risk-analysis.instructions.md` routed to a `/cut-release` prompt (not shipped in Core), `store-evaluation` (Steward-only), and "Edition brain architecture" (v1 language). Generalized to "your project's release process", "an external artifact that scored below your project's acceptance bar", and "your project's brain architecture".

**Count accuracy — `.github/skills/README.md`** (Low):

- Header said "31 skills ship as of Batch 10" but Core ships 30 (svg-banner un-ported to illustrator on 2026-07-30). Updated to 30.

**Verification**:

- `manifest.json` + `.github/config/welcome-baseline.json` parse strictly (`node -e JSON.parse(...)`).
- Filesystem inventory matches manifest.assets counts: 30 skills / 33 instructions / 9 prompts / 0 agents / 2 config files / 4 shared runtime modules.
- `get_errors` clean on all 9 modified files.
- Command-injection probe returns only `SAFE_CHILD`; four-converter round-trip returns exit 0 on md-to-html (3249 bytes), md-to-txt (23 bytes), md-to-word (11166 bytes), docx-to-md (26 bytes).
- No lingering "empty scaffold" / "empty in v0.1.0" / `/cut-release` / `store-evaluation` references in the active brain.

### svg-banner un-ported to Alex_ACT_Illustrator_Plugin (2026-07-30)

Per Fabio directive 2026-07-30 ("svg-banner should only be in the illustrator"), the `svg-banner` skill + `/banner` prompt un-ported from Core to `Alex_ACT_Illustrator_Plugin` (v0.6.0, commit `e6ad02f`). Rationale: banner authoring is visual-authoring capability and belongs alongside `docs-shell` + `flint-chart` + `chart-big-idea` + `chart-vocabulary` + `render-verify` + `print-svg-style-guide` + `figure-generator` + `replicate-imagery` in the illustrator plugin — not in the Core baseline that every heir installs.

Removed from Core:

- `.github/skills/svg-banner/` (skill body + `assets/mark-mono-emerald-256.png` + `scripts/generate-banner.cjs`)
- `.github/prompts/banner.prompt.md`
- `.github/config/banner-brand.json` (structure config for the svg-banner skill — orphaned after skill removal)

Cross-refs updated:

- `.github/skills/browser-tools/SKILL.md` — dead link to `../svg-banner/SKILL.md` replaced with reference to illustrator plugin
- `.github/skills/markdown-mermaid/SKILL.md` — 3 svg-banner references updated to route through illustrator plugin; the `brand-palette.json` sharing note preserved (Core's markdown-mermaid still reads that palette, and it's still shared with the illustrator plugin's svg-banner + illustrator agent + flint-chart)
- `.github/skills/README.md` — svg-banner row removed from skills table; summary paragraph deduplicated (5 identical paragraphs → 1); banner-generation note added pointing at illustrator plugin
- `.github/prompts/README.md` — banner.prompt.md row removed; count 10 → 9

Manifest updates:

- `shape`: `thirty-three-instructions + thirty-one-skills + ten-prompts` → `thirty-three-instructions + thirty-skills + nine-prompts (…; svg-banner + /banner un-ported to Alex_ACT_Illustrator_Plugin on 2026-07-30)`
- `description` refreshed to reflect the un-port
- `assets.skills[]`: 31 → 30 (svg-banner entry removed)
- `assets.prompts[]`: 10 → 9 (banner entry removed)
- `assets.instructions[]`: unchanged at 33

`.github/config/brand-palette.json` retained — still consumed by `markdown-mermaid` for its init directive and classDef vocabulary, and still shared cross-repo with the illustrator plugin's svg-banner + illustrator agent + flint-chart.

### Added — Batch 10: Sundries cluster (2026-07-30)

Eleven artifacts closing the Both-classified inventory: 4 always-on instructions + 3 skills + 4 slash-command prompts. Completes Core's core content set (Both-classified inventory fully ported).

**Instructions (4)**:

- **`agent-delegation.instructions.md`** (`applyTo: **/*agent*,**/*delegate*,**/*subagent*,...`) — Delegate mechanical work (markdown authoring, diagram rendering, file conversion, assembly) to worker subagents so the parent session keeps capacity for reasoning. Names the workers, the delegation decision table, and self-check discipline before authoring mechanical output directly.
- **`code-review.instructions.md`** (`applyTo: **/*review*,**/*audit*,**/*pr*`) — Code review quality gate protocols and feedback guidelines. Routes to `code-review` skill for the systematic-review body.
- **`risk-analysis.instructions.md`** (`applyTo: **/*risk*,**/*plan*,**/*assess*,...`) — Risk assessment via probability×impact scoring. Applied to curation decisions (skill acceptance, release gating). Distinguishes reversible from expensive-to-undo decisions.
- **`status-reporting.instructions.md`** (`applyTo: **/*status*,**/*report*,**/*update*`) — Routing pointer to `status-reporting` skill for stakeholder-friendly project updates.

**Skills (3)**:

- **`ai-memory-setup/SKILL.md`** — Resolve and use the `Alex_ACT_Memory` sibling repository as shared memory bus without silently cloning, syncing, or exposing protected data. Covers announcements, feedback, shared knowledge, explicit setup. Heirs who don't use the Memory sibling can safely ignore.
- **`code-review/SKILL.md`** — Systematic code review for correctness, security, and growth — not just style enforcement. Composes with `security-and-hardening` (Batch 6) for OWASP-scoped review and `adversarial-review` instruction (Batch 1) for structured skepticism.
- **`status-reporting/SKILL.md`** — Create stakeholder-friendly project status updates and progress reports. Audience-adapted. Composes with `communication-craft` (Batch 4) for So-What/What/Now-What audience lead.

**Prompts (4)**:

- **`banner.prompt.md`** (`/banner`) — User-invokable trigger for SVG banner generation via the `svg-banner` skill (Batch 9). Produces 1200×320 branded banner using `.github/config/{banner-brand,brand-palette}.json`.
- **`configure-vscode.prompt.md`** (`/configure-vscode`) — Apply VS Code user-scope baseline settings for policy compliance. Heirs adapt for their project's baseline config.
- **`configure-vscode-verify.prompt.md`** (`/configure-vscode-verify`) — Read-only audit of user-level VS Code/Copilot settings compliance. Companion to `/configure-vscode`.
- **`status.prompt.md`** (`/status`) — Terse read-only project orientation report: identity, git state, HANDOFF.md continuity, optional brain-QA health, announcements. Audience-adapted output leading with material state.

**Adaptation applied**:

- 9 of 11 files ported verbatim.
- `risk-analysis.instructions.md`: (a) rewrote "Applied to Supervisor curation: accepting a bad skill is reversible... Shipping a broken release to 5+ heirs is expensive to undo" to "Applied to curation work: ... Shipping a broken release to consumers is expensive to undo" — heirs don't necessarily have downstream heirs; generalized; (b) reframed `operations/ledgers/brain-qa-changelog.md` tracking ref as "your project's audit trail (Alex ACT itself uses ...)".
- `status.prompt.md`: substantially rewritten from Steward-specific to project-generic. Original said "Produce a terse read-only orientation report for `Alex_ACT_Steward`" and hardcoded `node scripts/brain-qa.cjs` invocations. Rewrote to: "Produce a terse orientation report for the current project", made brain-QA step conditional ("If your project ships brain-QA muscles ... otherwise skip and note absence"), made Memory sibling reference conditional ("If the project configures a shared memory bus ..."). Preserves the shape (identity + git state + continuity + brain health + announcements + output) as an audience-adapted status pattern.
- `ai-memory-setup/SKILL.md` retains all `Alex_ACT_Memory` sibling-repo references as-is — they're by design (the skill IS about Alex_ACT_Memory). Heirs who don't use Memory ignore this skill safely.

**Composition with earlier batches**:

- `agent-delegation` (this batch) + `plan` (Batch 2): plan-mode discipline names when to invoke a subagent; agent-delegation names how.
- `code-review` instruction + skill (this batch) + `security-and-hardening` (Batch 6): OWASP-scoped review composes into general code review.
- `code-review` + `adversarial-review` (Batch 1): structured skepticism at review time.
- `risk-analysis` (this batch) + `problem-framing-audit` (Batches 1+2): frame first, then assess risk.
- `status-reporting` (this batch) + `communication-craft` (Batch 4): status reports use audience lead + stakeholder-adapted framing.
- `/banner` (this batch) invokes `svg-banner` skill (Batch 9) — resolves the composition surface between prompt and skill.
- `/status` (this batch) reads `HANDOFF.md` per `proactive-awareness` (Batch 4) + `memory-triggers` (Batch 3) cross-session-continuity patterns.

### Added — Batch 9: Craft skills cluster (2026-07-30)

Thirteen artifacts covering authoring craft (big-idea, humanizer, doc-hygiene, markdown-mermaid, markdown-sanitization-chain, lint-clean-markdown, svg-banner) and engineering craft (mutation-testing, systematic-debugging, test-driven-development, token-waste-elimination). Largest batch to date and closes the pending `svg-banner` cross-ref from Batch 7 (browser-tools).

**Instructions (2)**:

- **`doc-hygiene.instructions.md`** — Routing pointer to doc-hygiene skill; fires on `**/*doc*audit*,**/*doc*quality*,**/*drift*,**/*hygiene*` patterns.
- **`markdown-mermaid.instructions.md`** — Routing pointer to markdown-mermaid skill; fires on `**/*.md,**/*mermaid*` patterns.

**Skills (11)**:

- **`big-idea/SKILL.md`** — Distill the central claim before summary-shaped output (hero copy, commit subjects, PR titles, ADR titles, executive summaries). 6-step distill (context read → claim → arc → audience → stance → emit) tested against Saint-Exupéry's removal rule (delete sentences until the next deletion breaks the claim).
- **`humanizer/SKILL.md`** — Remove 29 documented AI-writing patterns (Wikipedia's "Signs of AI writing") via draft → self-audit → rewrite. Optional voice-calibration from user-provided writing sample. Adapted from Hermes Agent / blader/humanizer.
- **`doc-hygiene/SKILL.md`** — Anti-drift rules for living documents: count elimination (hardcoded counts become stale within days), single source of truth per metric, link-integrity checker (find broken markdown links across the tree), orphan detection, docs-as-architecture principle.
- **`markdown-mermaid/SKILL.md`** — Author Mermaid diagrams that render correctly on first attempt. Config-driven init directive + linkStyle + semantic classDef vocabulary from `.github/config/brand-palette.json` (6-role palette: blue/green/purple/gold/red/neutral + typography). Bundled references: `references/pitfalls.md` (renderer footguns), `references/tool-ecosystem.md` (Mermaid vs Excalidraw vs D2 vs PlantUML), `references/diagram-reference.md`, `references/markdown-best-practices.md`, `markdown-light.css` (preview styling).
- **`markdown-sanitization-chain/SKILL.md`** — Render user-supplied markdown safely via `marked.js → DOMPurify → Mermaid` pipeline. Order matters — skipping the sanitizer is XSS. DOMPurify allowlist for Mermaid-specific attributes.
- **`mutation-testing/SKILL.md`** — Meta-test the test harness: apply small intentional defects to production code and expect the suite to catch each one. Surfaces silent coverage gaps that 100% line-coverage hides.
- **`systematic-debugging/SKILL.md`** — 4-phase root-cause-first method (investigate → pattern-analyze → hypothesize → implement) that beats guess-and-check thrashing. Use for any bug, test failure, unexpected behavior before proposing fixes.
- **`test-driven-development/SKILL.md`** — Enforce RED-GREEN-REFACTOR for any feature, bug fix, refactor, or behavior change. Write failing test first, watch it fail, write minimal code to pass, refactor. Carve out only throwaway prototypes and generated code.
- **`token-waste-elimination/SKILL.md`** — Audit active brain artifacts for context cost, duplicated guidance, oversized routing files, stale metadata. Use during brain audits, quarterly review, or when instructions feel heavy.
- **`lint-clean-markdown/SKILL.md`** — Write markdown that passes markdownlint on first attempt. Encodes the most common rules (MD012 blank-line, MD022 heading-spacing, MD040 fenced-code language, MD024 unique-heading, MD029 ordered-list) as muscle memory.
- **`svg-banner/SKILL.md`** — Generate 1200×320 SVG banners for READMEs, plans, notes, release artifacts. Bundled `scripts/generate-banner.cjs` muscle + `assets/mark-mono-emerald-256.png` mark. Pluggable brand via `.github/config/banner-brand.json` (structure) + `.github/config/brand-palette.json` (colors/typography). Default is the Alex ACT brand (slate-900 background, emerald-teal-cyan accent, x-loop mark, ACT/EDITION/DOCS/RELEASE/PLAN/NOTE watermarks). Heirs override the config for their own brand. **Closes the pending cross-ref from Batch 7 (`browser-tools` referenced svg-banner).**

**Bundled resources**:

- `.github/config/brand-palette.json` — Shared 6-role semantic palette + typography, referenced by markdown-mermaid, svg-banner, and (in the sibling ecosystem) the illustrator plugin's flint-chart + print-svg-style-guide skills.
- `.github/config/banner-brand.json` — Banner-specific structure config (labels, mark, watermarks, colors); shipped with default Alex ACT brand values, heirs override.
- `.github/skills/svg-banner/assets/mark-mono-emerald-256.png` — Default Alex ACT x-loop mark, 256×256 mono emerald.
- `.github/skills/svg-banner/scripts/generate-banner.cjs` — Banner generator; reads both config files with shallow-merged fallback to built-in Alex ACT default so behavior is byte-equivalent when no config override is present.
- `.github/skills/markdown-mermaid/references/{diagram-reference,markdown-best-practices,pitfalls,tool-ecosystem}.md` + `markdown-light.css` — Reference bundle and preview CSS.

**Adaptation applied**:

- 11 of 13 files ported verbatim. Two required light adaptation to remove Steward-specific references while preserving the discipline:
  - `big-idea/SKILL.md`: (a) rewrote "American English, per Cardinal Rule 4 in `copilot-instructions.md`" to "American English by default (if your project defines a language rule in `copilot-instructions.md`, follow it — Alex ACT itself uses American English per Cardinal Rule 4)" — preserves the recommendation while acknowledging heirs may have their own language rule; (b) same soften in the anti-patterns table row for British spelling; (c) rewrote the `## Falsifiability` tracking line from "Track in `operations/ledgers/curation-log.md`" to "Track in your project's audit trail (Alex ACT itself tracks in `operations/ledgers/curation-log.md`)" — heirs adapt to their own ledger location.
  - `token-waste-elimination/SKILL.md`: reframed the two `node scripts/brain-qa.cjs` invocation blocks as "if your project ships brain-QA muscles like Alex ACT's ..." so heirs without those muscles have a fallback path (measure by hand). The scripts still ship in Alex_ACT_Steward and heirs installing Core through the plugin transport won't have them locally by default.
- Zero content edits to the other 11 files. `mutation-testing/SKILL.md` retains its origin story naming Alex_ACT_Extension + Alex_ACT_Edition commits as historical evidence of pattern effectiveness — the story is illustrative, not an example a heir needs to reproduce.

**Composition with earlier batches**:

- `big-idea` (this batch) + `communication-craft` (Batch 4): communication-craft frames the whole message; big-idea frames only the headline. Composable.
- `humanizer` (this batch) + `big-idea` (this batch): big-idea authoring routes through humanizer's AI-tell check before emit.
- `doc-hygiene` (this batch) + `no-deferred-debt` (Batch 4): both fire on stale content — no-deferred-debt for tech-debt scope, doc-hygiene for documentation-drift scope.
- `markdown-mermaid` (this batch) + `svg-banner` (this batch): shared `brand-palette.json` config keeps mermaid diagrams and SVG banners visually consistent.
- `markdown-sanitization-chain` (this batch) + `security-and-hardening` (Batch 6): both surface XSS — security-and-hardening at the code boundary, markdown-sanitization-chain at the render pipeline.
- `mutation-testing` + `test-driven-development` + `systematic-debugging` (all this batch): three engineering-quality disciplines compose — TDD writes the test, systematic-debugging fires when the test surfaces a defect, mutation-testing meta-tests whether the test suite is trustworthy.
- `token-waste-elimination` (this batch) + `doc-hygiene` (this batch): both audit active content for waste; token-waste-elimination is context-cost-scoped, doc-hygiene is documentation-drift-scoped.
- `svg-banner` (this batch): resolves the pending cross-ref from `browser-tools/SKILL.md` (Batch 7). Batch 7's dangling reference now resolves locally in Core.

### Added — Batch 8: Git + lint + MCP cluster (2026-07-30)

Five artifacts covering the highest-frequency developer disciplines heirs need after platform safety: version control, lint ownership, and Model Context Protocol server construction.

**Instructions (3)**:

- **`git-workflow.instructions.md`** (`applyTo: **/.*git*,**/.github/**`) — Branch hygiene, safe-commit patterns (severity-tagged per `[typo|clarification|behaviour|constitutional]` convention), recovery from lost commits + bad merges + accidental pushes.
- **`lint-discipline.instructions.md`** (`applyTo: **`) — If you touched a file, you own its lint state on exit. Pre-existing findings become yours the moment you open the file — no "not my edit" excuses. Use VS Code 1.122+ **"Search only in changed files"** toggle to enumerate the scope. Codified 2026-04-30 from a real defect where 10 MD060 findings were shipped as "pre-existing."
- **`mcp-development.instructions.md`** (`applyTo: **/*mcp*,**/*mcp-server*,...`) — Routing pointer that fires on MCP file patterns and delegates to the `mcp-builder` skill for detailed authoring guidance.

**Skills (2)**:

- **`git-workflow/SKILL.md`** — Detailed procedures backing the git-workflow instruction. Worked examples for branch creation, staging discipline, commit message shape, recovery from `git reset --hard` mistakes, `git reflog` triage, force-push protection.
- **`mcp-builder/SKILL.md`** — Complete authoring guide for MCP servers in Python (FastMCP), Node/TypeScript (MCP SDK), and C#/.NET (Microsoft MCP SDK). Includes: (1) **Build vs Use Existing** decision matrix listing Microsoft's built-in MCPs (Azure MCP with 48+ services, Foundry MCP, Fabric MCP, Playwright MCP, GitHub MCP); (2) implementation patterns per language; (3) authentication with `DefaultAzureCredential` for Azure-targeted servers; (4) testing checklist; (5) common-issues table (connection failures, auth expiry, tool discovery, timeouts, schema validation).

**Adaptation applied**:

- `git-workflow.instructions.md`, `lint-discipline.instructions.md`, `mcp-development.instructions.md`, `git-workflow/SKILL.md` — ported verbatim. Zero content edits.
- `mcp-builder/SKILL.md` — dropped the `## Supervisor Curation Use` section (lines 11-38: three Steward-only duties around Mall MCP curation, evaluating heir MCP requests, and triaging heir MCP escalations; heirs don't curate the Mall or triage other heirs' work). Rewrote the opening paragraph from "Build, curate, and triage MCP servers for ACT heirs and the Plugin Mall. Three Supervisor duties below..." to a heir-appropriate framing. Dropped the `mall-curation` cross-reference from Related Skills. Everything else preserved verbatim.

**Composition with earlier batches**:

- `git-workflow` (this batch) + `no-deferred-debt` (Batch 4): if a git operation surfaces stale references, fix in the same turn.
- `lint-discipline` (this batch) + `no-deferred-debt` (Batch 4): pre-existing lint findings on a touched file are debt — both rules converge on "fix now."
- `mcp-builder` (this batch) + `security-and-hardening` (Batch 6): MCP servers accept untrusted tool arguments — hardening principles apply.
- `mcp-development` (this batch) + `tool-awareness` (Batch 7): both address the tool ecosystem from different angles — tool-awareness for consumption, mcp-development for production.

### Added — Batch 7: Tooling awareness cluster (2026-07-30)

Four artifacts covering the platform-safety discipline heirs need before their first terminal command, deferred-tool call, or browser interaction.

**Instructions (3)**:

- **`terminal-command-safety.instructions.md`** (`applyTo: **`) — Backtick Hazard prevention (always temp-file for backticks / multi-line / heredoc; place temp file OUTSIDE working tree to prevent commit leak; git commit-message pattern with `$env:TEMP` + `-F $m`). Output capture failures (redirect-then-read pattern). Terminal hanging (`mode=async` for >15s commands, non-interactive flags, network timeouts, no heredoc blocks). VS Code 1.117-1.128 platform-change table.
- **`tool-awareness.instructions.md`** (`applyTo: **`) — Deferred tools (VS Code 1.118+) require `tool_search` before use. External ingest (VS Code 1.119+) provides context in remote workspaces. VS Code 1.122-1.128 conveniences table. Skill picker surfacing (VS Code 1.118+): SKILL.md descriptions appear in the slash picker alongside prompts; **never strip descriptions to declutter the picker** — three-consumer discipline (agent discovery + brain QA + picker tooltip).
- **`tool-awareness-categories.instructions.md`** (`applyTo: **/*tool*,**/*mcp*,**/*github*,...`) — Scoped companion reference. Common deferred-tool categories (GitHub, Azure, Fabric, Microsoft docs, browser, notebook, mermaid, bicep, figma, Microsoft Graph) with search-query patterns. Loads only when working with tools / MCP / GitHub — not always-on.

**Skills (1)**:

- **`browser-tools/SKILL.md`** — VS Code 1.127+ browser tools (`open_browser_page`, `screenshot_page`, `click_element`, `navigate_page`, `run_playwright_code`). Five patterns: (1) bot-protected sites (`fetch_webpage` returns challenge → browser tools clear it naturally); (2) password-hand-off protocol (**never** `type_in_page` on password / MFA / OTP fields — route to user, they type into visible browser); (3) file:// local rendering (HTML with `fetch()` of sibling .md/.json/.svg works under Playwright's file-access flags; no HTTP server needed); (4) SVG/PNG/JPG/WebP/GIF/AVIF/PDF viewing via file://; (5) design/UI validation via screenshot-driven review. Empirically verified 2026-07-26 against Alex_ACT_Steward's docs shell + branding SVGs (evidence preserved as illustration; heirs adapt paths to their workspace).

**Adaptation applied**:

- All 4 files ported from Steward. Minimal adaptation: one line in `tool-awareness.instructions.md` changed "Supervisor ships one" → "Alex_ACT_Steward ships one" (accurate historical reference for current-state Steward, still names a concrete example).
- `browser-tools/SKILL.md` retains the 2026-07-26 empirically-verified paths from Alex_ACT_Steward's workspace as illustration — the framing already labels them as verification evidence + template. Heirs adapt paths to their own workspace.
- Intra-Core cross-refs resolve locally: `browser-tools/SKILL.md` references `tool-awareness.instructions.md` (this batch) + `system-prompt-skepticism.instructions.md` (Batch 1) + `terminal-command-safety.instructions.md` (this batch); `browser-tools` also references `svg-banner` (**pending future batch — will not resolve yet**).

**Composition with earlier batches**:

- `tool-awareness` (this batch) + `tool-awareness-categories` (this batch) form a scoped pair: always-on rule + on-demand lookup table.
- `terminal-command-safety` (this batch) + `security-and-hardening` (Batch 6): OWASP boundary in code, safety boundary in the shell that generates code. Complementary layers.
- `browser-tools` (this batch) + `pii-memory-filter` (Batch 6): screenshots can capture PII — PMF's write-boundary rules apply to any image the agent persists to `../Alex_ACT_Memory/`.
- `terminal-command-safety` (this batch) + `no-deferred-debt` (Batch 4): temp-file commit-message leaks are debt — the rule surfaces both the prevention AND "clean up the temp file this turn".

### Added — Batch 6: Security & privacy cluster (2026-07-30)

Four artifacts covering the always-on privacy + safety discipline heirs need before their first interaction with untrusted data or shared fleet channels.

**Instructions (3)**:

- **`pii-memory-filter.instructions.md`** (`applyTo: **`) — PII filter at persistent-storage write boundaries. Never-write categories: contact info, DOB, health, financial, credentials, file paths with usernames, client names. Per-tier allow/deny table for User / Repo / Session / Shared memory + escalation paths when PII is genuinely required (contact → encrypted profile, health → decline, credentials → SecretStorage, work patterns → generalize).
- **`cross-project-isolation.instructions.md`** (`applyTo: **/Alex_ACT_Memory/**,**/announcements/**,**/*fleet*`) — Distinct from `pii-memory-filter`: protects **project boundaries** (scope), not identity. Fires before writes to shared fleet channels. Strip project-identifying detail (paths, product names, domain IDs, niche stack); keep shared vocabulary (skill names, severity, ACT terms). Refuses on-request override ("just write it, don't strip").
- **`privacy-responsible-ai.instructions.md`** (`applyTo: **/*privacy*,**/*pii*,**/*responsible*ai*,**/*ethic*`) — Privacy by design 5-step (minimize / purpose-limit / anonymize / encrypt / expire), PII classification table (Personal / Sensitive / Anonymized), Responsible AI principles (fairness, transparency, human oversight, safety).

**Skills (1)**:

- **`security-and-hardening/SKILL.md`** — OWASP-aware hardening for user input, authentication, data storage, and external integrations. Three-tier boundary system: **Always Do** (parameterized queries, output encoding, HTTPS, hashed passwords, security headers, httpOnly cookies, dependency audits), **Ask First** (new auth flows, new sensitive data categories, new external integrations, CORS changes, file uploads), **Never Do** (commit secrets, log sensitive data, trust client validation, disable security headers, `eval`, session in localStorage). OWASP Top 10 prevention patterns with TypeScript examples applicable to any language.

**Adaptation applied**:

- All 4 files ported **verbatim** from Steward. Zero content edits.
- Intra-Core cross-refs resolve locally: `pii-memory-filter` references `memory-triggers` (Batch 3) ✅; `cross-project-isolation` references `pii-memory-filter` (this batch) ✅, `note.prompt.md` + `save-session-note.prompt.md` (both Batch 3) ✅.
- References to `../Alex_ACT_Memory/` retained as-is (heir workspace layout determines whether the sibling repo exists; the filter fires without it).

**Composition with earlier batches**:

- `pii-memory-filter` (this batch) + `memory-triggers` (Batch 3): MT decides *where* to write; PMF decides *what* may be written. Both fire together on any persistence.
- `cross-project-isolation` (this batch) + `save-session-note` (Batch 3): the note prompt writes to `HANDOFF.md` (local, no strip) or shared memory (strip fires).
- `security-and-hardening` (this batch) + `no-deferred-debt` (Batch 4): if security review surfaces a vulnerability, fix in the same turn per no-deferred-debt.
- `security-and-hardening` (this batch) + `problem-framing-audit` (Batch 1+2): a security-review request without a specific attack surface is a framing failure — audit before hardening.

### Added — Batch 5: Document converters (2026-07-30)

First batch to ship executable code — a self-contained conversion cluster with one routing instruction, one slash-command prompt, six format skills each with their own executable muscle, and a shared runtime toolkit under `.github/scripts/shared/`.

**Instruction (1)**:

- **`converter.instructions.md`** — Document conversion routing. Detects source and target format from the user's request, delegates to the matching format skill + muscle. Applies on `**/*convert*,**/*docx*,**/*word*,**/*eml*,**/*html-to-md*,**/*md-to-*`.

**Prompt (1)**:

- **`convert.prompt.md`** (`/convert`) — User-invokable trigger. Steps: detect formats → load format skill → run muscle → validate output → report.

**Skills (6)** with bundled executable muscles under `<skill>/scripts/`:

- **`docx-to-md/`** — Word (.docx) → clean Markdown with image extraction and pandoc cleanup.
- **`html-to-md/`** — HTML → clean Markdown via pandoc.
- **`md-to-eml/`** — Markdown → RFC 5322 email (.eml) with inline CSS and CID images.
- **`md-to-html/`** — Markdown → standalone HTML with embedded CSS, images, and Mermaid diagrams.
- **`md-to-txt/`** — Markdown → clean plain text via pandoc.
- **`md-to-word/`** — Markdown (with Mermaid + SVG) → Word (.docx). Uses jszip when available, falls back to pandoc.

**Shared runtime (4 modules under `.github/scripts/shared/`)** — bundled with the plugin, not declared as separate assets in `assets[]` because they're used by the converter skills, not independently invokable:

- **`tool-runner.cjs`** — Shell-invocation helper with structured error handling.
- **`markdown-preprocessor.cjs`** — Frontmatter parsing, Mermaid extraction, SVG resolution.
- **`mermaid-pipeline.cjs`** — Mermaid diagram rendering via mermaid-cli.
- **`data-uri.cjs`** — Base64 encoding for embedded images.

**Adaptation applied**:

- All 8 markdown files + 6 skill scripts + 4 shared runtime modules ported **byte-identically** from Steward (which itself byte-identically ported them from Edition v4.2.0). Zero content edits.
- `SKILL.md` cross-references to `../../../operations/ledgers/curation-log.md` and other Steward paths retained as-is (heirs' own repo layout dictates whether these resolve; the muscles run without them).
- The `converter.instructions.md` routing table points at `node .github/skills/<format>/scripts/<format>.cjs` paths — these resolve locally in Core because the scripts ship at those exact paths.

**Runtime prerequisites** (heirs must install separately):

- **pandoc** on PATH (required for all 6 converters) — `winget install --id JohnMacFarlane.Pandoc -e` or [pandoc.org](https://pandoc.org/installing.html).
- **mermaid-cli** on PATH (required for md-to-html + md-to-word when Mermaid diagrams present) — `npm install -g @mermaid-js/mermaid-cli`.
- **jszip** (optional; only used by md-to-word for faster .docx generation) — `npm install jszip` inside a Node project or globally.

**Composition with earlier batches**:

- `converter.instructions.md` fires on document conversion requests → routes to format skill → `convert.prompt.md` (Batch 5) provides the user-facing slash command.
- `no-deferred-debt.instructions.md` (Batch 4) composes: if a converter surfaces stale references in the middle of a conversion, fix in the same turn.
- `problem-framing-audit.instructions.md` (Batch 1 + skill Batch 2) fires when the user says "convert this" without a target format — frame audit surfaces the ambiguity before the converter runs.

### Added — Batch 4: Craft + cognitive-discipline (2026-07-30)

Seven always-on instructions completing the cognitive foundation that runs alongside the ACT canon. Same-shape port as Batch 1 (instructions only, no cross-artifact coupling).

**Instructions (7)**:

- **`communication-craft.instructions.md`** — SBI feedback model, stakes calibration, code-review voice, So-What/What/Now-What audience lead, Need/Solution/Feature elicitation ladder.
- **`emotional-intelligence.instructions.md`** — 6-signal detection (frustration / confusion / success / flow / excitement / disengagement) with per-signal adaptation. Mimicry prevention (don't adopt user distress vocabulary).
- **`knowledge-coverage.instructions.md`** — High / Medium / Low / Unknown taxonomy with per-level language calibration. Optional visible-confidence badge gated on heir workspace's `.github/config/cognitive-config.json`.
- **`no-deferred-debt.instructions.md`** — If a turn surfaces tech debt (stale references, dead links, outdated content), fix it in the same turn. Deferral requires a named decision-blocker, not vague 'follow-up'. Composes with `lint-discipline` (pending future batch).
- **`proactive-awareness.instructions.md`** — PA1 cross-session context recovery (check `HANDOFF.md` at session start), PA2 uncommitted-work detection (count-only nudges >24h old), PA4 focus routing (`goals.json`), silence-as-signal inhibitor (never interrupt flow).
- **`reliance-nudges.instructions.md`** — 6 over-reliance signal patterns (prompt roulette, zero verification, instant high-stakes acceptance, verbatim acceptance, confidence cascade, repeated same error) with per-pattern one-sentence nudge and 5 inhibition rules.
- **`session-health-monitoring.instructions.md`** — Monitor context window via proxy heuristics (~4 chars/token) + BYOK token counter (VS Code 1.120+). Graceful handoff to `HANDOFF.md` when approaching session limits.

**Adaptation applied** (same moderate rules as Batches 1–3):

- Frontmatter, body content, `## Would Revise If` sections preserved verbatim
- Intra-Core cross-references resolve locally (`memory-triggers` ↔ `proactive-awareness`)
- References to heir-workspace config files (`.github/config/cognitive-config.json`, `.github/config/goals.json`, `.github/quality/dream-report.json`) preserved as-is — heirs can adopt or ignore these optional signals
- Reference to `lint-discipline.instructions.md` in `no-deferred-debt` preserved as-is (will resolve when a later batch ships lint-discipline)
- Reference to `tool-awareness.instructions.md` in `session-health-monitoring` preserved as-is (will resolve when a later batch ships tool-awareness)
- References to Mall skills in `reliance-nudges` `## What This Replaces` section preserved as-is (educational Mall skills exist independently of Core)
- Steward-specific origin note in `no-deferred-debt` (`Alyva_Master heir-side discipline (FOUR-REPOS-COMPARISON.md Tier A §0.1 row 3)`) dropped from the Origin section; the discipline itself is preserved
- `lastReviewed` dates preserved from source

**Composition with Batches 1–3**: `memory-triggers` (Batch 3) and `proactive-awareness` (Batch 4) both reference `HANDOFF.md` as the canonical cross-session continuity surface. `epistemic-calibration` (Batch 1) and `knowledge-coverage` (Batch 4) both address confidence expression — different angles: calibration is the always-on floor; coverage is the per-topic assessment. `reliance-nudges` composes with `critical-thinking` (Batch 1 + skill Batch 2) by nudging the user when they skip verification the critical-thinking discipline would have caught.

**Cumulative content in this Unreleased range**: 17 instructions + 7 skills + 5 prompts = 29 total items (0 agents). Version bump to 0.2.0 will happen when the first release is cut.

### Added — Batch 3: Meditation loop (2026-07-30)

Two instructions + one skill + three prompts — the meditation cluster that lets heirs consolidate session learning into permanent architecture. First cross-artifact bundle (instruction ↔ skill ↔ prompt loop) ships in this batch, proving the pattern at small scale.

**Instructions (2)**:

- **`meditation.instructions.md`** — 6-step ritual protocol (review + extract + write + chronicle + handoff + post-mortem). Fires on session end, hard-problem resolution, or explicit user request ("let's meditate", `/meditate`). Includes memory tier routing table.
- **`memory-triggers.instructions.md`** — Always-on triggers for proactive memory formation. Fires on user correction, 3× pattern recurrence, preference declaration, session-end continuity risk. Includes tier selection table + cross-session continuity rules (`HANDOFF.md` at repo root, NOT `/memories/session/`).

**Skills (1)**:

- **`meditation/SKILL.md`** — Detailed body for the always-on `meditation.instructions.md`. 5-step protocol with routing table (which artifact type to write, per pattern). Companion to the meditation instruction; invoked by the `/meditate` prompt.

**Prompts (3)**:

- **`meditate.prompt.md`** (`/meditate`) — User-invokable trigger for the meditation protocol. Loads the meditation skill, runs review + extract + write + chronicle + handoff + `/compact`.
- **`save-session-note.prompt.md`** (`/save-session-note`) — Capture a short pending-action note in repo-root `HANDOFF.md`. Optional mirror to shared memory (`../Alex_ACT_Memory/notes.md` per the Alex ACT constellation, or heir-configured equivalent) with project-specifics stripping.
- **`note.prompt.md`** (`/note`) — Short alias for `/save-session-note`. Skip the "what should I capture?" question if user's request already includes the note text.

**Adaptation applied** (same moderate rules as Batches 1 + 2):

- Frontmatter, body content, `## Would Revise If` sections preserved verbatim where heir-generic
- Intra-Core cross-references (instruction ↔ skill ↔ prompt within the meditation cluster) resolve locally
- `.act-heir.json` reference in `save-session-note.prompt.md` dropped — it's v1 heir-template infrastructure (`Alex_ACT_Edition` marker) that plugin-native heirs don't have. Replaced with generic "project identifier if available".
- `Legacy migration` section in `save-session-note.prompt.md` dropped — it described a 2026-05-18 `SESSION-HANDOFF.md` → `HANDOFF.md` rename that only applies to Steward-era heirs; plugin-native heirs have no legacy state.
- `Brain Retraining (longer cycles)` section in `meditation/SKILL.md` heavily trimmed — the original described Steward's weekly `brain-qa` queue, monthly `/audit-coherence`, quarterly retraining ADR cadence (all Steward-curator work). Replaced with a short heir-appropriate "per release / per quarter (optional)" cadence note.
- References to `../skills/append-and-review/SKILL.md` (Steward-only) dropped
- References to `../instructions/brain-curation-rules.instructions.md` (Steward-only) dropped
- References to `docs/templates/quarterly-retraining-ADR.md` (Steward-only template) dropped
- Cardinal Rule 3 audit-criteria section dropped (Cardinal Rule 3 is Steward's rule, not heir's)
- Reference to `../../Alex_ACT_Memory` sibling repo preserved as-is (per the Alex ACT constellation shape)
- `lastReviewed` dates preserved from source

**Cross-artifact loop verified**: the meditation cluster forms a self-contained loop where `meditation.instructions.md` (always-on) triggers `meditation/SKILL.md` (detailed body) which is invoked by `/meditate` (slash command). `memory-triggers.instructions.md` (always-on) triggers automatic writes to `HANDOFF.md` via `/save-session-note` or its short alias `/note`. All refs within the cluster resolve locally within Core.

**Cumulative content in this Unreleased range**: 10 instructions + 7 skills + 5 prompts = 22 total items (0 agents). Version bump to 0.2.0 will happen when the first release is cut.

### Added — Batch 2: Reasoning + planning muscles (2026-07-30)

Six skills + two paired slash-command prompts. Batch 2 completes the reasoning loop that Batch 1's ACT canon instructions gestured at: the instructions declared *when* to think critically; the Batch 2 skills declare *how*.

**Skills (6)**:

- **`anti-hallucination/SKILL.md`** — First leg of the epistemic triad. Prevents fabrication at generation point via input-discipline + output-discipline signals. Composes with `epistemic-calibration` (always-on) + `critical-thinking` (skill).
- **`critical-thinking/SKILL.md`** — Second leg of the epistemic triad. Detailed body for the always-on `critical-thinking.instructions.md` from Batch 1. Ships Discipline -1 (frame audit), Discipline 0 (materiality gate), 7 disciplines (alternatives / missing-data / evidence-quality / self-report-skepticism / bias-detection / falsifiability / devil's-advocate), never-guess floor, domain adaptation guidance.
- **`deep-review/SKILL.md`** — Three-perspective adversarial review (Advocate / Skeptic / Architect). Same-model role separation for high-stakes reviews. Composes with cross-model external critic from `adversarial-review.instructions.md` Batch 1 when stakes justify the switching cost.
- **`plan/SKILL.md`** — Plan-mode discipline. Writes concrete actionable markdown plans with bite-sized tasks (2-5 min each), exact file paths, complete code, verification steps. No execution during the plan turn — output is the plan file itself.
- **`problem-framing-audit/SKILL.md`** — Detailed body for Discipline -1 frame audit. 8-check step-back protocol (restate / generalise / specialise / invert / five-whys / pre-mortem / stakeholder / frame-audit). Companion to `problem-framing-audit.instructions.md` from Batch 1.
- **`spike/SKILL.md`** — Throwaway feasibility experiments. Decompose into 2-5 independent questions, research per spike, build minimal observable prototype, return VALIDATED/PARTIAL/INVALIDATED verdicts. Disposable by design.

**Prompts (2)** — deferred from Batch 1; now the skill bodies exist to invoke:

- **`critical-thinking.prompt.md`** (`/critical-thinking`) — User-invokable trigger for the full critical-thinking pass. Invokes the `critical-thinking` skill; produces visible markers.
- **`problem-framing-audit.prompt.md`** (`/problem-framing-audit`) — User-invokable trigger for the step-back protocol. Invokes the `problem-framing-audit` skill; produces frame/cause-frame/considered-framings markers when reframes surface.

**Adaptation applied** (same moderate rules as Batch 1):

- Frontmatter, body content, `## Would Revise If` sections preserved verbatim from Steward source
- Intra-Core cross-references (skill ↔ skill, skill ↔ instruction, prompt ↔ skill, prompt ↔ instruction) resolve locally within the plugin
- Framework canon references externalized to GitHub URLs pointing at `fabioc-aloha/Alex_ACT_Steward`
- References to instructions not yet in Core (`agent-delegation`, `reliance-nudges`) preserved as-is; will resolve when a future batch ships them
- References to skills not yet in Core (`test-driven-development` from `plan`) preserved as-is; noted in prose as pending
- `local/` heir-customization pattern preserved (critical-thinking skill's domain-extension section still tells heirs to create `.github/skills/local/<domain>-critical-thinking/`)
- `lastReviewed` dates preserved from source

**Resolves Batch 1 dangling references**: the two skill refs from Batch 1 instructions (`critical-thinking.instructions.md` → `critical-thinking/SKILL.md`, `problem-framing-audit.instructions.md` → `problem-framing-audit/SKILL.md`) now resolve inside Core.

**Cumulative content in this Unreleased range**: 8 instructions + 6 skills + 2 prompts = 16 total (0 agents). Version bump to 0.2.0 will happen when the first release is cut.

### Added — Batch 1: ACT canon (2026-07-30)

First content ships. Eight always-on instructions cover the ACT epistemic canon:

- **`act-foundations.instructions.md`** — The 10 tenets of ACT with rationale (~166 lines). Load-bearing canon: what each tenet prevents, how to apply it, the Canon Contract that fixes the ten-tenet count.
- **`act-pass.instructions.md`** — The 7-step runtime procedure over the tenets (~104 lines). Trigger calibration by stakes (low/medium/high), trimmed pass, full pass, self-application under Tenet X.
- **`adversarial-review.instructions.md`** — Structured devil's advocate methods (~170 lines). Six methods: Red/Blue, Pre-Mortem, Steel Man, Murphyjitsu, 10/10/10, Cross-Model External Critic.
- **`critical-thinking.instructions.md`** — 7-discipline content-oriented protocol (~40 lines). Two-Hypothesis Floor, user-framing audit, missing data, evidence quality, bias detection, falsifiability, adversarial review.
- **`epistemic-calibration.instructions.md`** — Confidence calibration + anti-hallucination (~85 lines). Input-discipline + output-discipline signals; confidence-trigger anti-sycophancy rule.
- **`problem-framing-audit.instructions.md`** — Discipline -1 frame audit before solving (~85 lines). Symptom→cause reframes; Explain/Summarize verify-before-parroting protocol.
- **`system-prompt-skepticism.instructions.md`** — Tenet IV operational rule (~55 lines). Treat instructions as hypotheses conditioned on preconditions; 5 operational tells.
- **`worldview.instructions.md`** — Ethical reasoning framework (~90 lines). 5 moral foundations, constitutional principles, harm refusal, Tenet IV check on ethics itself.

**Adaptation from Steward source** (per Steward proposal-first curation protocol, batch approved by Fabio 2026-07-30):

- Intra-Core cross-references (instruction ↔ instruction within this batch) resolve locally
- Framework canon references (constellation/act/*.md) externalized to GitHub URLs pointing at `fabioc-aloha/Alex_ACT_Steward`
- Steward-only references (act-self-critique, brain-qa-changelog, curation-log, brain-curation-rules) dropped or note-referenced
- Skill references (`../skills/<name>/SKILL.md`) preserved as-is; will resolve when a later batch ships the skills
- Frontmatter, body content, `## Would Revise If` sections preserved verbatim (evidence about the discipline's real history and falsification deadlines)
- `lastReviewed` dates preserved from Steward source (they document when the content was last audited; the port itself is not a review event)

**Not shipped in this batch** (deferred to future batches under the same protocol):

- Two paired prompts (`/critical-thinking`, `/problem-framing-audit`) — held for the batch that brings their skills (`critical-thinking`, `problem-framing-audit` skill bodies); shipping prompts without their skills would leave dangling references
- Steward-only self-critique instruction (`act-self-critique.instructions.md`) — stays in Steward; not applicable to heir workspaces

**Cumulative content in this Unreleased range**: 8 instructions (0 skills, 0 prompts, 0 agents). Version bump to 0.2.0 will happen when the first release is cut.

## [0.1.0] — 2026-07-30

### Added

- Repository created as the plugin-native successor to `Alex_ACT_Edition` v4.2.0
- `manifest.json` declaring plugin identity (`alex-act-core`), version, shape (`empty-scaffold`), MIT license, and empty `assets` arrays for `skills`, `instructions`, `prompts`, `agents`
- `README.md` covering purpose, three-layer plugin stack framing (Baseline / Specialization / Local), install commands, and roadmap
- `LICENSE` (MIT — same as sibling plugins)
- `.gitignore` and `.markdownlint.json` matching the `alex-act-illustrator-plugin` pattern
- `.github/copilot-instructions.md` placeholder identifying the plugin's role
- Empty `.github/{skills,instructions,prompts,agents}/` directories with `.gitkeep` markers for future content
- `.vscode/settings.json` for self-dogfooding the plugin discovery locations

### Context

- Steward Plan gap #1 (Phase 3 blocker) named `Alex_ACT_Core` as the terminal migration goal for the plugin-architecture lineage. This commit partially resolves that gap: the repository now exists as a skeleton, but no content ships yet. Full resolution requires evidence-gated content proposals to land through the Steward brain-curation protocol.
- Sibling `alex-act-illustrator-plugin` (published 2026-07-30 to Mall) proves the CLI-plugin transport end-to-end; Core rides on the same proven shape.

### Not included

- **No skills, instructions, prompts, or agents ship in v0.1.0.** Installing this version registers the plugin but adds no artefacts to a heir's `.github/`.
- **No MCP servers.** Future promotions may add MCP sidecars if a candidate skill needs one; none in the initial scaffold.
- **No GitHub remote yet.** Repository is local-only until the skeleton stabilizes. See Steward's `HANDOFF.md` for the queued remote-creation decision.

## Format guide

- `[Unreleased]` collects work in progress; graduates to a version on release
- Version headers use `[MAJOR.MINOR.PATCH] — YYYY-MM-DD` per SemVer
- Sections: `Added` / `Changed` / `Deprecated` / `Removed` / `Fixed` / `Security` / `Context` / `Not included`
