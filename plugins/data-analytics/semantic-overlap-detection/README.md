# Semantic Overlap Detection

Analyze a semantic model (via MCP or TMDL) to find columns whose value domains overlap, classify ambiguity types, generate proposed descriptions/rules/exclusions, and produce a review Excel for domain experts. Use when a semantic model has columns whose values overlap across tables or hierarchies, when Copilot picks the wrong column for ambiguous queries, when preparing a model for Prep data for AI, or when auditing a model for attribute collisions before connecting a data agent.

## Quick Facts

| Field | Value |
| --- | --- |
| **Category** | data-analytics |
| **Shape** | `.S..` |
| **Tier** | standard |
| **Token cost** | ~7009 tokens |
| **Requires Edition** | >= 1.0.0 |

## What This Plugin Does

Analyze a semantic model (via MCP or TMDL) to find columns whose value domains overlap, classify ambiguity types, generate proposed descriptions/rules/exclusions, and produce a review Excel for domain experts. Use when a semantic model has columns whose values overlap across tables or hierarchies, when Copilot picks the wrong column for ambiguous queries, when preparing a model for Prep data for AI, or when auditing a model for attribute collisions before connecting a data agent.

## Installation

```text
/mall install semantic-overlap-detection
```

Or manually copy the plugin contents to `.github/skills/local/semantic-overlap-detection/`.

## Artifacts Installed

- **skill**: `SKILL.md`

## Shape: `.S..`

Skill only -- domain knowledge loaded when pattern matches.
