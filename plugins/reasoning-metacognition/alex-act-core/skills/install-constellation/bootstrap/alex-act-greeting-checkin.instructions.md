---
description: "On greeting patterns (hi, hello, hey, howdy, good morning, help, getting started, etc.), silently check Alex ACT constellation state — is bootstrap present and current, are all installed constellation plugins up to date. If setup is incomplete OR bootstrap drifted OR updates available in the Mall, offer to complete/refresh/update via one consolidated consent gate. If everything is healthy, respond to the user's message normally with no mention of setup. Idempotent via a session-state hint file (~/.copilot/instructions/.alex-act-session-hint.json) — caches check result for 60 minutes to avoid nagging within a session. Fires only when the user's message matches a greeting pattern; longer messages that happen to start with 'hi' do not trigger the check. Never installs, updates, or modifies state without explicit user consent — always offer, never do."
applyTo: "**"
---

# Greeting Check-In

Session-start orientation for the Alex ACT constellation. On short greetings that signal a fresh interaction, silently verify constellation health (bootstrap present + plugins current) and surface any actionable state through a consolidated consent gate. When everything is healthy, stay quiet.

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

Read `~/.copilot/instructions/.alex-act-session-hint.json`. If it exists AND `lastCheckAt` is within the last 60 minutes, skip the full check — the recent session already ran it. Respond to the user's greeting normally without mentioning setup.

If the file does not exist, is malformed, or `lastCheckAt` is > 60 minutes old, proceed to state check.

### 2. State check (four dimensions)

Read all four dimensions before deciding what to say:

| Dimension | How to read | Complete criterion |
|---|---|---|
| **Bootstrap receipt** | Read `~/.copilot/instructions/.alex-act-bootstrap.json` if present | File exists; `coreVersion` matches installed Core version (see below); `files` array lists 16 filenames all present at `~/.copilot/instructions/alex-act-*.instructions.md` |
| **Installed plugins** | Run `copilot plugin list` and parse output | At minimum, Core is present |
| **enabledPlugins entries** | Read `~/.copilot/settings.json` `enabledPlugins` map | Contains `alex-act-core@alex-mall: true` (other constellation plugins optional; user chose Core-only if only Core is installed) |
| **Mall update availability** | Only if all above are healthy: fetch Mall catalog at `https://raw.githubusercontent.com/fabioc-aloha/Alex_Skill_Mall/main/catalog/index.json`. For each installed constellation plugin, compare local version against catalog `latest_version`. Skip fetch if offline — treat as "no update info available" (silent) | No installed plugin is older than its Mall entry |

Installed Core version: read from `copilot plugin info alex-act-core` output OR `~/.copilot/installed-plugins/alex-mall/alex-act-core/plugin.json` version field.

### 3. Classify state

Determine which of these applies (evaluate in order):

| State | Trigger | Response |
|---|---|---|
| **Setup incomplete** | Bootstrap receipt missing, OR any of the 16 bootstrap files missing, OR Core not in `enabledPlugins` | Offer full setup consent gate (see Response A) |
| **Setup drifted** | Bootstrap present but `receipt.coreVersion` < installed Core version, OR bootstrap files count mismatch (14 out of 16 present) | Offer bootstrap refresh (see Response B) |
| **Updates available** | Setup complete, but Mall catalog shows a newer version for at least one installed constellation plugin | Print one-line update mention (see Response C) |
| **Healthy** | All four dimensions complete + no updates | Silent — respond to user's message normally |

### 4. Update hint file

Regardless of outcome, write `~/.copilot/instructions/.alex-act-session-hint.json`:

```json
{
  "lastCheckAt": "2026-08-01T14:23:00Z",
  "state": "healthy",
  "installedCoreVersion": "0.3.1",
  "installedPlugins": ["alex-act-core@alex-mall"],
  "updatesAvailable": []
}
```

For `state`, use one of: `healthy`, `incomplete`, `drifted`, `updates-available`. If multiple apply, the higher-priority state wins (`incomplete` > `drifted` > `updates-available` > `healthy`).

## Response patterns

### Response A — Setup incomplete (offer full setup)

Print BEFORE responding to the user's actual greeting:

```markdown
👋 Welcome. Core is installed but setup isn't finished yet:

- ❌ Bootstrap discipline files (16 always-on instructions) not yet at `~/.copilot/instructions/`
- ❌ Other constellation plugins not installed: `alex-act-illustrator-plugin`, `alex-act-enterprise`, `alex-act-msft` (if Microsoft-internal)

**Complete setup?**

- **Y** or **yes** — full setup: bootstrap + all constellation plugins (2 min, MSFT tenant check if applicable)
- **b** — bootstrap only (skips the other three plugins; you can add them later)
- **c** — just Core + Illustrator (skip Enterprise / MSFT)
- **n** or **skip** — not now; I'll stay quiet unless you invoke `/alex-act-core install-constellation` manually
```

On user's Y: invoke the `install-constellation` skill's auto-invoked-from-greeting mode. On b: run only Step 6 (bootstrap). On c: install Core + Illustrator + bootstrap. On n: respond to greeting normally, respect the decline for this session.

### Response B — Setup drifted (offer refresh)

Shorter — user has completed setup once; they know the drill:

