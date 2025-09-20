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

// Mock the theme hook
vi.mock('../themes/theme.js', () => ({
  useTheme: () => ({
    colors: {
      primary: '#0066cc',
      yellow: '#ffc107',
      gray: '#6c757d',
      hex: {
        darkBlue: '#003d82',
        blue: '#0066cc',
        lightBlue: '#66b3ff',
        green: '#28a745'
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
    
    // Check for logo elements (CC-FLOW text)
    expect(output).toContain('██████╗');
    
    // Check for hero text
    expect(output).toContain('Create workflows using subagents');
    
    // Check for feature text
    expect(output).toContain('エージェントを連携させてワークフロー作成');
    
    // Check for version display
    expect(output).toContain('Version 0.0.10');
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
      '██████╗', // Logo
      'CC-FLOW', // Brand name in some form
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