const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');

const repositoryRoot = path.resolve(__dirname, '..', '..');
const assessor = path.join(repositoryRoot, 'scripts', 'assess-brain.cjs');
const platformScaffolder = path.join(repositoryRoot, 'scripts', 'scaffold-platform.cjs');
const temporaryDirectories = [];

function bundledComponent(...candidates) {
    const resolved = candidates.map((candidate) => path.join(repositoryRoot, candidate)).find((candidate) => fs.existsSync(candidate));
    if (!resolved) throw new Error(`Missing bundled component: ${candidates.join(' or ')}`);
    return resolved;
}

const compileSkill = bundledComponent('.github/skills/compile-brain/SKILL.md', 'skills/compile-brain/SKILL.md');
const compilePrompt = bundledComponent('.github/prompts/compile-brain.prompt.md', 'commands/compile-brain.md');

function temporaryDirectory(prefix) {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
    temporaryDirectories.push(directory);
    return directory;
}

test.after(() => {
    for (const directory of temporaryDirectories) fs.rmSync(directory, { recursive: true, force: true });
});

function write(filePath, content) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content, 'utf8');
}

function junction(linkPath, targetPath) {
    fs.mkdirSync(path.dirname(linkPath), { recursive: true });
    fs.symlinkSync(targetPath, linkPath, 'junction');
}

function targetFixture() {
    const root = temporaryDirectory('brain-compiler-target-');
    write(path.join(root, 'plugin.json'), JSON.stringify({ name: 'fixture', skills: '.github/skills', commands: '.github/prompts' }));
    write(path.join(root, '.github', 'skills', 'inspect', 'SKILL.md'), '---\nname: inspect\ndescription: "Inspects fixture content. Use when checking a fixture."\n---\n\n# Inspect\n');
    write(path.join(root, '.github', 'skills', 'inspect', 'references', 'guide.md'), '# Guide\n');
    write(path.join(root, '.github', 'prompts', 'inspect.prompt.md'), '---\ndescription: "Runs inspection. Use when inspecting."\n---\n\n# Inspect\n\n[Inspect skill](../skills/inspect/SKILL.md)\n');
    write(path.join(root, 'docs', 'RESEARCH.md'), '# Research\n');
    return root;
}

