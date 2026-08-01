# Alex ACT Illustrator Plugin

**Visual authoring for AI-driven workflows — pick the right chart, render it locally, and verify it says what it was meant to say.**

An [Alex ACT constellation](https://github.com/fabioc-aloha/Alex_ACT_Steward) plugin bundling visual-authoring skills for AI agents. Maintained by [Alex_ACT_Steward](https://github.com/fabioc-aloha/Alex_ACT_Steward), distributed via the [Alex ACT Plugin Mall](https://github.com/fabioc-aloha/Alex_Skill_Mall). Eight skills organized into **four feature areas** — Flint (statistical chart authoring via the local-first [`flint-chart-mcp`](https://www.npmjs.com/package/flint-chart-mcp) MCP server from [microsoft/flint-chart](https://github.com/microsoft/flint-chart)), Print figures (hand-authored print-quality SVG for books and reports, book-tested across 53 figures in *The Defensible Decision*), Replicate (AI image generation over Replicate's HTTP API), and Shell (browsable single-page HTML surface for galleries, catalogs, and generated reports) — with the framing (`chart-big-idea`) and verification (`render-verify`) skills shared across all four. Data stays on the machine for the Flint and Print features; the Replicate feature is HTTP-based and opt-in via `REPLICATE_API_TOKEN`. See the [Steward Illustrator Plan](https://github.com/fabioc-aloha/Alex_ACT_Steward/blob/main/illustrator/plan.md) for feature docs, roadmap, and provenance.

> **Renamed 2026-07-29.** This plugin was previously named `flint-chart-plugin`. Existing installations via `copilot plugin install flint-chart-plugin@alex-mall` continue to work; the Copilot plugin ID will rename at the first illustrator-scoped release. See the [Steward Illustrator Plan](https://github.com/fabioc-aloha/Alex_ACT_Steward/blob/main/illustrator/plan.md) for the rename rationale.

## What it does

Four feature areas share the same framing gate (`chart-big-idea` Step 0.5) and the same verification pass (`render-verify` Prose-coupling check):

1. **Flint — statistical chart authoring.** `chart-big-idea` → `chart-vocabulary` (7-goal catalog + CSAR loop) → `flint-chart` (§0 selection router + `ChartAssemblyInput` spec) → render via `flint-chart-mcp` (Vega-Lite / ECharts / Chart.js, local) → `render-verify`. Data never leaves the machine. Entry point: the `/render-chart` slash command.
2. **Print figures — hand-authored SVG for books and reports.** `chart-big-idea` (Step 0.5 earn-a-figure gate) → `print-svg-style-guide` (canvas + typography grammar, print-legibility floor with math, Tailwind semantic palette, four composition idioms) → `figure-generator` (`.mjs` generator + `data/<slug>.json` + `data-sha256` audit hash + contract tests + dataset inversion). Book-tested across 53 figures in *The Defensible Decision* (Fabio Correa).
3. **Replicate — AI image generation.** `chart-big-idea` → `replicate-imagery` (model routing + brand alignment + cost awareness) → upstream `replicate/skills` for prompting → `replicate` MCP calls the Replicate HTTP API. FLUX / Ideogram / Recraft / Imagen + editing / inpaint / upscale / background-removal. Requires `REPLICATE_API_TOKEN`; nothing spins up until you use it.
4. **Shell — browsable / gallery / catalog surface.** `docs-shell` skill + `starter/` bundle (index.html + manifest.json + about.md) render concatenated markdown as a single-page HTML shell with two-line topnav, sticky page header, and sidebar TOC. HTML-source docs (pre-built Flint reports, exported dashboards) bypass the shell wrapper.

### Demo — the heart chart, with meaning (Flint feature walkthrough)

> **Big Idea** — _Love's iconic silhouette **is** the four-archetype map of love: the heart's two upper lobes sit in the high-passion quadrants (infatuation left, consummate right), and its two lower sides sit in the low-passion quadrants (indifference left, companionate right)._

That one sentence — the load-bearing output of the [`chart-big-idea`](.github/skills/chart-big-idea/SKILL.md) skill — is what makes this a chart _with meaning_ instead of _decoration_. Everything downstream is a direct consequence of it: the story arc (Relationship with quadrant annotation), the audience read (Read / General / Persuasive), the TRADITIONAL-vs-INNOVATIVE stance (INNOVATIVE, because the heart-as-mnemonic argument is irreducibly geometric), the chartType (layered `scatter_plot`), the 12-layer composition (shaded quadrants → midpoint rules → parametric heart curve → archetype dots → axis subtitles), and the archetype placement (each of the heart's four lobes lands in its matching semantic quadrant).

<p align="center">
  <img src="assets/heart-chart.svg" alt="A heart-shaped curve traced onto an Intimacy × Passion plane, rendered as a layered Vega-Lite chart via the flint-chart MCP server. The x-axis is Intimacy (subtitle: trust, vulnerability, shared meaning), the y-axis is Passion (subtitle: desire, chemistry, excitement). Both axes run from low to high. Dashed lines partition the plot into four quadrants labeled INFATUATION (top left), CONSUMMATE LOVE (top right, on a warm cream background), INDIFFERENCE (bottom left, on a cool gray background), and FRIENDSHIP (bottom right). A red heart curve fills the plane; four bold dots sit at the heart's lobes, each labeled with an archetype that matches its semantic quadrant." width="480" />
</p>

**Skill-to-chart flow** — what the `chart-big-idea` skill did before the first line of the Vega-Lite spec was authored:

1. **Step 0 — read context.** The Big Idea was distilled from a written essay on the orthogonality of intimacy and passion, not asked cold from the user.
2. **Step 1 — draft the sentence.** Subject (heart silhouette) + verb (_is_) + implication (the four-archetype map). No 3-question elicitation ladder needed because Step 0 surfaced enough.
3. **Steps 2–4 — story arc + audience + style stance.** Relationship-with-annotation, general-audience read, INNOVATIVE (justified because the argument itself is 2D-geometric).
4. **Step 5 — emit the Chart Brief.** The brief is what `/render-chart` then handed to the [`flint-chart`](.github/skills/flint-chart/SKILL.md) skill for chartType selection and rendering.

The rendered demo ships in [`demos/heart-with-axes/`](demos/heart-with-axes/) — an interactive `report.html` you can open in any browser, plus a folder README with the Chart Brief and layer breakdown. Design decisions and the plugin's own genesis live in [`docs/`](docs/).

## Architecture — eight skills, one prompt, four features

The Flint feature (chart authoring) is the most orchestrated flow and the only one with a slash-command prompt (`/render-chart`). The other three features compose skills directly when the intent surfaces:

```text
/render-chart <request>            (Flint feature only)
      │
      ├─▶ chart-big-idea skill  ─────────────▶  Chart Brief          (shared across all features)
      │     Step 0: read surrounding context
      │     Step 0.5: earn-a-figure gate
      │     Step 1: Big Idea (or 3-Q ladder)
      │     Steps 2-4: arc + audience + style stance
      │     Step 4.5: focus discipline
      │     Step 5: emit Chart Brief
      │
      ├─▶ chart-vocabulary skill  ──────────▶  chart family + type
      │     7-goal catalog + CSAR evaluation loop
      │     override decision table + 5-visual rule
      │
      ├─▶ flint-chart skill  ───────────────▶  rendered chart
      │     §0.2 selection (constrained by Brief)
      │     Steps 1-N: author ChartAssemblyInput
      │     MCP call: create_chart_view / render_chart
      │
      └─▶ render-verify skill  ────────────▶  verified artifact    (shared across all features)
            open + read console errors + failure catalogs + Prose-coupling

Print figures feature (no MCP; hand-authored)
      chart-big-idea → print-svg-style-guide → figure-generator → render-verify

Replicate feature (AI image generation)
      chart-big-idea → replicate-imagery → replicate MCP + upstream replicate/skills → render-verify

Shell feature (browsable / gallery / catalog surface)
      docs-shell skill + starter/ bundle (index.html + manifest.json + about.md)
```

The Brief locks the framing across all four features. Each feature's rendering / authoring / generation stage is independent, but every rendered artifact goes through `render-verify` before it ships. Any skill can be invoked standalone if you already have the other parts of the picture.

## What ships

| File                                            | Role                                                                                                                                                                             |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.github/skills/chart-big-idea/SKILL.md`        | Framing skill — Big Idea, story arc, audience, style stance, Chart Brief output. Step 0.5 earn-a-figure gate + Step 4.5 focus discipline.                                        |
| `.github/skills/chart-vocabulary/SKILL.md`      | Chart-selection reference — 7-goal catalog + CSAR evaluation loop + 5-visual rule + gallery pointers. Adapted from `Alex_ACT_Visual_Storytelling`.                               |
| `.github/skills/flint-chart/SKILL.md`           | Selection + spec-authoring skill (§0 chart selection + Steps 1-N `ChartAssemblyInput`). Publication config preset for book / report / exec-facing charts.                        |
| `.github/skills/render-verify/SKILL.md`         | Verification skill — failure catalogs (charts + any artifact), host-capability table, Playwright setup, Prose-coupling check for published figures.                              |
| `.github/skills/print-svg-style-guide/SKILL.md` | Print-quality SVG style guide — canvas + typography grammar, print-legibility floor with math, Tailwind semantic palette, four structural composition idioms.                    |
| `.github/skills/figure-generator/SKILL.md`      | Deterministic figure-generator discipline — hand-authored `.mjs` pattern, `data-sha256` audit hash, dataset-first + contract tests, dataset inversion, fix-in-generator rule.    |
| `.github/skills/docs-shell/SKILL.md`            | Single-page HTML shell for browsable documentation, chart galleries, and illustration catalogs. HTML-source docs supported for pre-built reports.                                |
| `.github/skills/replicate-imagery/SKILL.md`     | Route AI image generation and editing to Replicate (FLUX, Ideogram, Recraft, imagen) via the bundled `replicate` MCP server. Delegates prompting to Replicate's upstream skills. |
| `.github/skills/svg-banner/SKILL.md`            | 1200×320 SVG brand banner generator with pluggable brand config (default: Alex ACT). For READMEs, plans, notes, release artifacts. Absorbed from `Alex_ACT_Steward` 2026-07-30.  |
| `.github/prompts/render-chart.prompt.md`        | `/render-chart <request>` slash-command entry point (loads the three chart skills)                                                                                               |
| `.github/prompts/banner.prompt.md`              | `/banner` slash-command entry point (invokes the svg-banner skill)                                                                                                               |
| `.vscode/mcp.json`                              | MCP server registration — `flint` (required) + `replicate` (optional, needs `REPLICATE_API_TOKEN`) + `playwright` (optional; see Install)                                        |
| `.vscode/settings.json`                         | Registers the `local/` skill + prompt discovery roots                                                                                                                            |
| `manifest.json`                                 | Plugin manifest — declares all shipping assets, install paths, prerequisites                                                                                                     |
| `README.md`                                     | This file                                                                                                                                                                        |
| `LICENSE`                                       | MIT (dual-copyright: Fabio Correa for plugin work + Microsoft for the flint-chart body)                                                                                          |

## Brand palette

The plugin follows the Alex ACT constellation brand palette. Canonical machine-readable source: [`.github/config/brand-palette.json`](https://github.com/fabioc-aloha/Alex_ACT_Steward/blob/main/.github/config/brand-palette.json) in `Alex_ACT_Steward`. The tables below are a human-readable snapshot; edit the JSON file to rebrand the constellation.

**Brand identity** — banners, marks, hero surfaces (`brand.*` + `gradient[]`):

| Swatch | Hex | Role |
| :---: | --- | --- |
| <svg xmlns="http://www.w3.org/2000/svg" width="48" height="24"><rect width="48" height="24" rx="3" fill="#0f172a"/></svg> | `#0f172a` | Deep slate — background (`brand.primaryDark`) |
| <svg xmlns="http://www.w3.org/2000/svg" width="48" height="24"><rect width="48" height="24" rx="3" fill="#10b981"/></svg> | `#10b981` | Emerald — primary accent, gradient start (`brand.primary`, `gradient[0]`) |
| <svg xmlns="http://www.w3.org/2000/svg" width="48" height="24"><rect width="48" height="24" rx="3" fill="#14b8a6"/></svg> | `#14b8a6` | Teal — gradient mid (`gradient[1]`) |
| <svg xmlns="http://www.w3.org/2000/svg" width="48" height="24"><rect width="48" height="24" rx="3" fill="#06b6d4"/></svg> | `#06b6d4` | Cyan — gradient end (`gradient[2]`) |
| <svg xmlns="http://www.w3.org/2000/svg" width="48" height="24"><rect width="48" height="24" rx="3" fill="#f1f5f9"/></svg> | `#f1f5f9` | Near-white — text on dark (`brand.primaryLight`, `typography.textOnDark`) |
| <svg xmlns="http://www.w3.org/2000/svg" width="48" height="24"><rect width="48" height="24" rx="3" fill="#94a3b8"/></svg> | `#94a3b8` | Muted — secondary text (`brand.muted`) |

**Semantic role coding** — screen-first diagram node fills (mermaid classDef vocabulary, `semantic.*`):

| Swatch | Class | Fill | Stroke | Text | Role |
| :---: | --- | --- | --- | --- | --- |
| <svg xmlns="http://www.w3.org/2000/svg" width="48" height="24"><rect width="48" height="24" rx="3" fill="#ddf4ff" stroke="#80ccff"/></svg> | `:::blue` | `#ddf4ff` | `#80ccff` | `#0550ae` | Input, source, start |
| <svg xmlns="http://www.w3.org/2000/svg" width="48" height="24"><rect width="48" height="24" rx="3" fill="#d3f5db" stroke="#6fdd8b"/></svg> | `:::green` | `#d3f5db` | `#6fdd8b` | `#1a7f37` | Output, result, success |
| <svg xmlns="http://www.w3.org/2000/svg" width="48" height="24"><rect width="48" height="24" rx="3" fill="#d8b9ff" stroke="#bf8aff"/></svg> | `:::purple` | `#d8b9ff` | `#bf8aff` | `#6639ba` | Processing, model, transformation |
| <svg xmlns="http://www.w3.org/2000/svg" width="48" height="24"><rect width="48" height="24" rx="3" fill="#fff8c5" stroke="#d4a72c"/></svg> | `:::gold` | `#fff8c5` | `#d4a72c` | `#9a6700` | Decision, condition, gate |
| <svg xmlns="http://www.w3.org/2000/svg" width="48" height="24"><rect width="48" height="24" rx="3" fill="#ffebe9" stroke="#f5a3a3"/></svg> | `:::red` | `#ffebe9` | `#f5a3a3` | `#cf222e` | Error, warning, failure |
| <svg xmlns="http://www.w3.org/2000/svg" width="48" height="24"><rect width="48" height="24" rx="3" fill="#eaeef2" stroke="#d0d7de"/></svg> | `:::neutral` | `#eaeef2` | `#d0d7de` | `#24292f` | Context, optional, out-of-scope |

**Chart categorical** — screen-quality data-series colors (`chart.categorical[]`):

| # | Swatch | Hex | Role hint |
| :---: | :---: | --- | --- |
| 0 | <svg xmlns="http://www.w3.org/2000/svg" width="48" height="24"><rect width="48" height="24" rx="3" fill="#10b981"/></svg> | `#10b981` | Primary / focus (matches brand accent) |
| 1 | <svg xmlns="http://www.w3.org/2000/svg" width="48" height="24"><rect width="48" height="24" rx="3" fill="#0ea5e9"/></svg> | `#0ea5e9` | Secondary series |
| 2 | <svg xmlns="http://www.w3.org/2000/svg" width="48" height="24"><rect width="48" height="24" rx="3" fill="#f59e0b"/></svg> | `#f59e0b` | Tertiary / comparison |
| 3 | <svg xmlns="http://www.w3.org/2000/svg" width="48" height="24"><rect width="48" height="24" rx="3" fill="#8b5cf6"/></svg> | `#8b5cf6` | Quaternary |
| 4 | <svg xmlns="http://www.w3.org/2000/svg" width="48" height="24"><rect width="48" height="24" rx="3" fill="#ef4444"/></svg> | `#ef4444` | Quinary / warning |

### Print variants ship in the plugin

`print-svg-style-guide` (Tailwind-grounded semantic palette) and `flint-chart` (publication preset categorical range) ship darker print-quality variants of these palettes for book / report / exec-facing figures where the render surface is white paper or high-DPI screens. Those are **print variants of the same brand identity**, not a separate palette — same semantic role coding, deeper contrast for print legibility. Deltas documented in each skill.

**Typography** — `Segoe UI, Helvetica, Arial, sans-serif` on screen (from `typography.fontStack`). Print figures follow the plugin's `print-svg-style-guide` typography scale.

## Prerequisites

- **Node.js ≥ 22** on your machine (required for `npx flint-chart-mcp`)
- **MCP-capable host.** Actively supported and verified: **VS Code Copilot**
  (1.118+), **GitHub Copilot CLI**, and the **GitHub Copilot app**. Other MCP
  stdio clients (Claude Desktop, Cursor, …) should work and their config paths
  are listed below as a courtesy, but they are not verified against each release.
- **A configured Alex ACT installation** — either an [Alex_ACT_Steward](https://github.com/fabioc-aloha/Alex_ACT_Steward)-maintained brain (primary, plugin-native lineage) or an [Alex_ACT_Edition](https://github.com/fabioc-aloha/Alex_ACT_Edition) heir (v4.1.0 compatibility line, frozen), with `.github/skills/local/` and `.github/prompts/local/` registered as discovery roots (default in both). Older Edition heirs see [`mall-installation.instructions.md`](https://github.com/fabioc-aloha/Alex_ACT_Edition/blob/main/.github/instructions/mall-installation.instructions.md) for the manual settings fallback
- **An installed browser** — _only_ if you enable the optional `playwright` server. Edge, Chrome, Firefox, or WebKit. Nothing is bundled; see [Registering the MCP servers](#registering-the-mcp-servers). Not needed on hosts with built-in browser tools (e.g. VS Code Copilot).
- **A `REPLICATE_API_TOKEN`** — _only_ if you use the `replicate-imagery` skill for AI-generated illustrations. Get one at [replicate.com/account/api-tokens](https://replicate.com/account/api-tokens) and set it in your shell environment: `$env:REPLICATE_API_TOKEN = 'r8_...'` (PowerShell) or `export REPLICATE_API_TOKEN=r8_...` (bash). The plugin's `.vscode/mcp.json` references `${env:REPLICATE_API_TOKEN}` so the token stays out of source control. Users who never generate AI imagery pay no cost and see no failure; the `replicate` MCP server starts on demand and only fails auth if invoked without a token.
- Recommended one-shot install of Replicate's upstream agent skills (`find-models`, `compare-models`, `run-models`, `prompt-images`, `prompt-videos`) for the substantive prompting knowledge the `replicate-imagery` skill delegates to: `npx skills add replicate/skills`

## Install

**Additional prerequisites for CLI-plugin install** (once per machine, on top of the Prerequisites section above):

- **Copilot CLI ≥ 1.0.75** — [install docs](https://docs.github.com/copilot/how-tos/set-up/install-copilot-cli). Update with `winget upgrade --id GitHub.CopilotCLI` on Windows.
- **GitHub CLI authenticated** — `gh auth login` and confirm with `gh auth status`.

Full brand-new-user walkthrough (four personas, five install stages, anti-patterns): see [`Alex_ACT_Steward/constellation/USER-EXPERIENCE.md`](https://github.com/fabioc-aloha/Alex_ACT_Steward/blob/main/constellation/USER-EXPERIENCE.md).

### Install from the Alex ACT Mall

Register the mall as a marketplace (one-time, per machine):

```powershell
copilot plugin marketplace add fabioc-aloha/Alex_Skill_Mall
```

Then install the illustrator plugin:

```powershell
copilot plugin install flint-chart-plugin@alex-mall
```

Installs at user scope — the eight skills and two prompts become available in every workspace on the machine. After the install you still need to **register the MCP servers** for your host (see [Registering the MCP servers](#registering-the-mcp-servers) below); the plugin content is installed, but its `flint` / `replicate` / `playwright` MCP servers only spawn when your host reads a config that references them.

> **Rename note.** The Mall entry currently publishes under the legacy ID `flint-chart-plugin` (from before the 2026-07-29 rename). Post-0.1.0 release the ID renames to `alex-act-illustrator-plugin`. Installations under the old ID keep working until `copilot plugin update` picks up the new ID.

### Verify the install

```powershell
copilot plugin list
```

You should see either `flint-chart-plugin@alex-mall` (marketplace) or the plugin under `_direct` (Method A direct-install). From Copilot Chat, `/render-chart` and `/banner` should appear in the slash-command picker; `chart-big-idea`, `chart-vocabulary`, `flint-chart`, `render-verify`, `print-svg-style-guide`, `figure-generator`, `replicate-imagery`, and `docs-shell` should appear in the skill dropdown.

Then continue with [Registering the MCP servers](#registering-the-mcp-servers) below for the host-specific MCP wiring, and use the bundled checker to verify each capability end-to-end (see [Verify your install](#verify-your-install) further down).

### Legacy install for pre-plugin-era Alex ACT Edition heirs

Pre-plugin-era Alex ACT Edition heirs (before the plugin-native lineage established on 2026-07-26) don't have `copilot plugin install` available. For that specific case, copy the plugin content into the heir's `.github/skills/local/` and `.github/prompts/local/` folders manually:

```bash
# From your Alex ACT workspace root:
git clone https://github.com/fabioc-aloha/Alex_ACT_Illustrator_Plugin.git /tmp/alex-act-illustrator-plugin

# Copy all eight skills into your heir-local skill folder
mkdir -p .github/skills/local
cp -r /tmp/alex-act-illustrator-plugin/.github/skills/chart-big-idea        .github/skills/local/
cp -r /tmp/alex-act-illustrator-plugin/.github/skills/chart-vocabulary      .github/skills/local/
cp -r /tmp/alex-act-illustrator-plugin/.github/skills/flint-chart           .github/skills/local/
cp -r /tmp/alex-act-illustrator-plugin/.github/skills/render-verify         .github/skills/local/
cp -r /tmp/alex-act-illustrator-plugin/.github/skills/print-svg-style-guide .github/skills/local/
cp -r /tmp/alex-act-illustrator-plugin/.github/skills/figure-generator      .github/skills/local/
cp -r /tmp/alex-act-illustrator-plugin/.github/skills/replicate-imagery     .github/skills/local/
cp -r /tmp/alex-act-illustrator-plugin/.github/skills/docs-shell            .github/skills/local/

# Copy the prompts into your heir-local prompt folder
mkdir -p .github/prompts/local
cp /tmp/alex-act-illustrator-plugin/.github/prompts/render-chart.prompt.md .github/prompts/local/
cp /tmp/alex-act-illustrator-plugin/.github/prompts/banner.prompt.md      .github/prompts/local/

# Then: register the local/ roots, and merge the MCP server entry (both below).
```

#### PowerShell (Windows)

```powershell
# From your Alex ACT workspace root:
git clone https://github.com/fabioc-aloha/Alex_ACT_Illustrator_Plugin.git $env:TEMP\Alex_ACT_Illustrator_Plugin
$src = "$env:TEMP\Alex_ACT_Illustrator_Plugin"

# Copy all eight skills into your heir-local skill folder
New-Item -ItemType Directory -Force -Path .github\skills\local | Out-Null
Copy-Item "$src\.github\skills\chart-big-idea"        -Destination .github\skills\local\ -Recurse -Force
Copy-Item "$src\.github\skills\chart-vocabulary"      -Destination .github\skills\local\ -Recurse -Force
Copy-Item "$src\.github\skills\flint-chart"           -Destination .github\skills\local\ -Recurse -Force
Copy-Item "$src\.github\skills\render-verify"         -Destination .github\skills\local\ -Recurse -Force
Copy-Item "$src\.github\skills\print-svg-style-guide" -Destination .github\skills\local\ -Recurse -Force
Copy-Item "$src\.github\skills\figure-generator"      -Destination .github\skills\local\ -Recurse -Force
Copy-Item "$src\.github\skills\replicate-imagery"     -Destination .github\skills\local\ -Recurse -Force
Copy-Item "$src\.github\skills\docs-shell"            -Destination .github\skills\local\ -Recurse -Force

# Copy the prompt into your heir-local prompt folder
New-Item -ItemType Directory -Force -Path .github\prompts\local | Out-Null
Copy-Item "$src\.github\prompts\render-chart.prompt.md" -Destination .github\prompts\local\ -Force

# Then: register the local/ roots, and merge the MCP server entry (both below).
```

### Registering the MCP servers

Inspect [`.vscode/mcp.json`](.vscode/mcp.json) first, then **merge** its entries
into your host's config. Merge, don't overwrite — if the file already exists it
almost certainly holds other servers you'd destroy.

| Server       | Required? | Role                                                                          |
| ------------ | --------- | ----------------------------------------------------------------------------- |
| `flint`      | Yes       | Renders the chart (Flint feature)                                             |
| `replicate`  | No        | AI image generation (Replicate feature) — needs `REPLICATE_API_TOKEN`         |
| `playwright` | No        | Verification browser — needed on Copilot CLI, not VS Code                     |

| Host                         | Config path                       | Top-level key |
| ---------------------------- | --------------------------------- | ------------- |
| VS Code (workspace)          | `.vscode/mcp.json`                | `servers`     |
| Claude Code / Claude Desktop | `.mcp.json` (workspace root)      | `servers`     |
| Cursor                       | `.cursor/mcp.json`                | `servers`     |
| GitHub Copilot CLI           | `~/.copilot/mcp-config.json`      | `mcpServers`  |

Then reload VS Code. Each server spawns via `npx` on the first tool call (~1-2s
cold start; cached thereafter).

#### The optional `playwright` server — omit it on VS Code

The `render-verify` skill names a **capability** (open a page, read its console,
screenshot it), not a product. VS Code Copilot already has built-in browser
tools that satisfy it — they open `file://` with no flags and no browser
download. **On VS Code, drop the `playwright` entry.**

Add it when your host has no browser capability of its own. **GitHub Copilot CLI
is the main case** — it is a terminal agent with no browser, so this server is
the only way it can verify a render rather than assume one.

If you do enable it, three measured facts matter:

- **No bundled browser.** Playwright drives an _installed_ one by channel. The
  shipped config uses `--browser msedge`, because Edge ships with Windows and
  the upstream default (`chrome`) is frequently absent there. Where Edge is not
  installed — typically Linux — switch to `chrome`, `firefox`, or `webkit`, or
  run `npx playwright install <channel>`.
- **`file://` is blocked by default**, which is why the shipped entry carries
  `--allow-unrestricted-file-access`. Without that flag every local render
  silently fails to load.
- **It writes `.playwright-mcp/` into your working directory.** Gitignore it —
  this repo does. Also never pass a bare `filename` to a screenshot call, or the
  image lands in your repo root instead of the ignored folder.

> [!WARNING]
> `--allow-unrestricted-file-access` lets the browser read any file you can read.
> That is a reasonable trade for verifying local artifacts you just produced. It
> is **not** safe combined with browsing untrusted web pages, where a hostile
> page may try to drive the agent into reading and exfiltrating local files. Keep
> this server scoped to local verification; use a separate config without the
> flag for general browsing.

Both servers share the same path traps:

> [!IMPORTANT]
> **VS Code reads `.vscode/mcp.json`, not a workspace-root `.mcp.json`.** Root
> `.mcp.json` is the Claude Code convention. The `servers` schema is identical
> in both, which is exactly why the wrong path looks like it should work — and
> VS Code shows no error, because it isn't parsing a broken file, it's reading
> no file at all.

The CLI is a step worse again:

> [!WARNING]
> **GitHub Copilot CLI fails harder: wrong path _and_ wrong schema.** Its config
> lives at `~/.copilot/mcp-config.json` (or `$COPILOT_HOME/mcp-config.json`) and
> the top-level key is **`mcpServers`**, not `servers`. Pasting the `servers`
> block there produces the same silent nothing. Easiest route is to let the CLI
> write the file for you: run `/mcp add` inside a session rather than editing
> the JSON by hand.

### Registering the `local/` roots

VS Code discovers skills in `.github/skills/` and prompts in `.github/prompts/`.
It does **not** search their subfolders, so a plugin installed under `local/`
loads nothing — again with no error. On an Alex ACT Steward brain or an Alex ACT Edition heir these roots are
already registered; on a plain VS Code workspace, add them to
`.vscode/settings.json`:

```jsonc
{
  "chat.agentSkillsLocations": { ".github/skills/local": true },
  "chat.promptFilesLocations": { ".github/prompts/local": true }
}
```

Keep these **additive** — don't disable the defaults. Your own skills and prompts
stay in the default roots; installed plugins live under `local/`, and the two
sets coexist. (Each skill's `name` must match its parent directory name, which
all three of this plugin's skills satisfy.)

This repo dogfoods the same wiring — see [`.vscode/settings.json`](.vscode/settings.json)
and [`.vscode/mcp.json`](.vscode/mcp.json).

### If the tools still don't appear

If the `flint` tools are missing after a reload:

1. **Approve the server.** `Ctrl+Shift+P` → **MCP: List Servers** → `flint` → **Start**. VS Code will not launch a local stdio server until you approve it.
2. **Read the server output.** Same menu → **Show Output**. Startup crashes surface there and nowhere else.
3. **Restart the chat session.** A window reload is not always enough — the agent's tool inventory can stay stale until the session restarts.

### Verify your install

Four checks, in this order. Each isolates a different half of the system, so the
first one that fails tells you where the fault is.

1. **Server.** From a clone of this repo, run the bundled checker — no agent, no
   host, and no MCP client needed:

   ```bash
   node scripts/verify-install.mjs
   ```

   It reads the pin from [`.vscode/mcp.json`](.vscode/mcp.json) so it verifies
   the version your config actually requests, handshakes over stdio, and asserts
   all five tools are advertised. Exit 0 means the server is healthy and any
   remaining fault is on the client side — config path, trust, or a stale
   session. This is the one check that must not depend on your agent, since your
   agent may be the thing that's broken.

   Two optional flags, useful when changing the pin: `--catalog` lists the
   backends and per-backend chart-type counts, and `--compat` validates the
   chart-property patterns this plugin documents. Both report version-dependent
   facts that the docs would otherwise assert blindly.

   To also verify the optional MCP servers (Replicate + Playwright): `--replicate`,
   `--playwright`, or `--all-mcps`. Both optional servers degrade gracefully —
   Replicate SKIPs if `REPLICATE_API_TOKEN` is unset; Playwright reports FAIL
   (non-fatal) if the browser can't launch. Only the flint check gates exit code.

   Installed from the Alex Mall instead? That vendors only the skills, the
   prompt, and `mcp.json` — no `scripts/`. Either clone this repo to run the
   checker, or ask your agent to probe `npx -y flint-chart-mcp` over stdio with
   an `initialize` handshake followed by `tools/list`; a `serverInfo` block plus
   a `tools` array means the same thing.
2. **Client.** Ask the agent whether it can see `render_chart`, `compile_chart`,
   `validate_chart`, `list_chart_types`, and `create_chart_view`. All five, or
   your host isn't reading the config you edited.
3. **Skills and prompt.** Type `/` in chat. `chart-big-idea`, `flint-chart`,
   `render-verify`, and `render-chart` should all appear. If the MCP tools work
   but these don't, the discovery roots above are missing.
4. **Render.** Ask for any chart. `list_chart_types` should return 34 Vega-Lite
   chart types, and a render should produce an image.

This repo runs the same four checks against its own [`.vscode/`](.vscode/) config —
last verified 2026-07-29 against `flint-chart-mcp` 0.3.0 (MCP protocol
`2024-11-05`).

For deep MCP config (HTTP transport, allowed hosts, deployment, full CLI reference), see the canonical [Flint MCP doc](https://microsoft.github.io/flint-chart/#/mcp).

### Update

Copilot CLI does not auto-update plugins — updates are manual.

```powershell
copilot plugin update flint-chart-plugin       # if installed via mall
copilot plugin update alex-act-illustrator-plugin  # once the mall entry renames post-0.1.0
```

Read the [CHANGELOG](CHANGELOG.md) before applying breaking changes. If you have `alex-act-core` installed, its `/update-plugins` prompt reads CHANGELOGs for you and consent-gates breaking updates across the whole constellation.

### Uninstall

```powershell
copilot plugin uninstall flint-chart-plugin       # if installed via mall
copilot plugin uninstall alex-act-illustrator-plugin  # once the mall entry renames
```

Uninstalling the plugin removes the eight skills and two prompts but does **not** touch the MCP server registrations you added to `.vscode/mcp.json` or `~/.copilot/mcp-config.json` — those are your host's config, not the plugin's. Remove the `flint`, `replicate`, and `playwright` entries manually if you want a fully clean slate.

**Troubleshooting.** If uninstall fails with `Access is denied` on Windows (close every VS Code window first — Copilot Chat holds file handles on plugin binaries) or `Plugin "..." is not installed` while the plugin still shows in `plugin list` as `[disabled]` (zombie entry in `~/.copilot/config.json`'s `installedPlugins` array), see [`USER-EXPERIENCE.md § Optional — start from a clean slate`](https://github.com/fabioc-aloha/Alex_ACT_Steward/blob/main/constellation/USER-EXPERIENCE.md) for the working two-file config cleanup pattern.

## Usage patterns

### Ambient (most common)

```text
User: I have monthly sales for 12 regions. Best way to compare them side by side?
Agent: [loads chart-big-idea → Step 0 finds no doc context → asks "what surprised you?" →
        drafts Chart Brief (Big Idea + Comparison arc + TRADITIONAL stance) →
        loads flint-chart → §0.2 recommends Small Multiples with row facet
        (12 > Grouped Bar's 4-series ceiling) → §0.4 confirms Flint coverage →
        asks for the CSV → authors spec → calls create_chart_view]
```

### Explicit slash command

```text
User: /render-chart render a scatter of weight vs mpg colored by origin
Agent: [Big Idea preflight → authors ChartAssemblyInput → calls create_chart_view]
```

### Validation only

```text
User: I hand-wrote this Flint spec — check it: {...}
Agent: [calls validate_chart → returns valid | warnings | computed size]
```

### Backend compilation for embedding

```text
User: Give me the Vega-Lite JSON so I can embed it in our React app
Agent: [calls compile_chart with backend: 'vegalite' → returns native spec, no PNG]
```

### Capability discovery

```text
User: What chart types can Flint make for ECharts?
Agent: [calls list_chart_types with backend: 'echarts' → returns full catalog]
```

### Print figure for a book chapter (Print figures feature)

```text
User: I need a BEFORE/AFTER paired panel figure for the report showing wait-time
      distribution before and after triage redesign.
Agent: [loads chart-big-idea → Step 0.5 earn-a-figure gate → emits Brief →
        loads print-svg-style-guide → picks BEFORE/AFTER paired panels idiom +
        Tailwind semantic palette (Red-700 = critique, Green-700 = approval) →
        loads figure-generator → authors data/wait-times.json + contract test →
        writes .mjs generator with print-legibility floor math + data-sha256 hash →
        emits SVG to assets/figures/ → render-verify Prose-coupling check]
```

### AI illustration for a chapter opener (Replicate feature)

```text
User: Chapter 7 needs a hero image — a photorealistic scene of a decision maker
      at a crossroads at dusk, warm tones, editorial illustration style.
Agent: [loads chart-big-idea → Step 0.5 (does the chapter earn an illustration or is
        a diagram better?) → confirms illustration → loads replicate-imagery →
        picks model (Ideogram v3 for editorial illustration $0.09/image) →
        weaves brand-palette hex codes into prompt for warm tones → calls
        replicate MCP predictions.create → render-verify Prose-coupling on the result]
```

### Browsable illustration catalog (Shell feature)

```text
User: Set up a single-page HTML shell to browse all 53 figures in the book with
      per-chapter navigation.
Agent: [loads docs-shell → copies starter/ bundle (index.html + manifest.json + about.md)
        to workspace root → authors manifest.json declaring areas + docs →
        authors per-chapter markdown source files that reference the figures]
```

## Configuration

The bundled `mcp.json` fragment is minimal:

```jsonc
{
  "servers": {
    "flint": {
      "command": "npx",
      "args": ["-y", "flint-chart-mcp@^0.3.0"],
    },
  },
}
```

### Common variations

**Hardened deployment** (reject local `data.url` file references; accept only inline `data.values`):

```jsonc
{
  "servers": {
    "flint": {
      "command": "npx",
      "args": ["-y", "flint-chart-mcp@^0.3.0", "--disable-file-reference"],
    },
  },
}
```

**Restrict backends** (e.g., Vega-Lite + ECharts only, no Chart.js):

```jsonc
{
  "servers": {
    "flint": {
      "command": "npx",
      "args": [
        "-y",
        "flint-chart-mcp@^0.3.0",
        "--backends",
        "vegalite,echarts",
      ],
    },
  },
}
```

**Air-gapped / corporate npm firewall** — install once when online, then run without npx download:

```bash
npm install -g flint-chart-mcp@0.3.0
```

Then update the fragment:

```jsonc
{ "servers": { "flint": { "command": "flint-chart-mcp", "args": [] } } }
```

**Pinned version** — the pin is `^0.3.0` as of 2026-07-29, bumped from `^0.2.2` after the Microsoft corporate npm mirror caught up to 0.3.0. Caret on a `0.x` version means `>=0.3.0 <0.4.0`, so 0.4.x is never picked up automatically. Public npm `latest` is 0.4.0, but has not been verified against this plugin's documented spec patterns from an off-corpnet machine — see [`HANDOFF.md`](HANDOFF.md) if that verification is worth doing. See the Unreleased section of [`CHANGELOG.md`](CHANGELOG.md) for the 0.3.0 bump details and the conditions for a further move. When checking versions yourself, run `npm config get registry` first: a corporate mirror can report a different `latest` than public npm.

**Naming conflict** — if you already have a `flint` server registered, rename this one to `flint-chart` in your merged config. The skill and prompt reference the server by tool inventory, not by name.

## What the plugin does NOT do

**Flint feature** —

- Author or render charts outside Flint's supported chart types (Beeswarm, Chord Diagram, Waffle Chart, Word Cloud, SPC charts, AI-Powered analytics — see the skill's §0.4 Flint coverage table for substitutions)
- Transform / aggregate / filter data — do that with your data tool first, then hand Flint the prepared rows
- Handle Power BI, Tableau, or other BI tools — Flint targets Vega-Lite, ECharts, and Chart.js only
- Ship the MCP server code — it downloads from npm on demand (bundling would be 80-120 MB per plugin across 6 OS/arch native-binary variants)

**Print figures feature** —

- Auto-generate figures without a Big Idea — Step 0.5 earn-a-figure gate refuses artifacts that don't clear it
- Ship a chart-rendering library — print figures are hand-authored SVG via `.mjs` generators reading from `data/<slug>.json`; the discipline is deterministic-and-diffable, not automated
- Transform data into figure data — the generator reads a dataset the user prepares; the dataset-first + `data-sha256` rule exists to make provenance auditable

**Replicate feature** —

- Reinvent Replicate's own primitives — the `replicate-imagery` skill is a thin router; the substantive prompting lives in Replicate's upstream agent skills (`npx skills add replicate/skills`) which the plugin composes with
- Handle non-image Replicate workloads — audio, code, music, translation models are out of the illustrator identity
- Store the API token — `REPLICATE_API_TOKEN` must be set in the shell env; the plugin references it via `${env:REPLICATE_API_TOKEN}` so it never enters source control
- Guarantee data privacy for AI generation — prompts and reference images go to Replicate's HTTP API. Do not use this feature for classified / regulated content

**Shell feature** —

- Serve dynamic content — the shell is single-page HTML that renders concatenated markdown; no server, no database, no build step
- Replace a full documentation site generator — for anything beyond a browsable single-page shell (search, versioning, multi-page routing), use MkDocs / Docusaurus / mdBook

## Publishing to the Mall

This repo is the source-of-truth. The [Alex ACT Plugin Mall](https://github.com/fabioc-aloha/Alex_Skill_Mall) vendors a specific version at `plugins/data-analytics/flint-chart-plugin/` (Mall directory retained under the old name during transition; will rename with the Copilot plugin ID at the first illustrator-scoped release). To publish a new version — or refresh the Mall's vendored README after upstream doc edits — follow the step-by-step runbook in **[`docs/publishing-to-mall.md`](docs/publishing-to-mall.md)**.

Short version: vendor the ten installable payload files (8 skills + 1 prompt + `mcp.json`) byte-for-byte into the Mall's plugin folder, copy the README with image `src` rewritten to absolute `raw.githubusercontent.com` URLs, update the Mall's `plugin.json` version, append a curation-log entry, rebase on the Mall's `main`, commit with a severity tag, push. The runbook has the exact commands and a verification checklist.

## Contributing

Issues and PRs welcome. See [`.github/copilot-instructions.md`](.github/copilot-instructions.md) for the repo's conventions (commit-message severity tags, frontmatter rules, lint discipline, falsifiability) — those instructions load automatically for AI agents but are also useful for human contributors.

This repo pairs with:

- Alex ACT Steward (plugin lineage host + maintainer): <https://github.com/fabioc-aloha/Alex_ACT_Steward>
- Alex ACT Edition (v4.1.0 compatibility host): <https://github.com/fabioc-aloha/Alex_ACT_Edition>
- Alex ACT Plugin Mall (distribution): <https://github.com/fabioc-aloha/Alex_Skill_Mall>
- Upstream flint-chart (Microsoft): <https://github.com/microsoft/flint-chart>

## Attribution

**Chart-selection framework** distilled from standard visualization literature:

- Cole Nussbaumer Knaflic — _Storytelling with Data_ (message-first framing, explanatory vs exploratory, 6 lessons)
- Andy Kirk — _Data Visualisation_ (trustworthy · accessible · elegant)
- Stephen Few — _Show Me the Numbers_, _Information Dashboard Design_ (tables vs graphs, bullet > gauge)
- Wexler / Shaffer / Cotgreave — _Big Book of Dashboards_ (28 case studies)

For per-chart design tips and the full 48-chart catalog, see [_The Defensible Decision_ chart gallery](https://www.thedefensibledecision.com/gallery/chart-gallery.html) — the skill fetches from there on demand when the question is **which chart** to pick.

For live examples of every Flint `chartType` across all backends, organized by semantic category (Bar & Column / Line & Area / Scatter & Points / Distributions / Circular & Radial / Tables & Multi-Dimensional / Maps), see the canonical [Flint gallery](https://microsoft.github.io/flint-chart/#/gallery/vegalite) (swap `/vegalite` for `/echarts` or `/chartjs` to view the other backends) — the skill fetches from there when the question is **what will Flint render**.

**flint-chart** is a [Microsoft Research](https://www.microsoft.com/en-us/research/) + [IDEAS Lab (Renmin University)](https://ideas-lab.net/) project. Canonical docs: [getting started](https://microsoft.github.io/flint-chart/#/documentation/getting-started) (concepts, API reference, architecture, chart-template extension), [MCP server](https://microsoft.github.io/flint-chart/#/mcp) (deployment + full CLI), [project home](https://microsoft.github.io/flint-chart/) (live editor + release notes).

**flint-chart-mcp** is published by Microsoft Corporation to npm at [`flint-chart-mcp`](https://www.npmjs.com/package/flint-chart-mcp) (MIT license).

**The `flint-chart` skill body** in this repo is forked from [`microsoft/flint-chart/agent-skills/flint-chart-author/SKILL.md`](https://github.com/microsoft/flint-chart/blob/main/agent-skills/flint-chart-author/SKILL.md) (MIT-licensed), with a prepended §0 Chart Selection section added by this plugin.

**New work in this repo**:

- `chart-big-idea` skill and the `/render-chart` prompt
- `print-svg-style-guide` and `figure-generator` skills (Print figures feature; book-tested across 53 shipped figures in *The Defensible Decision* by Fabio Correa)
- `replicate-imagery` skill (Replicate feature; thin routing over Replicate's own primitives)

**Adapted with attribution**:

- `chart-vocabulary` skill — adapted from [`fabioc-aloha/Alex_ACT_Visual_Storytelling`](https://github.com/fabioc-aloha/Alex_ACT_Visual_Storytelling) v1.2.0 `visual-vocabulary` skill on 2026-07-30
- `docs-shell` skill + `starter/` bundle — ported from [`fabioc-aloha/Alex_ACT_Steward`](https://github.com/fabioc-aloha/Alex_ACT_Steward) on 2026-07-29; this plugin is now the canonical source-of-truth (Steward + CX-Vitals + QuestionnaireFlow + airs-enterprise pull from here)

**Upstream primitives** (installed separately, not vendored):

- Replicate agent skills (`find-models`, `compare-models`, `run-models`, `prompt-images`, `prompt-videos`) at [`github.com/replicate/skills`](https://github.com/replicate/skills) — install via `npx skills add replicate/skills`. The plugin's `replicate-imagery` skill delegates substantive prompting to these.
- `replicate-mcp` — Replicate's official MCP server on npm, wraps their HTTP API.

## License

MIT (dual-copyright — see [`LICENSE`](LICENSE)).
