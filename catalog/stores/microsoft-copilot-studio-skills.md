# microsoft-copilot-studio-skills

**Source:** [microsoft/skills-for-copilot-studio](https://github.com/microsoft/skills-for-copilot-studio)
**Store trust:** 32/100
**Signals:** maintenance 15 · adoption 7 · license 10 (MIT) · 333 stars · 11 contributors
**Scanned ref:** `353b28828a98`

## Plugins (31)

| Trust | Plugin | Shape | Version | Description |
| ---: | --- | --- | --- | --- |
| 37 | [`add-action`](https://github.com/microsoft/skills-for-copilot-studio/tree/353b28828a98634cc7bb7a4e62d6b63be60325ff/skills/add-action) | skill | - | Guide users through adding a new connector action to a Copilot Studio agent. Connector actions requ… |
| 37 | [`add-adaptive-card`](https://github.com/microsoft/skills-for-copilot-studio/tree/353b28828a98634cc7bb7a4e62d6b63be60325ff/skills/add-adaptive-card) | skill | - | Generate and insert an Adaptive Card into a Copilot Studio topic using AdaptiveCardPrompt. Use when… |
| 37 | [`add-generative-answers`](https://github.com/microsoft/skills-for-copilot-studio/tree/353b28828a98634cc7bb7a4e62d6b63be60325ff/skills/add-generative-answers) | skill | - | Add generative answer nodes (SearchAndSummarizeContent or AnswerQuestionWithAI) to a Copilot Studio… |
| 37 | [`add-global-variable`](https://github.com/microsoft/skills-for-copilot-studio/tree/353b28828a98634cc7bb7a4e62d6b63be60325ff/skills/add-global-variable) | skill | - | Add a global variable to a Copilot Studio agent. Use when the user needs a variable that persists a… |
| 37 | [`add-knowledge`](https://github.com/microsoft/skills-for-copilot-studio/tree/353b28828a98634cc7bb7a4e62d6b63be60325ff/skills/add-knowledge) | skill | - | Add a knowledge source (public website or SharePoint) to a Copilot Studio agent. Use when the user … |
| 37 | [`add-node`](https://github.com/microsoft/skills-for-copilot-studio/tree/353b28828a98634cc7bb7a4e62d6b63be60325ff/skills/add-node) | skill | - | Add or modify a node in an existing Copilot Studio topic. Use when the user asks to add a question,… |
| 37 | [`add-other-agents`](https://github.com/microsoft/skills-for-copilot-studio/tree/353b28828a98634cc7bb7a4e62d6b63be60325ff/skills/add-other-agents) | skill | - | Add child agents, connected agents, or other multi-agent patterns to a Copilot Studio agent. Use wh… |
| 37 | [`chat-directline`](https://github.com/microsoft/skills-for-copilot-studio/tree/353b28828a98634cc7bb7a4e62d6b63be60325ff/skills/chat-directline) | skill | - | Send a message to a Copilot Studio agent via DirectLine v3. Use for agents with no auth or manual a… |
| 37 | [`chat-sdk`](https://github.com/microsoft/skills-for-copilot-studio/tree/353b28828a98634cc7bb7a4e62d6b63be60325ff/skills/chat-sdk) | skill | - | Send a message to a Copilot Studio agent via the Copilot Studio Client SDK (M365). Use for agents w… |
| 37 | [`chat-with-agent`](https://github.com/microsoft/skills-for-copilot-studio/tree/353b28828a98634cc7bb7a4e62d6b63be60325ff/skills/chat-with-agent) | skill | - | DEPRECATED: Use /copilot-studio:detect-mode then /copilot-studio:chat-directline or /copilot-studio… |
| 37 | [`clone-agent`](https://github.com/microsoft/skills-for-copilot-studio/tree/353b28828a98634cc7bb7a4e62d6b63be60325ff/skills/clone-agent) | skill | - | Clone a Copilot Studio agent from the cloud. Guides through environment selection, agent selection,… |
| 37 | [`create-eval`](https://github.com/microsoft/skills-for-copilot-studio/tree/353b28828a98634cc7bb7a4e62d6b63be60325ff/skills/create-eval) | skill | - | Create plugin development eval scenarios (JSON files with natural prompts and deterministic checks … |
| 37 | [`detect-mode`](https://github.com/microsoft/skills-for-copilot-studio/tree/353b28828a98634cc7bb7a4e62d6b63be60325ff/skills/detect-mode) | skill | - | Detect a Copilot Studio agent's authentication mode (DirectLine vs M365) by querying Dataverse. Ret… |
| 37 | [`directline-chat`](https://github.com/microsoft/skills-for-copilot-studio/tree/353b28828a98634cc7bb7a4e62d6b63be60325ff/skills/directline-chat) | skill | - | DEPRECATED: Use /copilot-studio:chat-with-agent instead — it auto-detects DirectLine vs M365 mode. … |
| 37 | [`edit-action`](https://github.com/microsoft/skills-for-copilot-studio/tree/353b28828a98634cc7bb7a4e62d6b63be60325ff/skills/edit-action) | skill | - | Edit an existing action (TaskDialog) in a Copilot Studio agent. Supports connector actions and MCP … |
| 37 | [`edit-agent`](https://github.com/microsoft/skills-for-copilot-studio/tree/353b28828a98634cc7bb7a4e62d6b63be60325ff/skills/edit-agent) | skill | - | Edit Copilot Studio agent settings, instructions, or configuration. Use when the user asks to chang… |
| 37 | [`edit-triggers`](https://github.com/microsoft/skills-for-copilot-studio/tree/353b28828a98634cc7bb7a4e62d6b63be60325ff/skills/edit-triggers) | skill | - | Modify topic triggers — trigger phrases and model description. Use when the user asks to add, remov… |
| 37 | [`int-patterns`](https://github.com/microsoft/skills-for-copilot-studio/tree/353b28828a98634cc7bb7a4e62d6b63be60325ff/skills/int-patterns) | skill | - | Pattern library for Copilot Studio agent design. Contains proven and recommended implementation pat… |
| 37 | [`int-reference`](https://github.com/microsoft/skills-for-copilot-studio/tree/353b28828a98634cc7bb7a4e62d6b63be60325ff/skills/int-reference) | skill | - | Reference tables for Copilot Studio YAML authoring: triggers, actions, variables, entities, Power F… |
| 37 | [`list-kinds`](https://github.com/microsoft/skills-for-copilot-studio/tree/353b28828a98634cc7bb7a4e62d6b63be60325ff/skills/list-kinds) | skill | - | List all available kind discriminator values from the Copilot Studio YAML schema. Use when the user… |
| 37 | [`list-topics`](https://github.com/microsoft/skills-for-copilot-studio/tree/353b28828a98634cc7bb7a4e62d6b63be60325ff/skills/list-topics) | skill | - | List all topics in the Copilot Studio agent with their trigger types, phrases, and action counts. U… |
| 37 | [`lookup-schema`](https://github.com/microsoft/skills-for-copilot-studio/tree/353b28828a98634cc7bb7a4e62d6b63be60325ff/skills/lookup-schema) | skill | - | Look up Copilot Studio YAML schema definitions. Use when the user asks about schema structure, elem… |
| 37 | [`manage-agent`](https://github.com/microsoft/skills-for-copilot-studio/tree/353b28828a98634cc7bb7a4e62d6b63be60325ff/skills/manage-agent) | skill | - | Push/pull Copilot Studio agent content via the VS Code extension's LanguageServerHost LSP binary. H… |
| 37 | [`new-topic`](https://github.com/microsoft/skills-for-copilot-studio/tree/353b28828a98634cc7bb7a4e62d6b63be60325ff/skills/new-topic) | skill | - | Create a new Copilot Studio topic YAML file. Use when the user asks to create a new topic, conversa… |
| 37 | [`validate`](https://github.com/microsoft/skills-for-copilot-studio/tree/353b28828a98634cc7bb7a4e62d6b63be60325ff/skills/validate) | skill | - | Validate Copilot Studio agent YAML files using the LSP binary's full diagnostics (YAML structure, P… |
| 32 | [`analyze-evals`](https://github.com/microsoft/skills-for-copilot-studio/tree/353b28828a98634cc7bb7a4e62d6b63be60325ff/skills/analyze-evals) | skill | - |  |
| 32 | [`create-eval-set`](https://github.com/microsoft/skills-for-copilot-studio/tree/353b28828a98634cc7bb7a4e62d6b63be60325ff/skills/create-eval-set) | skill | - |  |
| 32 | [`int-project-context`](https://github.com/microsoft/skills-for-copilot-studio/tree/353b28828a98634cc7bb7a4e62d6b63be60325ff/skills/int-project-context) | skill | - |  |
| 32 | [`run-eval`](https://github.com/microsoft/skills-for-copilot-studio/tree/353b28828a98634cc7bb7a4e62d6b63be60325ff/skills/run-eval) | skill | - |  |
| 32 | [`run-tests-kit`](https://github.com/microsoft/skills-for-copilot-studio/tree/353b28828a98634cc7bb7a4e62d6b63be60325ff/skills/run-tests-kit) | skill | - |  |
| 32 | [`test-auth`](https://github.com/microsoft/skills-for-copilot-studio/tree/353b28828a98634cc7bb7a4e62d6b63be60325ff/skills/test-auth) | skill | - |  |

---
*Generated by `scripts/render-catalog.cjs` at 2026-06-23T15:11:47.217Z*
