import chalk from 'chalk';
import { select } from '@inquirer/prompts';
import type { ConversionResult } from './ConversionScreen.js';
import { BaseScreen } from './BaseScreen.js';
import { SimpleUITheme } from '../themes/SimpleUITheme.js';

export interface ConversionCompleteResult {
  returnToMenu: boolean;
  startWorkflowCreation: boolean;
}

export class ConversionCompleteScreen extends BaseScreen {
  async show(result: ConversionResult): Promise<ConversionCompleteResult> {
    while (true) {
      const title = result.success ? 'スラッシュコマンド変換完了' : 'スラッシュコマンド変換完了';
      const icon = result.success ? this.theme.icons.success : '⚠️';
      
      this.showScreenFrame(title, icon, () => {
        this.showConversionInfo(result);
        this.showUsageInfo();
      });
      
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
  
  private showConversionInfo(result: ConversionResult) {
    if (result.success) {
      console.log(SimpleUITheme.createContentLine(chalk.green('🎉 変換成功！')));
    } else {
      console.log(SimpleUITheme.createContentLine(chalk.yellow('⚠️ 変換で問題発生')));
    }
    console.log(SimpleUITheme.createEmptyLine());
    
    console.log(SimpleUITheme.createContentLine('変換結果:'));
    console.log(SimpleUITheme.createEmptyLine());
    
    if (result.success && result.convertedCount > 0) {
      console.log(SimpleUITheme.createContentLine(`成功: ${result.convertedCount}個のコマンド`));
      console.log(SimpleUITheme.createContentLine(`出力先: ${result.targetDirectory}`));
    } else {
      console.log(SimpleUITheme.createContentLine(`失敗: ${result.message}`));
    }
    
    console.log(SimpleUITheme.createEmptyLine());
    
    if (result.success && result.convertedCount > 0) {
      console.log(SimpleUITheme.createContentLine('生成されたエージェント:'));
      console.log(SimpleUITheme.createContentLine(`• ${result.targetDirectory}/* にエージェント`));
      console.log(SimpleUITheme.createContentLine('  ファイルが保存されました'));
      console.log(SimpleUITheme.createEmptyLine());
    }
  }
  
  private showUsageInfo() {
    console.log(SimpleUITheme.createContentLine('次のステップ:'));
    console.log(SimpleUITheme.createContentLine('• ワークフロー作成機能でエージェントを'));
    console.log(SimpleUITheme.createContentLine('  組み合わせて新しいワークフローを作成'));
    console.log(SimpleUITheme.createContentLine('• 変換されたエージェントは既存の'));
    console.log(SimpleUITheme.createContentLine('  エージェント選択画面で使用可能です'));
  }
  
  private showHelp() {
    this.showScreenFrame('ヘルプ - 変換完了画面', this.theme.icons.info, () => {
      console.log(SimpleUITheme.createContentLine('🎉 ' + chalk.cyan('変換完了:')));
      console.log(SimpleUITheme.createContentLine('  スラッシュコマンドがエージェント形式'));
      console.log(SimpleUITheme.createContentLine('  に正常に変換されました。'));
      console.log(SimpleUITheme.createEmptyLine());
      console.log(SimpleUITheme.createContentLine('🔄 ' + chalk.cyan('新しい変換を実行する:')));
      console.log(SimpleUITheme.createContentLine('  別のスラッシュコマンドを変換したい'));
      console.log(SimpleUITheme.createContentLine('  場合に選択してください。'));
      console.log(SimpleUITheme.createEmptyLine());
      console.log(SimpleUITheme.createContentLine('🚀 ' + chalk.cyan('ワークフロー作成に進む:')));
      console.log(SimpleUITheme.createContentLine('  変換されたエージェントを使って'));
      console.log(SimpleUITheme.createContentLine('  ワークフローを作成できます。'));
      console.log(SimpleUITheme.createEmptyLine());
      console.log(SimpleUITheme.createContentLine('👋 ' + chalk.cyan('メインメニューに戻る:')));
      console.log(SimpleUITheme.createContentLine('  CC-Flowのメインメニューに戻ります。'));
      console.log(SimpleUITheme.createEmptyLine());
      console.log(SimpleUITheme.createContentLine('💡 ' + chalk.dim('変換されたエージェントについて:')));
      console.log(SimpleUITheme.createContentLine('  • .claude/agents/ に保存されています'));
      console.log(SimpleUITheme.createContentLine('  • ワークフロー作成で選択可能です'));
      console.log(SimpleUITheme.createContentLine('  • 元のスラッシュコマンドは保持されます'));
      console.log(SimpleUITheme.createEmptyLine());
      console.log(SimpleUITheme.createContentLine('💡 ' + chalk.dim('上下矢印キーで選択、Enterで決定')));
    });
  }
}