# Architecture Threat Modeling Reference

Distilled from ArchiPilot (agency-microsoft/playground). Reference material for architecture planning and security review phases.

This is a **knowledge package** -- consult it during architecture planning or security reviews, not daily work.

---

## convert-tm7


# Convert TM7

Convert a Microsoft Threat Modeling Tool (.tm7) file to C4/Structurizr DSL. This skill parses the TM7 XML format, detects architectural elements, data flows, trust boundaries, and threats, then generates a Structurizr DSL workspace that can be visualized in Structurizr Lite or the ArchiPilot dashboard.

## Scope

- **Does**: Convert a single TM7 file to Structurizr DSL format. Optionally generate JSON reports with `--reports` flag.
- **Does NOT**: Merge multiple TM7 files, fetch from ADO, or run the full pipeline.

## Output Format

Present results using this structure:

```
## TM7 Conversion Results

✅ Converted: model.tm7 → output.dsl

### Extraction Summary
| Category      | Count |
|--------------|-------|
| Elements      | 15    |
| Data Flows    | 22    |
| Trust Boundaries | 3  |
| Threats       | 18    |

### Element Types
| Type               | Count | Examples                    |
|--------------------|-------|-----------------------------|
| Process            | 8     | API Gateway, Auth Service   |
| DataStore          | 4     | User DB, Config Store       |
| ExternalInteractor | 3     | External User, Partner API  |

Output: output.dsl (Structurizr DSL format)
```

## Workflow

1. **Validate input**: Check .tm7 file exists and is valid XML
2. **Parse TM7**: Extract elements, flows, trust boundaries, threats from XML
3. **Generate C4 model**: Map TM7 elements to C4 containers/systems/persons
4. **Export DSL**: Write Structurizr DSL to output file (or stdout)
5. **Optionally generate reports**: If `--reports` flag is set, generate JSON reports alongside DSL
6. **Report results**: Show element/flow/boundary/threat counts extracted

## Prerequisites

- A `.tm7` file from Microsoft Threat Modeling Tool
- Python 3.12+ with `archipilot` installed (`uv pip install archipilot`)
- No Azure CLI required (this is local file conversion only)

## Steps

### Step 1: Convert using the CLI

```bash
# Convert to a file
uv run archipilot convert path/to/model.tm7 -o output.dsl

# Convert to stdout
uv run archipilot convert path/to/model.tm7

# Customize the system name
uv run archipilot convert path/to/model.tm7 -o output.dsl --system-name "My Application"

# Omit styles section (useful for merging into existing workspaces)
uv run archipilot convert path/to/model.tm7 -o output.dsl --no-styles

# Also generate JSON reports alongside DSL
uv run archipilot convert path/to/model.tm7 -o output.dsl --reports
```

### Step 2 (optional): Analyze the converted model

After conversion, run analysis on the TM7 file:

```bash
uv run archipilot agent tm7-analysis --path path/to/model.tm7
```

### Alternative: Python API

```python
from pathlib import Path
from returns.result import Failure

from archipilot.pipeline.tm7_parser import parse_tm7
from archipilot.pipeline.c4_generator import convert_to_c4
from archipilot.pipeline.dsl_export import export_dsl

# Parse TM7 XML
parse_result = parse_tm7(Path("model.tm7"))
if isinstance(parse_result, Failure):
    print(f"Parse error: {parse_result.failure()}")
else:
    threat_model = parse_result.unwrap()

    # Convert to C4 model
    c4_result = convert_to_c4(threat_model, system_name="My System")
    if isinstance(c4_result, Failure):
        print(f"Conversion error: {c4_result.failure()}")
    else:
        c4_model = c4_result.unwrap()

        # Export to Structurizr DSL
        dsl = export_dsl(c4_model, include_styles=True)
        Path("output.dsl").write_text(dsl, encoding="utf-8")
        print(f"Exported {len(dsl)} characters to output.dsl")
```

## How to Interpret the Output

The generated Structurizr DSL file contains:

- **workspace**: Top-level container with name and description
- **model**: Architectural elements
  - `softwareSystem`: Top-level system boundary
  - `container`: Individual services, databases, queues, etc.
  - `component`: Sub-components within containers
  - `person`: External actors or users
  - Relationships (`->`) between elements with descriptions and technology annotations
- **views**: Pre-configured diagram views
  - `systemContext`: High-level system context view
  - `container`: Container-level view showing services
- **styles**: Visual styling for element types

### What gets extracted from a TM7 file:

| TM7 Concept | C4 Mapping |
|-------------|-----------|
| Process | Container or Component |
| External Entity | Person or External SoftwareSystem |
| Data Store | Container (database) |
| Data Flow | Relationship with description |
| Trust Boundary | Group or boundary annotation |
| Threat | Preserved in metadata for report generation |

### Common issues:

1. **Generic element names**: TM7 files sometimes have names like "Process" or "Data Store" -- use `--system-name` to provide context.
2. **Missing technologies**: Technology detection adds annotations, but TM7 files may not have explicit technology info.
3. **Duplicate elements**: If the same element appears in multiple TM7 files, use the pipeline with `--merge` to deduplicate.

## Example Walkthrough

**User asks**: "Convert this TM7 file to our format"

**Agent does**:
1. Validates the TM7 XML structure and checks for well-formedness
2. Extracts elements, data flows, trust boundaries, and threats from the TM7 schema
3. Maps TM7 constructs to C4 model equivalents and writes the output file

**Agent produces**:
```
📄 TM7 Conversion Summary
═══════════════════════════

Source: auth-service-threat-model.tm7
Validation: ✅ Well-formed XML, valid TM7 schema

Extracted:
┌─────────────────┬───────┐
│ Category        │ Count │
├─────────────────┼───────┤
│ Elements        │    15 │
│ Data Flows      │    22 │
│ Trust Boundaries│     3 │
│ Threats (STRIDE)│    18 │
└─────────────────┴───────┘

Threat Breakdown:
  • Spoofing: 4
  • Tampering: 3
  • Repudiation: 2
  • Info Disclosure: 4
  • Denial of Service: 2
  • Elevation of Privilege: 3

Output: ./output/auth-service-threat-model.c4.json ✅
```

## Example Questions This Skill Answers

- "Convert this TM7 file to a C4 diagram."
- "Generate Structurizr DSL from my threat model."
- "What elements are in this TM7 file?"
- "Parse this threat model and show me the architecture."
- "Create a C4 container diagram from my TM7."
- "How many elements and flows does this threat model contain?"

## Dashboard Link

After conversion, launch the dashboard with: `cd dashboard && npm start`
Dashboard URL: `http://localhost:8090/`

## See Also

