import chalk from 'chalk';
import { select } from '@inquirer/prompts';
import type { ConversionResult } from './ConversionScreen.js';

export interface ConversionCompleteResult {
  returnToMenu: boolean;
  startWorkflowCreation: boolean;
}

export class ConversionCompleteScreen {
  async show(result: ConversionResult): Promise<ConversionCompleteResult> {
    while (true) {
      console.clear();
      this.showHeader(result);
      this.showConversionInfo(result);
      this.showUsageInfo();
      console.log('└─────────────────────────────────────────┘');
      console.log();
      
      const choices = [
        {
          name: '🔄 新しい変換を実行する',
          value: 'another'
        },
        {
          name: '🚀 ワークフロー作成に進む',
          value: 'workflow'
        },
        {
          name: '📚 ヘルプを表示',
          value: 'help'
        },
        {
          name: '👋 メインメニューに戻る',
          value: 'menu'
        }
      ];
      
      const action = await select({
        message: '変換が完了しました！次のアクションを選択してください:',
        choices
      });
      
      if (action === 'another') {
        return { returnToMenu: false, startWorkflowCreation: false };
      }
      
      if (action === 'workflow') {
        return { returnToMenu: false, startWorkflowCreation: true };
      }
      
      if (action === 'menu') {
        return { returnToMenu: true, startWorkflowCreation: false };
      }
      
      if (action === 'help') {
        this.showHelp();
        await this.waitForKey();
        continue;
      }
    }
  }
  
  private showHeader(result: ConversionResult) {
    if (result.success) {
      console.log(chalk.bold('┌─ ✅ スラッシュコマンド変換完了 ──────────┐'));
      console.log('│                                         │');
      console.log(chalk.green('│            🎉 変換成功！                │'));
    } else {
      console.log(chalk.bold('┌─ ⚠️ スラッシュコマンド変換完了 ───────────┐'));
      console.log('│                                         │');
      console.log(chalk.yellow('│          ⚠️ 変換で問題発生              │'));
    }
    console.log('│                                         │');
  }
  
  private showConversionInfo(result: ConversionResult) {
    console.log('│ 変換結果:                               │');
    console.log('│                                         │');
    
    if (result.success && result.convertedCount > 0) {
      console.log(`│ 成功: ${result.convertedCount.toString().padEnd(30)} │`);
      console.log(`│ 出力先: ${result.targetDirectory.padEnd(25)} │`);
    } else {
      console.log(`│ 失敗: ${result.message.padEnd(29)} │`);
    }
    
    console.log('│                                         │');
    
    if (result.success && result.convertedCount > 0) {
      console.log('│ 生成されたエージェント:                 │');
      console.log(`│ • ${result.targetDirectory}/* にエージェント │`);
      console.log('│   ファイルが保存されました              │');
      console.log('│                                         │');
    }
  }
  
  private showUsageInfo() {
    console.log('│ 次のステップ:                           │');
    console.log('│ • ワークフロー作成機能でエージェントを   │');
    console.log('│   組み合わせて新しいワークフローを作成   │');
    console.log('│ • 変換されたエージェントは既存の         │');
    console.log('│   エージェント選択画面で使用可能です     │');
    console.log('│                                         │');
  }
  
  private showHelp() {
    console.clear();
    console.log(chalk.bold('┌─ 📚 ヘルプ - 変換完了画面 ──────────────┐'));
    console.log('│                                         │');
    console.log('│ 🎉 ' + chalk.cyan('変換完了:') + '                         │');
    console.log('│   スラッシュコマンドがエージェント形式   │');
    console.log('│   に正常に変換されました。               │');
    console.log('│                                         │');
    console.log('│ 🔄 ' + chalk.cyan('新しい変換を実行する:') + '              │');
    console.log('│   別のスラッシュコマンドを変換したい     │');
    console.log('│   場合に選択してください。               │');
    console.log('│                                         │');
    console.log('│ 🚀 ' + chalk.cyan('ワークフロー作成に進む:') + '            │');
    console.log('│   変換されたエージェントを使って         │');
    console.log('│   ワークフローを作成できます。           │');
    console.log('│                                         │');
    console.log('│ 👋 ' + chalk.cyan('メインメニューに戻る:') + '              │');
    console.log('│   CC-Flowのメインメニューに戻ります。    │');
    console.log('│                                         │');
    console.log('│ 💡 ' + chalk.dim('変換されたエージェントについて:') + '     │');
    console.log('│   • .claude/agents/ に保存されています   │');
    console.log('│   • ワークフロー作成で選択可能です       │');
    console.log('│   • 元のスラッシュコマンドは保持されます │');
    console.log('│                                         │');
    console.log('│ 💡 ' + chalk.dim('上下矢印キーで選択、Enterで決定') + '       │');
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