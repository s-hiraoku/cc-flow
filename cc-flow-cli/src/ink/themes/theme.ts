import { useStdout } from 'ink';
import { useMemo } from 'react';

export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    muted: string;
    border: string;
    background: string;
    text: {
      primary: string;
      secondary: string;
      muted: string;
      inverse: string;
    };
    // Additional standard colors
    white: string;
    black: string;
    red: string;
    green: string;
    yellow: string;
    blue: string;
    magenta: string;
    cyan: string;
    gray: string;
    // Hex colors for advanced styling
    hex: {
      blue: string;
      darkBlue: string;
      lightBlue: string;
      green: string;
      orange: string;
      purple: string;
      pink: string;
    };
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  layout: {
    minWidth: number;
    maxWidth: number;
    paddingX: number;
    paddingY: number;
    borderStyle: 'single' | 'double' | 'round' | 'bold';
  };
  responsive: {
    isCompact: boolean;
    terminalWidth: number;
    terminalHeight: number;
  };
}

export const createTheme = (terminalInfo: { width: number; height: number }): Theme => {
  // Ensure minimum viable terminal dimensions
  const safeWidth = Math.max(40, terminalInfo.width);
  const safeHeight = Math.max(10, terminalInfo.height);
  
  const horizontalMargin = 6;
  const maxWidth = Math.max(40, Math.min(safeWidth - horizontalMargin, 120));
  const minWidth = Math.min(40, maxWidth);

  return {
    colors: {
      primary: 'cyan',
      secondary: 'blue',
      success: 'green',
      warning: 'yellow',
      error: 'red',
      info: 'blue',
      muted: 'gray',
      border: 'cyan',
      background: 'black',
      text: {
        primary: 'white',
        secondary: 'cyan',
        muted: 'gray',
        inverse: 'black'
      },
      // Additional standard colors
      white: 'white',
      black: 'black',
      red: 'red',
      green: 'green',
      yellow: 'yellow',
      blue: 'blue',
      magenta: 'magenta',
      cyan: 'cyan',
      gray: 'gray',
      // Hex colors for advanced styling
      hex: {
        blue: '#3B82F6',
        darkBlue: '#1E40AF',
        lightBlue: '#60A5FA',
        green: '#10B981',
        orange: '#F97316',
        purple: '#A855F7',
        pink: '#EC4899'
      }
    },
    spacing: {
      xs: 1,
      sm: 2,
      md: 3,
      lg: 4,
      xl: 5,
    },
    layout: {
      minWidth,
      maxWidth,
      paddingX: 2,
      paddingY: 1,
      borderStyle: 'round',
    },
    responsive: {
      isCompact: safeHeight < 20 || safeWidth < 70,
      terminalWidth: safeWidth,
      terminalHeight: safeHeight,
    },
  };
};

export const useTheme = (): Theme => {
  const { stdout } = useStdout();
  
  return useMemo(() => {
    // Get terminal dimensions with fallbacks
    const terminalWidth = stdout?.columns || process.stdout?.columns || 80;
    const terminalHeight = stdout?.rows || process.stdout?.rows || 24;
    
    return createTheme({ width: terminalWidth, height: terminalHeight });
  }, [stdout?.columns, stdout?.rows]);
};
