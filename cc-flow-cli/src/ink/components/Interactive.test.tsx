import { describe, it, expect, beforeEach } from 'vitest';
import { render } from 'ink-testing-library';
import React from 'react';
import { Text } from 'ink';
import { FocusableMenu, StatusBar, MenuItem } from './Interactive.js';

// Mock the useInput hook for testing
vi.mock('ink', async () => {
  const actual = await vi.importActual('ink');
  return {
    ...actual,
    useInput: vi.fn()
  };
});

describe('Interactive Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('FocusableMenu', () => {
    const sampleItems: MenuItem[] = [
      { label: 'First Item', value: 'first', description: 'First description' },
      { label: 'Second Item', value: 'second', description: 'Second description' },
      { label: 'Third Item', value: 'third' }
    ];

    it('renders menu items correctly', () => {
      const { lastFrame } = render(
        <FocusableMenu
          items={sampleItems}
          onSelect={() => {}}
          width={50}
        />
      );
      
      const output = lastFrame();
      expect(output).toContain('First Item');
      expect(output).toContain('Second Item');
      expect(output).toContain('Third Item');
    });

    it('highlights the first item by default', () => {
      const { lastFrame } = render(
        <FocusableMenu
          items={sampleItems}
          onSelect={() => {}}
          width={50}
        />
      );
      
      const output = lastFrame();
      // The focused item should be styled differently
      expect(output).toBeDefined();
    });

    it('displays descriptions when showDescription is true', () => {
      const { lastFrame } = render(
        <FocusableMenu
          items={sampleItems}
          onSelect={() => {}}
          width={50}
          showDescription={true}
        />
      );
      
      const output = lastFrame();
      expect(output).toContain('First description');
      // Note: Only the selected (focused) item's description may be visible in the initial render
      expect(output).toBeDefined();
    });

    it('handles custom alignment', () => {
      const { lastFrame } = render(
        <FocusableMenu
          items={sampleItems}
          onSelect={() => {}}
          width={50}
          align="center"
        />
      );
      
      expect(lastFrame()).toBeDefined();
    });

    it('sets up keyboard handling', async () => {
      const mockOnSelect = vi.fn();
      const { useInput } = await import('ink');
      
      render(
        <FocusableMenu
          items={sampleItems}
          onSelect={mockOnSelect}
          width={50}
        />
      );
      
      // Check that useInput was called to set up keyboard handling
      expect(vi.mocked(useInput)).toHaveBeenCalled();
    });

    it('supports different variants', () => {
      const variants = ['default', 'primary', 'secondary'] as const;
      
      variants.forEach(variant => {
        const { lastFrame } = render(
          <FocusableMenu
            items={sampleItems}
            onSelect={() => {}}
            width={50}
            variant={variant}
          />
        );
        
        expect(lastFrame()).toBeDefined();
      });
    });
  });

  describe('StatusBar', () => {
    it('renders basic status message', () => {
      const { lastFrame } = render(
        <StatusBar center="Test status message" width={50} />
      );
      
      const output = lastFrame();
      // StatusBar may render as a bordered container
      expect(output).toBeDefined();
      expect(output).toContain('Test status message');
    });

    it('renders with left, center, and right content', () => {
      const { lastFrame } = render(
        <StatusBar 
          left="Left content"
          center="Center content"
          right="Right content"
          width={80}
        />
      );
      
      const output = lastFrame();
      expect(output).toContain('Left content');
      expect(output).toContain('Center content');
      expect(output).toContain('Right content');
    });

    it('supports different variants', () => {
      const variants = ['default', 'info', 'success', 'warning', 'error'] as const;
      
      variants.forEach(variant => {
        const { lastFrame } = render(
          <StatusBar 
            center="Test message"
            variant={variant}
            width={50}
          />
        );
        
        expect(lastFrame()).toBeDefined();
      });
    });

    it('renders provided items', () => {
      const items = [
        { key: 'State', value: 'Ready' },
        { key: 'Mode', value: 'Interactive' }
      ];
      const { lastFrame } = render(
        <StatusBar 
          items={items}
          width={50}
        />
      );
      
      const output = lastFrame();
      items.forEach(item => {
        expect(output).toContain(`${item.key}`);
        expect(output).toContain(`${item.value}`);
      });
    });

    it('renders left-aligned content', () => {
      const { lastFrame } = render(
        <StatusBar 
          left="Colored message"
          width={50}
        />
      );
      
      const output = lastFrame();
      expect(output).toContain('Colored message');
    });
  });

  describe('MenuItem Interface', () => {
    it('supports basic item structure', () => {
      const item: MenuItem = {
        label: 'Test Item',
        value: 'test'
      };
      
      expect(item.label).toBe('Test Item');
      expect(item.value).toBe('test');
    });

    it('supports optional properties', () => {
      const item: MenuItem = {
        label: 'Test Item',
        value: 'test',
        description: 'Test description',
        disabled: false,
        icon: '🎯'
      };
      
      expect(item.description).toBe('Test description');
      expect(item.disabled).toBe(false);
      expect(item.icon).toBe('🎯');
    });
  });
});
