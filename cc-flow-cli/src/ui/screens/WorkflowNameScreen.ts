import chalk from 'chalk';
import { input } from '@inquirer/prompts';
import type { DirectoryInfo } from '../../models/Agent.js';
import { BaseScreen } from './BaseScreen.js';

export class WorkflowNameScreen extends BaseScreen {
  constructor() {
    super();
  }
  async show(directory: DirectoryInfo): Promise<string | null> {
    while (true) {
      this.showScreenFrame(`ワークフロー名入力 - ${directory.displayName}`, this.theme.icons.edit, () => {
        this.showInstructions();
      });
      
      const userInput = await input({
        message: 'ワークフロー名を入力:\n> ',
        theme: {
          prefix: '',
        }
      });
      
      const workflowName = userInput.trim();
      
      if (workflowName === 'help' || workflowName === 'h') {
        this.showHelp();
        await this.waitForKey();
        continue;
      }
      
      // Check if user wants to go back using BaseScreen method
      if (this.isBackNavigation(workflowName)) {
        return null;
      }
      
      if (workflowName === '') {
        // デフォルト名を生成
        return this.generateDefaultName(directory);
      }
      
      // ワークフロー名のバリデーション
      if (this.isValidWorkflowName(workflowName)) {
        return workflowName;
      } else {
        console.log(chalk.red('\n❌ 無効なワークフロー名です'));
        console.log(chalk.yellow('   英数字、ハイフン、アンダースコアのみ使用可能'));
        console.log(chalk.dim('   Press any key to continue...'));
        await this.waitForKey();
        continue;
      }
    }
  }
  
  // Removed showHeader method - now using SimpleUITheme.createHeader()
  
  private showInstructions() {
    console.log(this.theme.createContentLine('💡 ワークフロー名を入力してください:'));
    console.log(this.theme.createEmptyLine());
    console.log(this.theme.createContentLine('  • 英数字、ハイフン、アンダースコア'));
    console.log(this.theme.createContentLine('  • 例: my-workflow, test_flow'));
    console.log(this.theme.createContentLine('  • 空白でデフォルト名を使用'));
    console.log(this.theme.createContentLine(`  • ヘルプ: ${this.theme.colors.accent('help')}`));
    console.log(this.theme.createContentLine(`  • 前に戻る: ${this.theme.colors.accent('back')} または ${this.theme.colors.accent('b')}`));
    console.log(this.theme.createEmptyLine());
  }
  
  private showHelp() {
    this.showScreenFrame('ヘルプ - ワークフロー名設定', this.theme.icons.info, () => {
      console.log(this.theme.createContentLine(this.theme.colors.accent('📝 ワークフロー名の設定:')));
      console.log(this.theme.createContentLine('  任意の名前を入力してワークフローに'));
      console.log(this.theme.createContentLine('  名前を付けることができます。'));
      console.log(this.theme.createEmptyLine());
      console.log(this.theme.createContentLine(this.theme.colors.accent('✅ 使用可能な文字:')));
      console.log(this.theme.createContentLine('  • 英数字 (a-z, A-Z, 0-9)'));
      console.log(this.theme.createContentLine('  • ハイフン (-)'));
      console.log(this.theme.createContentLine('  • アンダースコア (_)'));
      console.log(this.theme.createEmptyLine());
      console.log(this.theme.createContentLine(this.theme.colors.accent('📋 例:')));
      console.log(this.theme.createContentLine(`  • ${this.theme.colors.success('my-workflow')} → /my-workflow`));
      console.log(this.theme.createContentLine(`  • ${this.theme.colors.success('test_flow')} → /test_flow`));
      console.log(this.theme.createContentLine(`  • ${this.theme.colors.success('project-v1')} → /project-v1`));
      console.log(this.theme.createEmptyLine());
      console.log(this.theme.createContentLine(this.theme.colors.accent('🎯 デフォルト名:')));
      console.log(this.theme.createContentLine('  空白で Enter を押すとデフォルト名'));
      console.log(this.theme.createContentLine('  が自動的に設定されます。'));
    });
    console.log(chalk.blue('Enterキーで戻る...'));
  }
  
  private isValidWorkflowName(name: string): boolean {
    // 英数字、ハイフン、アンダースコアのみ許可
    const regex = /^[a-zA-Z0-9_-]+$/;
    return regex.test(name) && name.length > 0 && name.length <= 50;
  }
  
  private generateDefaultName(directory: DirectoryInfo): string {
    if (directory.path === './agents') {
      return 'all-workflow';
    }
    return `${directory.displayName}-workflow`;
  }
  
  // Removed waitForKey - now using inherited method from BaseScreen
}