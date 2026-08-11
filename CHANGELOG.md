# Changelog

<!-- markdownlint-disable MD024 -->

All notable changes to Alex ACT Plugin Mall.

## [Unreleased]

### Published

- Published `alex-act-ai-operations` v0.1.0 from the immutable
  `fabioc-aloha/Alex_ACT_AI_Operations` tag. The optional plugin provides
  provider-neutral planning and consent-gated execution across Microsoft
  Foundry, Replicate, Hugging Face, and ElevenLabs.
- Moved Core and Illustrator origin delivery records to their verified
  `v1.1.0` release tags. Manager, Document Tools, Enterprise, and private MSFT
  remain at `1.0.1`; Visual Storytelling remains vendored at `1.0.1`.
- Moved Core, Manager, Illustrator, Document Tools, and Enterprise origin
  delivery records to their verified `v1.0.1` release tags. Visual Storytelling
  remains vendored at `1.0.1`; MSFT remains private and absent from the Mall.

### Security

- Replaced shell-interpolated Git ref discovery with `execFileSync` argument
  arrays, resolve publication against constant `HEAD`, and fail ref discovery
  when any store cannot produce immutable SHA evidence. A valid branch name
  containing shell metacharacters is covered by an executable regression.

### Fixed

- Deduplicated 11 same-store rows with deterministic precedence (curated plugin
  payload over standalone skill; production over testing) and made duplicate
  names a hard catalog validation failure. Current generated state is 3,854
  unique `(store, name)` identities across 42 stores.
- Propagated `reference_only` into per-store records and `installable` into the
  public index; 25 reference-only entries are now explicitly non-installable.
- Made the marketplace mandatory, required 40-character store refs and
  SHA-pinned source URLs, reconciled per-store counts, and bounded the generated
  installability contract with mutation tests.
- Repaired five unusable curated descriptions and made marketplace generation
  reject YAML markers, punctuation-only prose, and observed dangling-comma
  truncation.
- Disclosed first-party maintenance/adoption values as editorial priors rather
  than measured GitHub signals.
- Changed workflows to `npm ci --ignore-scripts` and pinned checkout/setup-node
  v6 tags to their resolved commit SHAs.

### Added

- Published `alex-act-manager` v0.1.0 from the immutable
  `fabioc-aloha/Alex_ACT_Manager` tag. The 37-file payload provides five
  lifecycle skills, seven commands, Core-owned bootstrap resources, and
  deterministic version/workspace operations.
- Published `alex-act-document-tools` v0.1.0 from the immutable
  `fabioc-aloha/Alex_ACT_Document_Tools` tag. The 22-file payload provides six
  document converters, `/convert`, and the explicitly bundled shared runtime.
- Canonical maintainer tooling: `npm run vendor` for dry-run-first upstream
  imports and refreshes, and `npm run maintain` for curated or full catalog
  maintenance.
- Canonical contributor tooling: `npm run submit:prepare` normalizes a source
  plugin into the Mall shape, while `npm run submit:validate` checks component
  paths, frontmatter, secret-like files, symlinks, the 100-file limit, and the
  generated marketplace entry.
- Contributor PR validation workflow, plugin-submission template, and CODEOWNERS
  gate. Automation never auto-merges a plugin contribution; `@fabioc-aloha`
  retains editorial approval.
- Dry-run-first `npm run admin:configure-approval` command for enforcing the
  contributor validation check, CODEOWNER approval on governed paths,
  conversation resolution, and an explicit maintainer bypass on `main` to avoid
  sole-CODEOWNER self-approval deadlock. The check
  runs on every PR; generated catalog refreshes remain zero-review auto-merges,
  while plugin, script, marketplace, and registry paths require CODEOWNER review.
- Fixture-backed publication tests covering dry-run/apply behavior, source-path
  normalization, prompt renaming, metadata generation, secret rejection,
  payload limit, maintenance sequencing, and the PR approval boundary.

### Changed

- Published immutable payload refreshes for `alex-act-core` v0.5.1,
  `alex-act-illustrator-plugin` v0.6.2, and `alex-act-enterprise` v0.1.2.
  The private `alex-act-msft` plugin remains absent from the public Mall.
- Storefront and contribution documentation now describe the CLI-native plugin
  shape and the separate maintainer and contributor workflows.
- Curated maintenance reconciled the generated storefront and trust surfaces to
  363 first-party plugins, 3,862 catalog entries, and 42 stores.
- The vendored `alex-act-core` manifest now points at its actual root `skills/`
  and `commands/` paths instead of source-repo `.github/` paths.
- Canonical vendoring was dogfooded against Core v0.4.2: the atomic refresh
  preserved Mall metadata, produced a valid 96-file payload, and recorded 73
  link rewrites (40 non-vendored references, 2 prompt renames, 16 skill-root
  remaps, and 15 bootstrap-prefix remaps).

