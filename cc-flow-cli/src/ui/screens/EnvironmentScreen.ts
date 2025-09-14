import chalk from 'chalk';
import { select } from '@inquirer/prompts';
import type { EnvironmentStatus } from '../../models/Agent.js';

export class EnvironmentScreen {
  async show(status: EnvironmentStatus): Promise<boolean> {
    while (true) {
      console.clear();
      this.showHeader();
      this.showEnvironmentStatus(status);
      this.showAvailableAgents(status);
      console.log('└─────────────────────────────────────────┘');
      console.log();
      
      if (!status.isValid) {
        console.log(chalk.red('⚠️  プロジェクトセットアップが不完全です'));
        console.log(chalk.yellow('.claude/agents ディレクトリにエージェントファイルが必要です'));
        console.log();
      }
      
      // Prepare menu choices based on environment status
      const choices = [];
      
      if (status.isValid) {
        choices.push({
          name: '▶️  次へ進む',
          value: 'continue'
        });
      }
      
      choices.push(
        {
          name: '📚 ヘルプを表示',
          value: 'help'
        },
        {
          name: '❌ 終了',
          value: 'exit'
        }
      );
      
      const action = await select({
        message: status.isValid ? '環境チェック完了！次のステップを選択してください:' : 'セットアップを完了してから再実行してください:',
        choices
      });
      
      if (action === 'continue') {
        return status.isValid;
      }
      
      if (action === 'help') {
        this.showHelp();
        await this.waitForKey();
        continue;
      }
      
      if (action === 'exit') {
        return false;
      }
    }
  }
  
  private showHeader() {
    console.log(chalk.bold('┌─ 🔍 プロジェクト環境チェック ───────────┐'));
    console.log('│                                         │');
  }
  
  private showEnvironmentStatus(status: EnvironmentStatus) {
    console.log('│ プロジェクト構成をチェック中...         │');
    console.log('│                                         │');
    
    const claudeDirStatus = status.claudeDir ? '✅' : '❌';
    const agentsDirStatus = status.agentsDir ? '✅' : '❌';
    
    console.log(`│ ${claudeDirStatus} .claude ディレクトリ                 │`);
    console.log(`│ ${agentsDirStatus} agents ディレクトリ                 │`);
    console.log('│                                         │');
  }
  
  private showAvailableAgents(status: EnvironmentStatus) {
    if (status.isValid) {
      console.log('│ 利用可能なエージェント:                 │');
      console.log('│                                         │');
      
      // Show directory info (skip "all" option for display)
      const regularDirs = status.availableDirectories.filter(dir => dir.displayName !== 'all');
      for (const dir of regularDirs) {
        const displayName = `${dir.displayName} (${dir.agentCount}個)`;
        console.log(`│ • ${displayName.padEnd(35)} │`);
      }
      
      // Show total count
      const totalText = `• 全て (合計${status.totalAgents}個のエージェント)`;
      console.log(`│ ${totalText.padEnd(39)} │`);
      console.log('│                                         │');
    } else {
      console.log(chalk.red('│ ❌ セットアップが不完全です             │'));
      
      if (!status.claudeDir) {
        console.log('│    .claude ディレクトリが見つかりません │');
      }
      if (!status.agentsDir) {
        console.log('│    agents ディレクトリが見つかりません  │');
      }
      if (status.totalAgents === 0) {
        console.log('│    エージェントが見つかりません         │');
      }
      console.log('│                                         │');
    }
  }
  
  
  private showHelp() {
    console.clear();
    console.log(chalk.bold('┌─ 📚 ヘルプ - 環境チェック ──────────────┐'));
    console.log('│                                         │');
    console.log('│ 🔍 ' + chalk.cyan('環境チェックについて:') + '                │');
    console.log('│   このツールはClaudeCodeプロジェクトの  │');
    console.log('│   エージェント構成を確認し、利用可能な  │');
    console.log('│   エージェントを表示します。            │');
    console.log('│                                         │');
    console.log('│ 📁 ' + chalk.cyan('必要なディレクトリ:') + '                 │');
    console.log('│   • .claude/agents/ - エージェントファイル │');
    console.log('│   • 各カテゴリフォルダ (spec, utility等) │');
    console.log('│                                         │');
    console.log('│ 🚀 ' + chalk.cyan('次のステップ:') + '                       │');
    console.log('│   環境が正常な場合、ディレクトリ選択    │');
    console.log('│   画面に進みます。                      │');
    console.log('│                                         │');
    console.log('│ 💡 ' + chalk.cyan('メニュー操作:') + '                       │');
    console.log('│   上下矢印キーでメニューを選択          │');
    console.log('│   Enterキーで決定します                 │');
    console.log('│                                         │');
    console.log('└─────────────────────────────────────────┘');
    console.log(chalk.dim('\nPress any key to continue...'));
  }
  
  private async waitForKey(): Promise<void> {
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
}