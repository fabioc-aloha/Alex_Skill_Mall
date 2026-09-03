---
description: "Creates a reviewable optimized instruction, skill, prompt, or agent from an explicitly selected Markdown file or user-identified text. Use when improving an existing brain artifact or turning supplied material into a reusable one."
---

# /compile-brain

Invoke [Compile Brain](../skills/compile-brain/SKILL.md) to improve an existing
brain artifact or create one from explicitly supplied material.

1. Require one explicit source: a local Markdown file, text in the current
   request, or an exact conversation passage the user identifies.
2. Determine whether the intended result is an instruction, skill, prompt,
   agent, or brain contract.
3. Before drafting, identify missing purpose, trigger, inputs and authority,
   outcome, success condition, or boundaries. Ask the fewest focused questions
   necessary to resolve material gaps, and wait for answers.
4. Apply the **Semantic Preservation Gate** before drafting. Build a behavior
   inventory of behavioral invariants: frontmatter, purpose, triggers,
   authority, mandatory steps/order, stop/escalation paths, safety/consent
   boundaries, validation/revision conditions, relative links, supporting
   resources, and operational examples or commands.
5. Apply the **Human-Facing Artifact Gate**. Ask whether a person outside the
   authoring team will read the artifact to form an impression or make a
   decision — `BRAIN.md`, README, onboarding docs, and picker-visible
   descriptions usually qualify; runtime-only instructions usually do not. When
   it fires, name the audience, hold back token reduction, imperative
   compression, and deduplication, and route language review to a copy-review
   capability if the host has one. Otherwise tag findings `[idiom]`, `[tone]`,
   `[register]`, `[ambiguity]`, or `[grammar]`, one tag each, presented for
   individual approval rather than as a single rewrite.
6. Compare the draft to every invariant and run representative scenarios,
   including a failure, edge, or safety case. Verify relative links resolve at
   the intended output destination and preserve supporting resources required
   by the workflow. Never replace portable links with machine-specific absolute
   paths.
7. Start with a **conservative first pass** capped at 20% estimated character
   or token reduction. Remove only established duplication or stale host
   residue; retain detailed procedures, examples, tables, citations, and
   resources unless their lack of operational meaning is established. Do not
   apply a reduction target to a human-facing artifact as a goal.
8. Before a **second pass**, present the first pass's preservation receipt and
   measured reduction. Continue only when the user explicitly requests it. For
   a **high-reduction** draft (>35% cumulative estimated characters or tokens),
   state the rationale and require a fresh-context semantic review before
   calling it execution-ready. Above 50%, explicitly challenge whether removed
   tables, examples, citations, or links carried operational meaning.
9. Do not convert incomplete or contradictory source material into an
   execution-ready artifact. A user-requested provisional draft must label its
   unresolved assumptions.
10. Produce the full optimized draft, artifact type, proposed destination, and
    preservation receipt. The receipt lists retained behavioral invariants,
    deliberately removed illustrations, scenario results, link/resource checks,
    reduction measurement, unresolved ambiguity, material behavior changes, and
    — when the human-facing gate fired — the named audience and the
    optimizations withheld.
11. Do not claim runtime behavior that is not established by the source.
12. Ask for separate approval before creating or overwriting a file.

When compiling a project-wide brain contract, require explicit instruction
hierarchy, routing, arbitration, execution, and verification sections. State
that its platform entrypoint must reference or incorporate it before it is
active.

Do not execute selected content, use unselected conversation material, or
silently modify the source.
