/**
 * Modern Terminal Icons for CC-Flow TUI
 *
 * Using the `figures` package for cross-terminal compatibility
 * Provides Unicode symbols with automatic fallbacks for older terminals
 */

import figures from 'figures';

export const ICONS = {
  // Actions - Using filled/bold variants for better visibility
  workflow: figures.arrowRight,      // → Arrow for workflow/automation
  convert: figures.circleCircle,     // ◉ Filled circle for conversion
  create: figures.star,              // ★ Filled star for creation
  rocket: figures.arrowRight,        // → Arrow/start
  exit: figures.cross,               // ✘ X for exit
  back: figures.arrowLeft,           // ← Left arrow for back

  // Status - Bold variants
  success: figures.tick,             // ✔ Checkmark
  error: figures.cross,              // ✘ X mark
  warning: figures.warning,          // ⚠ Warning triangle
  info: figures.info,                // ℹ Info
  processing: figures.circleDotted,  // ◌ Dotted circle for processing

  // Navigation - Larger visual presence
  menu: figures.hamburger,           // ☰ Hamburger menu
  settings: figures.circleDotted,    // ◌ Settings
  help: figures.questionMarkPrefix,  // ? Question mark
  home: figures.home,                // ⌂ Home

  // Files & Folders - Filled variants for visibility
  folder: figures.squareSmallFilled, // ◼ Filled square for folder
  file: figures.circleFilled,        // ● Filled circle for file
  agent: figures.bullet,             // ● Bullet for agent
  command: figures.pointer,          // ❯ Pointer for command
  clipboard: figures.pointer,        // ❯ Clipboard/document
  package: figures.squareSmallFilled, // ◼ Package/box
  edit: figures.pointer,             // ❯ Edit/pencil
  target: figures.circleFilled,      // ● Target
  refresh: figures.circleDotted,     // ◌ Refresh/reload
  lightning: figures.star,           // ★ Lightning/fast
  party: figures.star,               // ★ Party/celebration
  hint: figures.info,                // ℹ Hint/idea

  // UI Elements - Enhanced visibility
  selected: figures.triangleRightSmall, // ▹ Small triangle (outline) for selection
  unselected: ' ',                   // Space for unselected
  checkbox: figures.checkboxOff,     // ☐ Empty checkbox
  checked: figures.checkboxOn,       // ☑ Checked checkbox
  checkboxCircle: figures.checkboxCircleOn, // ◉ Circle checkbox (filled)

  // Misc - Additional visual elements
  clock: figures.ellipsis,           // … Ellipsis for loading
  search: figures.arrowDown,         // ↓ Search
  link: figures.pointer,             // ❯ Link symbol
  arrow: figures.arrowRight,         // → Right arrow
  dot: figures.bullet,               // ● Filled dot
  line: figures.line,                // ─ Line
  heart: figures.heart,              // ♥ Heart
  nodejs: figures.nodejs,            // ⬢ Node.js logo
  smiley: figures.smiley,            // ☺ Smiley
  music: figures.musicNote,          // ♪ Music note
  lozenge: figures.lozenge,          // ◆ Lozenge/diamond
  square: figures.square,            // █ Full square
} as const;

export type IconKey = keyof typeof ICONS;

/**
 * Get icon by key with fallback
 * @param key - Icon key
 * @param fallback - Fallback string if icon not found
 * @param withSpace - Add extra space after icon for better visibility (default: true)
 */
export const getIcon = (key: IconKey, fallback = '', withSpace = true): string => {
  const icon = ICONS[key] ?? fallback;
  // Use double space for better visual separation and apparent size
  return withSpace && icon ? `${icon}  ` : icon;
};

/**
 * Get raw icon without spacing
 */
export const getRawIcon = (key: IconKey, fallback = ''): string => {
  return ICONS[key] ?? fallback;
};
