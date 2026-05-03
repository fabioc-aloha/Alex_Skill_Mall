---
type: skill
lifecycle: stable
inheritance: inheritable
name: ai-memory-setup
description: "Detect, create, and manage the AI-Memory fleet communication channel. Fires on bootstrap, session start (announcements), and feedback writes."
tier: standard
applyTo: '**/AI-Memory/**,**/cognitive-config*,**/*feedback*,**/*announcement*,**/*fleet*,**/*memory-setup*'
currency: 2026-05-02
lastReviewed: 2026-05-02
---

# AI-Memory Setup

AI-Memory is the shared folder on the user's cloud drive where ACT heirs exchange feedback, announcements, and registry data. This skill covers detection, creation, path resolution, and ongoing read/write operations.

## Path Resolution Algorithm

Resolve the AI-Memory root in this order:

1. **Config override**: read `.github/config/cognitive-config.json`. If `ai_memory_root` is set, use `<HOME>/<ai_memory_root>/AI-Memory`.
2. **Candidate scan**: check these folders under `<HOME>` in order. First existing `<folder>/AI-Memory/` wins:
   - `OneDrive - Correa Family`
   - `OneDrive`
   - `iCloudDrive`
   - `iCloud Drive`
   - `iCloud~com~apple~CloudDocs`
   - `Dropbox`
3. **Local fallback**: `~/AI-Memory` (no cloud sync)
4. **Exclusion list**: if `ai_memory_exclude` is set in cognitive-config.json, skip those folder names during the candidate scan.

The resolution order matches `_registry.cjs` (the muscle used by `bootstrap-heir.cjs` and `upgrade-self.cjs`). LLM heirs and scripts must agree on the same path.

## Folder Structure

```text
<cloud-drive>/AI-Memory/
  README.md                           # Channel overview
  feedback/
    README.md
    alex-act/                         # Heir feedback inbox
      README.md
  announcements/
    alex-act/                         # Fleet-wide announcements
      README.md
  heirs/
    registry.json                     # Fleet registry (auto-maintained)
  knowledge/                          # Shared knowledge base
  insights/                           # Analytical insights
```

## Operations

### Detect (session start)

On every session start, resolve the AI-Memory root. If found:

1. Check `announcements/alex-act/` for unread files
2. Report any new announcements to the user (one line each)
3. Do NOT read or report feedback (that's the Supervisor's job)

If not found: note it silently. Do not prompt the user unless they explicitly ask about fleet communication.

### Create (first time setup)

When AI-Memory is needed but doesn't exist (bootstrap, first feedback write):

1. Discover which cloud drives exist:

   ```javascript
   // In a heir project with Edition scripts:
   node -e "console.log(JSON.stringify(require('./.github/scripts/_registry.cjs').discoverCloudDrives(), null, 2))"
   ```

2. If multiple drives found, ask the user which one to use. If only one, use it. If none, offer `~/AI-Memory` as local fallback.

3. Create the folder structure:

   ```javascript
   node -e "const r = require('./.github/scripts/_registry.cjs'); console.log(JSON.stringify(r.initAiMemory('<drive-name>'), null, 2))"
   ```

4. Persist the choice:

   ```json
   // .github/config/cognitive-config.json (heir-owned)
   {
     "ai_memory_root": "OneDrive - Correa Family",
     "ai_memory_exclude": ["OneDrive - Microsoft"]
   }
   ```

5. Verify: `resolveAiMemoryRoot()` should now return the new path.

### Write Feedback

When the heir observes friction worth surfacing:

1. Resolve AI-Memory root
2. Write one markdown file per item to `feedback/alex-act/`
3. Filename format: `YYYY-MM-DD-<short-slug>.md`
4. Strip project specifics per `cross-project-isolation.instructions.md`
5. Required frontmatter: Date, Category (bug/friction/feature-request/success), Severity (critical/high/medium/low), Heir (redacted), Edition version

### Read Announcements

On session start (triggered by `greeting-checkin.instructions.md`):

1. Resolve AI-Memory root
2. List files in `announcements/alex-act/` (skip README.md)
3. For each unread file, report the title and date
4. Do NOT delete announcement files (they persist for all heirs)

## Multi-Cloud-Drive Disambiguation

Users may have multiple OneDrive accounts (personal + work). The `ai_memory_exclude` field prevents heirs from writing to the wrong drive.

| Scenario | Resolution |
| --- | --- |
| One OneDrive | Auto-detected, no config needed |
| Two OneDrives, AI-Memory in one | `ai_memory_root` pins the correct one |
| Two OneDrives, AI-Memory in both | `ai_memory_exclude` blocks the wrong one |
| No OneDrive, has iCloud | iCloud candidate resolves |
| No cloud drive at all | `~/AI-Memory` local fallback |

## Configuration Reference

`cognitive-config.json` fields (heir-owned, never overwritten on upgrade):

| Field | Type | Default | Purpose |
| --- | --- | --- | --- |
| `ai_memory_root` | string | (auto-detect) | Cloud drive folder name to use |
| `ai_memory_exclude` | string[] | [] | Folder names to skip during detection |

## Anti-Patterns

| Anti-pattern | Correction |
| --- | --- |
| Hardcoding an absolute path | Use the resolution algorithm; paths differ per user and OS |
| Creating AI-Memory in `OneDrive - Microsoft` (work account) | Personal cloud drive only; work drives may have retention policies |
| Writing feedback without stripping project context | Always apply `cross-project-isolation` before writing |
| Reading feedback as a heir | Feedback is for the Supervisor; heirs read announcements only |
| Creating AI-Memory on every session | Create once on bootstrap; subsequent sessions just resolve |

## Muscle Reference

The `_registry.cjs` script (shipped with Edition) provides the programmatic API:

| Function | Purpose |
| --- | --- |
| `resolveAiMemoryRoot()` | Returns the AI-Memory path or null |
| `discoverCloudDrives()` | Lists cloud drives with `hasAiMemory` flag |
| `initAiMemory(driveName)` | Creates full folder structure + READMEs |
| `upsertHeir(marker, repoPath)` | Updates `heirs/registry.json` |