### Earlier fixes

- Made `maintain-mall.cjs --help` side-effect free and made direct Windows
  invocations run npm through `node.exe` plus `npm-cli.js` without a shell.
- Added a copy/remove fallback for temporary plugin-content moves when Windows
  returns `EPERM` or `EACCES`, while retaining atomic rename for release backup
  and rollback operations.
- Made replacement vendoring fail closed when an existing payload declares
  bundled resources but the refresh omits explicit `--include` mappings.

- **Second-round curation pass (2026-07-28)**: registry pruned from 33 → **29
  active stores** and 3,548 → **3,479 aggregated plugins**. Cut 4 low-uniqueness
  community stores whose plugin sets were largely duplicated in higher-signal
  stores (`plugin-mall`, `awesome-copilot`, `antigravity-awesome-skills`):
  - `addyosmani-agent-skills` — 92% duplicated (24 of 26 already elsewhere)
  - `agent-skills-context-engineering` — 82% duplicated, canonical
    context-engineering set covered by `plugin-mall` + `antigravity`
  - `composio-awesome-claude-plugins` — 50% duplicated, lowest-trust store in
    catalog (trust 26), community-adjacent to a vendor product
  - `imbad-academic-research-skills` — narrow-domain, `ai-research-skills`
    (100 plugins, higher trust) covers the same domain better; also had a
    `release-discipline` name-collision with Steward's own concept
- **Classification fix**: `claude-skills` (upstream `github.com/anthropics/skills`)
  reclassified `community` → `anthropic-official`. Same tier as `mcp-servers`;
  the previous `community` label undercounted the Anthropic-first-party signal
  in trust scoring.
- Catalog fully regenerated. Strict CLI marketplace unchanged at 365 curated
  plugin entries. Registry-wide duplication signal: 221 of 3,299 distinct
  plugin names appear in 2+ stores (down from 221 of 3,299 pre-cut; further
  dedupe belongs at the presentation-surface layer per Phase 6 mall-search).
- **First-round curation pass (2026-07-28, earlier)**: registry pruned from
  **49 → 33 active stores** and **3,912 → 3,548 aggregated plugins** by
  removing 16 stores with no Copilot-CLI-installable path (no
  `marketplace.json` at any of the four canonical paths and no root
  `plugin.json`); they belonged to adjacent ecosystems (Claude skills, Cursor
  rules, MCP-server directories, other editor-specific formats). Cut:
  `agency-agents`, `antfu-skills`, `awesome-claude-code`, `awesome-design-skills`,
  `awesome-mcp-servers`, `claude-code-best-practice`, `copilot-collections`,
  `flutter-ai-rules`, `game-studios`, `healthcare-agents`, `hoodini-ai-agents-skills`,
  `k-dense-scientific-agent-skills`, `moiz-ai-agent-skills`,
  `robotics-agent-skills`, `rust-skills`, `superclaude-framework`.
- Marked **5 stores as `reference_only: true`** in `sources/supported-stores.json`:
  `mcp-servers` (`modelcontextprotocol/servers` — Anthropic-official MCP
  directory), `spec-kit` (`github/spec-kit` — GitHub-official), and
  `vercel-agent-skills`, `vercel-skills` (Vercel Labs), plus
  `awesome-copilot-agents`. These first-party / high-signal repos are kept in
  the catalog for cross-ecosystem discoverability but are not Copilot-CLI
  installable. Presentation surfaces (mall-search, README storefront filters)
  should hide `reference_only` stores from install-focused views;
  implementation of that filter is Phase 6 of the meta-catalog plan.
- Registry schema (`sources/supported-stores.schema.json`) extended to
  document the `reference_only` field.

### Resolved scanner issue

- The scanner now prefers `plugins/<name>` over `skills/<name>` and production
  paths over `testing/<name>`, removing the nine `awesome-copilot` and two
  `mongodb-agent-skills` duplicates identified by the 2026-08-06 audit.

### Rationale

Executed per Steward's meta-catalog plan (`plan/mall/META-CATALOG.md`) Phase 2
Option B (first round) plus a same-day continued-support + duplication review
(second round). The 16 first-round-cut stores would never gain a
`plugin marketplace add`-able surface without upstream restructuring; the 4
second-round-cut stores had a real CLI-installable path but their plugin sets
were mostly redundant with higher-signal stores already in the catalog.
Registry becomes an honest map of what the Copilot CLI can reach today AND
what heirs will actually get value from. The 5 kept-as-reference stores are
official / brand-tier and stay indexed for cross-ecosystem discovery.

---

## [3.0.0] - 2026-07-28

**Major release.** The 365 first-party curated plugins are now installable as a
GitHub Copilot CLI marketplace. The external discovery and trust catalog stays
unchanged at 3,912 plugins across 49 stores.

