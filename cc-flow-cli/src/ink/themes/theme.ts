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
    text: string;
    border: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  layout: {
    maxWidth: number;
    padding: number;
    borderStyle: 'single' | 'double' | 'round' | 'bold';
  };
  responsive: {
    isCompact: boolean;
    terminalWidth: number;
    terminalHeight: number;
  };
}

export const createTheme = (terminalInfo: { width: number; height: number }): Theme => ({
  colors: {
    primary: 'cyan',
    secondary: 'blue',
    success: 'green',
    warning: 'yellow',
    error: 'red',
    info: 'blue',
    muted: 'gray',
    text: 'white',
    border: 'cyan',
  },
  spacing: {
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 5,
  },
  layout: {
    maxWidth: Math.min(100, terminalInfo.width - 8),
    padding: 1,
    borderStyle: 'round',
  },
  responsive: {
    isCompact: terminalInfo.height < 20 || terminalInfo.width < 70,
    terminalWidth: terminalInfo.width,
    terminalHeight: terminalInfo.height,
  },
});

export const useTheme = (): Theme => {
  const { stdout } = useStdout();
  
  return useMemo(() => {
    const terminalWidth = stdout?.columns || 80;
    const terminalHeight = stdout?.rows || 24;
    
    return createTheme({ width: terminalWidth, height: terminalHeight });
  }, [stdout?.columns, stdout?.rows]);
};