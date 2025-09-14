#!/usr/bin/env node

/**
 * Test script to validate the built package
 * Ensures all modules can be imported and basic functionality works
 */

import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const distDir = join(rootDir, 'dist');

console.log(chalk.blue('🧪 Testing built package...'));

const tests = [
  {
    name: 'Check dist directory exists',
    test: () => existsSync(distDir)
  },
  {
    name: 'Check main entry file exists',
    test: () => existsSync(join(distDir, 'index.js'))
  },
  {
    name: 'Check CLI entry file exists',
    test: () => existsSync(join(distDir, 'cli', 'main.js'))
  },
  {
    name: 'Check type declarations exist',
    test: () => existsSync(join(distDir, 'index.d.ts'))
  },
  {
    name: 'Check bin script exists',
    test: () => existsSync(join(rootDir, 'bin', 'cc-flow.js'))
  },
  {
    name: 'Import main module',
    test: async () => {
      try {
        const mod = await import(join(distDir, 'index.js'));
        return mod.WorkflowBuilder && typeof mod.WorkflowBuilder === 'function';
      } catch (error) {
        console.error(chalk.dim(`    Import error: ${error.message}`));
        return false;
      }
    }
  },
  {
    name: 'Import CLI module',
    test: async () => {
      try {
        const mod = await import(join(distDir, 'cli', 'main.js'));
        return mod.WorkflowBuilder && typeof mod.WorkflowBuilder === 'function';
      } catch (error) {
        console.error(chalk.dim(`    Import error: ${error.message}`));
        return false;
      }
    }
  },
  {
    name: 'Import utilities',
    test: async () => {
      try {
        const mod = await import(join(distDir, 'utils', 'ErrorHandler.js'));
        return mod.ErrorHandler && mod.CLIError;
      } catch (error) {
        console.error(chalk.dim(`    Import error: ${error.message}`));
        return false;
      }
    }
  }
];

let passed = 0;
let failed = 0;

for (const test of tests) {
  try {
    const result = typeof test.test === 'function' ? await test.test() : test.test;
    if (result) {
      console.log(chalk.green(`  ✅ ${test.name}`));
      passed++;
    } else {
      console.log(chalk.red(`  ❌ ${test.name}`));
      failed++;
    }
  } catch (error) {
    console.log(chalk.red(`  ❌ ${test.name}: ${error.message}`));
    failed++;
  }
}

console.log(chalk.blue(`\n📊 Test Results: ${passed} passed, ${failed} failed`));

if (failed > 0) {
  console.log(chalk.red('❌ Some tests failed. Please check the build.'));
  process.exit(1);
} else {
  console.log(chalk.green('✅ All tests passed! Package is ready.'));
}