### Added

- Strict `.github/plugin/marketplace.json` with 365 unique curated plugin
  entries and repository-relative sources.
- Fixture-backed migration, rendering, catalog validation, link validation,
  and payload-limit tests.
- Mall-owned metadata sidecars that preserve provenance and legacy fields
  without shipping those fields in strict plugin manifests.

### Changed

- Migrated every curated plugin to Copilot-native component directories for
  skills, agents, commands, and MCP server declarations.
- Normalized plugin authors and manifests to the strict Copilot schema.
- Rewrote valid internal links for relocated files and converted unshippable
  cross-plugin references to explicit inline provenance.
- Limited each plugin payload to 100 files, matching the verified Copilot CLI
  1.0.75 Windows installation ceiling.

### Removed

- Legacy `install_paths`, `artifacts`, shape, tier, and token-cost fields from
  active `plugin.json` manifests. Historical values remain in Mall metadata.
- Duplicate nested manifests from install payloads; their source metadata is
  retained in the corresponding Mall metadata sidecar.

### Compatibility

- Edition v4.2.0 supports guided Mall 3 installation, exact installed-component
  tracking, and Mall 2 fallback behavior.
- Mall 3 installation is opt-in and does not modify existing consumers merely
  because this release is published.
- Edition 3.x and 4.1 consumers are outside the Mall 3 compatibility claim.
- Annotated tag `v2.0.0` remains the rollback anchor for the prior layout.

---

## [2.0.0] - 2026-05-29

**Major release.** Constitutional reframe to self-curating marketplace (catalog `schema_version: 2.1` → `3.0`), Mall brain added, public surface fully cleaned of upstream-curator references and Edition-specific framing. Anyone consuming the v1.x layout will see breaking changes; consumers depending only on `catalog/index.json` and upstream-pinned plugin installs are unaffected.

### Added

- Mall brain: `copilot-instructions.md` (Mall identity, mission, duty stack, cardinal rules) + 7 always-on instructions (act-pass, critical-thinking, falsifiability-deadlines, lint-discipline, no-deferred-debt, problem-framing-audit, terminal-command-safety) + 2 skills (currency-audit, meditation) + 2 prompts (/add-source, /prune-source). Mall brain shape: 9 instructions + 6 skills + 2 prompts + 0 agents.
- Storefront `README.md` (rendered by `render-catalog.cjs`): trust scoring section now self-contained; no longer links externally.
- Source-registry skill rewritten as Mall-native: documents the `sources/supported-stores.json` schema, the `/add-source` and `/prune-source` flows, and the bootstrap-vs-scan rule for the `plugin-mall` self-entry.

### Changed

- Catalog pipeline ships as a unified scan (`scan-sources.cjs` → `normalize-frontmatter.cjs` → `list-refs.cjs` → `compute-trust.cjs` → `render-catalog.cjs`) with the `plugin-mall` self-entry scored alongside third-party stores via published trust signals (provenance +50, maintenance, adoption, license, frontmatter, README).
- Storefront image swapped to `assets/banner.svg` hero (kept) after experimenting with a square icon variant.

### Removed

- `knowledge/` folder (58 files): 19 reference packages migrated to `Alex_ACT_Memory/knowledge/` where they live as the canonical home. Removal also closed an internal-repo leak in `source_store` fields.
- `patterns/champion-challenger-cache.md`: single-file orphan migrated to `Alex_ACT_Memory/knowledge/champion-challenger-cache/`.
- `scaffolds/vite-azure-swa/`: single-file orphan migrated to `Alex_ACT_Memory/knowledge/vite-azure-swa/`.
- `assets/logo.svg`: unreferenced.
- `act-aligned-plugins.md`: unreferenced and contained upstream-curator-specific framing.
- `CATALOG.json` (root, v2.1 schema, 274 KB): superseded by `catalog/index.json` (v3.0).
- 5 legacy migration scripts: `convert-to-plugins.cjs`, `upgrade-plugin-manifests.cjs`, `generate-catalog.cjs`, `fix-descriptions.cjs`, `fix-frontmatter.cjs` (one-shot data-cleanup and v1→v2 conversion scripts; no longer referenced by the active pipeline or workflow).
- Stale brain-artifact references to upstream curator naming and architecture: rewritten across `copilot-instructions.md`, all instructions, all skills, prompts, scripts, and workflow comments so the Mall reads as a standalone marketplace.

---

## [1.0.0] - 2026-05-05

### Added

- Initial release with 301 plugins across 16 categories
- Plugin v2 structure: each plugin is a self-contained folder with `plugin.json`, `README.md`, and brain artifacts
- CATALOG.json v2.1 schema with machine-readable metadata
- 19 knowledge packages across 8 categories (installed to AI-Memory, zero token cost)
