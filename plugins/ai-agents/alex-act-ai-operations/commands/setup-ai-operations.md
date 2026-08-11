---
description: "Configure selected AI Operations providers and preview exact ElevenLabs runtime provisioning. Use after plugin installation or when provider authentication or runtime readiness is missing."
lastReviewed: 2026-08-11
---

# /alex-act-ai-operations setup-ai-operations

Use `setup-ai-operations` to configure provider access.

Steps:

1. Load the setup skill and determine whether this is onboarding or preparation
	for an approved execution.
2. During onboarding, do not ask for API keys, tokens, or other credentials,
	and do not initiate provider login. Report key-free planning readiness and
	stop.
3. Defer provider login and authentication until an approved execution plan
	selects a provider and execution requires access.
4. For post-selection preparation, confirm which provider and model the
	approved plan selected.
5. Route hosted providers through native login and local providers through the
	exact host environment variable or approved secret storage, without
	requesting or printing the value.
6. Route hosted-provider login through its first-party flow.
7. Preview the exact ElevenLabs runtime before any package installation.
8. Ask separately before applying the preview.
9. Verify each selected provider and report partial readiness honestly.

Would revise by **2026-11-11** if setup remains undiscoverable or bypasses the
preview and consent boundary.
