---
name: store-evaluation
description: "Evaluate a proposed store for inclusion in Alex_ACT_Plugin_Mall using a quality scorecard"
lastReviewed: 2026-05-05
---

# Store Evaluation

Score a proposed store against five dimensions. Stores below the threshold are rejected. Stores above are added by [mall-curation](../mall-curation/SKILL.md).

## When to Use

- A user invokes `/add-store` with a candidate store
- Periodic re-evaluation of borderline entries (every 6 months)

## The Five Dimensions

Score 0–2 per dimension. Maximum score is 10. **Threshold for inclusion: ≥ 7**.

### 1. Maintenance Health (0–2)

| Score | Criterion |
|---|---|
| 0 | Repo archived, no commits in 12+ months, last release > 2 years old |
| 1 | Active but low velocity — commits in last 6 months, no recent release |
| 2 | Active maintenance — commits in last 90 days OR active issue triage OR recent release |

### 2. Adoption Signal (0–2)

| Score | Criterion |
|---|---|
| 0 | Solo project, < 50 stars, no external contributors |
| 1 | Some adoption — 50–500 stars, occasional external contributors |
| 2 | Real adoption — > 500 stars OR multiple maintainers OR sustained external contribution |

(Stars are noisy; weight them with maintenance + license signal.)

### 3. License Clarity (0–2)

| Score | Criterion |
|---|---|
| 0 | No license, custom restrictive license, or unclear terms |
| 1 | Permissive license but with vendor-specific restrictions |
| 2 | Clean OSI-approved license (MIT, Apache 2.0, BSD, ISC, etc.) |

### 4. ACT-Edition Fit (0–2)

| Score | Criterion |
|---|---|
| 0 | Off-topic — no clear use case for an ACT heir |
| 1 | Tangential — useful in narrow scenarios |
| 2 | Direct fit — ACT heirs would use this in normal workflows |

### 5. Documentation Quality (0–2)

| Score | Criterion |
|---|---|
| 0 | No README, broken docs, or installation steps unclear |
| 1 | Basic README, install instructions present, examples sparse |
| 2 | Quality README + examples + clear installation + troubleshooting |

## Decision

| Total score | Verdict |
|---|---|
| 9–10 | **Strong accept** -- adapt and add immediately |
| 7–8 | **Accept** -- adapt and add with a note of any caveats |
| 5–6 | **Defer** -- request more signal (stars, contributors, time) and re-evaluate in 90 days |
| 0–4 | **Reject** -- document the rationale in `docs/` |

**On accept**: run the adaptation checklist before creating the Mall entry. Never copy upstream artifacts verbatim.

### Adaptation Checklist (mandatory for every promotion)

- [ ] Rewrite SKILL.md to Mall frontmatter conventions (name, version, description with triggers)
- [ ] Generate fresh `plugin.json` with correct category, shape, token_cost, source_store
- [ ] Generate `README.md` with description, source attribution, skill list, install command
- [ ] Strip source-specific paths, references, and internal tooling assumptions
- [ ] Verify token cost is reasonable for the value delivered
- [ ] Confirm the skill reads as Mall-native (a heir installing it shouldn't see upstream repo artifacts)

## Output Template

```markdown
# Store Evaluation — <store name>

**URL**: <repo URL>
**Date**: YYYY-MM-DD
**Evaluator**: Supervisor

## Scores

| Dimension | Score | Notes |
|---|---|---|
| Maintenance Health | x/2 | ... |
| Adoption Signal | x/2 | ... |
| License Clarity | x/2 | ... |
| ACT-Edition Fit | x/2 | ... |
| Documentation Quality | x/2 | ... |
| **Total** | **x/10** | |

## Verdict

Strong accept | Accept | Defer | Reject

## Rationale

<2-3 sentences>

## Proposed Mall entries

(if accepted)

- STORES.md: <one-line entry>
- CATALOG.json: <one-line entry>

## ACT Pass Trail

<markers>
```

## Anti-Patterns

| Anti-pattern | Correction |
|---|---|
| Scoring on stars alone | Stars are one signal of five; weight with maintenance and fit |
| "I like it" override | The scorecard is the contract. Document overrides as ADRs |
| Rejecting without recording | Every rejection sets precedent; document or future similar proposals will repeat the cycle |

## Falsifiability

This scorecard needs revision if any of the following occur within 90 days:

- Accepted stores (score >= 7) are repeatedly pruned for quality or maintenance failures
- Deferred stores (score 5-6) consistently pass later without new evidence, indicating scoring too strict
- Reviewers produce materially different scores for the same store with no documented rationale

Track these in `docs/ledgers/curation-log.md` tagged `[STORE-SCORING]`.

## Related

- [mall-curation](../mall-curation/SKILL.md)
- [staleness-discipline](../staleness-discipline/SKILL.md)
- `/add-store` prompt
