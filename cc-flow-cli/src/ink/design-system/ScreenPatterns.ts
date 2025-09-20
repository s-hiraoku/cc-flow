/**
 * CC-Flow TUI Design System - Screen Patterns
 *
 * Unified design patterns based on WelcomeScreen layout for consistent
 * visual hierarchy and user experience across all screens.
 */

import { useTheme } from "../themes/theme.js";
import type { Theme } from "../themes/theme.js";

// Design System Constants
export const DESIGN_TOKENS = {
  // Layout consistency from WelcomeScreen
  cardWidthCalculation: (theme: Theme) => {
    const maxCardWidth = Math.min(
      theme.layout.maxWidth,
      Math.floor(theme.responsive.terminalWidth * 0.9)
    );
    return Math.max(theme.layout.minWidth, maxCardWidth);
  },

  contentWidthCalculation: (cardWidth: number, theme: Theme) => {
    return Math.max(20, cardWidth - theme.layout.paddingX * 2 - 2); // borders
  },

  // Typography hierarchy
  typography: {
    logo: {
      colors: (theme: Theme) => [
        theme.colors.hex.darkBlue,
        theme.colors.hex.darkBlue,
        theme.colors.hex.blue,
        theme.colors.hex.blue,
        theme.colors.hex.lightBlue,
        theme.colors.hex.lightBlue,
      ],
    },
    hero: {
      color: (theme: Theme) => theme.colors.hex.lightBlue,
      bold: true,
    },
    feature: {
      color: (theme: Theme) => theme.colors.hex.green,
    },
    heading: {
      color: (theme: Theme) => theme.colors.hex.lightBlue,
      bold: true,
    },
    subheading: {
      color: (theme: Theme) => theme.colors.gray,
      italic: true,
    },
    description: {
      color: (theme: Theme) => theme.colors.cyan,
    },
    version: {
      color: (theme: Theme) => theme.colors.gray,
    },
    statusText: {
      color: (theme: Theme) => theme.colors.hex.blue,
    },
  },

  // Section spacing patterns from WelcomeScreen
  spacing: {
    logo: "sm" as const,
    hero: "sm" as const,
    features: "sm" as const,
    menu: "sm" as const,
    statusBar: "sm" as const,
    version: "xs" as const,
    content: "sm" as const,
    hint: "xs" as const,
  },

  // Status bar variants
  statusBar: {
    navigation: {
      center: "↑↓: 選択 | Enter: 実行 | Q: 終了",
      variant: "info" as const,
    },
    backNavigation: {
      center: "↑↓: ナビゲート | Enter: 選択 | Esc: 戻る",
      variant: "default" as const,
    },
    confirmation: {
      center: "Enter: 確認 | Esc: キャンセル",
      variant: "info" as const,
    },
    processing: {
      center: "処理中...",
      variant: "warning" as const,
    },
  },
} as const;

// Screen Layout Patterns
export interface ScreenLayoutConfig {
  // Container settings
  centered: boolean;
  fullHeight: boolean;

  // Card settings
  title?: string;
  subtitle?: string;
  icon?: string;
  variant?: "default" | "primary" | "success" | "warning" | "info" | "danger";
  align?: "left" | "center" | "right";

  // Content structure
  hasLogo?: boolean;
  hasHero?: boolean;
  hasFeatures?: boolean;
  hasDescription?: boolean;
  hasStatusBar?: boolean;
  hasVersion?: boolean;

  // Navigation type
  navigationType: "menu" | "back" | "confirmation" | "processing" | "custom";
  customStatusMessage?: string;
}

