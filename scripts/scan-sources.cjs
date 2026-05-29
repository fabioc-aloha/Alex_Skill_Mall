#!/usr/bin/env node
/**
 * scan-sources.cjs
 *
 * Walks every source store (third-party clones + the plugin-mall self-entry)
 * and emits one catalog/stores/<store>.json per store with:
 *   - Store metadata (name, remote, plugin_dir, tier, provenance, license, github_stats placeholder)
 *   - Per-plugin entries with:
 *       - name, source_path, source_url
 *       - frontmatter.raw (verbatim YAML/JSON from the source frontmatter)
 *       - frontmatter.kind ('skill-md' | 'plugin-json' | 'agent-md' | 'none')
 *       - readme_excerpt (first non-heading line, ≤ 200 chars)
 *
 * Trust scoring, frontmatter normalization (standard + extended layers), version
 * discovery (available_refs), markdown rendering — these are downstream Phase 3
 * scripts. scan-sources.cjs writes the catalog skeleton only.
 *
 * Path resolution rules (per mall-self-curation/SKILL.md):
 *   - Third-party store: walk $SOURCES_DIR/<local_dir_name || name>/<plugin_dir>/
 *   - plugin-mall: walk $REPO_ROOT/<plugin_dir>/ (this repo itself; ignore SOURCES_DIR)
 *
 * Usage:
 *   SOURCES_DIR=/tmp/sources node scripts/scan-sources.cjs
 *   node scripts/scan-sources.cjs                          # SOURCES_DIR defaults to ../MALL
 *   node scripts/scan-sources.cjs --store plugin-mall      # single-store mode
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const SOURCES_DIR = process.env.SOURCES_DIR || path.join(REPO_ROOT, '..', 'MALL');
const SUPPORTED_PATH = path.join(REPO_ROOT, 'sources', 'supported-stores.json');
const CATALOG_STORES_DIR = path.join(REPO_ROOT, 'catalog', 'stores');

const STORE_ARG_IDX = process.argv.indexOf('--store');
const SINGLE_STORE = STORE_ARG_IDX > -1 ? process.argv[STORE_ARG_IDX + 1] : null;

const SUPPORTED = JSON.parse(fs.readFileSync(SUPPORTED_PATH, 'utf-8'));

if (!fs.existsSync(CATALOG_STORES_DIR)) {
  fs.mkdirSync(CATALOG_STORES_DIR, { recursive: true });
}

// --- Frontmatter extraction (raw layer only; Phase 3b adds standard + extended layers) ---

function readSafe(p) {
  try { return fs.readFileSync(p, 'utf-8'); } catch { return null; }
}

function parseYamlFrontmatter(text) {
  if (!text || !text.startsWith('---')) return null;
  const end = text.indexOf('\n---', 3);
  if (end < 0) return null;
  const body = text.slice(3, end);
  const data = {};
  for (const rawLine of body.split('\n')) {
    if (!rawLine.trim() || rawLine.trim().startsWith('#')) continue;
    // Indented continuation: skip (we capture key-value pairs only at this layer)
    if (/^\s/.test(rawLine)) continue;
    // Unindented list item: skip
    if (/^-\s/.test(rawLine)) continue;
    const t = rawLine.trim();
    const m = t.match(/^([A-Za-z0-9_.-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    if (v.startsWith("'") && v.endsWith("'")) v = v.slice(1, -1);
    if (v === '|' || v === '>' || v === '|-' || v === '>-' || v === '') {
      data[m[1]] = '';
      continue;
    }
    data[m[1]] = v;
  }
  return data;
}

function extractReadmeExcerpt(pluginPath) {
  const readmePath = path.join(pluginPath, 'README.md');
  const txt = readSafe(readmePath);
  if (!txt) return null;
  for (const line of txt.split('\n')) {
    const t = line.trim();
    if (t && !t.startsWith('#') && !t.startsWith('!') && !t.startsWith('<') && t.length > 10) {
      return t.slice(0, 200);
    }
  }
  return null;
}

function classifyFrontmatter(pluginPath) {
  // Returns { kind, raw } where kind is one of:
  //   'skill-md'     — SKILL.md with YAML frontmatter
  //   'plugin-json'  — plugin.json file
  //   'agent-md'     — AGENT.md or root-level *.md with YAML frontmatter
  //   'none'         — no recognized frontmatter source

  // 1. SKILL.md (most common in the Mall + most third-party stores)
  const skillPath = path.join(pluginPath, 'SKILL.md');
  if (fs.existsSync(skillPath)) {
    const txt = readSafe(skillPath);
    const raw = parseYamlFrontmatter(txt);
    if (raw) return { kind: 'skill-md', raw };
  }

  // 2. plugin.json (Claude plugin convention)
  const pluginJsonPath = path.join(pluginPath, 'plugin.json');
  if (fs.existsSync(pluginJsonPath)) {
    try {
      const raw = JSON.parse(readSafe(pluginJsonPath) || '{}');
      return { kind: 'plugin-json', raw };
    } catch { /* malformed */ }
  }

  // 3. agency.json (legacy Claude convention)
  const agencyJsonPath = path.join(pluginPath, 'agency.json');
  if (fs.existsSync(agencyJsonPath)) {
    try {
      const raw = JSON.parse(readSafe(agencyJsonPath) || '{}');
      return { kind: 'plugin-json', raw };
    } catch { /* malformed */ }
  }

  // 4. AGENT.md
  const agentPath = path.join(pluginPath, 'AGENT.md');
  if (fs.existsSync(agentPath)) {
    const raw = parseYamlFrontmatter(readSafe(agentPath));
    if (raw) return { kind: 'agent-md', raw };
  }

  // 5. README.md with frontmatter (rare but valid)
  const readmePath = path.join(pluginPath, 'README.md');
  if (fs.existsSync(readmePath)) {
    const raw = parseYamlFrontmatter(readSafe(readmePath));
    if (raw) return { kind: 'agent-md', raw };
  }

  return { kind: 'none', raw: {} };
}

