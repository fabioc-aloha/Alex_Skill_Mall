# Alex Knowledge Base — AI Assistant Instructions

You have access to a **skill store** — a curated collection of battle-tested development skills that solve non-obvious problems.

## Location

```
skills/{category}/{skill-name}/SKILL.md
```

## Catalog

Consult [CATALOG.md](../CATALOG.md) for the complete list of available skills, organized by category with descriptions and tags.

## Usage

1. **When a problem arises** — Check the catalog for a relevant skill
2. **Load the skill** — Read the `SKILL.md` file to get the full solution
3. **Apply it** — Each skill has the problem, solution, and verification steps

## Copying Skills to Projects

```bash
cp -r skills/{category}/{skill-name}/ /your/project/.github/skills/
```

The skill becomes part of the project's permanent context.