function hashTree(root) {
    const entries = [];
    function walk(directory) {
        for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
            const filePath = path.join(directory, entry.name);
            if (entry.isDirectory()) walk(filePath);
            if (entry.isFile()) entries.push([path.relative(root, filePath), crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex')]);
        }
    }
    walk(root);
    return JSON.stringify(entries.sort((left, right) => left[0].localeCompare(right[0])));
}

function assess(root, extra = []) {
    return spawnSync(process.execPath, [assessor, '--root', root, ...extra], { encoding: 'utf8' });
}

function scaffold(root, platform, extra = []) {
    return spawnSync(process.execPath, [platformScaffolder, '--platform', platform, '--target', root, ...extra], { encoding: 'utf8' });
}

function scaffoldWith(scaffolder, root, platform, extra = []) {
    return spawnSync(process.execPath, [scaffolder, '--platform', platform, '--target', root, ...extra], { encoding: 'utf8' });
}

test('assesses a plugin-shaped target deterministically without target mutation', () => {
    const root = targetFixture();
    const before = hashTree(root);
    const first = assess(root);
    const second = assess(root);
    assert.equal(first.status, 0, first.stderr);
    assert.equal(second.status, 0, second.stderr);
    assert.equal(first.stdout, second.stdout);
    assert.equal(hashTree(root), before);
    const report = JSON.parse(first.stdout);
    assert.equal(report.immutability.preserved, true);
    assert.equal(report.counts.skill, 1);
    assert.equal(report.counts.prompt, 1);
    assert.equal(report.counts.manifest || 0, 0);
    assert.equal(report.findings.some((finding) => finding.code === 'missing-component-path'), false);
    assert.ok(report.relationships.some((relationship) => relationship.state === 'explicitly-routed-skill'));
});

test('reports broken local links without executing target code', () => {
    const root = targetFixture();
    write(path.join(root, '.github', 'prompts', 'broken.prompt.md'), '[Missing](missing.md)\n');
    const result = assess(root);
    assert.equal(result.status, 0, result.stderr);
    const report = JSON.parse(result.stdout);
    assert.ok(report.findings.some((finding) => finding.code === 'broken-local-link'));
});

test('reports prompts that have no explicit route to a known skill', () => {
    const root = targetFixture();
    write(path.join(root, '.github', 'prompts', 'unrouted.prompt.md'), '# Unrouted\n');
    const result = assess(root);
    assert.equal(result.status, 0, result.stderr);
    const report = JSON.parse(result.stdout);
    assert.ok(report.findings.some((finding) => finding.code === 'unrouted-prompt' && finding.path === '.github/prompts/unrouted.prompt.md'));
});

test('classifies root Markdown but excludes non-Markdown files from assessed artifacts', () => {
    const root = targetFixture();
    write(path.join(root, 'README.md'), '# Target brain\n');
    write(path.join(root, 'scripts', 'verify.cjs'), 'process.exit(0);\n');
    const result = assess(root);
    assert.equal(result.status, 0, result.stderr);
    const report = JSON.parse(result.stdout);
    assert.ok(report.artifacts.some((artifact) => artifact.path === 'README.md' && artifact.type === 'research'));
    assert.equal(report.artifacts.some((artifact) => artifact.path === 'scripts/verify.cjs'), false);
});

test('treats Markdown under documentation trees as research regardless of filename', () => {
    const root = targetFixture();
    write(path.join(root, 'docs', 'snapshot', '.github', 'skills', 'archived-skill', 'SKILL.md'), '---\nname: archived-skill\ndescription: "Historical evidence."\n---\n\n[Missing](missing.md)\n');
    const result = assess(root);
    assert.equal(result.status, 0, result.stderr);
    const report = JSON.parse(result.stdout);
    const snapshot = report.artifacts.find((artifact) => artifact.path === 'docs/snapshot/.github/skills/archived-skill/SKILL.md');
    assert.equal(snapshot.type, 'research');
    assert.equal(report.findings.some((finding) => finding.path === snapshot.path && finding.code === 'broken-local-link'), false);
});

test('excludes backups and test fixtures while retaining bundled resources as resources', () => {
    const root = targetFixture();
    write(path.join(root, '.github', 'skills', 'inspect', 'references', 'example', 'SKILL.md'), '# Example\n');
    write(path.join(root, '_github_backup', 'skills', 'stale', 'SKILL.md'), '# Backup\n');
    write(path.join(root, 'scripts', 'test', 'fixture.instructions.md'), '# Fixture\n');
    write(path.join(root, '.github', 'skills', 'inspect', 'scripts', 'test', 'fixture.instructions.md'), '# Nested fixture\n');
    const result = assess(root);
    assert.equal(result.status, 0, result.stderr);
    const report = JSON.parse(result.stdout);
    assert.equal(report.counts.skill, 1);
    assert.equal(report.counts.resource, 2);
    assert.equal(report.artifacts.some((artifact) => artifact.path.startsWith('_github_backup/')), false);
    assert.equal(report.artifacts.some((artifact) => artifact.path.startsWith('scripts/test/')), false);
    assert.equal(report.artifacts.some((artifact) => artifact.path.includes('/scripts/test/')), false);
});

test('does not validate external file links or research-document links as runtime closure', () => {
    const root = targetFixture();
    write(path.join(root, '.github', 'skills', 'inspect', 'SKILL.md'), '---\nname: inspect\ndescription: "Inspects fixture content. Use when checking a fixture."\n---\n\n[file source](file:///c:/sensitive/path.md)\n');
    write(path.join(root, 'docs', 'RESEARCH.md'), '[Historical](missing-history.md)\n');
    const result = assess(root);
    assert.equal(result.status, 0, result.stderr);
    const report = JSON.parse(result.stdout);
    assert.equal(report.findings.some((finding) => finding.message && finding.message.includes('sensitive')), false);
    assert.equal(report.findings.some((finding) => finding.path === 'docs/RESEARCH.md' && finding.code === 'broken-local-link'), false);
});

test('does not treat Markdown link examples in fenced code as live routes', () => {
    const root = targetFixture();
    write(path.join(root, '.github', 'prompts', 'inspect.prompt.md'), '   ```markdown\n   ![Generated banner](assets/banner-readme.svg)\n\n   # Project Name\n   ```\n');
    const result = assess(root);
    assert.equal(result.status, 0, result.stderr);
    const report = JSON.parse(result.stdout);
    assert.equal(report.findings.some((finding) => finding.path === '.github/prompts/inspect.prompt.md' && finding.code === 'broken-local-link'), false);
});

test('rejects an output path inside the assessed target', () => {
    const root = targetFixture();
    const result = assess(root, ['--out', path.join(root, 'report.json')]);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /outside the target root/);
    assert.equal(fs.existsSync(path.join(root, 'report.json')), false);
});