- **Global rules**: `instructions/archipilot.instructions.md`
- **Reference**: `shared/c4-model-reference.md`
- **Next steps**: `analyze-threats`, `show-dependencies`

## Error Handling

| Scenario | Action |
|----------|--------|
| TM7 file not found | Verify the file path exists and is accessible |
| Invalid XML in TM7 file | Ensure the file is a valid Microsoft Threat Modeling Tool export (not corrupted or truncated) |
| Unsupported TMT version | ArchiPilot supports TMT 2016+ format; older versions may require manual conversion |
| Empty model (0 elements) | The TM7 file contains no elements — open it in TMT and add at least one process, data store, or external entity |

---

## model-analysis


# Model Analysis

Consolidated model analysis skill that replaces 4 individual skills: `analyze-c4-model`, `analyze-domain`, `analyze-data-classification`, and `analyze-hub`. Each former skill maps to a `--focus` parameter, and `--depth` controls how many sub-analyses run.

## Focus Modes

| Focus | Was | What It Does |
|-------|-----|-------------|
| `c4` | `analyze-c4-model` | Element type distribution, relationship density, group structure, technology diversity, naming quality |
| `domain` | `analyze-domain` | DDD patterns -- bounded contexts, coupling matrix, aggregates, ubiquitous language, domain events |
| `classification` | `analyze-data-classification` | PII, credentials, financial, and health data flowing through components and across boundaries |
| `hub` | `analyze-hub` | Hub node role, conditional routing rules, per-service layer breakdown, bottleneck assessment |

If no `--focus` is specified, the depth mode determines which sub-analyses run.

## Depth Routing

| Depth | Sub-Analyses Run | When to Use |
|-------|-----------------|-------------|
| **quick** | `c4` only | Quick architecture overview |
| **standard** | `c4` + `domain` + `classification` | Default -- model structure plus DDD and data sensitivity |
| **deep** | All 4: `c4` + `domain` + `classification` + `hub` | Full model investigation with hub bottleneck analysis |

When `--focus` is specified, only that sub-analysis runs regardless of depth. Depth still controls the detail level (e.g., `--focus domain --depth deep` includes coupling matrix, aggregates, language, and events).

## Scope

- **Does**: Analyze architecture model structure, DDD patterns, data sensitivity, and hub topology
- **Does NOT**: Modify the C4 model, prescribe domain changes, or create new data classifications

## Output Format

### Quick (c4 only)
```
## C4 Model Summary

### Element Distribution
| Type            | Count | Percentage |
|-----------------|-------|-----------|
| Container       | 18    | 58%       |
| SoftwareSystem  | 8     | 26%       |
| Person          | 5     | 16%       |

### Relationship Density
| Metric              | Value |
|---------------------|-------|
| Total relationships | 42    |
| Avg per element     | 2.7   |
| Orphan elements     | 2     |
```

### Standard (c4 + domain + classification)
Quick output plus:
```
### Bounded Contexts
| Context           | Elements | External Dependencies |
|-------------------|----------|-----------------------|
| Authentication    | 5        | 2                     |
| Data Platform     | 8        | 3                     |

### Data Classification
| Category     | Components | Severity |
|-------------|-----------|----------|
| Credentials  | 3         | High     |
| PII          | 6         | Medium   |
```

### Deep (all 4 sub-analyses)
Standard output plus hub analysis with routing rules and bottleneck assessment.

## Workflow

### Focus: c4
1. Load `dependency-graph.json` from pipeline output
2. Analyze elements by type (Container, SoftwareSystem, Person), identify groups
3. Analyze relationships: count, density, fan-in/fan-out
4. Check structure: orphans, ungrouped elements, naming inconsistencies
5. Present element distribution, relationship density, group coverage

### Focus: domain
1. Load `dependency-graph.json` and `trust-boundary.json`
2. Extract bounded contexts from trust boundaries and groups
3. Compute context-to-context coupling matrix
4. Identify aggregates (high fan-in elements)
5. Extract ubiquitous language terms from element names

### Focus: classification
1. Load `data-classification.json` and optionally `dependency-graph.json`
2. Filter by data type (PII, credentials, financial, health) or element if specified
3. Map classifications to elements and flows
4. Cross-reference boundaries for sensitive data crossing without encryption
5. Present classification summary with severity indicators

### Focus: hub
1. Load `flow-sequence.json`, extract hub analysis and conditional connections
2. Fuzzy match hub name; show available hubs if not found
3. Gather metrics: in-degree, out-degree, service count, encryption/auth rates
4. Layer breakdown: conditional vs unconditional fan-out, reduction factor
5. Routing rules: per-service rules with confidence and basis
6. Bottleneck assessment with risk factors

## Prerequisites

- Pipeline output must exist at `pipeline-output/reports/` with relevant JSON files
- For `hub` focus, a merged pipeline run with multiple models is required
- For `domain` focus, `trust-boundary.json` enhances the analysis
- Python 3.12+ with `archipilot` installed

## Steps

### Option A: MCP Tool Calls

| Focus | MCP Tool |
|-------|----------|
| `c4` | `analyze_c4_model` |
| `domain` | `analyze_domain` |
| `classification` | `analyze_data_classification` |
| `hub` | `analyze_hub` |

For standard/deep depth, call multiple tools in parallel and correlate results.

### Option B: Python API

```python
import json
from pathlib import Path
from archipilot.autogen_tools import (
    init_store, analyze_c4_landscape, analyze_domain_model,
    query_data_classification,
)
from archipilot.mcp_server import handle_tool_call

init_store(Path("pipeline-output/reports"))

# Quick: C4 only
c4 = json.loads(analyze_c4_landscape())

# Standard: c4 + domain + classification
domain = json.loads(analyze_domain_model())
classification = json.loads(query_data_classification())

# Deep: add hub
hub = handle_tool_call("analyze_hub", {"node": "Azure AD", "detail": "full"}, report_dir=Path("pipeline-output/reports"))
```

## Example Questions This Skill Answers

- "Show me the C4 model structure" (--focus c4)
- "What are the bounded contexts?" (--focus domain)
- "Where does PII flow?" (--focus classification)
- "Is Azure AD a bottleneck?" (--focus hub)
- "Analyze the architecture model" (standard depth)
- "Deep model investigation" (deep depth -- all 4)
- "Quick architecture overview" (quick depth -- c4 only)

## Dashboard Links

- C4 model: `http://localhost:8090/#c4model/landscape`
- Domain: `http://localhost:8090/#domain/contextmap`
- Classification: `http://localhost:8090/#governance?card=classification-card`
- Hub analysis: `http://localhost:8090/#flows`

## See Also

- **Global rules**: `instructions/archipilot.instructions.md`
- **Domain rules**: `instructions/architecture-domain.instructions.md`
- **Reference**: `shared/c4-model-reference.md`
- **Next steps**: `flow-analysis`, `security-analysis`, `governance-check`

