#!/usr/bin/env node

/**
 * Post-build script to ensure the bin script is properly configured
 * This fixes any potential issues with CLI execution in different environments
 */

import { readFileSync, writeFileSync, chmodSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const binPath = join(__dirname, '..', 'bin', 'cc-flow.js');

try {
  let binContent = readFileSync(binPath, 'utf8');
  
  // Ensure the shebang is correct
  if (!binContent.startsWith('#!/usr/bin/env node')) {
    binContent = '#!/usr/bin/env node\n' + binContent.replace(/^#!.*\n/, '');
  }
  
  // Ensure proper imports (ESM)
  if (!binContent.includes('import')) {
    console.log('\u2139\ufe0f Binary script already in correct format');
  } else {
    // Ensure proper error handling with ErrorHandler
    if (!binContent.includes('ErrorHandler')) {
      binContent = binContent.replace(
        /import \{ WorkflowBuilder \} from.*?;/,
        `import { WorkflowBuilder } from '../dist/cli/main.js';
import { ErrorHandler } from '../dist/utils/ErrorHandler.js';`
      );
      
      binContent = binContent.replace(
        /builder\.run\(\)\.catch\(.*?\);/s,
        `// Setup global error handlers
ErrorHandler.handleProcessErrors();

// Run the CLI application
const builder = new WorkflowBuilder();
builder.run().catch((error) => {
  ErrorHandler.handleError(error, {
    operation: 'cli-execution',
    component: 'main'
  });
});`
      );
    }
  }
  
  writeFileSync(binPath, binContent);
  chmodSync(binPath, 0o755);
  
  console.log('✅ Binary script fixed and made executable');
} catch (error) {
  console.error('❌ Failed to fix binary script:', error.message);
  process.exit(1);
}