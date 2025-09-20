import { describe, it, expect } from 'vitest';
import { render } from 'ink-testing-library';
import React from 'react';
import { Text } from 'ink';
import { Container, Card, Section, Flex, Header, Loading } from './Layout.js';

describe('Layout Components', () => {
  describe('Container', () => {
    it('renders children correctly', () => {
      const { lastFrame } = render(
        <Container>
          <Text>Test content</Text>
        </Container>
      );
      
      expect(lastFrame()).toBeDefined();
    });

    it('applies centered layout by default', () => {
      const { lastFrame } = render(
        <Container>
          <Text>Centered content</Text>
        </Container>
      );
      
      expect(lastFrame()).toBeDefined();
    });

    it('supports non-centered layout', () => {
      const { lastFrame } = render(
        <Container centered={false}>
          <Text>Non-centered content</Text>
        </Container>
      );
      
      expect(lastFrame()).toBeDefined();
    });
  });

  describe('Card', () => {
    it('renders with basic content', () => {
      const { lastFrame } = render(
        <Card>
          <Text>Card content</Text>
        </Card>
      );
      
      expect(lastFrame()).toBeDefined();
    });

    it('renders with title and subtitle', () => {
      const { lastFrame } = render(
        <Card title="Test Title" subtitle="Test Subtitle">
          <Text>Card content</Text>
        </Card>
      );
      
      const output = lastFrame();
      expect(output).toContain('Test Title');
      expect(output).toContain('Test Subtitle');
    });

    it('renders with icon', () => {
      const { lastFrame } = render(
        <Card title="Test Title" icon="🎯">
          <Text>Card content</Text>
        </Card>
      );
      
      const output = lastFrame();
      expect(output).toContain('🎯');
      expect(output).toContain('Test Title');
    });

    it('renders with description', () => {
      const { lastFrame } = render(
        <Card description="This is a test description">
          <Text>Card content</Text>
        </Card>
      );
      
      const output = lastFrame();
      expect(output).toContain('This is a test description');
    });

    it('supports different variants', () => {
      const variants = ['default', 'primary', 'success', 'warning', 'info', 'danger'] as const;
      
      variants.forEach(variant => {
        const { lastFrame } = render(
          <Card variant={variant}>
            <Text>Variant test</Text>
          </Card>
        );
        
        expect(lastFrame()).toBeDefined();
      });
    });
  });

  describe('Section', () => {
    it('renders with title', () => {
      const { lastFrame } = render(
        <Section title="Section Title">
          <Text>Section content</Text>
        </Section>
      );
      
      const output = lastFrame();
      expect(output).toContain('Section Title');
    });

    it('renders with icon and title', () => {
      const { lastFrame } = render(
        <Section title="Section Title" icon="📂">
          <Text>Section content</Text>
        </Section>
      );
      
      const output = lastFrame();
      expect(output).toContain('📂');
      expect(output).toContain('Section Title');
    });

    it('supports different spacing options', () => {
      const spacings = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
      
      spacings.forEach(spacing => {
        const { lastFrame } = render(
          <Section spacing={spacing}>
            <Text>Spacing test</Text>
          </Section>
        );
        
        expect(lastFrame()).toBeDefined();
      });
    });
  });

  describe('Flex', () => {
    it('renders children in flex layout', () => {
      const { lastFrame } = render(
        <Flex>
          <Text>Item 1</Text>
          <Text>Item 2</Text>
        </Flex>
      );
      
      const output = lastFrame();
      expect(output).toContain('Item 1');
      expect(output).toContain('Item 2');
    });

    it('supports different directions', () => {
      const { lastFrame } = render(
        <Flex direction="column">
          <Text>Item 1</Text>
          <Text>Item 2</Text>
        </Flex>
      );
      
      expect(lastFrame()).toBeDefined();
    });

    it('supports gap property', () => {
      const { lastFrame } = render(
        <Flex gap={2}>
          <Text>Item 1</Text>
          <Text>Item 2</Text>
        </Flex>
      );
      
      expect(lastFrame()).toBeDefined();
    });
  });

  describe('Header', () => {
    it('renders title', () => {
      const { lastFrame } = render(
        <Header title="Header Title" />
      );
      
      const output = lastFrame();
      expect(output).toContain('Header Title');
    });

    it('renders title with subtitle', () => {
      const { lastFrame } = render(
        <Header title="Header Title" subtitle="Header Subtitle" />
      );
      
      const output = lastFrame();
      expect(output).toContain('Header Title');
      expect(output).toContain('Header Subtitle');
    });

    it('renders with icon', () => {
      const { lastFrame } = render(
        <Header title="Header Title" icon="🌟" />
      );
      
      const output = lastFrame();
      expect(output).toContain('🌟');
      expect(output).toContain('Header Title');
    });
  });

  describe('Loading', () => {
    it('renders loading text', () => {
      const { lastFrame } = render(
        <Loading text="Loading..." />
      );
      
      const output = lastFrame();
      expect(output).toContain('Loading...');
    });

    it('renders loading text with hint', () => {
      const { lastFrame } = render(
        <Loading text="Loading..." hint="Please wait" />
      );
      
      const output = lastFrame();
      expect(output).toContain('Loading...');
      expect(output).toContain('Please wait');
    });

    it('displays loading spinner', () => {
      const { lastFrame } = render(
        <Loading text="Loading..." />
      );
      
      const output = lastFrame();
      expect(output).toContain('⠋');
    });
  });
});