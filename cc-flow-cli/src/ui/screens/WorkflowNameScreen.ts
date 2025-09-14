import chalk from 'chalk';
import { input } from '@inquirer/prompts';
import type { DirectoryInfo } from '../../models/Agent.js';

export class WorkflowNameScreen {
  async show(directory: DirectoryInfo): Promise<string> {
    while (true) {
      console.clear();
      this.showHeader(directory);
      this.showInstructions();
      console.log('└─────────────────────────────────────────┘');
      console.log();
      
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
  
  private showHeader(directory: DirectoryInfo) {
    console.log(chalk.bold('┌─ 📝 ワークフロー名の設定 ───────────────┐'));
    console.log('│                                         │');
    console.log(`│ 📁 対象: ${directory.displayName.padEnd(30)} │`);
    console.log('│                                         │');
  }
  
  private showInstructions() {
    console.log('│ 💡 ワークフロー名を入力してください:     │');
    console.log('│                                         │');
    console.log('│   • 英数字、ハイフン、アンダースコア    │');
    console.log('│   • 例: my-workflow, test_flow          │');
    console.log('│   • 空白でデフォルト名を使用            │');
    console.log('│   • ヘルプ: ' + chalk.cyan('help') + '                    │');
    console.log('│                                         │');
  }
  
  private showHelp() {
    console.clear();
    console.log(chalk.bold('┌─ 📚 ヘルプ - ワークフロー名設定 ─────────┐'));
    console.log('│                                         │');
    console.log('│ 📝 ' + chalk.cyan('ワークフロー名の設定:') + '                │');
    console.log('│   任意の名前を入力してワークフローに    │');
    console.log('│   名前を付けることができます。          │');
    console.log('│                                         │');
    console.log('│ ✅ ' + chalk.cyan('使用可能な文字:') + '                     │');
    console.log('│   • 英数字 (a-z, A-Z, 0-9)             │');
    console.log('│   • ハイフン (-)                        │');
    console.log('│   • アンダースコア (_)                  │');
    console.log('│                                         │');
    console.log('│ 📋 ' + chalk.cyan('例:') + '                                │');
    console.log('│   • ' + chalk.green('my-workflow') + ' → /my-workflow          │');
    console.log('│   • ' + chalk.green('test_flow') + ' → /test_flow              │');
    console.log('│   • ' + chalk.green('project-v1') + ' → /project-v1           │');
    console.log('│                                         │');
    console.log('│ 🎯 ' + chalk.cyan('デフォルト名:') + '                        │');
    console.log('│   空白で Enter を押すとデフォルト名    │');
    console.log('│   が自動的に設定されます。              │');
    console.log('│                                         │');
    console.log('└─────────────────────────────────────────┘');
    console.log(chalk.dim('\nPress any key to continue...'));
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