/**
 * CC-Flow TUI Design System - Reusable Screen Components
 * 
 * Pre-built components implementing the unified design patterns
 * for consistent screen layouts across the application.
 */

import React from 'react';
import { Box, Text } from 'ink';
import { Container, Card, Section } from '../components/Layout.js';
import { StatusBar, FocusableMenu, MenuItem } from '../components/Interactive.js';
import { renderLines } from '../utils/text.js';
import { 
  DESIGN_TOKENS, 
  SCREEN_PATTERNS, 
  useScreenDimensions, 
  getStatusBarConfig, 
  getScreenColors,
  type ScreenLayoutConfig 
} from './ScreenPatterns.js';

// Logo Component (from WelcomeScreen)
interface LogoProps {
  lines: string[];
  contentWidth: number;
}

export const Logo: React.FC<LogoProps> = ({ lines, contentWidth }) => {
  const { theme } = useScreenDimensions();
  const logoColors = DESIGN_TOKENS.typography.logo.colors(theme);

  return (
    <Section spacing={DESIGN_TOKENS.spacing.logo} align="center">
      <Box flexDirection="column" width="100%" alignItems="center">
        {lines.map((line, index) => {
          const [centeredLine] = renderLines(line, contentWidth, 'center');
          const logoColor = logoColors[index] ?? theme.colors.hex.blue;
          return (
            <Text key={`logo-${index}`} color={logoColor}>
              {centeredLine}
            </Text>
          );
        })}
      </Box>
    </Section>
  );
};

// Hero Text Component
interface HeroTextProps {
  text: string | string[];
  contentWidth: number;
}

export const HeroText: React.FC<HeroTextProps> = ({ text, contentWidth }) => {
  const { theme } = useScreenDimensions();
  const heroLines = typeof text === 'string' 
    ? renderLines(text, contentWidth, 'center')
    : text;

  return (
    <Section spacing={DESIGN_TOKENS.spacing.hero} align="center">
      <Box flexDirection="column" width="100%" alignItems="center">
        {heroLines.map((line, index) => (
          <Text 
            key={`hero-${index}`} 
            color={DESIGN_TOKENS.typography.hero.color(theme)} 
            bold={DESIGN_TOKENS.typography.hero.bold}
          >
            {line}
          </Text>
        ))}
      </Box>
    </Section>
  );
};

// Feature Highlights Component
interface FeatureHighlightsProps {
  features: string[];
  contentWidth: number;
}

export const FeatureHighlights: React.FC<FeatureHighlightsProps> = ({ features, contentWidth }) => {
  const { theme } = useScreenDimensions();

  return (
    <Section spacing={DESIGN_TOKENS.spacing.features} align="center">
      <Box flexDirection="column" width="100%" alignItems="center">
        {features.map((feature, index) => {
          const [centeredLine] = renderLines(feature, contentWidth, 'center');
          return (
            <Text 
              key={`feature-${index}`} 
              color={DESIGN_TOKENS.typography.feature.color(theme)}
            >
              {centeredLine}
            </Text>
          );
        })}
      </Box>
    </Section>
  );
};

// Screen Description Component
interface ScreenDescriptionProps {
  heading?: string;
  subheading?: string;
  description?: string;
  align?: 'left' | 'center' | 'right';
}

export const ScreenDescription: React.FC<ScreenDescriptionProps> = ({ 
  heading, 
  subheading, 
  description,
  align = 'center' 
}) => {
  const { theme } = useScreenDimensions();
  const colors = getScreenColors(theme);

  return (
    <Section spacing={DESIGN_TOKENS.spacing.content} align={align}>
      <Box flexDirection="column" width="100%" alignItems={align === 'center' ? 'center' : 'flex-start'}>
        {heading && (
          <Text 
            color={colors.text.emphasis} 
            bold={DESIGN_TOKENS.typography.heading.bold}
          >
            {heading}
          </Text>
        )}
        {subheading && (
          <Text 
            color={colors.text.muted} 
            italic={DESIGN_TOKENS.typography.subheading.italic}
          >
            {subheading}
          </Text>
        )}
        {description && (
          <Text color={colors.text.secondary}>
            {description}
          </Text>
        )}
      </Box>
    </Section>
  );
};

// Menu Section Component
interface MenuSectionProps {
  items: MenuItem[];
  onSelect: (item: MenuItem) => void;
  showDescription?: boolean;
  contentWidth?: number;
}

