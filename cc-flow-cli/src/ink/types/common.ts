/**
 * CC-Flow TUI Common Types
 * 
 * Shared type definitions used across the TUI components
 */

// Spacing values for consistent layout
export type Spacing = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Alignment options
export type Alignment = 'left' | 'center' | 'right';

// Size variants
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Color variants for UI components
export type ColorVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

// Status bar variants
export type StatusVariant = 'default' | 'warning' | 'info' | 'success' | 'error';

// Navigation types for status bars
export type NavigationType = 'menu' | 'back' | 'confirmation' | 'processing' | 'custom';

// Border styles
export type BorderStyle = 'single' | 'double' | 'round' | 'bold';

// Common margin/padding values
export type SpacingValue = 0 | 1 | 2 | 3 | 4 | 5;

// Screen width breakpoints
export type ScreenSize = 'compact' | 'normal' | 'wide';

// Input focus states
export type FocusState = 'focused' | 'blurred' | 'disabled';

// Loading states
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Theme mode
export type ThemeMode = 'light' | 'dark' | 'auto';