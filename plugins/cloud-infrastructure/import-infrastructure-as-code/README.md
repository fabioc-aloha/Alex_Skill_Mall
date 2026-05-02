# Import Infrastructure as Code (Azure -> Terraform with AVM)

Import existing Azure resources into Terraform using Azure CLI discovery and Azure Verified Modules (AVM). Use when asked to reverse-engineer live Azure infrastructure, generate Infrastructure as Code from existing subscriptions/resource groups/resource IDs, map dependencies, derive exact import addresses from downloaded module source, prevent configuration drift, and produce AVM-based Terraform files ready for validation and planning across any Azure resource type.

## Quick Facts

| Field | Value |
| --- | --- |
| **Category** | cloud-infrastructure |
| **Shape** | `.S..` |
| **Tier** | standard |
| **Token cost** | ~4722 tokens |
| **Requires Edition** | >= 1.0.0 |

## What This Plugin Does

Import existing Azure resources into Terraform using Azure CLI discovery and Azure Verified Modules (AVM). Use when asked to reverse-engineer live Azure infrastructure, generate Infrastructure as Code from existing subscriptions/resource groups/resource IDs, map dependencies, derive exact import addresses from downloaded module source, prevent configuration drift, and produce AVM-based Terraform files ready for validation and planning across any Azure resource type.

## Installation

```text
/mall install import-infrastructure-as-code
```

Or manually copy the plugin contents to `.github/skills/local/import-infrastructure-as-code/`.

## Artifacts Installed

- **skill**: `SKILL.md`

## Shape: `.S..`

Skill only -- domain knowledge loaded when pattern matches.
