# Project Audit

**Audit date:** 2026-08-06
**Audited commit:** `81405a0` (`main`)
**Scope:** catalog ingestion, trust scoring, rendering, validation, plugin packaging, CI governance, generated state, and public documentation
**Overall risk:** **High**

## Executive Summary

The Mall has a strong structural baseline: all 46 tests pass, catalog validation
passes for 42 stores and 3,865 entries, plugin packaging fails closed on several
important boundaries, and contributor publication is separated from automated
catalog refreshes.

The full network refresh is not safe to run against untrusted upstreams in its
current form. An upstream-controlled default branch name reaches a shell command
while the scheduled workflow holds write-capable repository permissions. The
audit also found 11 duplicate current catalog entries, ref-discovery failures
that do not fail the pipeline, 25 unmarked reference-only entries in the public
index, and malformed descriptions in the install marketplace.

**Recommendation:** fix F-01 and F-02 before the next full refresh. Treat F-03
and F-04 as release-blocking for any claim that catalog counts are unique or
that every surfaced third-party item is installable.

## Findings

### F-01 - Critical - Upstream branch names can inject shell commands

[`list-refs.cjs`](scripts/list-refs.cjs#L57) constructs `git` commands as one
shell string. The default branch comes from the cloned upstream repository and
is later interpolated into `rev-parse --verify` in
[`getRefSha`](scripts/list-refs.cjs#L76). Git accepts shell metacharacters in
ref names; `git check-ref-format 'refs/heads/main;whoami'` returned exit code 0
during this audit.

The scheduled refresh runs this code with `contents: write`,
`pull-requests: write`, and `statuses: write` permissions in
[`scan-sources.yml`](.github/workflows/scan-sources.yml#L10-L13). A registered
upstream can therefore make its default branch name execute arbitrary commands
in the refresh runner.

**Remediation:** use `spawnSync`/`execFileSync` with argument arrays and
`shell: false` for every Git/GitHub CLI invocation. Resolve the checked-out
commit with the constant ref `HEAD`; treat the branch name only as data. Add a
fixture repository whose valid branch name contains `;` and assert that no
second process runs.

### F-02 - High - Ref-discovery errors do not fail publication

When ref discovery fails, [`applyRefsToStore`](scripts/list-refs.cjs#L111-L120)
writes `refs_error` and returns an error result. The main loop counts the error
but exits successfully in [`list-refs.cjs`](scripts/list-refs.cjs#L211-L240).
The preceding scan has already initialized `scanned_ref` and source links to
mutable `main` placeholders.

[`validate-catalog.cjs`](scripts/validate-catalog.cjs#L138-L164) does not reject
`refs_error`, require a 40-character `scanned_ref`, or require SHA-pinned source
URLs. A degraded store can consequently pass every current gate and be
published with mutable links, contradicting the version-pinnable catalog
contract.

**Remediation:** exit nonzero if any store has a ref error, or explicitly
exclude degraded stores from publication. Make validation reject `refs_error`,
non-SHA `scanned_ref`, and non-SHA source URLs. Add an end-to-end failure test.

### F-03 - High - Current catalog counts include 11 duplicate entries

The generated catalog contains duplicate names within the same store:

| Store | Duplicate names | Cause visible in source paths |
| --- | ---: | --- |
| `awesome-copilot` | 9 | Each appears under both `plugins/<name>` and `skills/<name>` |
| `mongodb-agent-skills` | 2 | Each appears under both `skills/<name>` and `testing/<name>` |

The scanner appends every candidate without a uniqueness rule in
[`listPluginCandidates`](scripts/scan-sources.cjs#L180-L224), and validation
does not check same-store names. The reported 3,865 rows therefore represent
3,854 unique `(store, plugin-name)` identities. Search results, distribution
counts, and adoption-facing totals are inflated.

The Unreleased changelog acknowledges only the nine `awesome-copilot`
duplicates in [`CHANGELOG.md`](CHANGELOG.md#L104-L110), so the documented known
issue is also incomplete.

**Remediation:** define deterministic precedence for duplicate source shapes
(for example, canonical plugin payload over standalone skill, production over
testing), deduplicate during scan, and make same-store duplicate names a hard
validation failure. Pin the behavior with both current source layouts as
fixtures.

### F-04 - High - Reference-only stores lose their non-installable status

The registry marks five stores as `reference_only`, containing 25 current
catalog entries. [`buildIndex`](scripts/render-catalog.cjs#L76-L104) does not
carry that field into `catalog/index.json`, and no renderer or public index path
uses it. Consumers cannot distinguish those entries from installable entries.

This conflicts with the registry contract in
[`supported-stores.schema.json`](sources/supported-stores.schema.json#L48-L52)
and with the storefront statement that third-party plugins remain installable
in [`README.md`](README.md#L250-L263).

**Remediation:** propagate `reference_only` or an explicit `installable` value
to store and index records. Exclude reference-only entries from install-focused
commands and label them in discovery views. Validate that every installable
entry has an actual supported installation route.

### F-05 - Medium - First-party trust signals are not described honestly

For `plugin-mall`, maintenance and adoption are hardcoded to their maximums
(`15` and `10`) in
[`computeStoreSignals`](scripts/compute-trust.cjs#L136-L157), independent of
commit recency, stars, or contributors. The generated storefront describes
those signals generically as “Last upstream commit recency” and “GitHub stars +
contributors” in [`render-catalog.cjs`](scripts/render-catalog.cjs#L530-L541).

The per-store JSON note discloses the pin, so this is a transparency mismatch
rather than a hidden implementation. It still cuts against the Mall's central
honest-signals claim.

**Remediation:** either derive first-party maintenance/adoption from the same
evidence as other stores, or disclose the first-party pin beside the public
formula and name it as an editorial prior rather than measured adoption.

### F-06 - Medium - The validator omits required publication invariants

The validator silently returns when `.github/plugin/marketplace.json` is absent
in [`validateMarketplace`](scripts/validate-catalog.cjs#L54-L57), even though
that file is the documented install surface. It also does not assert that each
store's `plugin_count` equals `plugins.length`, that plugin names are unique
within a store, or that individual trust signals remain inside their published
ranges.

The test named “trust scores and signals are bounded and present” checks the
overall score and missing fields, but not signal bounds, in
[`validate-catalog.test.cjs`](test/validate-catalog.test.cjs#L109-L122).

**Remediation:** make the marketplace mandatory and add the missing invariants
to both validation and mutation-style tests.

### F-07 - Medium - Structurally valid descriptions are unusable

Marketplace rendering requires only a non-empty description in
[`render-marketplace.cjs`](scripts/render-marketplace.cjs#L44-L49). Four
published plugins currently use YAML block markers as their complete
description:

- `agent-memory-architecture`: `>`
- `agentic-actions-auditor`: `>`
- `agency-os`: `|`
- `brag-sheet`: `>`

`agent-evaluation` is visibly truncated at “behavioral testing,”. These values
are copied into `.github/plugin/marketplace.json`, so users see them while
browsing the install surface.

**Remediation:** reject YAML block markers, punctuation-only descriptions, and
obvious truncation. Parse YAML frontmatter with the existing `yaml` dependency
instead of the partial line parser where source normalization is involved. Add
a corpus validation test across all curated manifests.

### F-08 - Medium - Unreleased state and known-issue metrics have drifted

The Unreleased section says maintenance reconciled the project to 363 curated
plugins and 3,862 catalog entries in [`CHANGELOG.md`](CHANGELOG.md#L42-L45).
Current generated state is 362 curated entries and 3,865 total rows. The v3.0.0
figures of 365 curated plugins are historical release facts and should remain;
only the current Unreleased status needs a new reconciliation entry.

The known duplicate-scanner note also omits the two MongoDB duplicates found in
F-03.

**Remediation:** record the current removals/additions and distinguish total
rows from unique `(store, name)` identities. Keep historical release counts
unchanged.

### F-09 - Low - CI dependency resolution is not fully reproducible

Both workflows run `npm install --ignore-scripts` despite a committed lockfile
([`scan-sources.yml`](.github/workflows/scan-sources.yml#L29-L31),
[`validate-plugin-pr.yml`](.github/workflows/validate-plugin-pr.yml#L24-L26)).
The workflows also reference Actions by mutable major tags rather than commit
SHAs.

**Remediation:** use `npm ci --ignore-scripts` and pin third-party Actions to
reviewed commit SHAs, with an update mechanism such as Dependabot.

## Verified Strengths

- `npm run check` passed: **46/46 tests**, catalog validation PASS, **42 stores**,
  **3,865 rows**.
- Plugin packaging rejects path escapes, symlinks, common credential files,
  broken relative Markdown links, and payloads above 100 files.
- Remote vendoring uses shell-free Git argument arrays and an atomic
  backup/rollback path.
- Contributor PR validation is read-only, runs on every PR, and does not
  auto-merge. CODEOWNERS covers plugins, scripts, the marketplace, and registry.
- Generated Markdown escapes table pipes and normalizes line breaks.
- `VERSION`, the local annotated `v3.0.0` tag, and marketplace metadata agree.
- The installed dependency tree is minimal and healthy: Node `v24.18.0` with
  `yaml@2.9.0`.
- No forbidden credential-like filenames or common committed private-key/token
  signatures were found in the audited paths.

## Validation Evidence

| Check | Result |
| --- | --- |
| `npm run check` | PASS |
| `node --version` | `v24.18.0` |
| `npm ls --all` | One dependency, no tree errors |
| Catalog duplicate scan | 11 same-store duplicate rows |
| Reference-only scan | 5 stores / 25 entries, no index marker |
| Manifest description scan | 4 block-marker placeholders, 1 truncation |
| Git ref metacharacter check | `refs/heads/main;whoami` accepted |
| Credential filename/signature scan | No matches |
| Release metadata check | `VERSION=3.0.0`; `v3.0.0` is an annotated tag |

## Remediation Order

1. **P0:** eliminate shell interpolation in ref discovery and add the malicious
   branch-name regression test.
2. **P0:** fail publication on ref errors; validate SHA-pinned refs and URLs.
3. **P1:** deduplicate same-store identities and enforce uniqueness.
4. **P1:** propagate installability/reference-only state into every consumer
   surface.
5. **P2:** align the public trust formula with actual first-party scoring.
6. **P2:** strengthen validation and repair malformed manifest descriptions.
7. **P3:** reconcile Unreleased metrics and harden CI dependency pinning.

## Audit Boundary

This was a repository-local audit. It did not perform a live 42-store network
refresh, change branch protection, query GitHub-hosted settings, or install any
plugin. Existing `.vscode` worktree changes were left untouched.
