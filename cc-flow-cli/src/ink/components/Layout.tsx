import React from 'react';
import { Box, Text, Spacer } from 'ink';
import { useTheme } from '../themes/theme.js';

interface ContainerProps {
  children: React.ReactNode;
  padding?: boolean;
}

export const Container: React.FC<ContainerProps> = ({ children, padding = true }) => {
  const theme = useTheme();
  
  return (
    <Box 
      flexDirection="column" 
      alignItems="center" 
      justifyContent="center"
      width="100%"
      height="100%"
      padding={padding ? theme.layout.padding : 0}
    >
      {children}
    </Box>
  );
};

interface CardProps {
  children: React.ReactNode;
  title?: string;
  width?: number | string;
  padding?: number;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  title, 
  width, 
  padding 
}) => {
  const theme = useTheme();
  
  return (
    <Box
      borderStyle={theme.layout.borderStyle}
      borderColor={theme.colors.border}
      padding={padding ?? theme.layout.padding}
      flexDirection="column"
      alignItems="center"
      alignSelf="flex-start"
      justifyContent="center"
      width={width ?? `${Math.min(theme.layout.maxWidth, 80)}%`}
    >
      {title && (
        <>
          <Text color={theme.colors.primary} bold>{title}</Text>
          <Box marginY={1}>
            <Text color={theme.colors.border}>{'─'.repeat(32)}</Text>
          </Box>
        </>
      )}
      {children}
    </Box>
  );
};

interface SectionProps {
  children: React.ReactNode;
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const Section: React.FC<SectionProps> = ({ children, spacing = 'md' }) => {
  const theme = useTheme();
  
  return (
    <Box marginY={theme.spacing[spacing]}>
      {children}
    </Box>
  );
};

interface FlexProps {
  children: React.ReactNode;
  direction?: 'row' | 'column';
  align?: 'flex-start' | 'center' | 'flex-end';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between';
  gap?: number;
}

export const Flex: React.FC<FlexProps> = ({ 
  children, 
  direction = 'row', 
  align = 'flex-start', 
  justify = 'flex-start',
  gap = 0
}) => {
  return (
    <Box 
      flexDirection={direction}
      alignItems={align}
      justifyContent={justify}
      gap={gap}
    >
      {children}
    </Box>
  );
};

interface HeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, icon = '🎯' }) => {
  const theme = useTheme();
  
  return (
    <Section spacing="sm">
      <Flex direction="column" align="center">
        <Text color={theme.colors.primary} bold>
          {icon} {title}
        </Text>
        {subtitle && (
          <Text color={theme.colors.muted} italic>
            {subtitle}
          </Text>
        )}
      </Flex>
    </Section>
  );
};

interface LoadingProps {
  text: string;
  type?: 'dots' | 'line' | 'pipe' | 'simpleDots';
}

export const Loading: React.FC<LoadingProps> = ({ text, type = 'dots' }) => {
  const theme = useTheme();
  
  return (
    <Section>
      <Flex align="center" gap={1}>
        <Text color={theme.colors.info}>{text}</Text>
        <Spacer />
        {/* Note: Spinner would be imported and used here */}
        <Text color={theme.colors.primary}>⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏</Text>
      </Flex>
    </Section>
  );
};