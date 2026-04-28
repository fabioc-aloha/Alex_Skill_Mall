# Configs

Portable, drop-in configuration files. Copy into your project, reference from your tool, done.

Unlike skills (knowledge for AI assistants) or scaffolds (full project starters), configs are **artifacts your tooling consumes directly** — VS Code settings, editor themes, linter rules, etc.

## Available

| Config | Path | What it does |
|--------|------|--------------|
| `markdown-light` | `configs/markdown-light/` | GitHub-flavored markdown preview theme for VS Code |

## Install Pattern

Each config has its own `README.md` with copy/paste install steps. Generally:

1. Copy the config file(s) into your project (typically under `.vscode/`, `.github/config/`, or repo root)
2. Reference it from the tool that consumes it (VS Code `settings.json`, `.eslintrc`, etc.)
3. Commit

Configs are **never auto-loaded by AI assistants** — they're tool-config, not knowledge. If you want AI knowledge about a topic, browse `skills/` instead.

## Contributing

A config belongs here if:

- It's a single file or small bundle (not a full project — that's a scaffold)
- It's portable across projects (no embedded project-specific paths)
- It's consumed by tooling, not by an AI assistant
- It's been used in 2+ real projects

Patterns and skills go elsewhere. See [CONTRIBUTING.md](../CONTRIBUTING.md).
