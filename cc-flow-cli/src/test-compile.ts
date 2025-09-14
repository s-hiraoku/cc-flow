/**
 * Simple compilation test to expose configuration issues
 */

// Test import.meta.url support
const currentFile = import.meta.url;
console.log('Current file URL:', currentFile);

// Test relative imports with .js extensions
import { EnvironmentChecker } from './services/EnvironmentChecker.js';
import type { Agent } from './models/Agent.js';

// Test ESM-only dependencies
import chalk from 'chalk';
import { input } from '@inquirer/prompts';

// Simple test to verify everything compiles
export function testConfiguration(): boolean {
  try {
    const checker = new EnvironmentChecker();
    const coloredText = chalk.green('Configuration test passed!');
    console.log(coloredText);
    return true;
  } catch (error) {
    console.error('Configuration test failed:', error);
    return false;
  }
}

// Only run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testConfiguration();
}