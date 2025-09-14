import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'src/**/*.test.ts',
        'src/**/*.spec.ts'
      ]
    },
    // Kent Beck TDD pattern: fail fast
    bail: 1,
    // Isolated tests principle
    isolate: true,
    // Test data should be evident
    clearMocks: true,
    restoreMocks: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
});