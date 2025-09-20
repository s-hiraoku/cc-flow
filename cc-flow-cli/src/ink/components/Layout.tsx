import React, { Fragment } from "react";
import { Box, Text, Spacer } from "ink";
import { useTheme } from "../themes/theme.js";
import type { Theme } from "../themes/theme.js";
import { renderLines } from "../utils/text.js";

type Variant =
  | "default"
  | "primary"
  | "success"
  | "warning"
  | "info"
  | "danger";

type Align = "left" | "center" | "right";

type Spacing = "xs" | "sm" | "md" | "lg" | "xl";

const clampWidth = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

const resolveWidth = (
  width: number | string | undefined,
  terminalWidth: number,
  minWidth: number,
  maxWidth: number
): number => {
  // Ensure terminal width is valid
  const safeTerminalWidth = Math.max(20, terminalWidth);

  if (typeof width === "number") {
    return clampWidth(
      width,
      minWidth,
      Math.min(maxWidth, safeTerminalWidth - 2)
    );
  }

  if (typeof width === "string" && width.endsWith("%")) {
    const percent = Number(width.slice(0, -1));
    if (!Number.isNaN(percent) && percent > 0 && percent <= 100) {
      const candidate = Math.round((safeTerminalWidth * percent) / 100);
      return clampWidth(
        candidate,
        minWidth,
        Math.min(maxWidth, safeTerminalWidth - 2)
      );
    }
  }

  // Default: sensible width relative to terminal, leaving margin for borders
  const reservedSpace = 4; // Account for borders and minimal margin
  const candidate = Math.min(maxWidth, safeTerminalWidth - reservedSpace);
  return clampWidth(candidate, minWidth, candidate);
};

const variantColor = (variant: Variant, colors: Theme["colors"]) => {
  switch (variant) {
    case "primary":
      return colors.primary;
    case "success":
      return colors.success;
    case "warning":
      return colors.warning;
    case "info":
      return colors.info;
    case "danger":
      return colors.error;
    default:
      return colors.border;
  }
};

const TextBlock = ({
  value,
  width,
  align = "left",
  color,
  bold,
  italic,
}: {
  value: string | string[];
  width: number;
  align?: Align;
  color?: string;
  bold?: boolean;
  italic?: boolean;
}) => (
  <Box flexDirection="column" width="100%">
    {renderLines(value, width, align).map((line, index) => {
      const textProps: { color?: string; bold?: boolean; italic?: boolean } =
        {};
      if (color) {
        textProps.color = color;
      }
      if (bold) {
        textProps.bold = true;
      }
      if (italic) {
        textProps.italic = true;
      }
      return (
        <Text key={`line-${index}`} {...textProps}>
          {line}
        </Text>
      );
    })}
  </Box>
);

interface ContainerProps {
  children: React.ReactNode;
  centered?: boolean;
  fullHeight?: boolean;
  padding?: boolean;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  centered = true,
  fullHeight = false,
  padding = false,
}) => {
  const theme = useTheme();

  // Calculate safe minimum height for full height mode
  const safeMinHeight = fullHeight
    ? Math.max(
        10,
        theme.responsive.terminalHeight -
          (padding ? theme.layout.paddingY * 2 : 0)
      )
    : undefined;

  return (
    <Box
      width="100%"
      flexDirection="column"
      alignItems="center"
      justifyContent={centered ? "center" : "flex-start"}
      minHeight={safeMinHeight}
      paddingY={padding ? theme.layout.paddingY : 0}
    >
      {children}
    </Box>
  );
};

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  description?: string;
  icon?: string;
  width?: number | string;
  minWidth?: number;
  maxWidth?: number;
  variant?: Variant;
  align?: Align;
  paddingX?: number;
  paddingY?: number;
  fullHeight?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  description,
  icon,
  width,
  minWidth,
  maxWidth,
  variant = "default",
  align = "center",
  paddingX,
  paddingY,
  fullHeight = false,
}) => {
  const theme = useTheme();

  const resolvedPaddingX = paddingX ?? theme.layout.paddingX;
  const resolvedPaddingY = paddingY ?? theme.layout.paddingY;

  const resolvedWidth = resolveWidth(
    width,
    theme.responsive.terminalWidth,
    minWidth ?? theme.layout.minWidth,
    maxWidth ?? theme.layout.maxWidth
  );

  // Ensure content width accounts for borders and padding
  const borderWidth = 2; // Left and right borders
  const totalPaddingX = resolvedPaddingX * 2;
  const contentWidth = Math.max(1, resolvedWidth - borderWidth - totalPaddingX);

  const borderColor = variantColor(variant, theme.colors);

  return (
    <Box
      width={resolvedWidth}
      flexDirection="column"
      borderStyle={theme.layout.borderStyle}
      borderColor={borderColor}
      paddingX={resolvedPaddingX}
      paddingY={resolvedPaddingY}
      flexShrink={0}
      minHeight={
        fullHeight
          ? Math.max(theme.responsive.terminalHeight - resolvedPaddingY * 2, 0)
          : undefined
      }
    >
      {(title || subtitle) && (
        <Box flexDirection="column" width="100%" marginBottom={1}>
          {title && (
            <TextBlock
              value={icon ? `${icon} ${title}` : title}
              width={contentWidth}
              align={align}
              color={theme.colors.text.primary}
              bold
            />
          )}
          {subtitle && (
            <TextBlock
              value={subtitle}
              width={contentWidth}
              align={align}
              color={theme.colors.text.secondary}
              italic
            />
          )}
        </Box>
      )}

      {description && (
        <Box flexDirection="column" width="100%" marginBottom={1}>
          <TextBlock
            value={description}
            width={contentWidth}
            align="left"
            color={theme.colors.text.muted}
          />
        </Box>
      )}

      <Box width="100%" flexDirection="column">
        {React.Children.map(children, (child, index) => (
          <Fragment key={index}>{child}</Fragment>
        ))}
      </Box>
    </Box>
  );
};

