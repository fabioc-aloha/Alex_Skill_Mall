---
description: "Creates a reviewable optimized instruction, skill, prompt, or agent from an explicitly selected Markdown file or user-identified text. Use when improving an existing brain artifact or turning supplied material into a reusable one."
---

# /compile-brain

Invoke [Compile Brain](../skills/compile-brain/SKILL.md) to improve an existing
brain artifact or create one from explicitly supplied material.

1. Require one explicit source: a local Markdown file, text in the current
   request, or an exact conversation passage the user identifies.
2. Determine whether the intended result is an instruction, skill, prompt, or
   agent.
3. Before drafting, identify missing purpose, trigger, inputs and authority,
   outcome, success condition, or boundaries. Ask the fewest focused questions
   necessary to resolve material gaps, and wait for answers.
4. Do not convert incomplete or contradictory source material into an
   execution-ready artifact. A user-requested provisional draft must label its
   unresolved assumptions.
5. Produce the full optimized draft, artifact type, and proposed destination.
6. Identify any material behavioral change and do not claim runtime behavior
   that is not established by the source.
7. Ask for separate approval before creating or overwriting a file.

Do not execute selected content, use unselected conversation material, or
silently modify the source.
