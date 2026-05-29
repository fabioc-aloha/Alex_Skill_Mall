---
name: mall-source-inventory
description: "Maintain and inventory the C:\\Development\\MALL source repos that feed the Plugin Mall: refresh, health-check, add, retire"
lastReviewed: 2026-05-03
---

# Mall Source Inventory

Maintain the upstream source repos in `C:\Development\MALL` that feed the Plugin Mall. These are the raw material: external repos cloned locally so the Supervisor can scan, evaluate, and promote plugins into `Alex_ACT_Plugin_Mall`.

## When to Use

- Before any `/audit-mall` or `/scan-stores` run (refresh first)
- Weekly or on-demand via `/refresh-mall-sources`
- When adding a new upstream repo to the MALL folder
- When a store appears dead, archived, or relocated
- When `store-sync.cjs` reports SKIP or WARN for a store

## Relationship to Other Skills

| Skill | Scope | This skill's role |
| --- | --- | --- |
| `mall-curation` | Curates Plugin Mall entries (plugins/, CATALOG.json) | Feeds raw material to mall-curation |
| `store-evaluation` | Scores a proposed plugin for Mall inclusion | This skill manages the *repos* that contain those plugins |
| `staleness-discipline` | Detects stale Mall plugins | This skill detects stale *source repos* |
| `store-sync.cjs` (script) | Mechanical fetch + flat inventory | This skill governs *when and how* to run it, plus the judgment calls the script cannot make |

## The MALL Folder

`C:\Development\MALL` contains cloned repos organized by source quality tier:

| Tier | Description | Examples |
| --- | --- | --- |
| **Internal** | Microsoft Agency governance-reviewed repos | `.github-private`, `playground` |
| **Official** | GitHub, Microsoft, or Anthropic maintained | `copilot-plugins`, `microsoft-skills`, `hve-core`, `mcp-servers` |
| **Community curated** | Community repos with editorial standards | `awesome-copilot`, `awesome-mcp-servers`, `awesome-claude-code` |
| **Community** | Individual or small-team repos | `claude-skills`, `copilot-kit`, `wshobson-agents` |
| **Domain** | Vertical-specific collections | `game-studios`, `marketingskills` |
| **Reference** | High-signal individual contributors | `andrej-karpathy-skills` |

The canonical store list lives in `scripts/store-sync.cjs` (the `STORES` array). The MALL folder and the STORES array must agree.

## Refresh Procedure

### 1. Pull all repos

```powershell
foreach ($d in (Get-ChildItem -Directory C:\Development\MALL)) {
    Push-Location $d.FullName
    if (Test-Path ".git") {
        Write-Host "=== $($d.Name) ==="
        git pull --ff-only 2>&1
    }
    Pop-Location
}
```

Or use `store-sync.cjs` which does the same fetch as its first step:

```bash
node scripts/store-sync.cjs
```

### 2. Check health

After pulling, verify each repo:

| Check | Pass | Fail action |
| --- | --- | --- |
| `git pull` succeeds (ff-only) | Clean fast-forward or "already up to date" | If diverged: investigate local changes. If network error: retry later. |
| Remote URL resolves | GitHub returns 200 | Repo may have moved or been deleted. Check for redirect or replacement. |
| Repo is not archived | GitHub API: `archived: false` | Flag for retirement review. Archived + stable = keep with note. Archived + stale = retire. |
| Last upstream commit within 12 months | Recent activity | Low-velocity is OK for reference repos (e.g., karpathy-skills). No activity + no value = retire candidate. |
| No local uncommitted changes | Clean working tree | MALL repos should never have local changes. If found, discard or investigate. |
| Branch is default (main/master) | On default branch | Reset to default. MALL clones track upstream only. |

### 3. Reconcile with store-sync.cjs

The `STORES` array in `store-sync.cjs` must match the MALL folder contents:

| MALL folder | STORES array | Action |
| --- | --- | --- |
| Present | Listed | OK |
| Present | Not listed | Add to STORES array, or the repo does not belong in MALL |
| Absent | Listed | Clone it, or remove from STORES array |

## Adding a New Source Repo

1. **Evaluate fit**: Does this repo contain plugins, skills, or agents relevant to ACT-Edition heirs? Apply the same judgment as store-evaluation but at the repo level.
2. **Clone**: `git clone <url> C:\Development\MALL\<short-name>`
3. **Register**: Add an entry to the `STORES` array in `scripts/store-sync.cjs` with:
   - `name`: short kebab-case identifier
   - `path`: `path.join(MALL_DIR, '<folder-name>')`
   - `pluginDir`: where plugins live in that repo (`.`, `plugins`, `skills`, `src`, etc.)
   - `quality`: tier tag (see tier table above)
4. **Verify**: Run `node scripts/store-sync.cjs` and confirm the new store appears in `mall/STORE-INVENTORY.md`
5. **Record**: Note the addition in `docs/ledgers/curation-log.md`

## Retiring a Source Repo

1. **Confirm**: The repo is archived, deleted, or no longer produces relevant content
2. **Check dependencies**: Grep `Alex_ACT_Plugin_Mall/` for plugins that originated from this store. If any exist, they survive independently in the Mall (retirement of the source does not retire the plugins).
3. **Remove from STORES array** in `store-sync.cjs`
4. **Optionally delete** the local clone from `C:\Development\MALL\` (reversible by re-cloning)
5. **Record**: Note the retirement in `docs/ledgers/curation-log.md`

## Inventory Report

`store-sync.cjs` produces two artifacts:

| Artifact | Location | Content |
| --- | --- | --- |
| `mall/STORE-INVENTORY.md` | Markdown | Human-readable plugin list with descriptions, grouped by store |
| `mall/store-inventory.json` | JSON | Machine-readable inventory for downstream tooling |

The `/scan-stores` prompt consumes these to match plugins against fleet needs.

## Health Dashboard (manual)

After a refresh, summarize the fleet of source repos:

```
| Store | Remote | Last commit | Status | Plugins found |
| --- | --- | --- | --- | --- |
| .github-private | agency-microsoft/.github-private | 2026-05-01 | active | 42 |
| ... | ... | ... | ... | ... |
```

## Anti-Patterns

| Anti-pattern | Correction |
| --- | --- |
| Making local edits in MALL repos | MALL clones are read-only mirrors. Never commit locally. |
| Adding a repo to MALL without registering in store-sync.cjs | Unregistered repos are invisible to the inventory pipeline |
| Keeping archived repos indefinitely | Review archived repos quarterly; retire if no longer producing value |
| Cloning huge repos for one plugin | Prefer shallow clone (`--depth 1`) for large repos with narrow relevance |
| Running `/scan-stores` without refreshing first | Stale clones produce stale inventory. Always pull before scanning. |

## Falsifiability

This skill is not earning its tokens if, after 90 days:

- The MALL folder and STORES array have drifted (repos present but unregistered, or vice versa)
- No source repo health check has been recorded in the curation log
- A stale source repo caused a bad plugin promotion that could have been caught by the health check

## Related

- [mall-curation](../mall-curation/SKILL.md) -- downstream: curates the Plugin Mall itself
- [store-evaluation](../store-evaluation/SKILL.md) -- downstream: scores individual plugins
- [staleness-discipline](../staleness-discipline/SKILL.md) -- parallel: detects stale Mall content
- `scripts/store-sync.cjs` -- mechanical fetch and inventory
- `/refresh-mall-sources` prompt -- operator entry point
- `/scan-stores` prompt -- consumes the inventory this skill produces
