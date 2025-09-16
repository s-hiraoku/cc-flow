import { SimpleUITheme } from '../themes/SimpleUITheme.js';
import chalk from 'chalk';

/**
 * Base class for all TUI screens
 * Provides common functionality and consistent interface
 */
export abstract class BaseScreen {
  protected theme = SimpleUITheme;
  protected spinnerInterval: NodeJS.Timeout | null = null;
  protected spinnerIndex = 0;
  
  constructor() {
    // Common initialization logic for all screens
  }
  
  /**
   * Show the screen and return its result
   * Each screen should implement this method
   */
  abstract show(...args: any[]): Promise<any>;
  
  /**
   * Called when screen is entered (optional)
   */
  async onEnter?(): Promise<void> {
    // Default implementation - screens can override
  }
  
  /**
   * Called when screen is exited (optional)
   */
  async onExit?(): Promise<void> {
    // Default implementation - screens can override
  }

  /**
   * Standard error handler for user cancellation
   */
  protected handleUserCancellation(error: unknown): boolean {
    if (error instanceof Error && error.message.includes('User force closed')) {
      return true;
    }
    return false;
  }

  /**
   * Standard method to check for back navigation
   */
  protected isBackNavigation(value: string): boolean {
    return value === 'back' || value === 'b';
  }

  /**
   * Standard method to show screen with header and footer
   */
  protected showScreenFrame(title: string, icon?: string, content?: () => void): void {
    console.clear();
    
    const headerLines = SimpleUITheme.createHeader(title, icon);
    headerLines.forEach(line => console.log(line));
    
    if (content) {
      console.log(SimpleUITheme.createEmptyLine());
      content();
    }
    
    console.log(SimpleUITheme.createFooter());
    console.log();
  }

  /**
   * Display a simple header across all screens
   */
  protected displayHeader(title: string, icon?: string, subtitle?: string): void {
    console.clear();
    const headerLines = SimpleUITheme.createHeader(title, icon);
    headerLines.forEach(line => console.log(line));
    
    if (subtitle) {
      console.log(SimpleUITheme.createContentLine(''));
      console.log(SimpleUITheme.createContentLine(SimpleUITheme.colors.muted(subtitle)));
    }
  }

  /**
   * Display footer
   */
  protected displayFooter(): void {
    console.log(SimpleUITheme.createFooter());
  }

  /**
   * Display a section with content
   */
  protected displaySection(title: string, content: string[], icon?: string): void {
    // Section display using SimpleUITheme
    console.log(SimpleUITheme.createContentLine(title));
    content.forEach(line => console.log(SimpleUITheme.createContentLine(line)));
  }

  /**
   * Display status message
   */
  protected displayStatus(type: 'success' | 'error' | 'warning' | 'info', message: string): void {
    // Status display using SimpleUITheme
    const statusIcon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    console.log(SimpleUITheme.createContentLine(`${statusIcon} ${message}`));
  }

  /**
   * Start loading spinner
   */
  protected startSpinner(message: string): void {
    this.spinnerIndex = 0;
    const displaySpinner = () => {
      const spinner = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
      process.stdout.write(`
${spinner[this.spinnerIndex % spinner.length]} ${message}`);
      this.spinnerIndex++;
    };
    
    displaySpinner();
    this.spinnerInterval = setInterval(displaySpinner, 100);
  }

  /**
   * Stop loading spinner
   */
  protected stopSpinner(clearLine: boolean = true): void {
    if (this.spinnerInterval) {
      clearInterval(this.spinnerInterval);
      this.spinnerInterval = null;
      if (clearLine) {
        process.stdout.write('\r' + ' '.repeat(80) + '\r');
      }
    }
  }

  /**
   * Display progress bar
   */
  protected displayProgress(current: number, total: number, label?: string): void {
    const percentage = Math.round((current / total) * 100);
    const progressLabel = label || `Progress: ${current}/${total}`;
    const progressBar = `[${'='.repeat(Math.round(percentage / 5))}${' '.repeat(20 - Math.round(percentage / 5))}] ${percentage}%`;
    console.log(SimpleUITheme.createContentLine(`${progressLabel}: ${progressBar}`));
  }

  /**
   * Center text helper
   */
  protected centerText(text: string, width?: number): string {
    const terminalWidth = width || process.stdout.columns || 80;
    const lines = text.split('\n');
    
    return lines.map(line => {
      const cleanLine = line.replace(/\x1b\[[0-9;]*m/g, '');
      if (terminalWidth < cleanLine.length + 4) {
        return line;
      }
      const padding = Math.max(0, Math.floor((terminalWidth - cleanLine.length) / 2));
      return ' '.repeat(padding) + line;
    }).join('\n');
  }

  /**
   * Wait for user key press
   */
  protected async waitForKey(message: string = 'Press any key to continue...'): Promise<void> {
    console.log(SimpleUITheme.createContentLine(''));
    console.log(SimpleUITheme.createContentLine(SimpleUITheme.colors.muted(message)));
    
    return new Promise(resolve => {
      process.stdin.setRawMode?.(true);
      process.stdin.resume();
      process.stdin.once('data', () => {
        process.stdin.setRawMode?.(false);
        process.stdin.pause();
        resolve();
      });
    });
  }

  /**
   * Animated transition effect
   */
  protected async showTransition(): Promise<void> {
    const frames = ['◐', '◓', '◑', '◒'];
    for (const frame of frames) {
      process.stdout.write(`\r${SimpleUITheme.colors.primary(frame)} Loading...`);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    process.stdout.write('\r' + ' '.repeat(20) + '\r');
  }

  /**
   * Force English input mode by sending escape sequences to disable IME
   * This helps prevent issues with Japanese input when using checkbox selections
   */
  protected forceEnglishInput(): void {
    // Send escape sequence to disable IME on macOS/Linux
    if (process.platform === 'darwin' || process.platform === 'linux') {
      try {
        process.stdout.write('\x1b[<0m'); // Reset IME state
      } catch (error) {
        // Silently ignore errors - this is a best-effort attempt
      }
    }
    
    // Additional warning for users if Japanese input is detected
    const lang = process.env['LANG'] || '';
    if (lang.includes('ja') || lang.includes('JP')) {
      console.log(SimpleUITheme.colors.warning('💡 日本語入力がオンになっています。英語キーボードモードに切り替えて操作してください。'));
      console.log(SimpleUITheme.colors.muted('   Tip: Switch to English keyboard mode for better checkbox interaction.'));
    }
  }
}