# Changelog

All notable changes to Alex ACT Manager will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.2] - 2026-08-04

### Fixed

- Kept only Manager and Core enabled at user scope during constellation setup;
  installed optional plugins now remain disabled globally until a separately
  consented workspace capability profile activates them.

## [0.3.1] - 2026-08-04

### Fixed

- Synchronized the corrected greeting dimension wording with Core's bootstrap
  source.

## [0.3.0] - 2026-08-04

### Added

- Added preview-first workspace capability profiles that always pin Manager and
  Core enabled while allowing explicit repository defaults for optional plugins.
- Added private/internal identifier acknowledgement, atomic deep-merge apply,
  idempotency checks, and supported VS Code plugin/MCP reconciliation guidance.

## [0.2.2] - 2026-08-03

### Security

- Changed the private MSFT direct-install and metadata source to
  `fabioc_microsoft/alex-act-msft`, owned by a Microsoft enterprise-managed
  account.
- Required the active GitHub CLI identity to read the managed repository
  before MSFT installation; external personal-account fallback now fails
  closed.

## [0.2.1] - 2026-08-03

### Fixed

- Disabled VS Code's automatic next-change reveal in the managed user baseline
  so resolving a chat edit does not unexpectedly open another changed file.

## [0.2.0] - 2026-08-03

### Added

- Added preview-first user baseline merging and workspace CSS refresh, with
  deep object merges, comment-rich JSONC fail-closed handling, and separate
  consent/reporting for user settings, instructions, and workspace files.

## [0.1.1] - 2026-08-03

### Fixed

- Kept Agent Skills enabled while disabling VS Code's experimental generic
  skill resolver, which cannot invoke plugin-contributed skills in VS Code
  1.131 (`microsoft/vscode#314772`).

## [0.1.0] - 2026-08-03

### Added

- Local `alex-act-manager` plugin scaffold.
- Five lifecycle skills and seven namespaced commands ported from
  `Alex_ACT_Core` commit `47ef71ccab23b5e43a0170cb0449708c5f91629b`.
- Seventeen byte-identical Core instruction bootstrap resources.
- Manager-owned deterministic runtime, VS Code baseline, and Markdown preview
  CSS.
- Contract tests for inventory, namespace, bootstrap parity, workspace preview,
  and exact marketplace version resolution.

### Changed

- Rehomed user-facing lifecycle commands under `/alex-act-manager`.
- Replaced hidden Core CSS and VS Code baseline paths with Manager-owned skill
  resources.

### Distribution

- Published through the Alex ACT Mall as `alex-act-manager@alex-mall`.
- Core lifecycle removal remains a separate compatibility release.
