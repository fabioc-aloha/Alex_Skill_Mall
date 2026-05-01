# Skill Store

The **Alex_Skill_Mall** is the curated skill store for ACT Edition heirs. All skills here have been reviewed, frontmatter-compliant, and tested in real projects.

## How to shop

1. Browse the [CATALOG.md](CATALOG.md) — 217 skills across 34 categories
2. Run `/find-skill <keyword>` in your heir to search by topic
3. Run `/install-from-mall` for guided installation with project-needs assessment

## What's here

| Type | Count | Description |
| --- | --- | --- |
| Skills | 217 | Battle-tested, frontmatter-compliant SKILL.md files |
| Patterns | 1 | Cross-domain reusable patterns |
| Configs | 1 | Drop-in tool configurations (VS Code themes) |
| Scaffolds | 1 | Project starters |

## External stores

For capabilities not in this Mall (agents, hooks, MCP servers, multi-agent plugins), the Supervisor curates adoption candidates from external stores. Heirs do not browse external stores directly — the Supervisor evaluates and promotes skills into this Mall.

If you need something the Mall doesn't have, run `/feedback` to request it. The Supervisor will evaluate the external stores and either promote the skill here or install it into your `local/` dir.

## Quality standard

Every skill in this Mall has passed:

| Gate | Requirement |
| --- | --- |
| Frontmatter | Canonical schema with `type`, `lifecycle`, `inheritance`, `name`, `description`, `tier`, `applyTo`, `currency`, `lastReviewed` |
| Time savings | Would save 30+ minutes of debugging |
| Non-obvious | Not the first Google/Stack Overflow result |
| Battle-tested | Used in a real project |
| Current | Still relevant (not fixed in newer version) |
