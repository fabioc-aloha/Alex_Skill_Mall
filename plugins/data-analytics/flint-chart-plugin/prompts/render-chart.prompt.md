---
description: "Pick the right chart for the user's data + question, then author and render it via the flint-chart-mcp server. Loads the chart-big-idea skill for framing, then the flint-chart skill for selection and rendering."
lastReviewed: 2026-07-24
---

# /render-chart

Follow these steps in order. Skip any step that the user's request has already answered.

1. **Load the `chart-big-idea` skill** and produce a Chart Brief. Look in `.github/skills/local/chart-big-idea/SKILL.md` first (heir-installed), then `.github/skills/chart-big-idea/SKILL.md` (baseline). Follow its numbered steps: **Step 0** (read the surrounding docs / prose / ticket / section heading for an existing Big Idea before asking the user anything), Step 1 (draft or elicit the Big Idea — use the 3-question ladder one question at a time if Step 0 didn't surface it), Steps 2–5 (story arc, audience, style stance, Brief). **Ask the user the TRADITIONAL vs INNOVATIVE style-stance question explicitly** unless they've already stated a preference. The output is the compact Chart Brief block that Steps 3-5 below consume as their constraint.

   Skip only if the user provided a fully-formed spec, is iterating style/color on an already-chosen chart, or is doing purely exploratory data profiling — see the skill's "When to invoke" section.

2. **Load the `flint-chart` skill.** Look in `.github/skills/local/flint-chart/SKILL.md` first (heir-installed), then `.github/skills/flint-chart/SKILL.md` (baseline). If neither is present, tell the user to install the plugin and stop.

3. **Understand the data.** If the user attached a file, read the first ~20 rows to see column names, types, and cardinality. If not, ask for a sample, file path, or paste. Do not chart blind — the skill's "Sanity-read the values first" rule applies.

4. **Confirm the analytical question** using the skill's §0.1 (one-sentence message). The Brief's Big Idea usually IS the one-sentence message — if not, tighten it now. Do not re-elicit if Step 1 already produced it.

5. **Pick the chart** via the skill's §0.2 table (question → family → chartType), constrained by the Brief's *Suggested chartType(s)* and *Style stance*. If the Brief said TRADITIONAL, prefer the safe pick from `chart-big-idea` Step 4; if INNOVATIVE, prefer the higher-impact pick. If the compact table doesn't cover the case, escalate per §0.5 and fetch the deep reference at <https://www.thedefensibledecision.com/gallery/chart-gallery.html>. Cross-check against §0.4 to make sure Flint can actually render your choice.

6. **Author the `ChartAssemblyInput`** per the skill's Step 1 (chartType), Step 2 (encodings), Step 3 (semantic types). Reference data columns by name.

7. **Render.** Default to `create_chart_view` (interactive panel with customization sidebar) when the host supports MCP App UI. Fall back to `render_chart` (PNG or SVG) when it doesn't. Use `validate_chart` first if you're unsure the spec is well-formed. Use `compile_chart` when the user wants the backend-native JSON to embed in their own app instead of a rendered image.

8. **Report** what you chose and why, using the Brief as the spine:
   - The Brief's Big Idea + story arc + style stance
   - Which chart family + chartType you picked
   - Which alternates from the Brief and from §0.2 you considered
   - Any anti-patterns you avoided (per §0.3 or per `chart-big-idea` anti-patterns)

If the `flint` MCP server isn't registered, point the user at the plugin README's Install section and stop — do not attempt to render.

## Anti-patterns for this prompt

- **Skipping Step 1 (Chart Brief).** Rendering before framing is the top failure mode. The Brief is 10 lines; the wrong chart costs a re-render plus a user correction.
- **Not asking the TRADITIONAL vs INNOVATIVE question.** Both are valid; the user is entitled to the choice. Silent defaults produce mismatches when the audience is glance-time and you picked innovative because it was more interesting to render.
- **Guessing at data shape.** Read the actual rows. Column names lie; sample values don't.
- **Rendering before framing.** If you can't write the one-sentence message from §0.1 (or the Brief's Big Idea), you don't know what chart to pick yet.
- **Skipping §0.4 (Flint coverage).** If the Brief or §0.2 recommends a chart Flint can't build (Waffle, Chord, Beeswarm, SPC, AI-powered), substitute per §0.4 before authoring the spec — otherwise the render will fail.
- **Overloading a single chart.** More than ~5 series on a line, more than ~5 slices on a pie, more than ~4 series on grouped bars → propose Small Multiples (`row`/`column` facet) or split into multiple charts.

## Would Revise If

Revise this prompt by 2026-10-22 (90 days) or sooner if:

- Users consistently skip Step 1 or find the Chart Brief too heavy (indicates `chart-big-idea` needs its "tighten to 3 fields" fallback triggered).
- Users consistently skip Steps 2-5 (indicating the numbered flow is too heavy for the common case).
- `create_chart_view` becomes unavailable in the majority of hosts (revise the default in step 7).
- The `flint-chart` skill's §0 section is restructured such that these step references (§0.1, §0.2, §0.4, §0.5) go stale.
