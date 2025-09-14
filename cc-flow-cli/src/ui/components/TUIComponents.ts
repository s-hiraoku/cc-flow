import chalk from 'chalk';

// 2025年のモダンなTUI設計に基づく共通コンポーネントライブラリ

export const TUIColors = {
  // Primary brand colors
  primary: chalk.blue,
  secondary: chalk.cyan,
  accent: chalk.magenta,
  
  // Semantic colors
  success: chalk.green,
  warning: chalk.yellow,
  error: chalk.red,
  info: chalk.blue,
  
  // Text hierarchy
  title: chalk.bold.white,
  heading: chalk.bold,
  body: chalk.white,
  muted: chalk.gray,
  dim: chalk.dim,
  
  // Interactive elements
  highlight: chalk.inverse,
  selected: chalk.bgBlue.white,
  disabled: chalk.strikethrough.gray,
  
  // Status indicators
  active: chalk.green('●'),
  inactive: chalk.gray('○'),
  loading: chalk.yellow('◐'),
  pending: chalk.dim('○')
} as const;

export const TUITypography = {
  h1: (text: string) => TUIColors.title(`\n${text}\n${'═'.repeat(text.length)}\n`),
  h2: (text: string) => TUIColors.heading(`\n${text}\n${'-'.repeat(text.length)}\n`),
  h3: (text: string) => TUIColors.heading(`\n${text}\n`),
  
  body: (text: string) => TUIColors.body(text),
  caption: (text: string) => TUIColors.muted(text),
  code: (text: string) => chalk.bgGray.black(` ${text} `),
  
  // Interactive text styles
  button: (text: string, selected: boolean = false) =>
    selected ? TUIColors.selected(` ${text} `) : TUIColors.body(`[ ${text} ]`),
  
  link: (text: string) => TUIColors.info(text),
  kbd: (key: string) => chalk.bgWhite.black(` ${key} `)
} as const;

export class LayoutManager {
  static getTerminalSize(): { width: number; height: number } {
    return {
      width: process.stdout.columns || 80,
      height: process.stdout.rows || 24
    };
  }
  
  static createBox(
    title: string,
    content: string,
    width: number = 60,
    padding: number = 1
  ): string {
    const { width: termWidth } = this.getTerminalSize();
    const actualWidth = Math.min(width, termWidth - 4);
    
    const horizontalBorder = '─'.repeat(actualWidth - title.length - 6);
    const contentLines = content.split('\n');
    
    const lines: string[] = [
      `┌─ ${TUIColors.title(title)} ${horizontalBorder}┐`
    ];
    
    // Add padding
    for (let i = 0; i < padding; i++) {
      lines.push(`│${' '.repeat(actualWidth - 2)}│`);
    }
    
    // Add content with proper padding
    contentLines.forEach(line => {
      const cleanLine = this.stripAnsi(line);
      if (cleanLine.length > actualWidth - 2 * (padding + 1)) {
        // Wrap long lines
        const wrapped = this.wrapText(line, actualWidth - 2 * (padding + 1));
        wrapped.forEach(wrappedLine => {
          const paddedLine = wrappedLine.padEnd(actualWidth - 2 * (padding + 1));
          lines.push(`│${' '.repeat(padding)}${paddedLine}${' '.repeat(padding)}│`);
        });
      } else {
        const paddedLine = line.padEnd(actualWidth - 2 * (padding + 1));
        lines.push(`│${' '.repeat(padding)}${paddedLine}${' '.repeat(padding)}│`);
      }
    });
    
    // Add bottom padding
    for (let i = 0; i < padding; i++) {
      lines.push(`│${' '.repeat(actualWidth - 2)}│`);
    }
    
    lines.push(`└${'─'.repeat(actualWidth - 2)}┘`);
    return lines.join('\n');
  }
  
  static createProgressBar(current: number, total: number, width: number = 30): string {
    const percentage = Math.min(100, Math.max(0, (current / total) * 100));
    const filled = Math.floor((percentage / 100) * width);
    const empty = width - filled;
    
    return [
      TUIColors.success('█'.repeat(filled)),
      TUIColors.muted('░'.repeat(empty))
    ].join('') + ` ${Math.round(percentage)}%`;
  }
  
  static createStatusIndicator(status: 'success' | 'error' | 'warning' | 'info'): string {
    const indicators = {
      success: TUIColors.success('✅'),
      error: TUIColors.error('❌'),
      warning: TUIColors.warning('⚠️'),
      info: TUIColors.info('ℹ️')
    };
    return indicators[status];
  }
  