## Error Handling

| Scenario | Action |
|----------|--------|
| Report files not found | Direct user to run `setup` then `run-pipeline` first |
| Model has 0 elements | Pipeline ran but produced no elements -- check TM7 files |
| No groups or boundaries for domain analysis | DDD extraction limited -- results show single implicit context |
| Hub node not found | List available hub names for user to choose |
| No hub analysis data | Requires multiple models with shared nodes |
| No data classifications tagged | Classifications are inferred from element names -- may have no matches |

---

## security-analysis


# Security Analysis

Consolidated security analysis skill that replaces 6 individual skills: `analyze-threats`, `threat-heatmap`, `attack-surface`, `find-security-gaps`, `security-posture`, and `attack-path-analysis`. Each former skill maps to a `--focus` parameter, and `--depth` controls how many sub-analyses run.

## Focus Modes

| Focus | Was | What It Does |
|-------|-----|-------------|
| `threats` | `analyze-threats` | STRIDE distribution, mitigation rates, hotspot elements, prioritization |
| `heatmap` | `threat-heatmap` | Elements ranked by threat density, STRIDE per-element breakdown, priority scores |
| `surface` | `attack-surface` | Entry points, sensitive components, credential stores, external-facing elements |
| `gaps` | `find-security-gaps` | Materialized security gap traces from flow graph, ranked hotspot edges |
| `posture` | `security-posture` | Encryption coverage, authentication status, insecure flows, mitigation rates |
| `paths` | `attack-path-analysis` | Attack path enumeration from entry points to sensitive targets, risk scoring |

If no `--focus` is specified, the depth mode determines which sub-analyses run.

## Depth Routing

| Depth | Sub-Analyses Run | When to Use |
|-------|-----------------|-------------|
| **quick** | `posture` only | Executive briefing, triage, "give me a quick security check" |
| **standard** | `threats` + `posture` + `surface` | Default -- comprehensive security overview |
| **deep** | All 6: `threats` + `heatmap` + `surface` + `gaps` + `posture` + `paths` | Full investigation, compliance audit, "tell me everything about security" |

When `--focus` is specified, only that sub-analysis runs regardless of depth. Depth still controls the detail level within that sub-analysis (e.g., `--focus threats --depth deep` shows per-element breakdowns and cross-report correlations).

## Scope

- **Does**: Query and correlate security reports (threat-analysis, threat-mapping, attack-surface, flow-sequence, security-posture, authentication-coverage, dependency-graph)
- **Does NOT**: Modify threat models, create work items (use `ado-work-items` or `github-issue-from-threats`), or check governance thresholds (use `governance-check`)

## Output Format

Present results using the appropriate format for the active focus:

### Quick (posture only)
```
## Security Posture Summary
| Metric              | Value | Status |
|---------------------|-------|--------|
| Encryption rate     | 85%   | Green  |
| Authentication rate | 68%   | Yellow |
| Mitigation rate     | 72%   | Yellow |
| Insecure flows      | 6     | Yellow |
```

### Standard (threats + posture + surface)
```
## Security Analysis

### Threat Summary
| STRIDE Category        | Count | Mitigated | Rate  |
|------------------------|-------|-----------|-------|
| Spoofing               | 8     | 5         | 63%   |
| Elevation of Privilege | 5     | 2         | 40%   |

### Security Posture
| Metric              | Value | Status |
|---------------------|-------|--------|
| Encryption rate     | 85%   | Green  |
| Authentication rate | 68%   | Yellow |

### Attack Surface
| Entry Point      | Authenticated | Threats |
|------------------|---------------|---------|
| Public API       | Yes (OAuth)   | 5       |
| WebSocket        | No            | 3       |

### Recommendations
1. Elevation of Privilege at 40% -- schedule remediation sprint
2. WebSocket entry point unauthenticated -- run with --focus paths for exploitable paths
```

### Deep (all 6 sub-analyses)
All sections from Standard, plus:
- Threat heatmap with per-element STRIDE breakdown
- Security gap traces with hotspot edges
- Top attack paths with risk scores
- Cross-report correlation (e.g., hotspot elements that also appear in gap traces)

## Workflow

### Focus: threats
1. Load `threat-analysis.json` from pipeline output
2. Apply filters (STRIDE category, state, service) if specified
3. Compute mitigation rate, STRIDE distribution, state distribution
4. Identify hotspot elements with 5+ threats; rank by count
5. Present summary table, hotspot list, recommendations
6. Suggest: `--focus paths` for hotspots, `governance-check --focus gates` for low mitigation

### Focus: heatmap
1. Load `threat-analysis.json` and `threat-mapping.json`
2. Aggregate threats per element with STRIDE breakdown
3. Score priority combining threat count, severity, and diversity
4. Rank elements by threat count; mark hotspots (5+ threats)
5. Present ranked heatmap table with STRIDE columns

### Focus: surface
1. Load `attack-surface.json` from pipeline output
2. Extract entry points (external-facing, technology, auth status)
3. Extract sensitive components (credential stores, PII hosts)
4. Cross-reference threats per entry point from `threat-mapping.json`
5. Present entry points, sensitive components, summary

### Focus: gaps
1. Load `flow-sequence.json`, extract `securityGapTraces` and `gapStatistics`
2. Apply filters (severity, gap type, service)
3. Rank gap edges by affected trace count
4. Present statistics, hotspot edges, sample traces
5. Push highlight commands to dashboard via WebSocket

### Focus: posture
1. Load `security-posture.json` and `authentication-coverage.json`
2. Compute encryption rate, authentication rate, insecure flow list
3. Check boundary crossings for unencrypted flows
4. Present metrics, insecure flows, recommendations

### Focus: paths
1. Load `dependency-graph.json`, `threat-analysis.json`, `attack-surface.json`
2. Identify entry points and sensitive targets
3. Enumerate paths from entry points to targets (up to max hops)
4. Score paths by unmitigated threats, unencrypted edges, boundary crossings
5. Rank and present top paths with risk scores

## Prerequisites

- Pipeline output must exist at `pipeline-output/reports/` with relevant JSON files
- For `gaps` and some `paths` features, a merged pipeline run is required
- Python 3.12+ with `archipilot` installed

## Steps

### Option A: MCP Tool Calls

Call the appropriate MCP tool based on focus:

| Focus | MCP Tool |
|-------|----------|
| `threats` | `analyze_threats` |
| `heatmap` | `threat_heatmap` |
| `surface` | `attack_surface` |
| `gaps` | `find_security_gaps` |
| `posture` | `security_posture` |
| `paths` | `attack_path_analysis` |

