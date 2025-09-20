#!/usr/bin/env node

// This is the entry point for the npx @hiraoku/cc-flow-cli command (binary: cc-flow)
// It imports and runs the compiled TypeScript code

import React from 'react';
import { render } from 'ink';
import { InkApp } from '../dist/index.js';

// Create and render the React Ink application
const app = render(React.createElement(InkApp));

// Wait for the app to exit
app.waitUntilExit().catch((error) => {
  console.error('Application error:', error);
  process.exit(1);
});