interface SectionProps {
  children: React.ReactNode;
  spacing?: Spacing;
  title?: string;
  icon?: string;
  align?: Align;
  width?: number;
}

export const Section: React.FC<SectionProps> = ({
  children,
  spacing = "md",
  title,
  icon,
  align = "left",
  width,
}) => {
  const theme = useTheme();
  const margin = theme.spacing[spacing];
  const contentWidth = Math.max(
    1,
    (width ??
      resolveWidth(
        undefined,
        theme.responsive.terminalWidth,
        theme.layout.minWidth,
        theme.layout.maxWidth
      )) -
      theme.layout.paddingX * 2
  );

  return (
    <Box width="100%" flexDirection="column" marginTop={margin}>
      {title && (
        <Box>
          <TextBlock
            value={icon ? `${icon} ${title}` : title}
            width={contentWidth}
            align={align}
            color={theme.colors.primary}
            bold
          />
        </Box>
      )}
      {children}
    </Box>
  );
};

interface FlexProps {
  children: React.ReactNode;
  direction?: "row" | "column";
  align?: "flex-start" | "center" | "flex-end";
  justify?: "flex-start" | "center" | "flex-end" | "space-between";
  gap?: number;
  wrap?: boolean;
}

export const Flex: React.FC<FlexProps> = ({
  children,
  direction = "row",
  align = "flex-start",
  justify = "flex-start",
  gap = 0,
  wrap = false,
}) => (
  <Box
    flexDirection={direction}
    alignItems={align}
    justifyContent={justify}
    gap={gap}
    flexWrap={wrap ? "wrap" : "nowrap"}
  >
    {children}
  </Box>
);

interface HeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, icon }) => {
  const theme = useTheme();
  const width = Math.max(
    1,
    resolveWidth(
      undefined,
      theme.responsive.terminalWidth,
      theme.layout.minWidth,
      theme.layout.maxWidth
    ) -
      theme.layout.paddingX * 2
  );

  return (
    <Section spacing="sm">
      <TextBlock
        value={icon ? `${icon} ${title}` : title}
        width={width}
        align="center"
        color={theme.colors.text.primary}
        bold
      />
      {subtitle && (
        <TextBlock
          value={subtitle}
          width={width}
          align="center"
          color={theme.colors.text.secondary}
          italic
        />
      )}
    </Section>
  );
};

interface LoadingProps {
  text: string;
  hint?: string;
}

export const Loading: React.FC<LoadingProps> = ({ text, hint }) => {
  const theme = useTheme();

  return (
    <Section spacing="md">
      <Flex align="center" gap={1}>
        <Text color={theme.colors.info}>⠋</Text>
        <Text color={theme.colors.info}>{text}</Text>
        <Spacer />
        {hint && <Text color={theme.colors.text.muted}>{hint}</Text>}
      </Flex>
    </Section>
  );
};
