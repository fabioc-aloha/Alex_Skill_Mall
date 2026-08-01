#!/usr/bin/env node
/**
 * generate-banner.cjs
 *
 * Mechanical SVG banner generator with a pluggable brand.
 *
 * What it does:
 *   - Reads the master brand palette from `.github/config/brand-palette.json`
 *     for colors + typography (shared with markdown-mermaid, illustrator agent,
 *     and flint-chart via the same file).
 *   - Reads structure-only values (labels, mark image, watermark whitelist)
 *     from `.github/config/banner-brand.json`.
 *   - Substitutes title / subtitle / watermark into a fixed 1200x320 template.
 *   - Writes the SVG to assets/banner-<slug>.svg (or a path you specify).
 *   - Validates inputs (lengths, watermark whitelist from the config).
 *
 * What it does NOT do (those are LLM/skill jobs):
 *   - Choose a good subtitle.
 *   - Pick the right watermark category.
 *   - Convert SVG to PNG.
 *
 * Layout, dimensions, and typography scale are intentionally fixed. The
 * shape is calibrated for readability at 1200x320. Fork the script if you
 * need a different banner shape.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const MAX_TITLE_LEN = 32;       // 56px text fits ~32 chars in a 700px box
const MAX_SUBTITLE_LEN = 80;    // 18px text fits ~80 chars in 700px
const DEFAULT_BRAND_CONFIG_PATH = '.github/config/banner-brand.json';
const DEFAULT_PALETTE_PATH = '.github/config/brand-palette.json';

// Built-in fallback palette if brand-palette.json is missing. Matches the
// Alex ACT default shipped in .github/config/brand-palette.json.
const DEFAULT_PALETTE = {
    brand: {
        primary: '#10b981',
        primaryDark: '#0f172a',
        primaryLight: '#f1f5f9',
        muted: '#94a3b8'
    },
    gradient: ['#10b981', '#14b8a6', '#06b6d4'],
    typography: {
        fontStack: 'Segoe UI, Helvetica, Arial, sans-serif',
        textOnDark: '#f1f5f9',
        textOnLight: '#1f2937'
    }
};

// Built-in fallback structure config if banner-brand.json is missing.
const DEFAULT_BANNER_STRUCTURE = {
    brand: {
        label: 'ALEX',
        subLabel: 'ARTIFICIAL CRITICAL THINKING'
    },
    mark: {
        // Fallback mark path resolves relative to this script's own assets/
        // folder so the fallback works even when cwd is not the repo root.
        path: path.join(__dirname, '..', 'assets', 'mark-mono-emerald-256.png'),
        width: 170,
        height: 170,
        x: 970,
        y: 42
    },
    watermarks: ['ACT', 'EDITION', 'DOCS', 'RELEASE', 'PLAN', 'NOTE']
};

function loadJsonOrExit(filePath, label) {
    if (!fs.existsSync(filePath)) return null;
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (err) {
        console.error(`ERROR: failed to parse ${label} at ${filePath}: ${err.message}`);
        process.exit(1);
    }
}

function loadConfigs(brandConfigOverride, paletteOverride) {
    const paletteTry = paletteOverride || path.resolve(process.cwd(), DEFAULT_PALETTE_PATH);
    const brandTry = brandConfigOverride || path.resolve(process.cwd(), DEFAULT_BRAND_CONFIG_PATH);

    const paletteRaw = loadJsonOrExit(paletteTry, 'brand palette');
    const brandRaw = loadJsonOrExit(brandTry, 'banner-brand config');

    if (paletteOverride && !paletteRaw) {
        console.error(`ERROR: --palette-config file not found: ${paletteOverride}`);
        process.exit(1);
    }
    if (brandConfigOverride && !brandRaw) {
        console.error(`ERROR: --brand-config file not found: ${brandConfigOverride}`);
        process.exit(1);
    }

    const palette = mergePalette(DEFAULT_PALETTE, paletteRaw);
    const structure = mergeStructure(DEFAULT_BANNER_STRUCTURE, brandRaw);

    return {
        palette,
        structure,
        paletteSource: paletteRaw ? paletteTry : '(built-in default)',
        brandSource: brandRaw ? brandTry : '(built-in default)'
    };
}

function mergePalette(defaults, override) {
    if (!override) return defaults;
    return {
        brand: { ...defaults.brand, ...(override.brand || {}) },
        gradient: override.gradient || defaults.gradient,
        typography: { ...defaults.typography, ...(override.typography || {}) }
    };
}

function mergeStructure(defaults, override) {
    if (!override) return defaults;
    return {
        brand: { ...defaults.brand, ...(override.brand || {}) },
        mark: { ...defaults.mark, ...(override.mark || {}) },
        watermarks: override.watermarks || defaults.watermarks
    };
}

function derivedColors(palette) {
    // Map master-palette semantic names to the banner-specific color slots.
    return {
        background: palette.brand.primaryDark,
        accent1: palette.gradient[0],
        accent2: palette.gradient[1],
        accent3: palette.gradient[2],
        title: palette.typography.textOnDark,
        subtitle: palette.brand.muted,
        brandLabel: palette.brand.primary,
        brandSubLabel: palette.brand.muted,
        watermark: palette.typography.textOnDark
    };
}

function resolveMarkPath(markPath) {
    // Absolute path: use as-is. Relative path: resolve against cwd (which is
    // expected to be the repo root when using the default config).
    if (path.isAbsolute(markPath)) return markPath;
    return path.resolve(process.cwd(), markPath);
}

function parseArgs(argv) {
    const out = {};
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--help' || a === '-h') { out.help = true; continue; }
        if (a === '--force') { out.force = true; continue; }
        if (a.startsWith('--')) {
            const eq = a.indexOf('=');
            if (eq > 0) {
                out[a.slice(2, eq)] = a.slice(eq + 1);
            } else {
                out[a.slice(2)] = argv[i + 1];
                i++;
            }
        }
    }
    return out;
}

function slugify(s) {
    return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
}

function escapeXml(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function buildSvg({ title, subtitle, watermark, palette, structure }) {
    const T = escapeXml(title);
    const S = escapeXml(subtitle);
    const W = escapeXml(watermark);
    const c = derivedColors(palette);
    const font = palette.typography.fontStack;
    const b = structure.brand;
    const m = structure.mark;
    const markPath = resolveMarkPath(m.path);
    const mark = fs.readFileSync(markPath).toString('base64');

    // Approximate brand-label + gap + sub-label width for the accent bar.
    // Bold 15px sans-serif averages ~9px per uppercase char with a small margin
    // and ~7.5px per char for 13px semibold. Clamp the bar to a sane range.
    const labelWidth = b.label.length * 9;
    const subLabelX = 40 + labelWidth + 12;
    const subLabelWidth = b.subLabel.length * 7;
    const barWidth = Math.max(140, Math.min(340, labelWidth + 12 + subLabelWidth));

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 320" width="1200" height="320" role="img" aria-label="${T}: ${S}">
  <title>${T}</title>
  <desc>${S}</desc>

  <defs>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="${c.accent1}"/>
    <stop offset="50%" stop-color="${c.accent2}"/>
    <stop offset="100%" stop-color="${c.accent3}"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="320" fill="${c.background}"/>

  <!-- Left accent ribbon -->
  <rect x="0" y="0" width="6" height="320" fill="url(#accent)"/>

  <!-- Ghost watermark -->
  <text x="1180" y="286" font-family="${font}"
        font-size="100" font-weight="800" fill="${c.watermark}" opacity="0.10" text-anchor="end">${W}</text>

  <!-- Brand mark -->
  <image x="${m.x}" y="${m.y}" width="${m.width}" height="${m.height}" href="data:image/png;base64,${mark}" preserveAspectRatio="xMidYMid meet"/>

  <!-- Brand label -->
  <text x="40" y="72" font-family="${font}"
      font-size="15" font-weight="700" fill="${c.brandLabel}" letter-spacing="0">${escapeXml(b.label)}</text>
  <text x="${subLabelX}" y="72" font-family="${font}"
      font-size="13" font-weight="600" fill="${c.brandSubLabel}" letter-spacing="0">${escapeXml(b.subLabel)}</text>
  <rect x="40" y="88" width="${barWidth}" height="3" rx="1.5" fill="url(#accent)"/>

  <!-- Title -->
  <text x="40" y="178" font-family="${font}"
      font-size="56" font-weight="700" fill="${c.title}" letter-spacing="0">${T}</text>

  <!-- Subtitle -->
  <text x="40" y="224" font-family="${font}"
      font-size="18" font-weight="600" fill="${c.subtitle}" letter-spacing="0">${S}</text>
</svg>
`;
}

function help(structure) {
    const wms = structure.watermarks;
    console.log(`Usage: node generate-banner.cjs --title "..." --subtitle "..." --watermark <CATEGORY> [--out <path>] [--force] [--brand-config <path>] [--palette-config <path>]

Generates a 1200x320 SVG banner into ./assets/. Reads colors + typography from
${DEFAULT_PALETTE_PATH} and structure (labels, mark, watermarks) from
${DEFAULT_BRAND_CONFIG_PATH}. Missing files fall back to built-in Alex ACT defaults.

Required:
  --title "..."           Document title (<= ${MAX_TITLE_LEN} chars)
  --subtitle "..."        One-line purpose statement (<= ${MAX_SUBTITLE_LEN} chars)
  --watermark <CAT>       One of: ${wms.join(', ')}

Optional:
  --out <path>            Output file (default: assets/banner-<title-slug>.svg)
  --force                 Overwrite existing file
  --brand-config <path>   Path to banner structure JSON (default: ${DEFAULT_BRAND_CONFIG_PATH})
  --palette-config <path> Path to brand palette JSON (default: ${DEFAULT_PALETTE_PATH})
  --help, -h              This message

Watermarks (from active brand config):
  ${wms.join(', ')}

Exit codes:
  0  banner written
  1  validation error (bad inputs, missing/invalid config)
  2  filesystem error (file exists without --force, write failed)
`);
}

function main() {
    const args = parseArgs(process.argv.slice(2));

    const { palette, structure, paletteSource, brandSource } =
        loadConfigs(args['brand-config'], args['palette-config']);

    if (args.help) { help(structure); process.exit(0); }

    const errors = [];
    const title = args.title;
    const subtitle = args.subtitle;
    const watermark = args.watermark;

    if (!title) errors.push('--title is required');
    else if (title.length > MAX_TITLE_LEN) errors.push(`--title too long (${title.length} > ${MAX_TITLE_LEN})`);

    if (!subtitle) errors.push('--subtitle is required');
    else if (subtitle.length > MAX_SUBTITLE_LEN) errors.push(`--subtitle too long (${subtitle.length} > ${MAX_SUBTITLE_LEN})`);

    if (!watermark) errors.push('--watermark is required');
    else if (!structure.watermarks.includes(watermark.toUpperCase())) {
        errors.push(`--watermark must be one of: ${structure.watermarks.join(', ')}`);
    }

    if (errors.length) {
        console.error('ERROR: invalid inputs');
        errors.forEach(e => console.error('  -', e));
        console.error(`\nActive palette: ${paletteSource}`);
        console.error(`Active brand config: ${brandSource}`);
        console.error('Run with --help for usage.');
        process.exit(1);
    }

    const slug = slugify(title);
    const outPath = path.resolve(process.cwd(), args.out || path.join('assets', `banner-${slug}.svg`));

    if (fs.existsSync(outPath) && !args.force) {
        console.error(`ERROR: ${outPath} already exists. Re-run with --force to overwrite.`);
        process.exit(2);
    }

    try {
        fs.mkdirSync(path.dirname(outPath), { recursive: true });
        const svg = buildSvg({ title, subtitle, watermark: watermark.toUpperCase(), palette, structure });
        fs.writeFileSync(outPath, svg);
    } catch (err) {
        console.error('ERROR: write failed —', err.message);
        process.exit(2);
    }

    const rel = path.relative(process.cwd(), outPath).replace(/\\/g, '/');
    console.log(`Wrote ${rel} (${title.length}c title, ${subtitle.length}c subtitle, ${watermark.toUpperCase()})`);
    console.log(`Palette: ${paletteSource}`);
    console.log(`Brand: ${brandSource}`);
    console.log(`Embed in markdown: ![Banner](${rel})`);
    process.exit(0);
}

main();