// Predefined screen patterns
export const SCREEN_PATTERNS = {
  // Welcome/Landing pattern
  welcome: {
    centered: false,
    fullHeight: true,
    variant: "default",
    align: "center",
    hasLogo: true,
    hasHero: true,
    hasFeatures: true,
    hasStatusBar: true,
    hasVersion: true,
    navigationType: "menu",
  } as ScreenLayoutConfig,

  // Main menu pattern
  menu: {
    centered: false,
    fullHeight: true,
    variant: "default",
    align: "center",
    title: "🌊 CC-Flow メインメニュー",
    subtitle: "エージェント連携ワークフロー作成ツール",
    hasDescription: true,
    hasStatusBar: true,
    navigationType: "menu",
  } as ScreenLayoutConfig,

  // Selection pattern (directory, agent selection)
  selection: {
    centered: false,
    fullHeight: true,
    variant: "primary",
    align: "center",
    hasDescription: true,
    hasStatusBar: true,
    navigationType: "back",
  } as ScreenLayoutConfig,

  // Configuration pattern (order, workflow name)
  configuration: {
    centered: false,
    fullHeight: true,
    variant: "info",
    align: "center",
    hasDescription: true,
    hasStatusBar: true,
    navigationType: "confirmation",
  } as ScreenLayoutConfig,

  // Preview/review pattern
  preview: {
    centered: false,
    fullHeight: true,
    variant: "warning",
    align: "left",
    hasStatusBar: true,
    navigationType: "confirmation",
  } as ScreenLayoutConfig,

  // Completion pattern
  complete: {
    centered: false,
    fullHeight: true,
    variant: "success",
    align: "center",
    hasFeatures: true,
    hasStatusBar: true,
    hasVersion: true,
    navigationType: "menu",
  } as ScreenLayoutConfig,

  // Processing pattern
  processing: {
    centered: false,
    fullHeight: true,
    variant: "info",
    align: "center",
    hasStatusBar: true,
    navigationType: "processing",
  } as ScreenLayoutConfig,
} as const;

// Utility functions for consistent styling
export const createScreenLayout = (
  pattern: keyof typeof SCREEN_PATTERNS,
  overrides?: Partial<ScreenLayoutConfig>
) => {
  return { ...SCREEN_PATTERNS[pattern], ...overrides };
};

export const useScreenDimensions = () => {
  const theme = useTheme();
  const cardWidth = DESIGN_TOKENS.cardWidthCalculation(theme);
  const contentWidth = DESIGN_TOKENS.contentWidthCalculation(cardWidth, theme);

  return {
    theme,
    cardWidth,
    contentWidth,
  };
};

// Status bar message generator
export const getStatusBarConfig = (
  navigationType: ScreenLayoutConfig["navigationType"],
  customMessage?: string
) => {
  switch (navigationType) {
    case "menu":
      return DESIGN_TOKENS.statusBar.navigation;
    case "back":
      return DESIGN_TOKENS.statusBar.backNavigation;
    case "confirmation":
      return DESIGN_TOKENS.statusBar.confirmation;
    case "processing":
      return DESIGN_TOKENS.statusBar.processing;
    case "custom":
      return {
        center: customMessage || "カスタムメッセージ",
        variant: "default" as const,
      };
    default:
      return DESIGN_TOKENS.statusBar.navigation;
  }
};

// Color scheme utilities
export const getScreenColors = (theme: Theme) => ({
  // Primary brand colors (from WelcomeScreen)
  brand: {
    primary: theme.colors.hex.blue,
    secondary: theme.colors.hex.lightBlue,
    accent: theme.colors.hex.darkBlue,
  },

  // Text hierarchy
  text: {
    primary: theme.colors.text.primary,
    secondary: theme.colors.text.secondary,
    muted: theme.colors.gray,
    emphasis: theme.colors.hex.lightBlue,
    feature: theme.colors.hex.green,
    status: theme.colors.hex.blue,
  },

  // Interactive elements
  interactive: {
    selected: theme.colors.primary,
    hover: theme.colors.hex.lightBlue,
    disabled: theme.colors.text.muted,
  },

  // Status indicators
  status: {
    success: theme.colors.success,
    warning: theme.colors.warning,
    error: theme.colors.error,
    info: theme.colors.info,
  },
});