test('rejects an output path that reaches the target through a junction', () => {
    const root = targetFixture();
    const outside = temporaryDirectory('brain-compiler-output-');
    const aliasDirectory = path.join(outside, 'reports');
    junction(aliasDirectory, root);
    const reportPath = path.join(aliasDirectory, 'report.json');
    const result = assess(root, ['--out', reportPath]);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /outside the target root/);
    assert.equal(fs.existsSync(path.join(root, 'report.json')), false);
});

test('does not modify a target file when the output path is an external hard link', () => {
    const root = targetFixture();
    const target = path.join(root, 'README.md');
    const output = path.join(temporaryDirectory('brain-compiler-hardlink-'), 'report.json');
    write(target, '# Original\n');
    fs.linkSync(target, output);
    const result = assess(root, ['--out', output]);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(fs.readFileSync(target, 'utf8'), '# Original\n');
    assert.match(fs.readFileSync(output, 'utf8'), /"immutability"/);
});

test('reports manifest component paths that escape through a junction', () => {
    const root = temporaryDirectory('brain-compiler-component-');
    const outside = temporaryDirectory('brain-compiler-outside-');
    write(path.join(root, 'plugin.json'), JSON.stringify({ skills: '.github/skills' }));
    write(path.join(outside, 'SKILL.md'), '# External skill\n');
    junction(path.join(root, '.github', 'skills'), outside);
    const result = assess(root);
    assert.equal(result.status, 0, result.stderr);
    const report = JSON.parse(result.stdout);
    assert.ok(report.findings.some((finding) => finding.code === 'component-path-escape' && finding.path === 'plugin.json'));
});

test('validates manifest asset arrays and rejects invalid entries', () => {
    const root = targetFixture();
    write(path.join(root, '.github', 'agents', 'inspect.agent.md'), '# Agent\n');
    write(path.join(root, '.github', 'instructions', 'inspect.instructions.md'), '# Instruction\n');
    write(path.join(root, 'manifest.json'), JSON.stringify({
        assets: {
            skills: ['.github/skills/inspect/SKILL.md', '.github/skills/missing/SKILL.md'],
            prompts: ['.github/prompts/inspect.prompt.md', 7],
            agents: ['.github/agents/inspect.agent.md'],
            instructions: ['.github/instructions/inspect.instructions.md'],
        },
    }));
    const result = assess(root);
    assert.equal(result.status, 0, result.stderr);
    const report = JSON.parse(result.stdout);
    assert.equal(report.findings.some((finding) => finding.code === 'missing-component-path' && finding.message.includes('assets.skills[1]')), true);
    assert.equal(report.findings.some((finding) => finding.code === 'invalid-component-path' && finding.message.includes('assets.prompts[1]')), true);
    assert.equal(report.findings.some((finding) => finding.code === 'missing-component-path' && finding.message.includes('assets.agents[0]')), false);
    assert.equal(report.findings.some((finding) => finding.code === 'missing-component-path' && finding.message.includes('assets.instructions[0]')), false);
});