For standard/deep depth, call multiple tools in parallel and correlate results.

### Option B: Python API

```python
import json
from pathlib import Path
from archipilot.autogen_tools import (
    init_store, query_threats, query_attack_surface,
    query_security_posture, query_authentication,
    analyze_attack_paths,
)
from archipilot.mcp_server import handle_tool_call

init_store(Path("pipeline-output/reports"))

# Quick: posture only
posture = json.loads(query_security_posture(detail="summary"))

# Standard: threats + posture + surface
threats = json.loads(query_threats())
surface = json.loads(query_attack_surface())

# Deep: add gaps + paths
gaps = handle_tool_call("find_security_gaps", {"severity": "all"}, report_dir=Path("pipeline-output/reports"))
paths = json.loads(analyze_attack_paths())
```

## Example Questions This Skill Answers

- "Run a security analysis" (standard depth)
- "Quick security check" (quick depth -- posture only)
- "Deep security analysis of our architecture" (deep depth -- all 6)
- "What are the biggest threats?" (--focus threats)
- "Show threat hotspots" (--focus heatmap)
- "What are the entry points?" (--focus surface)
- "Where are the security gaps?" (--focus gaps)
- "What's our encryption rate?" (--focus posture)
- "Show attack paths to the database" (--focus paths)

## Dashboard Link

View in dashboard: `http://localhost:8090/#security`

## See Also

- **Global rules**: `instructions/archipilot.instructions.md`
- **Domain rules**: `instructions/security-domain.instructions.md`
- **Reference**: `shared/stride-reference.md`
- **Next steps**: `governance-check`, `trace-blast-radius`, `github-issue-from-threats`

## Error Handling

| Scenario | Action |
|----------|--------|
| Report files not found | Direct user to run `setup` then `run-pipeline` first |
| Report has 0 threats | Valid data -- report this fact, not an error |
| Flow graph missing for gaps/paths | Run pipeline with `--merge` flag |
| Entry point not found | Use fuzzy matching; list available nodes if no match |
| Very large threat count (>500) | Summarize by category first, offer drill-down |

---

## trust-boundaries


# Trust Boundaries

Analyze trust boundaries extracted from threat models. This skill shows which architectural elements reside inside each security zone, what data flows cross trust boundaries, and where boundary coverage gaps exist. Trust boundaries are critical for understanding the security perimeter and identifying flows that require additional controls at zone transitions.

## Scope

- **Does**: Analyze trust boundary containment and cross-boundary flows.
- **Does NOT**: Modify trust boundaries or create new security zones.

## Output Format

Present results using this structure:

```
## Trust Boundaries

| Boundary         | Type    | Elements | Crossing Flows |
|-----------------|---------|----------|----------------|
| Internal Network | Network | 12       | 8              |
| DMZ              | Network | 3        | 5              |
| Cloud Services   | Cloud   | 6        | 4              |

## Boundary Crossings (requiring encryption)
| Flow                        | Encrypted | Authenticated |
|----------------------------|-----------|---------------|
| External → DMZ: API Gateway | ✅ TLS     | ✅ OAuth       |
| DMZ → Internal: Database    | ❌ None    | ✅ mTLS        |
```

## Workflow

1. **Load report**: Read `trust-boundary.json` from pipeline output
2. **Filter by boundary**: If user specified a boundary name, filter to that boundary
3. **Map containment**: Show which elements are inside each boundary
4. **Identify crossings**: List all flows that cross trust boundaries
5. **Check security**: Verify crossing flows have encryption and authentication
6. **Present findings**: Show boundary table, crossing flows, and security gaps using Output Format
7. **Flag risks**: Highlight unencrypted or unauthenticated boundary crossings

## Prerequisites

- Pipeline output must exist at `pipeline-output/reports/trust-boundary.json`
- If no report exists, run the pipeline first: `uv run archipilot pipeline --csv <services.csv> --merge`
- Python 3.12+ with `archipilot` installed (`uv pip install archipilot`)

## Steps

### Option A: CLI Agent Command

Run the boundary analysis agent:

```bash
uv run archipilot agent boundary-analysis --path pipeline-output
```

This prints trust boundary coverage, cross-boundary flows, elements per zone, and gap suggestions.

### Option B: Python API (preferred for programmatic access)

```python
import json
from pathlib import Path
from archipilot.autogen_tools import init_store, query_trust_boundaries

# Initialize the report store
init_store(Path("pipeline-output/reports"))

# Get all trust boundaries
result = json.loads(query_trust_boundaries())
print(f"Boundaries: {len(result['boundaries'])}")
print(f"Crossing flows: {result['crossingCount']}")

# Examine each boundary
for boundary in result["boundaries"]:
    name = boundary.get("name", "unnamed")
    elements = boundary.get("elements", [])
    print(f"  {name}: {len(elements)} elements")

# Examine cross-boundary flows
for flow in result["crossingFlows"]:
    print(f"  Crossing: {flow}")

# Search for a specific boundary
dmz = json.loads(query_trust_boundaries(name="DMZ"))
internal = json.loads(query_trust_boundaries(name="Internal"))
```

### Option C: Direct Report Store Access

```python
from pathlib import Path
from archipilot.report_store import ReportStore

store = ReportStore(Path("pipeline-output/reports"))

# All boundaries
boundaries = store.trust_boundaries()

# Filter by name
corp_boundary = store.trust_boundaries(name="Corporate Network")

# Get cross-boundary flows
crossing = store.crossing_flows()
```

## How to Interpret the Output

The trust boundary report contains:

- **boundaries[]**: Defined security zones in the architecture
  - `name`: Boundary name (e.g., "Corporate Network", "DMZ", "Azure VNet", "Internet")
  - `elements`: Architectural elements inside this boundary
  - `elementCount`: Number of elements in the zone
  - `type`: Boundary type (network, process, machine)
- **crossingFlows[]**: Data flows that traverse trust boundaries
  - `source`: Origin element and its boundary
  - `target`: Destination element and its boundary
  - `sourceBoundary`: Name of the source security zone
  - `targetBoundary`: Name of the target security zone
  - `description`: Flow description
  - `isEncrypted`: Whether the cross-boundary flow is encrypted
  - `technology`: Protocol used

### Trust boundary patterns:

| Pattern | Meaning |
|---------|---------|
| Many elements outside boundaries | Poor boundary coverage -- elements without security zones |
| Cross-boundary without encryption | Critical risk -- data crossing security zones unprotected |
| Single large boundary | No segmentation -- all elements in one zone |
| Nested boundaries | Defense in depth -- multiple layers of security zones |
| External to internal flows | Attack vectors -- require authentication and encryption |

### What to look for:

