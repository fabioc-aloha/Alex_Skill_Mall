# Changelog

<!-- markdownlint-disable MD024 -->

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.2] - 2026-08-18

### Changed

- **Repository presents as an independent plugin.** `v1.4.0` had applied the Alex ACT family repo treatment; this reverses the parts of it that asserted membership. Org Report is its own plugin, distributed through the Alex ACT Mall because that is where the Copilot CLI installs it from. Distribution channel, not membership.
- **`assets/banner.svg` de-branded.** Removed the `ALEX` wordmark, the `ARTIFICIAL CRITICAL THINKING` tagline, and the embedded brand-mark PNG; rebalanced the remaining title block. This is the documented override path for the generator's brand config, which Org Report had never exercised. File drops from 24,803 to 1,451 bytes.
- **README relationship section** renamed and rewritten to state independence directly rather than describing Org Report as a first-party constellation plugin.

### Removed

- **Sibling nav strip from the README.** It asserted family membership and its `Manager` link returned HTTP 404 — that repository was retired and deleted.

## [1.4.1] - 2026-08-05

### Changed

- **`plugin.json` moves from `.github/plugin/` to the repository root**, matching every other first-party Alex ACT plugin and the location the Mall vendor reads. Vendoring failed against the old location, so this is required for Mall publication.

## [1.4.0] - 2026-08-05

### Changed

- **Distribution moves from direct GitHub install to the Alex ACT Mall.** Install is now `copilot plugin marketplace add fabioc-aloha/Alex_Skill_Mall` followed by `copilot plugin install org-report@alex-mall`. Direct installs (`copilot plugin install fabioc-aloha/org-report`) are deprecated by the Copilot CLI and will stop working in a future release.
- **Installed path changes** from `~/.copilot/installed-plugins/_direct/fabioc-aloha--org-report/` to `~/.copilot/installed-plugins/alex-mall/org-report/`. Every documented path for the canvas-extension copy, the `pip install -r requirements.txt` step, and manual `export_org.py` regeneration was updated. Existing installs must be removed and reinstalled from the Mall before those commands resolve.
- **README restructured** to match the Alex ACT plugin family: banner, sibling nav strip, Status, Install, What You Get, What Ships, Prerequisites, Setup, and a falsifier. Content is unchanged apart from the install paths.
- `plugin.json` gains `category` (`communication-people`) and an object-form `repository`, and `author` gains a `url` — the shape the Mall catalog reads.

### Added

- `assets/banner.svg` — repository banner in the Alex ACT family style (`ORG` watermark).
- `.markdownlint.json` — shared lint configuration matching the other first-party plugins.

### Removed

- `assets/banner-org-report.svg`, superseded by `assets/banner.svg`.

## [1.3.4] - 2026-08-05

### Fixed

- **Section headings no longer orphan on the previous page.** `accent_bar_heading` now marks its own table row `cantSplit` and sets `keep_with_next` on both the heading cells and the trailing spacer paragraph. Combined with the v1.3.1 profile keep-together, headings glue to the first thing that follows (team-lead profile, chain member, cross-team table, appendix subsection) — Word moves the heading with the block instead of leaving it stranded.

## [1.3.3] - 2026-08-05

### Added

- `--photos-dir PATH` flag on `export_org.py`. When provided, it overrides `config.json > photos.directory` for that run. Enables per-target photo caches (e.g., `targets/<Name>/photos/`) without editing config.

## [1.3.2] - 2026-08-05

### Fixed

- **Profile photos resolve for people whose `email` field is a display alias.** `_resolve_photo` used to fall back from `email` to `userPrincipalName` only when `email` was empty; when the state carried a stale or alias value in `email` (e.g., `judson.althoff@microsoft.com` while the photo was fetched under UPN `judson@microsoft.com`), the lookup silently missed. The resolver now tries `email`, `userPrincipalName`, and `mail` as separate candidates before falling back to `displayName`. Companion fix on the OrgReports `fetch_photos.py` retries with each identity and, on success, writes the photo file under all keys so both tools stay in sync.

## [1.3.1] - 2026-08-05

### Changed

