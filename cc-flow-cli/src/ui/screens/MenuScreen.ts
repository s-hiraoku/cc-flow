import { select } from '@inquirer/prompts';
import chalk from 'chalk';
import { BaseScreen } from './BaseScreen.js';
import { KeyboardHelper } from '../components/TUIComponents.js';

export interface MenuChoice {
  name: string;
  value: string;
  description?: string;
}

export class MenuScreen extends BaseScreen {
  
  constructor() {
    super();
  }

  async show(): Promise<string> {
    try {
      console.clear();
      this.showHeader();
      
      // 日本語入力強制リセット
      KeyboardHelper.forceEnglishInput();

      const choices: MenuChoice[] = [
        {
          name: '🚀 既存エージェントからワークフローを作成',
          value: 'create-workflow',
          description: '既存のサブエージェントを使用してワークフローを構築'
        },
        {
          name: '🔄 スラッシュコマンドをエージェントに変換',
          value: 'convert-commands',
          description: 'カスタムスラッシュコマンドをサブエージェントに変換'
        },
        {
          name: '❓ ヘルプ',
          value: 'help',
          description: 'ヘルプと使用方法を表示'
        },
        {
          name: '🚪 終了',
          value: 'exit',
          description: 'アプリケーションを終了'
        }
      ];

      let choice = await select({
        message: '何をしますか？',
        choices: choices.map(choice => ({
          name: choice.name,
          value: choice.value,
          description: choice.description || ''
        })),
        theme: {
          prefix: {
            idle: '> ',
            done: '✅'
          }
        }
      });

      // ヘルプが選択された場合、ヘルプを表示してからメニューに戻る
      if (choice === 'help') {
        await this.showHelp();
        return await this.show(); // メニューを再表示
      }

      return choice;
    } catch (error) {
      // Handle user cancellation (Ctrl+C)
      if (error instanceof Error && error.message.includes('User force closed')) {
        return 'exit';
      }
      
      // Re-throw other errors
      throw error;
    }
  }

  private showHeader(): void {
    console.log(chalk.cyan.bold('┌─ 📋 CC-Flow メインメニュー ──────────────────────┐'));
    console.log(chalk.cyan('│' + ' '.repeat(47) + '│'));
    console.log(chalk.cyan('│') + '  Claude Code Workflow Orchestration Platform  ' + chalk.cyan('│'));
    console.log(chalk.cyan('│') + '  アクションを選択して開始してください            ' + chalk.cyan('│'));
    console.log(chalk.cyan('│' + ' '.repeat(47) + '│'));
    console.log(chalk.cyan('└' + '─'.repeat(47) + '┘'));
    console.log();
  }

  private async showHelp(): Promise<void> {
    console.clear();
    console.log(chalk.cyan.bold('📖 CC-Flow ヘルプ'));
    console.log();
    console.log(chalk.green('利用可能なアクション:'));
    console.log();
    console.log(chalk.white('🚀 既存エージェントからワークフローを作成'));
    console.log(chalk.gray('   既存のサブエージェントを選択・順序付けして強力なワークフローを構築'));
    console.log(chalk.gray('   します。複雑な自動化シーケンスの作成に最適です。'));
    console.log();
    console.log(chalk.white('🔄 スラッシュコマンドをエージェントに変換'));
    console.log(chalk.gray('   カスタムスラッシュコマンドをサブエージェントに変換'));
    console.log(chalk.gray('   します。コマンドの整理と利用性を向上させます。'));
    console.log();
    console.log(chalk.yellow('操作方法:'));
    console.log(chalk.gray('   ↑↓ - メニューオプションを移動'));
    console.log(chalk.gray('   Enter - オプションを選択'));
    console.log(chalk.gray('   Ctrl+C - アプリケーションを終了'));
    console.log();
    console.log(chalk.blue('Enterキーでメインメニューに戻る...'));
    
    return new Promise((resolve) => {
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.once('data', () => {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        resolve();
      });
    });
  }
}