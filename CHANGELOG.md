# Changelog

All notable changes to Alex ACT Plugin Mall.

## [Unreleased]

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
