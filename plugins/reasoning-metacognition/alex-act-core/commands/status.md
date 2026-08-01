---
description: "Report the current project's repository state, recent work, brain QA health (if applicable), and pending handoff items. Use for session orientation or an on-demand project checkpoint."
lastReviewed: 2026-07-28
---

# Status

Produce a terse, read-only orientation report for the current project.

This prompt is self-contained. Do not invoke the generic skill tool for
`status-reporting`; execute the numbered steps directly. A skill-tool inventory
that omits plugin skills is not evidence that Core or its status capability is
missing.

## Steps

1. **Identity**: Confirm which project this is and read the active branch (`git branch --show-current`).
2. **Git state**: Report uncommitted file count and the latest commit subject.
3. **Continuity**: Read `HANDOFF.md` if present; summarize `In progress`, pending queue,
   and resume point. Do not re-litigate closed decisions.
4. **Brain health**: If your project ships brain-QA muscles (Alex ACT uses):

   ```pwsh
   node scripts/brain-qa.cjs
   node scripts/brain-semantic-qa.cjs
   ```

   Otherwise skip and note absence in the report.

5. **Announcements**: If the project configures a shared memory bus (Alex ACT uses the Alex_ACT_Memory sibling repo), list relevant
   unread release/compatibility announcements when requested. Do not modify
   acknowledgment state.
6. **Output**: Lead with material state, then blockers and next action. Omit
   empty sections.

## Boundaries

- Never modify sibling projects during status work.
- Never infer health from a stale dashboard without naming its date.
- Do not commit, pull, push, or acknowledge announcements.
- Repository absence is not evidence of retirement.

## Would Revise If

Revisit by **2026-10-28** if the handoff format changes, brain-QA muscles cease
to represent brain health for projects that ship them, or status reports repeatedly
omit a material blocker present in current repository evidence.
