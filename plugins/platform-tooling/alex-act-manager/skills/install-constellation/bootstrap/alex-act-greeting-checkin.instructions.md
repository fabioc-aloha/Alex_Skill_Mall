---
description: "On short greeting patterns, silently verify the Alex ACT brain spine (Manager, Core, and the seventeen-file bootstrap), check updates, and offer workspace-scoped optional capability configuration when absent. Optional plugins never determine brain health. Cache results per workspace for 60 minutes. Never install, update, or write workspace files without explicit consent."
applyTo: "**"
---

# Greeting Check-In

Session-start orientation for the Alex ACT constellation. On short greetings,
verify the non-optional brain spine, check updates, and offer a repository
capability profile when the current workspace has none. When the spine and
workspace profile are healthy, stay quiet.

## Fresh-install boundary

This instruction cannot run before the first bootstrap because it is one of the
seventeen copied files. A fresh machine must install Manager and Core, then
invoke `/alex-act-manager install-constellation` once. After that, greeting owns
brain-spine repair, update discovery, and workspace capability orientation.

## When to fire

Match if the user's message is BOTH:

1. **≤ 40 characters long** (short — this is the "just saying hi" filter, not "hi, could you refactor this whole file for me")
2. **Matches one of the greeting patterns below** (start-of-message match, case-insensitive)

### Greeting patterns

- `hi`, `hey`, `hello`, `howdy`, `hola`, `greetings`, `sup`, `yo`
- `good morning`, `good afternoon`, `good evening`, `good day`
- `help`, `getting started`, `where do i start`, `where do I start`, `what can you do`
- `ready`, `let's go`, `let's begin`, `start`

### Do NOT fire

- Message > 40 chars (`hi, can you refactor the payment module?` — user has already moved on)
- Message contains code (`hi = "world"` — not a greeting)
- Second user turn onwards where the first message wasn't a greeting (respect the user's flow; don't inject check-in mid-conversation)
- Follow-up "hi" within the same session where the check already ran within the last 60 minutes (see cache rules below)

## What the check does

Run these silently — do NOT print output before deciding whether to respond:

### 1. Cache check

Resolve the current `workspaceRoot`, then read
`~/.copilot/instructions/.alex-act-session-hint.json`. Treat it as a cache hit
only when `lastCheckAt` is within 60 minutes AND its `workspaceRoot` equals the
current workspace. A healthy result in one repository must never suppress setup
for another repository.

If the file does not exist, is malformed, or `lastCheckAt` is > 60 minutes old, proceed to state check.

### 2. State check (five dimensions)

Read all four dimensions before deciding what to say:

| Dimension | How to read | Complete criterion |
|---|---|---|
| **Bootstrap receipt** | Read the receipt and hash each owned target against Manager's bundled bootstrap resources | Receipt records installed Core, owns exactly 17 existing files, and every hash matches |
| **Brain spine installed** | Run `copilot plugin list`, with installed manifests as fallback | `alex-act-manager@alex-mall` and `alex-act-core@alex-mall` are installed |
| **Brain spine enabled** | Read user and repository `enabledPlugins` maps | Manager and Core resolve to `true`; repository settings must never set either to `false` |
| **Update availability** | Use Manager's exact marketplace resolver for installed public plugins; use authenticated source metadata for direct private plugins | No installed plugin is older than its source record; offline means no update conclusion |
| **Workspace capability profile** | Read `<workspaceRoot>/.github/copilot/settings.json` | File exists and pins Manager and Core `true`; any optional-plugin combination is valid |

Manager and Core plus the seventeen-file bootstrap are literally the brain
spine. They are not optional at workspace scope. Illustrator, Enterprise,
Document Tools, MSFT, visual companions, downstream workloads, and their MCP
servers are optional plugins. Missing or disabled optional plugins do not and
must never make the brain unhealthy.

### 3. Classify state

Determine which of these applies (evaluate in order):

| State | Trigger | Response |
|---|---|---|
| **Setup incomplete** | Manager or Core missing/disabled, receipt missing, or a receipt-owned file missing | Offer brain-spine repair (Response A) |
| **Setup drifted** | Receipt version differs from Core or any bootstrap hash differs from Manager's source | Offer bootstrap refresh (Response B) |
| **Workspace unconfigured** | Spine healthy, but no valid workspace capability profile exists | Offer workspace configuration (Response E) |
| **Updates available** | Spine and workspace profile healthy, but an installed plugin has a newer source version | Print update mention (Response C) |
| **Healthy** | Spine, workspace profile, and available update checks pass | Stay silent (Response D) |

