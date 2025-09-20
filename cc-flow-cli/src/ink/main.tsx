#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import { App } from './App.js';

// Handle process exit
const handleExit = () => {
  process.exit(0);
};

// Render the Ink app
const { unmount } = render(<App onExit={handleExit} />);

// Handle graceful shutdown
process.on('SIGINT', () => {
  unmount();
  process.exit(0);
});

process.on('SIGTERM', () => {
  unmount();
  process.exit(0);
});