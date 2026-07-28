<img src="assets/banner.svg" alt="Alex ACT Plugin Mall" width="100%"/>

# Alex ACT Plugin Mall

**365 curated plugins**, installable as a GitHub Copilot CLI marketplace. Plus a **trust-scored discovery index** across **3912 plugins** in **49 stores** so you can find and install directly from upstream at a version you pick.

- Installation is **opt-in** and user-invoked. Publication does not mutate your projects.
- Current release: **[v3.0.0](https://github.com/fabioc-aloha/Alex_Skill_Mall/releases/tag/v3.0.0)**. Rollback anchor: annotated tag `v2.0.0`.

---

## Quick install (GitHub Copilot CLI)

**Prerequisite:** the [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli). Confirm with `copilot --version`.

### 1. Register the marketplace (one-time)

```bash
copilot plugin marketplace add fabioc-aloha/Alex_Skill_Mall
```

This registers the `alex-mall` marketplace with the CLI. It reads `.github/plugin/marketplace.json` from this repo; no credentials required.

### 2. Browse and install a plugin

```bash
# Browse everything published by alex-mall
copilot plugin marketplace browse alex-mall

# Install a plugin (plugin@marketplace format)
copilot plugin install <plugin-name>@alex-mall

# Example: install the visualization plugin
copilot plugin install flint-chart-plugin@alex-mall
```

Plugins install into `~/.copilot/installed-plugins/alex-mall/<plugin-name>/`.

### 3. Verify and manage

```bash
copilot plugin list                              # what is installed
copilot plugin update <plugin-name>@alex-mall    # pull the latest version
copilot plugin uninstall <plugin-name>@alex-mall # remove a plugin
copilot plugin marketplace list                  # registered marketplaces
copilot plugin marketplace remove alex-mall      # unregister the marketplace
```

---

## Use in VS Code

The Copilot CLI plugins integrate with **GitHub Copilot Chat** in VS Code once installed.

1. **Install the [GitHub Copilot](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot) and [Copilot Chat](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot-chat) extensions** in VS Code (1.117 or later).
2. **Install plugins via the Copilot CLI** using the steps above. Copilot Chat picks up any plugin components (agents, skills, commands, MCP servers) that ship with it.
3. **Reload VS Code** or run *Developer: Reload Window* so Copilot Chat re-scans the installed plugins.
4. In Chat, invoke a plugin's commands with `/`, agents with `@`, or skills by describing the task the skill's frontmatter is scoped to.

### Per-repo auto-install

To make a project always pull specific plugins on first Chat session, commit a `.github/copilot/settings.json`:

```jsonc
{
  "enabledPlugins": {
    "flint-chart-plugin@alex-mall": true,
    "document-banner-pastel@alex-mall": true
  }
}
```

On first session in that repo, Copilot Chat auto-registers `alex-mall` and installs the enabled plugins. This works for cloud-run sessions too.

---

## Browse the catalog

- [Full catalog index](catalog/INDEX.md) — every plugin, sortable
- [By category](catalog/categories/) — 21 categories
- [By store](catalog/stores/) — per-source drilldown
- [Trust audit](scoring/TRUST-AUDIT.md) — score distribution and top plugins
- [Source registry](sources/SOURCES.md) — the 49 upstream stores the discovery catalog aggregates

## Top 10 stores by trust

| Rank | Store | Trust | Plugins | Provenance |
| ---: | --- | ---: | ---: | --- |
| 1 | 🏆 [plugin-mall](catalog/stores/plugin-mall.md) | 82 | 365 | 🏆 first-party |
| 2 | [addyosmani-agent-skills](catalog/stores/addyosmani-agent-skills.md) | 35 | 26 | third-party |
| 3 | [agency-agents](catalog/stores/agency-agents.md) | 35 | 3 | third-party |
| 4 | [agent-skills-context-engineering](catalog/stores/agent-skills-context-engineering.md) | 35 | 17 | third-party |
| 5 | [alirezarezvani-claude-skills](catalog/stores/alirezarezvani-claude-skills.md) | 35 | 38 | third-party |
| 6 | [antigravity-awesome-skills](catalog/stores/antigravity-awesome-skills.md) | 35 | 1904 | third-party |
| 7 | [awesome-copilot](catalog/stores/awesome-copilot.md) | 35 | 485 | third-party |
| 8 | [awesome-mcp-servers](catalog/stores/awesome-mcp-servers.md) | 35 | 0 | third-party |
| 9 | [buildwithclaude](catalog/stores/buildwithclaude.md) | 35 | 110 | third-party |
| 10 | [claude-code-best-practice](catalog/stores/claude-code-best-practice.md) | 35 | 2 | third-party |

## Score distribution

| Range | Plugins | Share |
| --- | ---: | ---: |
| 0-19 | 15 | 0.4% |
| 20-39 | 664 | 17.0% |
| 40-59 | 2868 | 73.3% |
| 60-79 | 0 | 0.0% |
| 80-100 | 365 | 9.3% |

## How trust scoring works

Every plugin gets a 0–100 score from six published signals:

| Signal | Range | Source |
| --- | ---: | --- |
| Provenance | +50 | First-party `plugin-mall` entry |
| Store maintenance | 0–15 | Last upstream commit recency |
| Store adoption | 0–10 | GitHub stars + contributors |
| License clarity | 0–10 | OSI-approved=10, clear non-permissive=7 |
| Frontmatter completeness | 0–10 | description + version + lastReviewed presence |
| README presence | 0–5 | README excerpt ≥ 50 chars |

First-party plugins (🏆) rank highest because they earn the +50 provenance bonus. Third-party plugins remain installable — you pick.

## Compatibility scope

- **[Alex_ACT_Edition](https://github.com/fabioc-aloha/Alex_ACT_Edition) v4.2.0** heirs install via the guided Mall 3 nested path with Mall 2 root-layout fallback and exact `.install.json` `component_paths`.
- **Edition 3.x and 4.1** heirs are explicitly outside the Mall 3 compatibility claim. Upgrade to Edition v4.2.0 first.
- **Standalone Copilot CLI / Copilot Chat users** (no Edition brain) use the plugin marketplace directly per the steps above.

Governance references: [ADR-014](https://github.com/fabioc-aloha/Alex_ACT_Steward/blob/main/docs/adrs/ADR-014-mall-in-place-cli-native-3.0.0.md) (in-place migration), [ADR-015](https://github.com/fabioc-aloha/Alex_ACT_Steward/blob/main/docs/adrs/ADR-015-decouple-mall-ga-from-heir-rollout.md) (publication vs rollout).

## For Edition heirs (advanced)

If you use the Alex ACT Edition brain via Copilot Chat, these Edition prompts wrap the CLI for guided workflows:

| Prompt | Purpose |
| --- | --- |
| `/mall-search <query>` | Search the full trust-scored catalog |
| `/mall-show <name>` | Full metadata + signals for one plugin |
| `/mall-install <name>[@<version>]` | Guided install with `.install.json` component_paths |
| `/mall-refresh <name>` | Compare installed version against upstream default |
| `/mall-contribute` | Propose a local skill for adoption into the Mall |

The prompts live in Edition's `.github/prompts/` and route through `.github/instructions/mall-installation.instructions.md`.

---
*Generated by `scripts/render-catalog.cjs` at 2026-07-27T13:35:22.283Z. Source of truth: `catalog/*.json`. Never hand-edit this README.*
