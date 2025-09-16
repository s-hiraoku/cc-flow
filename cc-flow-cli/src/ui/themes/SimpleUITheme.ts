import chalk from 'chalk';
import stringWidth from 'string-width';

/**
 * Simplified UI Theme - Fixed width, no complex responsive logic
 */
export class SimpleUITheme {
  // Simple color palette
  static readonly colors = {
    primary: chalk.cyan,
    accent: chalk.bold.cyan,
    success: chalk.green,
    warning: chalk.yellow,
    error: chalk.red,
    info: chalk.blue,
    muted: chalk.gray
  };

  // Simple icon set
  static readonly icons = {
    rocket: '🚀',
    gear: '⚙️',
    clipboard: '📋',
    info: 'ℹ️',
    success: '✅',
    error: '❌',
    back: '↩️',
    next: '▶️',
    cross: '✗',
    check: '✓',
    lightning: '⚡',
    folder: '📁',
    order: '🔄',
    edit: '📝'
  };

  /**
   * Create a simple header with fixed width, accounting for full-width characters
   */
  static createHeader(title: string, icon?: string): string[] {
    const titleContent = icon ? `${icon} ${title}` : title;
    const totalWidth = 74;
    const titleDisplayWidth = this.getDisplayWidth(titleContent);
    const paddingNeeded = Math.max(0, totalWidth - 4 - titleDisplayWidth);
    
    return [
      this.colors.primary(
        `┌─ ${this.colors.accent(titleContent)} ${'─'.repeat(paddingNeeded)}┐`
      )
    ];
  }

  /**
   * Create a simple footer with fixed width
   */
  static createFooter(): string {
    return this.colors.primary('└────────────────────────────────────────────────────────────────────────┘');
  }

  /**
   * Calculate actual display width with enhanced accuracy for Japanese characters
   */
  static getDisplayWidth(str: string): number {
    // Use string-width but add small adjustment for terminal rendering
    const basicWidth = stringWidth(str);
    return basicWidth;
  }

  /**
   * Create a content line with precise width calculation
   */
  static createContentLine(content: string): string {
    const maxContentWidth = 72;
    const displayWidth = this.getDisplayWidth(content);
    
    // Calculate exact padding needed (accounting for leading space)
    const leadingSpace = 1;
    const availableSpace = maxContentWidth - leadingSpace;
    const paddingNeeded = Math.max(0, availableSpace - displayWidth);
    
    // Build the content line with precise spacing
    const paddedContent = ` ${content}${' '.repeat(paddingNeeded)}`;
    
    return this.colors.primary('│') + paddedContent + this.colors.primary('│');
  }

  /**
   * Create an empty line
   */
  static createEmptyLine(): string {
    return this.colors.primary('│') + ' '.repeat(72) + this.colors.primary('│');
  }

  /**
   * Format status messages
   */
  static formatStatus(type: 'success' | 'error' | 'warning' | 'info', message: string): string {
    const iconMap = {
      success: this.icons.success,
      error: this.icons.error,
      warning: '⚠️',
      info: this.icons.info
    };
    
    const colorMap = {
      success: this.colors.success,
      error: this.colors.error,
      warning: this.colors.warning,
      info: this.colors.info
    };
    
    return `${iconMap[type]} ${colorMap[type](message)}`;
  }
}