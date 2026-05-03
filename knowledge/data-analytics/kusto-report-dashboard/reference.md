# kusto-report-dashboard Reference

12 skills for HTML report generation with Plotly/D3.js from any MCP-backed database. Store queries per dashboard, generate interactive visualizations.

This is a **knowledge package** -- consult on demand, not loaded into the brain.

---

## query-add-query


# query-add-query

## Purpose
Interactively add a new query to an existing dashboard, collecting all configuration via interview.

## Connection Resolution

See `reference/connection-resolution.md` for the full 4-level hierarchy (query → dashboard → project walk-up → global default).

## Workflow

### Step 1: Select dashboard

If dashboard name is provided as argument, use it. Otherwise list dashboards and ask user to pick one.

Validate the dashboard exists:

1. Find the registry per `reference/registry-discovery.md` (walk up from CWD, fall back to `%LOCALAPPDATA%\query-dashboards\registry.json`). If neither exists, tell the user no dashboards have been created yet and suggest running `query-create-dashboard` to create one, then stop.
2. Parse the registry JSON and check whether the provided (or selected) dashboard name is a key in the object. If the name is not found, display an error like:
   ```
   Dashboard '<name>' not found. Available dashboards: <comma-separated list of keys>
   ```
   Then stop.

Resolve the effective connection following the 4-level algorithm in `reference/connection-resolution.md` (query → dashboard → project walk-up → global). The resolved connection will be pre-filled during the interview. If no connection is configured at any level, tell the user and ask them to run `query-create-dashboard` or `query-settings`, then stop.

### Step 2: Offer to clone an existing query

If the dashboard already has at least one query, ask:

```
Clone settings from an existing query? (yes / no — default: no)
```

If yes, list existing queries and ask the user to pick one. Read that query's `.config.json` and pre-fill all subsequent fields (visualization, connection override, thresholds) with its values. The user can then accept or change each pre-filled value during the interview. The query name, description, and content are always collected fresh — they are never copied.

### Step 3: Collect name and description

**Query identity:**
- Query name (kebab-case, e.g., `startup-latency`)
- Description (what does this query measure?)

### Step 4: Validate query name

- Must be kebab-case (lowercase letters, numbers, hyphens)
- Must not already exist in the dashboard
- If exists, ask user to overwrite or use a different name

### Step 5: Collect remaining query details

**Query content:**
Ask the user to provide the query content (KQL, SQL, or whatever language the target tool uses).

**Query file extension:**
Infer the appropriate file extension from the resolved MCP tool name:
- Tool name contains `kusto` or `adx` → `.kql`
- Tool name contains `sqlite`, `mysql`, `postgres`, `mssql`, or `sql` → `.sql`
- Otherwise → ask the user to specify (e.g., `.kql`, `.sql`, `.cypher`, `.flux`), or accept their input

The inferred extension is a suggestion — always confirm with the user if it's not obvious.

**Connection:**
Show the dashboard's current effective connection and ask:
```
Connection: <mcpTool> / <database>  (from: dashboard override | global default)

Override for this query? (yes / no — default: no)
```
If yes:
- Discover available MCP tools per `reference/mcp-discovery.md` (use `tool_search_tool_regex` with pattern `execute_query`)
- Ask user to select a tool (or enter manually)
- Ask for database name

**Visualization:**
- Type: see `reference/visualization-types.md` for the full list, auto-selection decision tree, and guidance on advanced types
- Chart title
- Optional: visualization instructions (e.g., "Pivot on Platform column", "Show last 30 days")
- Optional: explicit x-axis column name
- Optional: explicit y-axis column name(s)

**Thresholds (optional):**
- Ask: "Would you like to set up monitoring thresholds for this query?"
- If yes, collect thresholds iteratively. For each threshold:
  - Column name (which column to evaluate, e.g., `P95Latency`, `ErrorRate`)
  - Operator: `>` / `<` / `>=` / `<=` / `==` / `!=`
  - Value (numeric)
  - Label (e.g., `Critical`, `Warning`, `Target`)
  - Color (suggest: Critical=`#e15759`, Warning=`#f28e2b`, Info=`#4e79a7`)
  - Ask "Add another threshold?" until user says no

Leave `thresholds` as `[]` if user declines.

### Step 6: Write files

**Write the query file:**
`<storageLocation>/queries/<query-name>.<extension>`

Content: the query content exactly as provided.

**Write the config file:**
`<storageLocation>/queries/<query-name>.config.json`

```json
{
  "name": "<query-name>",
  "description": "<description>",
  "queryFile": "<query-name>.<extension>",
  "mcpTool": "<tool name or null if using dashboard/global default>",
  "database": "<database or null if using dashboard/global default>",
  "visualization": {
    "type": "<type>",
    "title": "<chart title>",
    "instructions": "<optional hints or empty string>",
    "xAxis": "<column name or null>",
    "yAxis": "<column name(s) or null>"
  },
  "thresholds": [
    {
      "column": "<column name>",
      "operator": "> | < | >= | <= | == | !=",
      "value": 0,
      "label": "<label>",
      "color": "<hex color>"
    }
  ]
}
```

`queryFile` stores the actual filename (including extension) so other skills can locate the query file without guessing the extension. Set `mcpTool` and `database` to `null` if the user chose not to override (inherit from dashboard or global).

### Step 7: Confirm

