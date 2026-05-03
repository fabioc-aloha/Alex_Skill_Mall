# ACT-Aligned Plugins

**Last updated**: 2026-05-03
**Source**: `CATALOG.json` (field: `act_aligned: true`)
**Purpose**: Heirs can install these on-demand to strengthen ACT reasoning based on project complexity

## How to Use

Heirs running on Edition v1.0.0+ ship with `critical-thinking` and `problem-framing-audit` bundled. For projects that need deeper ACT coverage, install additional plugins from this list:

```bash
/mall install <plugin-name>
```

Plugins install to `.github/skills/local/` so Edition upgrades never overwrite them.

## Selection by Project Complexity

| Project Complexity | Recommended Plugins | Added Tokens |
| --- | --- | --- |
| **Standard** (most projects) | Edition defaults are sufficient | 0 |
| **High-stakes** (security, production, compliance) | + deep-review, falsifiability-test-pattern, disagreement-protocol | ~3,790 |
| **Analytical** (data, research, architecture decisions) | + hypothesis-driven-debugging, calibration-tracking, weighted-scoring-matrix | ~5,124 |
| **Full ACT** (all tenets actively enforced) | All 13 plugins below | ~25,710 |

## Score 3: Strong ACT Alignment (multi-tenet)

These plugins directly operationalize multiple ACT tenets. Low token cost, high reasoning value.

| Plugin | Category | Tokens | Tenets | What it does |
| --- | --- | --- | --- | --- |
| `deep-review` | code-quality | 1,789 | VIII, III | Three-perspective adversarial review: Advocate, Skeptic, Architect |
| `falsifiability-test-pattern` | code-quality | 747 | II, IX | Ensure plans have measurable success criteria that can be proven wrong |
| `calibration-tracking` | reasoning-metacognition | 1,755 | V, IX | Record confidence claims and reconcile against actual outcomes |
| `hypothesis-driven-debugging` | reasoning-metacognition | 2,506 | I, II, VIII | Systematic hypothesis testing for debugging with disconfirmation |
| `appropriate-reliance` | reasoning-metacognition | 4,879 | V, IV | Calibrated human-AI trust with creative latitude by domain |

**Subtotal**: 5 plugins, 11,676 tokens

## Score 2: Solid ACT Alignment (single tenet focus)

These plugins reinforce specific ACT tenets. Cherry-pick based on the project's reasoning needs.

| Plugin | Category | Tokens | Tenets | What it does |
| --- | --- | --- | --- | --- |
| `weighted-scoring-matrix` | architecture-patterns | 863 | III, VI | Multi-factor decisions with explicit weights instead of gut feel |
| `iterative-health-check` | code-quality | 804 | II, IX | Track improvement over time so regressions don't hide |
| `audit-integrity` | code-quality | 1,159 | X, IX | Output quality and intellectual honesty framework for audit work |
| `disagreement-protocol` | communication-people | 1,254 | VIII, IV | Structural resistance to sycophancy when disagreeing |
| `universal-audit-pattern` | code-quality | 1,361 | X, VII | Systematic version, terminology, and cross-reference audit |
| `token-waste-elimination` | ai-agents | 1,954 | VI | Audit and eliminate token waste from brain files |
| `test-quality-analysis` | code-quality | 2,839 | II | Detect coverage-only tests and low-value assertions |
| `documentation-quality-assurance` | documentation | 3,800 | X, II | Doc audit, drift detection, preflight validation pipeline |

**Subtotal**: 8 plugins, 14,034 tokens

## ACT Tenet Coverage Map

| Tenet | Plugins that serve it |
| --- | --- |
| **I** Hypothesis Primacy | hypothesis-driven-debugging |
| **II** Disconfirmation | falsifiability-test-pattern, hypothesis-driven-debugging, calibration-tracking, iterative-health-check, test-quality-analysis, documentation-quality-assurance |
| **III** Multiple Hypotheses | deep-review, weighted-scoring-matrix |
| **IV** Prompt Skepticism | appropriate-reliance, disagreement-protocol |
| **V** Calibration | calibration-tracking, appropriate-reliance |
| **VI** Materiality Gating | weighted-scoring-matrix, token-waste-elimination |
| **VII** Frame Before Solve | universal-audit-pattern |
| **VIII** Adversarial Probe | deep-review, hypothesis-driven-debugging, disagreement-protocol |
| **IX** Visible Markers | falsifiability-test-pattern, calibration-tracking, audit-integrity, iterative-health-check |
| **X** Self-Application | audit-integrity, universal-audit-pattern, documentation-quality-assurance |

## Already Bundled in Edition (no install needed)

These ACT-core skills ship with every heir by default:

| Skill | Type | Tenets |
| --- | --- | --- |
| `critical-thinking` | skill | I, II, III, V, VIII |
| `problem-framing-audit` | skill | VII, III |
| `act-pass` | instruction | All (7-step pass) |
| `epistemic-calibration` | instruction | V |
| `system-prompt-skepticism` | instruction | IV |
| `adversarial-review` | instruction | VIII |
| `reliance-nudges` | instruction | V, IV |
| `alternatives-and-tradeoffs` | instruction | III |

## Notes

- Token costs are for on-demand loading (local/ install), not always-on. They only consume context when the skill activates.
- The `act_aligned` and `act_score` fields are queryable in `CATALOG.json` for tooling: `jq '.plugins[] | select(.act_aligned == true)'`
- This list is maintained by the Supervisor during quarterly retraining passes.
