import { useStdout } from "ink";
import { useMemo } from "react";

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
      tealBlue: string;
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
    borderStyle: "single" | "double" | "round" | "bold";
  };
  responsive: {
    isCompact: boolean;
    terminalWidth: number;
    terminalHeight: number;
  };
}

export const createTheme = (terminalInfo: {
  width: number;
  height: number;
}): Theme => {
  // Ensure minimum viable terminal dimensions
  const safeWidth = Math.max(40, terminalInfo.width);
  const safeHeight = Math.max(10, terminalInfo.height);

  const horizontalMargin = 6;
  const maxWidth = Math.max(40, Math.min(safeWidth - horizontalMargin, 120));
  const minWidth = Math.min(40, maxWidth);

  return {
    colors: {
      primary: "#60A5FA",      // Bright Blue - より明るく目立つ
      secondary: "#818CF8",    // Indigo - 落ち着いた紫
      success: "#34D399",      // Emerald - 明るいグリーン
      warning: "#FBBF24",      // Amber - 見やすい黄色
      error: "#F87171",        // Red - ソフトな赤
      info: "#38BDF8",         // Sky Blue - 情報用の青
      muted: "#9CA3AF",        // Gray 400 - 読みやすいグレー
      border: "#60A5FA",       // Bright Blue - プライマリと同じ
      background: "black",
      text: {
        primary: "#F3F4F6",    // Gray 100 - 真っ白より目に優しい
        secondary: "#A5B4FC",  // Indigo 300 - セカンダリテキスト
        muted: "#9CA3AF",      // Gray 400 - 控えめなテキスト
        inverse: "black",
      },
      // Additional standard colors
      white: "white",
      black: "black",
      red: "#F87171",
      green: "#34D399",
      yellow: "#FBBF24",
      blue: "#60A5FA",
      magenta: "#E879F9",
      cyan: "#22D3EE",
      gray: "#9CA3AF",
      // Hex colors for advanced styling
      hex: {
        blue: "#60A5FA",       // Blue 400
        darkBlue: "#2563EB",   // Blue 600
        lightBlue: "#93C5FD",  // Blue 300
        tealBlue: "#06B6D4",   // Cyan 500
        green: "#34D399",      // Emerald 400
        orange: "#FB923C",     // Orange 400
        purple: "#C084FC",     // Purple 400
        pink: "#F472B6",       // Pink 400
      },
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
      borderStyle: "round",
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