```
✅ Query '<query-name>' added to dashboard '<dashboard>'

  File:       queries/<query-name>.<extension>
  Connection: <mcpTool> / <database>  (query override | inherited)
  Viz type:   <type>
  Thresholds: <N>

Next steps:
  query-run-query      — Test this query now
  query-generate-report — Generate full dashboard report
  query-add-query      — Add another query
```

---

## query-configure-report


# query-configure-report

## Dependency
This skill configures settings consumed by `query-generate-report`, which uses **report-forge** for rendering. Theme and visualization type values must match report-forge's vocabulary.

## Purpose
Update report configuration at the dashboard level or per-query level without re-running the full add-query interview.

## Workflow

### Step 1: Select dashboard

If provided as argument, use it. Otherwise list dashboards and ask user to select one. Find the registry per `reference/registry-discovery.md` (walk up from CWD, fall back to `%LOCALAPPDATA%\query-dashboards\registry.json`) to get the dashboard's `storageLocation`.

### Step 2: Show current config

Read `<storageLocation>/config.json`. Discover queries by reading all `*.config.json` files in `<storageLocation>/queries/` — matching the pattern used across all other skills. Do NOT list query content files (.kql, .sql, etc.).

Display:
```
Current report config for: excel-startup
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Report title:    Excel Startup Metrics
Theme:           tufte
Instructions:    (none)

Queries:
  startup-latency    → time_series | "Startup Latency Over Time"
  error-rates        → bar         | "Error Rates by Code"
  dau                → auto        | "Daily Active Users"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 3: Ask what to configure

Ask user to choose (may select both):
- "Report title, theme, global instructions" — dashboard-level settings
- "Visualization for a specific query" — per-query chart settings

### Step 4a: If configuring dashboard-level settings

Collect:
- New report title (pre-fill with current)
- Theme: `tufte` (clean/minimal, best for technical audiences) or `colorful` (vibrant dark, best for presentations)
- Global AI instructions for the report generator (e.g., "Show all time axes in UTC", "Highlight values above 5000ms")

Read `config.json`, merge changes into `reportConfig`, write updated JSON.

### Step 4b: If configuring per-query visualization

Ask user which query to configure. Read the current `.config.json` for that query and show current values.

Collect updates:
- Visualization type: see `reference/visualization-types.md` for the full list and auto-selection guidance
- Chart title
- AI instructions for this chart (e.g., "Pivot on Platform column", "Show as percentage of total")
- X axis column override (or clear it)
- Y axis column override (or clear it)
- Connection override: follow the override model in `reference/connection-resolution.md` (MCP tool + database, or clear to inherit)

Write the updated `.config.json`.

### Step 5: Confirm changes

```
✅ Report configuration updated for dashboard 'excel-startup'

Dashboard settings:
  Title:        Excel Startup Metrics (updated)
  Theme:        colorful (was: tufte)
  Instructions: Show all time axes in UTC (added)

Query settings updated:
  startup-latency: viz type auto → time_series, instructions added

Run query-generate-report to apply the new configuration.
```

---

## query-create-dashboard


# query-create-dashboard

## Purpose
Create a new dashboard by collecting configuration via interview, then set up the folder structure and config files. On first use, also sets up the global default connection.

## Workflow

### Step 1: Check for global default connection

First, search for a project-level config by walking up from the current working directory. Look for `query-dashboards.json` in the current directory and each parent directory. If found, read its `defaultConnection` — this is the project-level default (see `reference/connection-resolution.md`). Skip to Step 2; there is no need to set up a global default unless the user wants one.

Read `$env:LOCALAPPDATA/query-dashboards/config.json`.

**If the file does not exist** (first time setup), run the connection setup interview:

```
No default connection configured yet. Let's set one up.

Available query tools (searching for MCP tools with 'execute_query' in the name):
  [list discovered tools]

Which tool should be used by default for executing queries?
(You can override this per-dashboard or per-query later.)
```

Discover available MCP tools per `reference/mcp-discovery.md` (use `tool_search_tool_regex` with pattern `execute_query`). Present the list to the user. If no tools found or tool discovery is unavailable, ask the user to enter the tool name manually (e.g., `mcp_kusto-wac_execute_query`).

Then ask:
- Default database name (e.g., `WacProd`, `ExcelTelemetry`, `my-database.db`)

Then ask where to save the connection:
```
Save this connection:
  [1] Globally  (%LOCALAPPDATA%\query-dashboards\config.json) — applies on this machine across all projects
  [2] Project   (query-dashboards.json in current directory)  — can be checked into source control for team sharing
```

**If they choose Global (1)**, save global config:
```powershell
New-Item -ItemType Directory -Force -Path "$env:LOCALAPPDATA/query-dashboards"
```

Write `$env:LOCALAPPDATA/query-dashboards/config.json`:
```json
{
  "defaultConnection": {
    "mcpTool": "<selected tool name>",
    "database": "<database name>"
  }
}
```

Confirm:
```
✅ Default connection saved:
  Tool:     <mcpTool>
  Database: <database>

You can override this per-dashboard or per-query at any time.
```

**If they choose Project (2)**, write `query-dashboards.json` in the current working directory:
```json
{
  "defaultConnection": {
    "mcpTool": "<selected tool name>",
    "database": "<database name>"
  }
}
```

Confirm:
```
✅ Project-level connection saved: query-dashboards.json
  Tool:     <mcpTool>
  Database: <database>

