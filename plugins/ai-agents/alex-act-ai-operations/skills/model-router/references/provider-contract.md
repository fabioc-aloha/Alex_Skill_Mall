# Provider Contract

Use provider MCP tools as live evidence and execution surfaces. Do not assume
that equal field names mean equal semantics.

## Normalized Evidence

For every candidate, capture when available:

| Field | Rule |
| --- | --- |
| Provider | Exact publisher identity |
| Model | Exact live model identifier |
| Operation | Specific provider operation or MCP tool |
| Modalities | Inputs and outputs supported by current evidence |
| Availability | Account, region, tier, and preview restrictions |
| Quality | Benchmark or provider evidence with source; otherwise unknown |
| Latency | Measured or documented basis; otherwise unknown |
| Cost | Estimate and unit basis; otherwise unknown |
| License | Model or output-use terms when available |
| Data | Inputs transmitted, retention, and residency when available |

## Provider Boundaries

### Hugging Face

- Search Hub models, datasets, Spaces, and papers through the first-party MCP.
- Treat community Spaces as separate publishers with separate trust and data
  boundaries.
- Jobs, sandboxes, and dynamic Spaces can spend compute or transmit data and
  therefore require explicit execution consent.

### ElevenLabs

- Query models and voices before selecting speech or audio operations.
- `ELEVENLABS_API_KEY` is required for the MCP server.
- Credit-consuming tools require explicit consent even if marked read-only.
- Prefer MCP resource output so generated binary data does not silently land on
  the Desktop.
- Voice cloning, outbound calls, agent creation, and knowledge-base mutation are
  high-impact operations. Do not include them as implicit fallbacks.

### Microsoft Foundry

- Use the first-party Foundry MCP Server (preview) at
  `https://mcp.ai.azure.com` for live model discovery and Foundry project
  evidence.
- Authenticate through Microsoft Entra ID. Foundry does not require an API key
  in `.env` for this MCP path.
- Require an Azure subscription, a Foundry project, and Contributor or higher
  access before treating a candidate as executable.
- Mark preview limitations, region/model availability, and project permissions
  as evidence or unknowns. Do not present preview tools as production-stable.

## Fail-Closed Rules

- Unknown cost is not zero cost.
- Missing retention evidence is not zero retention.
- Missing license evidence is not commercial-use permission.
- A provider tool error does not authorize switching providers.
- A fallback that changes provider, model, transmitted data, or cost ceiling
  requires renewed consent.
