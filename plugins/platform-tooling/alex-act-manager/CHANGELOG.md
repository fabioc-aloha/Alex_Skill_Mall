# Changelog

All notable changes to Alex ACT Manager will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
