import React from 'react';
import { render as inkRender } from 'ink-testing-library';
import { ThemeProvider } from '../../ink/themes/theme.js';

// Default test theme with consistent terminal dimensions
const testTheme = {
  colors: {
    primary: '#0066cc',
    secondary: '#6c757d',
    success: '#28a745',
    warning: '#ffc107',
    error: '#dc3545',
    info: '#17a2b8',
    border: '#dee2e6',
    text: {
      primary: '#212529',
      secondary: '#6c757d',
      muted: '#868e96'
    }
  },
  spacing: {
    xs: 0,
    sm: 1,
    md: 2,
    lg: 3,
    xl: 4
  },
  layout: {
    paddingX: 2,
    paddingY: 1,
    minWidth: 40,
    maxWidth: 120,
    borderStyle: 'round' as const
  },
  responsive: {
    terminalWidth: 80,
    terminalHeight: 24
  }
};

/**
 * Custom render function that wraps components with ThemeProvider
 */
export const render = (ui: React.ReactElement) => {
  const WrappedComponent = () => (
    <ThemeProvider theme={testTheme}>
      {ui}
    </ThemeProvider>
  );

  return inkRender(<WrappedComponent />);
};

/**
 * Create a test theme with custom dimensions
 */
export const createTestTheme = (overrides: Partial<typeof testTheme> = {}) => ({
  ...testTheme,
  ...overrides,
  colors: { ...testTheme.colors, ...overrides.colors },
  spacing: { ...testTheme.spacing, ...overrides.spacing },
  layout: { ...testTheme.layout, ...overrides.layout },
  responsive: { ...testTheme.responsive, ...overrides.responsive }
});

/**
 * Mock stdin for testing input components
 */
export const mockStdin = () => {
  const stdin = {
    isTTY: true,
    setRawMode: vi.fn(),
    resume: vi.fn(),
    pause: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    setMaxListeners: vi.fn(),
    getMaxListeners: vi.fn(() => 10),
    emit: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    removeAllListeners: vi.fn(),
    listeners: vi.fn(() => []),
    listenerCount: vi.fn(() => 0),
    prependListener: vi.fn(),
    prependOnceListener: vi.fn(),
    once: vi.fn(),
    rawListeners: vi.fn(() => [])
  };

  return stdin;
};

/**
 * Simulate key presses for testing
 */
export const simulateKeyPress = (key: string, stdin: any) => {
  const listeners = stdin.on.mock.calls
    .filter(([event]: [string]) => event === 'data')
    .map(([, callback]: [string, Function]) => callback);

  listeners.forEach((listener: Function) => {
    listener(key);
  });
};

/**
 * Helper to extract visible text from Ink output
 */
export const getVisibleText = (frame: string): string => {
  // Remove ANSI escape codes and box drawing characters
  return frame
    .replace(/\x1b\[[0-9;]*m/g, '') // Remove color codes
    .replace(/[┌┐└┘│─┬┴├┤┼]/g, '') // Remove box drawing
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
};

// Re-export testing utilities
export { vi, expect, describe, it, beforeEach, afterEach } from 'vitest';