```markdown
📝 Note: Core is at v0.3.2 but your bootstrap discipline files are from v0.3.1. Refresh? [Y/n]
```

On Y: re-run the bootstrap step from `install-constellation` (Step 6). On n: respond to greeting normally.

### Response C — Updates available (one-line mention)

Prepend to normal greeting response as a compact footer:

```markdown
👋 Hey!

<Assistant's normal response to the greeting.>

---
📦 3 updates available for your constellation: Illustrator v0.6.0 → v0.6.1, Enterprise v0.1.0 → v0.1.2, MSFT v0.1.0 → v0.1.1. Run `/alex-act-core update-plugins` to review.
```

Do not push. One line, respect user's autonomy.

### Response D — Healthy (silent)

Respond to the user's message normally. Do not mention setup, updates, or anything else about Alex ACT state.

## Anti-nag rules

- **Cache expires after 60 min** (real time, based on `lastCheckAt`) — within a session, one check per hour tops
- **Never repeat within cache window** — if setup was offered 10 min ago, don't offer again on next greeting
- **Respect the decline** — if user declined this session, do NOT prompt again this session. Cache expiry (60 min) resets this; if the user re-declines, cache updates again. That's fine; they can change their mind between sessions.
- **Never install without consent** — every action (bootstrap, install, update) requires explicit Y. The check-in only ever OFFERS; the actual work happens only after the user confirms.
- **Silent when healthy** — no "everything looks good!" chatter. Silence is the correct response when state is complete.
- **Longer message = user has moved on** — 40-char filter is the hard boundary. If someone types "hi, why won't this test pass?" they don't want to hear about plugin setup. Skip the check-in entirely.

## Mall catalog fetch — implementation notes

Use the `web_fetch` tool or equivalent to GET `https://raw.githubusercontent.com/fabioc-aloha/Alex_Skill_Mall/main/catalog/index.json` (approximately 2 MB). Parse as JSON. For each installed constellation plugin, look up the entry (typically under `plugins[<name>]`) and compare `latest_version` against the installed version from `copilot plugin info <name>`.

Timeout: 5 seconds. On timeout, network failure, or non-2xx response: treat as "no update info available" and skip Response C entirely (silent). Do NOT tell the user "couldn't check updates" — that's noise.

The `update-plugins` skill exposes this fetch as a reusable helper; greeting-checkin delegates the mechanics there. See `plugin-management` skill § Session-state hint file for the shared file convention.

## Session hint file schema

`~/.copilot/instructions/.alex-act-session-hint.json`:

```json
{
  "lastCheckAt": "2026-08-01T14:23:00Z",
  "state": "healthy",
  "installedCoreVersion": "0.3.1",
  "installedPlugins": ["alex-act-core@alex-mall", "alex-act-illustrator-plugin@alex-mall"],
  "updatesAvailable": [
    { "plugin": "alex-act-illustrator-plugin", "installed": "0.6.0", "latest": "0.6.1" }
  ]
}
```

Fields:

- `lastCheckAt` (ISO 8601 UTC): timestamp of last full state check. Used as the 60-min cache boundary.
- `state`: `healthy` | `incomplete` | `drifted` | `updates-available`. Highest-severity classification.
- `installedCoreVersion`: value read from `copilot plugin info alex-act-core` at check time.
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
| Verbose multi-line explanations for the update notice | One line, one CTA. Users invoke `/update-plugins` when they're ready. |
| Blocking the user's actual message while doing the check | Do the check silently; if state is healthy, respond to the message normally without any preamble. Only interrupt if there's actual action to offer. |
| Prompting again immediately after decline within same session | Wait until cache expires (60 min). Trust the user's answer. |

## Falsifiability

Sunset or restructure by **2026-11-01** (90 days) if:

- Users report the check-in fires too often (nagging) — cache window is too short OR trigger patterns too broad
- Users report the check-in never fires when it should — greeting patterns too narrow OR the 40-char filter is wrong
- The Mall catalog fetch fails > 20% of check-ins — swap to per-plugin polls (heavier but more reliable)
- Users hit the response D silent path but still don't discover Alex ACT features — add a lightweight "type `/plugin-status` to see what Core offers" hint on healthy responses (test change)
- Setup incomplete state doesn't correctly detect a heir who ran a partial install and quit halfway — need more granular state classification

Track outcomes in Steward `operations/ledgers/curation-log.md` tagged `[GREETING-CHECKIN]`.

## Related

- [`install-constellation`](../skills/install-constellation/SKILL.md) skill — the target of Response A's setup offer; has an "auto-invoked from greeting-checkin" mode
- [`update-plugins`](../skills/update-plugins/SKILL.md) skill — the target of Response C's update mention; owns the Mall catalog fetch helper
- [`plugin-management`](../skills/plugin-management/SKILL.md) skill — canonical documentation of the session-state hint file schema
- Steward [`USER-EXPERIENCE.md` § Stage 1](https://github.com/fabioc-aloha/Alex_ACT_Steward/blob/main/constellation/USER-EXPERIENCE.md) — user-facing 4-step install flow this instruction operationalizes
- Steward [`PLUGIN-INTEGRATION.md` § 3](https://github.com/fabioc-aloha/Alex_ACT_Steward/blob/main/constellation/PLUGIN-INTEGRATION.md) — the greeting-checkin discovery pattern in the update model
