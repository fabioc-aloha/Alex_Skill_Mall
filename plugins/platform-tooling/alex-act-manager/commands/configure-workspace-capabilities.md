---
description: "Preview and configure optional Alex ACT plugins for the current workspace while keeping Manager and Core enabled. Use after greeting setup offers workspace capability configuration or when project plugin scope needs repair."
lastReviewed: 2026-08-04
---

# /configure-workspace-capabilities

Run the workspace capability workflow through Manager's deterministic runtime.

Steps:

1. Load [configure-workspace-capabilities](../skills/configure-workspace-capabilities/SKILL.md).
2. Confirm the target repository.
3. Inventory installed plugins and group optional candidates by public, visual, workload, and private/internal scope.
4. Keep `alex-act-manager@alex-mall` and `alex-act-core@alex-mall` enabled without offering a disable choice.
5. Ask which optional plugins should be enabled, disabled, or inherited.
6. Warn before placing private/internal identifiers in repository configuration.
7. Run preview only and show its complete JSON plan.
8. Ask for explicit apply consent.
9. Apply only after consent, then rerun preview and require an idempotent result.
10. Report the supported VS Code workspace plugin and MCP reconciliation steps separately.
11. Report that local Copilot CLI 1.0.78 does not let repository `true` override user `false`; use explicit `--plugin-dir` arguments for workspace-only CLI loading.

Do not create `.vscode/mcp.json` unless the workspace has a real standalone MCP server definition.

## Would Revise If

Revisit by **2026-11-04** if the command cannot preserve the brain spine, if its preview and apply behavior diverge, or if users mistake repository defaults for VS Code's separately stored runtime state or local CLI activation.
