# microsoft-fabric-skills

**Source:** [microsoft/skills-for-fabric](https://github.com/microsoft/skills-for-fabric)
**Store trust:** 35/100
**Signals:** maintenance 15 · adoption 10 · license 10 (MIT) · 1118 stars · 6 contributors
**Scanned ref:** `74f3262c1c3f`

## Plugins (30)

| Trust | Plugin | Shape | Version | Description |
| ---: | --- | --- | --- | --- |
| 45 | [`mcp-setup`](https://github.com/microsoft/skills-for-fabric/tree/74f3262c1c3fcc6d2346daaf479af88b946a3c6b/mcp-setup) | unknown | - | This folder contains scripts to register external Fabric MCP (Model Context Protocol) servers with … |
| 40 | [`activator-cli`](https://github.com/microsoft/skills-for-fabric/tree/74f3262c1c3fcc6d2346daaf479af88b946a3c6b/skills/activator-cli) | skill | - | Creates and inspects Fabric Activator (Reflex) alerts: rules, their data sources, conditions, and t… |
| 40 | [`azmon-mirroredcatalogs-operations-cli`](https://github.com/microsoft/skills-for-fabric/tree/74f3262c1c3fcc6d2346daaf479af88b946a3c6b/skills/azmon-mirroredcatalogs-operations-cli) | skill | - | Brings Azure Monitor, Application Insights, and Log Analytics telemetry into Fabric as Eventhouse e… |
| 40 | [`databricks-migration`](https://github.com/microsoft/skills-for-fabric/tree/74f3262c1c3fcc6d2346daaf479af88b946a3c6b/skills/databricks-migration) | skill | - | Ports existing Databricks notebooks and jobs to Fabric, covering dbutils to notebookutils, secret s… |
| 40 | [`dataflows-cli`](https://github.com/microsoft/skills-for-fabric/tree/74f3262c1c3fcc6d2346daaf479af88b946a3c6b/skills/dataflows-cli) | skill | - | Manages Fabric Dataflow Gen2 items, including creation, M editing, connections, output destinations… |
| 40 | [`deployment-pipelines-authoring-cli`](https://github.com/microsoft/skills-for-fabric/tree/74f3262c1c3fcc6d2346daaf479af88b946a3c6b/skills/deployment-pipelines-authoring-cli) | skill | - | Manages Fabric deployment pipelines for ALM promotion across dev, test, and prod stages, including … |
| 40 | [`e2e-fabric-cost-estimation`](https://github.com/microsoft/skills-for-fabric/tree/74f3262c1c3fcc6d2346daaf479af88b946a3c6b/skills/e2e-fabric-cost-estimation) | skill | - | Estimates Fabric capacity cost before a migration by profiling Spark, SQL, Power BI, and Real-Time … |
| 40 | [`e2e-medallion-architecture`](https://github.com/microsoft/skills-for-fabric/tree/74f3262c1c3fcc6d2346daaf479af88b946a3c6b/skills/e2e-medallion-architecture) | skill | - | Plans and builds end-to-end Fabric data platforms on the Bronze, Silver, and Gold medallion pattern… |
| 40 | [`eventhouse-cli`](https://github.com/microsoft/skills-for-fabric/tree/74f3262c1c3fcc6d2346daaf479af88b946a3c6b/skills/eventhouse-cli) | skill | - | Authors and queries Fabric Eventhouse and KQL databases: tables, functions, policies, materialized … |
| 40 | [`eventschemaset-cli`](https://github.com/microsoft/skills-for-fabric/tree/74f3262c1c3fcc6d2346daaf479af88b946a3c6b/skills/eventschemaset-cli) | skill | - | Governs Event Schema Sets, the Fabric registries of event types and message payload schemas. Covers… |
| 40 | [`eventstream-cli`](https://github.com/microsoft/skills-for-fabric/tree/74f3262c1c3fcc6d2346daaf479af88b946a3c6b/skills/eventstream-cli) | skill | - | Owns Fabric Eventstream items end to end: sources, operators, destinations, routing, retention, thr… |
| 40 | [`fabriciq`](https://github.com/microsoft/skills-for-fabric/tree/74f3262c1c3fcc6d2346daaf479af88b946a3c6b/skills/fabriciq) | skill | - | Answers natural-language business questions over existing Power BI reports and semantic models thro… |
| 40 | [`fabriciq-ontology-cli`](https://github.com/microsoft/skills-for-fabric/tree/74f3262c1c3fcc6d2346daaf479af88b946a3c6b/skills/fabriciq-ontology-cli) | skill | - | Manages Fabric IQ Ontology items, including entity and relationship types, data bindings, and defin… |
| 40 | [`git-integration-operations-cli`](https://github.com/microsoft/skills-for-fabric/tree/74f3262c1c3fcc6d2346daaf479af88b946a3c6b/skills/git-integration-operations-cli) | skill | - | Runs the Fabric Git integration lifecycle through fab api or az rest, including connecting a worksp… |
| 40 | [`hdinsight-migration`](https://github.com/microsoft/skills-for-fabric/tree/74f3262c1c3fcc6d2346daaf479af88b946a3c6b/skills/hdinsight-migration) | skill | - | Ports HDInsight Spark and Hive workloads to Fabric, converting HiveContext and SparkContext to Spar… |
| 40 | [`onelake-catalog-govern-cli`](https://github.com/microsoft/skills-for-fabric/tree/74f3262c1c3fcc6d2346daaf479af88b946a3c6b/skills/onelake-catalog-govern-cli) | skill | - | Governs Microsoft Fabric OneLake catalog health, protection, and trust through Fabric Admin, Core, … |
| 40 | [`pipeline-migration`](https://github.com/microsoft/skills-for-fabric/tree/74f3262c1c3fcc6d2346daaf479af88b946a3c6b/skills/pipeline-migration) | skill | - | Migrates Synapse Data Factory pipelines to Fabric Data Factory, turning linked services into Fabric… |
| 40 | [`powerbi-report-authoring`](https://github.com/microsoft/skills-for-fabric/tree/74f3262c1c3fcc6d2346daaf479af88b946a3c6b/skills/powerbi-report-authoring) | skill | - | Create and modify Power BI report files in PBIR/PBIP format using the `powerbi-report-author` and `… |
| 40 | [`powerbi-report-design`](https://github.com/microsoft/skills-for-fabric/tree/74f3262c1c3fcc6d2346daaf479af88b946a3c6b/skills/powerbi-report-design) | skill | - | Generate Power BI report visual design guidance before PBIR files are written. Use when the user wa… |
| 40 | [`powerbi-report-management`](https://github.com/microsoft/skills-for-fabric/tree/74f3262c1c3fcc6d2346daaf479af88b946a3c6b/skills/powerbi-report-management) | skill | - | Manage Power BI report workspace items and PBIR definitions in Microsoft Fabric via `az rest` CLI a… |
| 40 | [`powerbi-report-planning`](https://github.com/microsoft/skills-for-fabric/tree/74f3262c1c3fcc6d2346daaf479af88b946a3c6b/skills/powerbi-report-planning) | skill | - | Build a guided requirements-to-implementation workflow for new Power BI reports and dashboards from… |
| 40 | [`search-consumption-cli`](https://github.com/microsoft/skills-for-fabric/tree/74f3262c1c3fcc6d2346daaf479af88b946a3c6b/skills/search-consumption-cli) | skill | - | Finds Fabric items across every workspace with the Catalog Search API when the workspace is unknown… |
| 40 | [`semantic-model-authoring`](https://github.com/microsoft/skills-for-fabric/tree/74f3262c1c3fcc6d2346daaf479af88b946a3c6b/skills/semantic-model-authoring) | skill | - | Manages Power BI semantic models, including tables, columns, measures, relationships, DAX authoring… |
| 40 | [`spark-cli`](https://github.com/microsoft/skills-for-fabric/tree/74f3262c1c3fcc6d2346daaf479af88b946a3c6b/skills/spark-cli) | skill | - | Manages Fabric Spark work, including notebook cell code with %%configure, %%sql, PySpark and notebo… |
| 40 | [`sqldb-cli`](https://github.com/microsoft/skills-for-fabric/tree/74f3262c1c3fcc6d2346daaf479af88b946a3c6b/skills/sqldb-cli) | skill | - | Manages a Fabric SQL database item, the OLTP SQL Server engine, including running T-SQL through sql… |
| 40 | [`sqldw-cli`](https://github.com/microsoft/skills-for-fabric/tree/74f3262c1c3fcc6d2346daaf479af88b946a3c6b/skills/sqldw-cli) | skill | - | Manage Fabric Warehouse, Lakehouse SQL analytics endpoints, and Mirrored Databases: DDL/DML, COPY I… |
| 40 | [`synapse-migration`](https://github.com/microsoft/skills-for-fabric/tree/74f3262c1c3fcc6d2346daaf479af88b946a3c6b/skills/synapse-migration) | skill | - | Ports Azure Synapse workloads to Microsoft Fabric: Spark pools/notebooks, Lake Databases, Linked Se… |
| 40 | [`variable-library-cli`](https://github.com/microsoft/skills-for-fabric/tree/74f3262c1c3fcc6d2346daaf479af88b946a3c6b/skills/variable-library-cli) | skill | - | Manages Fabric Variable Library items, including definitions, libraryVariables and valueSets overri… |
| 35 | [`fabric-skills`](https://github.com/microsoft/skills-for-fabric/tree/74f3262c1c3fcc6d2346daaf479af88b946a3c6b/plugins/fabric-skills) | mixed | - |  |
| 35 | [`powerbi-authoring`](https://github.com/microsoft/skills-for-fabric/tree/74f3262c1c3fcc6d2346daaf479af88b946a3c6b/plugins/powerbi-authoring) | mixed | - |  |

---
*Generated by `scripts/render-catalog.cjs` at 2026-09-07T11:06:59.791Z*
