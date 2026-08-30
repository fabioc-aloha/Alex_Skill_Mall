#!/usr/bin/env node

'use strict';

const fs = require('node:fs');
const path = require('node:path');

const repositoryRoot = path.resolve(__dirname, '..');

function componentSource(...candidates) {
    const resolved = candidates.map((candidate) => path.join(repositoryRoot, candidate)).find((candidate) => fs.existsSync(candidate));
    if (!resolved) throw new Error(`Missing bundled component: ${candidates.join(' or ')}`);
    return resolved;
}

const skillSource = componentSource('.github/skills/compile-brain/SKILL.md', 'skills/compile-brain/SKILL.md');
const promptSource = componentSource('.github/prompts/compile-brain.prompt.md', 'commands/compile-brain.md');

const PLATFORM_FILES = {
    copilot: [
        { source: skillSource, target: '.github/skills/compile-brain/SKILL.md' },
        { source: promptSource, target: '.github/prompts/compile-brain.prompt.md' },
    ],
    'agent-skills': [
        { source: skillSource, target: '.agents/skills/compile-brain/SKILL.md' },
    ],
    'claude-code': [
        { source: skillSource, target: '.claude/skills/compile-brain/SKILL.md' },
    ],
    cursor: [
        { source: skillSource, target: '.cursor/skills/compile-brain/SKILL.md' },
    ],
    codex: [
        { source: skillSource, target: 'AGENTS.md', stripFrontmatter: true },
    ],
    'gemini-cli': [
        { source: skillSource, target: 'GEMINI.md', stripFrontmatter: true },
    ],
    chatgpt: [
        { source: skillSource, target: 'CHATGPT-COMPILE-BRAIN.md', stripFrontmatter: true },
    ],
};

function usage() {
    return 'Usage: scaffold-platform.cjs --platform <copilot|agent-skills|claude-code|cursor|codex|gemini-cli|chatgpt|all> --target <directory> [--apply] [--force]';
}

function parseArguments(argv) {
    const options = { platform: null, target: null, apply: false, force: false };
    for (let index = 0; index < argv.length; index += 1) {
        const argument = argv[index];
        if (argument === '--apply' || argument === '--force') {
            options[argument.slice(2)] = true;
            continue;
        }
        if (argument === '--help') return { help: true };
        if (!['--platform', '--target'].includes(argument)) throw new Error(usage());
        const value = argv[index + 1];
        if (!value || value.startsWith('--')) throw new Error(`Missing value for ${argument}`);
        options[argument.slice(2)] = value;
        index += 1;
    }
    if (!options.platform || !options.target) throw new Error(usage());
    if (options.force && !options.apply) throw new Error('--force requires --apply');
    return options;
}

function removeFrontmatter(content) {
    return content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
}

function plannedFiles(platform) {
    const platforms = platform === 'all' ? Object.keys(PLATFORM_FILES) : [platform];
    if (platforms.some((name) => !PLATFORM_FILES[name])) {
        throw new Error(`Unsupported platform: ${platform}`);
    }
    return platforms.flatMap((name) => PLATFORM_FILES[name].map((file) => ({ ...file, platform: name })));
}

function main() {
    const options = parseArguments(process.argv.slice(2));
    if (options.help) {
        process.stdout.write(`${usage()}\n`);
        return;
    }

    const targetRoot = path.resolve(options.target);
    if (!fs.existsSync(targetRoot) || !fs.statSync(targetRoot).isDirectory()) {
        throw new Error(`Target directory does not exist: ${targetRoot}`);
    }
    const files = plannedFiles(options.platform).map((file) => ({
        ...file,
        destination: path.resolve(targetRoot, file.target),
    }));
    const duplicateDestinations = files.filter((file, index) =>
        files.findIndex((candidate) => candidate.destination === file.destination) !== index);
    if (duplicateDestinations.length > 0) throw new Error('Platform selection creates duplicate destination files');

    const existing = files.filter((file) => fs.existsSync(file.destination));
    if (options.apply && existing.length > 0 && !options.force) {
        throw new Error(`Refusing to overwrite existing files: ${existing.map((file) => file.target).join(', ')}`);
    }

    const report = {
        platform: options.platform,
        target: targetRoot,
        apply: options.apply,
        files: files.map((file) => ({
            platform: file.platform,
            path: file.target.replace(/\\/g, '/'),
            action: fs.existsSync(file.destination) ? (options.apply ? 'overwrite' : 'exists') : 'create',
        })),
    };
    if (options.apply) {
        for (const file of files) {
            let content = fs.readFileSync(file.source, 'utf8');
            if (file.stripFrontmatter) content = removeFrontmatter(content);
            fs.mkdirSync(path.dirname(file.destination), { recursive: true });
            fs.writeFileSync(file.destination, content, 'utf8');
        }
    }
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}

try {
    main();
} catch (error) {
    process.stderr.write(`scaffold-platform: ${error.message}\n`);
    process.exitCode = 1;
}