test('reports manifest asset paths that escape through a junction', () => {
    const root = temporaryDirectory('brain-compiler-assets-');
    const outside = temporaryDirectory('brain-compiler-assets-outside-');
    write(path.join(outside, 'SKILL.md'), '# External skill\n');
    junction(path.join(root, 'linked'), outside);
    write(path.join(root, 'manifest.json'), JSON.stringify({ assets: { skills: ['linked/SKILL.md'] } }));
    const result = assess(root);
    assert.equal(result.status, 0, result.stderr);
    const report = JSON.parse(result.stdout);
    assert.ok(report.findings.some((finding) => finding.code === 'component-path-escape' && finding.message.includes('assets.skills[0]')));
});

test('parses titled and escaped Markdown destinations while ignoring inline code', () => {
    const root = targetFixture();
    write(path.join(root, 'target.md'), '# Target\n');
    write(path.join(root, 'target(with-parentheses).md'), '# Escaped target\n');
    write(path.join(root, '.github', 'prompts', 'inspect.prompt.md'), [
        '[Target](../../target.md "Title")',
        '[Escaped](<../../target\\(with-parentheses\\).md> \'Title\')',
        'Example: `[Missing](missing.md)`',
    ].join('\n'));
    const result = assess(root);
    assert.equal(result.status, 0, result.stderr);
    const report = JSON.parse(result.stdout);
    assert.equal(report.findings.some((finding) => finding.code === 'broken-local-link' && finding.path === '.github/prompts/inspect.prompt.md'), false);
    assert.ok(report.relationships.some((relationship) => relationship.to === 'target.md'));
    assert.ok(report.relationships.some((relationship) => relationship.to === 'target(with-parentheses).md'));
});

test('reports local links that escape through a junction', () => {
    const root = targetFixture();
    const outside = temporaryDirectory('brain-compiler-link-outside-');
    write(path.join(outside, 'external.md'), '# External\n');
    junction(path.join(root, 'alias'), outside);
    write(path.join(root, '.github', 'prompts', 'inspect.prompt.md'), '[External](../../alias/external.md)\n');
    const result = assess(root);
    assert.equal(result.status, 0, result.stderr);
    const report = JSON.parse(result.stdout);
    assert.ok(report.findings.some((finding) => finding.code === 'path-escape'));
    assert.equal(report.relationships.some((relationship) => relationship.to === 'alias/external.md'), false);
});

test('recognizes case-variant skill links on case-insensitive filesystems', () => {
    const root = targetFixture();
    write(path.join(root, '.github', 'prompts', 'inspect.prompt.md'), '[Inspect](../skills/inspect/skill.md)\n');
    const result = assess(root);
    assert.equal(result.status, 0, result.stderr);
    const report = JSON.parse(result.stdout);
    if (!fs.existsSync(path.join(root, '.github', 'skills', 'inspect', 'skill.md'))) return;
    assert.ok(report.relationships.some((relationship) => relationship.state === 'explicitly-routed-skill'));
    assert.equal(report.findings.some((finding) => finding.code === 'unrouted-prompt'), false);
});

test('classifies and validates a portable brain contract', () => {
    const root = targetFixture();
    const contract = path.join(root, 'BRAIN.md');
    write(contract, '# Brain Contract\n\n## Instruction Hierarchy\n');
    const incomplete = assess(root);
    assert.equal(incomplete.status, 0, incomplete.stderr);
    const incompleteReport = JSON.parse(incomplete.stdout);
    assert.equal(incompleteReport.artifacts.find((artifact) => artifact.path === 'BRAIN.md').type, 'brain-contract');
    assert.ok(incompleteReport.findings.some((finding) => finding.code === 'incomplete-brain-contract'));

    write(contract, [
        '# Brain Contract',
        '## Instruction Hierarchy',
        '## Routing',
        '## Arbitration',
        '## Execution',
        '## Verification',
    ].join('\n'));
    const complete = assess(root);
    assert.equal(complete.status, 0, complete.stderr);
    const completeReport = JSON.parse(complete.stdout);
    assert.equal(completeReport.findings.some((finding) => finding.code === 'incomplete-brain-contract'), false);
});

