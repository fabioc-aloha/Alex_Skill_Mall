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
