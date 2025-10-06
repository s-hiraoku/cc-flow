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
const standaloneServer = join(packageRoot, '.next', 'standalone', 'server.js');

// Check if standalone build exists
if (!existsSync(standaloneServer)) {
  console.error('❌ Standalone build not found.');
  console.error('   Please reinstall: npm install -g @hiraoku/cc-flow-web');
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

// Start Next.js standalone server
// IMPORTANT: Next.js standalone must run from its own directory
// to correctly resolve webpack modules and static assets
const standaloneDir = join(packageRoot, '.next', 'standalone');
const server = spawn('node', [join(standaloneDir, 'server.js')], {
  cwd: standaloneDir,
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