You can override this per-dashboard or per-query at any time.
```

**If the file exists**, show the current default and continue.

### Step 2: Interview the user

**Identity:**
- Dashboard name (kebab-case, e.g., `excel-startup`)

Immediately validate the name before asking anything else:
- Must be kebab-case (lowercase letters, numbers, hyphens only)
- Must not already exist in the registry (resolved per `reference/registry-discovery.md` — walk up from CWD, fall back to `%LOCALAPPDATA%\query-dashboards\registry.json`)
- If validation fails, tell the user why and ask for a different name before proceeding

Only after the name passes validation, continue:

- Description (what does this dashboard measure?)

**Storage:**
```
Where should this dashboard be stored?
Default: %LOCALAPPDATA%\query-dashboards\<name>
Enter a custom path or press Enter to use the default.
```
Resolve the final path (expand `%LOCALAPPDATA%` to the actual value).

**Connection override (optional):**
Show the current default connection and ask:
```
Default connection: <mcpTool> / <database>

Override for this dashboard? (yes / no — default: no)
```
If yes, ask for a different MCP tool and database.

**Report config:**
- Report title (shown in the HTML report header)
- Theme: `tufte` (clean/minimal, best for technical audiences) or `colorful` (vibrant dark, best for presentations)
- Global instructions for the report generator (optional, e.g., "Show all time axes in UTC")

**Initial queries:**
- Ask: "Would you like to add queries now, or later?"
- If now, follow the `query-add-query` workflow for each query

### Step 3: Create directory structure

```powershell
$location = "<resolved storageLocation>"
New-Item -ItemType Directory -Path "$location/queries" -Force
New-Item -ItemType Directory -Path "$location/reports" -Force
```

### Step 4: Update the registry

Find the registry per `reference/registry-discovery.md` (walk up from CWD, fall back to `%LOCALAPPDATA%\query-dashboards\registry.json`). If no registry exists anywhere, ask the user whether to create a project-level registry (`query-dashboards-registry.json` in CWD) or a global one, then start with `{}`.
Add the new entry and write back:

```json
{
  "<name>": "<storageLocation>"
}
```

### Step 5: Write config.json

Create `<storageLocation>/config.json`:

```json
{
  "name": "<name>",
  "description": "<description>",
  "created": "<ISO timestamp>",
  "storageLocation": "<resolved full path>",
  "connection": null,
  "reportConfig": {
    "title": "<report title>",
    "theme": "tufte|colorful",
    "instructions": "<global instructions or empty string>"
  }
}
```

If the user set a connection override, populate `connection`:
```json
{
  "connection": {
    "mcpTool": "<tool name>",
    "database": "<database>"
  }
}
```

### Step 6: Confirm creation

```
✅ Dashboard '<name>' created successfully!

  Location:   <storageLocation>
  Connection: <mcpTool> / <database>  (default | override)
  Queries:    0

Next steps:
  query-add-query <name>     - Add queries to this dashboard
  query-generate-report      - Generate an HTML report
```

---

## query-delete-dashboard


# query-delete-dashboard

## Purpose
Permanently delete a dashboard directory including all queries, configs, and reports. Always requires explicit user confirmation.

## Workflow

### Step 1: Read the registry

Find the registry per `reference/registry-discovery.md` (walk up from CWD, fall back to `%LOCALAPPDATA%\query-dashboards\registry.json`).

If the registry does not exist or is empty:
```
No dashboards found. Nothing to delete.
```
and stop.

### Step 2: Select dashboard

If dashboard name is provided as argument, validate that it exists as a key in the registry object. If it is not found, display:

```
Dashboard '<name>' not found. Available dashboards: <comma-separated list of keys>
```

and stop.

If no argument was provided, list dashboards and ask the user to pick one.

### Step 3: Show full dashboard details before confirming

Read `<storageLocation>/config.json` and list contents:

```powershell
$location = "<storageLocation>"
(Get-ChildItem -Path "$location/queries" -Filter "*.config.json" -ErrorAction SilentlyContinue | Measure-Object).Count
(Get-ChildItem -Path "$location/reports" -Filter "*.html" -ErrorAction SilentlyContinue | Measure-Object).Count
```

Display:
```
⚠️  You are about to permanently delete:

  Dashboard:   excel-startup
  Description: Excel startup performance metrics
  Queries:     4
  Reports:     12 HTML files
  Location:    C:\Users\...\query-dashboards\excel-startup
  Created:     2026-03-10

  This action CANNOT be undone. All queries and reports will be lost.
