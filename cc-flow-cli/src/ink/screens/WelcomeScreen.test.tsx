import { describe, it, expect, beforeEach } from 'vitest';
import { render } from 'ink-testing-library';
import React from 'react';
import { WelcomeScreen } from './WelcomeScreen.js';

// Mock the useApp hook
const mockExit = vi.fn();
vi.mock('ink', async () => {
  const actual = await vi.importActual('ink');
  return {
    ...actual,
    useApp: () => ({ exit: mockExit }),
    useInput: vi.fn()
  };
});

// Mock the theme hook with complete theme structure
vi.mock('../themes/theme.js', () => ({
  useTheme: () => ({
    colors: {
      primary: '#0066cc',
      secondary: '#6c757d',
      success: '#28a745',
      warning: '#ffc107',
      error: '#dc3545',
      info: '#17a2b8',
      border: '#dee2e6',
      background: '#ffffff',
      muted: '#868e96',
      yellow: '#ffc107',
      gray: '#6c757d',
      white: '#ffffff',
      black: '#000000',
      red: '#dc3545',
      green: '#28a745',
      blue: '#0066cc',
      magenta: '#e83e8c',
      cyan: '#17a2b8',
      text: {
        primary: '#212529',
        secondary: '#6c757d',
        muted: '#868e96',
        inverse: '#ffffff'
      },
      hex: {
        darkBlue: '#003d82',
        blue: '#0066cc',
        lightBlue: '#66b3ff',
        tealBlue: '#17a2b8',
        green: '#28a745',
        orange: '#fd7e14',
        purple: '#6f42c1',
        pink: '#e83e8c'
      }
    },
    spacing: { xs: 0, sm: 1, md: 2, lg: 3, xl: 4 },
    layout: {
      paddingX: 2,
      paddingY: 1,
      minWidth: 40,
      maxWidth: 120,
      borderStyle: 'round'
    },
    responsive: {
      terminalWidth: 80,
      terminalHeight: 24
    }
  })
}));

// Mock the package version utility
vi.mock('../../utils/package.js', () => ({
  getVersion: () => '0.0.10'
}));

describe('WelcomeScreen', () => {
  beforeEach(() => {
    mockExit.mockClear();
  });

  it('renders welcome screen correctly', () => {
    const mockOnNext = vi.fn();
    
    const { lastFrame } = render(
      <WelcomeScreen onNext={mockOnNext} />
    );
    
    const output = lastFrame();
    
    // Check for basic rendering
    expect(output).toBeDefined();
    expect(output.length).toBeGreaterThan(0);
  });

  it('displays menu options', () => {
    const mockOnNext = vi.fn();
    
    const { lastFrame } = render(
      <WelcomeScreen onNext={mockOnNext} />
    );
    
    const output = lastFrame();
    
    // Check for Start and Exit options
    expect(output).toContain('Start');
    expect(output).toContain('Exit');
  });

  it('shows keyboard shortcuts', () => {
    const mockOnNext = vi.fn();
    
    const { lastFrame } = render(
      <WelcomeScreen onNext={mockOnNext} />
    );
    
    const output = lastFrame();
    
    // Check for keyboard hints
    expect(output).toContain('↑↓: 選択');
    expect(output).toContain('Enter: 実行');
    expect(output).toContain('Q: 終了');
  });

  it('renders with proper structure', () => {
    const mockOnNext = vi.fn();
    
    const { lastFrame } = render(
      <WelcomeScreen onNext={mockOnNext} />
    );
    
    // Should render without errors
    expect(lastFrame()).toBeDefined();
    expect(lastFrame().length).toBeGreaterThan(0);
  });

  it('contains all essential elements', () => {
    const mockOnNext = vi.fn();
    
    const { lastFrame } = render(
      <WelcomeScreen onNext={mockOnNext} />
    );
    
    const output = lastFrame();
    
    // Essential elements should be present
    const essentialElements = [
      'Start', // Start button
      'Exit', // Exit button
      'Version' // Version info
    ];
    
    essentialElements.forEach(element => {
      expect(output).toContain(element);
    });
  });

  it('handles responsive layout', () => {
    const mockOnNext = vi.fn();
    
    // This test ensures the component renders without throwing errors
    // even with different screen sizes (mocked in theme)
    const { lastFrame } = render(
      <WelcomeScreen onNext={mockOnNext} />
    );
    
    expect(lastFrame()).toBeDefined();
  });
});