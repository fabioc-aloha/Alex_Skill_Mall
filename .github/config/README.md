# `.github/config/`

Configuration files used by Alex's instructions and converters.

## Ownership

| File | Owner | Behavior on upgrade |
|------|-------|---------------------|
| `sync-policy.json` | Edition | Overwritten — declares which paths are edition vs heir owned |
| `markdown-light.css` | Edition | Overwritten — GitHub-flavored markdown preview theme. Reference from VS Code via `"markdown.styles": [".github/config/markdown-light.css"]` |
| `cognitive-config.json` | Heir | First-installed, then frozen. Read by `knowledge-coverage.instructions.md` (e.g., `showConfidenceBadge`). Tweak freely. |
| `goals.json` | Heir | First-installed, then frozen. Read by `proactive-awareness.instructions.md` (active focus routing). Add your own goals. |
| `README.md` | Edition | This file |

## Adding Your Own Configs

If you author a local instruction or muscle that needs a config file, drop it in `.github/config/local/` so Edition upgrades never touch it. Heir-owned by convention.

## Notes

- The Edition copies of `cognitive-config.json` and `goals.json` are templates rendered by `bootstrap-heir.cjs` on first install. Once a heir has its own copy, Edition upgrades leave it alone (declared `heir_owned` in `sync-policy.json`).
- Master-only operational state (session metrics, correlation vectors, knowledge artifacts, taglines, loop menus, etc.) is intentionally **not** shipped to heirs — that's tied to the upstream extension UI and isn't relevant to a heir's brain.
