---
description: "Compare current models across configured AI providers and produce an executable plan without running paid work. Use when the user asks which model or provider should perform a task."
lastReviewed: 2026-08-11
---

# /alex-act-ai-operations choose-model

Use `model-router` to create an evidence-backed provider plan.

Steps:

1. Load the `model-router` skill and provider contract.
2. Capture the task, deliverables, and hard constraints.
3. Query relevant live provider tools.
4. Compare feasible candidates and record unknown evidence.
5. If the selected model needs a credential, emit a `Secret setup` section with
	the exact variable name and `.env` path; never request or print its value.
6. Emit a schema-valid JSON plan and plain-language consent summary.
7. Stop before provider execution.

Would revise by **2026-11-11** if users cannot discover the advisory workflow
or if it invokes provider execution before handing off.
