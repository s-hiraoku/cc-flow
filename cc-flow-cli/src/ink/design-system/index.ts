/**
 * CC-Flow TUI Design System - Main Export File
 * 
 * Centralized exports for the unified design system components and utilities.
 */

// Core Design System
export {
  DESIGN_TOKENS,
  SCREEN_PATTERNS,
  createScreenLayout,
  useScreenDimensions,
  getStatusBarConfig,
  getScreenColors,
  type ScreenLayoutConfig
} from './ScreenPatterns.js';

// Reusable Components
export {
  Logo,
  HeroText,
  FeatureHighlights,
  ScreenDescription,
  MenuSection,
  HintBox,
  ScreenStatusBar,
  VersionDisplay,
  UnifiedScreen
} from './ScreenComponents.js';

// Icons
export { ICONS, getIcon, type IconKey } from './icons.js';

// Examples (for reference and testing)
export { MenuScreenExample } from './examples/MenuScreenExample.js';
export { DirectoryScreenExample } from './examples/DirectoryScreenExample.js';
export {
  WelcomeScreenRefactored,
  WelcomeScreenManualExample
} from './examples/WelcomeScreenRefactored.js';