1. **Unencrypted cross-boundary flows**: The highest-priority finding -- data crossing trust zones without encryption.
2. **Elements outside any boundary**: These have no defined security context and may be attack surface gaps.
3. **Too few boundaries**: Flat network without segmentation increases blast radius of compromise.
4. **External-to-internal flows**: Every flow from outside the trust boundary needs authentication, authorization, and encryption.
5. **Boundary imbalance**: One zone with 90% of elements while others are empty suggests modeling issues.

## Example Walkthrough

**User asks**: "What's inside the Internal Network?"

**Agent does**:
1. Loads the `trust-boundary` report from the latest pipeline run
2. Lists all boundaries with their contained elements
3. Identifies flows crossing boundaries and their encryption status

**Agent produces**:
```
🏰 Trust Boundaries
═════════════════════

Boundaries:
┌───┬──────────────────┬──────────┬──────────────────────────────────────┐
│ # │ Boundary         │ Elements │ Key Components                       │
├───┼──────────────────┼──────────┼──────────────────────────────────────┤
│ 1 │ Internal Network │ 12       │ Auth Service, Order Service,         │
│   │                  │          │ User DB, Payment GW, Queue Processor │
│ 2 │ DMZ              │ 3        │ API Gateway, Web App, Load Balancer  │
│ 3 │ Cloud Services   │ 6        │ Azure Service Bus, Key Vault,        │
│   │                  │          │ Blob Storage, Redis Cache            │
└───┴──────────────────┴──────────┴──────────────────────────────────────┘

Cross-Boundary Flows:
┌──────────────────────┬──────────────────┬───────────┬────────────┐
│ Flow                 │ Crossing         │ Encrypted │ Status     │
├──────────────────────┼──────────────────┼───────────┼────────────┤
│ Client → API Gateway │ External → DMZ   │ ✅ TLS    │ 🟢 OK      │
│ API GW → Auth Svc    │ DMZ → Internal   │ ✅ mTLS   │ 🟢 OK      │
│ Web App → User DB    │ DMZ → Internal   │ ❌ None   │ 🔴 Risk    │
│ Order Svc → Bus      │ Internal → Cloud │ ✅ AMQPS  │ 🟢 OK      │
└──────────────────────┴──────────────────┴───────────┴────────────┘

⚠️ 1 unencrypted cross-boundary flow: Web App → User DB
```

## Example Questions This Skill Answers

- "What trust boundaries exist in the architecture?"
- "Which elements are in the DMZ?"
- "What flows cross trust boundaries?"
- "Are all cross-boundary flows encrypted?"
- "Which elements are not inside any trust boundary?"
- "How many security zones does the architecture have?"
- "What flows go from the internet to the internal network?"
- "Is there proper network segmentation in the architecture?"

## Dashboard Link

View in dashboard: `http://localhost:8090/#architecture/dfd`

To scope to a boundary: `http://localhost:8090/#architecture/dfd?boundary={boundary-name}`

## See Also

- **Global rules**: `instructions/archipilot.instructions.md`
- **Domain rules**: `instructions/architecture-domain.instructions.md`
- **Reference**: `shared/c4-model-reference.md`
- **Next steps**: `security-posture`, `analyze-flows`

## Error Handling

| Scenario | Action |
|----------|--------|
| `trust-boundary.json` missing | Run the pipeline first: `uv run archipilot pipeline --csv <services.csv> --merge` |
| No boundaries defined | The TM7 files contain no trust boundaries — open them in TMT and add boundary boxes around element groups |
| Boundary name not found | Verify the boundary name matches exactly — use the overview query to list available boundaries |

---

## executive-summary


# Executive Summary

Generate a one-page executive summary of the entire threat model portfolio. This skill aggregates data from all reports to provide total service counts, threat counts and mitigation rates, top risks, coverage gaps, technology diversity, and key recommendations. Use it to quickly assess the overall security posture of the architecture without diving into individual reports.

## Scope

- **Does**: Aggregate metrics from all 23 reports into a single KPI dashboard with recommendations
- **Does NOT**: Deep-dive into individual threats (use `analyze-threats`), modify data, or create work items

## Output Format

Present results using this structure:

```
## Executive Summary — ArchiPilot Portfolio

### Key Metrics
| Metric               | Value | Status |
|---------------------|-------|--------|
| Services analyzed    | 12    | —      |
| Total elements       | 156   | —      |
| Total threats        | 45    | —      |
| Mitigation rate      | 72%   | 🟡     |
| Encryption rate      | 85%   | 🟢     |
| Authentication rate  | 68%   | 🟡     |
| Avg completeness     | 78%   | 🟢     |

### Top 3 Risks
1. 🔴 Elevation of Privilege: 40% mitigation rate (target: 60%)
2. 🟡 API Gateway: 8 threats, hotspot with 4 STRIDE categories
3. 🟡 Database: Unencrypted flow from Internal Service

### Recommendations
1. Run `governance-gate-check --gate all` to verify compliance
2. Focus on Elevation of Privilege threats — 3 are High severity
3. Review unencrypted flows with `security-posture --detail insecure`
```

## Workflow

1. **Load all reports**: Read threat-analysis, dependency-graph, security-posture, coverage-report, authentication-coverage, technology-inventory
2. **Apply focus filter**: If user specified focus (threats/coverage/security), limit to relevant metrics
3. **Compute KPIs**: Services analyzed, total elements, total threats, mitigation rate, encryption rate, auth rate, avg completeness
4. **Identify top risks**: Find highest-severity unmitigated threats, lowest-coverage models, largest attack surface
5. **Generate recommendations**: Prioritize by impact — what to fix first
6. **Present findings**: Show KPI dashboard, top risks, and recommendations using Output Format

## Prerequisites

- Pipeline output must exist at `pipeline-output/reports/` with at least these reports:
  - `threat-analysis.json` (threat counts and STRIDE distribution)
  - `coverage-report.json` (model completeness)
  - `security-posture.json` (encryption and authentication rates)
  - `dependency-graph.json` (element and relationship counts)
- If no reports exist, run the pipeline first: `uv run archipilot pipeline --csv <services.csv> --merge`
- Python 3.12+ with `archipilot` installed (`uv pip install archipilot`)

## Steps

### Option A: CLI Agent Command

```bash
# Full executive summary
uv run archipilot agent executive-summary

# Focus on threats only
uv run archipilot agent executive-summary --focus threats

# Focus on security metrics
uv run archipilot agent executive-summary --focus security --report-dir pipeline-output/reports

# Focus on coverage gaps
uv run archipilot agent executive-summary --focus coverage
```

### Option B: Python API (preferred for programmatic access)

