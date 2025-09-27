import { describe, it, expect } from 'vitest';
import {
  getIndexFromFirstLetter,
  getCategoryColors,
  getCategoryBorderAndBg,
  getCategoryIcon,
  getCategoryIconColor,
  ICON_PALETTE,
  COLOR_PALETTE
} from '../agentPaletteUtils';

describe('agentPaletteUtils', () => {
  describe('getIndexFromFirstLetter', () => {
    it('should return 0 for empty string', () => {
      expect(getIndexFromFirstLetter('')).toBe(0);
    });

    it('should return correct index for alphabetic characters', () => {
      expect(getIndexFromFirstLetter('apple')).toBe(0); // 'a' -> 0
      expect(getIndexFromFirstLetter('banana')).toBe(1); // 'b' -> 1
      expect(getIndexFromFirstLetter('cherry')).toBe(2); // 'c' -> 2
    });

    it('should handle uppercase letters correctly', () => {
      expect(getIndexFromFirstLetter('Apple')).toBe(0); // 'A' -> 'a' -> 0
      expect(getIndexFromFirstLetter('Banana')).toBe(1); // 'B' -> 'b' -> 1
    });

    it('should wrap around for letters beyond the palette size', () => {
      expect(getIndexFromFirstLetter('integration')).toBe(0); // 'i' -> (8) % 8 = 0
      expect(getIndexFromFirstLetter('javascript')).toBe(1); // 'j' -> (9) % 8 = 1
    });

    it('should handle non-alphabetic characters', () => {
      expect(getIndexFromFirstLetter('123')).toBe(1); // '1' char code 49 % 8 = 1
      expect(getIndexFromFirstLetter('!@#')).toBe(1); // '!' char code 33 % 8 = 1
    });
  });

  describe('getCategoryColors', () => {
    it('should return gray colors for empty category', () => {
      const colors = getCategoryColors('');
      expect(colors.border).toBe('border-gray-300');
      expect(colors.bg).toBe('bg-gradient-to-r from-white to-gray-50');
      expect(colors.hover).toBe('hover:border-gray-400 hover:from-gray-50 hover:to-gray-100');
      expect(colors.icon).toBe('bg-gray-100 text-gray-600');
    });

    it('should return correct colors for valid categories', () => {
      const blueColors = getCategoryColors('api');
      expect(blueColors).toEqual(COLOR_PALETTE[0]); // 'a' -> index 0 (blue)

      const greenColors = getCategoryColors('backend');
      expect(greenColors).toEqual(COLOR_PALETTE[1]); // 'b' -> index 1 (green)
    });

    it('should be consistent for same category', () => {
      const colors1 = getCategoryColors('testing');
      const colors2 = getCategoryColors('testing');
      expect(colors1).toEqual(colors2);
    });
  });

  describe('getCategoryBorderAndBg', () => {
    it('should return combined border, bg, and hover classes', () => {
      const result = getCategoryBorderAndBg('api');
      const expectedColors = COLOR_PALETTE[0]; // 'a' -> index 0
      expect(result).toBe(`${expectedColors.border} ${expectedColors.bg} ${expectedColors.hover}`);
    });

    it('should handle empty category', () => {
      const result = getCategoryBorderAndBg('');
      expect(result).toBe('border-gray-300 bg-gradient-to-r from-white to-gray-50 hover:border-gray-400 hover:from-gray-50 hover:to-gray-100');
    });
  });

  describe('getCategoryIcon', () => {
    it('should return default icon for empty category', () => {
      expect(getCategoryIcon('')).toBe(ICON_PALETTE[0]);
    });

    it('should return correct icon for valid categories', () => {
      expect(getCategoryIcon('api')).toBe(ICON_PALETTE[0]); // 'a' -> index 0
      expect(getCategoryIcon('backend')).toBe(ICON_PALETTE[1]); // 'b' -> index 1
    });

    it('should be consistent for same category', () => {
      const icon1 = getCategoryIcon('testing');
      const icon2 = getCategoryIcon('testing');
      expect(icon1).toBe(icon2);
    });
  });

  describe('getCategoryIconColor', () => {
    it('should return correct icon color for categories', () => {
      const iconColor = getCategoryIconColor('api');
      expect(iconColor).toBe(COLOR_PALETTE[0].icon); // 'a' -> index 0
    });

    it('should handle empty category', () => {
      const iconColor = getCategoryIconColor('');
      expect(iconColor).toBe('bg-gray-100 text-gray-600');
    });
  });

  describe('Palette consistency', () => {
    it('should have matching palette sizes', () => {
      expect(ICON_PALETTE.length).toBe(COLOR_PALETTE.length);
      expect(ICON_PALETTE.length).toBe(8);
    });

    it('should have valid SVG path strings in icon palette', () => {
      ICON_PALETTE.forEach((icon) => {
        expect(typeof icon).toBe('string');
        expect(icon.length).toBeGreaterThan(0);
        // Basic check for SVG path-like content
        expect(icon).toMatch(/[ML]/); // Should contain Move or Line commands
      });
    });

    it('should have valid Tailwind classes in color palette', () => {
      COLOR_PALETTE.forEach((colors) => {
        expect(colors.border).toMatch(/^border-\w+-\d+$/);
        expect(colors.bg).toMatch(/^bg-gradient-to-r/);
        expect(colors.hover).toMatch(/^hover:border-\w+-\d+/);
        expect(colors.icon).toMatch(/^bg-\w+-\d+\s+text-\w+-\d+$/);
      });
    });
  });
});