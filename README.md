<img src="assets/banner.svg" alt="Alex ACT Plugin Mall" width="100%"/>

# Alex ACT Plugin Mall

**363 curated plugins**, installable as a GitHub Copilot CLI marketplace. Plus a **trust-scored discovery index** across **3848 plugins** in **42 stores** so you can find and install directly from upstream at a version you pick.

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
copilot plugin install alex-act-illustrator-plugin@alex-mall
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
2. **Install plugins via the Copilot CLI** using the steps above. Namespaced commands and agents are the most reliable VS Code surfaces; generic skill-tool exposure depends on the current Copilot Chat runtime.
3. **Reload VS Code** or run *Developer: Reload Window* so Copilot Chat re-scans the installed plugins.
4. In Chat, invoke a plugin's commands with `/`, agents with `@`, or skills by describing the task the skill's frontmatter is scoped to.

---

## Per-repo auto-install

To make a project auto-install specific plugins for every collaborator, commit a `.github/copilot/settings.json` that names the marketplace **and** the plugins:

```jsonc
{
  "extraKnownMarketplaces": {
    "alex-mall": {
      "type": "github",
      "repository": "fabioc-aloha/Alex_Skill_Mall"
    }
  },
  "enabledPlugins": {
    "alex-act-illustrator-plugin@alex-mall": true,
    "document-banner-pastel@alex-mall": true
  }
}
```

- **`extraKnownMarketplaces`** registers the marketplace so the CLI knows where to fetch from. Without it, plugin specs referencing `@alex-mall` will not resolve unless the collaborator has already registered `alex-mall` at the user level.
- **`enabledPlugins`** is the declarative auto-install list. Keys are plugin specs (`<name>@<marketplace>`); values are `true` (enabled) or `false` (disabled).
- A plugin enabled only through the repository file is **scoped to that repository** — it auto-installs and activates there, but stays inactive in unrelated projects.
- Both keys are read by the [GitHub Copilot CLI](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-config-dir-reference) **and** by **Copilot cloud agent**, so the same file drives both local sessions and cloud-run sessions.

### Settings tiers (precedence order)

| File | Scope | Commit? |
| --- | --- | --- |
| `~/.copilot/settings.json` | User (your defaults for every repo) | No — personal machine |
| `.github/copilot/settings.json` | Repository (shared with collaborators) | **Yes** |
| `.github/copilot/settings.local.json` | Local overrides for this checkout | No — add to `.gitignore` |

The three files are merged in that order; later wins. For `enabledPlugins` and `extraKnownMarketplaces`, repository entries override user entries per key.

---

## Publish a plugin

Contributors prepare a normalized plugin payload in their fork; automation validates it; the Mall CODEOWNER reviews and approves it. Contributor scripts never commit, push, merge, or publish on their own.

```bash
npm ci
npm run submit:prepare -- --source ../my-plugin --category productivity --repository https://github.com/you/my-plugin --ref v1.0.0 --submitted-by @you --evidence "Used in a real project" --apply
npm run submit:validate -- --plugin productivity/my-plugin
npm test
npm run validate
```

Open a pull request using the plugin-submission template. Passing checks means the payload is structurally eligible for review; it does not mean acceptance. See [CONTRIBUTING.md](CONTRIBUTING.md) for evidence, licensing, and review requirements.
Repository admins must configure `main` branch protection to require the **Validate proposed plugins** check and CODEOWNER approval. CODEOWNERS requests review; branch protection enforces it.

## Maintainer operations

Maintainer commands default to dry-run where they write curated payloads:

```bash
# Import a new plugin or preview an upstream refresh
npm run vendor -- --source ../my-plugin --category productivity --repository https://github.com/owner/my-plugin --ref v1.0.0

# Apply after reviewing the dry-run; add --replace for an existing plugin
npm run vendor -- --source ../my-plugin --category productivity --repository https://github.com/owner/my-plugin --ref v1.0.0 --apply

# Refresh first-party catalog, trust, marketplace, README, and gates
npm run maintain -- --curated

# Preview, then enforce validation + CODEOWNER approval on main
npm run admin:configure-approval
npm run admin:configure-approval -- --apply

# Full 42-store network refresh (requires SOURCES_DIR plus GH_TOKEN or GITHUB_TOKEN)
npm run maintain -- --full
```

Review `git diff` before committing. `vendor` never commits or pushes; `maintain` never approves contributor PRs.

---

## Browse the catalog

- [Full catalog index](catalog/INDEX.md) — every plugin, sortable
- [By category](catalog/categories/) — 21 canonical categories plus uncategorized
- [By store](catalog/stores/) — per-source drilldown
- [Trust audit](scoring/TRUST-AUDIT.md) — score distribution and top plugins
- [Source registry](sources/SOURCES.md) — the 42 stores the discovery catalog aggregates

## Top 10 stores by trust

| Rank | Store | Trust | Plugins | Provenance |
| ---: | --- | ---: | ---: | --- |
| 1 | 🏆 [plugin-mall](catalog/stores/plugin-mall.md) | 82 | 363 | 🏆 first-party |
| 2 | [alirezarezvani-claude-skills](catalog/stores/alirezarezvani-claude-skills.md) | 35 | 38 | third-party |
| 3 | [antigravity-awesome-skills](catalog/stores/antigravity-awesome-skills.md) | 35 | 1906 | third-party |
| 4 | [awesome-copilot](catalog/stores/awesome-copilot.md) | 35 | 486 | third-party |
| 5 | [buildwithclaude](catalog/stores/buildwithclaude.md) | 35 | 110 | third-party |
| 6 | [claude-code-plugins-plus-skills](catalog/stores/claude-code-plugins-plus-skills.md) | 35 | 24 | third-party |
| 7 | [context-engineering-kit](catalog/stores/context-engineering-kit.md) | 35 | 13 | third-party |
| 8 | [daymade-claude-code-skills](catalog/stores/daymade-claude-code-skills.md) | 35 | 92 | third-party |
| 9 | [dotnet-skills](catalog/stores/dotnet-skills.md) | 35 | 17 | third-party |
| 10 | [marketingskills](catalog/stores/marketingskills.md) | 35 | 51 | third-party |

## Score distribution

| Range | Plugins | Share |
| --- | ---: | ---: |
| 0-19 | 15 | 0.4% |
| 20-39 | 689 | 17.9% |
| 40-59 | 2781 | 72.3% |
| 60-79 | 0 | 0.0% |
| 80-100 | 363 | 9.4% |

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
*Generated by `scripts/render-catalog.cjs` at 2026-08-01T20:06:22.357Z. Source of truth: `catalog/*.json`. Never hand-edit this README.*
