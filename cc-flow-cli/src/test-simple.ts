/**
 * Simple test to verify TypeScript compilation output
 * This file will be created by running: npm run compile
 */

import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { WorkflowBuilder } from './cli/main.js';

console.log('Testing TypeScript compilation...');
console.log('Current file:', fileURLToPath(import.meta.url));
console.log('WorkflowBuilder loaded successfully');

const builder = new WorkflowBuilder();
console.log('WorkflowBuilder instantiated:', typeof builder);

console.log('\u2705 Compilation test passed!');