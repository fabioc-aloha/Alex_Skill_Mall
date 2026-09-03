# Changelog

## v0.4.0

### Added

- Human-facing artifact gate in `compile-brain`. Compilation optimizes for an
  agent runtime; some brain artifacts — `BRAIN.md`, README, onboarding docs,
  picker-visible descriptions — are also read by people, and token reduction,
  imperative compression, and deduplication work against that reader. None of
  the three is a behavioral invariant, so the semantic preservation gate does
  not catch them, which is why the gate is separate. When it fires the compiler
  names the audience, withholds those optimizations, records both in the
  preservation receipt, and routes language review to a dedicated copy-review
  capability instead of reimplementing one. A minimal inline fallback covers
  hosts without such a capability.

## v0.3.4

### Changed

- Documented the compiler's preservation receipt, cumulative reduction
  thresholds, and visual skill-library support in the README.

## v0.3.3

### Added

- Explainable per-skill structural-importance signals in assessment reports,
  based on Markdown routes, bundled resources, and duplicate-body status.
- Initial local `0.1.0` source checkpoint for read-only brain assessment.
- Markdown-only v1 boundary and a local Steward Brain Compiler research
  library with provenance guidance.
- Review-first `compile-brain` skill and prompt for improving an explicitly
  selected Markdown brain artifact or producing one from explicitly supplied
  text.
- Clarification gate that requires focused user questions before incomplete or
  ambiguous source material becomes an execution-ready brain artifact.
- Preview-first platform scaffolding for GitHub Copilot, Agent Skills hosts,
  Claude Code, Cursor, Codex, Gemini CLI, and ChatGPT manual adoption.
- Canonical target-link validation, complete target fingerprinting, and
  atomic external report replacement to preserve the assessor's no-mutation
  boundary.
- Mall-packaged platform scaffolding resolves its normalized `skills/` and
  `commands/` component locations.
- Regression coverage resolves source and Mall-normalized component locations.
- Portable brain-contract drafting and static completeness validation for
  instruction hierarchy, routing, arbitration, execution, and verification.
- Brain-contract validation ignores required-section examples inside fenced
  code blocks.
- Direct children of a physical skill-library root are classified as skills
  rather than unclassified resources.
- Visual skill directories named `skills-visual` are classified consistently
  with standard skill libraries.

### Changed

- Organized the copied research evidence under `docs/research/` and exposed
  its collections through the Research tab.
- Removed the unused standalone-report navigation asset.
- Strengthened the compiler's semantic-preservation contract with an invariant
  inventory, scenario checks, destination-relative resource validation,
  conservative first-pass reduction limits, and fresh-context review for
  high-reduction drafts.
