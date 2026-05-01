---
name: agentic-eval
description: "Patterns for evaluating and improving AI agent outputs through iterative refinement loops. Use when implementing self-critique, building evaluator-optimizer pipelines, creating rubric-based or LLM-as-judge evaluation systems, or adding iterative quality improvement to generated content (code, reports, analysis)."
---

# Agentic Evaluation Patterns

Self-improvement through iterative evaluation and refinement — moving beyond single-shot generation to quality-gated output loops.

## When to Use

- Quality-critical generation (code, reports, analysis requiring high accuracy)
- Tasks with clear evaluation criteria or defined success metrics
- Content requiring specific standards (style guides, compliance, formatting)
- Building self-critique capabilities into agent workflows
- Comparing outputs systematically (LLM-as-judge)

---

## Core Loop

```text
Generate → Evaluate → Critique → Refine → Output
    ↑                              │
    └──────────────────────────────┘
```

Stop when: score meets threshold, OR max iterations reached, OR score stops improving.

---

## Pattern 1: Basic Reflection

Agent evaluates and improves its own output through self-critique.

```python
def reflect_and_refine(task: str, criteria: list[str], max_iterations: int = 3) -> str:
    """Generate with reflection loop."""
    output = generate(task)

    for i in range(max_iterations):
        # Self-critique against criteria
        critique = evaluate(output, criteria)  # Returns JSON: {criterion: {status, feedback}}

        if all(c["status"] == "PASS" for c in critique.values()):
            return output  # All criteria met

        # Refine based on failures only
        failed = {k: v["feedback"] for k, v in critique.items() if v["status"] == "FAIL"}
        output = improve(output, failed)

    return output  # Best effort after max iterations
```

**Key insight**: Use structured JSON output for reliable parsing of critique results. Vague feedback like "could be better" wastes iterations.

---

## Pattern 2: Evaluator-Optimizer (Separated Concerns)

Separate generation and evaluation into distinct components for clearer responsibilities and reusable evaluators.

```python
class EvaluatorOptimizer:
    def __init__(self, score_threshold: float = 0.8, max_iterations: int = 3):
        self.score_threshold = score_threshold
        self.max_iterations = max_iterations

    def generate(self, task: str) -> str:
        """Initial generation."""
        return llm(f"Complete: {task}")

    def evaluate(self, output: str, task: str) -> dict:
        """Score output on multiple dimensions. Returns structured scores."""
        return parse_json(llm(f"""
        Evaluate output for task: {task}
        Output: {output}
        Return JSON: {{"overall_score": 0.0-1.0, "dimensions": {{
            "accuracy": {{"score": N, "feedback": "..."}},
            "clarity": {{"score": N, "feedback": "..."}},
            "completeness": {{"score": N, "feedback": "..."}}
        }}}}
        """))

    def optimize(self, output: str, evaluation: dict) -> str:
        """Improve output based on evaluation feedback."""
        weak_dims = {k: v for k, v in evaluation["dimensions"].items()
                     if v["score"] < self.score_threshold}
        return llm(f"Improve these dimensions: {weak_dims}\nCurrent output: {output}")

    def run(self, task: str) -> str:
        """Full evaluation loop."""
        output = self.generate(task)
        best_output, best_score = output, 0.0

        for _ in range(self.max_iterations):
            evaluation = self.evaluate(output, task)
            score = evaluation["overall_score"]

            if score > best_score:
                best_output, best_score = output, score
            if score >= self.score_threshold:
                break
            if score <= best_score - 0.05:  # Convergence check
                break

            output = self.optimize(output, evaluation)

        return best_output
```

---

## Pattern 3: Code-Specific Reflection (Test-Driven)

Test-driven refinement loop for code generation — the most concrete evaluation strategy.

```python
def test_driven_refine(spec: str, max_iterations: int = 3) -> str:
    """Generate code and refine until tests pass."""
    code = generate_code(spec)
    tests = generate_tests(spec, code)

    for _ in range(max_iterations):
        result = run_tests(code, tests)
        if result["all_pass"]:
            return code

        # Feed specific failure info back
        code = fix_code(code, result["failures"])

    return code  # Best effort — report which tests still fail
```

