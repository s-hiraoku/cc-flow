#!/usr/bin/env node

// This is the entry point for the npx cc-flow command
// It imports and runs the compiled TypeScript code

import { WorkflowBuilder } from '../dist/cli/main.js';
import { ErrorHandler } from '../dist/utils/ErrorHandler.js';

// Setup global error handlers
ErrorHandler.handleProcessErrors();

// Run the CLI application
const builder = new WorkflowBuilder();
builder.run().catch((error) => {
  ErrorHandler.handleError(error, {
    operation: 'cli-execution',
    component: 'main'
  });
});