```python
import json
from pathlib import Path
from archipilot.autogen_tools import (
    init_store,
    generate_executive_summary,
)

# Initialize the report store
init_store(Path("pipeline-output/reports"))

# Get the full executive summary
summary = json.loads(generate_executive_summary())

# Portfolio overview
print(f"Services analyzed: {summary['servicesAnalyzed']}")
print(f"Total elements: {summary['totalElements']}")
print(f"Total relationships: {summary['totalRelationships']}")

# Threat overview
print(f"Total threats: {summary['totalThreats']}")
print(f"Mitigated: {summary['mitigatedThreats']}")
print(f"Mitigation rate: {summary['mitigationRate']}%")

# Security posture
print(f"Encryption rate: {summary['encryptionRate']}%")
print(f"Authentication rate: {summary['authenticationRate']}%")

# Coverage
print(f"Average model completeness: {summary['averageCompleteness']}%")

# Top risks
for risk in summary["topRisks"]:
    print(f"  [{risk['severity']}] {risk['description']}")

# Recommendations
for rec in summary["recommendations"]:
    print(f"  - {rec}")
```

### Option C: Direct Report Store Access

```python
from pathlib import Path
from archipilot.report_store import ReportStore

store = ReportStore(Path("pipeline-output/reports"))

# Build executive summary from individual queries
threat_summary = store.threat_summary()
coverage = store.coverage_summary()
posture = store.security_posture()
dep_summary = store.dependency_summary()
auth = store.authentication_coverage()
```

## How to Interpret the Output

The executive summary provides a high-level dashboard in JSON:

- **servicesAnalyzed**: Number of threat models processed
- **totalElements / totalRelationships**: Architecture scale metrics
- **totalThreats / mitigatedThreats / mitigationRate**: Threat posture
- **encryptionRate**: Percentage of data flows using encryption
- **authenticationRate**: Percentage of flows with authentication
- **averageCompleteness**: Mean model documentation completeness
- **strideDistribution**: Threat count per STRIDE category
- **topRisks[]**: Highest-severity findings across all reports
  - `severity`: Critical, High, Medium, Low
  - `description`: What the risk is
  - `source`: Which report identified it
- **recommendations[]**: Prioritized action items

### Key thresholds for executive review:

| Metric | Good | Needs Attention | Critical |
|--------|------|-----------------|----------|
| Mitigation rate | > 70% | 40-70% | < 40% |
| Encryption rate | > 90% | 70-90% | < 70% |
| Authentication rate | > 85% | 60-85% | < 60% |
| Model completeness | > 75% | 50-75% | < 50% |

### What to look for:

1. **Low mitigation rate**: The single most important metric -- indicates how many identified threats remain unaddressed.
2. **Encryption gaps**: Any external-facing flow without encryption is a critical finding.
3. **Model completeness disparity**: Some teams model thoroughly while others have sparse models -- training opportunity.
4. **STRIDE imbalance**: Heavy concentration in one category (e.g., all Elevation of Privilege) may indicate systematic design issues.
5. **High element count with low coverage**: Large architectures with poor documentation are the highest risk.

## Example Walkthrough

**User asks**: "Give me a portfolio overview of our threat models"

**Agent does**:
1. Loads all available reports across every threat model in the portfolio
2. Aggregates KPIs including service count, element count, threat count, mitigation rate, and encryption coverage
3. Identifies top risks and generates prioritized recommendations

**Agent produces**:
```
📊 Executive Portfolio Summary
═══════════════════════════════

KPI Dashboard:
┌─────────────────────┬──────────┬──────────┐
│ Metric              │ Value    │ Status   │
├─────────────────────┼──────────┼──────────┤
│ Services Modeled    │       12 │          │
│ Total Elements      │      156 │          │
│ Total Threats       │       45 │          │
│ Mitigation Rate     │      72% │ 🟡 Fair  │
│ Encryption Coverage │      85% │ 🟢 Good  │
│ Avg Model Coverage  │      71% │ 🟡 Fair  │
└─────────────────────┴──────────┴──────────┘

Top 3 Risks:
  1. 🔴 Legacy API — 34% coverage, 8 unmitigated threats, no encryption on 3 flows
  2. 🔴 API Gateway — Risk score 82, single point of failure for 12 services
  3. 🟡 Data Platform — 65% coverage, PII flows crossing 2 trust boundaries unencrypted

Recommendations:
  1. Prioritize Legacy API remediation — lowest coverage, highest exposure
  2. Add redundancy to API Gateway — critical path for 77% of services
  3. Encrypt Data Platform PII flows — 2 boundary crossings without TLS
  4. Increase portfolio-wide mitigation rate from 72% → 80% target
```

## Example Questions This Skill Answers

- "Give me a one-page summary of our threat model portfolio."
- "What is our overall security posture?"
- "How many threats are unmitigated across all services?"
- "What are the top 5 risks in our architecture?"
- "What is the encryption rate across all data flows?"
- "How complete are our threat models on average?"
- "What should we prioritize for the next security sprint?"
- "How many services have been threat modeled?"

## Dashboard Link

View in dashboard: `http://localhost:8090/#overview`

## See Also

- **Global rules**: `instructions/archipilot.instructions.md`
- **Domain rules**: `instructions/technology-domain.instructions.md`
- **Reference**: `shared/stride-reference.md`
- **Reference**: `shared/report-schemas.md`
- **Next steps**: `governance-gate-check`, `analyze-threats`, `security-posture`

## Error Handling

| Scenario | Action |
|----------|--------|
| One or more report files missing | Generate partial summary from available reports; note which data is missing |
| All reports missing | Direct user to run `setup` then `run-pipeline` first |
| Focus parameter not recognized | List valid options: `threats`, `coverage`, `security`, `all` (default) |
| Metrics are all 0% or 100% | Report actual values — these are valid (empty model or perfect model) |
| Very large portfolio (>50 services) | Summarize with aggregates; offer drill-down into specific areas |

---

## flow-analysis


# Flow Analysis

Consolidated flow analysis skill that replaces 5 individual skills: `analyze-flows`, `cross-service-flow-analyzer`, `show-dependencies`, `data-lineage-tracer`, and `query-flow-graph`. Each former skill maps to a `--focus` parameter, and `--depth` controls how many sub-analyses run.

## Focus Modes

| Focus | Was | What It Does |
|-------|-----|-------------|
| `flows` | `analyze-flows` | Data flow sequences, flow chains, orphan elements, bidirectional vs one-way patterns |
| `cross-service` | `cross-service-flow-analyzer` | Inter-service communication patterns, shared bridge elements, end-to-end chains |
| `dependencies` | `show-dependencies` | Dependency graph -- what connects to what, fan-in/fan-out, orphan nodes |
| `lineage` | `data-lineage-tracer` | Upstream producers, downstream consumers, trust boundary crossings, data classification annotations |
| `trace` | `query-flow-graph` | Conditional BFS traversal of layered flow graph, confidence scores, security gap annotations |

