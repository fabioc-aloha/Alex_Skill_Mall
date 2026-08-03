# Changelog

All notable changes to Alex ACT Document Tools will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-08-03

### Added

- Local `alex-act-document-tools` plugin scaffold.
- Six document converter skills and the `/convert` prompt, ported from
  `Alex_ACT_Core` commit `47ef71ccab23b5e43a0170cb0449708c5f91629b`.
- Shared converter runtime for process execution, Markdown preprocessing,
  Mermaid handling, and data-URI support.
- Contract tests covering inventory, payload capacity, phantom components, and
  startup behavior.
- Explicit Mall include mapping for the shared runtime, verified through a
  temporary 22-file packaged payload.

### Changed

- Replaced Core-relative Markdown links with optional cross-plugin composition
  guidance so the extracted plugin has no broken local dependencies.

### Distribution

- Published through the Alex ACT Mall as
  `alex-act-document-tools@alex-mall`.
- Core converter removal remains a separate compatibility release.
