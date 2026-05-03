# fabric-mcp-integration Reference

Microsoft Fabric MCP integration: OneLake, item definitions, Fabric APIs. Reference for Fabric-connected development.

This is a **knowledge package** -- consult on demand, not loaded into the brain.

---

## SKILL


# LIMN — Fabric (Power BI) MCP Server

The **Fabric (Power BI)** server is a [LIMN](https://aka.ms/limn)-hosted MCP server for the **Fabric / Power BI** product. It provides AI agents with tools to query telemetry, search TSGs, and browse source code — all scoped to the Fabric (Power BI) domain.

📖 **Eng Hub docs:** [aka.ms/limn](https://aka.ms/limn)

## Federated Tools

This server federates the following utility MCP servers, giving you a unified toolset:

| Utility Server | What It Does |
|---------------|-------------|
| **Sql** | Run SQL queries against data endpoints |
| **Kusto** | Run KQL queries against Kusto clusters (max 5000 rows) |
| **Ado** | Browse Azure DevOps repos and search code |
| **TsgSearch** | Search troubleshooting guides indexed for Fabric |
| **Telemetry/Fabric** | Query Fabric-specific telemetry data |

> **Note:** This server does not include ICM integration. For ICM incident support, use one of the other product servers (e.g., Fabric DW or Spark).

## Access Requirements

- **Required Roles:** `Limn.AzureDataFTE` or `Limn.AzureDataCSS`
- **Authentication:** Azure Entra ID with OBO for downstream APIs

## MCP Configuration

Add this to your VS Code `settings.json` under `"mcp.servers"` or to `.vscode/mcp.json`:

```jsonc
{
  "servers": {
    "limn-fabric": {
      "type": "http",
      "url": "https://limn-ppe-app.azurewebsites.net/Products/Fabric"
    }
  }
}
```

## Key Links

| Resource | URL |
|----------|-----|
| Eng Hub docs | [aka.ms/limn](https://aka.ms/limn) |
| LIMN PPE site | [limn-ppe-app.azurewebsites.net](https://limn-ppe-app.azurewebsites.net/) |