function inferShape(pluginPath, frontmatter) {
  // Shape: skill | agent | prompt | mcp | hook | mixed
  if (frontmatter.kind === 'plugin-json' && frontmatter.raw.shape) return frontmatter.raw.shape;
  if (fs.existsSync(path.join(pluginPath, '.mcp.json'))) return 'mcp';
  if (fs.existsSync(path.join(pluginPath, 'hooks')) || fs.existsSync(path.join(pluginPath, 'hooks.json'))) return 'hook';
  if (fs.existsSync(path.join(pluginPath, 'SKILL.md'))) return 'skill';
  if (fs.existsSync(path.join(pluginPath, 'AGENT.md'))) return 'agent';
  // Sub-folder hints (Mall layout uses skills/, agents/, prompts/ subdirs inside categories)
  if (fs.existsSync(path.join(pluginPath, 'skills'))) return 'skill';
  if (fs.existsSync(path.join(pluginPath, 'agents'))) return 'agent';
  if (fs.existsSync(path.join(pluginPath, 'prompts'))) return 'prompt';
  return 'unknown';
}

// --- Per-store walker ---

function resolveStoreRoot(store) {
  // plugin-mall: scan this repo itself (Mall self-scan).
  // third-party: scan $SOURCES_DIR/<local_dir_name || name>.
  if (store.name === 'plugin-mall') {
    return REPO_ROOT;
  }
  const dirName = store.local_dir_name || store.name;
  return path.join(SOURCES_DIR, dirName);
}

function buildSourceUrl(store, pluginRelPath, ref) {
  // GitHub tree URL for the plugin at the given ref. For plugin-mall we use 'main'
  // as a placeholder (Phase 3c list-refs.cjs will refine with actual scanned_ref).
  if (!store.remote) return null;
  const remote = store.remote.replace(/\.git$/, '');
  return `${remote}/tree/${ref}/${pluginRelPath}`;
}

