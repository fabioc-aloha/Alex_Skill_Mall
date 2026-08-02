# Changelog

All notable changes to this plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.6.2] - 2026-08-01

### Changed

- Replaced Mermaid's stale-layout viewBox expansion loop with deterministic single-pass graph-bound cropping and readable-width sizing. Compact diagrams now shrink-wrap their frame; only genuinely dense diagrams use contained horizontal scrolling.
- Removed raw Markdown source controls from the docs shell and starter manifest. Links to manifest-registered Markdown now stay rendered in the shell; authors open source files through their editor or repository tree.
- Reworked narrow-screen navigation into compact horizontal scrollers and made the TOC default collapsed on compact layouts unless the reader saved a preference.
- Fixed narrow-layout TOC overlap by making it static below 1100px and capping the expanded list at 360px with internal scrolling.
- Added DOMPurify 3.2.6 and enforced marked → sanitize → insert → strict Mermaid ordering. Active-content tags, event attributes, and fake form controls are removed; sanitizer failure blocks rendering.
- Added SHA-384 Subresource Integrity and anonymous CORS to every pinned CDN asset.
- Replaced hidden focusable heading anchors with labeled permalinks and added polite live status to code-copy controls.
- Added keyboard skip navigation, `aria-current` state, visible keyboard/touch copy controls, reduced-motion support, hidden empty provenance, fixed responsive typography, and per-shell TOC persistence.
- Unified proven behavior across implementations: Steward gained standalone HTML-report routing; the canonical starter gained long-content overflow protection.
- Cropped Mermaid SVG viewBoxes once to actual graph bounds and sized the resulting SVG from source font metrics. Desktop labels preserve a 13px floor and mobile labels preserve an 11px floor through contained per-diagram scrolling when source simplification is insufficient.
- Refactored five live `LR` diagrams and the starter exemplar to `TD`; simplified the bootstrap journey, Goal Architecture context map, and Core runtime loop. The validated Steward shell now has labels in the 13–22px band and no diagram wider than 4:1.

## [0.6.1] - 2026-08-01

### Documentation

- Reconciled the public README, source manifest, and Mall publishing runbook with the released v0.6.0 shape: five authoring areas, install composition, ten skills, three prompts, three MCP sidecars, and the current `alex-act-illustrator-plugin@alex-mall` identity.
- Replaced legacy hand-copy publishing guidance with the Mall-owned `vendor`, `maintain`, and approval workflow; added claim-led architecture diagrams.

### Changed

- Replaced loose MCP package ranges with exact configured-registry pins: `flint-chart-mcp@0.3.0`, `replicate-mcp@0.9.0`, and `@playwright/mcp@0.0.78`.
- Added `--prefer-offline` to every MCP-sidecar invocation and a verifier gate that rejects loose versions or hardcoded `registry.npmjs.org` references across `.vscode/mcp.json`, `plugin.json`, and `manifest.json`.
- Removed active public/latest-version probing guidance. Illustrator now uses only npm's configured registry; package upgrades require an explicit compatibility review.

## [0.6.0] - 2026-08-01

### install-visual-companions bundling (2026-08-01)

