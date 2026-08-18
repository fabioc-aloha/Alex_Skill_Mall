# microsoft-copilot-studio-skills

**Source:** [microsoft/skills-for-copilot-studio](https://github.com/microsoft/skills-for-copilot-studio)
**Store trust:** 32/100
**Signals:** maintenance 15 · adoption 7 · license 10 (MIT) · 409 stars · 11 contributors
**Scanned ref:** `f7b65888c47e`

## Plugins (31)

| Trust | Plugin | Shape | Version | Description |
| ---: | --- | --- | --- | --- |
| 37 | [`add-action`](https://github.com/microsoft/skills-for-copilot-studio/tree/f7b65888c47e9b3f18c050b15f20cd8dd500b2c5/skills/add-action) | skill | - | Guide users through adding a new connector action to a Copilot Studio agent. Connector actions requ… |
| 37 | [`add-adaptive-card`](https://github.com/microsoft/skills-for-copilot-studio/tree/f7b65888c47e9b3f18c050b15f20cd8dd500b2c5/skills/add-adaptive-card) | skill | - | Generate and insert an Adaptive Card into a Copilot Studio topic using AdaptiveCardPrompt. Use when… |
| 37 | [`add-generative-answers`](https://github.com/microsoft/skills-for-copilot-studio/tree/f7b65888c47e9b3f18c050b15f20cd8dd500b2c5/skills/add-generative-answers) | skill | - | Add generative answer nodes (SearchAndSummarizeContent or AnswerQuestionWithAI) to a Copilot Studio… |
| 37 | [`add-global-variable`](https://github.com/microsoft/skills-for-copilot-studio/tree/f7b65888c47e9b3f18c050b15f20cd8dd500b2c5/skills/add-global-variable) | skill | - | Add a global variable to a Copilot Studio agent. Use when the user needs a variable that persists a… |
| 37 | [`add-knowledge`](https://github.com/microsoft/skills-for-copilot-studio/tree/f7b65888c47e9b3f18c050b15f20cd8dd500b2c5/skills/add-knowledge) | skill | - | Add a knowledge source (public website or SharePoint) to a Copilot Studio agent. Use when the user … |
| 37 | [`add-node`](https://github.com/microsoft/skills-for-copilot-studio/tree/f7b65888c47e9b3f18c050b15f20cd8dd500b2c5/skills/add-node) | skill | - | Add or modify a node in an existing Copilot Studio topic. Use when the user asks to add a question,… |
| 37 | [`add-other-agents`](https://github.com/microsoft/skills-for-copilot-studio/tree/f7b65888c47e9b3f18c050b15f20cd8dd500b2c5/skills/add-other-agents) | skill | - | Add child agents, connected agents, or other multi-agent patterns to a Copilot Studio agent. Use wh… |
| 37 | [`analyze-evals`](https://github.com/microsoft/skills-for-copilot-studio/tree/f7b65888c47e9b3f18c050b15f20cd8dd500b2c5/skills/analyze-evals) | skill | - | Analyze exported evaluation results from Copilot Studio's Evaluate tab. The user provides a CSV fil… |
| 37 | [`chat-directline`](https://github.com/microsoft/skills-for-copilot-studio/tree/f7b65888c47e9b3f18c050b15f20cd8dd500b2c5/skills/chat-directline) | skill | - | Send a message to a Copilot Studio agent via DirectLine v3. Use for agents with no auth or manual a… |
| 37 | [`chat-sdk`](https://github.com/microsoft/skills-for-copilot-studio/tree/f7b65888c47e9b3f18c050b15f20cd8dd500b2c5/skills/chat-sdk) | skill | - | Send a message to a Copilot Studio agent via the Copilot Studio Client SDK (M365). Use for agents w… |
| 37 | [`chat-with-agent`](https://github.com/microsoft/skills-for-copilot-studio/tree/f7b65888c47e9b3f18c050b15f20cd8dd500b2c5/skills/chat-with-agent) | skill | - | DEPRECATED: Use /copilot-studio:detect-mode then /copilot-studio:chat-directline or /copilot-studio… |
| 37 | [`clone-agent`](https://github.com/microsoft/skills-for-copilot-studio/tree/f7b65888c47e9b3f18c050b15f20cd8dd500b2c5/skills/clone-agent) | skill | - | Clone a Copilot Studio agent from the cloud. Guides through environment selection, agent selection,… |
| 37 | [`create-eval`](https://github.com/microsoft/skills-for-copilot-studio/tree/f7b65888c47e9b3f18c050b15f20cd8dd500b2c5/skills/create-eval) | skill | - | Create plugin development eval scenarios (JSON files with natural prompts and deterministic checks … |
| 37 | [`create-eval-set`](https://github.com/microsoft/skills-for-copilot-studio/tree/f7b65888c47e9b3f18c050b15f20cd8dd500b2c5/skills/create-eval-set) | skill | - | Create a test set CSV file for import into Copilot Studio's in-product Evaluate tab. Reads the agen… |
| 37 | [`detect-mode`](https://github.com/microsoft/skills-for-copilot-studio/tree/f7b65888c47e9b3f18c050b15f20cd8dd500b2c5/skills/detect-mode) | skill | - | Detect a Copilot Studio agent's authentication mode (DirectLine vs M365) by querying Dataverse. Ret… |
| 37 | [`directline-chat`](https://github.com/microsoft/skills-for-copilot-studio/tree/f7b65888c47e9b3f18c050b15f20cd8dd500b2c5/skills/directline-chat) | skill | - | DEPRECATED: Use /copilot-studio:chat-with-agent instead — it auto-detects DirectLine vs M365 mode. … |
| 37 | [`edit-action`](https://github.com/microsoft/skills-for-copilot-studio/tree/f7b65888c47e9b3f18c050b15f20cd8dd500b2c5/skills/edit-action) | skill | - | Edit an existing action (TaskDialog) in a Copilot Studio agent. Supports connector actions and MCP … |
| 37 | [`edit-agent`](https://github.com/microsoft/skills-for-copilot-studio/tree/f7b65888c47e9b3f18c050b15f20cd8dd500b2c5/skills/edit-agent) | skill | - | Edit Copilot Studio agent settings, instructions, or configuration. Use when the user asks to chang… |
| 37 | [`edit-triggers`](https://github.com/microsoft/skills-for-copilot-studio/tree/f7b65888c47e9b3f18c050b15f20cd8dd500b2c5/skills/edit-triggers) | skill | - | Modify topic triggers — trigger phrases and model description. Use when the user asks to add, remov… |
| 37 | [`int-patterns`](https://github.com/microsoft/skills-for-copilot-studio/tree/f7b65888c47e9b3f18c050b15f20cd8dd500b2c5/skills/int-patterns) | skill | - | Pattern library for Copilot Studio agent design. Contains proven and recommended implementation pat… |
| 37 | [`int-project-context`](https://github.com/microsoft/skills-for-copilot-studio/tree/f7b65888c47e9b3f18c050b15f20cd8dd500b2c5/skills/int-project-context) | skill | - | Shared project context for all Copilot Studio sub-agents. Provides project structure, schema lookup… |
| 37 | [`int-reference`](https://github.com/microsoft/skills-for-copilot-studio/tree/f7b65888c47e9b3f18c050b15f20cd8dd500b2c5/skills/int-reference) | skill | - | Reference tables for Copilot Studio YAML authoring: triggers, actions, variables, entities, Power F… |
| 37 | [`list-kinds`](https://github.com/microsoft/skills-for-copilot-studio/tree/f7b65888c47e9b3f18c050b15f20cd8dd500b2c5/skills/list-kinds) | skill | - | List all available kind discriminator values from the Copilot Studio YAML schema. Use when the user… |
| 37 | [`list-topics`](https://github.com/microsoft/skills-for-copilot-studio/tree/f7b65888c47e9b3f18c050b15f20cd8dd500b2c5/skills/list-topics) | skill | - | List all topics in the Copilot Studio agent with their trigger types, phrases, and action counts. U… |
| 37 | [`lookup-schema`](https://github.com/microsoft/skills-for-copilot-studio/tree/f7b65888c47e9b3f18c050b15f20cd8dd500b2c5/skills/lookup-schema) | skill | - | Look up Copilot Studio YAML schema definitions. Use when the user asks about schema structure, elem… |
| 37 | [`manage-agent`](https://github.com/microsoft/skills-for-copilot-studio/tree/f7b65888c47e9b3f18c050b15f20cd8dd500b2c5/skills/manage-agent) | skill | - | Push/pull Copilot Studio agent content via the VS Code extension's LanguageServerHost LSP binary. H… |
| 37 | [`new-topic`](https://github.com/microsoft/skills-for-copilot-studio/tree/f7b65888c47e9b3f18c050b15f20cd8dd500b2c5/skills/new-topic) | skill | - | Create a new Copilot Studio topic YAML file. Use when the user asks to create a new topic, conversa… |
| 37 | [`run-eval`](https://github.com/microsoft/skills-for-copilot-studio/tree/f7b65888c47e9b3f18c050b15f20cd8dd500b2c5/skills/run-eval) | skill | - | Run evaluations against a Copilot Studio agent via the Power Platform Evaluation API. Works on DRAF… |
| 37 | [`run-tests-kit`](https://github.com/microsoft/skills-for-copilot-studio/tree/f7b65888c47e9b3f18c050b15f20cd8dd500b2c5/skills/run-tests-kit) | skill | - | Run a batch test suite via the Copilot Studio Kit (Dataverse API). Uses the Power CAT Copilot Studi… |
| 37 | [`test-auth`](https://github.com/microsoft/skills-for-copilot-studio/tree/f7b65888c47e9b3f18c050b15f20cd8dd500b2c5/skills/test-auth) | skill | - | Authenticate for Copilot Studio evaluation API and SDK chat. Caches a token that is shared across r… |
| 37 | [`validate`](https://github.com/microsoft/skills-for-copilot-studio/tree/f7b65888c47e9b3f18c050b15f20cd8dd500b2c5/skills/validate) | skill | - | Validate Copilot Studio agent YAML files using the LSP binary's full diagnostics (YAML structure, P… |

---
*Generated by `scripts/render-catalog.cjs` at 2026-08-18T23:42:41.436Z*
