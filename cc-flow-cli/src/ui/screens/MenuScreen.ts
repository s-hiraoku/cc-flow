import { select } from '@inquirer/prompts';
import chalk from 'chalk';
import { BaseScreen } from './BaseScreen.js';

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
      this.showScreenFrame('CC-Flow メインメニュー', this.theme.icons.clipboard, () => {
        console.log(this.theme.createContentLine('複数のエージェントを連携させた強力なワークフローを作成'));
        console.log(this.theme.createContentLine('実行順序を設定して自動化されたタスクフローを構築'));
        console.log(this.theme.createEmptyLine());
        console.log(this.theme.createContentLine('アクションを選択してください'));
      });
      
      // 日本語入力強制リセット
      this.forceEnglishInput();

      const choices: MenuChoice[] = [
        {
          name: `${this.theme.icons.rocket} 既存エージェントを連携してワークフロー作成`,
          value: 'create-workflow',
          description: '複数のサブエージェントを選択・順序設定して連携ワークフローを構築します'
        },
        {
          name: `${this.theme.icons.gear} カスタムコマンドをエージェント化→ワークフロー作成`,
          value: 'convert-commands',
          description: 'カスタムスラッシュコマンドをサブエージェントに変換してワークフロー作成まで一括実行'
        },
        {
          name: `${this.theme.icons.info} ヘルプ`,
          value: 'help',
          description: 'ヘルプと使用方法を表示'
        },
        {
          name: `${this.theme.icons.cross} 終了`,
          value: 'exit',
          description: 'アプリケーションを終了'
        }
      ];

      let choice = await select({
        message: '\n何をしますか？',
        choices: choices.map(choice => ({
          name: choice.name,
          value: choice.value,
          description: choice.description ? `\n${choice.description}` : ''
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
      // Handle user cancellation using BaseScreen method
      if (this.handleUserCancellation(error)) {
        return 'exit';
      }
      
      // Re-throw other errors
      throw error;
    }
  }

  // Removed showHeader method - now using BaseScreen's displayHeader

  private async showHelp(): Promise<void> {
    this.showScreenFrame('CC-Flow ヘルプ', this.theme.icons.info, () => {
      console.log(this.theme.createContentLine(this.theme.colors.accent('利用可能なアクション:')));
      console.log(this.theme.createEmptyLine());
      console.log(this.theme.createContentLine(`${this.theme.icons.rocket} エージェント連携ワークフロー作成`));
      console.log(this.theme.createContentLine('  複数エージェントを選択・順序設定して連携ワークフロー構築'));
      console.log(this.theme.createEmptyLine());
      console.log(this.theme.createContentLine(`${this.theme.icons.gear} カスタムコマンド→エージェント化→ワークフロー作成`));
      console.log(this.theme.createContentLine('  スラッシュコマンドをサブエージェント化してワークフロー作成まで一括実行'));
      console.log(this.theme.createEmptyLine());
      console.log(this.theme.createContentLine(this.theme.colors.muted('操作: ↑↓で移動、Enterで選択')));
    });
    console.log(chalk.blue('Enterキーでメインメニューに戻る...'));
    
    await this.waitForKey();
  }
}