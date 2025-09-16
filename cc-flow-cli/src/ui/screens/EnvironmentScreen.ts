import chalk from 'chalk';
import { select } from '@inquirer/prompts';
import type { EnvironmentStatus } from '../../models/Agent.js';
import { BaseScreen } from './BaseScreen.js';
import { SimpleUITheme } from '../themes/SimpleUITheme.js';

export class EnvironmentScreen extends BaseScreen {
  constructor() {
    super();
  }
  async show(status: EnvironmentStatus): Promise<boolean> {
    while (true) {
      this.showScreenFrame('プロジェクト環境チェック', this.theme.icons.gear, () => {
        this.showEnvironmentStatus(status);
        this.showAvailableAgents(status);
      });
      
      if (!status.isValid) {
        console.log(chalk.red('⚠️  プロジェクトセットアップが不完全です'));
        console.log(chalk.yellow('.claude/agents ディレクトリにエージェントファイルが必要です'));
        console.log();
      }
      
      // Prepare menu choices based on environment status
      const choices = [];
      
      if (status.isValid) {
        choices.push({
          name: `${this.theme.icons.next} 次へ進む`,
          value: 'continue'
        });
      }
      
      choices.push(
        {
          name: '📚 ヘルプを表示',
          value: 'help'
        },
        {
          name: '↩️ メインメニューに戻る',
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
  
  private showEnvironmentStatus(status: EnvironmentStatus) {
    console.log(SimpleUITheme.createContentLine('プロジェクト構成をチェック中...'));
    console.log(SimpleUITheme.createEmptyLine());
    
    const claudeDirStatus = status.claudeDir ? '✅' : '❌';
    const agentsDirStatus = status.agentsDir ? '✅' : '❌';
    
    console.log(SimpleUITheme.createContentLine(`${claudeDirStatus} .claude ディレクトリ`));
    console.log(SimpleUITheme.createContentLine(`${agentsDirStatus} agents ディレクトリ`));
    console.log(SimpleUITheme.createEmptyLine());
  }
  
  private showAvailableAgents(status: EnvironmentStatus) {
    if (status.isValid) {
      console.log(SimpleUITheme.createContentLine('利用可能なエージェント:'));
      console.log(SimpleUITheme.createEmptyLine());
      
      // Show directory info (skip "all" option for display)
      const regularDirs = status.availableDirectories.filter(dir => dir.displayName !== 'all');
      for (const dir of regularDirs) {
        const displayName = `• ${dir.displayName} (${dir.agentCount}個)`;
        console.log(SimpleUITheme.createContentLine(displayName));
      }
      
      // Show total count
      const totalText = `• 全て (合計${status.totalAgents}個のエージェント)`;
      console.log(SimpleUITheme.createContentLine(totalText));
      console.log(SimpleUITheme.createEmptyLine());
    } else {
      console.log(SimpleUITheme.createContentLine('❌ セットアップが不完全です'));
      console.log(SimpleUITheme.createEmptyLine());
      
      if (!status.claudeDir) {
        console.log(SimpleUITheme.createContentLine('   .claude ディレクトリが見つかりません'));
      }
      if (!status.agentsDir) {
        console.log(SimpleUITheme.createContentLine('   agents ディレクトリが見つかりません'));
      }
      if (status.totalAgents === 0) {
        console.log(SimpleUITheme.createContentLine('   エージェントが見つかりません'));
      }
      console.log(SimpleUITheme.createEmptyLine());
    }
  }
  
  
  private showHelp() {
    this.showScreenFrame('ヘルプ - 環境チェック', this.theme.icons.info, () => {
      console.log(SimpleUITheme.createContentLine('🔍 ' + chalk.cyan('環境チェックについて:')));
      console.log(SimpleUITheme.createContentLine('  このツールはClaudeCodeプロジェクトの'));
      console.log(SimpleUITheme.createContentLine('  エージェント構成を確認し、利用可能な'));
      console.log(SimpleUITheme.createContentLine('  エージェントを表示します。'));
      console.log(SimpleUITheme.createEmptyLine());
      console.log(SimpleUITheme.createContentLine('📁 ' + chalk.cyan('必要なディレクトリ:')));
      console.log(SimpleUITheme.createContentLine('  • .claude/agents/ - エージェントファイル'));
      console.log(SimpleUITheme.createContentLine('  • 各カテゴリフォルダ (spec, utility等)'));
      console.log(SimpleUITheme.createEmptyLine());
      console.log(SimpleUITheme.createContentLine('🚀 ' + chalk.cyan('次のステップ:')));
      console.log(SimpleUITheme.createContentLine('  環境が正常な場合、ディレクトリ選択'));
      console.log(SimpleUITheme.createContentLine('  画面に進みます。'));
      console.log(SimpleUITheme.createEmptyLine());
      console.log(SimpleUITheme.createContentLine('💡 ' + chalk.cyan('メニュー操作:')));
      console.log(SimpleUITheme.createContentLine('  上下矢印キーでメニューを選択'));
      console.log(SimpleUITheme.createContentLine('  Enterキーで決定します'));
    });
  }
  
  // Removed waitForKey - now using inherited method from BaseScreen
}