```

### Step 4: Require confirmation

Ask the user to confirm by typing the dashboard name exactly:
```
Type the dashboard name to confirm deletion:
```

If the input doesn't match exactly, abort:
```
Deletion cancelled. Dashboard '<name>' was not deleted.
```

### Step 5: Delete files

```powershell
Remove-Item -Path "<storageLocation>" -Recurse -Force
```

Verify deletion:
```powershell
Test-Path "<storageLocation>"
```

- If `Test-Path` returns `True` (directory still exists), deletion failed — report the error and stop. Do NOT proceed to Step 6.
- If `Test-Path` returns `False` (directory is gone), deletion succeeded — continue to Step 6.

### Step 6: Update registry

Remove the entry for this dashboard from the registry file that was found in Step 1, then write it back to the same file.

### Step 7: Confirm result

```
🗑️  Dashboard '<name>' deleted.
```

If deletion fails, report the error and do NOT claim success.

### Critical Rules
- NEVER delete without explicit name-match confirmation
- NEVER delete multiple dashboards in one command — one at a time only

---

## query-delete-query


# query-delete-query

## Purpose
Permanently delete a single query's files (content file + config) from a dashboard. Always requires explicit user confirmation.

## Workflow

### Step 1: Select dashboard

If dashboard name is provided as argument, validate it exists in the registry. Otherwise list dashboards and ask user to pick one.

Find the registry per `reference/registry-discovery.md` (walk up from CWD, fall back to `%LOCALAPPDATA%\query-dashboards\registry.json`). If no registry exists:
```
No dashboards found. Nothing to delete.
```
and stop.

If the dashboard name is not a key in the registry:
```
Dashboard '<name>' not found. Available dashboards: <comma-separated list of keys>
```
and stop.

### Step 2: Select query

If query name is provided as argument, validate it exists by checking for `<storageLocation>/queries/<query-name>.config.json`. If not found:
```
Query '<name>' not found in dashboard '<dashboard>'.
Available queries: <comma-separated list of *.config.json basenames without the .config.json suffix>
```
and stop.

If no argument was provided, list all `.config.json` files in `<storageLocation>/queries/` and ask user to pick one.

### Step 3: Show query details before confirming

Read `<storageLocation>/queries/<query-name>.config.json`:

```
⚠️  You are about to permanently delete:

  Dashboard:   <dashboard>
  Query:       <query-name>
  Description: <description>
  File:        <queryFile>
  Viz type:    <visualization.type>
  Thresholds:  <N>

  Files that will be deleted:
    queries/<queryFile>
    queries/<query-name>.config.json

  This action CANNOT be undone.
```

### Step 4: Require confirmation

Ask the user to confirm by typing the query name exactly:
```
Type the query name to confirm deletion:
```

If the input doesn't match exactly, abort:
```
Deletion cancelled. Query '<name>' was not deleted.
```
and stop.

### Step 5: Delete files

```powershell
Remove-Item -Path "<storageLocation>/queries/<queryFile>" -Force
Remove-Item -Path "<storageLocation>/queries/<query-name>.config.json" -Force
```

Verify both files are gone:
```powershell
Test-Path "<storageLocation>/queries/<queryFile>"
Test-Path "<storageLocation>/queries/<query-name>.config.json"
```

If either path still exists, report the error and stop. Do NOT claim success.

### Step 6: Confirm result

```
🗑️  Query '<query-name>' deleted from dashboard '<dashboard>'.

  Deleted:
    queries/<queryFile>
    queries/<query-name>.config.json
