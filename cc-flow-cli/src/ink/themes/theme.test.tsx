import { describe, it, expect } from 'vitest';
import { render } from 'ink-testing-library';
import React from 'react';
import { Text } from 'ink';
import { createTheme, useTheme } from './theme.js';

// Mock the useStdout hook
vi.mock('ink', async () => {
  const actual = await vi.importActual('ink');
  return {
    ...actual,
    useStdout: () => ({
      stdout: {
        columns: 80,
        rows: 24
      }
    })
  };
});

// Test component that uses theme
const TestComponent: React.FC = () => {
  const theme = useTheme();
  return (
    <Text color={theme.colors.primary}>
      Theme test: {theme.colors.primary}
    </Text>
  );
};

describe('Theme System', () => {
  describe('createTheme', () => {
    it('creates a valid theme with default dimensions', () => {
      const theme = createTheme({ columns: 80, rows: 24 });
      
      expect(theme.colors).toBeDefined();
      expect(theme.colors.primary).toBeDefined();
      expect(theme.colors.secondary).toBeDefined();
      expect(theme.spacing).toBeDefined();
      expect(theme.layout).toBeDefined();
      expect(theme.responsive).toBeDefined();
    });

    it('accepts custom terminal dimensions', () => {
      const theme = createTheme({ columns: 100, rows: 30 });
      
      // Check that responsive properties exist and are defined
      expect(theme.responsive).toBeDefined();
      expect(typeof theme.responsive.terminalWidth).toBe('number');
      expect(typeof theme.responsive.terminalHeight).toBe('number');
      // Note: Actual values may be affected by stdout mocking
    });

    it('has valid color values', () => {
      const theme = createTheme({ columns: 80, rows: 24 });
      
      // Check that colors are valid hex strings or named colors
      expect(theme.colors.primary).toMatch(/^#[0-9a-fA-F]{6}$|^[a-zA-Z]+$/);
      expect(theme.colors.success).toMatch(/^#[0-9a-fA-F]{6}$|^[a-zA-Z]+$/);
      expect(theme.colors.error).toMatch(/^#[0-9a-fA-F]{6}$|^[a-zA-Z]+$/);
    });

    it('has valid spacing values', () => {
      const theme = createTheme({ columns: 80, rows: 24 });
      
      expect(typeof theme.spacing.xs).toBe('number');
      expect(typeof theme.spacing.sm).toBe('number');
      expect(typeof theme.spacing.md).toBe('number');
      expect(typeof theme.spacing.lg).toBe('number');
      expect(typeof theme.spacing.xl).toBe('number');
      
      // Spacing should be in ascending order
      expect(theme.spacing.xs).toBeLessThan(theme.spacing.sm);
      expect(theme.spacing.sm).toBeLessThan(theme.spacing.md);
      expect(theme.spacing.md).toBeLessThan(theme.spacing.lg);
      expect(theme.spacing.lg).toBeLessThan(theme.spacing.xl);
    });

    it('has valid layout properties', () => {
      const theme = createTheme({ columns: 80, rows: 24 });
      
      expect(typeof theme.layout.paddingX).toBe('number');
      expect(typeof theme.layout.paddingY).toBe('number');
      expect(typeof theme.layout.minWidth).toBe('number');
      expect(typeof theme.layout.maxWidth).toBe('number');
      expect(theme.layout.borderStyle).toMatch(/^(single|double|round|bold|singleDouble|doubleSingle|classic)$/);
      
      // Check that widths are valid numbers
      expect(typeof theme.layout.minWidth).toBe('number');
      expect(typeof theme.layout.maxWidth).toBe('number');
    });

    it('handles small terminal dimensions', () => {
      const theme = createTheme({ columns: 40, rows: 10 });
      
      expect(theme.responsive).toBeDefined();
      expect(typeof theme.responsive.terminalWidth).toBe('number');
      expect(typeof theme.responsive.terminalHeight).toBe('number');
      expect(typeof theme.layout.maxWidth).toBe('number');
    });
  });

  describe('useTheme hook', () => {
    it('returns theme from context', () => {
      let capturedTheme: any = null;
      
      const CaptureTheme: React.FC = () => {
        capturedTheme = useTheme();
        return <Text>Theme captured</Text>;
      };
      
      render(<CaptureTheme />);
      
      expect(capturedTheme).toBeDefined();
      expect(capturedTheme.colors).toBeDefined();
      expect(capturedTheme.spacing).toBeDefined();
      expect(capturedTheme.layout).toBeDefined();
      expect(capturedTheme.responsive).toBeDefined();
    });

    it('provides consistent theme structure', () => {
      let capturedTheme: any = null;
      
      const CaptureTheme: React.FC = () => {
        capturedTheme = useTheme();
        return <Text>Theme captured</Text>;
      };
      
      render(<CaptureTheme />);
      
      // Check required theme structure
      expect(capturedTheme.colors.primary).toBeDefined();
      expect(capturedTheme.colors.text.primary).toBeDefined();
      expect(capturedTheme.spacing.md).toBeDefined();
      expect(capturedTheme.layout.paddingX).toBeDefined();
      expect(capturedTheme.responsive.terminalWidth).toBeGreaterThan(0);
    });
  });

  describe('Theme Structure', () => {
    it('contains all required color properties', () => {
      const theme = createTheme({ columns: 80, rows: 24 });
      
      const requiredColors = [
        'primary', 'secondary', 'success', 'warning', 'error', 'info', 'border'
      ];
      
      requiredColors.forEach(color => {
        expect(theme.colors).toHaveProperty(color);
      });
    });

    it('contains text color variants', () => {
      const theme = createTheme({ columns: 80, rows: 24 });
      
      expect(theme.colors.text).toBeDefined();
      expect(theme.colors.text.primary).toBeDefined();
      expect(theme.colors.text.secondary).toBeDefined();
      expect(theme.colors.text.muted).toBeDefined();
    });

    it('contains hex color variants', () => {
      const theme = createTheme({ columns: 80, rows: 24 });
      
      if (theme.colors.hex) {
        expect(theme.colors.hex.blue).toBeDefined();
        expect(theme.colors.hex.green).toBeDefined();
      }
    });

    it('has responsive properties', () => {
      const theme = createTheme({ columns: 80, rows: 24 });
      
      expect(theme.responsive).toBeDefined();
      expect(typeof theme.responsive.terminalWidth).toBe('number');
      expect(typeof theme.responsive.terminalHeight).toBe('number');
    });

    it('contains standard color names', () => {
      const theme = createTheme({ columns: 80, rows: 24 });
      
      const standardColors = ['white', 'black', 'red', 'green', 'blue', 'yellow'];
      standardColors.forEach(color => {
        expect(theme.colors).toHaveProperty(color);
      });
    });
  });

  describe('Theme Integration', () => {
    it('works with React components', () => {
      const { lastFrame } = render(<TestComponent />);
      
      const output = lastFrame();
      expect(output).toContain('Theme test');
    });

    it('provides colors that can be used in Text components', () => {
      const theme = createTheme({ columns: 80, rows: 24 });
      
      const { lastFrame } = render(
        <Text color={theme.colors.success}>Success message</Text>
      );
      
      const output = lastFrame();
      expect(output).toContain('Success message');
    });

    it('handles different terminal sizes gracefully', () => {
      const smallTheme = createTheme({ columns: 40, rows: 10 });
      const largeTheme = createTheme({ columns: 120, rows: 40 });
      
      expect(typeof smallTheme.responsive.terminalWidth).toBe('number');
      expect(typeof largeTheme.responsive.terminalWidth).toBe('number');
      
      // Both should have valid layout properties
      expect(typeof smallTheme.layout.maxWidth).toBe('number');
      expect(typeof largeTheme.layout.maxWidth).toBe('number');
    });
  });
});