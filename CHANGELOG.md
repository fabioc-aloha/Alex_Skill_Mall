# Changelog

All notable changes to Alex ACT Plugin Mall.

## [Unreleased]

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