export const MenuSection: React.FC<MenuSectionProps> = ({ 
  items, 
  onSelect, 
  showDescription = false,
  contentWidth 
}) => {
  const { contentWidth: defaultContentWidth, theme } = useScreenDimensions();
  const colors = getScreenColors(theme);

  return (
    <Section spacing={DESIGN_TOKENS.spacing.menu} align="center">
      <Box 
        borderStyle="single"
        borderColor={colors.text.emphasis}
        padding={1}
        width="100%"
        alignItems="center"
        flexDirection="column"
      >
        <FocusableMenu
          items={items}
          onSelect={onSelect}
          width={(contentWidth || defaultContentWidth) - 4} // Account for border and padding
          align="left"
          showDescription={showDescription}
        />
      </Box>
    </Section>
  );
};

// Hint Box Component
interface HintBoxProps {
  title: string;
  hints: string[];
}

export const HintBox: React.FC<HintBoxProps> = ({ title, hints }) => {
  const { theme } = useScreenDimensions();
  const colors = getScreenColors(theme);

  return (
    <Section spacing={DESIGN_TOKENS.spacing.hint}>
      <Box 
        borderStyle="single"
        borderColor={colors.text.feature}
        padding={1}
        width="100%"
      >
        <Box flexDirection="column" gap={1}>
          <Text color={colors.text.feature} bold>
            {title}
          </Text>
          {hints.map((hint, index) => (
            <Text key={`hint-${index}`} color={colors.text.secondary}>
              {hint}
            </Text>
          ))}
        </Box>
      </Box>
    </Section>
  );
};

// Screen Status Bar Component
interface ScreenStatusBarProps {
  navigationType: ScreenLayoutConfig['navigationType'];
  customMessage?: string;
  contentWidth?: number;
  items?: Array<{ key: string; value: string; color?: string }>;
}

export const ScreenStatusBar: React.FC<ScreenStatusBarProps> = ({ 
  navigationType, 
  customMessage,
  contentWidth,
  items 
}) => {
  const { contentWidth: defaultContentWidth } = useScreenDimensions();
  const statusConfig = getStatusBarConfig(navigationType, customMessage);

  return (
    <Section spacing={DESIGN_TOKENS.spacing.statusBar} align="center">
      <StatusBar
        center={items ? undefined : statusConfig.center}
        variant={statusConfig.variant}
        width={contentWidth || defaultContentWidth}
        items={items}
      />
    </Section>
  );
};

// Version Display Component
interface VersionDisplayProps {
  version: string;
}

export const VersionDisplay: React.FC<VersionDisplayProps> = ({ version }) => {
  const { theme } = useScreenDimensions();

  return (
    <Section spacing={DESIGN_TOKENS.spacing.version} align="center">
      <Box width="100%" alignItems="center" justifyContent="center">
        <Text color={DESIGN_TOKENS.typography.version.color(theme)}>
          Version {version}
        </Text>
      </Box>
    </Section>
  );
};

// Unified Screen Wrapper
interface UnifiedScreenProps {
  config: ScreenLayoutConfig;
  children?: React.ReactNode;
  
  // Optional components
  logoLines?: string[];
  heroText?: string | string[];
  features?: string[];
  version?: string;
  statusItems?: Array<{ key: string; value: string; color?: string }>;
  customStatusMessage?: string;
}

export const UnifiedScreen: React.FC<UnifiedScreenProps> = ({
  config,
  children,
  logoLines,
  heroText,
  features,
  version,
  statusItems,
  customStatusMessage
}) => {
  const { cardWidth, contentWidth } = useScreenDimensions();

  return (
    <Container centered={config.centered} fullHeight={config.fullHeight}>
      <Card
        title={config.title}
        subtitle={config.subtitle}
        icon={config.icon}
        width={cardWidth}
        variant={config.variant}
        align={config.align}
      >
        {/* Logo Section */}
        {config.hasLogo && logoLines && (
          <Logo lines={logoLines} contentWidth={contentWidth} />
        )}

        {/* Hero Section */}
        {config.hasHero && heroText && (
          <HeroText text={heroText} contentWidth={contentWidth} />
        )}

        {/* Features Section */}
        {config.hasFeatures && features && (
          <FeatureHighlights features={features} contentWidth={contentWidth} />
        )}

        {/* Custom Content */}
        {children}

        {/* Status Bar */}
        {config.hasStatusBar && (
          <ScreenStatusBar
            navigationType={config.navigationType}
            customMessage={customStatusMessage || config.customStatusMessage}
            contentWidth={contentWidth}
            items={statusItems}
          />
        )}

        {/* Version Display */}
        {config.hasVersion && version && (
          <VersionDisplay version={version} />
        )}
      </Card>
    </Container>
  );
};