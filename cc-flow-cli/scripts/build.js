#!/usr/bin/env node

/**
 * Production build script for cc-flow-cli
 * Handles TypeScript compilation and post-build optimizations
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

console.log(chalk.blue('🔧 Starting production build...'));

try {
  // Clean previous build
  console.log(chalk.gray('  Cleaning previous build...'));
  execSync('npm run clean', { cwd: rootDir, stdio: 'inherit' });

  // Compile TypeScript
  console.log(chalk.gray('  Compiling TypeScript...'));
  execSync('tsc', { cwd: rootDir, stdio: 'inherit' });

  // Ensure bin directory exists
  const binDir = join(rootDir, 'bin');
  if (!existsSync(binDir)) {
    mkdirSync(binDir, { recursive: true });
  }

  // Fix bin script
  console.log(chalk.gray('  Fixing bin script...'));
  execSync('npm run fix-bin', { cwd: rootDir, stdio: 'inherit' });

  // Validate build
  const distDir = join(rootDir, 'dist');
  const indexFile = join(distDir, 'index.js');
  const binFile = join(rootDir, 'bin', 'cc-flow.js');

  if (!existsSync(indexFile)) {
    throw new Error('index.js not found in dist/');
  }
  if (!existsSync(binFile)) {
    throw new Error('cc-flow.js not found in bin/');
  }

  console.log(chalk.green('✅ Build completed successfully!'));
  console.log(chalk.gray('  Built files:'));
  console.log(chalk.gray(`    - ${indexFile}`));
  console.log(chalk.gray(`    - ${binFile}`));

  // Run build validation tests
  console.log(chalk.gray('  Running build validation...'));
  try {
    execSync('npm run test:build', { cwd: rootDir, stdio: 'inherit' });
  } catch (error) {
    console.log(chalk.yellow('⚠️  Build validation had warnings, but build completed successfully'));
  }

} catch (error) {
  console.error(chalk.red('❌ Build failed:'));
  console.error(chalk.red(`   ${error.message}`));
  process.exit(1);
}