test('previews and scaffolds native platform skill locations without overwriting by default', () => {
    const root = temporaryDirectory('brain-compiler-platform-');
    const preview = scaffold(root, 'claude-code');
    assert.equal(preview.status, 0, preview.stderr);
    assert.equal(fs.existsSync(path.join(root, '.claude', 'skills', 'compile-brain', 'SKILL.md')), false);
    assert.equal(JSON.parse(preview.stdout).files[0].action, 'create');

    const applied = scaffold(root, 'claude-code', ['--apply']);
    assert.equal(applied.status, 0, applied.stderr);
    const destination = path.join(root, '.claude', 'skills', 'compile-brain', 'SKILL.md');
    assert.equal(fs.readFileSync(destination, 'utf8'), fs.readFileSync(compileSkill, 'utf8'));

    const rejected = scaffold(root, 'claude-code', ['--apply']);
    assert.notEqual(rejected.status, 0);
    assert.match(rejected.stderr, /Refusing to overwrite existing files/);
});

test('scaffolds Copilot and instruction-file adapters with their supported shapes', () => {
    const root = temporaryDirectory('brain-compiler-platform-');
    const copilot = scaffold(root, 'copilot', ['--apply']);
    assert.equal(copilot.status, 0, copilot.stderr);
    assert.equal(fs.existsSync(path.join(root, '.github', 'skills', 'compile-brain', 'SKILL.md')), true);
    assert.equal(fs.existsSync(path.join(root, '.github', 'prompts', 'compile-brain.prompt.md')), true);

    const codexRoot = temporaryDirectory('brain-compiler-platform-');
    const codex = scaffold(codexRoot, 'codex', ['--apply']);
    assert.equal(codex.status, 0, codex.stderr);
    const agentInstructions = fs.readFileSync(path.join(codexRoot, 'AGENTS.md'), 'utf8');
    assert.equal(agentInstructions.startsWith('---'), false);
    assert.match(agentInstructions, /^# Compile Brain/m);
});

test('scaffolds every supported platform when all is explicitly requested', () => {
    const root = temporaryDirectory('brain-compiler-platform-');
    const result = scaffold(root, 'all', ['--apply']);
    assert.equal(result.status, 0, result.stderr);
    const report = JSON.parse(result.stdout);
    assert.equal(report.files.length, 8);
    assert.equal(fs.existsSync(path.join(root, '.agents', 'skills', 'compile-brain', 'SKILL.md')), true);
    assert.equal(fs.existsSync(path.join(root, '.cursor', 'skills', 'compile-brain', 'SKILL.md')), true);
    assert.equal(fs.existsSync(path.join(root, 'GEMINI.md')), true);
    assert.equal(fs.existsSync(path.join(root, 'CHATGPT-COMPILE-BRAIN.md')), true);
});

test('scaffolds from the normalized Mall package layout', () => {
    const packageRoot = temporaryDirectory('brain-compiler-mall-package-');
    const target = temporaryDirectory('brain-compiler-platform-');
    const scaffoldScript = path.join(packageRoot, 'scripts', 'scaffold-platform.cjs');
    write(scaffoldScript, fs.readFileSync(platformScaffolder, 'utf8'));
    write(
        path.join(packageRoot, 'skills', 'compile-brain', 'SKILL.md'),
        fs.readFileSync(compileSkill, 'utf8'),
    );
    write(
        path.join(packageRoot, 'commands', 'compile-brain.md'),
        fs.readFileSync(compilePrompt, 'utf8'),
    );
    const result = scaffoldWith(scaffoldScript, target, 'copilot', ['--apply']);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(fs.existsSync(path.join(target, '.github', 'skills', 'compile-brain', 'SKILL.md')), true);
    assert.equal(fs.existsSync(path.join(target, '.github', 'prompts', 'compile-brain.prompt.md')), true);
});
