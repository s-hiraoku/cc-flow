#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-require-imports */
const { spawn } = require('child_process');
const { join } = require('path');
const { existsSync } = require('fs');
const { program } = require('commander');

// Load package.json with error handling
let packageJson;
try {
  packageJson = require('../package.json');
} catch (error) {
  console.error('❌ Failed to load package.json:', error.message);
  process.exit(1);
}
/* eslint-enable @typescript-eslint/no-require-imports */

program
  .name('cc-flow-web')
  .description('Visual workflow editor for CC-Flow')
  .version(packageJson.version)
  .option('-p, --port <port>', 'Port to run the server on', '3000')
  .option('--no-open', 'Do not open browser automatically')
  .parse(process.argv);

const options = program.opts();

// Use current working directory as claude root
const claudeRoot = process.cwd();

// Resolve paths
const packageRoot = join(__dirname, '..');
const nextBinary = join(packageRoot, 'node_modules', '.bin', 'next');
const nextBuildDir = join(packageRoot, '.next');

// Check if Next.js is built
if (!existsSync(nextBuildDir)) {
  console.error('❌ Next.js build not found. Please run "npm run build" first.');
  console.error('   Or install the package globally: npm install -g @hiraoku/cc-flow-web');
  process.exit(1);
}

// Check if Next.js binary exists
if (!existsSync(nextBinary)) {
  console.error('❌ Next.js not found. Please run "npm install" first.');
  process.exit(1);
}

// Prepare environment variables
const env = {
  ...process.env,
  PORT: options.port,
  CLAUDE_ROOT_PATH: claudeRoot, // Server-side only, not NEXT_PUBLIC_
};

console.log('🌐 Starting CC-Flow Web Editor...');
console.log(`📁 Working directory: ${claudeRoot}`);
console.log(`🚀 Server will run at http://localhost:${options.port}`);

// Start Next.js server
const server = spawn('node', [nextBinary, 'start', '-p', options.port], {
  cwd: packageRoot,
  env,
  stdio: 'inherit',
});

server.on('error', (error) => {
  console.error('❌ Failed to start server:', error.message);
  process.exit(1);
});

// Open browser after server starts
if (options.open) {
  setTimeout(async () => {
    const url = `http://localhost:${options.port}`;

    console.log(`🔗 Opening browser at ${url}`);

    try {
      // Dynamic import for ESM package
      const open = (await import('open')).default;
      await open(url);
    } catch (err) {
      console.log('⚠️  Could not open browser automatically');
      console.log(`   Please open ${url} manually`);
    }
  }, 2000);
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down server...');
  server.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  server.kill('SIGTERM');
  process.exit(0);
});
