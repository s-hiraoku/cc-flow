import { checkbox, confirm, select } from '@inquirer/prompts';
import chalk from 'chalk';
import { BaseScreen } from './BaseScreen.js';
import { KeyboardHelper } from '../components/TUIComponents.js';
import { ShellExecutor } from '../../services/ShellExecutor.js';

interface ConversionCommand {
  name: string;
  path: string;
  category: string;
}

interface ConversionOptions {
  outputDir: string;
  templateFile: string;
  validateAfterConversion: boolean;
}

export interface ConversionResult {
  success: boolean;
  convertedCount: number;
  targetDirectory: string;
  message: string;
}

export class ConversionScreen extends BaseScreen {
  private commands: ConversionCommand[] = [];
  private selectedCommands: string[] = [];
  private conversionOptions: ConversionOptions = {
    outputDir: '.claude/agents',
    templateFile: 'templates/agent-template.md',
    validateAfterConversion: true
  };

  constructor() {
    super();
  }

  async show(): Promise<ConversionResult> {
    try {
      console.clear();
      this.showHeader();
      
      // 日本語入力強制リセット
      KeyboardHelper.forceEnglishInput();

      // ステップ1: コマンド検索
      const searchResult = await this.searchForCommands();
      if (!searchResult) {
        return {
          success: false,
          convertedCount: 0,
          targetDirectory: '',
          message: 'コマンドの検索に失敗しました'
        };
      }

      // ステップ2: コマンド選択
      const selectionResult = await this.selectCommandsForConversion();
      if (!selectionResult) {
        return {
          success: false,
          convertedCount: 0,
          targetDirectory: '',
          message: 'コマンドの選択がキャンセルされました'
        };
      }

      // ステップ3: 変換設定
      const configResult = await this.configureConversion();
      if (!configResult) {
        return {
          success: false,
          convertedCount: 0,
          targetDirectory: '',
          message: '変換設定がキャンセルされました'
        };
      }

      // ステップ4: 変換実行
      return await this.executeConversion();

    } catch (error) {
      console.error(chalk.red('❌ エラーが発生しました:'), error);
      return {
        success: false,
        convertedCount: 0,
        targetDirectory: '',
        message: `エラー: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  private showHeader(): void {
    console.log(chalk.cyan.bold('┌─ 🔄 スラッシュコマンド → エージェント変換 ─────┐'));
    console.log(chalk.cyan('│' + ' '.repeat(47) + '│'));
    console.log(chalk.cyan('│') + '  カスタムスラッシュコマンドをサブエージェント  ' + chalk.cyan('│'));
    console.log(chalk.cyan('│') + '  形式に変換し、ワークフロー作成で使用可能に    ' + chalk.cyan('│'));
    console.log(chalk.cyan('│') + '  します。                                    ' + chalk.cyan('│'));
    console.log(chalk.cyan('│' + ' '.repeat(47) + '│'));
    console.log(chalk.cyan('└' + '─'.repeat(47) + '┘'));
    console.log();
  }

  private async searchForCommands(): Promise<boolean> {
    try {
      console.log(chalk.yellow('🔍 ステップ1: コマンド検索中...'));
      console.log();

      // 利用可能なディレクトリを検索
      const directories = await this.findCommandDirectories();
      
      if (directories.length === 0) {
        console.log(chalk.red('❌ .claude/commands/ にコマンドディレクトリが見つかりません'));
        return false;
      }

      // ディレクトリ選択
      const selectedDirectory = await select({
        message: '変換対象のディレクトリを選択してください:',
        choices: [
          ...directories.map((dir: string) => ({
            name: `📂 ${dir}`,
            value: dir
          })),
          {
            name: '📂 all (全ディレクトリ)',
            value: 'all'
          }
        ],
        theme: {
          prefix: {
            idle: '> ',
            done: '✅'
          }
        }
      });

      // 選択されたディレクトリのコマンドを検索
      this.commands = await this.discoverCommandsInDirectory(selectedDirectory);
      
      if (this.commands.length === 0) {
        console.log(chalk.red(`❌ ${selectedDirectory} にコマンドが見つかりません`));
        return false;
      }

      console.log(chalk.green(`✅ ${this.commands.length} 個のコマンドを発見しました`));
      return true;

    } catch (error) {
      console.error(chalk.red('❌ コマンド検索でエラーが発生しました:'), error);
      return false;
    }
  }

  private async findCommandDirectories(): Promise<string[]> {
    try {
      const result = await ShellExecutor.execute('find .claude/commands -type d -mindepth 1 -maxdepth 1 -exec basename {} \\;');
      return result.stdout.trim().split('\n').filter(dir => dir.trim() !== '');
    } catch {
      return [];
    }
  }

  private async discoverCommandsInDirectory(directory: string): Promise<ConversionCommand[]> {
    try {
      const searchPath = directory === 'all' ? '.claude/commands' : `.claude/commands/${directory}`;
      const result = await ShellExecutor.execute(`find ${searchPath} -name "*.md" -type f`);
      
      console.log(chalk.gray(`デバッグ: 検索パス = ${searchPath}`));
      console.log(chalk.gray(`デバッグ: 結果 = ${result.stdout}`));
      
      if (!result.stdout.trim()) {
        return [];
      }

      const commandPaths = result.stdout.trim().split('\n');
      const commands: ConversionCommand[] = [];

      for (const path of commandPaths) {
        const name = path.split('/').pop()?.replace('.md', '') || '';
        const category = path.split('/').slice(-2, -1)[0] || '';
        
        console.log(chalk.gray(`デバッグ: パス=${path}, 名前=${name}, カテゴリ=${category}`));
        
        commands.push({
          name,
          path,
          category
        });
      }

      console.log(chalk.gray(`デバッグ: 発見されたコマンド数 = ${commands.length}`));
      return commands;
    } catch (error) {
      console.log(chalk.red(`デバッグ: エラー = ${error}`));
      return [];
    }
  }

  private async selectCommandsForConversion(): Promise<boolean> {
    try {
      console.log();
      console.log(chalk.yellow('📋 ステップ2: 変換対象コマンドの選択'));
      console.log();

      const choices = this.commands.map(cmd => ({
        name: `${this.getCategoryIcon(cmd.category)} ${cmd.name}`,
        value: cmd.name
      }));

      this.selectedCommands = await checkbox({
        message: '変換するコマンドを選択してください (↑↓で移動、スペースで選択):',
        choices,
        required: true,
        theme: {
          prefix: {
            idle: '> ',
            done: '✅'
          }
        }
      });

      console.log(chalk.green(`✅ ${this.selectedCommands.length} 個のコマンドを選択しました`));
      return true;

    } catch (error) {
      if (error instanceof Error && error.message.includes('User force closed')) {
        return false;
      }
      throw error;
    }
  }

  private getCategoryIcon(category: string): string {
    switch (category) {
      case 'utility': return '⚙️';
      case 'workflow': return '🚀';
      case 'analysis': return '📊';
      case 'generation': return '🏗️';
      case 'demo': return '🎯';
      default: return '📝';
    }
  }

  private async configureConversion(): Promise<boolean> {
    try {
      console.log();
      console.log(chalk.yellow('🎯 ステップ3: 変換設定'));
      console.log();

      console.log(chalk.gray('現在の設定:'));
      console.log(chalk.gray(`  出力先: ${this.conversionOptions.outputDir}`));
      console.log(chalk.gray(`  テンプレート: ${this.conversionOptions.templateFile}`));
      console.log(chalk.gray(`  検証: ${this.conversionOptions.validateAfterConversion ? '有効' : '無効'}`));
      console.log();

      const proceed = await confirm({
        message: '変換を実行しますか？',
        default: true
      });

      return proceed;

    } catch (error) {
      if (error instanceof Error && error.message.includes('User force closed')) {
        return false;
      }
      throw error;
    }
  }

  private async executeConversion(): Promise<ConversionResult> {
    try {
      console.log();
      console.log(chalk.yellow('🚀 ステップ4: 変換実行'));
      console.log();

      console.log(chalk.blue('🔄 変換処理を実行中...'));
      
      let convertedCount = 0;
      let hasErrors = false;

      // 各コマンドを個別に変換
      for (const commandName of this.selectedCommands) {
        const command = this.commands.find(cmd => cmd.name === commandName);
        if (!command) continue;

        try {
          console.log(chalk.gray(`  🔄 ${commandName} を変換中...`));
          
          // 出力ディレクトリを作成
          const targetDir = `${this.conversionOptions.outputDir}/${command.category}`;
          await ShellExecutor.execute(`mkdir -p ${targetDir}`);
          
          // convert-command.shを使用してスラッシュコマンドをエージェントに変換
          const result = await ShellExecutor.execute(
            `./scripts/convert-command.sh "${command.path}" "${targetDir}" "${this.conversionOptions.templateFile}"`,
            { timeout: 30000 }
          );

          if (result.code === 0) {
            console.log(chalk.green(`    ✅ ${commandName} 変換完了`));
            convertedCount++;
          } else {
            console.log(chalk.red(`    ❌ ${commandName} 変換失敗: ${result.stderr}`));
            hasErrors = true;
          }
        } catch (error) {
          console.log(chalk.red(`    ❌ ${commandName} でエラー: ${error}`));
          hasErrors = true;
        }
      }

      console.log();
      console.log(chalk.green.bold('📊 変換結果:'));
      console.log(chalk.green(`   ✅ 成功: ${convertedCount}`));
      console.log(chalk.red(`   ❌ 失敗: ${this.selectedCommands.length - convertedCount}`));
      console.log(chalk.blue(`   📁 出力先: ${this.conversionOptions.outputDir}`));
      
      if (convertedCount > 0) {
        console.log();
        console.log(chalk.green.bold('🎉 変換完了！'));
        console.log(chalk.gray('変換されたエージェントは既存のワークフロー作成機能で使用できます。'));
      }

      return {
        success: convertedCount > 0,
        convertedCount,
        targetDirectory: this.conversionOptions.outputDir,
        message: hasErrors ? '一部のコマンドでエラーが発生しました' : '変換が正常に完了しました'
      };

    } catch (error) {
      console.error(chalk.red('❌ 変換実行でエラーが発生しました:'), error);
      return {
        success: false,
        convertedCount: 0,
        targetDirectory: '',
        message: `変換エラー: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
}