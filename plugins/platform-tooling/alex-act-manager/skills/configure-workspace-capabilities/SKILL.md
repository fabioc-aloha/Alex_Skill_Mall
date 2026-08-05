---
name: configure-workspace-capabilities
description: "Previews and configures repository-level defaults for optional Alex ACT plugins while keeping Manager and Core enabled. Use when greeting setup finds no workspace capability profile, when a project needs different plugins than the user default, or when auditing workspace plugin scope."
lastReviewed: 2026-08-04
---

# Configure Workspace Capabilities

Configure a repository's optional Alex ACT plugin defaults without weakening the user-level brain spine.

## When to Use

- Greeting check-in finds a healthy brain spine but no workspace capability profile
- A project needs Illustrator, Enterprise, Document Tools, MSFT, visual companions, or downstream workload plugins enabled or disabled differently from the user default
- The user invokes `/alex-act-manager configure-workspace-capabilities`
- An audit finds project-specific plugins enabled globally

## Invariants

- `alex-act-manager@alex-mall` is always `true`
- `alex-act-core@alex-mall` is always `true`
- The seventeen receipt-owned user instructions remain active
- Optional plugins change only after explicit user selection
- Private/internal plugin identifiers require an explicit visibility acknowledgement
- Existing unrelated repository settings are preserved
- Preview is the default; apply requires a second explicit consent
- The workflow never writes VS Code's undocumented workspace-state storage

## Runtime

The deterministic runtime is shared with Manager's other lifecycle operations:

```text
node <plugin-management-skill>/scripts/manager-operations.cjs configure-workspace-capabilities [options]
```

Options:

| Option | Meaning |
| --- | --- |
| `--target <path>` | Repository to configure; default is the current directory |
| `--enable <id[,id...]>` | Set selected optional plugin keys to `true` |
| `--disable <id[,id...]>` | Set selected optional plugin keys to `false` |
| `--include-private` | Acknowledge that private/internal identifiers may be committed |
| `--apply` | Apply the displayed plan atomically |

Manager and Core are inserted automatically and cannot be disabled.

## Procedure

1. Verify the target is the intended repository.
2. Read installed plugins and show optional candidates grouped as:
   - public Alex ACT capabilities
   - visual companions
   - public project workloads
   - private/internal capabilities
3. Ask which optional plugins should be enabled, disabled, or inherited.
4. For private/internal selections, inspect repository visibility and show a warning before including identifiers in a committed file.
5. Run the deterministic command without `--apply`.
6. Show the complete JSON plan, including preserved keys, changed plugin values, and VS Code reconciliation steps.
7. Ask for explicit apply consent.
8. Run the same command with `--apply` only after consent.
9. Run preview again and require `action: preserve` with no changes.
10. Reconcile actual VS Code workspace state through supported controls:
    - Agent Plugins - Installed for plugin state
    - MCP: List Servers for separately stored MCP state
    - Configure Tools for per-request tools

## Output Contract

The plan reports:

- target repository
- `.github/copilot/settings.json` destination
- preview/apply state
- `create`, `merge`, or `preserve` action
- exact plugin changes
- complete desired `enabledPlugins` map
- private identifiers and visibility warning
- whether comments prevent automatic apply
- `reconcile-in-workspace-ui` when VS Code state remains to be aligned

## Scope Semantics

The repository file is authoritative for Copilot CLI and cloud-agent project defaults. In VS Code it is a workspace recommendation/default. VS Code stores actual workspace plugin and MCP enablement separately, so this skill reports the supported reconciliation actions instead of claiming the file can force hidden state.

Disabling an optional plugin through VS Code also stops that plugin's MCP servers, hooks, commands, skills, and agents. Standalone workspace MCP definitions remain owned by `.vscode/mcp.json` and are never fabricated by this workflow.

## Privacy Boundary

Do not write private/internal plugin identifiers into a public repository merely because they are installed on the machine. Require:

1. explicit selection,
2. `--include-private`, and
3. a visible warning that the identifier will enter committed project configuration.

If repository visibility cannot be established, treat it as potentially public.

## Rollback

Repository settings are ordinary versioned configuration. Restore the prior `.github/copilot/settings.json` through Git or reverse selected optional values in a new preview. Never remove Manager, Core, or the user instruction receipt as workspace rollback.

## Anti-Patterns

| Anti-pattern | Correction |
| --- | --- |
| Set Manager or Core to `false` | Reject. They are the brain spine. |
| Copy every user plugin into every workspace | Offer installed plugins for selection; write only explicit choices. |
| Commit MSFT or Agency identifiers silently | Require private acknowledgement and visibility warning. |
| Apply before showing the complete plan | Preview, show, consent, apply. |
| Claim repository settings force VS Code workspace state | Report the supported Agent Plugins and MCP reconciliation controls. |
| Create an empty `.vscode/mcp.json` | Do nothing unless a real standalone workspace server is configured. |
| Replace `enabledPlugins` or marketplace maps wholesale | Deep-merge and preserve unrelated keys. |

## Would Revise If

Revise by **2026-11-04** if workspace profiles do not reduce unwanted optional capability loading, if users can disable Manager or Core through this workflow, if private identifiers enter a public repository without explicit acknowledgement, if greeting prompts repeatedly for an unchanged profile, or if VS Code exposes a documented file-backed workspace-state API that replaces manual reconciliation.

## Related

- [`plugin-management`](../plugin-management/SKILL.md) - settings shape and scope precedence
- [`bootstrap-workspace`](../bootstrap-workspace/SKILL.md) - repository Markdown CSS and VS Code settings
- [`install-constellation`](../install-constellation/SKILL.md) - user-level installation and instruction bootstrap
