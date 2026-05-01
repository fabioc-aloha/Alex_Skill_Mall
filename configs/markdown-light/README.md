# markdown-light

GitHub-flavored markdown preview theme for VS Code. Polished, readable, drop-in.

## What it is

A ~21KB CSS file that styles VS Code's built-in markdown preview to match GitHub.com's rendering — better typography, code blocks, tables, callouts, and Mermaid container styling than the default theme.

## Install

The CSS ships in `.vscode/markdown-light.css` and is already configured in `.vscode/settings.json`:

```jsonc
// .vscode/settings.json (already set)
{
  "markdown.styles": [".vscode/markdown-light.css"]
}
```

For other projects, copy the CSS into your `.vscode/` folder:

```bash
cp ~/Alex_Skill_Mall/.vscode/markdown-light.css .vscode/markdown-light.css
```

Then add `"markdown.styles": [".vscode/markdown-light.css"]` to your `.vscode/settings.json`.

## Customizing

Heir-owned by convention — once installed, edit freely. Common tweaks:

- Search for `--bg` and `--fg` CSS custom properties at the top to swap palette
- Code-block font is `ui-monospace, SF Mono, Cascadia Mono, ...` — change near `code, pre`
- Mermaid container has its own selector (`.mermaid`) — adjust max-width / centering there

## License

Inherits the Mall's MIT license. No attribution required.
