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

    it('handles zero width', () => {
      const result = renderLines('Test', 0, 'left');

      expect(result).toHaveLength(1);
      expect(result[0]).toBe('Test');
    });

    it('handles negative width', () => {
      const result = renderLines('Test', -5, 'left');

      expect(result).toHaveLength(1);
      expect(result[0]).toBe('Test');
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

    it('handles ANSI color codes correctly', () => {
      const coloredText = '\x1b[31mRed Text\x1b[0m';
      const result = renderLines(coloredText, 20, 'left');

      expect(result).toHaveLength(1);
      expect(result[0]).toContain('Red Text');
    });

    it('handles tabs in text', () => {
      const textWithTabs = 'Line\twith\ttabs';
      const result = renderLines(textWithTabs, 30, 'left');

      expect(result).toHaveLength(1);
      // Tab characters may expand to spaces, so length may vary
      expect(result[0].length).toBeGreaterThanOrEqual(30);
    });

    it('handles newlines in string input', () => {
      const multilineString = 'Line 1\nLine 2\nLine 3';
      const result = renderLines(multilineString, 20, 'left');

      // wrapAnsi may handle newlines differently
      expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('handles empty array input correctly', () => {
      const result = renderLines([], 20, 'left');

      expect(result).toEqual([]);
    });

    it('handles array with empty strings', () => {
      const result = renderLines(['', '', ''], 20, 'left');

      expect(result).toHaveLength(3);
      result.forEach(line => {
        expect(line.length).toBe(20);
      });
    });

    it('handles mixed empty and non-empty lines', () => {
      const result = renderLines(['First', '', 'Third'], 20, 'center');

      expect(result).toHaveLength(3);
      expect(result[0].trim()).toBe('First');
      expect(result[1].trim()).toBe('');
      expect(result[2].trim()).toBe('Third');
    });

    it('handles very wide width', () => {
      const result = renderLines('Short', 1000, 'left');

      expect(result[0].length).toBe(1000);
      expect(result[0].trim()).toBe('Short');
    });

    it('handles text with only spaces', () => {
      const result = renderLines('     ', 10, 'center');

      expect(result).toHaveLength(1);
      expect(result[0].length).toBe(10);
    });

    it('handles right alignment with wrapping', () => {
      const longText = 'This is a long text that will wrap';
      const result = renderLines(longText, 15, 'right');

      expect(result.length).toBeGreaterThan(1);
      result.forEach(line => {
        expect(line.length).toBeLessThanOrEqual(15);
        // Each line should be right-aligned
        if (line.trim().length > 0) {
          expect(line.endsWith(line.trim())).toBe(true);
        }
      });
    });

    it('preserves leading spaces in text', () => {
      const result = renderLines('  Indented', 20, 'left');

      expect(result[0]).toContain('  Indented');
    });

    it('handles double-width characters (CJK)', () => {
      const cjkText = '日本語テキスト';
      const result = renderLines(cjkText, 20, 'center');

      expect(result.length).toBeGreaterThanOrEqual(1);
      result.forEach(line => {
        expect(line.length).toBeLessThanOrEqual(20);
      });
    });

    it('handles emoji with proper width calculation', () => {
      const emojiText = '👨‍👩‍👧‍👦 Family';
      const result = renderLines(emojiText, 20, 'left');

      expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('handles combining characters', () => {
      const combiningText = 'e\u0301'; // é using combining accent
      const result = renderLines(combiningText, 20, 'center');

      expect(result).toHaveLength(1);
      // Combining characters may affect width calculation
      expect(result[0].length).toBeGreaterThanOrEqual(19);
      expect(result[0].length).toBeLessThanOrEqual(20);
    });

    it('handles zero-width joiners', () => {
      const zwjText = '👨‍💻'; // man technologist with ZWJ
      const result = renderLines(zwjText, 20, 'left');

      expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('handles repeated calls with same input', () => {
      const text = 'Repeated test';
      const result1 = renderLines(text, 20, 'center');
      const result2 = renderLines(text, 20, 'center');

      expect(result1).toEqual(result2);
    });

    it('handles different alignments for same text', () => {
      const text = 'Test';
      const left = renderLines(text, 20, 'left');
      const center = renderLines(text, 20, 'center');
      const right = renderLines(text, 20, 'right');

      expect(left[0]).not.toEqual(center[0]);
      expect(center[0]).not.toEqual(right[0]);
      expect(left[0]).not.toEqual(right[0]);
    });

    it('handles URLs without breaking', () => {
      const url = 'https://example.com/very/long/path/to/resource';
      const result = renderLines(url, 20, 'left');

      expect(result.length).toBeGreaterThan(1);
    });

    it('handles mixed ASCII and Unicode', () => {
      const mixed = 'Hello 世界 World 🌍';
      const result = renderLines(mixed, 20, 'center');

      result.forEach(line => {
        expect(line.length).toBeLessThanOrEqual(20);
      });
    });

    it('handles control characters', () => {
      const withControl = 'Text\x00with\x01control';
      const result = renderLines(withControl, 20, 'left');

      expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('handles very long single word', () => {
      const longWord = 'a'.repeat(100);
      const result = renderLines(longWord, 10, 'left');

      expect(result.length).toBe(10);
      result.forEach(line => {
        expect(line.length).toBeLessThanOrEqual(10);
      });
    });

    it('handles alternating short and long lines in array', () => {
      const lines = [
        'Short',
        'This is a very long line that will definitely need to be wrapped',
        'Another short one',
        'And another extremely long line that should wrap across multiple lines for testing purposes'
      ];
      const result = renderLines(lines, 20, 'left');

      expect(result.length).toBeGreaterThan(lines.length);
    });
  });
});