- **Profile blocks no longer split across pages.** `render_profile` now marks every paragraph and table it emits with `keep_with_next` + `keep_together`, and sets `w:cantSplit` on the name-row table. Word treats each profile as a single unit and moves the whole block to the next page when it will not fit on the current one — no more orphaned headings, no more contact lines stranded at the bottom of a page. Profiles larger than a single page still break naturally at the earliest allowed point.

## [1.3.0] - 2026-08-05

### Added

- **Tenure line** — when `employeeHireDate` is present on an entry, the profile shows `N year(s) <suffix>` under the title/department. Config: `tenure.enabled`, `tenure.suffix`.
- **Signal-density dot** — small colored ● next to the display name keyed by `profile.signalDensity` (`high` / `medium` / `low` / `none`). Config: `signal_density.enabled`, `signal_density.colors`.
- **Deep-dive section** — when `profile.deepDive` has any of `strategicBets`, `recentDecisions`, or `crossTeamDependencies`, the renderer appends a "DEEP DIVE" block after collaborators. Config: `deep_dive.enabled`, `deep_dive.label`.
- **Attribution footer** — when `profile.signalCounts` is present, prints "Grounded in N emails · N meetings · N chats · N docs (window)". Config: `attribution.enabled`, `attribution.prefix`.
- **Team-index stats** — new TOTAL and DEPTH columns on the "Teams at a glance" table. Config: `team_stats.enabled`, `team_stats.show_total`, `team_stats.show_depth`.
- **Cross-team collaboration table** — aggregated view of shared-collaborator signals between team leads, rendered as its own page between the team index and profiles. Config: `cross_team.enabled`, `cross_team.title`, `cross_team.top_n`, `cross_team.min_edges`.
- SKILL.md documents Phase 4.2 (optional deep-dive prompt for target + directs), extends the Phase 3 enrichment schema with `signalDensity`, `signalCounts`, and `signalCountsWindow`, and lists all config sections in one table.

### Changed

- **`_flatten_team` walks arbitrary depth** (was capped at 2 levels). Team stats and cross-team aggregation now include grandchildren+ correctly. Reports with deep team structures will show more people per team than before.

## [1.2.0] - 2026-08-05

### Added

- **Profile photos.** `render_profile` now embeds an inline thumbnail before the display name when a matching photo file exists in the configured `photos.directory`. New config section `photos` (`enabled`, `directory`, `key_by`, `size_inches`). Layout falls back to name-only silently when no match. Filename lookup order: `<email>.jpg|jpeg|png` → `<name_key>.jpg|jpeg|png`.
- Photo directory defaults to `~/.copilot/extensions/org-directory/artifacts/photos`. Feature auto-activates when photos are present; supply a fetcher in your application layer (see the `OrgReports` `scripts/fetch_photos.py` for a Microsoft Graph reference implementation).

## [1.1.0] - 2026-08-05

### Added

- `scripts/config.py` — layered configuration loader. Resolution order: `--config PATH` flag → `./config.json` in the current working directory → `~/.copilot/extensions/org-directory/config.json` → built-in tenant-neutral defaults.
- `scripts/config.example.json` — annotated example configuration.
- `--config PATH` flag on `export_org.py`.
- Configurable cover copy (byline, methodology, disclosure), base font, vendor-detection rules, and prose labels via `config.json`.
- `Config source: <path>` line printed after each export so it's obvious which config was picked up.

### Changed

- **Default cover copy is now tenant-neutral.** Byline is empty by default (paragraphs skipped); methodology and disclosure use generic language ("corporate directory service", "communication signals", "confidential organizational information"). To restore Microsoft-tenant text or apply your own, drop a `config.json` next to the script or in the current working directory.
- `plugin.json` description and keywords genericized; removed `microsoft-365` and `workiq` tags.
- Vendor-detection rules (`v-` email prefix, `NON EA` paren exclude) are empty by default; supply via `config.json > vendor_detection`.
- Documentation reframed around a generic directory MCP source. WorkIQ remains the reference implementation and is called out as such.

### Fixed

- Documented install path corrected to `~/.copilot/installed-plugins/_direct/fabioc-aloha--org-report/` (was pointing at the pre-Copilot-CLI-1.0.77 `fabioc-aloha/org-report/` path).

## [1.0.0] - 2026-01

### Added

- Initial release: `org-report` skill, `export_org.py` DOCX + PDF renderer, `org-directory` canvas extension.
