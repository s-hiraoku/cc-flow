import { describe, it, expect } from 'vitest';
import { renderLines } from './text.js';

describe('Text Utilities', () => {
  describe('renderLines', () => {
    it('renders single line within width', () => {
      const result = renderLines('Hello World', 20, 'left');
      
      expect(result).toHaveLength(1);
      expect(result[0].trim()).toBe('Hello World');
      expect(result[0].length).toBe(20); // Always pads to full width
    });

    it('renders multiple lines for long text', () => {
      const longText = 'This is a very long text that should be wrapped across multiple lines';
      const result = renderLines(longText, 20, 'left');
      
      expect(result.length).toBeGreaterThan(1);
      result.forEach(line => {
        expect(line.length).toBeLessThanOrEqual(20);
      });
    });

    it('handles left alignment with padding', () => {
      const result = renderLines('Short', 20, 'left');
      
      expect(result[0]).toBe('Short               '); // Padded to width 20
      expect(result[0].length).toBe(20);
      expect(result[0].startsWith('Short')).toBe(true);
    });

    it('handles center alignment', () => {
      const result = renderLines('Hello', 20, 'center');
      
      expect(result[0].trim()).toBe('Hello');
      expect(result[0].length).toBe(20);
      
      // Should have equal padding on both sides (or differ by 1)
      const trimmed = result[0].trim();
      const leftPadding = result[0].indexOf(trimmed);
      const rightPadding = result[0].length - leftPadding - trimmed.length;
      expect(Math.abs(leftPadding - rightPadding)).toBeLessThanOrEqual(1);
    });

    it('handles right alignment', () => {
      const result = renderLines('Hello', 20, 'right');
      
      expect(result[0].trim()).toBe('Hello');
      expect(result[0].length).toBe(20);
      expect(result[0].endsWith('Hello')).toBe(true);
    });

    it('handles array input', () => {
      const lines = ['First line', 'Second line', 'Third line'];
      const result = renderLines(lines, 20, 'left');
      
      expect(result).toHaveLength(3);
      expect(result[0].trim()).toBe('First line');
      expect(result[1].trim()).toBe('Second line');
      expect(result[2].trim()).toBe('Third line');
      
      // All lines should be padded to width
      result.forEach(line => {
        expect(line.length).toBe(20);
      });
    });

    it('wraps long lines in array input', () => {
      const lines = ['Short', 'This is a very long line that should be wrapped'];
      const result = renderLines(lines, 15, 'left');
      
      expect(result.length).toBeGreaterThan(2);
      expect(result[0].trim()).toBe('Short');
      
      // All lines should respect the width limit
      result.forEach(line => {
        expect(line.length).toBeLessThanOrEqual(15);
      });
    });

    it('handles empty input', () => {
      expect(renderLines('', 20, 'left')).toEqual([' '.repeat(20)]); // Empty string padded
      expect(renderLines([], 20, 'left')).toEqual([]);
    });

    it('handles very small width', () => {
      const result = renderLines('Hello World', 5, 'left');
      
      result.forEach(line => {
        expect(line.length).toBeLessThanOrEqual(5);
      });
      
      // Check that text is preserved across wrapped lines
      const allText = result.map(line => line.trim()).join('');
      expect(allText.replace(/\s+/g, '')).toContain('HelloWorld');
    });

    it('preserves word boundaries when possible', () => {
      const result = renderLines('Hello World Test', 12, 'left');
      
      // Should break at word boundaries when possible
      const trimmedLines = result.map(line => line.trim());
      expect(trimmedLines.some(line => line === 'Hello World')).toBe(true);
    });

    it('handles special characters correctly', () => {
      const specialText = 'Hello 🌟 World 🎯 Test';
      const result = renderLines(specialText, 15, 'center');
      
      result.forEach(line => {
        expect(line.length).toBeLessThanOrEqual(15);
      });
    });

    it('maintains consistent width for all alignment types', () => {
      const text = 'Test';
      const width = 20;
      
      const leftResult = renderLines(text, width, 'left');
      const centerResult = renderLines(text, width, 'center');
      const rightResult = renderLines(text, width, 'right');
      
      expect(leftResult[0].length).toBe(width);
      expect(centerResult[0].length).toBe(width);
      expect(rightResult[0].length).toBe(width);
    });

    it('handles edge case with width 1', () => {
      const result = renderLines('ABC', 1, 'left');
      
      expect(result).toHaveLength(3);
      expect(result[0].trim()).toBe('A');
      expect(result[1].trim()).toBe('B');
      expect(result[2].trim()).toBe('C');
    });

    it('handles multiline input with different alignments', () => {
      const lines = ['Short', 'Medium length', 'Very long line that needs wrapping'];
      const result = renderLines(lines, 15, 'center');
      
      expect(result.length).toBeGreaterThan(3);
      result.forEach(line => {
        expect(line.length).toBeLessThanOrEqual(15);
      });
    });

    it('handles text longer than width', () => {
      const result = renderLines('This text is definitely longer than width', 10, 'left');
      
      expect(result.length).toBeGreaterThan(1);
      result.forEach(line => {
        expect(line.length).toBeLessThanOrEqual(10);
      });
    });

    it('preserves alignment for wrapped text', () => {
      const result = renderLines('A B C D E F G H I J K L', 8, 'center');
      
      result.forEach(line => {
        expect(line.length).toBeLessThanOrEqual(8);
        // Each line should be centered within its width
        const trimmed = line.trim();
        if (trimmed.length > 0) {
          const leftSpaces = line.indexOf(trimmed);
          const rightSpaces = line.length - leftSpaces - trimmed.length;
          expect(Math.abs(leftSpaces - rightSpaces)).toBeLessThanOrEqual(1);
        }
      });
    });
  });
});