# Saga Orchestration

Implement saga patterns for distributed transactions and cross-aggregate workflows. Use this skill when implementing distributed transactions across microservices where 2PC is unavailable, designing compensating actions for failed order workflows that span inventory, payment, and shipping services, building event-driven saga coordinators for travel booking systems that must roll back hotel, flight, and car rental reservations atomically, or debugging stuck saga states in production where compensation steps never complete.

## Quick Facts

| Field | Value |
| --- | --- |
| **Category** | architecture-patterns |
| **Shape** | `.S..` |
| **Tier** | standard |
| **Token cost** | ~3934 tokens |
| **Requires Edition** | >= 1.0.0 |

## What This Plugin Does

Implement saga patterns for distributed transactions and cross-aggregate workflows. Use this skill when implementing distributed transactions across microservices where 2PC is unavailable, designing compensating actions for failed order workflows that span inventory, payment, and shipping services, building event-driven saga coordinators for travel booking systems that must roll back hotel, flight, and car rental reservations atomically, or debugging stuck saga states in production where compensation steps never complete.

## Installation

```text
/mall install saga-orchestration
```

Or manually copy the plugin contents to `.github/skills/local/saga-orchestration/`.

## Artifacts Installed

- **skill**: `SKILL.md`

## Shape: `.S..`

Skill only -- domain knowledge loaded when pattern matches.
