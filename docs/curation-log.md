<!-- markdownlint-disable MD041 MD024 -->

# Mall Curation Log

Append-only log of curation decisions, judgment calls, and falsifier-trigger evidence for the Plugin Mall.

Established 2026-06-23 per ADR-008 § Falsification: "Track triggers in `docs/ledgers/curation-log.md` tagged `[MALL-AUTOMATION]` and in Mall's own `docs/curation-log.md` tagged equivalently."

## What goes here

- **Editorial decisions** the Mall self-curation surfaces for judgment (a third-party store earns score 0 because the maintainer changed license to NOASSERTION; a new third-party plugin appears as an alternative to a Mall-curated entry; a Mall-curated plugin's `adapted_from` upstream is archived).
- **Falsifier-trigger evidence** for ADR-008 § Falsification (11 triggers tracked through 2026-08-29 retrospective).
- **Convention/policy changes** that affect catalog behaviour (trust scoring weight adjustments, source registry policy shifts).

## What does NOT go here

- **Routine catalog refreshes** (auto-shipped via weekly cron; git log is the audit trail; tagging each refresh here would be noise).
- **Heir-side operational issues** (those go to `Alex_ACT_Memory/feedback/`).
- **Supervisor-side Edition-promotion decisions** (those live in `Alex_ACT_Supervisor/docs/ledgers/brain-qa-changelog.md`).

## Entry format

```markdown
| Date | Tag | Source / trigger | Decision | Evidence |
| --- | --- | --- | --- | --- |
| YYYY-MM-DD | [TAG] | what surfaced the item | M (mechanical) or S (semantic) — what was decided | links / commit SHAs |
```

Tag vocabulary:

- `[MALL-AUTOMATION]` — ADR-008 falsifier-trigger evidence
- `[STORE-LICENSE]` — license-clarity decisions (e.g. NOASSERTION fallback)
- `[STORE-DEMOTION]` — store pruned due to staleness / abandonment / quality drop
- `[PLUGIN-PROMOTION]` — Mall-curated plugin proposed for Edition baseline
- `[TRUST-TUNE]` — trust scoring formula adjustment
- `[CONVENTION]` — schema / format / policy change

## Log

| Date | Tag | Source / trigger | Decision | Evidence |
| --- | --- | --- | --- | --- |
| 2026-06-23 | `[CONVENTION]` | Mall audit surfaced absent `docs/curation-log.md` (ADR-008 § Falsification expected it) | M — create the artifact + define entry format. Zero curation decisions to backfill (Mall has been operational 25 days; no judgment calls surfaced; all 7 catalog refreshes were clean automated runs per `git log -- catalog/`). | Mall audit 2026-06-23; ADR-008 § Falsification |
| 2026-06-23 | `[STORE-LICENSE]` | Tier-1 candidate `ComposioHQ/awesome-claude-skills` — 826 SKILL.md units, 65K stars, active | S — **defer**. GitHub API reports no SPDX license (`license` field empty). Store-evaluation L-dimension scores 0/2 ("No license, custom restrictive license, or unclear terms"); total drops below threshold. Per `/add-source` Boundaries: "Do not skip the scorecard. Stores below score 7 do not get added even if the requester insists." Re-evaluate when upstream adds LICENSE; consider opening upstream issue. | Live `gh api /repos/ComposioHQ/awesome-claude-skills` 2026-06-23 |
| 2026-06-23 | `[STORE-DEMOTION]` | Tier-1 candidate `PatrickJS/awesome-cursorrules` — 40K stars, 253 `.mdc` files at `rules/<name>.mdc`, MIT, very active | S — **defer**. `scripts/scan-sources.cjs listPluginCandidates` walks directories only (`if (!d.isDirectory()) continue;` line 213); `.mdc` files at flat layout are skipped entirely. Catalog Fit is high (entire Cursor ecosystem, zero coverage today) but Scanner Compatibility = 0. Needs scanner extension to recognize file-based catalog units before this store can be ingested. Track as scanner roadmap item. | Mall audit 2026-06-23; scan-sources.cjs:212-216 |
| 2026-06-23 | `[STORE-DEMOTION]` | Tier-1 candidate `microsoft/power-platform-skills` — 380 stars, 54 SKILL.md units at `plugins/<area>/skills/<name>/SKILL.md` (multi-area: code-apps, power-pages, ...), MIT, active | S — **defer**. Scanner walks 2 depth levels (`if (depth > 2) return` line 200); the 3-level layout means `<area>` dirs get cataloged as super-plugins (each has `skills/` marker), masking the actual 54 individual skills. Two paths forward: (a) scanner gains `extraDepth` field per registry entry, (b) one registry entry per area with `pluginDir: "plugins/<area>/skills"` (ongoing maintenance burden — would silently miss new areas). Defer pending scanner extension decision. | Mall audit 2026-06-23; scan-sources.cjs:199-200 |