  private static stripAnsi(str: string): string {
    // Simple ANSI code removal (for more robust solution, use strip-ansi package)
    return str.replace(/\u001b\[[\d;]*m/g, '');
  }
  
  private static wrapText(text: string, maxWidth: number): string[] {
    const clean = this.stripAnsi(text);
    if (clean.length <= maxWidth) {
      return [text];
    }
    
    const words = text.split(' ');
    const wrapped: string[] = [];
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const cleanTestLine = this.stripAnsi(testLine);
      
      if (cleanTestLine.length <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          wrapped.push(currentLine);
          currentLine = word;
        } else {
          wrapped.push(word);
        }
      }
    }
    
    if (currentLine) {
      wrapped.push(currentLine);
    }
    
    return wrapped;
  }
}

export interface KeyBinding {
  key: string | string[];
  description: string;
  action: () => void | Promise<void>;
  condition?: () => boolean;
}

export class KeyboardHelper {
  static renderShortcuts(bindings: KeyBinding[]): string {
    const lines: string[] = [
      TUIColors.dim('───── Keyboard Shortcuts ─────')
    ];
    
    bindings.forEach(binding => {
      const keys = Array.isArray(binding.key) ? binding.key.join(' or ') : binding.key;
      const keyDisplay = TUITypography.kbd(keys);
      lines.push(`${keyDisplay} ${TUIColors.dim(binding.description)}`);
    });
    
    return lines.join('\n');
  }
  
  static createNavigationHelp(options: {
    canGoBack?: boolean;
    canConfirm?: boolean;
    canCancel?: boolean;
    customActions?: Array<{ key: string; action: string }>;
  } = {}): string {
    const shortcuts: string[] = [];
    
    if (options.canGoBack) {
      shortcuts.push(`${TUITypography.kbd('←')} Back`);
    }
    
    if (options.canConfirm) {
      shortcuts.push(`${TUITypography.kbd('Enter')} Confirm`);
    }
    
    if (options.canCancel) {
      shortcuts.push(`${TUITypography.kbd('Esc')} Cancel`);
    }
    
    if (options.customActions) {
      options.customActions.forEach(action => {
        shortcuts.push(`${TUITypography.kbd(action.key)} ${action.action}`);
      });
    }
    
    return TUIColors.dim(shortcuts.join('  •  '));
  }

  /**
   * Force English input mode by sending escape sequences to disable IME
   * This helps prevent issues with Japanese input when using checkbox selections
   */
  static forceEnglishInput(): void {
    // Send escape sequence to disable IME on macOS/Linux
    if (process.platform === 'darwin' || process.platform === 'linux') {
      try {
        process.stdout.write('\x1b[<0m'); // Reset IME state
      } catch (error) {
        // Silently ignore errors - this is a best-effort attempt
      }
    }
    
    // Additional warning for users if Japanese input is detected
    if (I18nHelper.isJapaneseInput()) {
      console.log(TUIColors.warning('💡 日本語入力がオンになっています。英語キーボードモードに切り替えて操作してください。'));
      console.log(TUIColors.dim('   Tip: Switch to English keyboard mode for better checkbox interaction.'));
    }
  }
}

// スクリーン管理のベースクラス
export abstract class BaseScreen<TData = any> {
  protected screenTitle: string = '';
  
  constructor(title: string) {
    this.screenTitle = title;
  }
  
  protected renderHeader(subtitle?: string): string {
    const { width } = LayoutManager.getTerminalSize();
    const title = subtitle ? `${this.screenTitle} - ${subtitle}` : this.screenTitle;
    
    return LayoutManager.createBox('CC-Flow CLI', `${TUIColors.heading(title)}\n\n${TUIColors.dim('Modern Terminal User Interface')}`, Math.min(width - 4, 70));
  }
  
  protected clearAndRender(...content: string[]): void {
    console.clear();
    content.forEach(line => console.log(line));
  }
}

// 日本語入力対応のヘルパー
export class I18nHelper {
  static readonly messages = {
    ja: {
      selectAgents: 'エージェントを選択してください：',
      setOrder: '実行順序を設定してください：',
      confirm: '確認',
      cancel: 'キャンセル',
      back: '戻る',
      next: '次へ',
      move: '移動',
      complete: '完了',
      noSelection: '少なくとも一つのエージェントを選択してください',
      keyboardHelp: 'キーボードショートカット'
    },
    en: {
      selectAgents: 'Select agents to include:',
      setOrder: 'Set execution order:',
      confirm: 'Confirm',
      cancel: 'Cancel',
      back: 'Back',
      next: 'Next',
      move: 'Move',
      complete: 'Complete',
      noSelection: 'Please select at least one agent',
      keyboardHelp: 'Keyboard Shortcuts'
    }
  };
  
  static getMessage(key: keyof typeof I18nHelper.messages.ja, locale: 'ja' | 'en' = 'en'): string {
    return this.messages[locale][key];
  }
  
  static isJapaneseInput(): boolean {
    // 環境変数やシステム設定から日本語入力の状態を判断
    // 簡単な実装として、LANG環境変数をチェック
    const lang = process.env['LANG'] || '';
    return lang.includes('ja') || lang.includes('JP');
  }
}