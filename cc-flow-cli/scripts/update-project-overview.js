#!/usr/bin/env node

import { readFileSync, writeFileSync, renameSync, mkdtempSync, rmSync } from 'fs';
import { dirname, join } from 'path';
import { tmpdir } from 'os';
import { fileURLToPath, pathToFileURL } from 'url';
import chalk from 'chalk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const cliRoot = join(__dirname, '..');
const repoRoot = join(cliRoot, '..');
const packageJsonPath = join(cliRoot, 'package.json');
const projectOverviewPath = join(repoRoot, '.serena', 'memories', 'project_overview.md');

function log(message, formatter, silent) {
  if (!silent) {
    console.log((formatter ?? ((value) => value))(message));
  }
}

export function updateProjectOverviewMemory(options = {}) {
  const { silent = false } = options;

  // Read package.json with proper error handling instead of existsSync check
  let packageJson, version;
  try {
    packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
    version = packageJson.version;
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`package.json not found at ${packageJsonPath}`);
    }
    throw error;
  }

  if (!version) {
    throw new Error('package.json does not contain a version field.');
  }

  // Read project overview with proper error handling instead of existsSync check
  let currentContent;
  try {
    currentContent = readFileSync(projectOverviewPath, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') {
      log(`Skipping project overview sync; missing ${projectOverviewPath}`, chalk.dim, silent);
      return { changed: false, skipped: true, version };
    }
    throw error;
  }
  const versionLineRegex = /(Version\s+)([0-9A-Za-z.-]+)(\s+-\s+.+)/;

  let updatedContent = currentContent.replace(versionLineRegex, (_, prefix, _existing, suffix) => `${prefix}${version}${suffix}`);

  if (updatedContent === currentContent) {
    const lines = currentContent.split('\n');
    const statusIndex = lines.findIndex((line) => line.trim() === '## Current Status');

    if (statusIndex === -1) {
      throw new Error('Unable to locate "## Current Status" section in project_overview.md.');
    }

    let cursor = statusIndex + 1;
    while (cursor < lines.length && lines[cursor].trim() === '') {
      cursor += 1;
    }

    const suffixMatch = cursor < lines.length ? lines[cursor].match(/(\s+-\s+.+)/) : null;
    const suffix = suffixMatch ? suffixMatch[1] : '';

    if (cursor >= lines.length) {
      lines.push(`Version ${version}${suffix}`.trim());
    } else if (lines[cursor].startsWith('Version ')) {
      lines[cursor] = `Version ${version}${suffix}`;
    } else {
      lines.splice(cursor, 0, `Version ${version}${suffix}`.trim());
    }

    updatedContent = lines.join('\n');
  }

  if (updatedContent === currentContent) {
    log(`Project overview already references version ${version}.`, chalk.dim, silent);
    return { changed: false, skipped: false, version };
  }

  // Atomic write using secure temporary directory to avoid race conditions
  const tmpDir = mkdtempSync(join(tmpdir(), 'cc-flow-update-'));
  const tmpFile = join(tmpDir, 'project_overview.md');
  try {
    // Write to temporary file with restricted permissions (0o600 = owner read/write only)
    writeFileSync(tmpFile, updatedContent, { encoding: 'utf8', mode: 0o600 });
    renameSync(tmpFile, projectOverviewPath);
    // Clean up temporary directory
    rmSync(tmpDir, { recursive: true, force: true });
  } catch (error) {
    // Clean up temporary directory on error
    try {
      rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
    throw error;
  }
  log(`Updated project overview memory to version ${version}.`, chalk.green, silent);

  return { changed: true, skipped: false, version };
}

const isInvokedDirectly = () => {
  if (process.argv.length <= 1) {
    return false;
  }

  try {
    return pathToFileURL(process.argv[1]).href === import.meta.url;
  } catch (error) {
    return false;
  }
};

if (isInvokedDirectly()) {
  try {
    updateProjectOverviewMemory();
  } catch (error) {
    console.error(chalk.red('❌ Failed to update project overview memory.'));
    console.error(chalk.red(`   ${error.message}`));
    process.exit(1);
  }
}
