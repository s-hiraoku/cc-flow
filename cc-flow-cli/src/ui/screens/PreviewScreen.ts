import chalk from 'chalk';
import { select } from '@inquirer/prompts';
import type { Agent, WorkflowConfig } from '../../models/Agent.js';

export interface PreviewResult {
  action: 'generate' | 'edit' | 'cancel';
}

export class PreviewScreen {
  async show(config: WorkflowConfig): Promise<PreviewResult> {
    while (true) {
      console.clear();
      this.showHeader();
      this.showWorkflowInfo(config);
      this.showExecutionOrder(config);
      this.showGeneratedFiles(config);
      console.log('└─────────────────────────────────────────┘');
      console.log();
      
      const choices = [
        {
          name: '🚀 ワークフローを実行する',
          value: 'generate'
        },
        {
          name: '✏️  設定を編集する',
          value: 'edit'
        },
        {
          name: '📚 ヘルプを表示',
          value: 'help'
        },
        {
          name: '❌ キャンセル',
          value: 'cancel'
        }
      ];
      
      const action = await select({
        message: 'プレビューを確認して操作を選択してください:',
        choices
      });
      
      if (action === 'generate') {
        return { action: 'generate' };
      }
      
      if (action === 'edit') {
        return { action: 'edit' };
      }
      
      if (action === 'cancel') {
        return { action: 'cancel' };
      }
      
      if (action === 'help') {
        this.showHelp();
        await this.waitForKey();
        continue;
      }
    }
  }
  
  private showHeader() {
    console.log(chalk.bold('┌─ 📋 ワークフロー プレビュー ─────────────┐'));
    console.log('│                                         │');
  }
  
  private showWorkflowInfo(config: WorkflowConfig) {
    const workflowName = config.workflowName || this.generateWorkflowName(config.targetPath);
    console.log(`│ ワークフロー: /${workflowName.padEnd(25)} │`);
    
    if (config.purpose) {
      const purpose = config.purpose.length > 30 ? 
        config.purpose.substring(0, 27) + '...' : config.purpose;
      console.log(`│ 目的: ${purpose.padEnd(33)} │`);
    }
    console.log('│                                         │');
  }
  
  private showExecutionOrder(config: WorkflowConfig) {
    console.log('│ 実行順序:                               │');
    
    config.selectedAgents.forEach((agent, index) => {
      const stepNum = (index + 1).toString();
      const agentName = agent.name.length > 20 ? 
        agent.name.substring(0, 17) + '...' : agent.name;
      const description = agent.description.length > 30 ? 
        agent.description.substring(0, 27) + '...' : agent.description;
      
      console.log(`│ ${stepNum}. ${agentName.padEnd(20)} │`);
      console.log(`│    → ${description.padEnd(32)} │`);
    });
    console.log('│                                         │');
  }
  
  private showGeneratedFiles(config: WorkflowConfig) {
    const workflowName = config.workflowName || this.generateWorkflowName(config.targetPath);
    console.log('│ 生成されるファイル:                     │');
    console.log(`│ • .claude/commands/${workflowName}.md     │`);
    console.log('│                                         │');
  }
  
  private showHelp() {
    console.clear();
    console.log(chalk.bold('┌─ 📚 ヘルプ - プレビュー画面 ──────────────┐'));
    console.log('│                                         │');
    console.log('│ 🎯 ' + chalk.cyan('プレビュー画面について:') + '               │');
    console.log('│   ワークフロー設定を確認し、実行前の     │');
    console.log('│   最終チェックを行います。               │');
    console.log('│                                         │');
    console.log('│ 🚀 ' + chalk.cyan('ワークフローを実行する:') + '               │');
    console.log('│   設定内容でワークフローファイルを       │');
    console.log('│   生成し、実行準備を完了します。         │');
    console.log('│                                         │');
    console.log('│ ✏️ ' + chalk.cyan('設定を編集する:') + '                     │');
    console.log('│   エージェント選択や実行順序を           │');
    console.log('│   変更したい場合に選択します。           │');
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