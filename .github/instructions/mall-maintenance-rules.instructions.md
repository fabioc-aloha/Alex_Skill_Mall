---
description: "Always-on routing for Mall self-curation work — fires the right Mall skill at the right moment. Mall-side companion to Supervisor's mall-maintenance-rules; this version routes Mall-internal operations, the Supervisor version routes oversight + Edition coherence."
applyTo: "**"
lastReviewed: 2026-05-29
---

# Mall Maintenance Rules (Mall-side)

The Plugin Mall self-curates since 2026-05-29 (ADR-008). This always-on rule routes any Mall-internal work to the right skill at the right moment.

For the **Supervisor-side** companion (oversight, Edition coherence, cross-repo concerns), see [Alex_ACT_Supervisor/.github/instructions/mall-maintenance-rules.instructions.md](https://github.com/fabioc-aloha/Alex_ACT_Supervisor/blob/main/.github/instructions/mall-maintenance-rules.instructions.md). This file fires only when the operator is working inside the Mall repo.

## Routing Table (Mall-side)

| Trigger | Fire skill |
|---|---|
| Pipeline operations (scan / score / render / publish) | [mall-self-curation](../skills/mall-self-curation/SKILL.md) |
| Add / remove a source store in `supported-stores.json` | [source-inventory](../skills/source-inventory/SKILL.md) |
| Evaluate a candidate store before adding it to the registry | [store-evaluation](../skills/store-evaluation/SKILL.md) |
| Source store appears stale (no upstream activity, broken remote, etc.) | [staleness-discipline](../skills/staleness-discipline/SKILL.md) |
| Curated plugin under `plugins/<category>/<name>/` needs editorial change | **Route to Supervisor** — curated plugins are editorial; Mall self-curation does not modify `plugins/` |
| Catalog refresh PR (`catalog-refresh/YYYY-MM-DD`) needs review | [mall-self-curation](../skills/mall-self-curation/SKILL.md) § Workflow + cadence |
| New plugin shape (frontmatter convention) breaks the scan | [mall-self-curation](../skills/mall-self-curation/SKILL.md) § Anti-Patterns + `normalize-frontmatter.cjs` |
| Edition ↔ Mall coherence question (Edition references a plugin — does it exist?) | **Route to Supervisor** — coherence is Supervisor territory |
| Decide a Mall plugin earns a slot in Edition baseline brain | **Route to Supervisor** — promotion is Supervisor territory |
| Trust score formula tuning | [mall-self-curation](../skills/mall-self-curation/SKILL.md) § Trust scoring formula; ADR amendment if structural |
| Quarterly Mall-vs-Edition review | **Route to Supervisor** — quarterly retraining is Supervisor's ADR template |

## Hard Rules (cannot be overridden)

1. **The workflow MUST NOT modify `plugins/`.** Mall self-curation is automation over `catalog/`, `scoring/`, `README.md`, `sources/SOURCES.md` only. Editorial changes to curated plugins are Supervisor territory and originate via PR review.
2. **Bootstrap MUST skip `plugin-mall`.** The Mall self-entry in `supported-stores.json` is for scan inclusion, not clone inclusion. `bootstrap-sources.cjs` filters `name !== "plugin-mall"`.
3. **Scan MUST include `plugin-mall`.** The self-scan walks `$REPO_ROOT/plugins/` and produces `catalog/stores/plugin-mall.json` like any other store.
4. **Every commit touching brain artifacts** (skills, instructions, workflow files) carries a severity tag per [severity-tagged-commits](../../instructions/severity-tagged-commits.instructions.md) — `[typo | clarification | behaviour | constitutional]`. Structural changes to the trust formula or pipeline shape are `[behaviour]`; reframes of the constitutional boundary are `[constitutional]` and require an ADR amendment.
5. **Cross-repo coherence work goes to Supervisor.** If the question is "does Edition still reference this Mall plugin?" or "should this Mall plugin be in Edition's baseline?" the answer is Supervisor, not here.

## Boundary cheat sheet — Mall vs Supervisor ownership

| Concern | Owner |
|---|---|
| Source registry (`supported-stores.json`) maintenance | **Mall** |
| Scan pipeline (scripts under `scripts/scan-*.cjs`) | **Mall** |
| Trust scoring + signals | **Mall** |
| Catalog publishing (`catalog/`, `scoring/`, rendered MD) | **Mall** |
| Editorial decisions on curated plugins (`plugins/<category>/<name>/`) | **Supervisor** (PR-reviewed) |
| Edition-promotion decisions | **Supervisor** (`promotion-criterion` skill) |
| Edition ↔ Mall coherence | **Supervisor** (`coherence-audit` skill) |
| Reframe what counts as "curated" | **Supervisor** ADR |
| Quarterly Mall-vs-Edition review | **Supervisor** (`quarterly-retraining-ADR` template) |

When in doubt, the line is: **Mall owns mechanical and data-driven operations; Supervisor owns editorial and constitutional decisions.**

## Would Revise If

Revise by **2026-08-29** (90 days) or sooner if any of the following fires:

- The routing table sends a Mall-internal operation to Supervisor ≥2 times in a quarter (boundary miscalibrated)
- Hard Rule 1 (workflow does not modify `plugins/`) is violated ≥1 time
- Hard Rule 5 (cross-repo coherence routes to Supervisor) is violated ≥1 time — Mall self-modifies cross-repo policy
- A new operation surfaces that isn't covered by the routing table ≥2 times in a quarter (table incomplete)

Track in `docs/curation-log.md` tagged `[MALL-ROUTING]`.
