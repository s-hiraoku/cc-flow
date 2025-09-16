import chalk from 'chalk';
import { select } from '@inquirer/prompts';
import type { Agent, WorkflowConfig } from '../../models/Agent.js';
import { BaseScreen } from './BaseScreen.js';
import { SimpleUITheme } from '../themes/SimpleUITheme.js';

export interface PreviewResult {
  action: 'generate' | 'edit' | 'cancel';
}

export class PreviewScreen extends BaseScreen {
  async show(config: WorkflowConfig): Promise<PreviewResult> {
    while (true) {
      this.showScreenFrame('ワークフロー プレビュー', this.theme.icons.clipboard, () => {
        this.showWorkflowInfo(config);
        this.showExecutionOrder(config);
        this.showGeneratedFiles(config);
      });
      
      const choices = [
        {
          name: '🚀 ワークフローを作成する',
          value: 'generate'
        },
        // {
        //   name: '✏️  設定を編集する',
        //   value: 'edit'
        // },
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
  
  private showWorkflowInfo(config: WorkflowConfig) {
    const workflowName = config.workflowName || this.generateWorkflowName(config.targetPath);
    console.log(SimpleUITheme.createContentLine(`ワークフロー: /${workflowName}`));
    
    if (config.purpose) {
      const purpose = config.purpose.length > 35 ? 
        config.purpose.substring(0, 32) + '...' : config.purpose;
      console.log(SimpleUITheme.createContentLine(`目的: ${purpose}`));
    }
    console.log(SimpleUITheme.createEmptyLine());
  }
  
  private showExecutionOrder(config: WorkflowConfig) {
    console.log(SimpleUITheme.createContentLine('実行順序:'));
    
    config.selectedAgents.forEach((agent, index) => {
      const stepNum = (index + 1).toString();
      const agentName = agent.name.length > 25 ? 
        agent.name.substring(0, 22) + '...' : agent.name;
      const description = agent.description.length > 35 ? 
        agent.description.substring(0, 32) + '...' : agent.description;
      
      console.log(SimpleUITheme.createContentLine(`${stepNum}. ${agentName}`));
      console.log(SimpleUITheme.createContentLine(`   → ${description}`));
    });
    console.log(SimpleUITheme.createEmptyLine());
  }
  
  private showGeneratedFiles(config: WorkflowConfig) {
    const workflowName = config.workflowName || this.generateWorkflowName(config.targetPath);
    console.log(SimpleUITheme.createContentLine('生成されるファイル:'));
    console.log(SimpleUITheme.createContentLine(`• .claude/commands/${workflowName}.md`));
  }
  
  private showHelp() {
    this.showScreenFrame('ヘルプ - プレビュー画面', this.theme.icons.info, () => {
      console.log(SimpleUITheme.createContentLine('🎯 ' + chalk.cyan('プレビュー画面について:')));
      console.log(SimpleUITheme.createContentLine('  ワークフロー設定を確認し、実行前の'));
      console.log(SimpleUITheme.createContentLine('  最終チェックを行います。'));
      console.log(SimpleUITheme.createEmptyLine());
      console.log(SimpleUITheme.createContentLine('🚀 ' + chalk.cyan('ワークフローを作成する:')));
      console.log(SimpleUITheme.createContentLine('  設定内容でワークフローファイルを'));
      console.log(SimpleUITheme.createContentLine('  生成し、使用準備を完了します。'));
      console.log(SimpleUITheme.createEmptyLine());
      console.log(SimpleUITheme.createContentLine('✏️ ' + chalk.cyan('設定を編集する:')));
      console.log(SimpleUITheme.createContentLine('  エージェント選択や実行順序を'));
      console.log(SimpleUITheme.createContentLine('  変更したい場合に選択します。'));
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