Absorbed the 9-plugin visual-workflow-companions install offer from `alex-act-core`'s `install-constellation` Step 7 per Fabio directive ("The visual companions should be bundled with the illustrator"). Reverses the 2026-07-31 Option A (route-only) decision recorded in [Steward's illustrator/plan.md](https://github.com/fabioc-aloha/Alex_ACT_Steward/blob/main/illustrator/plan.md) — "visual-workflow ownership belongs with the visual-authoring plugin that anchors it" is a stronger architectural fit than "constellation-installer offers all downstream companions".

- **New skill: `install-visual-companions`** — offers to install 9 marketplace companion plugins (`chromium-control-canvas`, `eyeball`, `diagram-viewer`, `napkin`, `image-annotations`, `chart-interpretation`, `visual-artifact-qa`, `visual-pr`, `storytelling-requirements`) with vision-loop composition pattern (`storytelling-requirements → visual-artifact-qa → chart-interpretation → eyeball`). Consent-gated, per-plugin — never bundled without explicit heir approval. Delegates to Core's `plugin-management` skill for mechanical commands + Safety rules (including anti-hallucination verify-marketplace-browse check per Core's `df8b676`).
- **New prompt: `/install-visual-companions`** — verb-prompt workflow entry point.
- **Manifest shape**: `nine-skill + two-prompt + three-mcp-sidecars + vscode-settings` → `ten-skill + three-prompt + three-mcp-sidecars + vscode-settings`.
- **plugin.json**: version `0.5.1` → `0.6.0` (minor, additive); description updated for 10 skills + install-composition surface.
- **Discovery + verification**: the 9-plugin catalog + vision-loop composition were discovered and Round-4 verified via the [Steward GH-APP-SUPPORT feedback loop](https://github.com/fabioc-aloha/Alex_ACT_Steward/blob/main/architecture/GH-APP-SUPPORT.md) on 2026-07-31 (ledger row `[GH-APP-FEEDBACK]` closure).

Companion Core release: `alex-act-core` v0.3.1 (2026-08-01) simplifies `install-constellation` Step 7 to a routing pointer at this skill.

### svg-banner absorption (2026-07-30)

Absorbed the `svg-banner` skill + `banner.prompt.md` from `Alex_ACT_Steward` per Fabio directive ("svg-banner should only be in the illustrator"). Fifth feature area added to the plugin.

- **New skill: `svg-banner`** — 1200×320 SVG brand banner generator with pluggable brand config. Default brand is Alex ACT (slate-900 background, emerald-teal-cyan accent, x-loop mark, ACT/EDITION/SUPERVISOR/HEIR watermarks); heirs override `banner-brand.json` + `brand-palette.json` for their own brand + watermark set. Byte-identical port from Steward (MD5-verified): `SKILL.md` (11790 B), `assets/mark-mono-emerald-256.png` (17150 B), `scripts/generate-banner.cjs` (12322 B).
- **New prompt: `/banner`** — verb-prompt workflow entry point that invokes the `svg-banner` skill. Byte-identical port from Steward (3651 B).
- **Manifest shape**: `eight-skill + one-prompt + three-mcp-sidecars + vscode-settings` → `nine-skill + two-prompt + three-mcp-sidecars + vscode-settings`.
- **Version bump**: `0.5.1` → `0.6.0` (minor, additive).
- **README**: gains 2 rows in "What ships" table.

**Not carried from Steward yet**: routing pointers back in Steward for `svg-banner` + cross-ref updates in Steward's `flint-chart`/`browser-tools`/`markdown-mermaid` skills. Steward-side companion commits happen separately.

### Shell topnav-sub multi-row polish (2026-07-30)

Small CSS refinement to the canonical `docs-shell/starter/index.html` shell for cleaner multi-row nav wrap when an area contains many docs.

- **`.topnav-list` gains `row-gap: 0.3rem`** — vertical breathing room between wrapped rows so labels don't visually touch when the browser wraps onto a second line.
- **`.topnav-sub` `align-items` shifts from `center` to `flex-start`** — labels left-align to the top of the row rather than being center-justified across the full wrapped height.

Fix is polish, not enablement: `flex-wrap: wrap` on `.topnav-list` already made multi-row wrap work; these two properties make the wrapped state look intentional. Verified empirically at 4 viewport / doc-count combinations via Playwright screenshot (350px + 1200px × 6 real docs and 16 injected docs). Steward propagated the same change to its own root shell (`cb2a81f`) and to all three known adopter heirs (CX-Vitals `f7a8720`, QuestionnaireFlow `2f05c22`, airs-enterprise `3dbf8d5`) same-day so byte-identity across the fleet is preserved. Plugin commit `667ecf3`.

### `chart-vocabulary` skill absorbed from `Alex_ACT_Visual_Storytelling` v1.2.0 (2026-07-30)

New baseline skill for statistical chart selection. Adapted from the `visual-vocabulary` skill in the paused `fabioc-aloha/Alex_ACT_Visual_Storytelling` v1.2.0 (last updated 2026-05-06). Absorption pattern: partial — only `visual-vocabulary` had substantive overlap with a canonical selection layer illustrator was missing; the other 7 VS plugins (data pipeline, non-print delivery, orchestration) stay in the Mall as independent items, orthogonal to illustrator's identity.

**Ships**:

- **7-goal chart catalog** organized by communication intent: comparison / change over time / proportion / distribution / relationship / flow / deviation. Each goal names best fits and what-to-avoid patterns.
- **CSAR evaluation loop** (Composition / Semantic role / Audience / Reveal) for weighing chart candidates against the Big Idea.
- **Override decision table** for when an AI-suggested chart type is defensible vs when to route back to the Big Idea.
- **5-Visual Rule** with audience-composition guidance.
- **Five living-gallery pointers** — FT Visual Vocabulary, Data-to-Viz, Data Viz Catalog, Vega-Lite examples, Storytelling with Data — as external references the skill deliberately does not duplicate.
- **6-step chart selection decision tree** as the fast-path router when the goal is obvious.

**Cross-linking**:

- `flint-chart` §0.2 gains a blockquote pointing at `chart-vocabulary` as the deeper reference behind its compact 7-row router.
- `chart-big-idea` Related section gains `chart-vocabulary` between `big-idea` and `flint-chart`.
- `render-verify` Related section gains a CSAR composition note: "did AI pick the right chart family" (route to `chart-vocabulary` Module 2) vs "did render match the message" (Prose-coupling check).

**Not absorbed**: upstream Module 4 (SVG dashboard composition patterns — panel primitive, pie sizing, dark-slate palette). Illustrator's `print-svg-style-guide` + `figure-generator` already cover the same problem space with print-legibility math + Tailwind semantic palette + `data-sha256` audit hash discipline; re-absorbing would create the parallel-vocabulary problem the 2026-07-30 palette unification just resolved.

**Manifest** bumped from seven-skill+three-mcp to eight-skill+three-mcp shape. `README.md` What-ships table gained a `chart-vocabulary` row. Attribution + link back to the VS repo in the skill body. Plugin commit `74d40f8`.

### Replicate AI image-generation activated (Priority 9, 2026-07-30)

The `replicate-imagery` routing skill activates the "AI illustration / hero image / editorial art" workload as the plugin's fourth feature area (alongside Flint chart authoring, Print figures, and Shell). Approach: consume Replicate's upstream primitives rather than reinvent — the official `replicate` MCP server (`npx replicate-mcp`) + five upstream agent skills (`find-models`, `compare-models`, `run-models`, `prompt-images`, `prompt-videos`) at `github.com/replicate/skills` installable via `npx skills add replicate/skills`.

**Ships**:

- **`replicate-imagery` skill** — thin routing over Replicate's own primitives. Names WHEN to reach for Replicate vs the plugin's other visual capabilities (charts / mermaid / banners / hand-authored figures). Covers model selection working set (FLUX schnell / dev / 1.1-pro, Ideogram v3, Recraft v3, Imagen 4, editing / inpaint / upscale models), cost table (schnell $0.003 → Ideogram $0.09 per image; video $0.10–$5.00/sec), brand alignment by weaving `brand-palette.json` hex codes into prompts, and composition with the plugin's other skills (Big Idea gate → generate → render-verify Prose-coupling).
- **`replicate` MCP server** declared in `.vscode/mcp.json` as optional (`required: false`). Config references `${env:REPLICATE_API_TOKEN}` so token stays out of source. Users who never generate AI imagery pay no cost and see no failure; the server starts on demand.
- **Prerequisites** section in `README.md` extended with `REPLICATE_API_TOKEN` note and the recommended `npx skills add replicate/skills` one-shot install.

**Manifest** bumped six-skill+two-mcp → seven-skill+three-mcp+vscode-settings shape. Prerequisites section gained `replicate_api_token` optional line. Grounded in Replicate's current docs at `replicate.com/docs/reference/mcp` + `replicate.com/docs/reference/skills` fetched 2026-07-30. Plugin commit `0a231b4`.

### Brand palette unification with Steward (2026-07-30)

Steward introduced `.github/config/brand-palette.json` as the single source of truth for colors, gradient, 6-role semantic coding, chart palettes, and typography across the constellation (Steward commit `881800f`). The plugin caught up:

- **`README.md`** gained a "Brand palette" section with three inline-SVG swatch tables (brand identity 8-row, semantic role coding 6-row, chart categorical 5-row) mirroring the identity in Steward's `BRAND-KIT.md`.
- **`print-svg-style-guide/SKILL.md`** and **`flint-chart/SKILL.md`** (publication config preset) gained blockquote callouts atop the palette sections explaining the plugin's Tailwind values are **print-quality variants** of the constellation `brand-palette.json` — same 6-role semantic coding, deeper contrast for print legibility. Screen values live in Steward's `brand-palette.json`; print variants live in the plugin skills. Documented as intentional divergence for target surface, not drift.
- **`.markdownlint.json`** MD033 `allowed_elements` extended to include `svg` and `rect` (same pattern already used in Steward's `BRANDING.md`).

Plugin commit `d43d650`. Steward-side companion commits: `881800f` (palette introduction), `c0caed0` (BRAND-KIT swatch sync).

### Two new baseline skills for illustration authoring, Phase 2 (2026-07-29)

Completes the DDA absorption arc opened in Phase 1. Two new baseline skills ship for the net-new patterns the big-idea family doesn't cover.

**`print-svg-style-guide`** (new, ~340 lines) — print-quality SVG style guide for books, reports, and exec-facing documents. Ships:

- Canvas + font stack: default `640×480` (4:3), widescreen `640×380`, dashboard `640×415`; `Inter, system-ui, sans-serif` for all figures.
- Print-legibility floor with math: `printPoints = fontSizePx × 4.39 × 72 ÷ viewBoxWidth`; 12px @ 640 viewBox = 5.93pt = instructional floor; minimum instructional px = `viewBoxWidth ÷ 54.5`.
- Type hierarchy: 18/13/12/9 pt roles.
- `data-print-role` markers: `micro` (attribution / hash stamps) and `note` (annotations, auto-promoted from `micro` at ≥40 chars). Both share the 2.9pt floor.
- Text-fits ladder: cut → reflow → abbreviate → grow (never shrink).
- Anti-pattern figures still obey the floor (demonstrate collapse through RELATIVE properties, not absolute smallness).
- Tailwind-grounded semantic palette: Blue = correct / principled, Red-700 = critique / target, Green-700 = approval, Amber triple-duty (Composition family / warning / footer takeaway), Burgundy = second critique tone, Grays scaffolding.
- Four composition idioms with skeleton XML: BEFORE/AFTER paired panels with REJECTED/APPROVED badges, numbered critique callouts (red-700 circles), family-band abstracts (5-panel vertical with family accent), 5-Visual Rule dashboards (blurred-thumbnail test, mobile-preserved hierarchy).

**`figure-generator`** (new, ~280 lines) — deterministic figure production discipline. Ships:

- The `.mjs` generator pattern: read from `data/<slug>.json`, SHA-256 hash the raw text, embed as `<!-- data-sha256: ... -->` in the SVG, emit to `assets/figures/`. Skeleton included.
- Why hand-authored over library-rendered: statistical-chart libraries own final geometry (`baseSize` → `computedSize` stretch); print gates need the generator to own layout.
- Dataset-first rule: every figure backed by `data/<slug>.json` + `.csv` + `.md` + `.schema.json`, published before the figure ships.
- Contract tests via Node's built-in test runner: pin aggregates, per-segment values, ordinal claims cited in prose. Register the test with the project's explicit test list; the tell is whether the test count rose.
- Fix-in-generator-never-in-SVG rule with the one legitimate exception (throwaway one-offs).
- Dataset inversion procedure: extract axis tick coordinates → solve `pxPerUnit` from two ticks → invert every data-point coordinate → byte-identity check against the sample. Prose fabricates; inversion doesn't.
- Figure-count hoist to one JSON (`figure-contract.json` with `expectedFigures` + `expectedPages`) so multiple gates read the same source. Page count: measure, don't predict.

**Auxiliary edits**:

- `manifest.json`: `shape` bumped from four-skill to six-skill; two new `assets.skills[]` entries with full `install_to` paths, roles, and frontmatter descriptions.
- `README.md`: What-ships table extended to 6 skills with role descriptions reflecting Phase 1 additions (Step 0.5 gate, publication config preset, Prose-coupling check) and Phase 2 additions.
- `flint-chart` § Publication config preset: forward-link updated from "shipping in a follow-up release" to live cross-refs at both `print-svg-style-guide` and `figure-generator`.

Both new skills attribute *The Defensible Decision* (Fabio Correa) as the source discipline, book-tested across 53 shipped figures and 368 pages.

**Deferred, not shipping** (book-project-specific, not baseline):

- Character bible pattern (14 named anchor characters as consistent scenarios across a series)
- Six completeness criteria per character (Scene / Decision / Dataset / Artifact / Figure / Companion)
- Illustration Studio review page pattern (manifest-driven visual proofing HTML with drift detection)

These are useful in the DDA context but not generic enough for the plugin's baseline scope. An adopter can lift them from Alex_DDA if the project's shape calls for them.

### Sharpen the big-idea family with DDA illustration patterns, Phase 1 (2026-07-29)

Absorbed the "partial coverage" items from a coverage-map audit against [Alex_DDA](https://github.com/fabioc-aloha/Alex_ACT_DDA) (Fabio Correa's book illustration studio for *The Defensible Decision*). Phase 1 covers items where the big-idea family already touched the concept but didn't formalize it. Backward-compatible: existing skill invocations produce the same output; the new content adds gates and catalog entries that fire when applicable.

**`chart-big-idea` gains**:

- **Step 0.5 — What earns a figure**: 5-criteria gate (compresses a decision rule / shows sequence / makes abstraction concrete / surfaces failure mode / anchors recurring concept) run between context-gathering (Step 0) and Big Idea drafting (Step 1). Includes the deletion test: if surrounding prose reads fine without the figure, the figure is decorative.
- **Step 4.5 — Focus discipline**: one pre-attentive attribute per emphasis (color OR size OR position, not all three), redundant encoding for accessibility (deuteranopia-simulate red/green pairings), BEFORE-only anti-pattern title discipline (neutral titles so the reader can diagnose the failure, paired BEFORE/AFTER can editorialize).

**`render-verify` gains**:

- Three new failure-catalog entries in "any rendered artifact":
  - **SVG XML invalid** — `<img>`-strict parsers drop the document at the first error; `--` inside XML comments and bare `&` outside comments are the two common causes; fix in the generator, not the SVG.
  - **Prose contradicts figure** — dataset moved, prose didn't; five surfaces drift.
  - **Lazy-load blindness** — `loading="lazy"` on a coverage page verifies only what's in viewport; page can advertise 62 figures and fetch 7 without anyone noticing.
- **New section: Prose-coupling check** — sweep 5 surfaces before shipping any published figure (Big Idea sentence, caption/alt text, anchoring paragraph, numeric claims, figure text that belongs in prose). Non-data lever preference: when numbers drift, look for a threshold or target that lives only in prose before rewriting the counts. Priority ladder for prose-vs-data conflicts.

**`flint-chart` gains**:

- **Publication config preset** for books / reports / exec-facing documents: Vega-Lite `config` block with `background: transparent`, `font: Inter, system-ui, sans-serif`, gray-500 axis labels, gray-800 axis titles, gray-100 grid, 18pt/700 title, and a 5-color semantic categorical range (blue-800 correct, amber-700 Composition/warning, green-700 approval, gray-500 muted, red-700 rejection/target). Pin once at the top of the chart set; regenerated charts inherit.
- **Report typography scale** for the surrounding HTML (title 18pt/700, section 14pt/700, body 15-16px, asides gray-500, REJECTED/APPROVED badge pills).
- Cross-reference to the print-legibility floor (12px @ 640 viewBox = 5.93pt) with a forward-link to the `print-svg-style-guide` skill in Phase 2.

All new content attributes *The Defensible Decision* (Fabio Correa) as the source discipline, via Alex_DDA's `dd-book-illustrator` skill.

**Phase 2** (next release) will add two new baseline skills for the net-new items the big-idea family doesn't cover: `print-svg-style-guide` (canvas + typography grammar, Tailwind semantic palette, structural SVG composition idioms: BEFORE/AFTER paired panels, numbered critique callouts, family-band abstracts, 5-Visual Rule dashboards) and `figure-generator` (hand-authored `.mjs` pattern, `data-sha256` audit hash, dataset-first rule, contract tests pinning headline numbers, dataset inversion from approved sample SVG, fix-in-generator-not-SVG rule).

### docs-shell: HTML-source docs bypass shell wrapper (2026-07-29)

A doc entry whose `sources[]` are all `.html` files now links directly to the file. The topnav still shows the button on line 2 with active-state styling, but clicking it loads the standalone HTML page rather than injecting into the shell's `#content` region. Any bookmark or external link that lands on `?area=X&doc=Y` where Y is HTML-only redirects immediately to the file via `window.location.replace` (back-button skips the shell hop). Reports that already own their own cover, hero, typography, and print styles (Flint chart reports, exported Power BI dashboards, static HTML tables) can now live in the shell nav without the shell trying to wrap them.

Absorbed from [CX-Vitals](https://github.com/fabioc-aloha/CX-Vitals) (adopter of docs-shell) after their 2026-07-28 refinement pass. Their initial version (commit `1098dd1`) rendered HTML sources in an iframe; four minutes later commit `0a341d8` refined to direct link because reports carry their own hero and cover, and iframe wrapping added a redundant frame that broke print flow. Direct link + `location.replace` gives the report the whole viewport while keeping the shell as the navigation surface.

Ships in:

- `.github/skills/docs-shell/starter/index.html` — the two code hunks that implement the branch (topnav render + bootstrap redirect).
- `.github/skills/docs-shell/starter/example-report.html` — new demo file that ships with the starter kit and showcases the pattern.
- `.github/skills/docs-shell/starter/manifest.json` — new "Example report" doc entry pointing at the demo HTML.
- `.github/skills/docs-shell/starter/about.md` — new HTML-source docs feature bullet with a link to the demo.
- `.github/skills/docs-shell/SKILL.md` — new task in Common tasks: "Add an HTML-source doc (Flint report, exported dashboard)".
- `docs/shell/README.md` — full technical reference in Manifest schema § HTML-source docs, plus a note on the `sources[]` field itself.

Backward-compatible: existing `.md`-source docs are unaffected. The branch fires only when every entry in `sources[]` ends in `.html`.

### Steward-maintained; retired dogfood `local/` mirror pattern (2026-07-29)

Alex_ACT_Steward is now the maintainer of this repo. Two consequences shipped in the same change:

- **Removed the dogfood `local/` skill and prompt mirror.** The pattern shipped skills at both `.github/skills/<name>/` (canonical) AND `.github/skills/local/<name>/` (dogfood copy loaded via `.vscode/settings.json` overrides), which required manual re-sync every time the canonical body was edited. In practice `flint-chart` drifted between the two; `chart-big-idea` and `render-verify` stayed identical only because they had not been edited since the mirror was created. Now the plugin authors its skills at the default discovery roots (`.github/skills/`, `.github/prompts/`) and VS Code Copilot finds them without any workspace override. Heir-side install target stays `.github/skills/local/` per Mall convention.
- **`.vscode/settings.json` simplified.** The `chat.agentSkillsLocations` and `chat.promptFilesLocations` overrides are gone; the file now carries only `markdown.styles` plus a comment explaining the Steward-maintained shape. Heirs that install this plugin via Mall still need their own settings.json entries to register the `local/` roots (per README "Install").
- **`.gitignore`** dropped the four `.github/{skills,prompts,agents,instructions}/local/` guard lines. They existed to prevent leakage from the upstream `microsoft/flint-chart` workspace where the plugin was born; that context is long past.

### Identity refresh: constellation framing (2026-07-29)

Post-rename Phase 2 cleanup. Not a behavior change; just aligns text with the current constellation shape.

- Reframed the plugin from "An Alex — ACT Edition plugin" to "An Alex ACT constellation plugin, maintained by Alex_ACT_Steward, distributed via Alex ACT Plugin Mall" in `README.md` and `manifest.json`.
- Fixed stale roadmap link `plan/illustrator-plugin.md` (Steward's pre-2026-07-29 path) to `illustrator/plan.md` (post-consolidation path) in `README.md`, `manifest.json`, and `docs/publishing-to-mall.md`.
- Softened the "workspace root" install snippets in `README.md` from "Alex ACT Edition workspace root" to "Alex ACT workspace root" so the instructions read cleanly for both Edition compatibility heirs and Steward-maintained brains.
- Prerequisite line updated: "Alex — ACT Edition ≥ 3.x" → "A configured Alex ACT installation (Edition compatibility heir OR Alex_ACT_Steward-maintained brain)".

### Bumped MCP pin to `^0.3.0` (2026-07-29)

**Trigger:** the Microsoft corporate npm mirror
(`packagefeedproxy.microsoft.io/npm/`) caught up to `flint-chart-mcp@0.3.0` on
2026-07-26 (or shortly after). The `^0.2.2` hold decision recorded below was
contingent on the mirror stopping at 0.2.2; that constraint is gone.

**Verified 2026-07-29** via `node scripts/verify-install.mjs`:

```text
      spec: flint-chart-mcp@^0.3.0  (from .vscode/mcp.json)
OK    server: flint-chart-mcp v0.3.0
OK    protocol: 2024-11-05
OK    tools (5): render_chart, compile_chart, validate_chart, list_chart_types, create_chart_view
```

Same five tools with byte-identical TypeScript type definitions
(`dist/server.d.ts` and `dist/render/index.d.ts` diff clean between 0.2.2 and
0.3.0) — the plugin's tool-shape assumptions are safe drop-in.

**What 0.3.0 adds** (all additive, no breaking API changes at the MCP surface):

_New chart-type capacity_ — none. `list_chart_types` still returns the same
~30 chart types across Vega-Lite, ECharts, and Chart.js. (The substantial
new chart-type additions — Excel backend with 18 templates, Plotly backend
expanded from 4 to 38 types — landed in 0.4.0, which is not reachable via
the `^0.3.0` pin.)

_Chart property additions_:

- `dodge` prop on Grouped Bar + Boxplot (`auto` | `local` | `global`)
- `sortSlices` prop on Pie + Rose Charts (`none` | `descending` | `ascending`)
- `stackMode: center` value — streamgraph rendering via Area / Stacked Bar
- `showTextLabels` prop on Waterfall — value labels on bars
- Gantt: task-height, corner-radius, and interval-label controls

_New public library APIs_ (not yet exposed as distinct MCP tools):

- Backend-neutral **chart-type recommendation API** — programmatic access to
  "here are compatible alternatives for this spec + data shape"
- Backend-neutral **chart-type transformation API** — data-preserving
  transitions between compatible chart types (Line → Sparkline, Bar →
  Stacked Bar, etc.), plus arrangement controls
- These surface only through the interactive `create_chart_view` MCP App UI
  today; headless MCP tools (`render_chart`, `compile_chart`, `validate_chart`,
  `list_chart_types`) are unchanged

_MCP App (`create_chart_view`) UI additions_:

- Dynamic controls to switch chart types, rearrange encodings, and edit chart
  properties in place without rewriting the authored Flint spec
- PNG copy, download, and reset actions in the widget

_Documentation additions_:

- Chinese-language website and translated documentation
- Plugin skill now points at the upstream `docs/reference-*.md` per-backend
  catalogs + `docs/design-semantics.md` (70+ semantic types) as deep
  references, all pinned to the `0.3.0` tag

_Rendering improvements (not user-facing API changes)_:

- Sparse stacked areas and streamgraphs interpolate interior gaps instead of
  dropping to zero
- Vega-Lite axes and derived text marks share semantic formatting so currency
  and other formatted aggregate values retain their intended units
- Improved local dodge behavior for sparse grouped bars and boxplots

**What 0.3.0 removes** — impact scan against this plugin's documented surface:

| 0.3.0 removal | Plugin impact |
| ------------- | ------------- |
| Rose Chart `innerRadius` prop | **None.** The plugin's skills never document `innerRadius` on Rose; the prop only surfaces on Pie (Donut recipe), which is unchanged. |
| `dodge: "none"` (Grouped Bar) | **None.** The plugin's `flint-chart` skill documents `auto` / `local` / `global` and never `none`. |
| `independentYAxis` on Sparkline | **Handled in this bump.** Added an explicit "Not for Sparkline" note next to the cross-cutting `independentYAxis` property in `flint-chart` SKILL.md § Cross-cutting properties. Rows now always self-scale on Sparkline; the property still applies to other faceted charts. |

**Files updated in this bump:**

- `.vscode/mcp.json`, `manifest.json`, `scripts/verify-install.mjs`
  (`FALLBACK_PACKAGE`)
- `.github/copilot-instructions.md`
- `.github/skills/flint-chart/SKILL.md` — pin literal in the mcp.json example,
  the pin-rationale prose, the Sparkline `independentYAxis` exclusion, the
  upstream-recommender re-test trigger in the _Would Revise If_ section, and
  a restructured §0.5 (When to fetch a deep reference) that now covers four
  reference layers ordered by cost:
  - Chart selection — _The Defensible Decision_ gallery (unchanged)
  - Chart capability, runtime — `list_chart_types` MCP tool +
    `flint://chart-types` MCP resource (new; matches the pinned server
    version, no fetch); includes a note on 0.3.0's recommendation and
    transformation APIs, which are library-side and surface only through the
    `create_chart_view` MCP App UI (no distinct MCP tool yet)
  - Chart capability, gallery — canonical Flint gallery site (unchanged)
  - Chart capability, deep reference — upstream `docs/reference-vegalite.md`,
    `docs/reference-echarts.md`, `docs/reference-chartjs.md`,
    `docs/design-semantics.md` (70+ semantic types),
    `docs/api-reference.md`, `docs/overview.md`, `docs/README.md`, all
    pinned to the `0.3.0` tag (new)
- `README.md` — three `mcp.json` fragment examples, the global-install command,
  the "last verified" date, and the "Pinned version" rationale paragraph
- `demos/README.md` — pin reference in the intro paragraph

**Still parked:** verifying `flint-chart-mcp@0.4.0` from an off-corpnet machine.
Public npm `latest` is 0.4.0 but the corporate mirror still stops at 0.3.0.
Caret on `^0.3.0` means `>=0.3.0 <0.4.0`, so the 0.4.0 verification remains its
own workstream — see `HANDOFF.md`.

**Follow-up not done in this bump** (per `HANDOFF.md` follow-up work list):

- Item 2 (widen backend list from three to five) does not apply — 0.3.0 keeps
  the three-backend surface. `list_chart_types` still returns Vega-Lite,
  ECharts, and Chart.js. Widening is a 0.4.0-era task if it happens.
- Item 3 (chart-type count widening) — same status; 0.3.0 keeps the 34
  Vega-Lite chart-type count the README quotes.
- Item 4 (§0 Chart Selection re-evaluation against 0.3.0's backend-neutral
  recommender) is now due; the `flint-chart` SKILL.md _Would Revise If_ trigger
  was updated to acknowledge it. Not done in this bump because it is a
  substantial refactor, not a pin move.

### Decided — hold the pin at `^0.2.2` (2026-07-25 — SUPERSEDED 2026-07-29)

**Superseded** by the 0.3.0 bump above once the mirror caught up. Retained
verbatim below as the historical record of why the pin held for the month
between 2026-06-29 and 2026-07-26, and what conditions would move it.

**The pin stays at `^0.2.2`, deliberately.** Caret on a `0.x` version means
`>=0.2.2 <0.3.0`, so this is a real restriction, not a floor: 0.3.x and 0.4.x
are never picked up automatically.

Rationale: `flint-chart-mcp` 0.4.0 is a genuine production release on public npm
(2026-07-24, signed build provenance; the GitHub release is neither draft nor
prerelease, `main` and the `0.4.0` tag agree, and `dev` is *behind* `main`) —
but it is unreachable from Microsoft corporate machines. `npm` there resolves
through `packagefeedproxy.microsoft.io/npm/`, which stops at 0.2.2 and returns
`ETARGET` for 0.4.0 even on a direct install and even with `--prefer-online`;
direct `registry.npmjs.org` access is blocked by corporate web policy, which is
deliberately **not** bypassed.

Since most heirs of this plugin are corpnet repos, bumping to a plain `^0.4.0`
would break more adopters than it would help. `^0.2.2` installs cleanly on both
public npm and the corporate mirror, and is the only version this plugin's
content has been verified against.

> Cautionary note: an earlier draft of this entry claimed 0.4.0 was "not on npm",
> based on `npm view` output. That was the corporate mirror's stale view reported
> as global truth. `npm view` reflects whatever registry is configured — run
> `npm config get registry` before treating its answer as authoritative.

**What would change the decision**, in order of preference:

1. **The mirror syncs 0.4.0.** Then a plain `^0.4.0` works everywhere and none
   of the complication below applies. The sanctioned request is drafted in
   `HANDOFF.md`.
2. **0.4.0 is verified a strict superset**, from a machine on public npm:
   `node scripts/verify-install.mjs --catalog --compat` must report 0.4.x, all
   five tools, and every documented spec pattern `valid`. If so, ship the dual
   range `flint-chart-mcp@^0.2.2||^0.4.0` — tested to resolve 0.2.2 on the
   mirror and 0.4.0 on public npm, so one config serves both. If any pattern
   fails, stay here.

The branch `bump/mcp-0.4.0` carries the `^0.4.0` pin and is parked, not
abandoned; `HANDOFF.md` has the full procedure.

**Compatibility measured on 0.2.2 (2026-07-25)** via
`scripts/verify-install.mjs --compat` — all six documented spec patterns valid,
including all three 0.3.0 migration items (`dodge` without `none`, donut via Pie
`innerRadius`, Sparkline without `independentYAxis`). 0.3.0 *does* carry
breaking changes; the finding is that none touch what this plugin documents.
That was asserted twice before it was measured, which is why the check now
exists.

**If the dual range is ever adopted**, two consequences apply. The docs must
stop asserting "34 Vega-Lite chart types" and "three backends" as fact — those
become runtime discovery via `list_chart_types`, since they would be wrong for
half the installs. And the `flint-chart` skill needs an explicit Sparkline
exclusion on `independentYAxis`, which 0.3.0 removed for Sparkline while keeping
it for other faceted charts.

## [0.5.1] — 2026-07-25

Closes an upstream wiring gap and sharpens what the Big Idea step actually asks.

### Fixed

- **`flint-chart` §0.1 now hands off to `chart-big-idea` explicitly.** The skill
  had a downstream handoff (to `render-verify`, added in 0.4.0) but never an
  upstream one. Via `/render-chart` the Brief was produced by the prompt's Step
  1; but when a user asked for a chart **ambiently** — "chart this data", with
  no slash command — the host loaded `flint-chart` alone and §0.1 fell back to
  three inline questions. No context read, no intent check, no elicitation
  ladder, no TRADITIONAL/INNOVATIVE ask. The inline version is kept as the
  fallback for installs that do not carry `chart-big-idea`.

### Added

- **An intent check at the head of `chart-big-idea` Step 1.** The Big Idea asks
  *what the data shows*; this asks **what the artifact is actually for**, before
  any claim is drafted:
  - *Should this exist at all?* If no argument surfaced and the data holds no
    surprise, offer the cheaper alternative — a sentence, a table, or nothing.
    A competent chart nobody needed is a failure that looks like success.
  - *Is the stated purpose the real one?* "Show that X worked" is a decision
    already made looking for a picture to ratify it. Legitimate to build, but it
    belongs in the Brief as Persuasive, not dressed as neutral reporting.
  - **If the intended message and the data disagree, surface it before drafting
    the Big Idea.** This is the one point in the workflow where the right answer
    may be *"not this chart"* — every later step assumes the chart should exist.
- **Scope note** on `chart-big-idea`: Steps 0, 1, and 3 apply to any
  communication artifact — a slide, a memo, a diagram, a report section. Steps
  2, 4, and 5 are chart machinery, which is why the skill stays chart-named.
- Two anti-patterns (accepting the stated purpose without testing it; framing a
  chart that should not exist) and two falsifiers, including: if users routinely
  invoke this skill for non-chart artifacts and skip Steps 2/4/5, the general
  half has outgrown the chart half and should be split into its own skill.

### Notes

The skill was **not** renamed, unlike `chart-verify` → `render-verify` in 0.5.0.
The cases differ: there, the method was general and only the catalog was
chart-specific, so widening cost one extra table. Here Steps 2, 4, and 5 are the
spine — story arcs map to chart families, the style-stance crosstab names
concrete `chartType` values, and the Brief hands off to `flint-chart` §0.2.
A general name over that machinery would overpromise. The falsifier above turns
that judgment into something testable rather than a preference.

## [0.5.0] — 2026-07-25

Renames the verification skill and widens it to match. Shipped same-day as
0.4.0, before the Alex Mall vendored it, so no adopter ever saw the old name.

### Changed

- **`chart-verify` → `render-verify`.** The old name implied the skill only
  worked on charts. It never did: the method — open the artifact, read its
  console errors *first*, walk a failure catalog, then check the picture against
  the claim it was meant to carry — applies to any rendered output. Folder,
  frontmatter `name`, and all references moved together; `name` must match the
  parent directory or the skill silently fails to load.
- **Skill framing widened** from "a chart" to "a rendered visual artifact",
  covering generated HTML reports, SVG figures, dashboards, diagrams, and
  printable output. Charts remain the deepest-worked case.
- **Step 3 and Step 4 generalized.** Step 4 previously assumed the Big Idea from
  `chart-big-idea`; it now covers whatever claim the artifact carries, since a
  report or diagram has one too. "A correct render of a wrong claim is still a
  defect" holds either way.
- `manifest.json` 0.4.0 → 0.5.0. Renaming a shipped asset is a breaking change
  to the install contract even when nothing has consumed it yet.

### Added

- **A second failure catalog — any rendered artifact.** Eight rows for defects
  that are invisible in a screenshot but named in the console or found by
  looking properly: missing resource (404'd image, stylesheet, font, script),
  unstyled content, clipped or overflowing text, font substitution, layout
  collapse at the captured viewport, below-the-fold content never captured,
  stale render, and surviving placeholders (`TODO`, `{{value}}`, `undefined`,
  `NaN`).
- **Anti-pattern: screenshotting without reading the console.** The console
  names the cause; the picture only shows the symptom.
- **Falsifier for the rename itself** — if the general catalog goes unused
  across several sessions, the skill is chart-only in practice and the broader
  name overpromises. Narrow it back or delete the general table.

## [0.4.0] — 2026-07-25

Closes the verification loop. Until now the plugin could render a chart and had
no way to check that the chart said what it was supposed to say — a spec with a
collapsed scale, a merged color scale, or an empty data binding renders as a
perfectly valid image telling the wrong story, and `validate_chart` cannot catch
that. The `flint-chart` skill also *opened* this hole deliberately: it forbids
sending a post-Flint Vega-Lite edit back to `render_chart`, then instructed the
agent to "render the edited spec in the host environment with a Vega-Lite
renderer" that the plugin never shipped.

### Added

- **`chart-verify` skill** (third skill). Carries the load-bearing content: a
  nine-row **failure catalog** of defects that render without error (empty
  binding, collapsed scale, merged color scale, undefined category, duplicate
  marks, embedded totals, double-scaled units, overplotting, right-on-sample),
  a host-capability table, a console-errors-before-picture ordering, and a step
  that checks the render against the Big Idea rather than only against the spec.
- **Optional `playwright` MCP server** in `.vscode/mcp.json`,
  pinned exactly at `@playwright/mcp@0.0.78` with `--headless --isolated
  --browser msedge --allow-unrestricted-file-access`. **GitHub Copilot CLI is
  the main audience** — it is a terminal agent with no browser, so this is its
  only route to verifying a render. VS Code heirs should omit the entry.
- **`/render-chart` Step 8 — Verify**, mandatory after any post-Flint Vega-Lite
  edit and before committing generated HTML/SVG/PNG. Step 9 now reports whether
  verification happened, or that it could not.
- **`.playwright-mcp/` in `.gitignore`.** The server writes accessibility
  snapshots and screenshots into its launch cwd — found by having it happen.

### Changed

- `manifest.json` — `assets.mcp` restructured from a single server object to a
  `servers` array with per-server `required` flags. Version 0.3.2 → 0.4.0,
  shape now `three-skill + one-prompt + two-mcp-sidecars + vscode-settings`.
- `flint-chart` skill — a "Look at what you rendered" bullet in *What you
  produce*, and a mandatory-verification note closing the *Post-Flint style
  customization* section.

### Notes — measured, not assumed

Every claim below was measured against `@playwright/mcp@0.0.78` on 2026-07-25 by
stdio handshake plus live tool calls against
`demos/heart-with-axes/report.html`. Two
prior assumptions were falsified in the process:

- **There is no bundled browser, and no download.** Playwright drives an
  *installed* browser by channel; `--browser msedge` launched in 0.7 s. The
  earlier "~150 MB prerequisite" framing was wrong. The shipped config selects
  `msedge` deliberately: the upstream default is Google Chrome, which is
  frequently absent on the corpnet Windows machines most heirs run, while Edge
  ships with the OS. Linux heirs override the channel.
- **`file://` navigation is blocked by default** — `Access to "file:" protocol
  is blocked` — hence the `--allow-unrestricted-file-access` flag. This is the
  plugin's characteristic silent-config failure shape in a new place.
- **The MCP handshake reports the underlying Playwright *library* version**
  (e.g. `1.62.0-alpha-…`), not the package version. Do not pin against it.
- **VS Code's built-in browser tools satisfy the whole capability** with no
  flags, no download, and no config — verified on the same demo. This is why the
  server is optional and why `chart-verify` names a capability rather than a
  product. **Heirs on VS Code should omit the `playwright` entry.**

### Security

`--allow-unrestricted-file-access` grants the browser read access to any file the
user can read. That is a reasonable trade for verifying local artifacts the agent
just produced, and it is no broader than what VS Code's own internal browser
already does. It is **not** safe in combination with browsing untrusted web
pages. The README and the skill both carry this warning, and the skill explicitly
rules out `browser_run_code_unsafe` for verification work — screenshots and
console access are sufficient to look at a chart.

## [0.3.2] — 2026-07-25

Acts on four review findings from an adopting workspace that installed 0.3.1 via
GitHub Copilot CLI. All four were reproduced before being acted on.

### Added

- **`scripts/verify-install.mjs`** — an executable version of check 1 in the
  README's verification ladder. Reads the pin from
  `.vscode/mcp.json` so it verifies the version the workspace
  actually requests rather than a hardcoded copy of it, handshakes with
  `flint-chart-mcp` over stdio, and asserts all five tools are advertised; exit 0
  means the server half is healthy and the fault is client-side. Zero
  dependencies, host-independent, CI-runnable. Rationale: check 1 previously read
  "ask the agent to probe over stdio", which is the one step that must not depend
  on the agent — the agent may be what's broken. Note that Mall installs do not
  include `scripts/`; the README gives the manual probe as the fallback.
- **GitHub Copilot CLI added to every host table** (README, `flint-chart` skill,
  `manifest.json`). Its config lives at
  `~/.copilot/mcp-config.json` (overridable via `$COPILOT_HOME`) and its
  top-level key is **`mcpServers`**, not `servers`. This fails harder than the
  bug 0.3.1 fixed: wrong path _and_ wrong schema, still with no error. Verified
  against a live CLI config and the GitHub docs. Users are pointed at the CLI's
  own `/mcp add` rather than hand-editing JSON.
- **A PowerShell variant of the manual install block.** The install steps were
  bash-only (`mkdir -p`, `cp -r`, `/tmp/`), which is a translation step for the
  Windows-heavy Alex ACT Edition audience.

### Fixed

- **"copy as-is" replaced with merge guidance for the MCP config.** The README
  told VS Code users to copy `.vscode/mcp.json` as-is; an
  adopter with an existing file would silently lose their other servers. The
  `settings.json` asset already carried an additive-merge caution — the MCP
  asset now does too, in the README, the skill body, and a new `merge` field in
  `manifest.json`.

## [0.3.1] — 2026-07-25

Bug-fix release. The MCP install path this plugin documented was wrong for
VS Code, which silently produced "the tools never appear" with no error.

### Fixed

- **Corrected the MCP config path for VS Code.** The plugin told heirs to merge
  `mcp.json` into a **workspace-root `.mcp.json`** — the Claude Code
  convention. VS Code reads **`.vscode/mcp.json`**. The `servers` schema is
  identical in both, so the wrong path looks correct, and VS Code surfaces no
  error because it is not parsing a broken file — it is reading no file at all.
  Fixed in [`README.md`](README.md), the `flint-chart` skill body, and
  `manifest.json`'s `merge_target`, now with a per-host path
  table (VS Code / Claude Code / Cursor).

### Added

- **`"type": "stdio"` declared explicitly** in `mcp.json` and in the
  skill's sample config. Optional in some hosts, but omitting it makes
  transport-related failures harder to diagnose.
- **Post-install triage ladder** in both the README and the `flint-chart` skill:
  isolate server-vs-client by probing the server over stdio directly, then check
  the **MCP: List Servers → Start** trust prompt, then **Show Output** for
  startup crashes, then restart the chat session (a window reload does not
  always refresh the agent's tool inventory). Notes that HTTP-transport servers
  additionally require OAuth authorization, which is separate from trust.
- **Documented the `local/` discovery-root registration.** VS Code discovers
  skills in `.github/skills/` and prompts in `.github/prompts/` but does not
  search their subfolders, so the plugin's `local/` install paths load nothing
  on a plain VS Code workspace — silently, same failure mode as the MCP path.
  [`README.md`](README.md) now documents the additive `chat.agentSkillsLocations`
  and `chat.promptFilesLocations` entries (Alex ACT Edition heirs already have
  these registered).
- **`.vscode/` is now tracked** rather than gitignored.
  `.vscode/mcp.json` and
  `.vscode/settings.json` make this repo dogfood its own
  install wiring, so a path regression breaks here before it reaches adopters.
- **A "Verify your install" section** in [`README.md`](README.md) — four ordered
  checks (server probe → client tools → skills/prompt → render), each isolating a
  different half of the system so the first failure localises the fault.

### Verified

- **End-to-end on 2026-07-25**, VS Code against `flint-chart-mcp` 0.2.2 (MCP
  protocol `2024-11-05`): server healthy over stdio with all 5 tools; both skills
  loaded from `.github/skills/local/`; `list_chart_types` returned 34 Vega-Lite
  chart types; `validate_chart` clean; `render_chart` produced SVG;
  `create_chart_view` opened an interactive panel.
- **Not covered:** the run could not distinguish the `local/` skill copies from
  the source copies at `.github/skills/`, since this repo carries both and they
  are identical. A `local/`-only adopter install is inferred, not demonstrated.

### Removed

- **Root `mcp.json` deleted.** The MCP fragment now ships from
  `.vscode/mcp.json` — the location it is actually installed
  to — rather than a root copy no host reads. Content was byte-identical, so no
  payload change. References repointed in `manifest.json`
  (`path` plus a new `install_to`), [`README.md`](README.md), `LICENSE`,
  `docs/README.md`,
  `docs/publishing-to-mall.md`, and
  `.github/copilot-instructions.md`. The Mall
  still vendors the fragment flat as `mcp.json`; only the upstream source path
  changed.

## [0.3.0] — 2026-07-24

Maintenance release. No shipping-payload behavior change, but the Node
prerequisite bump is user-visible for anyone installing on Node 18 or 20,
which justifies a minor bump.

### Changed

- **Node prerequisite raised from ≥ 18 to ≥ 22.** Reflected in
  `manifest.json` and [`README.md`](README.md). Rationale:
  Node 18 reached end-of-life on 2025-04-30 and Node 20 enters maintenance-only
  in April 2026; pinning to ≥ 22 (current active LTS) keeps `npx flint-chart-mcp`
  on a supported runtime for the plugin's usable life.
- **`flint-chart` skill gained a `Would Revise If` section** codifying the five
  falsifier conditions (Defensible Decision URL churn, `flint-chart-mcp`
  breaking change, §0.2 recommendation refuted, §0.5 not exercised, upstream
  fork base revised). Aligns the skill with the plugin-wide convention that all
  installable files carry a falsifier.

### Removed

- **Two of three demo reports** (`demos/heart-chart/`, `demos/love-axes/`)
  removed to keep the demo surface focused. `demos/heart-with-axes/` — the
  fusion demo referenced from the top-level README — remains. Narrative in
  `demos/README.md`, `heart-with-axes/README.md`, and `heart-with-axes/report.html`
  updated to reflect the single-demo shape.

### Added

- **`.markdownlint.json`** — scoped config disabling MD013 (long semantic
  lines are intentional) and allowing MD033 for `p`/`img`/`br`/`sub`/`sup`
  (the standard README centered-image escape hatch). Makes markdownlint
  behavior consistent across contributors regardless of their VS Code defaults.

### Notes

- `flint-chart-mcp` version pin unchanged (`^0.2.2`). Bump to `^0.3.0` when
  the upstream 0.3.0 git tag publishes to npm.
- Plan doc `docs/plans/2026-07-24-mall-plugin.md`
  now carries an Amendments header pointing to this changelog for current state.

## [0.2.0] — 2026-07-24

Initial public release. Spun out of dogfood work in `microsoft/flint-chart`
(non-shipping `.plans/` folder) into its own repo for open-source distribution.

### Added

- `chart-big-idea` skill — framing preflight (Big Idea in one sentence,
  story arc, audience, TRADITIONAL vs INNOVATIVE style stance, Chart Brief
  output). Reads surrounding docs/prose/ticket for an existing Big Idea
  first; 3-question elicitation ladder when none is found.
- `flint-chart` skill — selection + spec-authoring. §0 chart-selection
  framework prepended to the upstream `agent-skills/flint-chart-author`
  body. §0.1 one-sentence message, §0.2 question→family→chartType table,
  §0.3 anti-patterns, §0.4 Flint coverage substitutions, §0.5 deep-reference
  fetch rules, §0.6 design principles. Then original Steps 1-N for
  `ChartAssemblyInput` authoring.
- `/render-chart` prompt — 8-step verb-prompt workflow entry point.
  Loads `chart-big-idea` → produces Brief → loads `flint-chart` → selection
  constrained by Brief → authors input → renders via MCP.
- `mcp.json` — plugin-level MCP sidecar for the upstream `flint-chart-mcp`
  npm package (stdio transport, `npx -y flint-chart-mcp@^0.2.2`).
- `manifest.json` — plugin manifest enumerating all shipping assets,
  install paths, prerequisites, and upstream references.
- MIT dual-copyright LICENSE preserving Microsoft's attribution on the
  forked `flint-chart` skill body.

### Notes

- Pinned to `flint-chart-mcp@^0.2.2` (latest published to npm as of
  release). Git tag `0.3.0` exists upstream but is not on npm yet; bump
  the version constraint once it publishes.
- No breaking changes possible — this is the first published version.
