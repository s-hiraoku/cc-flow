import chalk from 'chalk';
import { select } from '@inquirer/prompts';
import type { WorkflowConfig } from '../../models/Agent.js';

export interface CompleteResult {
  createAnother: boolean;
}

export class CompleteScreen {
  async show(config: WorkflowConfig): Promise<CompleteResult> {
    while (true) {
      console.clear();
      this.showHeader();
      this.showSuccessInfo(config);
      this.showExecutionFlow(config);
      console.log('└─────────────────────────────────────────┘');
      console.log();
      
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
  
  private showHeader() {
    console.log(chalk.bold('┌─ ✅ ワークフロー作成完了 ────────────────┐'));
    console.log('│                                         │');
    console.log(chalk.green('│            🎉 成功しました！             │'));
    console.log('│                                         │');
  }
  
  private showSuccessInfo(config: WorkflowConfig) {
    console.log('│ ワークフローが作成されました:           │');
    console.log('│                                         │');
    
    const workflowName = config.workflowName || this.generateWorkflowName(config.targetPath);
    console.log(`│ コマンド: /${workflowName.padEnd(25)} │`);
    
    console.log('│ 生成されたファイル:                     │');
    console.log(`│ • .claude/commands/${workflowName}.md     │`);
    console.log('│                                         │');
    console.log('│ 使用方法:                               │');
    console.log(`│ /${workflowName} "タスクの内容"           │`);
    console.log('│                                         │');
  }
  
  private showExecutionFlow(config: WorkflowConfig) {
    console.log('│ 実行フロー:                             │');
    config.selectedAgents.forEach((agent, index) => {
      console.log(`│   ${index + 1}. ${agent.name.padEnd(31)} │`);
    });
    console.log('│                                         │');
  }
  
  private showHelp() {
    console.clear();
    console.log(chalk.bold('┌─ 📚 ヘルプ - 完了画面 ──────────────────┐'));
    console.log('│                                         │');
    console.log('│ 🎉 ' + chalk.cyan('ワークフロー作成完了:') + '                │');
    console.log('│   ワークフローファイルが正常に生成され、 │');
    console.log('│   使用準備が完了しました。               │');
    console.log('│                                         │');
    console.log('│ 🔄 ' + chalk.cyan('新しいワークフローを作成する:') + '        │');
    console.log('│   別のワークフローを作成したい場合に     │');
    console.log('│   選択してください。                     │');
    console.log('│                                         │');
    console.log('│ 👋 ' + chalk.cyan('アプリケーションを終了:') + '              │');
    console.log('│   CC-Flowアプリケーションを終了します。  │');
    console.log('│   作成されたワークフローはそのまま       │');
    console.log('│   使用できます。                         │');
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
  
  private generateWorkflowName(targetPath: string): string {
    if (targetPath === './agents') {
      return 'all-workflow';
    }
    
    const pathParts = targetPath.split('/');
    const dirName = pathParts[pathParts.length - 1];
    return `${dirName}-workflow`;
  }
}