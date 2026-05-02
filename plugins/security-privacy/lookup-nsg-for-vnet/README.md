# Skill: NSG Lookup for VNet

Checks every subnet in a Virtual Network for an associated Network Security Group, and also inspects each NIC attached to those subnets for NIC-level NSG coverage.

## Quick Facts

| Field | Value |
| --- | --- |
| **Category** | security-privacy |
| **Shape** | `.S..` |
| **Tier** | standard |
| **Token cost** | ~1048 tokens |
| **Requires Edition** | >= 1.0.0 |

## What This Plugin Does

Checks every subnet in a Virtual Network for an associated Network Security Group, and also inspects each NIC attached to those subnets for NIC-level NSG coverage.

## Installation

```text
/mall install lookup-nsg-for-vnet
```

Or manually copy the plugin contents to `.github/skills/local/lookup-nsg-for-vnet/`.

## Artifacts Installed

- **skill**: `SKILL.md`

## Shape: `.S..`

Skill only -- domain knowledge loaded when pattern matches.
