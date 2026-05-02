#!/usr/bin/env node
/**
 * convert-to-plugins.cjs -- batch convert Skill Mall to Plugin Mall v2.
 *
 * Reads CATALOG.json, reorganizes into 16 categories, generates
 * plugin.json + README.md for each plugin, writes CATALOG-v2.json.
 *
 * Usage:
 *   node scripts/convert-to-plugins.cjs              # dry-run
 *   node scripts/convert-to-plugins.cjs --apply      # execute
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SKILLS_DIR = path.join(ROOT, 'skills');
const APPLY = process.argv.includes('--apply');

// ── Category mapping (35 old -> 16 new) ────────────────────────────
const CATEGORY_MAP = {
    'academic': 'academic-research',
    'ai-llm': 'ai-agents',
    'architecture': 'architecture-patterns',
    'azure': 'cloud-infrastructure',
    'build': 'devops-process',
    'cloud': 'cloud-infrastructure',
    'communication': 'communication-people',
    'converters': 'converters',
    'critical-thinking': 'reasoning-metacognition',
    'cross-platform': 'platform-tooling',
    'data': 'data-analytics',
    'design': 'media-graphics',
    'documentation': 'documentation',
    'domain': 'domain-expertise',
    'frontend': 'platform-tooling',
    'github': 'devops-process',
    'github-actions': 'devops-process',
    'infrastructure': 'cloud-infrastructure',
    'javascript': 'platform-tooling',
    'media': 'media-graphics',
    'operations': 'devops-process',
    'people': 'communication-people',
    'performance': 'code-quality',
    'privacy': 'security-privacy',
    'process': 'devops-process',
    'productivity': 'devops-process',
    'publishing': 'documentation',
    'quality': 'code-quality',
    'security': 'security-privacy',
    'supervisor': 'supervisor-fleet',
    'testing': 'code-quality',
    'visual': 'media-graphics',
    'vitepress': 'documentation',
    'vscode': 'platform-tooling',
    'windows-node': 'platform-tooling',
};

// ── Shape detection ────────────────────────────────────────────────
function detectShape(dir) {
    if (!fs.existsSync(dir)) return '.S..';
    const files = fs.readdirSync(dir);
    const hasSkill = files.some(f => f === 'SKILL.md');
    const hasInstruction = files.some(f => f.endsWith('.instructions.md'));
    const hasPrompt = files.some(f => f.endsWith('.prompt.md'));
    const hasMuscle = files.some(f => f.endsWith('.cjs'));
    let shape = '';
    shape += hasInstruction ? 'I' : '.';
    shape += hasSkill ? 'S' : '.';
    shape += hasPrompt ? 'P' : '.';
    shape += hasMuscle ? 'M' : '.';
    return shape;
}

// ── Frontmatter parser ─────────────────────────────────────────────
function parseFrontmatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return {};
    const fm = {};
    for (const line of match[1].split('\n')) {
        const m = line.match(/^(\w[\w-]*):\s*(.+)/);
        if (m) {
            let val = m[2].trim();
            if ((val.startsWith('"') && val.endsWith('"')) ||
                (val.startsWith("'") && val.endsWith("'"))) {
                val = val.slice(1, -1);
            }
            fm[m[1]] = val;
        }
    }
    return fm;
}

// ── Token cost estimator ───────────────────────────────────────────
function estimateTokens(dir) {
    let total = 0;
    if (!fs.existsSync(dir)) return 0;
    for (const f of fs.readdirSync(dir)) {
        const fp = path.join(dir, f);
        if (fs.statSync(fp).isFile()) {
            total += fs.readFileSync(fp, 'utf8').length;
        }
    }
    return Math.ceil(total / 4);
}

// ── README generator ───────────────────────────────────────────────
function generateReadme(plugin) {
    // Strip em-dashes
    const desc = (plugin.description || '').replace(/[\u2014\u2013]/g, '--');
    const title = (plugin.title || plugin.name).replace(/[\u2014\u2013]/g, '--');

    let md = `# ${title}\n\n`;
    md += `${desc}\n\n`;
    md += `## Quick Facts\n\n`;
    md += `| Field | Value |\n`;
    md += `| --- | --- |\n`;
    md += `| **Category** | ${plugin.category} |\n`;
    md += `| **Shape** | \`${plugin.shape}\` |\n`;
    md += `| **Tier** | ${plugin.tier} |\n`;
    md += `| **Token cost** | ~${plugin.tokenCost} tokens |\n`;
    md += `| **Requires Edition** | >= 1.0.0 |\n`;
    md += `\n`;
    md += `## What This Plugin Does\n\n`;
    md += `${desc}\n\n`;
    md += `## Installation\n\n`;
    md += `\`\`\`text\n`;
    md += `/mall install ${plugin.name}\n`;
    md += `\`\`\`\n\n`;
    md += `Or manually copy the plugin contents to \`.github/skills/local/${plugin.name}/\`.\n\n`;
    md += `## Artifacts Installed\n\n`;
    for (const [type, file] of Object.entries(plugin.artifacts)) {
        md += `- **${type}**: \`${file}\`\n`;
    }
    md += `\n`;
    md += `## Shape: \`${plugin.shape}\`\n\n`;

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
        'ISM.': 'Instruction + skill + muscle.',
        'I..M': 'Instruction + muscle.',
        '..PM': 'Prompt + muscle.',
        '...M': 'Muscle only -- executable code.',
        '..P.': 'Prompt only -- a command entry point.',
    };
    md += `${shapeDesc[plugin.shape] || 'Custom shape.'}\n`;

    return md;
}

// ── Plugin.json generator ──────────────────────────────────────────
function generatePluginJson(plugin) {
    const installPaths = {};
    for (const [type, file] of Object.entries(plugin.artifacts)) {
        if (type === 'skill') {
            installPaths[type] = `.github/skills/local/${plugin.name}/SKILL.md`;
        } else if (type === 'instruction') {
            installPaths[type] = `.github/instructions/local/${file}`;
        } else if (type === 'prompt') {
            installPaths[type] = `.github/prompts/local/${file}`;
        } else if (type === 'muscle') {
            installPaths[type] = `.github/muscles/local/${file}`;
        } else {
            installPaths[type] = `.github/skills/local/${plugin.name}/${file}`;
        }
    }

    return {
        name: plugin.name,
        version: '1.0.0',
        shape: plugin.shape,
        description: (plugin.description || '').replace(/[\u2014\u2013]/g, '--'),
        category: plugin.category,
        tier: plugin.tier || 'standard',
        requires_edition: '>=1.0.0',
        requires_plugins: [],
        token_cost: plugin.tokenCost,
        artifacts: plugin.artifacts,
        install_paths: installPaths,
    };
}

// ── Main ───────────────────────────────────────────────────────────
function main() {
    const catalogPath = path.join(ROOT, 'CATALOG.json');
    const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

    const plugins = [];
    const categoryStats = {};
    const errors = [];

    for (const skill of catalog.skills) {
        const oldCat = skill.category;
        const newCat = CATEGORY_MAP[oldCat];
        if (!newCat) {
            errors.push(`Unknown category "${oldCat}" for ${skill.name}`);
            continue;
        }

        const oldDir = path.join(SKILLS_DIR, oldCat, skill.name);
        if (!fs.existsSync(oldDir)) {
            errors.push(`Missing directory: ${oldDir}`);
            continue;
        }

        const shape = detectShape(oldDir);
        const tokenCost = estimateTokens(oldDir);

        // Build artifacts list from actual files
        const files = fs.readdirSync(oldDir).filter(f =>
            fs.statSync(path.join(oldDir, f)).isFile()
        );
        const artifacts = {};
        for (const f of files) {
            if (f === 'SKILL.md') artifacts.skill = f;
            else if (f.endsWith('.instructions.md')) artifacts.instruction = f;
            else if (f.endsWith('.prompt.md')) artifacts.prompt = f;
            else if (f.endsWith('.cjs')) artifacts.muscle = f;
            else artifacts[f] = f; // other supporting files
        }

        // Get title from frontmatter or catalog
        let title = skill.title || skill.name;
        const skillPath = path.join(oldDir, 'SKILL.md');
        let description = skill.description || '';
        if (fs.existsSync(skillPath)) {
            const content = fs.readFileSync(skillPath, 'utf8');
            const fm = parseFrontmatter(content);
            if (fm.description) description = fm.description;
            // Extract title from first H1
            const h1 = content.match(/^#\s+(.+)$/m);
            if (h1) title = h1[1].trim();
        }

        const plugin = {
            name: skill.name,
            title,
            oldCategory: oldCat,
            category: newCat,
            shape,
            tier: skill.tier || 'standard',
            description,
            tokenCost,
            artifacts,
            oldDir,
        };

        plugins.push(plugin);
        categoryStats[newCat] = (categoryStats[newCat] || 0) + 1;
    }

    // Report
    console.log(`Plugin Mall v2 Conversion`);
    console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY-RUN'}`);
    console.log(`Plugins: ${plugins.length}`);
    console.log(`Errors: ${errors.length}`);
    if (errors.length > 0) {
        for (const e of errors) console.log(`  ERROR: ${e}`);
    }
    console.log('');
    console.log('Category distribution:');
    const sorted = Object.entries(categoryStats).sort((a, b) => b[1] - a[1]);
    for (const [cat, count] of sorted) {
        console.log(`  ${cat}: ${count}`);
    }
    console.log('');

    if (!APPLY) {
        console.log('Dry-run complete. Re-run with --apply to execute.');
        // Write a preview of what would be generated for first plugin
        if (plugins.length > 0) {
            const sample = plugins[0];
            console.log(`\nSample plugin.json for "${sample.name}":`);
            console.log(JSON.stringify(generatePluginJson(sample), null, 2));
            console.log(`\nSample README.md (first 20 lines):`);
            const readme = generateReadme(sample);
            console.log(readme.split('\n').slice(0, 20).join('\n'));
        }
        return;
    }

    // ── Apply mode ─────────────────────────────────────────────────
    console.log('Creating new category structure...');

    // Create new category dirs
    const newSkillsDir = path.join(ROOT, 'plugins');
    fs.mkdirSync(newSkillsDir, { recursive: true });
    for (const cat of Object.values(CATEGORY_MAP)) {
        fs.mkdirSync(path.join(newSkillsDir, cat), { recursive: true });
    }

    // Process each plugin
    let created = 0;
    for (const plugin of plugins) {
        const destDir = path.join(newSkillsDir, plugin.category, plugin.name);
        fs.mkdirSync(destDir, { recursive: true });

        // Copy all existing files
        const files = fs.readdirSync(plugin.oldDir);
        for (const f of files) {
            const src = path.join(plugin.oldDir, f);
            const dest = path.join(destDir, f);
            if (fs.statSync(src).isFile()) {
                fs.copyFileSync(src, dest);
            } else if (fs.statSync(src).isDirectory()) {
                // Copy subdirectories (e.g., references/)
                copyDirRecursive(src, dest);
            }
        }

        // Generate plugin.json
        const pj = generatePluginJson(plugin);
        fs.writeFileSync(
            path.join(destDir, 'plugin.json'),
            JSON.stringify(pj, null, 2) + '\n'
        );

        // Generate README.md (don't overwrite if one exists)
        const readmePath = path.join(destDir, 'README.md');
        if (!fs.existsSync(readmePath)) {
            fs.writeFileSync(readmePath, generateReadme(plugin));
        }

        created++;
    }

    // Generate CATALOG-v2.json
    const catalogV2 = {
        schema_version: '2.0',
        generated_at: new Date().toISOString(),
        plugin_count: plugins.length,
        category_count: Object.keys(categoryStats).length,
        categories: sorted.map(([name, count]) => ({ name, count })),
        plugins: plugins.map(p => ({
            name: p.name,
            title: p.title,
            category: p.category,
            shape: p.shape,
            tier: p.tier,
            description: (p.description || '').replace(/[\u2014\u2013]/g, '--'),
            requires_edition: '>=1.0.0',
            requires_plugins: [],
            token_cost: p.tokenCost,
            path: `plugins/${p.category}/${p.name}/`,
            artifacts: Object.values(p.artifacts),
        })),
    };

    fs.writeFileSync(
        path.join(ROOT, 'CATALOG-v2.json'),
        JSON.stringify(catalogV2, null, 2) + '\n'
    );

    console.log(`Created: ${created} plugin folders in plugins/`);
    console.log(`Generated: CATALOG-v2.json`);
    console.log('');
    console.log('Next steps:');
    console.log('  1. Review plugins/ structure');
    console.log('  2. Replace skills/ with plugins/ when satisfied');
    console.log('  3. Replace CATALOG.json with CATALOG-v2.json');
    console.log('  4. Update README.md');
}

function copyDirRecursive(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        const s = path.join(src, entry.name);
        const d = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDirRecursive(s, d);
        } else {
            fs.copyFileSync(s, d);
        }
    }
}

main();