### 4. Update hint file

Regardless of outcome, write `~/.copilot/instructions/.alex-act-session-hint.json`:

```json
{
  "lastCheckAt": "2026-08-01T14:23:00Z",
  "state": "healthy",
  "installedCoreVersion": "0.7.2",
  "installedManagerVersion": "0.2.2",
  "workspaceRoot": "C:/path/to/current-repository",
  "workspaceProfileState": "configured",
  "installedPlugins": ["alex-act-manager@alex-mall", "alex-act-core@alex-mall"],
  "updatesAvailable": []
}
```

For `state`, use `healthy`, `incomplete`, `drifted`,
`workspace-unconfigured`, or `updates-available`. Priority is `incomplete` >
`drifted` > `workspace-unconfigured` > `updates-available` > `healthy`.

## Response patterns

### Response A — Setup incomplete (offer full setup)

Print BEFORE responding to the user's actual greeting:

```markdown
Welcome. The Alex ACT brain spine is incomplete:

- Manager and Core must both be installed and enabled.
- The seventeen receipt-owned instructions must be present and current.

**Complete setup?**

- **Y** or **yes** — repair Manager, Core, and the bootstrap
- **n** or **skip** — not now; invoke `/alex-act-manager install-constellation` later
```

On Y, invoke Manager's install/repair flow. Optional plugins are not part of
brain repair and remain workspace-selectable.

### Response B — Setup drifted (offer refresh)

Shorter — user has completed setup once; they know the drill:

```markdown
Note: Core and your instruction bootstrap differ. Refresh the seventeen files from Manager? [Y/n]
```

On Y, run Manager's bootstrap-only repair. On n, respect the decline for this
workspace/cache window.

### Response C — Updates available (one-line mention)

Prepend to normal greeting response as a compact footer:

```markdown
👋 Hey!

<Assistant's normal response to the greeting.>

---
3 plugin updates are available. Run `/alex-act-manager update-plugins` to review.
```

Do not push. One line, respect user's autonomy.

### Response D — Healthy (silent)

Respond to the user's message normally. Do not mention setup, updates, or anything else about Alex ACT state.

### Response E — Workspace capabilities unconfigured

Append one compact question to the normal greeting:

```markdown
Optional capabilities are not configured for this workspace. Configure them? [Y/n/details]
```

On Y, invoke `/alex-act-manager configure-workspace-capabilities`. Inventory
installed optional plugins, ask which should be enabled, disabled, or inherited,
and show the complete preview. Writing `.github/copilot/settings.json` requires
a second explicit apply consent. Never auto-write private/internal identifiers.
After apply, report the supported VS Code workspace plugin and MCP reconciliation
steps because VS Code stores actual enablement separately.

## Anti-nag rules

- **Cache expires after 60 min** (real time, based on `lastCheckAt`) — within a session, one check per hour tops
- **Cache is workspace-specific** — a check in repository A never suppresses repository B
- **Never repeat within cache window** — if setup was offered 10 min ago in this workspace, do not offer again
- **Respect the decline** — if user declined this session, do NOT prompt again this session. Cache expiry (60 min) resets this; if the user re-declines, cache updates again. That's fine; they can change their mind between sessions.
- **Never mutate without consent** — install, update, bootstrap, and workspace profile apply each retain their own consent boundary
- **Silent when healthy** — no "everything looks good!" chatter. Silence is the correct response when state is complete.
- **Longer message = user has moved on** — 40-char filter is the hard boundary. If someone types "hi, why won't this test pass?" they don't want to hear about plugin setup. Skip the check-in entirely.

## Mall catalog fetch — implementation notes

Use Manager's `manager-operations.cjs marketplace-versions` command against the
exact `alex-mall` marketplace manifest for public plugins. Do not infer versions
from the flattened catalog or `marketplace browse`. Check private direct installs
through authenticated source metadata.

Timeout: 5 seconds. On timeout, network failure, or non-2xx response: treat as "no update info available" and skip Response C entirely (silent). Do NOT tell the user "couldn't check updates" — that's noise.

The `update-plugins` skill exposes this fetch as a reusable helper; greeting-checkin delegates the mechanics there. See `plugin-management` skill § Session-state hint file for the shared file convention.

## Session hint file schema

`~/.copilot/instructions/.alex-act-session-hint.json`:

