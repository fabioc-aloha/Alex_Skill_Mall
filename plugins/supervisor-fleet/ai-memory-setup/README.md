# AI-Memory Setup

Detect, create, and manage the AI-Memory fleet communication channel on the user's cloud drive.

## Quick Facts

| Field | Value |
| --- | --- |
| Category | supervisor-fleet |
| Shape | `.S..` (skill only) |
| Token cost | ~2,200 |
| Engines | copilot |
| Requires | Edition >= 0.9.9 |

## What It Does

AI-Memory is the shared folder where ACT heirs communicate with each other and with the Supervisor. This plugin teaches the heir how to:

- **Detect** which cloud drives exist (OneDrive, iCloud, Dropbox)
- **Find** an existing AI-Memory folder using the resolution algorithm
- **Create** the AI-Memory folder structure if none exists
- **Persist** the user's choice in `cognitive-config.json`
- **Read** announcements on session start
- **Write** feedback to the correct inbox
- **Respect** `ai_memory_root` and `ai_memory_exclude` overrides

## When to Use

- First bootstrap of a new heir (no AI-Memory exists yet)
- User asks "set up fleet communication" or "where do heirs communicate"
- Heir tries to write feedback but `resolveAiMemoryRoot()` returns null
- Session start check for announcements
- Any operation touching `AI-Memory/` paths

## What It Installs

| Artifact | Destination |
| --- | --- |
| SKILL.md | `.github/skills/local/ai-memory-setup/SKILL.md` |

## Folder Structure Created

```text
<cloud-drive>/AI-Memory/
  README.md
  feedback/
    README.md
    alex-act/
      README.md
  announcements/
    alex-act/
      README.md
  heirs/
  knowledge/
  insights/
```

## Related

- `cloud-storage-paths` (platform-tooling): generic path resolution for any cloud drive
- `_registry.cjs` (Edition script): the muscle that implements detection and creation
- `cognitive-config.json`: heir-owned config where the path choice is persisted