function listPluginCandidates(pluginsRoot) {
  // For Mall self-scan, plugins live two levels deep: plugins/<category>/<name>/.
  // For third-party stores, plugins live one level deep: <plugin_dir>/<name>/.
  // Heuristic: a 'plugin candidate' is a directory with at least one of:
  //   plugin.json, agency.json, SKILL.md, AGENT.md, .mcp.json, agent.md,
  //   skills/, agents/, hooks/, hooks.json, README.md
  // Recurse one level if the immediate child has no markers and contains
  // sub-folders that DO have markers (handles Mall's plugins/<category>/<name>/).
  if (!fs.existsSync(pluginsRoot)) return [];
  const candidates = [];

  function hasPluginMarkers(dp) {
    return fs.existsSync(path.join(dp, 'plugin.json'))
      || fs.existsSync(path.join(dp, 'agency.json'))
      || fs.existsSync(path.join(dp, 'SKILL.md'))
      || fs.existsSync(path.join(dp, 'AGENT.md'))
      || fs.existsSync(path.join(dp, '.mcp.json'))
      || fs.existsSync(path.join(dp, 'skills'))
      || fs.existsSync(path.join(dp, 'agents'))
      || fs.existsSync(path.join(dp, 'hooks'))
      || fs.existsSync(path.join(dp, 'hooks.json'))
      || fs.existsSync(path.join(dp, 'README.md'));
  }

  function walk(dir, depth, relParts) {
    if (depth > 2) return;
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const d of entries) {
      if (!d.isDirectory() || d.name.startsWith('.')) continue;
      if (d.name === 'node_modules') continue;
      const dp = path.join(dir, d.name);
      const newRelParts = [...relParts, d.name];
      if (hasPluginMarkers(dp)) {
        candidates.push({ absPath: dp, relPath: newRelParts.join('/'), name: d.name });
      } else if (depth === 0) {
        // Recurse one level for Mall-style plugins/<category>/<name> layout
        walk(dp, depth + 1, newRelParts);
      }
    }
  }

  walk(pluginsRoot, 0, []);
  return candidates;
}

function scanStore(store) {
  const storeRoot = resolveStoreRoot(store);
  const pluginsRoot = path.join(storeRoot, store.pluginDir);

  const out = {
    store: store.name,
    source_repo: store.remote,
    generated_at: new Date().toISOString(),
    scanned_ref: 'main', // Phase 3c list-refs.cjs will refine with actual SHA per plugin
    provenance: !!store.provenance,
    tier: store.quality,
    license: store.license || null,
    plugin_count: 0,
    plugins: [],
  };

  if (!fs.existsSync(pluginsRoot)) {
    out.error = `pluginsRoot not found: ${pluginsRoot}`;
    return out;
  }

  const candidates = listPluginCandidates(pluginsRoot);

  for (const c of candidates) {
    const frontmatter = classifyFrontmatter(c.absPath);
    const readmeExcerpt = extractReadmeExcerpt(c.absPath);
    const shape = inferShape(c.absPath, frontmatter);

    // Build the source_path relative to the source repo root (e.g. 'skills/code-review/')
    const sourcePathParts = [store.pluginDir, c.relPath].filter((p) => p && p !== '.');
    const sourcePath = sourcePathParts.join('/');

    out.plugins.push({
      name: c.name,
      shape,
      source_path: sourcePath,
      source_url: buildSourceUrl(store, sourcePath, out.scanned_ref),
      readme_excerpt: readmeExcerpt,
      frontmatter: {
        kind: frontmatter.kind,
        raw: frontmatter.raw,
        // standard + extended layers added by Phase 3b normalize-frontmatter.cjs
      },
      // available_refs added by Phase 3c list-refs.cjs
      // trust_score + trust_signals added by Phase 3d compute-trust.cjs
    });
  }

  out.plugin_count = out.plugins.length;
  return out;
}

// --- Idempotency: compare two store records on scan-owned fields only ---