---

## Evaluation Strategies

### Rubric-Based Scoring

Score outputs against weighted dimensions — best for reproducible evaluation.

```python
RUBRIC = {
    "accuracy":     {"weight": 0.4, "criteria": "Factual correctness, no hallucinations"},
    "clarity":      {"weight": 0.3, "criteria": "Clear, well-structured, jargon-free"},
    "completeness": {"weight": 0.3, "criteria": "Covers all requested aspects"},
}

def score_with_rubric(output: str, rubric: dict) -> float:
    """Score 1-5 per dimension, compute weighted average."""
    scores = evaluate_dimensions(output, list(rubric.keys()))
    weighted = sum(scores[d] * rubric[d]["weight"] for d in rubric)
    return weighted / 5.0  # Normalize to 0-1
```

### LLM-as-Judge (Comparison)

Use when you have multiple outputs to compare rather than absolute scoring.

```python
def pairwise_judge(output_a: str, output_b: str, criteria: str) -> str:
    """Compare two outputs. Returns 'A', 'B', or 'TIE' with reasoning."""
    return llm(f"""
    Compare outputs A and B for: {criteria}
    A: {output_a}
    B: {output_b}
    Which is better? Respond: WINNER: A|B|TIE, REASON: <specific reason>
    """)
```

### Outcome-Based (Binary)

Simplest strategy — did the output achieve the goal?

```python
def outcome_check(output: str, success_criteria: list[str]) -> dict:
    """Check each criterion: PASS or FAIL."""
    return {criterion: check(output, criterion) for criterion in success_criteria}
```

---

## Best Practices

| Practice | Rationale |
| -------- | --------- |
| **Define criteria upfront** | Vague evaluation produces vague improvement |
| **Set iteration limits** (3–5) | Prevents infinite loops and runaway cost |
| **Track best score** | Return best output, not last output |
| **Convergence detection** | Stop if score stagnates or drops |
| **Structured evaluation output** | JSON > prose for reliable loop control |
| **Log full trajectory** | Every iteration's output + score for debugging |

---

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
| ------------ | ------- | --- |
| Evaluating without criteria | "Is this good?" has no answer | Define specific dimensions |
| Unlimited iterations | Token burn, no convergence | Hard cap at 3–5 |
| Refining empty/broken output | Garbage in, garbage out | Re-generate from scratch if malformed |
| Trusting self-evaluation blindly | LLMs overrate their own output | Use external signals (tests, tools) when possible |
| Same prompt for evaluate + generate | Role confusion | Separate system prompts for each |

---

## Implementation Checklist

```markdown
## Setup
- [ ] Define evaluation rubric (dimensions + weights)
- [ ] Set score threshold (default: 0.8)
- [ ] Set max iterations (default: 3)
- [ ] Define convergence criteria (score not improving)

## Implementation
- [ ] Generate function (initial output)
- [ ] Evaluate function (structured JSON scoring)
- [ ] Optimize function (targeted improvement from feedback)
- [ ] Loop controller (threshold + convergence + iteration limit)

## Safety
- [ ] Hard iteration cap (never exceed 5)
- [ ] Convergence detection (stop on plateau/regression)
- [ ] Parse failure handling (retry once, then use last valid)
- [ ] Full trajectory logging (every output + score)
```

---

## When NOT to Use

| Situation | Why Skip Eval Loop |
| --------- | ------------------ |
| Low-stakes, single-shot tasks | Overhead exceeds value |
| No clear evaluation criteria | Can't score = can't improve |
| User expects instant response | Loop adds latency |
| Evaluation is more expensive than generation | Diminishing returns |
| External tool provides ground truth | Use the tool directly, no LLM judge needed |

---

## Integration with ACT

| ACT Tenet | Application |
| --------- | ----------- |
| Tenet II (Disconfirmation) | Evaluation loop actively tries to find flaws |
| Tenet V (Calibration) | Score threshold calibrates confidence |
| Tenet VI (Materiality) | Only apply eval loops to quality-critical tasks |
| Tenet IX (Visible Markers) | Log scores and trajectory — audit trail |
