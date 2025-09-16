import chalk from 'chalk';
import { select } from '@inquirer/prompts';
import type { WorkflowConfig } from '../../models/Agent.js';
import { BaseScreen } from './BaseScreen.js';
import { SimpleUITheme } from '../themes/SimpleUITheme.js';

export interface CompleteResult {
  createAnother: boolean;
}

export class CompleteScreen extends BaseScreen {
  async show(config: WorkflowConfig): Promise<CompleteResult> {
    while (true) {
      this.showScreenFrame('ワークフロー作成完了', this.theme.icons.success, () => {
        console.log(SimpleUITheme.createContentLine(chalk.green('🎉 成功しました！')));
        console.log(SimpleUITheme.createEmptyLine());
        this.showSuccessInfo(config);
        this.showExecutionFlow(config);
      });
      
      const choices = [
        {
          name: '🔄 新しいワークフローを作成する',
          value: 'another'
        },
        {
          name: '📚 ヘルプを表示',
          value: 'help'
        },
        {
          name: '👋 アプリケーションを終了',
          value: 'quit'
        }
      ];
      
      const action = await select({
        message: 'ワークフロー作成が完了しました！次のアクションを選択してください:',
        choices
      });
      
      if (action === 'another') {
        return { createAnother: true };
      }
      
      if (action === 'quit') {
        return { createAnother: false };
      }
      
      if (action === 'help') {
        this.showHelp();
        await this.waitForKey();
        continue;
      }
    }
  }
  
  private showSuccessInfo(config: WorkflowConfig) {
    const workflowName = config.workflowName || this.generateWorkflowName(config.targetPath);
    
    console.log(SimpleUITheme.createContentLine('ワークフローが作成されました:'));
    console.log(SimpleUITheme.createEmptyLine());
    console.log(SimpleUITheme.createContentLine(`コマンド: /${workflowName}`));
    console.log(SimpleUITheme.createEmptyLine());
    console.log(SimpleUITheme.createContentLine('生成されたファイル:'));
    console.log(SimpleUITheme.createContentLine(`• .claude/commands/${workflowName}.md`));
    console.log(SimpleUITheme.createEmptyLine());
    console.log(SimpleUITheme.createContentLine('使用方法:'));
    console.log(SimpleUITheme.createContentLine(`/${workflowName} "タスクの内容"`));
    console.log(SimpleUITheme.createEmptyLine());
  }
  
  private showExecutionFlow(config: WorkflowConfig) {
    console.log(SimpleUITheme.createContentLine('実行フロー:'));
    config.selectedAgents.forEach((agent, index) => {
      console.log(SimpleUITheme.createContentLine(`  ${index + 1}. ${agent.name}`));
    });
  }
  
  private showHelp() {
    this.showScreenFrame('ヘルプ - 完了画面', this.theme.icons.info, () => {
      console.log(SimpleUITheme.createContentLine('🎉 ' + chalk.cyan('ワークフロー作成完了:')));
      console.log(SimpleUITheme.createContentLine('  ワークフローファイルが正常に生成され、'));
      console.log(SimpleUITheme.createContentLine('  使用準備が完了しました。'));
      console.log(SimpleUITheme.createEmptyLine());
      console.log(SimpleUITheme.createContentLine('🔄 ' + chalk.cyan('新しいワークフローを作成する:')));
      console.log(SimpleUITheme.createContentLine('  別のワークフローを作成したい場合に'));
      console.log(SimpleUITheme.createContentLine('  選択してください。'));
      console.log(SimpleUITheme.createEmptyLine());
      console.log(SimpleUITheme.createContentLine('👋 ' + chalk.cyan('アプリケーションを終了:')));
      console.log(SimpleUITheme.createContentLine('  CC-Flowアプリケーションを終了します。'));
      console.log(SimpleUITheme.createContentLine('  作成されたワークフローはそのまま'));
      console.log(SimpleUITheme.createContentLine('  使用できます。'));
      console.log(SimpleUITheme.createEmptyLine());
      console.log(SimpleUITheme.createContentLine('💡 ' + chalk.dim('上下矢印キーで選択、Enterで決定')));
    });
  }
  
  private generateWorkflowName(targetPath: string): string {
    if (targetPath === './agents') {
      return 'all-workflow';
    }
    
    const pathParts = targetPath.split('/');
    const dirName = pathParts[pathParts.length - 1];
    return `${dirName}-workflow`;
  }
}