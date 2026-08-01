---
description: "Generate a 1200×320 SVG banner using the active brand config (default: Alex ACT), with title, subtitle, and watermark. Use for READMEs, plans, notes, and release artifacts."
lastReviewed: 2026-07-29
---

# Banner

Generate an SVG banner for the top of a markdown document. Wraps the `generate-banner.cjs` script and the `svg-banner` skill.

Skill: [svg-banner](../skills/svg-banner/SKILL.md). Script: `.github/skills/svg-banner/scripts/generate-banner.cjs`. Brand config: `.github/config/banner-brand.json`.

## When to Use

- Adding a hero banner to a new README, PLAN, ROADMAP, or release artifact
- Branded section header for documentation sites
- Visual identity for a doc the user will share externally

## Watermark Categories (from active brand config)

The default Alex brand config ships these six categories. Heirs that customize the brand config swap this whitelist for their own vocabulary.

| Watermark | Use For                                     |
| --------- | ------------------------------------------- |
| `ACT`     | Critical-thinking artifacts, framework docs |
| `EDITION` | Edition-specific docs, release notes        |
| `DOCS`    | General documentation                       |
| `RELEASE` | CHANGELOG, release artifacts                |
| `PLAN`    | PLAN.md, roadmaps, design docs              |
| `NOTE`    | Working notes, drafts, session handoffs     |

## Steps

1. **Pick the title** — ≤ 32 characters. Keep it punchy. Project name or doc category usually wins.
2. **Pick the subtitle** — ≤ 80 characters. One-line value statement (what the doc is FOR, not what it contains).
3. **Pick the watermark** from the table above (or from a heir-customized `banner-brand.json`). If unsure, pick `DOCS`.
4. **Choose output path** (default: `assets/banner-<slug>.svg`). Slug derived from title if omitted.
5. **Run**:

   ```sh
   node .github/skills/svg-banner/scripts/generate-banner.cjs \
     --title "Project Name" \
     --subtitle "One-line value statement" \
     --watermark DOCS \
   --out assets/banner-readme.svg
   ```

6. **Embed in markdown**:

   ```markdown
   ![Project banner](assets/banner-readme.svg)

   # Project Name
   ```

7. **Verify** — open the SVG in browser or VS Code preview. The brand mark must render, title and subtitle must fit, and the watermark must remain in the lower-right background.

## Boundaries

- **Watermark whitelist is enforced.** The active brand config's `watermarks[]` array is the whitelist; custom watermarks are rejected. If you need a new category, edit `.github/config/banner-brand.json` (project-scoped) rather than the script.
- **Brand override**: pass `--brand-config path/to/other.json` for a one-off, or commit a project-specific `.github/config/banner-brand.json`.
- **No PNG conversion.** The script outputs SVG only. Convert to PNG with `npx svgexport` if needed (separate workflow).
- **Pastel-color variants live in the Mall.** If you need a non-Edition aesthetic (e.g. `document-banner-pastel`), install from the Plugin Mall — don't shoehorn this script.

## Would Revise If

Revisit this prompt by **2026-10-29** (90 days) or sooner if any of the following fires: the workflow it invokes ceases to produce its intended output (skill body changed but prompt steps stale); the visible markers / verification steps in its body are consistently skipped; the slash-command name is no longer discoverable in the prompt picker; or the brand-config extensibility described in Boundaries proves unused (never overridden in any observed heir) — in which case simplify by folding the config back into the script's built-in defaults.
