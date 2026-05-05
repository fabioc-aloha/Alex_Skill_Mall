#!/usr/bin/env node
// Generate CATALOG.json from plugin.json manifests in plugins/ directory
const fs = require('fs');
const path = require('path');

const pluginsDir = path.join(__dirname, '..', 'plugins');
const plugins = [];

// Walk category directories and find plugin folders (contain plugin.json)
for (const catEntry of fs.readdirSync(pluginsDir, { withFileTypes: true })) {
    if (!catEntry.isDirectory()) continue;
    const catDir = path.join(pluginsDir, catEntry.name);
    for (const pluginEntry of fs.readdirSync(catDir, { withFileTypes: true })) {
        if (!pluginEntry.isDirectory()) continue;
        const manifestPath = path.join(catDir, pluginEntry.name, 'plugin.json');
        if (!fs.existsSync(manifestPath)) continue;

        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
        const pluginPath = `plugins/${catEntry.name}/${pluginEntry.name}`;

        // Discover actual artifacts in the folder
        const pluginDir = path.join(catDir, pluginEntry.name);
        const files = fs.readdirSync(pluginDir).filter(f =>
            f !== 'plugin.json' && f !== 'README.md' && !f.startsWith('.')
        );

        plugins.push({
            name: manifest.name || pluginEntry.name,
            title: manifest.name || pluginEntry.name,
            category: manifest.category || catEntry.name,
            shape: manifest.shape || '....',
            tier: manifest.tier || 'standard',
            engines: manifest.engines || ['copilot'],
            token_cost: manifest.token_cost || 0,
            description: manifest.description || '',
            keywords: manifest.keywords || [],
            requires_edition: manifest.requires_edition || '>=1.0.0',
            requires_plugins: manifest.requires_plugins || [],
            path: pluginPath,
            artifacts: files
        });
    }
}

// Sort by category then name
plugins.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));

// Build category summary
const categoryMap = {};
for (const p of plugins) {
    categoryMap[p.category] = (categoryMap[p.category] || 0) + 1;
}
const categories = Object.entries(categoryMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

const output = {
    schema_version: '2.1',
    generated_at: new Date().toISOString(),
    plugin_count: plugins.length,
    category_count: categories.length,
    categories,
    plugins
};

const outPath = path.join(__dirname, '..', 'CATALOG.json');
fs.writeFileSync(outPath, JSON.stringify(output, null, 2) + '\n');
console.log(`Generated CATALOG.json: ${plugins.length} plugins across ${categories.length} categories`);
