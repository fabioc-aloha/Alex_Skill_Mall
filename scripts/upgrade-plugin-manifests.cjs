#!/usr/bin/env node
/**
 * upgrade-plugin-manifests.cjs -- apply P8-P10 design changes to existing plugins.
 *
 * Walks plugins/<category>/<name>/plugin.json and:
 *   1. Adds author field (default placeholder)
 *   2. Adds keywords (extracted from description + name)
 *   3. Adds engines field (default: ["copilot"])
 *   4. Reads .claude-plugin/plugin.json if present (P8 backward compat) and merges
 *   5. Recalculates token_cost from actual files
 *   6. Regenerates README.md with engines + keywords info
 *   7. Regenerates CATALOG.json with new fields
 *
 * Usage:
 *   node scripts/upgrade-plugin-manifests.cjs              # dry-run
 *   node scripts/upgrade-plugin-manifests.cjs --apply      # execute
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PLUGINS_DIR = path.join(ROOT, 'plugins');
const APPLY = process.argv.includes('--apply');

function extractKeywords(name, description) {
  const words = new Set();
  // From name (split on hyphens)
  for (const w of name.split('-')) {
    if (w.length > 2) words.add(w.toLowerCase());
  }
  // From description (significant words)
  const stopWords = new Set(['the','a','an','and','or','for','to','in','of','on','with','is','are','that','this','from','as','by','it','at','be','was','has','have','not','but','can','will','do','if','no','so','up','out','about','into','when','than','them','then','its','your','our','all','also','each','how','may','most','new','now','old','see','use','via','any','its','per','two','way','get','set','add','run','one','own','just']);
  for (const w of (description || '').toLowerCase().replace(/[^a-z0-9\s-]/g, '').split(/\s+/)) {
    if (w.length > 3 && !stopWords.has(w)) words.add(w);
  }
  return Array.from(words).slice(0, 8);
}

function estimateTokens(dir) {
  let total = 0;
  for (const f of fs.readdirSync(dir)) {
    const fp = path.join(dir, f);
    if (fs.statSync(fp).isFile() && !f.endsWith('.json')) {
      total += fs.readFileSync(fp, 'utf8').length;
    }
  }
  return Math.ceil(total / 4);
}

function generateReadme(pj) {
  const desc = (pj.description || '').replace(/[\u2014\u2013]/g, '--');
  const title = pj.title || pj.name;
  const engines = (pj.engines || ['copilot']).join(', ');

  let md = `# ${title}\n\n`;
  md += `${desc}\n\n`;
  md += `## Quick Facts\n\n`;
  md += `| Field | Value |\n`;
  md += `| --- | --- |\n`;
  md += `| **Category** | ${pj.category} |\n`;
  md += `| **Shape** | \`${pj.shape}\` |\n`;
  md += `| **Tier** | ${pj.tier} |\n`;
  md += `| **Token cost** | ~${pj.token_cost} tokens |\n`;
  md += `| **Engines** | ${engines} |\n`;
  md += `| **Requires Edition** | ${pj.requires_edition} |\n`;
  if (pj.keywords && pj.keywords.length > 0) {
    md += `| **Keywords** | ${pj.keywords.join(', ')} |\n`;
  }
  md += `\n`;
  md += `## Installation\n\n`;
  md += `From ACT Edition:\n\n`;
  md += `\`\`\`text\n`;
  md += `/mall install ${pj.name}\n`;
  md += `\`\`\`\n\n`;
  md += `Or manually copy the plugin contents to \`.github/skills/local/${pj.name}/\`.\n\n`;
  md += `## Artifacts\n\n`;
  if (pj.artifacts) {
    for (const [type, file] of Object.entries(pj.artifacts)) {
      md += `- **${type}**: \`${file}\`\n`;
    }
  }
  md += `\n`;

  const shapeDesc = {
    'I...': 'Instruction only -- a behavioral rule loaded into context.',
    '.S..': 'Skill only -- domain knowledge loaded when pattern matches.',
    '.S.M': 'Skill + muscle -- domain knowledge with executable code.',
    'IS..': 'Instruction + skill -- a rule backed by detailed knowledge.',
    'ISP.': 'Full trifecta -- instruction + skill + prompt.',
    'I.P.': 'Instruction + prompt -- a rule with a command entry point.',
    '.SP.': 'Skill + prompt -- knowledge with a command entry point.',
    'ISPM': 'Full stack -- all four artifact types.',
    '.SPM': 'Skill + prompt + muscle -- knowledge, command, and code.',
  };
  md += `## Shape: \`${pj.shape}\`\n\n`;
  md += `${shapeDesc[pj.shape] || 'See shape notation in the Mall README.'}\n`;

  return md;
}

function main() {
  const categories = fs.readdirSync(PLUGINS_DIR, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(e => e.name);

  let updated = 0;
  let skipped = 0;
  const allPlugins = [];

  for (const cat of categories) {
    const catDir = path.join(PLUGINS_DIR, cat);
    const plugins = fs.readdirSync(catDir, { withFileTypes: true })
      .filter(e => e.isDirectory())
      .map(e => e.name);

    for (const name of plugins) {
      const pluginDir = path.join(catDir, name);
      const pjPath = path.join(pluginDir, 'plugin.json');

      if (!fs.existsSync(pjPath)) {
        skipped++;
        continue;
      }

      const pj = JSON.parse(fs.readFileSync(pjPath, 'utf8'));

      // P8: Read .claude-plugin/plugin.json if present, merge upstream fields
      const claudeManifest = path.join(pluginDir, '.claude-plugin', 'plugin.json');
      if (fs.existsSync(claudeManifest)) {
        const cpj = JSON.parse(fs.readFileSync(claudeManifest, 'utf8'));
        if (cpj.author && !pj.author) pj.author = cpj.author;
        if (cpj.keywords && !pj.keywords) pj.keywords = cpj.keywords;
        if (cpj.version && pj.version === '1.0.0') pj.version = cpj.version;
      }

      // P9: Add engines (default copilot)
      if (!pj.engines) {
        pj.engines = ['copilot'];
      }

      // P10: Add author placeholder if missing
      if (!pj.author) {
        pj.author = { name: 'ACT Plugin Mall' };
      }

      // P10: Generate keywords if missing
      if (!pj.keywords || pj.keywords.length === 0) {
        pj.keywords = extractKeywords(pj.name, pj.description);
      }

      // Recalculate token_cost
      pj.token_cost = estimateTokens(pluginDir);

      // Add title if missing
      if (!pj.title) {
        // Title from SKILL.md H1
        const skillPath = path.join(pluginDir, 'SKILL.md');
        if (fs.existsSync(skillPath)) {
          const content = fs.readFileSync(skillPath, 'utf8');
          const h1 = content.match(/^#\s+(.+)$/m);
          if (h1) pj.title = h1[1].trim();
        }
        if (!pj.title) pj.title = pj.name;
      }

      // Reorder fields for consistency
      const ordered = {
        name: pj.name,
        version: pj.version || '1.0.0',
        description: (pj.description || '').replace(/[\u2014\u2013]/g, '--'),
        author: pj.author,
        keywords: pj.keywords,
        engines: pj.engines,
        shape: pj.shape,
        category: pj.category,
        tier: pj.tier || 'standard',
        token_cost: pj.token_cost,
        requires_edition: pj.requires_edition || '>=1.0.0',
        requires_plugins: pj.requires_plugins || [],
        artifacts: pj.artifacts,
        install_paths: pj.install_paths,
      };

      if (APPLY) {
        fs.writeFileSync(pjPath, JSON.stringify(ordered, null, 2) + '\n');
        // Regenerate README
        fs.writeFileSync(path.join(pluginDir, 'README.md'), generateReadme(ordered));
      }

      allPlugins.push(ordered);
      updated++;
    }
  }

  console.log(`Plugin Manifest Upgrade (P8-P10)`);
  console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY-RUN'}`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped (no plugin.json): ${skipped}`);

  // Shape distribution
  const shapes = {};
  for (const p of allPlugins) {
    shapes[p.shape] = (shapes[p.shape] || 0) + 1;
  }
  console.log('\nShape distribution:');
  for (const [shape, count] of Object.entries(shapes).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${shape}: ${count}`);
  }

  // Regenerate CATALOG.json
  if (APPLY) {
    const catStats = {};
    for (const p of allPlugins) {
      catStats[p.category] = (catStats[p.category] || 0) + 1;
    }

    const catalog = {
      schema_version: '2.1',
      generated_at: new Date().toISOString(),
      plugin_count: allPlugins.length,
      category_count: Object.keys(catStats).length,
      categories: Object.entries(catStats)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count })),
      plugins: allPlugins.map(p => ({
        name: p.name,
        title: p.title || p.name,
        category: p.category,
        shape: p.shape,
        tier: p.tier,
        engines: p.engines,
        token_cost: p.token_cost,
        description: p.description,
        keywords: p.keywords,
        requires_edition: p.requires_edition,
        requires_plugins: p.requires_plugins,
        path: `plugins/${p.category}/${p.name}/`,
        artifacts: Object.values(p.artifacts || {}),
      })),
    };

    fs.writeFileSync(
      path.join(ROOT, 'CATALOG.json'),
      JSON.stringify(catalog, null, 2) + '\n'
    );
    console.log('\nRegenerated CATALOG.json (schema 2.1)');
  }

  if (!APPLY) {
    console.log('\nDry-run complete. Re-run with --apply to execute.');
    if (allPlugins.length > 0) {
      console.log('\nSample updated plugin.json:');
      console.log(JSON.stringify(allPlugins[0], null, 2));
    }
  }
}

main();
