import React, { useMemo } from 'react';
import { Box, Text, useStdout } from 'ink';
import stringWidth from 'string-width';

interface FrameProps {
  title: string;
  icon?: string;
  width?: number;
  children: React.ReactNode;
  showFooter?: boolean;
  minWidth?: number;
  maxWidth?: number;
}

interface ContentLineProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

// ContentLine component for proper text alignment within Frame
export const ContentLine: React.FC<ContentLineProps> = ({ 
  children, 
  align = 'left'
}) => {
  // Extract text content from children for width calculation
  const getTextContent = (node: React.ReactNode): string => {
    if (typeof node === 'string') return node;
    if (typeof node === 'number') return String(node);
    if (React.isValidElement(node)) {
      const props = node.props as any;
      if (props && typeof props === 'object' && 'children' in props) {
        return getTextContent(props.children);
      }
    }
    if (Array.isArray(node)) {
      return node.map(getTextContent).join('');
    }
    return '';
  };

  const content = getTextContent(children);
  const contentWidth = stringWidth(content);

  // Return a Box that will be properly sized by the parent Frame
  return (
    <Box width="100%" justifyContent={align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start'}>
      <Box paddingLeft={align === 'left' ? 1 : 0} paddingRight={align === 'right' ? 1 : 0}>
        {children}
      </Box>
    </Box>
  );
};

export const Frame: React.FC<FrameProps> = ({ 
  title, 
  icon = '🎯', 
  width,
  children,
  showFooter = true,
  minWidth = 60,
  maxWidth = 100
}) => {
  const { stdout } = useStdout();
  
  // Calculate responsive width with proper terminal adaptation
  const frameWidth = useMemo(() => {
    if (width) return width;
    
    const terminalWidth = stdout?.columns || 80;
    
    // Ensure minimum margins and responsive behavior
    const safeAvailable = Math.max(minWidth, Math.min(terminalWidth - 8, maxWidth));
    const calculatedWidth = safeAvailable;
    
    return calculatedWidth;
  }, [width, stdout?.columns, minWidth, maxWidth]);
  
  // Border characters for clean frame rendering
  const borderChar = '━';
  const cornerTopLeft = '┏';
  const cornerTopRight = '┓';
  const cornerBottomLeft = '┗';
  const cornerBottomRight = '┛';
  const vertical = '┃';
  
  const innerWidth = frameWidth - 2; // Account for left and right borders
  const borderLine = borderChar.repeat(innerWidth);

  // Title with icon - accurate Unicode width calculation
  const titleWithIcon = `${icon} ${title}`;
  const titleWidth = stringWidth(titleWithIcon);
  const titlePadding = Math.max(0, innerWidth - titleWidth);
  const titlePaddingLeft = Math.floor(titlePadding / 2);
  const titlePaddingRight = titlePadding - titlePaddingLeft;
  
  const centeredTitle = ' '.repeat(titlePaddingLeft) + titleWithIcon + ' '.repeat(titlePaddingRight);

  return (
    <Box flexDirection="column" width={frameWidth} alignSelf="center">
      {/* Header with precise width control */}
      <Box width={frameWidth}>
        <Text>{cornerTopLeft}{borderLine}{cornerTopRight}</Text>
      </Box>
      
      {/* Title row with perfect centering */}
      <Box width={frameWidth}>
        <Text>{vertical}</Text>
        <Box width={innerWidth}>
          <Text>{centeredTitle}</Text>
        </Box>
        <Text>{vertical}</Text>
      </Box>
      
      {/* Separator row */}
      <Box width={frameWidth}>
        <Text>{vertical}</Text>
        <Box width={innerWidth}>
          <Text>{borderChar.repeat(innerWidth)}</Text>
        </Box>
        <Text>{vertical}</Text>
      </Box>
      
      {/* Content area with consistent inner width */}
      <Box flexDirection="column" width={frameWidth}>
        {React.Children.map(children, (child, index) => (
          <Box key={index} width={frameWidth}>
            <Text>{vertical}</Text>
            <Box width={innerWidth}>
              {child}
            </Box>
            <Text>{vertical}</Text>
          </Box>
        ))}
      </Box>
      
      {/* Footer */}
      {showFooter && (
        <Box width={frameWidth}>
          <Text>{cornerBottomLeft}{borderLine}{cornerBottomRight}</Text>
        </Box>
      )}
    </Box>
  );
};