```json
{
  "lastCheckAt": "2026-08-01T14:23:00Z",
  "state": "healthy",
  "installedCoreVersion": "0.7.2",
  "installedManagerVersion": "0.2.2",
  "workspaceRoot": "C:/path/to/current-repository",
  "workspaceProfileState": "configured",
  "installedPlugins": ["alex-act-manager@alex-mall", "alex-act-core@alex-mall"],
  "updatesAvailable": [
    { "plugin": "alex-act-illustrator-plugin", "installed": "0.6.0", "latest": "0.6.1" }
  ]
}
```

Fields:

- `lastCheckAt` (ISO 8601 UTC): timestamp of last full state check. Used as the 60-min cache boundary.
- `state`: `healthy` | `incomplete` | `drifted` | `workspace-unconfigured` | `updates-available`.
- `installedCoreVersion`: value read from `copilot plugin list` or the installed `plugin.json` fallback at check time.
- `installedManagerVersion`: Manager version from list or installed manifest.
- `workspaceRoot`: resolved repository root that owns this cached result.
- `workspaceProfileState`: `configured`, `unconfigured`, `declined`, or `not-a-repository`.
- `installedPlugins`: array of `<plugin>@<marketplace>` identifiers as they appear in `enabledPlugins`.
- `updatesAvailable`: array of pending updates (empty when healthy).

Write with 2-space indentation and a trailing newline, atomic (write to `.tmp` then rename) to avoid partial reads.

## Anti-patterns

| Anti-pattern | Correction |
|---|---|
| Firing on any message that starts with "hi" (e.g., "hi, help me debug this crash") | Enforce the 40-char short-message boundary strictly. "hi, help me..." is not a greeting for this purpose. |
| Chatter when state is healthy ("Everything's fine!") | Silence is the right response. Only speak when there's a state to act on. |
| Running the update-check fetch on every greeting even if cache is fresh | Respect the 60-min cache. Skip fetch entirely when cache is fresh. |
| Auto-invoking install without explicit Y | Every setup action requires consent. Never assume. |
| Treating an optional plugin as required for health | Only Manager, Core, and the bootstrap define the brain spine. |
| Reusing one workspace's cache in another | Require matching `workspaceRoot`. |
| Writing a workspace profile immediately after Y | Y opens inventory and preview; apply requires a second consent. |
| Setting Manager or Core `false` in repository settings | Reject the profile as brain-breaking. |
| Writing private/internal plugin IDs into a public repository silently | Require explicit selection, acknowledgement, and visibility warning. |
| Verbose multi-line explanations for the update notice | One line, one CTA. Users invoke `/alex-act-core update-plugins` when they're ready. |
| Blocking the user's actual message while doing the check | Do the check silently; if state is healthy, respond to the message normally without any preamble. Only interrupt if there's actual action to offer. |
| Prompting again immediately after decline within same session | Wait until cache expires (60 min). Trust the user's answer. |

## Falsifiability

Sunset or restructure by **2026-11-04** if:

- Users report the check-in fires too often (nagging) — cache window is too short OR trigger patterns too broad
- Users report the check-in never fires when it should — greeting patterns too narrow OR the 40-char filter is wrong
- The Mall catalog fetch fails > 20% of check-ins — swap to per-plugin polls (heavier but more reliable)
- Users hit the response D silent path but still don't discover Alex ACT features — add a lightweight "type `/alex-act-core plugin-status` to see what Core offers" hint on healthy responses (test change)
- Setup incomplete state doesn't correctly detect a heir who ran a partial install and quit halfway — need more granular state classification
- Workspace setup prompts repeatedly after a current profile exists
- Any generated profile disables Manager or Core
- Optional-plugin absence is reported as unhealthy
- VS Code provides a documented file-backed API that replaces runtime reconciliation

Track outcomes in Steward `operations/ledgers/curation-log.md` tagged `[GREETING-CHECKIN]`.

## Related

- Manager `install-constellation` — Response A brain-spine repair
- Manager `configure-workspace-capabilities` — Response E workspace profile
- Manager `update-plugins` — Response C update review
- Manager `plugin-management` — settings, versions, and session-hint mechanics
- Steward [`USER-EXPERIENCE.md` § Stage 1](https://github.com/fabioc-aloha/Alex_ACT_Core/blob/main/INSTALL.md) — user-facing 4-step install flow this instruction operationalizes
- Steward [`PLUGIN-INTEGRATION.md` § 3](https://github.com/fabioc-aloha/Alex_ACT_Core/blob/main/INSTALL.md) — the greeting-checkin discovery pattern in the update model
