/**
 * CC-Flow TUI Design System - Reusable Screen Components
 *
 * Pre-built components implementing the unified design patterns
 * for consistent screen layouts across the application.
 */

import React from "react";
import { Box, Text } from "ink";
import { Container, Card, Section } from "../components/Layout.js";
import {
  StatusBar,
  FocusableMenu,
  MenuItem,
} from "../components/Interactive.js";
import { renderLines } from "../utils/text.js";
import {
  DESIGN_TOKENS,
  useScreenDimensions,
  getStatusBarConfig,
  getScreenColors,
  type ScreenLayoutConfig,
} from "./ScreenPatterns.js";
import { Spacing } from "../types/common.js";

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
          const [centeredLine] = renderLines(line, contentWidth, "center");
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
  const heroLines =
    typeof text === "string" ? renderLines(text, contentWidth, "center") : text;

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

export const FeatureHighlights: React.FC<FeatureHighlightsProps> = ({
  features,
  contentWidth,
}) => {
  const { theme } = useScreenDimensions();

  return (
    <Section spacing={DESIGN_TOKENS.spacing.features} align="center">
      <Box flexDirection="column" width="100%" alignItems="center">
        {features.map((feature, index) => {
          const [centeredLine] = renderLines(feature, contentWidth, "center");
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
  align?: "left" | "center" | "right";
}

export const ScreenDescription: React.FC<ScreenDescriptionProps> = ({
  heading,
  subheading,
  description,
  align = "center",
}) => {
  const { theme } = useScreenDimensions();
  const colors = getScreenColors(theme);

  return (
    <Section spacing={DESIGN_TOKENS.spacing.content} align={align}>
      <Box
        flexDirection="column"
        width="100%"
        alignItems={align === "center" ? "center" : "flex-start"}
      >
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
            color={theme.colors.hex.tealBlue}
            italic={DESIGN_TOKENS.typography.subheading.italic}
          >
            {subheading}
          </Text>
        )}
        {description && (
          <Text color={colors.text.secondary}>{description}</Text>
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
  descriptionPlaceholder?: string;
  spacing?: Spacing;
  bordered?: boolean;
}

export const MenuSection: React.FC<MenuSectionProps> = ({
  items,
  onSelect,
  showDescription = false,
  contentWidth,
  descriptionPlaceholder,
  spacing = "md",
  bordered = true,
}) => {
  const { contentWidth: defaultContentWidth, theme } = useScreenDimensions();
  const colors = getScreenColors(theme);
  const [selectedItem, setSelectedItem] = React.useState<MenuItem | null>(
    items[0] || null
  );

  const handleSelectionChange = (item: MenuItem) => {
    setSelectedItem(item);
  };

  const menuContent = (
    <>
      <FocusableMenu
        items={items}
        onSelect={onSelect}
        onSelectionChange={handleSelectionChange}
        width={(contentWidth || defaultContentWidth) - (bordered ? 4 : 0)} // Account for border and padding only if bordered
        align="left"
      />

      {showDescription && (
        <Box
          marginTop={1}
          paddingTop={1}
          borderTop
          borderColor={colors.text.muted}
          width="100%"
          minHeight={3}
          justifyContent="flex-start"
          alignItems="flex-start"
          paddingLeft={1}
        >
          <Text
            color={
              selectedItem?.description
                ? theme.colors.hex.tealBlue
                : colors.text.muted
            }
          >
            {selectedItem?.description ||
              descriptionPlaceholder ||
              "項目を選択すると説明が表示されます"}
          </Text>
        </Box>
      )}
    </>
  );

  if (bordered) {
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
          {menuContent}
        </Box>
      </Section>
    );
  }

  return (
    <Section spacing={DESIGN_TOKENS.spacing.menu} align="center">
      <Box
        width="100%"
        alignItems="center"
        flexDirection="column"
      >
        {menuContent}
      </Box>
    </Section>
  );
};

// Selection Description Area Component
interface SelectionDescriptionAreaProps {
  selectedItem?: MenuItem | null;
  placeholder?: string;
}

export const SelectionDescriptionArea: React.FC<
  SelectionDescriptionAreaProps
> = ({ selectedItem, placeholder = "項目を選択すると説明が表示されます" }) => {
  const { theme } = useScreenDimensions();
  const colors = getScreenColors(theme);

  const displayText = selectedItem?.description || placeholder;
  const textColor = selectedItem?.description
    ? colors.text.secondary
    : colors.text.muted;

  return (
    <Section spacing={DESIGN_TOKENS.spacing.hint}>
      <Box
        borderStyle="single"
        borderColor={colors.text.muted}
        padding={1}
        width="100%"
        minHeight={3}
        flexDirection="column"
        justifyContent="center"
      >
        <Text color={textColor}>{displayText}</Text>
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
            <Text key={`hint-${index}`} color={theme.colors.hex.tealBlue}>
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
  navigationType: ScreenLayoutConfig["navigationType"];
  customMessage?: string;
  contentWidth?: number;
  items?: Array<{ key: string; value: string; color?: string }>;
}

export const ScreenStatusBar: React.FC<ScreenStatusBarProps> = ({
  navigationType,
  customMessage,
  contentWidth,
  items,
}) => {
  const { contentWidth: defaultContentWidth } = useScreenDimensions();
  const statusConfig = getStatusBarConfig(navigationType, customMessage);

  return (
    <Section spacing={DESIGN_TOKENS.spacing.statusBar} align="center">
      <StatusBar
        {...(!items && statusConfig.center && { center: statusConfig.center })}
        variant={statusConfig.variant}
        width={contentWidth || defaultContentWidth}
        {...(items && { items })}
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
  customStatusMessage,
}) => {
  const { cardWidth, contentWidth } = useScreenDimensions();

  return (
    <Container centered={config.centered} fullHeight={config.fullHeight}>
      <Card
        {...(config.title && { title: config.title })}
        {...(config.subtitle && { subtitle: config.subtitle })}
        {...(config.icon && { icon: config.icon })}
        width={cardWidth}
        {...(config.variant && { variant: config.variant })}
        {...(config.align && { align: config.align })}
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
            {...((customStatusMessage || config.customStatusMessage) && {
              customMessage: customStatusMessage || config.customStatusMessage,
            })}
            contentWidth={contentWidth}
            {...(statusItems && { items: statusItems })}
          />
        )}

        {/* Version Display */}
        {config.hasVersion && version && <VersionDisplay version={version} />}
      </Card>
    </Container>
  );
};