```

### Critical Rules
- NEVER delete without explicit name-match confirmation
- NEVER delete the dashboard directory or any other files — only the two query files
- NEVER delete multiple queries in one command — one at a time only

---

## query-edit-query


# query-edit-query

## Purpose
Edit the content and/or configuration of an existing query in a dashboard.

## Workflow

### Step 1: Select dashboard and query

If both are provided as arguments, use them. Otherwise ask user to select.

### Step 2: Read current query files

Find the registry per `reference/registry-discovery.md` (walk up from CWD, fall back to `%LOCALAPPDATA%\query-dashboards\registry.json`) to get the dashboard's `storageLocation`. Read:
- `<storageLocation>/queries/<query>.config.json` — configuration (contains `queryFile` field)
- `<storageLocation>/queries/<queryFile>` — query content (filename from `queryFile` in config)

Also resolve the effective connection following the 4-level algorithm in `reference/connection-resolution.md`.

Display current configuration:
```
Current query: startup-latency
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
<query content>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Connection:   mcp_kusto-wac_execute_query / WacProd  (global default)
Viz type:     time_series
Chart title:  Startup Latency
Instructions: (none)
X axis:       auto
Y axis:       auto
Thresholds:   2 configured
  [0] ResponseTime > 5000  → Critical (#e15759)
  [1] ResponseTime > 3000  → Warning  (#f28e2b)
```

### Step 3: Ask what to edit

Options (user may select multiple):
1. Query content
2. Visualization config (chart type, axes, title, instructions)
3. Connection (MCP tool / database)
4. Thresholds

### Step 4: Collect new values

**If editing query content:**
Ask user to provide the new query content. Show current content as context.

**If editing visualization config:**
Ask about each field, pre-filling with current values:
- Viz type (see `reference/visualization-types.md` for the full list), chart title, instructions, x-axis override, y-axis override

**If editing connection:**
Discover available tools per `reference/mcp-discovery.md` (use `tool_search_tool_regex` with pattern `execute_query`), plus show current value.
Ask for new tool selection and database. User can also clear the override to inherit from dashboard/global.

**If editing thresholds:**
Show the current threshold list numbered. Ask user to pick an action:
- "Add a new threshold"
- "Remove threshold [N]" (one option per existing threshold)
- "Clear all thresholds"

For adding: collect column, operator (`>` `<` `>=` `<=` `==` `!=`), value, label, color. Ask "Add another?" until done.
For removing: delete the selected entry.
For clearing: set `thresholds` to `[]`.

### Step 5: Update files

Write (not edit) the full file with updated content.

For the query file: write new content to the path specified by `queryFile` in the config.
For `.config.json`: merge changes with existing config, write full JSON.

### Step 6: Confirm

```
✅ Query '<name>' updated in dashboard '<dashboard>'

Changes applied:
  - Query content updated
  - Visualization type changed: bar → time_series
  - Threshold added: ResponseTime > 5000 (Critical)

To test changes: query-run-query <dashboard> <name>
```

---

## query-generate-report


# query-generate-report

## Purpose
Execute all queries in a dashboard, build a report-forge section spec from the results, and delegate to `build-html-report` for themed, interactive HTML rendering with Plotly/D3.js charts.

## Dependency
This skill requires the **report-forge** plugin. `build-html-report` must be available.

## Connection Resolution

See `reference/connection-resolution.md` for the full 4-level hierarchy (query → dashboard → project walk-up → global default).

## Workflow

### Step 1: Select dashboard

If provided as argument, use it. Otherwise list dashboards and ask user to select one.

Find the registry per `reference/registry-discovery.md` (walk up from CWD, fall back to `%LOCALAPPDATA%\query-dashboards\registry.json`) to get the dashboard's `storageLocation`. Read `<storageLocation>/config.json`.
Discover queries by listing `<storageLocation>/queries/*.config.json` — each config's `queryFile` field identifies the actual query file.

If no queries exist:
```
Dashboard '<dashboard>' has no queries. Add queries with query-add-query first.
```

### Step 2: Resolve connections

For each query, resolve the effective connection following the 4-level algorithm in `reference/connection-resolution.md`. If no connection is configured at any level, tell the user and ask them to run `query-create-dashboard` or `query-settings` to set a default, then stop.

Verify each resolved MCP tool is available per `reference/mcp-discovery.md` (use `tool_search_tool_regex` with pattern `execute_query`). If a tool is not available, ask user to pick an alternative from the discovered list.

### Step 3: Execute all queries

For each `.config.json` file in `queries/`:
1. Read the config, then read the query content from the path given by `queryFile`
2. Load the resolved MCP tool
3. Execute the query with the resolved database
4. Store results: columns list + rows array

If a query fails, record the error and continue. Failed queries become error narrative sections in the report.

### Step 4: Map each result to a report-forge section spec

For each successful query result, build a section spec for report-forge.

#### 4a. Determine chart_type

If `visualization.type` is not `auto`, use it directly as the report-forge `chart_type` (e.g., `time_series`, `bar`, `pie`, `kpi_card`, `table`, `scatter_brush`, etc.).

If `visualization.type` is `auto`, apply the auto-selection decision tree from `reference/visualization-types.md`.

#### 4b. Determine layout

Use the layout mapping table from `reference/visualization-types.md`.

#### 4c. Build columns mapping

Map query config overrides to report-forge's column contract names:

| chart_type | columns mapping |
|---|---|
| `time_series`, `area`, `stacked_area` | `{x: <xAxis or auto-detected datetime col>, y: <yAxis or auto-detected numeric col>}` |
| `bar`, `horizontal_bar`, `pie` | `{category: <xAxis or string col>, value: <yAxis or numeric col>}` |
| `scatter_brush`, `density_2d` | `{x: <xAxis or first numeric>, y: <yAxis or second numeric>}` |
| `grouped_bar` | `{category: ..., value: ..., variant: ...}` |
| `stacked_bar` | `{x: ..., y: ..., stack: ...}` |
| `kpi_card` | n/a — use `kpi_data` list (see 4e) |
| `table` | `{}` |
| D3 types (treemap, sunburst, sankey, force_graph) | `{}` — data passed as dict structure |

If `visualization.xAxis` is set, use it as the `x`/`category` override.
If `visualization.yAxis` is set, use it as the `y`/`value` override.

#### 4d. Convert thresholds to highlights

For each threshold in the query config `thresholds` array, create a report-forge highlight:

```json
{
  "type": "threshold",
  "axis": "y",
  "value": <threshold.value>,
  "label": "<threshold.label> (<threshold.operator> <threshold.value>)",
  "style": "dashed",
  "sentiment": "negative"
}
```

Collect all threshold highlights into the section's `highlights` array. Threshold reference lines render directly on the chart via report-forge's highlight overlay system.

#### 4e. Handle kpi_card data

For `kpi_card` chart type (1-row results), convert the row into `kpi_data` format before building the section spec:

```python
kpi_data = [
    {"label": col_name, "value": row_value}
    for col_name, row_value in zip(columns, first_row)
    if col_name is numeric
]
```

Include `kpi_data` in the section spec alongside the query text.

#### 4f. Multi-series detection

For `time_series` with narrow format `(Timestamp, MetricName, Value)`: note the `group` column to `build-html-report` so it uses the `group` field for multi-line rendering.

For wide format `(Timestamp, MetricA, MetricB, MetricC)`: note this to `build-html-report` — it will melt the DataFrame into long format during auto-correction.

#### 4g. Breach evaluation (for history logging)

Regardless of highlights, evaluate threshold breaches locally for the execution history record:

For each threshold: count rows where `row[column] <operator> value` is true.
Track worst (most extreme) breaching value per threshold.
Store breach status per query for use in history and the completion summary.

### Step 5: Assemble report spec and invoke build-html-report

Build the top-level report spec:

```python
report_spec = {
    "title": reportConfig.title or dashboard_name,
    "theme": reportConfig.theme,   # "tufte" or "colorful"
    "metadata": {
        "Dashboard": dashboard_name,
        "Generated": "<ISO timestamp>",
        "Queries": f"{n_success}/{n_total} succeeded"
    },
    "sections": [ ...section_specs... ]
}
```

If `reportConfig.instructions` is set, prepend a narrative section:
```python
{
    "title": "Report Notes",
    "layout": "narrative",
    "body": reportConfig.instructions
}
```

For each failed query, append a narrative section:
```python
{
    "title": "<query-name> — Error",
    "layout": "narrative",
    "body": f"Query failed: {error_message}"
}
```

**Invoke `build-html-report`** from report-forge, providing:
- The complete report spec above
- The raw query result data (columns + rows) for each section, so it can construct DataFrames
- Save path instructions: write the final HTML to `<storageLocation>/reports/report-<YYYY-MM-DDTHH-mm-ss>.html` and also overwrite `<storageLocation>/reports/latest.html`

`build-html-report` will handle the full rendering pipeline:
1. Construct DataFrames from the provided result data
2. Validate and auto-correct each data source
3. Generate charts via Plotly/D3.js
4. Apply guardrails and threshold highlight overlays
5. Assemble the themed HTML using `templates/report-shell.html`
6. Post-validate the HTML
7. Save to the specified paths

### Step 6: Write execution history

Append to `<storageLocation>/reports/history.json` (start with `[]` if missing):

```json
{
  "runId": "<YYYY-MM-DDTHH-mm-ss>",
  "timestamp": "<ISO timestamp>",
  "queries": {
    "<query-name-1>": { "status": "success", "rows": 42 },
    "<query-name-2>": { "status": "failed", "error": "<message>" }
  },
  "breaches": ["<queryName>:<thresholdLabel>", ...],
  "reportPath": "reports/report-<timestamp>.html"
}
```

Prepend the new entry (most-recent first). Then read the `maxHistoryEntries` field from the dashboard's `<storageLocation>/config.json` (default: 100 if not set). Trim the array to `maxHistoryEntries` entries before writing back.

### Step 7: Confirm completion

```
✅ Report generated!

  Dashboard:  excel-startup
  Theme:      tufte
  Queries:    3 executed (2 succeeded, 1 failed)
  Report:     <storageLocation>\reports\report-<timestamp>.html
  Latest:     <storageLocation>\reports\latest.html

  Visualizations used:
    startup-latency    → time_series   ⛔ 3 threshold breaches
    error-rates        → bar           ✅ all thresholds OK
    dau                → kpi_card      (no thresholds)

  Failed queries:
    auth-breakdown     → Error: Table 'AuthEvents' not found

Open the HTML file in your browser to view the report.
```

### Error handling

- If ALL queries fail: still invoke build-html-report with error narrative sections only
- If report save fails: ask user to check path permissions
- Truncate very large result sets to first 1000 rows before passing to build-html-report; note truncation in the section description

---

## query-list-dashboards


# query-list-dashboards

## Purpose
Display all dashboards tracked in the registry, regardless of where they are stored.

## Workflow

### Step 1: Read the registry

Find the registry per `reference/registry-discovery.md` (walk up from CWD, fall back to `%LOCALAPPDATA%\query-dashboards\registry.json`). If no registry is found:
```
No dashboards found. Create one with query-create-dashboard.
```
and stop.

The registry is a JSON object mapping dashboard name → storage path:
```json
{
  "excel-startup": "C:\\Users\\...\\AppData\\Local\\query-dashboards\\excel-startup",
  "auth-telemetry": "D:\\my-dashboards\\auth-telemetry"
}
```

### Step 2: Read each dashboard

For each entry in the registry, read its `config.json`:

```powershell
Get-Content "<storageLocation>/config.json" -ErrorAction SilentlyContinue
```

Count queries by counting `.config.json` files (one per query, regardless of query file extension):

```powershell
(Get-ChildItem "<storageLocation>/queries" -Filter "*.config.json" -ErrorAction SilentlyContinue | Measure-Object).Count
```

Read the last-run timestamp from `<storageLocation>/reports/history.json` (if it exists). History is stored most-recent-first, so take the `timestamp` field of the first entry. If the file doesn't exist or is empty, show `(never)`.

If the directory or `config.json` is missing (dashboard was moved/deleted externally), mark it as `[missing]`.

### Step 3: Display results

```
Dashboards (registry: <resolved registry path>)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  NAME                    QUERIES  LAST RUN              LOCATION       DESCRIPTION
  excel-startup           3        2026-04-20 14:32      (default)      Excel startup performance metrics
  auth-telemetry          5        (never)               D:\my-dash...  Authentication success/failure rates
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total: 2 dashboard(s)
```

- Show `(default)` in LOCATION if path is under `$env:LOCALAPPDATA\query-dashboards\`
- Show the full path if it's a custom location
- Show `(never)` in LAST RUN if no history exists
- Show `[missing]` in DESCRIPTION if the dashboard directory no longer exists
- If a dashboard shows `[missing]`, suggest running `query-delete-dashboard` to clean up the stale registry entry

### Notes
- Always use the registry — do NOT fall back to directory scanning
- Dashboards not in the registry are untracked

---

## query-list-queries


# query-list-queries

## Purpose
List all queries stored in a dashboard with their connection and visualization configuration.

## Workflow

### Step 1: Select dashboard

If dashboard name is provided as argument, use it. Otherwise list dashboards and ask user to pick one.

### Step 2: Read query files

Find the registry per `reference/registry-discovery.md` (walk up from CWD, fall back to `%LOCALAPPDATA%\query-dashboards\registry.json`) to get the dashboard's storage location. Discover queries by reading all `.config.json` files in the queries directory — the `queryFile` field in each config identifies the actual query file:

```powershell
$location = "<storageLocation>"
Get-ChildItem -Path "$location/queries" -Filter "*.config.json" | Select-Object BaseName
```

For each `.config.json`, read it to get `name`, `description`, `queryFile`, and connection/visualization metadata.

Also read the dashboard's effective connection following the 4-level resolution in `reference/connection-resolution.md` (query → dashboard → project walk-up → global). If no connection is configured at any level, display `(not configured)` — do not stop or fail.

### Step 3: Display queries

```
Queries in 'excel-startup'  (default connection: mcp_kusto-wac_execute_query / WacProd)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 startup-latency  [startup-latency.<ext>]
   Description: P50/P95 startup latency by platform
   Database:    ExcelTelemetry  (override)
   Viz Type:    time_series
   Thresholds:  2

📊 session-counts  [session-counts.<ext>]
   Description: Daily session counts
   Database:    WacProd  (default)
   Viz Type:    bar
   Thresholds:  0

📋 error-breakdown  [error-breakdown.<ext>]
   Description: Error types by category
   Database:    WacProd  (default)
   Viz Type:    table
   Thresholds:  0

Total: 3 queries
```

> The bracketed value (e.g. `[startup-latency.<ext>]`) is the actual `queryFile` from each query's config. The extension will reflect whatever was used when the query was added (`.kql`, `.sql`, etc.).

- Show `(override)` when a query or dashboard has a custom connection
- Show `(default)` when using the global default

### Step 4: Show next steps

```
Commands:
  query-add-query <dashboard>             - Add a new query
  query-run-query <dashboard> <query>     - Run a single query
  query-generate-report <dashboard>       - Generate HTML report
```

---

## query-move-dashboard


# query-move-dashboard

## Purpose
Safely move a dashboard's files to a new location and update the registry and config to reflect the new path. Only moves the specific dashboard directory — no other files are affected.

## Workflow

### Step 1: Read the registry

Find the registry per `reference/registry-discovery.md` (walk up from CWD, fall back to `%LOCALAPPDATA%\query-dashboards\registry.json`).

If the registry doesn't exist or is empty:
```
No dashboards found. Nothing to move.
```
and stop.

### Step 2: Select dashboard

If provided as argument, validate the argument against the registry keys. If the argument is not a key in the registry object:
```
Dashboard '<name>' not found. Available dashboards: <comma-separated list of keys>
```
and stop.

If no argument was provided, list dashboards and ask user to pick one. Show name, current location, and query count for each.

### Step 3: Ask for new location

```
Where should '<dashboard-name>' be moved to?
Current location: <storageLocation>

Enter the full path for the new location (the dashboard folder will be created there).
Example: D:\my-dashboards\<dashboard-name>
```

Validate:
- New path must not already exist (to avoid overwriting)
- New path must not be the same as the current path

If new path already exists:
```
❌ Path already exists: <new-path>
Choose a different destination or delete the existing directory first.
```
and stop.

### Step 4: Show move manifest

List what will be moved:

```powershell
Get-ChildItem "<storageLocation>" -ErrorAction SilentlyContinue
Get-ChildItem "<storageLocation>/queries" -ErrorAction SilentlyContinue
Get-ChildItem "<storageLocation>/reports" -ErrorAction SilentlyContinue
```

Display the actual files returned by the directory listing:
```
Files to move from: <storageLocation>
  config.json
  queries/
    <query-name>.<ext>
    <query-name>.config.json
    ...
  reports/
    report-<timestamp>.html
    latest.html
    ...
```

### Step 5: Confirm move

```
Ready to move dashboard '<name>'.

  From: <storageLocation>
  To:   <new-path>

  Queries: <N>  (<N×2> files: one query file + one config per query)
  Reports: <M> HTML files

This will ONLY move the dashboard directory above. No other files will be affected.

Confirm? (yes / cancel)
```

Note: N is the count of `*.config.json` files in the queries/ directory from the Step 4 listing (each query has 2 files: one content file + one config); M is the count of `*.html` files in the reports/ directory from the Step 4 listing.

If cancelled:
```
Move cancelled. Dashboard '<name>' was not moved.
```
and stop.

### Step 6: Execute the move

Create parent directory if needed:
```powershell
New-Item -ItemType Directory -Force -Path "<parent-of-new-path>"
```

Move the dashboard directory:
```powershell
Move-Item -Path "<storageLocation>" -Destination "<new-path>"
```

### Step 7: Verify the move succeeded

```powershell
Test-Path "<new-path>/config.json"
Test-Path "<storageLocation>"
```

If destination is missing or source still exists, report the error and do NOT update the registry:
```
❌ Move failed. Registry was not updated.
Source: <storageLocation>
Destination: <new-path>
Error: <details>
```
and stop.

### Step 8: Update config.json

Read `<new-path>/config.json`, update the `storageLocation` field to `<new-path>`, write it back. Leave all other fields unchanged.

### Step 9: Update registry.json

Update the value for this dashboard's key to `<new-path>` in the registry file found in Step 1, then write it back to the same file.

### Step 10: Confirm success

```
✅ Dashboard '<name>' moved successfully.

  From: <old-path>
  To:   <new-path>

  Registry and config.json updated.
```

### Critical Rules
- NEVER move the parent directory of `storageLocation` — only the dashboard directory itself
- NEVER update the registry until the move is verified to have succeeded
- NEVER delete the source if the destination doesn't exist

---

## query-run-query


# query-run-query

## Purpose
Run a single stored query against its configured data source and display results inline.

## Connection Resolution

See `reference/connection-resolution.md` for the full 4-level hierarchy (query → dashboard → project walk-up → global default).

## Workflow

### Step 1: Select dashboard and query

If both are provided as arguments, use them directly. Otherwise:
1. List dashboards and ask user to pick one
2. List queries in that dashboard and ask user to pick one

### Step 2: Read query files

Find the registry per `reference/registry-discovery.md` (walk up from CWD, fall back to `%LOCALAPPDATA%\query-dashboards\registry.json`) to get the dashboard's storage location, then read:
- `<location>/queries/<query>.config.json` — configuration (contains `queryFile` field)
- `<location>/queries/<queryFile>` — the query content (filename from `queryFile` in config)

### Step 3: Resolve connection

Follow the 4-level algorithm in `reference/connection-resolution.md`. If no connection is configured at any level, tell the user and ask them to run `query-create-dashboard` or `query-settings` to set one up, then stop.

### Step 4: Execute the query

Load the resolved MCP tool per `reference/mcp-discovery.md`, then call it with:
- `database`: resolved database name
- `query`: content from the file identified by `queryFile` in the config

### Step 5: Display results

```
Running query: startup-latency
Tool:          mcp_kusto-wac_execute_query  (global default)
Database:      WacProd
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Results: 45 rows

| Timestamp           | P50_ms | P95_ms | Platform  |
|---------------------|--------|--------|-----------|
| 2026-03-01 00:00:00 | 1245   | 3200   | Win32     |
| 2026-03-01 00:00:00 | 1180   | 2900   | Win ARM   |
| ...                 |        |        |           |

(showing first 20 rows)
```

If result set is large (>20 rows), display first 20 and note total count.
If query returns 0 rows, say: "Query returned 0 rows."
If query fails, show the error message clearly.

### Threshold check

If thresholds are defined in the query config, evaluate each one:
- Count rows where the condition is true
- Find the worst (most extreme) breaching value

Display threshold summary:
```
Threshold Check:
  ⚠️  WARNING   ResponseTime > 3000 — 12 rows breach (worst: 4850)
  ✅  OK        ResponseTime > 5000 — 0 rows breach
```

### Step 6: Show next steps

```
Commands:
  query-generate-report <dashboard>  - Generate full HTML report
  query-edit-query <dashboard> <query> - Edit this query
```

---

## query-settings


# query-settings

## Purpose
View and optionally update the global default connection stored in `%LOCALAPPDATA%\query-dashboards\config.json`. This default is used by all dashboards that do not have a connection override.

> **Note**: This skill manages the *global* default connection (`%LOCALAPPDATA%\query-dashboards\config.json`). A project-level override (`query-dashboards.json` in your project directory) takes precedence over the global default — see `reference/connection-resolution.md`. To set up a project-level config, create `query-dashboards.json` manually or via `query-create-dashboard`.

## Workflow

### Step 1: Read all connection configs

**Project-level:** Walk up from the current working directory searching for `query-dashboards.json` (same walk-up logic as `reference/connection-resolution.md`). Note the path if found.

**Global:** Read `$env:LOCALAPPDATA/query-dashboards/config.json`. Note if missing.

### Step 2: Display the full effective connection hierarchy

Always show both levels so the user understands which one is actually in effect:

```
Connection configuration
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Project-level  (<path to query-dashboards.json>)
  MCP Tool:  <mcpTool>        ← ACTIVE (overrides global)
  Database:  <database>

Global default  (%LOCALAPPDATA%\query-dashboards\config.json)
  MCP Tool:  <mcpTool>
  Database:  <database>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Omit the project-level section if no `query-dashboards.json` was found. Mark whichever level is active with `← ACTIVE`. If only the global exists, label it `← ACTIVE` too.

If neither file exists, tell the user:
```
No connection configured.

Run query-create-dashboard first — it will set up the default connection during dashboard creation.
```
Then stop.

### Step 3: Ask whether to update

Ask the user:

```
Which connection would you like to update?
  [1] Global default  (%LOCALAPPDATA%\query-dashboards\config.json)
  [2] Project-level   (<path to query-dashboards.json, or "not configured">)
  [0] Cancel
```

If the user picks a project-level option but no `query-dashboards.json` was found, ask whether to create one in the current working directory. If the user declines, stop.

If the user cancels, stop here.

### Step 4: Discover available MCP tools

Discover available MCP tools per `reference/mcp-discovery.md` (use `tool_search_tool_regex` with pattern `execute_query`).

Present the discovered tools as a numbered list:

```
Available MCP tools:
  [1] mcp_kusto-wac_execute_query
  [2] mcp_kusto-excelonline_execute_query
  [3] mcp_sqlite_execute_query
  ...
  [N] Enter manually
```

Ask the user to pick a number or enter a tool name manually. Pre-fill with the current value of the chosen config level as a suggestion.

### Step 5: Ask for new database name

Ask:

```
Enter the default database name:
```

Pre-fill with the current database value of the chosen config level as a suggestion.

### Step 6: Write updated config

**If updating global:** Read `$env:LOCALAPPDATA/query-dashboards/config.json` (create with `{}` if missing), update (or set) the `defaultConnection` field, write the full merged object back.

**If updating project-level:** Read the discovered `query-dashboards.json` (or start with `{}` if creating new), update (or set) the `defaultConnection` field, write back to that same path.

The `defaultConnection` structure:

```json
{
  "defaultConnection": {
    "mcpTool": "<new mcpTool>",
    "database": "<new database>"
  }
}
```

### Step 7: Confirm

```
✅ <Global default | Project-level> connection updated

  File:      <path written>
  MCP Tool:  <new mcpTool>
  Database:  <new database>

  Effective connection: <whichever level now wins>
```

If a project-level config exists and the user updated the global, note:
```
  Note: The project-level config in <path> still takes precedence over this global default.
```


