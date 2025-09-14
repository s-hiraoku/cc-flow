import chalk from 'chalk';
import { select } from '@inquirer/prompts';
import type { DirectoryInfo } from '../../models/Agent.js';

export class DirectoryScreen {
  async show(directories: DirectoryInfo[]): Promise<DirectoryInfo> {
    // Handle empty directories list
    if (directories.length === 0) {
      console.clear();
      console.log(chalk.bold('┌─ ❌ エージェントが見つかりません ───────┐'));
      console.log('│                                         │');
      console.log('│ エージェントディレクトリまたは          │');
      console.log('│ ファイルが見つかりません。              │');
      console.log('│ .claude/agents に .md ファイルを        │');
      console.log('│ 追加してください。                      │');
      console.log('│                                         │');
      console.log('└─────────────────────────────────────────┘');
      throw new Error('No agent directories available');
    }

    // If there's only one directory, auto-select it
    if (directories.length === 1 && directories[0]) {
      const selected = directories[0];
      console.clear();
      console.log(chalk.bold('┌─ 📁 エージェントディレクトリ検出 ───────┐'));
      console.log('│                                         │');
      console.log(`│ ${selected.displayName} に ${selected.agentCount}個のエージェントが見つかりました │`);
      console.log('│                                         │');
      console.log('│ エージェント選択画面に進みます...       │');
      console.log('└─────────────────────────────────────────┘');
      
      // Brief pause to show the message
      await new Promise(resolve => setTimeout(resolve, 1500));
      return selected;
    }

    console.clear();
    this.showHeader();
    console.log('└─────────────────────────────────────────┘');
    console.log();
    
    // Prepare choices
    const choices = directories.map(dir => {
      if (dir.displayName === 'all') {
        return {
          name: `📁 ${dir.displayName.padEnd(12)} (${dir.agentCount}個のエージェント - 全ディレクトリ)`,
          value: dir
        };
      } else {
        return {
          name: `📁 ${dir.displayName.padEnd(12)} (${dir.agentCount}個のエージェント)`,
          value: dir
        };
      }
    });
    
    const selected = await select({
      message: 'ワークフロー作成対象のディレクトリを選択してください:',
      choices,
      pageSize: 10
    });
    
    console.log(chalk.green(`\n✅ ${selected.displayName} を選択しました`));
    
    return selected;
  }
  
  private showHeader() {
    console.log(chalk.bold('┌─ 📁 ディレクトリ選択 ───────────────────┐'));
    console.log('│                                         │');
  }
}