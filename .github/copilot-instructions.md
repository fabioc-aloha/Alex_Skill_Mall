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

---

## External Skill Stores (KB Mall)

When heir-act-kb doesn't have what you need, browse other skill stores:

**Directory**: [STORES.md](../STORES.md)

### Quick Lookup

| If you need... | Check store |
|----------------|-------------|
| Azure SDK skills | `microsoft/skills` (132 skills, 5 languages) |
| Largest cross-platform | `affaan-m/everything-claude-code` (183 skills) |
| Official Claude plugins | `anthropics/claude-plugins-official` |
| Golang skills | `samber/cc-skills-golang` |
| Game dev agents | `Donchitos/Claude-Code-Game-Studios` |

### How to Research External Stores

1. **Read STORES.md** — LLM-friendly directory with details on each store
2. **Check the Quick Reference table** — Match your problem to a store
3. **Evaluate before adopting** — See "How to Evaluate a Store" section
4. **Copy to your project** — External skills use the same `.github/skills/` pattern

### Priority Order

1. **heir-act-kb first** — Battle-tested, quality-focused, ACT-integrated
2. **First-party stores** — microsoft/skills, github/copilot-plugins
3. **Cross-platform collections** — everything-claude-code, claude-skills
4. **Domain-specific** — When you need specialized knowledge
