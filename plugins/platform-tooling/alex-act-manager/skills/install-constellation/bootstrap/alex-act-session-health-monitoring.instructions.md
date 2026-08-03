---
description: "Monitor session health, manage context window, and ensure continuity across sessions. Includes Alex ACT bootstrap drift detection — a once-per-session check that the discipline layer at ~/.copilot/instructions/ matches the installed Core plugin version."
applyTo: "**"
lastReviewed: 2026-08-01
---

# Session Health Monitoring

**Always-on rationale**: context capacity is a per-conversation property, not a per-file one. Tracking proxy heuristics, warning signs, and checkpoints must fire continuously across every turn; a scoped glob would silence the monitoring exactly when sessions extend across many file types.

Monitor context usage and ensure graceful session transitions. Token-cost details for specific operations live in the `platform-awareness` skill and in skill bodies; this file owns session-level signals.

## Proxy Heuristics

VS Code does not expose token counts for built-in models. **BYOK models (1.120+) show real token usage and percent-full in the Chat view context-window control** — use that as ground truth when available. For non-BYOK or older builds, estimate via:

| Signal | Interpretation |
|--------|----------------|
| ~4 characters | ≈ 1 token |
| Large file read (500+ lines) | ~2,000-5,000 tokens |
| Base64 image in response | ~10,000-50,000 tokens (avoid — write to file) |
| Unfiltered terminal output | Variable, often 1,000+ tokens (use `Select-Object -First 20`) |

## Warning Signs

| Signal | Action |
|--------|--------|
| Forgetting early conversation context | Update session memory, suggest new session |
| Responses truncating unexpectedly | Reduce output verbosity, offload to files |
| Repeated clarification of established facts | Context may be dropping off |
| User mentions "you forgot" or "we discussed" | Acknowledge, re-read session memory |

## Checkpoints

- **After 6+ exchanges**: consider updating session memory
- **Before image work / large reads**: warn about token cost, confirm approach
- **After major milestone**: summarize progress to session memory
- **If unsure about capacity**: offer to start fresh session with handoff

## Graceful Handoff

When approaching session limits or switching topics, write the cross-session handoff to **repo-root `HANDOFF.md`** (state, completed work, next steps, pending decisions). `/memories/session/` is for in-conversation scratch only — it clears at conversation end and is the wrong tier for handoff content. Suggest: "New session can read `HANDOFF.md` at repo root to continue."

## Bootstrap Drift Detection (Alex ACT constellation)

At most once per session, verify that the Alex ACT discipline layer installed at `~/.copilot/instructions/` matches the currently installed Core plugin version. Drift is silent by default — `copilot plugin update --all` bumps the plugin tree without refreshing the always-on instructions, so the discipline layer lags behind the installed plugin until `install-constellation` Step 6 runs again. Users who never re-run install-constellation after an update never see new discipline additions (like `greeting-checkin` shipped in v0.4.0).

**Check once per session (before any substantive response):**

| Read | Extract | Call it |
|---|---|---|
| `~/.copilot/instructions/.alex-act-bootstrap.json` | `coreVersion` field | `receiptVersion` |
| `~/.copilot/installed-plugins/alex-mall/alex-act-core/plugin.json` | `version` field | `installedVersion` |
| `~/.copilot/instructions/.alex-act-session-hint.json` (if present) | `driftNudgeSurfacedThisSession` boolean | `alreadyNudged` |

**Nudge condition:** `receiptVersion` and `installedVersion` both present, semver-differ, AND `alreadyNudged` is not `true`.

**Nudge shape (one line, non-blocking, printed BEFORE responding to user's actual message):**

> 📝 Alex ACT discipline layer is from Core v`<receiptVersion>` but installed Core is v`<installedVersion>`. Run `/alex-act-core install-constellation` (Step 6 refreshes the bootstrap). Old rules keep working; new instructions from v`<installedVersion>` won't fire until refresh.

After surfacing, write `driftNudgeSurfacedThisSession: true` into `~/.copilot/instructions/.alex-act-session-hint.json` (create the file if absent, merge with existing fields). Do not repeat within the same session.

**Do NOT fire when:**

- Either file is missing (fresh install / no bootstrap yet — `install-constellation` handles those paths)
- Versions match exactly
- Nudge already surfaced this session (`alreadyNudged === true`)
- User's message is a greeting pattern (`greeting-checkin` owns the greeting slot; do not double-nudge)
- User explicitly said "skip drift checks" or invoked `/alex-act-core install-constellation` in the same session

**Chicken-and-egg note:** this drift-detection exists specifically because `greeting-checkin` (added in v0.4.0) cannot detect its own absence — if a user is still on the pre-v0.4.0 bootstrap, `greeting-checkin.instructions.md` isn't at `~/.copilot/instructions/`, so no greeting will trigger the check. This instruction has been part of the bootstrap since v0.3.0, so it can fire the version-drift nudge on machines that greeting-checkin can't reach.

## Would Revise If

Revise if proxy heuristics for token counts consistently mispredict session capacity (warning signs miscalibrated for the current model class), if the BYOK token-counter assumption breaks (extension UI no longer surfaces percent-full), or if graceful-handoff produces `HANDOFF.md` content that the next session can't actually pick up from. Revise the drift-detection section if it produces false-positive nudges on prerelease Core versions (semver-differ heuristic too loose), if the once-per-session hint file mechanism fails and users report repeat nudges, or if plugin-update mechanics change such that update automatically refreshes the bootstrap (this section becomes decorative).
