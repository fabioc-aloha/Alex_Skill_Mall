# Azure Deployment Preflight Validation

Performs comprehensive preflight validation of Bicep deployments to Azure, including template syntax validation, what-if analysis, and permission checks. Use this skill before any deployment to Azure to preview changes, identify potential issues, and ensure the deployment will succeed. Activate when users mention deploying to Azure, validating Bicep files, checking deployment permissions, previewing infrastructure changes, running what-if, or preparing for azd provision.

## Quick Facts

| Field | Value |
| --- | --- |
| **Category** | cloud-infrastructure |
| **Shape** | `.S..` |
| **Tier** | standard |
| **Token cost** | ~1912 tokens |
| **Requires Edition** | >= 1.0.0 |

## What This Plugin Does

Performs comprehensive preflight validation of Bicep deployments to Azure, including template syntax validation, what-if analysis, and permission checks. Use this skill before any deployment to Azure to preview changes, identify potential issues, and ensure the deployment will succeed. Activate when users mention deploying to Azure, validating Bicep files, checking deployment permissions, previewing infrastructure changes, running what-if, or preparing for azd provision.

## Installation

```text
/mall install azure-deployment-preflight
```

Or manually copy the plugin contents to `.github/skills/local/azure-deployment-preflight/`.

## Artifacts Installed

- **skill**: `SKILL.md`

## Shape: `.S..`

Skill only -- domain knowledge loaded when pattern matches.
