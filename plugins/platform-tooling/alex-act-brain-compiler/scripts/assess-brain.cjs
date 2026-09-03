#!/usr/bin/env node

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

class AssessmentError extends Error { }

const HISTORY_SEGMENTS = new Set(['_archive', '_github_backup', 'archive', 'history']);
const ROOT_INSTRUCTIONS = new Set(['AGENTS.md', 'CLAUDE.md', 'GEMINI.md', 'copilot-instructions.md']);
const MANIFEST_NAMES = new Set(['plugin.json', 'manifest.json', 'package.json', 'mcp.json']);
const BRAIN_CONTRACT_SECTIONS = ['Instruction Hierarchy', 'Routing', 'Arbitration', 'Execution', 'Verification'];

function stableJson(value) {
    return `${JSON.stringify(value, null, 2)}\n`;
}

function usage() {
    return 'Usage: assess-brain.cjs --root <target-root> [--out <report.json>] [--include-history]';
}

function parseArguments(argv) {
    const options = { root: null, out: null, includeHistory: false };
    for (let index = 0; index < argv.length; index += 1) {
        const argument = argv[index];
        if (argument === '--include-history') {
            options.includeHistory = true;
            continue;
        }
        if (!['--root', '--out'].includes(argument)) throw new AssessmentError(usage());
        const value = argv[index + 1];
        if (!value || value.startsWith('--')) throw new AssessmentError(`Missing value for ${argument}`);
        options[argument.slice(2)] = value;
        index += 1;
    }
    if (!options.root) throw new AssessmentError(usage());
    return options;
}

function isWithin(candidate, parent) {
    const relative = path.relative(parent, candidate);
    return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function realpath(filePath) {
    return fs.realpathSync.native(filePath);
}

function resolveOutputPath(output) {
    const missingSegments = [];
    let existingPath = path.resolve(output);
    while (!fs.existsSync(existingPath)) {
        const parent = path.dirname(existingPath);
        if (parent === existingPath) throw new AssessmentError(`Output path has no existing parent: ${output}`);
        missingSegments.unshift(path.basename(existingPath));
        existingPath = parent;
    }
    return path.join(realpath(existingPath), ...missingSegments);
}

function normalizeRelative(root, filePath) {
    return path.relative(root, filePath).replace(/\\/g, '/');
}

function hashBuffer(value) {
    return crypto.createHash('sha256').update(value).digest('hex');
}

function hashFile(filePath) {
    return hashBuffer(fs.readFileSync(filePath));
}

function shouldSkip(relativePath, includeHistory) {
    const segments = relativePath.split('/');
    if (segments.some((segment) => segment === 'node_modules' || segment === '.git')) return true;
    if (segments.some((segment, index) => segment === 'scripts' && segments[index + 1] === 'test')) return true;
    return !includeHistory && segments.some((segment) => HISTORY_SEGMENTS.has(segment));
}

function listFiles(root, includeHistory) {
    const files = [];
    function walk(directory) {
        for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
            const absolute = path.join(directory, entry.name);
            const relative = normalizeRelative(root, absolute);
            if (shouldSkip(relative, includeHistory)) continue;
            if (entry.isDirectory()) walk(absolute);
            if (entry.isFile()) files.push(absolute);
        }
    }
    walk(root);
    return files.sort();
}

function listTargetFiles(root) {
    const files = [];
    function walk(directory) {
        for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
            const absolute = path.join(directory, entry.name);
            if (entry.isDirectory()) walk(absolute);
            if (entry.isFile()) files.push(absolute);
        }
    }
    walk(root);
    return files.sort();
}

function fingerprint(root) {
    return listTargetFiles(root).map((filePath) => ({
        path: normalizeRelative(root, filePath),
        sha256: hashFile(filePath),
    }));
}

