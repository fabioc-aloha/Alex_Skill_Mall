# Changelog

All notable changes to this plugin will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2026-08-11

### Removed

- Removed the `aiops-replicate` MCP and Replicate provider routing. Illustrator
  remains the single Alex ACT Replicate implementation.

## [0.1.0] - 2026-08-11

### Added

- Added `model-router` for provider-neutral task decomposition, live discovery,
  feasibility filtering, model comparison, and executable plan authoring.
- Added `model-task-execution` for immutable-plan verification, explicit
  consent, provider dispatch, status, cancellation, and execution evidence.
- Added `setup-ai-operations` with hosted Hugging Face guidance plus
  preview-first exact ElevenLabs 0.12.2 private runtime provisioning.
- Added Microsoft Foundry through its first-party hosted MCP preview and
  Microsoft Entra ID authentication.
- Added three first-party provider MCP definitions and three namespaced prompts.

### Changed

- Kept provider credentials optional until an approved execution selects a
  provider and operation that require access.
- Made plugin onboarding credential-free: installation completes without API
  keys, tokens, provider login, authentication, or runtime provisioning.