If no `--focus` is specified, the depth mode determines which sub-analyses run.

## Depth Routing

| Depth | Sub-Analyses Run | When to Use |
|-------|-----------------|-------------|
| **quick** | `dependencies` only | Quick "what connects to X?" check |
| **standard** | `flows` + `dependencies` + `cross-service` | Default -- comprehensive flow overview |
| **deep** | All 5: `flows` + `cross-service` + `dependencies` + `lineage` + `trace` | Full investigation, architecture review |

When `--focus` is specified, only that sub-analysis runs regardless of depth. Depth still controls the detail level within that sub-analysis (e.g., `--focus lineage --depth deep` traces deeper hops and includes data classification annotations).

## Scope

- **Does**: Query and correlate flow reports (flow-sequence, dependency-graph, cross-model-chains, trust-boundary)
- **Does NOT**: Modify data flows, create work items, or assess security threats (use `security-analysis` for that)

## Output Format

### Quick (dependencies only)
```
## Dependencies for "Azure AD"

### Depends On (outgoing) -- 2 connections
| Target          | Relationship       | Encrypted |
|-----------------|--------------------|-----------|
| User Database   | Reads user records | Yes (TLS) |

### Depended On By (incoming) -- 6 connections
| Source          | Relationship         |
|-----------------|---------------------|
| Web Application | Authenticates via   |
| API Gateway     | Validates tokens    |

Fan-in: 6 | Fan-out: 2
```

### Standard (flows + dependencies + cross-service)
```
## Flow Analysis

### Flow Summary
| Metric           | Count |
|-----------------|-------|
| Total flows      | 38    |
| Bidirectional    | 5     |
| Orphan elements  | 2     |

### Dependency Overview
| Metric              | Value |
|---------------------|-------|
| Total nodes         | 31    |
| Total links         | 74    |
| Avg degree          | 2.4   |

### Cross-Service Bridges
| Element        | Services Using It | Role        |
|---------------|-------------------|-------------|
| Azure Key Vault| Auth, Data, API   | Shared infra|
```

### Deep (all 5 sub-analyses)
All Standard sections plus lineage traces and conditional flow graph traversal with confidence scores.

## Workflow

### Focus: flows
1. Load `flow-sequence.json` from pipeline output
2. Filter by element if specified
3. Identify flow chains, bidirectional flows, orphans, fan-in/fan-out
4. Present flow summary, longest chains, pattern analysis

### Focus: cross-service
1. Load `cross-model-chains.json` and `dependency-graph.json`
2. Identify bridge elements (shared across models)
3. Trace multi-hop service chains through bridges
4. Assess encryption on cross-service flows

### Focus: dependencies
1. Load `dependency-graph.json` from pipeline output
2. Resolve element if specified; get incoming/outgoing links
3. Compute fan-in, fan-out, connectivity metrics
4. Flag single points of failure and orphan elements

### Focus: lineage
1. Validate target element exists in `dependency-graph.json`
2. BFS traversal in upstream/downstream/both direction
3. Annotate trust boundary crossings and data classifications
4. Present lineage tables with encryption status

### Focus: trace
1. Load `flow-sequence.json`, extract `flowGraph` layer
2. Fuzzy match entry point to a node name
3. BFS with conditional routing at hub nodes
4. Confidence scoring along paths; gap detection
5. Push highlight commands to dashboard via WebSocket

## Prerequisites

- Pipeline output must exist at `pipeline-output/reports/` with relevant JSON files
- For `cross-service` analysis, a merged pipeline run with multiple models is required
- For `trace` analysis, `flow-sequence.json` must include a `flowGraph` layer
- Python 3.12+ with `archipilot` installed

## Steps

### Option A: MCP Tool Calls

| Focus | MCP Tool |
|-------|----------|
| `flows` | `analyze_flows` |
| `cross-service` | `cross_service_flow_analyzer` |
| `dependencies` | `show_dependencies` |
| `lineage` | `data_lineage_tracer` |
| `trace` | `query_flow_graph` |

For standard/deep depth, call multiple tools in parallel and correlate results.

### Option B: Python API

```python
import json
from pathlib import Path
from archipilot.autogen_tools import (
    init_store, query_flows, query_dependencies,
    analyze_cross_service_flows, trace_data_lineage,
)
from archipilot.mcp_server import handle_tool_call

init_store(Path("pipeline-output/reports"))

# Quick: dependencies only
deps = json.loads(query_dependencies(element="Azure AD"))

# Standard: flows + dependencies + cross-service
flows = json.loads(query_flows())
cross = json.loads(analyze_cross_service_flows())

# Deep: add lineage + trace
lineage = json.loads(trace_data_lineage(element="User Database"))
trace = handle_tool_call("query_flow_graph", {"entry_point": "API Gateway"}, report_dir=Path("pipeline-output/reports"))
```

## Example Questions This Skill Answers

- "How does data flow through the system?" (--focus flows)
- "How do services communicate across models?" (--focus cross-service)
- "What depends on Azure AD?" (--focus dependencies)
- "Trace data lineage from the User Database" (--focus lineage)
- "What can the API Gateway reach?" (--focus trace)
- "Show me a complete flow analysis" (standard depth)
- "Deep flow investigation" (deep depth -- all 5)

## Dashboard Link

View in dashboard: `http://localhost:8090/#flows`

Dependencies view: `http://localhost:8090/#architecture/dependencies`

## See Also

- **Global rules**: `instructions/archipilot.instructions.md`
- **Domain rules**: `instructions/architecture-domain.instructions.md`
- **Reference**: `shared/c4-model-reference.md`
- **Next steps**: `security-analysis`, `model-analysis`, `trust-boundaries`

## Error Handling

| Scenario | Action |
|----------|--------|
| Report files not found | Direct user to run `setup` then `run-pipeline` first |
| Element not found | Verify name matches exactly; use overview to list available nodes |
| Cross-service data missing | Requires `--merge` pipeline run with multiple TM7 models |
| Flow graph has no `flowGraph` layer | Re-run pipeline with `--merge` flag |
| Entry point not found for trace | Fuzzy matching is used; list available nodes if still no match |

---

## dependency-risk-scoring


# Dependency Risk Scoring

Score each architectural element by a composite risk score (0-100) that combines structural position (fan-in, fan-out), threat exposure (unmitigated threats), security posture (authentication gaps, boundary crossings), and data sensitivity (PII, credentials). Use this to identify the most critical elements that need hardening.

## Scope

- **Does**: Compute composite risk scores for architectural elements.
- **Does NOT**: Remediate risks or modify threat model data.

## Output Format