function projectScanOwned(record) {
  // scan-sources writes: store, source_repo, provenance, tier, license,
  // plugin_count, error (sometimes), and for each plugin: name, shape,
  // source_path, readme_excerpt, frontmatter.kind, frontmatter.raw.
  //
  // Downstream phases overwrite or extend several scan-owned fields:
  //   - list-refs.cjs:  scanned_ref (placeholder 'main' -> real SHA),
  //                     plugins[*].source_url (placeholder ref -> real SHA),
  //                     plugins[*].available_refs (new field)
  //   - normalize-frontmatter.cjs: plugins[*].frontmatter.standard + extended
  //   - compute-trust.cjs:         store_trust, plugins[*].trust_score + signals
  //
  // For idempotency, project away every field a downstream phase touches.
  if (!record) return null;
  return {
    store: record.store,
    source_repo: record.source_repo,
    provenance: record.provenance,
    tier: record.tier,
    license: record.license,
    plugin_count: record.plugin_count,
    error: record.error || null,
    plugins: (record.plugins || []).map((p) => ({
      name: p.name,
      shape: p.shape,
      source_path: p.source_path,
      readme_excerpt: p.readme_excerpt,
      frontmatter_kind: p.frontmatter?.kind,
      frontmatter_raw: p.frontmatter?.raw,
    })),
  };
}

function semanticallyEqual(prior, next) {
  return JSON.stringify(projectScanOwned(prior)) === JSON.stringify(projectScanOwned(next));
}

// --- Main ---

function main() {
  const stores = SUPPORTED.stores.filter((s) => !SINGLE_STORE || s.name === SINGLE_STORE);

  if (stores.length === 0) {
    console.error(`No matching stores (--store ${SINGLE_STORE} not found in registry)`);
    process.exit(1);
  }

  console.log(`Scan-sources: walking ${stores.length} stores`);
  console.log(`SOURCES_DIR: ${SOURCES_DIR}`);
  console.log(`REPO_ROOT:   ${REPO_ROOT}`);
  console.log('');

  let totalPlugins = 0;
  let storesWithErrors = 0;
  const summary = [];

  for (const store of stores) {
    process.stdout.write(`SCAN: ${store.name}... `);
    const result = scanStore(store);
    const outPath = path.join(CATALOG_STORES_DIR, `${store.name}.json`);

    // Idempotency: if the prior file's scan-owned fields are identical to this
    // run's output, preserve the prior generated_at timestamp. Downstream phases
    // (normalize-frontmatter, list-refs, compute-trust) add fields scan-sources
    // doesn't own — strip those before comparing.
    if (fs.existsSync(outPath)) {
      try {
        const prior = JSON.parse(fs.readFileSync(outPath, 'utf-8'));
        if (semanticallyEqual(prior, result)) {
          result.generated_at = prior.generated_at;
        }
      } catch { /* prior was malformed; treat as fresh */ }
    }

    fs.writeFileSync(outPath, JSON.stringify(result, null, 2) + '\n');
    if (result.error) {
      console.log(`ERROR: ${result.error}`);
      storesWithErrors++;
    } else {
      console.log(`${result.plugin_count} plugins`);
    }
    totalPlugins += result.plugin_count;
    summary.push({ name: store.name, count: result.plugin_count, provenance: result.provenance, error: result.error || null });
  }

  console.log('');
  console.log('=== Scan summary ===');
  console.log(`Stores scanned:    ${stores.length}`);
  console.log(`Stores with error: ${storesWithErrors}`);
  console.log(`Total plugins:     ${totalPlugins}`);
  console.log(`Output:            ${CATALOG_STORES_DIR}/*.json`);

  // Top 10 stores by plugin count (gives a quick distribution check)
  const top = [...summary].sort((a, b) => b.count - a.count).slice(0, 10);
  console.log('');
  console.log('Top 10 stores by plugin count:');
  for (const t of top) {
    const flag = t.provenance ? ' [first-party]' : '';
    const err = t.error ? ' [ERROR]' : '';
    console.log(`  ${t.count.toString().padStart(5)} ${t.name}${flag}${err}`);
  }
}

main();
