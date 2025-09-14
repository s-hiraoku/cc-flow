/**
 * Tests for TypeScript configuration issues
 * These tests expose the current problems with ESM/CommonJS configuration
 */

import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..', '..');

describe('TypeScript Configuration', () => {
  it('should compile without errors', () => {
    expect(() => {
      execSync('npm run compile', { 
        cwd: rootDir, 
        stdio: 'pipe',
        encoding: 'utf-8'
      });
    }).not.toThrow();
  });

  it('should generate proper ES module output', () => {
    // First ensure compilation
    execSync('npm run compile', { cwd: rootDir, stdio: 'pipe' });
    
    const mainJsPath = join(rootDir, 'dist', 'cli', 'main.js');
    expect(existsSync(mainJsPath)).toBe(true);
    
    const mainJsContent = readFileSync(mainJsPath, 'utf-8');
    
    // Should not contain CommonJS exports
    expect(mainJsContent).not.toContain('module.exports');
    expect(mainJsContent).not.toContain('exports.default');
    
    // Should contain proper ES module imports/exports
    expect(mainJsContent).toContain('export');
    expect(mainJsContent).toContain('import');
  });

  it('should handle import.meta.url correctly', () => {
    execSync('npm run compile', { cwd: rootDir, stdio: 'pipe' });
    
    const mainJsPath = join(rootDir, 'dist', 'cli', 'main.js');
    const mainJsContent = readFileSync(mainJsPath, 'utf-8');
    
    // Should contain import.meta.url (not converted to require)
    expect(mainJsContent).toContain('import.meta.url');
  });

  it('should generate proper .js import extensions', () => {
    execSync('npm run compile', { cwd: rootDir, stdio: 'pipe' });
    
    const mainJsPath = join(rootDir, 'dist', 'cli', 'main.js');
    const mainJsContent = readFileSync(mainJsPath, 'utf-8');
    
    // All relative imports should end with .js
    const relativeImports = mainJsContent.match(/import.*from\s+['"][^'"]*\.js['"]/g);
    const relativeImportsWithoutJs = mainJsContent.match(/import.*from\s+['"][\.\/][^'"]*(?<!\.js)['"]/g);
    
    expect(relativeImports).toBeTruthy();
    expect(relativeImportsWithoutJs).toBeNull();
  });
});

describe('CLI Execution', () => {
  it('should be executable without module resolution errors', () => {
    // Build first
    execSync('npm run build', { cwd: rootDir, stdio: 'pipe' });
    
    // Test basic CLI loading (without user interaction)
    expect(() => {
      execSync('node --help', { 
        cwd: rootDir, 
        stdio: 'pipe',
        timeout: 5000 
      });
    }).not.toThrow();
  });

  it('should load all ES module dependencies correctly', () => {
    execSync('npm run build', { cwd: rootDir, stdio: 'pipe' });
    
    const binPath = join(rootDir, 'bin', 'cc-flow.js');
    expect(existsSync(binPath)).toBe(true);
    
    // Check that the file can be parsed as a valid ES module
    const binContent = readFileSync(binPath, 'utf-8');
    expect(binContent).toContain('import');
    expect(binContent).not.toContain('require(');
  });
});

describe('Package.json Configuration', () => {
  it('should have proper ESM configuration', () => {
    const packageJsonPath = join(rootDir, 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    
    expect(packageJson.type).toBe('module');
    expect(packageJson.exports).toBeDefined();
    expect(packageJson.exports['.']).toHaveProperty('import');
    expect(packageJson.exports['./cli']).toHaveProperty('import');
  });

  it('should support Node.js 18+ for import.meta.url', () => {
    const packageJsonPath = join(rootDir, 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    
    const nodeVersion = packageJson.engines?.node;
    expect(nodeVersion).toMatch(/>=18/);
  });
});