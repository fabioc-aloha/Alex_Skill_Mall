#!/usr/bin/env node
/**
 * render-catalog.cjs
 *
 * Reads catalog/stores/*.json (fully populated by scan + normalize + list-refs +
 * compute-trust) and renders the human-facing surface:
 *
 *   - catalog/index.json    -- thin lookup, ~2-5 MB, loaded by /mall-search
 *   - catalog/INDEX.md      -- top-level catalog browse
 *   - catalog/stores/<store>.md     -- one per store, plugins ranked by trust
 *   - catalog/categories/<cat>.md   -- one per Mall-derived category
 *   - scoring/TRUST-AUDIT.md        -- score distribution + top/bottom tables
 *   - README.md             -- storefront landing page (Mall repo root)
 *   - sources/SOURCES.md    -- registry rendition for humans
 *
 * The 21 canonical Mall categories (from plugins/<category>/ folders) are the
 * editorial taxonomy. Third-party plugins with a matching extended.category
 * land in that category's page; everything else goes to "uncategorized".
 *
 * The Trophy emoji + first-in-category sort encode the "curation bias" —
 * mechanical from data, not editorial in code (the +50 provenance signal
 * is what surfaces first-party plugins to the top).
 *
 * Never hand-edited. Re-rendered each scan from JSON sources.
 *
 * Usage:
 *   node scripts/render-catalog.cjs
 *   node scripts/render-catalog.cjs --dry-run    # report, don't write
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const CATALOG_DIR = path.join(REPO_ROOT, 'catalog');
const CATALOG_STORES_DIR = path.join(CATALOG_DIR, 'stores');
const CATALOG_CATEGORIES_DIR = path.join(CATALOG_DIR, 'categories');
const SCORING_DIR = path.join(REPO_ROOT, 'scoring');
const SOURCES_DIR = path.join(REPO_ROOT, 'sources');
const SUPPORTED_PATH = path.join(SOURCES_DIR, 'supported-stores.json');
const TRUST_AUDIT_JSON_PATH = path.join(SCORING_DIR, 'trust-audit.json');

const DRY_RUN = process.argv.includes('--dry-run');

// Pin all rendered footers to the upstream catalog's generated_at, NOT Date.now().
// This makes the render step idempotent: if the underlying catalog + scoring data
// haven't changed, the rendered output is byte-identical regardless of when render
// runs. Falls back to a fixed marker when the catalog timestamp is unavailable.
let RENDER_AT = null;

// --- helpers ---

const TROPHY = '🏆';
const FIRST_PARTY_BADGE = '🏆 first-party';
const THIRD_PARTY_BADGE = 'third-party';

function loadAllStores() {
  const files = fs.readdirSync(CATALOG_STORES_DIR).filter((f) => f.endsWith('.json')).sort();
  return files.map((f) => JSON.parse(fs.readFileSync(path.join(CATALOG_STORES_DIR, f), 'utf-8')));
}

function ensureDir(p) {
  if (!DRY_RUN) fs.mkdirSync(p, { recursive: true });
}

function write(p, content) {
  if (DRY_RUN) return;
  fs.writeFileSync(p, content);
}

function mdEscape(s) {
  return (s || '').replace(/\|/g, '\\|').replace(/[\r\n]+/g, ' ').trim();
}

function truncate(s, n) {
  if (!s) return '';
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

function sortByTrust(plugins) {
  return [...plugins].sort((a, b) => {
    if ((b.trust_score || 0) !== (a.trust_score || 0)) return (b.trust_score || 0) - (a.trust_score || 0);
    return (a.name || '').localeCompare(b.name || '');
  });
}

// --- index.json (thin lookup) ---

function buildIndex(stores) {
  const plugins = [];
  for (const store of stores) {
    for (const p of store.plugins || []) {
      plugins.push({
        name: p.name,
        store: store.store,
        shape: p.shape,
        trust_score: p.trust_score,
        version: p.frontmatter?.standard?.version || null,
        description_short: truncate(p.frontmatter?.standard?.description || '', 160),
        source_url: p.source_url,
        provenance: store.store === 'plugin-mall',
        adapted_from: p.adapted_from || null,
      });
    }
  }
  plugins.sort((a, b) => {
    if (b.trust_score !== a.trust_score) return b.trust_score - a.trust_score;
    return a.name.localeCompare(b.name);
  });
  return {
    schema_version: '3.0',
    generated_at: RENDER_AT,
    store_count: stores.length,
    plugin_count: plugins.length,
    plugins,
  };
}

// --- INDEX.md (top-level catalog browse) ---

function renderIndexMd(stores, index) {
  const lines = [];
  lines.push('# Plugin Mall Catalog');
  lines.push('');
  lines.push('Search index across **' + index.plugin_count + ' plugins** in **' + index.store_count + ' stores**. Plugins are ranked by trust score; first-party Mall-curated entries (🏆) rank highest because they earn the highest signals — provenance (+50 for editorial adaptation) plus maintenance, adoption, license clarity, frontmatter completeness, and README presence.');
  lines.push('');
  lines.push('- See [README.md](../README.md) for the storefront and store rankings.');
  lines.push('- See [categories/](categories/) for per-category browse.');
  lines.push('- See [stores/](stores/) for per-store browse.');
  lines.push('- See [`../scoring/TRUST-AUDIT.md`](../scoring/TRUST-AUDIT.md) for the score distribution + outliers.');
  lines.push('');
  lines.push('## Top 50 plugins by trust score');
  lines.push('');
  lines.push('| Trust | Plugin | Store | Shape | Description |');
  lines.push('| ---: | --- | --- | --- | --- |');
  for (const p of index.plugins.slice(0, 50)) {
    const trophy = p.provenance ? TROPHY + ' ' : '';
    const desc = mdEscape(truncate(p.description_short, 80));
    lines.push(`| ${p.trust_score} | ${trophy}\`${p.name}\` | ${p.store} | ${p.shape || '-'} | ${desc} |`);
  }
  lines.push('');
  lines.push('## All stores by trust');
  lines.push('');
  lines.push('| Trust | Store | Plugins | Provenance |');
  lines.push('| ---: | --- | ---: | --- |');
  const sortedStores = [...stores].sort((a, b) => {
    const sa = a.store_trust?.score || 0;
    const sb = b.store_trust?.score || 0;
    if (sb !== sa) return sb - sa;
    return a.store.localeCompare(b.store);
  });
  for (const s of sortedStores) {
    const trophy = s.store === 'plugin-mall' ? TROPHY + ' ' : '';
    const badge = s.store === 'plugin-mall' ? FIRST_PARTY_BADGE : THIRD_PARTY_BADGE;
    lines.push(`| ${s.store_trust?.score || 0} | ${trophy}[${s.store}](stores/${s.store}.md) | ${s.plugin_count} | ${badge} |`);
  }
  lines.push('');
  lines.push('---');
  lines.push('*Generated by `scripts/render-catalog.cjs` at ' + RENDER_AT + '*');
  return lines.join('\n') + '\n';
}

// --- Per-store page ---

function renderStoreMd(store) {
  const lines = [];
  const trophy = store.store === 'plugin-mall' ? TROPHY + ' ' : '';
  lines.push(`# ${trophy}${store.store}`);
  lines.push('');
  if (store.source_repo) {
    const remote = store.source_repo.replace(/\.git$/, '');
    const ownerRepo = remote.replace(/^https:\/\/github\.com\//, '');
    lines.push(`**Source:** [${ownerRepo}](${remote})`);
  }
  lines.push(`**Store trust:** ${store.store_trust?.score || 0}/100`);
  const sig = store.store_trust?.signals;
  if (sig) {
    const parts = [];
    if (sig.provenance) parts.push(`provenance ${sig.provenance}`);
    parts.push(`maintenance ${sig.maintenance}`);
    parts.push(`adoption ${sig.adoption}`);
    parts.push(`license ${sig.license}${sig.license_name ? ` (${sig.license_name})` : ''}`);
    if (sig.stars != null) parts.push(`${sig.stars} stars`);
    if (sig.contributors != null) parts.push(`${sig.contributors} contributors`);
    if (sig.archived) parts.push('**archived**');
    lines.push(`**Signals:** ${parts.join(' · ')}`);
  }
  if (store.scanned_ref) {
    lines.push(`**Scanned ref:** \`${store.scanned_ref.slice(0, 12)}\``);
  }
  lines.push('');

  if (!store.plugins || store.plugins.length === 0) {
    lines.push('_No plugins scanned in this store._');
    if (store.error) lines.push(`\n_Scan error: ${store.error}_`);
    lines.push('');
    return lines.join('\n') + '\n';
  }

  lines.push(`## Plugins (${store.plugins.length})`);
  lines.push('');
  lines.push('| Trust | Plugin | Shape | Version | Description |');
  lines.push('| ---: | --- | --- | --- | --- |');
  for (const p of sortByTrust(store.plugins)) {
    const link = p.source_url
      ? `[\`${p.name}\`](${p.source_url})`
      : `\`${p.name}\``;
    const desc = mdEscape(truncate(p.frontmatter?.standard?.description || '', 100));
    const ver = p.frontmatter?.standard?.version || '-';
    lines.push(`| ${p.trust_score || 0} | ${link} | ${p.shape || '-'} | ${ver} | ${desc} |`);
  }
  lines.push('');
  lines.push('---');
  lines.push(`*Generated by \`scripts/render-catalog.cjs\` at ${RENDER_AT}*`);
  return lines.join('\n') + '\n';
}

// --- Per-category page (Mall-derived 21 categories + uncategorized) ---

function getMallCategories() {
  const pluginsRoot = path.join(REPO_ROOT, 'plugins');
  if (!fs.existsSync(pluginsRoot)) return [];
  return fs.readdirSync(pluginsRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('.'))
    .map((d) => d.name)
    .sort();
}

function pluginCategory(plugin, store) {
  // Mall plugins: derive from source_path (plugins/<category>/<name>/).
  if (store.store === 'plugin-mall') {
    const parts = (plugin.source_path || '').split('/').filter(Boolean);
    return parts[1] || 'uncategorized'; // plugins/<category>/<name>
  }
  // Third-party: trust the explicit extended.category if it matches a Mall category, else uncategorized.
  const explicit = plugin.frontmatter?.extended?.category;
  return explicit || 'uncategorized';
}

function renderCategoryMd(category, plugins, stores) {
  const lines = [];
  lines.push(`# Category: ${category}`);
  lines.push('');
  lines.push(`**${plugins.length}** plugins across **${new Set(plugins.map((p) => p.store)).size}** stores.`);
  lines.push('');
  lines.push('| Trust | Plugin | Store | Shape | Description |');
  lines.push('| ---: | --- | --- | --- | --- |');
  const sorted = [...plugins].sort((a, b) => {
    if (b.trust_score !== a.trust_score) return b.trust_score - a.trust_score;
    return a.name.localeCompare(b.name);
  });
  for (const p of sorted) {
    const trophy = p.store === 'plugin-mall' ? TROPHY + ' ' : '';
    const link = p.source_url
      ? `[\`${p.name}\`](${p.source_url})`
      : `\`${p.name}\``;
    const desc = mdEscape(truncate(p.description_short || '', 80));
    lines.push(`| ${p.trust_score || 0} | ${trophy}${link} | ${p.store} | ${p.shape || '-'} | ${desc} |`);
  }
  lines.push('');
  lines.push('---');
  lines.push(`*Generated by \`scripts/render-catalog.cjs\` at ${RENDER_AT}*`);
  return lines.join('\n') + '\n';
}

function buildCategoryGroups(stores) {
  const mallCategories = new Set(getMallCategories());
  const byCategory = new Map();
  for (const store of stores) {
    for (const p of store.plugins || []) {
      const cat = pluginCategory(p, store);
      // Third-party explicit categories that aren't in the Mall taxonomy go to 'uncategorized'
      const bucket = mallCategories.has(cat) ? cat : (store.store === 'plugin-mall' ? cat : 'uncategorized');
      if (!byCategory.has(bucket)) byCategory.set(bucket, []);
      byCategory.get(bucket).push({
        name: p.name,
        store: store.store,
        shape: p.shape,
        trust_score: p.trust_score,
        source_url: p.source_url,
        description_short: truncate(p.frontmatter?.standard?.description || '', 160),
      });
    }
  }
  return byCategory;
}

// --- Trust audit MD ---

function renderTrustAuditMd(auditJson) {
  const lines = [];
  lines.push('# Trust Audit');
  lines.push('');
  lines.push(`Generated at ${auditJson.generated_at}.`);
  lines.push('');
  lines.push(`- **${auditJson.total_stores}** stores · **${auditJson.total_plugins}** plugins`);
  lines.push('');
  lines.push('## Score distribution');
  lines.push('');
  lines.push('| Range | Plugins | Share |');
  lines.push('| --- | ---: | ---: |');
  for (const [bucket, count] of Object.entries(auditJson.score_distribution)) {
    const pct = (100 * count / auditJson.total_plugins).toFixed(1) + '%';
    lines.push(`| ${bucket} | ${count} | ${pct} |`);
  }
  lines.push('');
  lines.push('## Stores by score (descending)');
  lines.push('');
  lines.push('| Store | Score | Plugins | Provenance | Maintenance | Adoption | License | License Name | Stars |');
  lines.push('| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | ---: |');
  for (const s of auditJson.stores_by_score) {
    const sig = s.signals;
    const trophy = s.provenance ? TROPHY + ' ' : '';
    lines.push(`| ${trophy}[${s.store}](../catalog/stores/${s.store}.md) | ${s.store_score} | ${s.plugin_count} | ${sig.provenance || 0} | ${sig.maintenance || 0} | ${sig.adoption || 0} | ${sig.license || 0} | ${sig.license_name || '-'} | ${sig.stars ?? '-'} |`);
  }
  lines.push('');
  lines.push('---');
  lines.push(`*Generated by \`scripts/render-catalog.cjs\` at ${RENDER_AT}*`);
  return lines.join('\n') + '\n';
}

// --- Storefront README ---

function renderStorefrontReadme(stores, index, auditJson) {
  const curatedCount = stores.find((s) => s.store === 'plugin-mall')?.plugin_count || 365;
  const lines = [];
  lines.push('<img src="assets/banner.svg" alt="Alex ACT Plugin Mall" width="100%"/>');
  lines.push('');
  lines.push('# Alex ACT Plugin Mall');
  lines.push('');
  lines.push('Alex ACT Plugin Mall helps you add trusted capabilities to GitHub Copilot without copying a whole AI setup into every project. Start with **Alex ACT Core** for a dependable working baseline, then add only the specializations that match your work.');
  lines.push('');
  lines.push(`The Mall publishes **${curatedCount} curated plugins** for direct installation and maintains a **trust-scored discovery index** across **${index.plugin_count} plugins** in **${index.store_count} stores**.`);
  lines.push('');
  lines.push('- Installation is **opt-in** and user-invoked. Publication does not mutate your projects.');
  lines.push('- Current release: **[v3.0.0](https://github.com/fabioc-aloha/Alex_Skill_Mall/releases/tag/v3.0.0)**. Rollback anchor: annotated tag `v2.0.0`.');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Quick install (GitHub Copilot CLI)');
  lines.push('');
  lines.push('**Prerequisite:** the [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli). Confirm with `copilot --version`.');
  lines.push('');
  lines.push('### 1. Register the marketplace (one-time)');
  lines.push('');
  lines.push('```bash');
  lines.push('copilot plugin marketplace add fabioc-aloha/Alex_Skill_Mall');
  lines.push('```');
  lines.push('');
  lines.push('This registers the `alex-mall` marketplace with the CLI. It reads `.github/plugin/marketplace.json` from this repo; no credentials required.');
  lines.push('');
  lines.push('### 2. Browse and install a plugin');
  lines.push('');
  lines.push('```bash');
  lines.push('# Browse everything published by alex-mall');
  lines.push('copilot plugin marketplace browse alex-mall');
  lines.push('');
  lines.push('# Install a plugin (plugin@marketplace format)');
  lines.push('copilot plugin install <plugin-name>@alex-mall');
  lines.push('');
  lines.push('# Recommended first install: Alex ACT Core');
  lines.push('copilot plugin install alex-act-core@alex-mall');
  lines.push('```');
  lines.push('');
  lines.push('Plugins install into `~/.copilot/installed-plugins/alex-mall/<plugin-name>/`.');
  lines.push('');
  lines.push('### 3. Verify and manage');
  lines.push('');
  lines.push('```bash');
  lines.push('copilot plugin list                              # what is installed');
  lines.push('copilot plugin update <plugin-name>@alex-mall    # pull the latest version');
  lines.push('copilot plugin uninstall <plugin-name>@alex-mall # remove a plugin');
  lines.push('copilot plugin marketplace list                  # registered marketplaces');
  lines.push('copilot plugin marketplace remove alex-mall      # unregister the marketplace');
  lines.push('```');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Start with Alex ACT Core');
  lines.push('');
  lines.push('Core is the recommended first install for most users. It gives Copilot a consistent way to question assumptions, plan work, protect sensitive data, handle documents, and manage plugins. The other Alex ACT constellation plugins build on that foundation.');
  lines.push('');
  lines.push('| What you want to do | Plugin | What it adds |');
  lines.push('| --- | --- | --- |');
  lines.push('| Give Copilot a reliable baseline across projects | [`alex-act-core`](plugins/reasoning-metacognition/alex-act-core/) | Critical thinking, planning, security and privacy guidance, document workflows, engineering practices, and plugin management |');
  lines.push('| Create charts, print figures, banners, AI images, or browsable documentation | [`alex-act-illustrator-plugin`](plugins/data-analytics/alex-act-illustrator-plugin/) | Visual framing, authoring, generation, and verification workflows |');
  lines.push('| Set up public Microsoft tools for a project | [`alex-act-enterprise`](plugins/cloud-infrastructure/alex-act-enterprise/) | Guided setup for Azure, Fabric, Power BI, and Microsoft 365 Agents Toolkit |');
  lines.push('');
  lines.push('### Recommended path');
  lines.push('');
  lines.push('1. Install Core with `copilot plugin install alex-act-core@alex-mall`.');
  lines.push('2. Reload VS Code, open Copilot Chat, and run `/alex-act-core install-constellation`. Choose only the specializations you need and separately decide whether to activate Core\'s always-on instructions.');
  lines.push('3. Add an optional plugin directly if you already know what you need:');
  lines.push('   - Visual work: `copilot plugin install alex-act-illustrator-plugin@alex-mall`');
  lines.push('   - Public Microsoft tools: `copilot plugin install alex-act-enterprise@alex-mall`');
  lines.push('');
  lines.push('> **Private specialization:** `alex-act-msft` is private and intended only for Microsoft-internal work. It is not published in this public Mall.');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Use in VS Code');
  lines.push('');
  lines.push('The Copilot CLI plugins integrate with **GitHub Copilot Chat** in VS Code once installed.');
  lines.push('');
  lines.push('1. **Install the [GitHub Copilot](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot) and [Copilot Chat](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot-chat) extensions** in VS Code (1.117 or later).');
  lines.push('2. **Install plugins via the Copilot CLI** using the steps above. Namespaced commands and agents are the most reliable VS Code surfaces; generic skill-tool exposure depends on the current Copilot Chat runtime.');
  lines.push('3. **Reload VS Code** or run *Developer: Reload Window* so Copilot Chat re-scans the installed plugins.');
  lines.push('4. In Chat, invoke a plugin\'s commands with `/`, agents with `@`, or skills by describing the task the skill\'s frontmatter is scoped to.');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Per-repo auto-install');
  lines.push('');
  lines.push('To make a project auto-install specific plugins for every collaborator, commit a `.github/copilot/settings.json` that names the marketplace **and** the plugins:');
  lines.push('');
  lines.push('```jsonc');
  lines.push('{');
  lines.push('  "extraKnownMarketplaces": {');
  lines.push('    "alex-mall": {');
  lines.push('      "type": "github",');
  lines.push('      "repository": "fabioc-aloha/Alex_Skill_Mall"');
  lines.push('    }');
  lines.push('  },');
  lines.push('  "enabledPlugins": {');
  lines.push('    "alex-act-illustrator-plugin@alex-mall": true,');
  lines.push('    "alex-act-enterprise@alex-mall": true');
  lines.push('  }');
  lines.push('}');
  lines.push('```');
  lines.push('');
  lines.push('- **`extraKnownMarketplaces`** registers the marketplace so the CLI knows where to fetch from. Without it, plugin specs referencing `@alex-mall` will not resolve unless the collaborator has already registered `alex-mall` at the user level.');
  lines.push('- **`enabledPlugins`** is the declarative auto-install list. Keys are plugin specs (`<name>@<marketplace>`); values are `true` (enabled) or `false` (disabled).');
  lines.push('- A plugin enabled only through the repository file is **scoped to that repository** — it auto-installs and activates there, but stays inactive in unrelated projects.');
  lines.push('- Both keys are read by the [GitHub Copilot CLI](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-config-dir-reference) **and** by **Copilot cloud agent**, so the same file drives both local sessions and cloud-run sessions.');
  lines.push('');
  lines.push('### Settings tiers (precedence order)');
  lines.push('');
  lines.push('| File | Scope | Commit? |');
  lines.push('| --- | --- | --- |');
  lines.push('| `~/.copilot/settings.json` | User (your defaults for every repo) | No — personal machine |');
  lines.push('| `.github/copilot/settings.json` | Repository (shared with collaborators) | **Yes** |');
  lines.push('| `.github/copilot/settings.local.json` | Local overrides for this checkout | No — add to `.gitignore` |');
  lines.push('');
  lines.push('The three files are merged in that order; later wins. For `enabledPlugins` and `extraKnownMarketplaces`, repository entries override user entries per key.');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Publish a plugin');
  lines.push('');
  lines.push('Contributors prepare a normalized plugin payload in their fork; automation validates it; the Mall CODEOWNER reviews and approves it. Contributor scripts never commit, push, merge, or publish on their own.');
  lines.push('');
  lines.push('```bash');
  lines.push('npm install --ignore-scripts');
  lines.push('npm run submit:prepare -- --source ../my-plugin --category productivity --repository https://github.com/you/my-plugin --ref v1.0.0 --submitted-by @you --evidence "Used in a real project" --apply');
  lines.push('npm run submit:validate -- --plugin productivity/my-plugin');
  lines.push('npm test');
  lines.push('npm run validate');
  lines.push('```');
  lines.push('');
  lines.push('Open a pull request using the plugin-submission template. Passing checks means the payload is structurally eligible for review; it does not mean acceptance. See [CONTRIBUTING.md](CONTRIBUTING.md) for evidence, licensing, and review requirements.');
  lines.push('Repository admins must configure `main` branch protection to require the **Validate proposed plugins** check and CODEOWNER approval. CODEOWNERS requests review; branch protection enforces it.');
  lines.push('');
  lines.push('## Maintainer operations');
  lines.push('');
  lines.push('Maintainer commands default to dry-run where they write curated payloads:');
  lines.push('');
  lines.push('```bash');
  lines.push('# Import a new plugin or preview an upstream refresh');
  lines.push('npm run vendor -- --source ../my-plugin --category productivity --repository https://github.com/owner/my-plugin --ref v1.0.0');
  lines.push('');
  lines.push('# Apply after reviewing the dry-run; add --replace for an existing plugin');
  lines.push('npm run vendor -- --source ../my-plugin --category productivity --repository https://github.com/owner/my-plugin --ref v1.0.0 --apply');
  lines.push('');
  lines.push('# Refresh first-party catalog, trust, marketplace, README, and gates');
  lines.push('npm run maintain -- --curated');
  lines.push('');
  lines.push('# Preview, then enforce validation + CODEOWNER approval on main');
  lines.push('npm run admin:configure-approval');
  lines.push('npm run admin:configure-approval -- --apply');
  lines.push('');
  lines.push('# Full 42-store network refresh (requires SOURCES_DIR plus GH_TOKEN or GITHUB_TOKEN)');
  lines.push('npm run maintain -- --full');
  lines.push('```');
  lines.push('');
  lines.push('Review `git diff` before committing. `vendor` never commits or pushes; `maintain` never approves contributor PRs.');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Browse the catalog');
  lines.push('');
  lines.push('- [Full catalog index](catalog/INDEX.md) — every plugin, sortable');
  lines.push(`- [By category](catalog/categories/) — ${getMallCategories().length} canonical categories plus uncategorized`);
  lines.push('- [By store](catalog/stores/) — per-source drilldown');
  lines.push('- [Trust audit](scoring/TRUST-AUDIT.md) — score distribution and top plugins');
  lines.push(`- [Source registry](sources/SOURCES.md) — the ${stores.length} stores the discovery catalog aggregates`);
  lines.push('');
  lines.push('## Top 10 stores by trust');
  lines.push('');
  lines.push('| Rank | Store | Trust | Plugins | Provenance |');
  lines.push('| ---: | --- | ---: | ---: | --- |');
  const topStores = [...stores].sort((a, b) => (b.store_trust?.score || 0) - (a.store_trust?.score || 0)).slice(0, 10);
  topStores.forEach((s, i) => {
    const trophy = s.store === 'plugin-mall' ? TROPHY + ' ' : '';
    const badge = s.store === 'plugin-mall' ? FIRST_PARTY_BADGE : THIRD_PARTY_BADGE;
    lines.push(`| ${i + 1} | ${trophy}[${s.store}](catalog/stores/${s.store}.md) | ${s.store_trust?.score || 0} | ${s.plugin_count} | ${badge} |`);
  });
  lines.push('');
  lines.push('## Score distribution');
  lines.push('');
  lines.push('| Range | Plugins | Share |');
  lines.push('| --- | ---: | ---: |');
  for (const [bucket, count] of Object.entries(auditJson.score_distribution)) {
    const pct = (100 * count / auditJson.total_plugins).toFixed(1) + '%';
    lines.push(`| ${bucket} | ${count} | ${pct} |`);
  }
  lines.push('');
  lines.push('## How trust scoring works');
  lines.push('');
  lines.push('Every plugin gets a 0–100 score from six published signals:');
  lines.push('');
  lines.push('| Signal | Range | Source |');
  lines.push('| --- | ---: | --- |');
  lines.push('| Provenance | +50 | First-party `plugin-mall` entry |');
  lines.push('| Store maintenance | 0–15 | Last upstream commit recency |');
  lines.push('| Store adoption | 0–10 | GitHub stars + contributors |');
  lines.push('| License clarity | 0–10 | OSI-approved=10, clear non-permissive=7 |');
  lines.push('| Frontmatter completeness | 0–10 | description + version + lastReviewed presence |');
  lines.push('| README presence | 0–5 | README excerpt ≥ 50 chars |');
  lines.push('');
  lines.push('First-party plugins (🏆) rank highest because they earn the +50 provenance bonus. Third-party plugins remain installable — you pick.');
  lines.push('');
  lines.push('## Compatibility scope');
  lines.push('');
  lines.push('- **[Alex_ACT_Edition](https://github.com/fabioc-aloha/Alex_ACT_Edition) v4.2.0** heirs install via the guided Mall 3 nested path with Mall 2 root-layout fallback and exact `.install.json` `component_paths`.');
  lines.push('- **Edition 3.x and 4.1** heirs are explicitly outside the Mall 3 compatibility claim. Upgrade to Edition v4.2.0 first.');
  lines.push('- **Standalone Copilot CLI / Copilot Chat users** (no Edition brain) use the plugin marketplace directly per the steps above.');
  lines.push('');
  lines.push('Governance references: [ADR-014](https://github.com/fabioc-aloha/Alex_ACT_Steward/blob/main/docs/adrs/ADR-014-mall-in-place-cli-native-3.0.0.md) (in-place migration), [ADR-015](https://github.com/fabioc-aloha/Alex_ACT_Steward/blob/main/docs/adrs/ADR-015-decouple-mall-ga-from-heir-rollout.md) (publication vs rollout).');
  lines.push('');
  lines.push('## For Edition heirs (advanced)');
  lines.push('');
  lines.push('If you use the Alex ACT Edition brain via Copilot Chat, these Edition prompts wrap the CLI for guided workflows:');
  lines.push('');
  lines.push('| Prompt | Purpose |');
  lines.push('| --- | --- |');
  lines.push('| `/mall-search <query>` | Search the full trust-scored catalog |');
  lines.push('| `/mall-show <name>` | Full metadata + signals for one plugin |');
  lines.push('| `/mall-install <name>[@<version>]` | Guided install with `.install.json` component_paths |');
  lines.push('| `/mall-refresh <name>` | Compare installed version against upstream default |');
  lines.push('| `/mall-contribute` | Propose a local skill for adoption into the Mall |');
  lines.push('');
  lines.push('The prompts live in Edition\'s `.github/prompts/` and route through `.github/instructions/mall-installation.instructions.md`.');
  lines.push('');
  lines.push('---');
  lines.push(`*Generated by \`scripts/render-catalog.cjs\` at ${RENDER_AT}. Source of truth: \`catalog/*.json\`. Never hand-edit this README.*`);
  return lines.join('\n') + '\n';
}

// --- SOURCES.md (registry rendition) ---

function renderSourcesMd(supported, stores) {
  const lines = [];
  lines.push('# Source Registry');
  lines.push('');
  lines.push('**' + supported.stores.length + '** stores in `sources/supported-stores.json`. The Mall scans each into `catalog/stores/<store>.json`.');
  lines.push('');
  lines.push('| Store | Remote | Plugin Dir | Tier | Provenance | License | Plugins |');
  lines.push('| --- | --- | --- | --- | --- | --- | ---: |');
  const sorted = [...supported.stores].sort((a, b) => a.name.localeCompare(b.name));
  for (const s of sorted) {
    const storeData = stores.find((x) => x.store === s.name);
    const pluginCount = storeData?.plugin_count ?? '-';
    const trophy = s.provenance ? TROPHY + ' ' : '';
    const remoteCell = s.remote ? `[${s.remote.replace(/^https:\/\/github\.com\//, '').replace(/\.git$/, '')}](${s.remote.replace(/\.git$/, '')})` : '-';
    lines.push(`| ${trophy}[${s.name}](../catalog/stores/${s.name}.md) | ${remoteCell} | \`${s.pluginDir}\` | ${s.quality} | ${s.provenance ? 'true' : 'false'} | ${s.license || '-'} | ${pluginCount} |`);
  }
  lines.push('');
  lines.push('---');
  lines.push(`*Generated by \`scripts/render-catalog.cjs\` at ${RENDER_AT}*`);
  return lines.join('\n') + '\n';
}

// --- Main ---

function main() {
  if (!fs.existsSync(CATALOG_STORES_DIR)) {
    console.error(`ERROR: ${CATALOG_STORES_DIR} not found. Run scan-sources.cjs first.`);
    process.exit(1);
  }
  if (!fs.existsSync(TRUST_AUDIT_JSON_PATH)) {
    console.error(`ERROR: ${TRUST_AUDIT_JSON_PATH} not found. Run compute-trust.cjs first.`);
    process.exit(1);
  }

  const stores = loadAllStores();
  const supported = JSON.parse(fs.readFileSync(SUPPORTED_PATH, 'utf-8'));
  const auditJson = JSON.parse(fs.readFileSync(TRUST_AUDIT_JSON_PATH, 'utf-8'));
  // Pin RENDER_AT to the trust-audit timestamp: this makes rendering idempotent
  // when the underlying scan + scoring data hasn't changed. If trust-audit gets
  // re-run, render footer changes too — but render alone never changes the footer.
  RENDER_AT = auditJson.generated_at || 'unknown';

  console.log(`render-catalog: ${stores.length} stores`);
  console.log(`Dry run: ${DRY_RUN}`);
  console.log('');

  // 1. catalog/index.json (thin lookup)
  const index = buildIndex(stores);
  write(path.join(CATALOG_DIR, 'index.json'), JSON.stringify(index, null, 2) + '\n');
  const indexBytes = Buffer.byteLength(JSON.stringify(index));
  console.log(`Wrote: catalog/index.json  (${index.plugin_count} plugins, ${(indexBytes / 1024 / 1024).toFixed(2)} MB)`);

  // 2. catalog/INDEX.md
  write(path.join(CATALOG_DIR, 'INDEX.md'), renderIndexMd(stores, index));
  console.log('Wrote: catalog/INDEX.md');

  // 3. Per-store pages
  let storeMdCount = 0;
  for (const store of stores) {
    write(path.join(CATALOG_STORES_DIR, `${store.store}.md`), renderStoreMd(store));
    storeMdCount++;
  }
  console.log(`Wrote: catalog/stores/*.md  (${storeMdCount} files)`);

  // 4. Per-category pages
  ensureDir(CATALOG_CATEGORIES_DIR);
  const byCategory = buildCategoryGroups(stores);
  let catMdCount = 0;
  for (const [cat, plugins] of byCategory) {
    write(path.join(CATALOG_CATEGORIES_DIR, `${cat}.md`), renderCategoryMd(cat, plugins, stores));
    catMdCount++;
  }
  console.log(`Wrote: catalog/categories/*.md  (${catMdCount} files)`);

  // 5. Trust audit MD
  write(path.join(SCORING_DIR, 'TRUST-AUDIT.md'), renderTrustAuditMd(auditJson));
  console.log('Wrote: scoring/TRUST-AUDIT.md');

  // 6. Storefront README
  write(path.join(REPO_ROOT, 'README.md'), renderStorefrontReadme(stores, index, auditJson));
  console.log('Wrote: README.md (storefront)');

  // 7. SOURCES.md
  write(path.join(SOURCES_DIR, 'SOURCES.md'), renderSourcesMd(supported, stores));
  console.log('Wrote: sources/SOURCES.md');

  console.log('');
  console.log('=== Render summary ===');
  console.log(`Plugins indexed:    ${index.plugin_count}`);
  console.log(`Stores rendered:    ${storeMdCount}`);
  console.log(`Categories rendered: ${catMdCount}`);
  console.log(`index.json size:    ${(indexBytes / 1024 / 1024).toFixed(2)} MB`);
}

main();
