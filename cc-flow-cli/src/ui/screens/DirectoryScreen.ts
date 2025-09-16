import chalk from 'chalk';
import { select } from '@inquirer/prompts';
import type { DirectoryInfo } from '../../models/Agent.js';
import { BaseScreen } from './BaseScreen.js';

export class DirectoryScreen extends BaseScreen {
  constructor() {
    super();
  }
  async show(directories: DirectoryInfo[]): Promise<DirectoryInfo | null> {
    // Handle empty directories list
    if (directories.length === 0) {
      this.showScreenFrame('エージェントが見つかりません', this.theme.icons.cross, () => {
        console.log(this.theme.createContentLine('エージェントディレクトリまたは'));
        console.log(this.theme.createContentLine('ファイルが見つかりません。'));
        console.log(this.theme.createContentLine('.claude/agents に .md ファイルを'));
        console.log(this.theme.createContentLine('追加してください。'));
      });
      throw new Error('No agent directories available');
    }

    // If there's only one directory, auto-select it
    if (directories.length === 1 && directories[0]) {
      const selected = directories[0];
      
      this.showScreenFrame('エージェントディレクトリ検出', this.theme.icons.folder, () => {
        console.log(this.theme.createContentLine(`${selected.displayName} に ${selected.agentCount}個の`));
        console.log(this.theme.createContentLine('エージェントが見つかりました'));
        console.log(this.theme.createEmptyLine());
        console.log(this.theme.createContentLine('エージェント選択画面に進みます...'));
      });
      
      // Brief pause to show the message
      await new Promise(resolve => setTimeout(resolve, 1500));
      return selected;
    }

    this.showScreenFrame('ディレクトリ選択', this.theme.icons.folder, () => {
      console.log(this.theme.createContentLine('使用するエージェントディレクトリを選択してください'));
    });
    
    // Prepare choices
    const choices = [
      ...directories.map(dir => {
        if (dir.displayName === 'all') {
          return {
            name: `📁 ${dir.displayName} (${dir.agentCount}個のエージェント - 全ディレクトリ)`,
            value: dir
          };
        } else {
          return {
            name: `📁 ${dir.displayName} (${dir.agentCount}個のエージェント)`,
            value: dir
          };
        }
      }),
      {
        name: '↩️ メインメニューに戻る',
        value: 'back' as any
      }
    ];
    
    const selected = await select({
      message: 'ワークフロー作成対象のディレクトリを選択してください:',
      choices,
      pageSize: 10
    });
    
    // Check if user wants to go back
    if (selected === 'back') {
      return null;
    }
    
    console.log(chalk.green(`\n✅ ${selected.displayName} を選択しました`));
    
    return selected;
  }
}