function parseFrontmatter(content) {
    const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
    if (!match) return {};
    const fields = {};
    for (const line of match[1].split(/\r?\n/)) {
        const separator = line.indexOf(':');
        if (separator < 1 || /^\s/.test(line)) continue;
        const key = line.slice(0, separator).trim();
        let value = line.slice(separator + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        fields[key] = value;
    }
    return fields;
}

function isEscaped(value, index) {
    let escapes = 0;
    for (let cursor = index - 1; cursor >= 0 && value[cursor] === '\\'; cursor -= 1) escapes += 1;
    return escapes % 2 === 1;
}

function removeFencedCode(content) {
    let fence = null;
    return content.split(/\r?\n/).filter((line) => {
        const marker = line.match(/^ {0,3}(`{3,}|~{3,})/);
        if (marker) {
            if (!fence) fence = { character: marker[1][0], length: marker[1].length };
            else if (marker[1][0] === fence.character && marker[1].length >= fence.length) fence = null;
            return false;
        }
        return !fence;
    }).join('\n');
}

function findUnescaped(value, target, start) {
    for (let index = start; index < value.length; index += 1) {
        if (value[index] === target && !isEscaped(value, index)) return index;
    }
    return -1;
}

function unescapeDestination(destination) {
    return destination.replace(/\\([!"#$%&'()*+,./:;<=>?@[\]^_`{|}~-])/g, '$1');
}

function parseMarkdownLink(value, start) {
    const labelEnd = findUnescaped(value, ']', start + 1);
    if (labelEnd < 0 || value[labelEnd + 1] !== '(') return null;
    let index = labelEnd + 2;
    while (/\s/.test(value[index] || '')) index += 1;
    let destination = '';
    if (value[index] === '<') {
        const end = findUnescaped(value, '>', index + 1);
        if (end < 0) return null;
        destination = value.slice(index + 1, end);
        index = end + 1;
    } else {
        const destinationStart = index;
        let depth = 0;
        while (index < value.length) {
            const character = value[index];
            if (character === '\\') {
                index += 2;
                continue;
            }
            if (character === '(') depth += 1;
            if (character === ')') {
                if (depth === 0) break;
                depth -= 1;
            }
            if (/\s/.test(character) && depth === 0) break;
            index += 1;
        }
        destination = value.slice(destinationStart, index);
    }
    while (/\s/.test(value[index] || '')) index += 1;
    if (value[index] === '"' || value[index] === "'") {
        const titleEnd = findUnescaped(value, value[index], index + 1);
        if (titleEnd < 0) return null;
        index = titleEnd + 1;
        while (/\s/.test(value[index] || '')) index += 1;
    } else if (value[index] === '(') {
        const titleEnd = findUnescaped(value, ')', index + 1);
        if (titleEnd < 0) return null;
        index = titleEnd + 1;
        while (/\s/.test(value[index] || '')) index += 1;
    }
    if (value[index] !== ')') return null;
    return { destination: unescapeDestination(destination), end: index + 1 };
}

function extractMarkdownLinks(content) {
    const links = [];
    const prose = removeFencedCode(content);
    for (let index = 0; index < prose.length; index += 1) {
        if (prose[index] === '`' && !isEscaped(prose, index)) {
            let markerLength = 1;
            while (prose[index + markerLength] === '`') markerLength += 1;
            const marker = '`'.repeat(markerLength);
            const end = prose.indexOf(marker, index + markerLength);
            index = end < 0 ? prose.length : end + markerLength - 1;
            continue;
        }
        if (prose[index] !== '[' || isEscaped(prose, index)) continue;
        const link = parseMarkdownLink(prose, index);
        if (!link) continue;
        index = link.end - 1;
        const target = link.destination.trim();
        if (!target || /^(?:[a-z][a-z0-9+.-]*:|#)/i.test(target)) continue;
        links.push(target.split('#')[0]);
    }
    return links.filter(Boolean);
}

function classify(root, relativePath) {
    const basename = path.posix.basename(relativePath);
    const segments = relativePath.split('/');
    const rootIsSkillLibrary = ['skills', 'skills-visual'].includes(path.basename(root).toLowerCase());
    if (!basename.endsWith('.md')) return null;
    if (['docs', 'brain', 'architecture', 'research'].includes(segments[0])) return 'research';
    if (basename === 'BRAIN.md' || basename.endsWith('.brain.md')) return 'brain-contract';
    if (basename.endsWith('.instructions.md') || ROOT_INSTRUCTIONS.has(basename)) return 'instruction';
    if (basename === 'SKILL.md') {
        const skillIndex = segments.findIndex((segment) => ['skills', 'skills-visual'].includes(segment));
        return (skillIndex >= 0 && segments.length === skillIndex + 3) || (rootIsSkillLibrary && segments.length === 2) ? 'skill' : 'resource';
    }
    if (basename.endsWith('.prompt.md')) return 'prompt';
    if (basename.endsWith('.agent.md')) return 'agent';
    if (segments.some((segment) => ['references', 'assets', 'examples', 'config'].includes(segment))) return 'resource';
    return 'research';
}

function isManifestPath(relativePath) {
    const basename = path.posix.basename(relativePath);
    return MANIFEST_NAMES.has(basename) || relativePath === '.vscode/mcp.json';
}

function readJson(filePath, findings, relativePath) {
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
        findings.push({ severity: 'error', code: 'invalid-json', path: relativePath, message: error.message });
        return null;
    }
}

function artifactId(type, relativePath, frontmatter) {
    if (type === 'skill') return frontmatter.name || path.posix.basename(path.posix.dirname(relativePath));
    return path.posix.basename(relativePath).replace(/(\.instructions|\.prompt|\.agent)?\.md$/, '');
}

function validateBrainContract(content, relativePath, findings) {
    const prose = removeFencedCode(content);
    const missing = BRAIN_CONTRACT_SECTIONS.filter((section) => !new RegExp(`^#{1,6}\\s+${section}\\s*$`, 'mi').test(prose));
    if (missing.length > 0) {
        findings.push({
            severity: 'error',
            code: 'incomplete-brain-contract',
            path: relativePath,
            message: `Brain contract is missing required sections: ${missing.join(', ')}`,
        });
    }
}

function writeOutput(output, content) {
    const temporary = path.join(
        path.dirname(output),
        `.${path.basename(output)}.${process.pid}.${crypto.randomBytes(8).toString('hex')}.tmp`,
    );
    try {
        fs.writeFileSync(temporary, content, { encoding: 'utf8', flag: 'wx' });
        fs.renameSync(temporary, output);
    } finally {
        fs.rmSync(temporary, { force: true });
    }
}

function validateComponentPath(root, manifestRelativePath, field, value, findings) {
    if (typeof value !== 'string') {
        findings.push({ severity: 'error', code: 'invalid-component-path', path: manifestRelativePath, message: `${field} must be a string path` });
        return;
    }
    const componentPath = path.resolve(root, value);
    if (!isWithin(componentPath, root)) {
        findings.push({ severity: 'error', code: 'component-path-escape', path: manifestRelativePath, message: `${field} resolves outside the target` });
        return;
    }
    if (!fs.existsSync(componentPath)) {
        findings.push({ severity: 'error', code: 'missing-component-path', path: manifestRelativePath, message: `${field} does not resolve inside the target` });
        return;
    }
    if (!isWithin(realpath(componentPath), root)) {
        findings.push({ severity: 'error', code: 'component-path-escape', path: manifestRelativePath, message: `${field} resolves outside the target` });
    }
}

function validateManifestPaths(root, manifestRelativePath, manifest, findings) {
    for (const field of ['skills', 'commands', 'agents']) {
        if (manifest[field] !== undefined) validateComponentPath(root, manifestRelativePath, field, manifest[field], findings);
    }
    if (manifest.assets === undefined) return;
    if (!manifest.assets || typeof manifest.assets !== 'object' || Array.isArray(manifest.assets)) {
        findings.push({ severity: 'error', code: 'invalid-component-path', path: manifestRelativePath, message: 'assets must be an object' });
        return;
    }
    for (const field of ['skills', 'prompts', 'agents', 'instructions']) {
        if (manifest.assets[field] === undefined) continue;
        if (!Array.isArray(manifest.assets[field])) {
            findings.push({ severity: 'error', code: 'invalid-component-path', path: manifestRelativePath, message: `assets.${field} must be an array of string paths` });
            continue;
        }
        manifest.assets[field].forEach((value, index) => {
            validateComponentPath(root, manifestRelativePath, `assets.${field}[${index}]`, value, findings);
        });
    }
}

function buildSkillImportance(artifacts, relationships, normalizedBodies) {
    const duplicatePaths = new Set(
        [...normalizedBodies.values()]
            .filter((paths) => paths.length > 1)
            .flat(),
    );
    return artifacts
        .filter((artifact) => artifact.type === 'skill')
        .map((skill) => {
            const skillDirectory = path.posix.dirname(skill.path);
            const inboundRoutes = relationships.filter((relationship) => relationship.to === skill.path).length;
            const outboundRoutes = relationships.filter((relationship) => relationship.from === skill.path).length;
            const bundledResources = artifacts.filter((artifact) => artifact.type === 'resource'
                && artifact.path.startsWith(`${skillDirectory}/`)).length;
            const uniqueBody = !duplicatePaths.has(skill.path);
            const staticImportanceScore = Math.min(inboundRoutes, 2) * 20
                + Math.min(outboundRoutes, 2) * 5
                + Math.min(bundledResources, 1) * 5
                + (uniqueBody ? 5 : 0);
            return {
                id: skill.id,
                path: skill.path,
                staticImportanceScore,
                maximumScore: 60,
                signals: { inboundRoutes, outboundRoutes, bundledResources, uniqueBody },
            };
        })
        .sort((left, right) => right.staticImportanceScore - left.staticImportanceScore
            || left.path.localeCompare(right.path));
}

function analyze(root, includeHistory) {
    const findings = [];
    const files = listFiles(root, includeHistory);
    const artifacts = [];
    const manifestFiles = [];
    const knownSkillPaths = new Map();
    const explicitLinks = [];
    const normalizedBodies = new Map();

    for (const filePath of files) {
        const relativePath = normalizeRelative(root, filePath);
        if (isManifestPath(relativePath)) manifestFiles.push(filePath);
        const type = classify(root, relativePath);
        if (!type) continue;
        const bytes = fs.statSync(filePath).size;
        const content = fs.readFileSync(filePath, 'utf8');
        const frontmatter = content && filePath.endsWith('.md') ? parseFrontmatter(content) : {};
        const artifact = {
            id: artifactId(type, relativePath, frontmatter),
            type,
            path: relativePath,
            bytes,
            sha256: hashFile(filePath),
            loadingTier: type === 'instruction' ? 'scope-dependent' : type === 'resource' || type === 'research' || type === 'brain-contract' ? 'deferred' : 'on-demand',
        };
        if (frontmatter.description) artifact.description = frontmatter.description;
        artifacts.push(artifact);
        if (type === 'skill') {
            knownSkillPaths.set(realpath(filePath), artifact.id);
            const expectedName = path.posix.basename(path.posix.dirname(relativePath));
            if (frontmatter.name && frontmatter.name !== expectedName) {
                findings.push({ severity: 'error', code: 'skill-name-mismatch', path: relativePath, message: `${frontmatter.name} does not match ${expectedName}` });
            }
        }
        if (type === 'brain-contract') validateBrainContract(content, relativePath, findings);
        if (content && ['instruction', 'skill', 'prompt', 'agent', 'brain-contract'].includes(type)) {
            for (const link of extractMarkdownLinks(content)) {
                const target = path.resolve(path.dirname(filePath), link);
                if (!isWithin(target, root)) {
                    findings.push({ severity: 'error', code: 'path-escape', path: relativePath, message: `Local link escapes target: ${link}` });
                    continue;
                }
                if (!fs.existsSync(target)) {
                    findings.push({ severity: 'error', code: 'broken-local-link', path: relativePath, message: `Missing local link: ${link}` });
                    continue;
                }
                const canonicalTarget = realpath(target);
                if (!isWithin(canonicalTarget, root)) {
                    findings.push({ severity: 'error', code: 'path-escape', path: relativePath, message: `Local link escapes target: ${link}` });
                    continue;
                }
                explicitLinks.push({ from: relativePath, to: normalizeRelative(root, canonicalTarget) });
            }
            if (['skill', 'agent', 'prompt'].includes(type)) {
                const normalized = content.replace(/\r\n/g, '\n').replace(/^---[\s\S]*?---\n?/, '').trim();
                const bodyHash = hashBuffer(normalized);
                if (!normalizedBodies.has(bodyHash)) normalizedBodies.set(bodyHash, []);
                normalizedBodies.get(bodyHash).push(relativePath);
            }
        }
    }

    for (const manifestPath of manifestFiles) {
        const manifestRelativePath = normalizeRelative(root, manifestPath);
        const manifest = readJson(manifestPath, findings, manifestRelativePath);
        if (manifest) validateManifestPaths(root, manifestRelativePath, manifest, findings);
    }

    const skillPaths = new Set([...knownSkillPaths.keys()].map((filePath) => normalizeRelative(root, filePath)));
    const relationships = explicitLinks.map((link) => ({
        ...link,
        state: skillPaths.has(link.to) ? 'explicitly-routed-skill' : 'explicit-local-link',
    }));
    const routedPrompts = new Set(
        relationships
            .filter((relationship) => relationship.state === 'explicitly-routed-skill')
            .map((relationship) => relationship.from),
    );
    for (const prompt of artifacts.filter((artifact) => artifact.type === 'prompt')) {
        if (!routedPrompts.has(prompt.path)) {
            findings.push({
                severity: 'advisory',
                code: 'unrouted-prompt',
                path: prompt.path,
                message: 'Prompt has no explicit Markdown route to a discovered skill',
            });
        }
    }
    for (const group of normalizedBodies.values()) {
        if (group.length > 1) findings.push({ severity: 'advisory', code: 'duplicate-body', paths: group });
    }

    const counts = {};
    const bytes = {};
    for (const artifact of artifacts) {
        counts[artifact.type] = (counts[artifact.type] || 0) + 1;
        bytes[artifact.type] = (bytes[artifact.type] || 0) + artifact.bytes;
    }
    const sortedArtifacts = artifacts.sort((left, right) => left.path.localeCompare(right.path));
    return {
        artifacts: sortedArtifacts,
        relationships,
        findings,
        counts,
        bytes,
        skillImportance: buildSkillImportance(sortedArtifacts, relationships, normalizedBodies),
    };
}

function main() {
    const options = parseArguments(process.argv.slice(2));
    const requestedRoot = path.resolve(options.root);
    if (!fs.existsSync(requestedRoot) || !fs.statSync(requestedRoot).isDirectory()) throw new AssessmentError(`Target root does not exist: ${requestedRoot}`);
    const root = realpath(requestedRoot);
    const output = options.out ? resolveOutputPath(options.out) : null;
    if (output && isWithin(output, root)) throw new AssessmentError('Output path must be outside the target root');
    const before = fingerprint(root);
    const analysis = analyze(root, options.includeHistory);
    const after = fingerprint(root);
    const report = {
        schemaVersion: 2,
        target: { fileCount: before.length, contentSha256: hashBuffer(stableJson(before)) },
        includeHistory: options.includeHistory,
        ...analysis,
        immutability: {
            preserved: stableJson(before) === stableJson(after),
            beforeSha256: hashBuffer(stableJson(before)),
            afterSha256: hashBuffer(stableJson(after)),
        },
    };
    if (!report.immutability.preserved) throw new AssessmentError('Target changed during assessment');
    const serialized = stableJson(report);
    if (output) writeOutput(output, serialized);
    else process.stdout.write(serialized);
}

try {
    main();
} catch (error) {
    process.stderr.write(`assess-brain: ${error.message}\n`);
    process.exitCode = 1;
}