Present results using this structure:

```
## Risk Scores (Top 10)

| Rank | Element        | Score | Fan-In | Threats | Auth Gaps | Classification |
|------|---------------|-------|--------|---------|-----------|----------------|
| 1    | API Gateway    | 82 🔴 | 8      | 8       | 2         | Credentials    |
| 2    | Auth Service   | 71 🔴 | 6      | 6       | 1         | PII            |
| 3    | Database       | 45 🟡 | 4      | 4       | 0         | PII            |

## Risk Distribution
- 🔴 High (≥60): 2 elements
- 🟡 Medium (30-59): 5 elements  
- 🟢 Low (<30): 15 elements
```

## Workflow

1. **Load data**: Read `dependency-graph.json`, `threat-analysis.json`, `attack-surface.json`, `authentication-coverage.json`, `data-classification.json`
2. **Score each element**: Calculate composite risk: fan-in (5×) + unmitigated threats (10×) + boundary crossings (8×) + auth gaps (15×) + data classifications (10×) + entry point (12×) + sensitive (8×)
3. **Rank elements**: Sort by risk score descending
4. **Filter**: If element name specified, show that element's score breakdown. If top-N specified, show top N.
5. **Classify risk**: 🔴 High (≥60), 🟡 Medium (30-59), 🟢 Low (<30)
6. **Present distribution**: Show risk distribution and top elements using Output Format
7. **Recommend**: Suggest `attack-path-analysis` for high-risk elements, `governance-gate-check` for thresholds

## Prerequisites

- Pipeline output must exist at `pipeline-output/reports/dependency-graph.json`
- Additional reports enhance scoring: `threat-mapping.json`, `trust-boundary.json`, `authentication-coverage.json`, `data-classification.json`, `attack-surface.json`
- Python 3.12+ with `archipilot` installed

## Steps

### Option A: CLI Agent Command (preferred)

```bash
# Top 10 riskiest elements (default)
uv run archipilot agent risk-scoring

# Score a specific element
uv run archipilot agent risk-scoring --element "Web API"

# Top 5 riskiest
uv run archipilot agent risk-scoring --top 5

# Custom report directory
uv run archipilot agent risk-scoring --report-dir ./pipeline-output/reports
```

### Option B: Python API

```python
import json
from pathlib import Path
from archipilot.autogen_tools import init_store, score_dependency_risk

init_store(Path("pipeline-output/reports"))

# Top 10 riskiest elements
result = json.loads(score_dependency_risk())

# Score a specific element
api_risk = json.loads(score_dependency_risk(element="Web API"))

# All elements sorted by fan-in
by_fan_in = json.loads(score_dependency_risk(top_n=0, sort_by="fan_in"))

# Top 5 by threat count
by_threats = json.loads(score_dependency_risk(top_n=5, sort_by="threats"))
```

### Option C: Direct Analysis Module

```python
from pathlib import Path
from archipilot.report_store import ReportStore
from archipilot.analysis.risk_scoring import score_all_elements, compute_blast_radius

store = ReportStore(Path("pipeline-output/reports"))
scores = score_all_elements(store)
for entry in scores[:5]:
    print(f"{entry.element_name}: {entry.risk_score} ({', '.join(entry.risk_factors)})")

# Blast radius for a specific element
blast = compute_blast_radius(store, "Web API", max_hops=3)
print(f"Directly affected: {blast.directly_affected}")
```

## How to Interpret the Output

- **riskScore (0-100)**: Composite score. Elements above 60 are high risk, 30-60 are medium, below 30 are low.
- **fanIn**: Number of elements that depend on this one. High fan-in means many services break if this element fails.
- **fanOut**: Number of elements this one depends on. High fan-out means this element has many potential failure sources.
- **unmitigatedThreats**: Threats without mitigations. Each unmitigated threat adds 10 points.
- **boundaryCrossings**: Number of trust boundary crossings involving this element. Each adds 8 points.
- **riskFactors**: Human-readable explanation of why this element scored high.

## Example Walkthrough

**User asks**: "Which elements have the highest risk scores?"

**Agent does**:
1. Loads `dependency-graph.json`, `threat-analysis.json`, `attack-surface.json`, `authentication-coverage.json`, and `data-classification.json`
2. Computes composite risk scores based on fan-in, fan-out, threat count, boundary crossings, and coverage gaps
3. Ranks all elements and categorizes by risk tier

**Agent produces**:
```
⚠️ Dependency Risk Scores
══════════════════════════

Top Risk Elements:
┌──────────────────────┬───────┬──────────┬─────────────────────────────────────┐
│ Element              │ Score │ Tier     │ Risk Factors                        │
├──────────────────────┼───────┼──────────┼─────────────────────────────────────┤
│ API Gateway          │   82  │ 🔴 Critical│ High fan-in (12), 3 boundary crossings│
│ Auth Service         │   71  │ 🔴 Critical│ 8 dependents, 5 unmitigated threats │
│ Payment Gateway      │   63  │ 🟡 High  │ PII handling, 2 boundary crossings  │
│ Database             │   45  │ 🟡 Medium│ Single point of failure, low coverage│
│ Message Queue        │   38  │ 🟢 Low   │ High fan-out but well-mitigated     │
│ Web Application      │   22  │ 🟢 Low   │ Minimal dependencies                │
└──────────────────────┴───────┴──────────┴─────────────────────────────────────┘

Risk Distribution:
  🔴 Critical (70+): 2 elements
  🟡 Medium (40-69): 2 elements
  🟢 Low (0-39):     2 elements

Average Risk Score: 53.5
```

## Example Questions This Skill Answers

- "Which elements have the highest risk?"
- "What is the risk score for Azure AD?"
- "Which components have the most unmitigated threats?"
- "Show me elements with high fan-in that are single points of failure."
- "What is the blast radius if the Web API goes down?"

## Dashboard Link

View risk overlay in dashboard: `http://localhost:8090/#architecture/dependencies?overlay=risk`

## See Also

- **Global rules**: `instructions/archipilot.instructions.md`
- **Domain rules**: `instructions/security-domain.instructions.md`
- **Reference**: `shared/stride-reference.md`
- **Reference**: `shared/report-schemas.md`
- **Next steps**: `attack-path-analysis`, `architecture-impact-simulation`

## Error Handling

| Scenario | Action |
|----------|--------|
| Multiple reports needed but some missing | Risk scoring works with partial data but scores are more accurate with all reports (`dependency-graph.json`, `threat-mapping.json`, `trust-boundary.json`, `data-classification.json`) |
| Element not found | Verify the element name matches exactly — use the dependency overview to list available nodes |
| All scores at 0 | Valid result — no risk factors detected; verify that threat analysis and security posture reports were generated |


