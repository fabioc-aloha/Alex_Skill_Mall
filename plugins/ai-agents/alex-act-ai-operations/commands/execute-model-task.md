---
description: "Review and execute a model task plan through configured providers after explicit consent. Use when the user has a plan and asks to run, monitor, cancel, or retrieve its work."
lastReviewed: 2026-08-11
---

# /alex-act-ai-operations execute-model-task

Use `model-task-execution` to run an approved provider plan.

Steps:

1. Load the `model-task-execution` skill.
2. Validate the plan and compute its hash.
3. Show the final provider, model, data boundary, and cost summary.
4. If the selected model requires a credential, verify the named `.env`
	variable exists without printing its value; otherwise route to setup.
5. Obtain explicit consent for the current plan.
6. Execute only approved steps and fallbacks.
7. Monitor or cancel through provider-native tools.
8. Return the sanitized execution manifest.

Would revise immediately if the prompt can execute without explicit consent.
