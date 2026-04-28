# markdown-light

GitHub-flavored markdown preview theme for VS Code. Polished, readable, drop-in.

## What it is

A ~21KB CSS file that styles VS Code's built-in markdown preview to match GitHub.com's rendering — better typography, code blocks, tables, callouts, and Mermaid container styling than the default theme.

## Install

```bash
# 1. Copy into your project's .vscode/ folder (or anywhere you like)
mkdir -p .vscode
cp ~/Alex_Skill_Mall/configs/markdown-light/markdown-light.css .vscode/markdown-light.css

# 2. Reference it from .vscode/settings.json
```

```jsonc
// .vscode/settings.json
{
  "markdown.styles": [".vscode/markdown-light.css"]
}
```

Then reload the markdown preview (`Ctrl+Shift+V`).

## Alternative: ship it under .github/config/

If you're an Alex Edition heir, the file already lives at `.github/config/markdown-light.css`. Reference it as:

```jsonc
{ "markdown.styles": [".github/config/markdown-light.css"] }
```

## Customizing

Heir-owned by convention — once installed, edit freely. Common tweaks:

- Search for `--bg` and `--fg` CSS custom properties at the top to swap palette
- Code-block font is `ui-monospace, SF Mono, Cascadia Mono, ...` — change near `code, pre`
- Mermaid container has its own selector (`.mermaid`) — adjust max-width / centering there

## License

Inherits the Mall's MIT license. No attribution required.
