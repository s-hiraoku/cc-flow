import { execFileSync, type ExecSyncOptions } from 'child_process';
import { join, dirname, resolve } from 'path';
import { existsSync } from 'fs';
import { tmpdir } from 'os';
import { writeFileSync, unlinkSync, mkdtempSync } from 'fs';

import { createRequire } from 'module';
import type { WorkflowConfig } from '../models/Agent.js';
import { CLIError } from '../utils/ErrorHandler.js';

export class ScriptExecutor {
  private basePath: string;

  constructor(basePath: string = process.cwd()) {
    this.basePath = basePath;
  }

  async executeWorkflowCreation(config: WorkflowConfig): Promise<void> {
    // 1. cc-flow-coreスクリプトのパスを取得
    const scriptPath = this.getCoreScriptPath();
    
    // 2. 絶対パスに変換
    const agentsDir = this.resolveAgentsDir(config.targetPath);
    const commandsDir = this.resolveCommandsDir();
    
    // 3. JSONファイルを作成
    const tempJsonFile = this.createWorkflowConfigJson(config);
    
    try {
      // 4. スクリプト実行（絶対パスを渡す）
      const commandArgs = [
        scriptPath,
        agentsDir,
        commandsDir,
        '--steps-json',
        tempJsonFile
      ];

      console.log('🚀 Executing workflow creation:');
      console.log(`   Script: ${scriptPath}`);
      console.log(`   Agents: ${agentsDir}`);
      console.log(`   Output: ${commandsDir}`);
      console.log(`   Config: ${tempJsonFile}`);
      console.log(`   Command: bash ${commandArgs.map(arg => `"${arg}"`).join(' ')}`);
      console.log('');
      console.log('⏳ Starting script execution...');

      // Windows対応: Git Bashが必要
      // Windows環境では、Git for Windowsのインストールを推奨
      if (process.platform === 'win32') {
        // Windowsの場合、shellオプションを使ってシステムシェル経由で実行
        const { execSync } = await import('child_process');
        const command = `bash ${commandArgs.map(arg => `"${arg.replace(/"/g, '\\"')}"`).join(' ')}`;
        execSync(command, {
          cwd: this.basePath,
          stdio: 'inherit',
          timeout: 30000,
          env: { ...process.env, VERBOSE: '1' }
        });
      } else {
        // Unix系OSでは直接bashを実行
        execFileSync('bash', commandArgs, {
          cwd: this.basePath,
          stdio: 'inherit',
          timeout: 30000,
          env: { ...process.env, VERBOSE: '1' }
        });
      }

      console.log('✅ Script execution completed');
      
    } finally {
      // 5. 一時ファイルを削除
      this.cleanupTempFile(tempJsonFile);
    }
  }
  
  private getCoreScriptPath(): string {
    const require = createRequire(import.meta.url);
    
    try {
      // cc-flow-coreパッケージのパスを解決
      const pkgPath = require.resolve('@hiraoku/cc-flow-core/package.json');
      const coreRoot = dirname(pkgPath);
      
      // workflow/create-workflow.sh のパス
      const scriptPath = join(coreRoot, 'workflow/create-workflow.sh');
      
      if (!existsSync(scriptPath)) {
        throw new CLIError(
          'cc-flow-core script not found',
          { 
            operation: 'script-resolution', 
            component: 'ScriptExecutor',
            details: { scriptPath } 
          }
        );
      }
      
      return scriptPath;
    } catch (error) {
      throw new CLIError(
        '@hiraoku/cc-flow-core package not found. Please run: npm install',
        { 
          operation: 'package-resolution',
          component: 'ScriptExecutor'
        },
        error instanceof Error ? error : undefined
      );
    }
  }
  
  private resolveAgentsDir(targetPath: string): string {
    // targetPath例: './agents/spec', './agents', '.claude/agents/demo'
    
    // "./" プレフィックスを除去
    const cleaned = targetPath.replace(/^\.\//, '');
    
    // ".claude" が含まれている場合はそのまま
    if (cleaned.startsWith('.claude/')) {
      return resolve(this.basePath, cleaned);
    }
    
    // "agents/*" 形式の場合は ".claude/agents/*" に変換
    if (cleaned.startsWith('agents')) {
      return resolve(this.basePath, '.claude', cleaned);
    }
    
    // その他はそのまま解決
    return resolve(this.basePath, targetPath);
  }
  
  private resolveCommandsDir(): string {
    return resolve(this.basePath, '.claude/commands');
  }
  
  private createWorkflowConfigJson(config: WorkflowConfig): string {
    // Create a secure temporary directory with restrictive permissions (0700)
    const tempDir = mkdtempSync(join(tmpdir(), 'cc-flow-'));
    const tempFile = join(tempDir, 'config.json');

    const workflowConfig = {
      workflowName: config.workflowName || this.generateDefaultWorkflowName(config.targetPath),
      workflowPurpose: config.purpose || 'Custom workflow',
      workflowModel: config.environment || 'claude-sonnet-4-5-20250929',
      workflowArgumentHint: '<context>',
      workflowSteps: this.buildWorkflowSteps(config)
    };

    writeFileSync(tempFile, JSON.stringify(workflowConfig, null, 2), { mode: 0o600, encoding: 'utf8' });

    console.log('📝 Workflow configuration:');
    console.log(JSON.stringify(workflowConfig, null, 2));

    return tempFile;
  }
  
  private buildWorkflowSteps(config: WorkflowConfig): Array<{
    title: string;
    mode: string;
    purpose: string;
    agents: string[];
  }> {
    const agents = config.selectedAgents || [];
    
    return [{
      title: 'Main Flow',
      mode: 'sequential',
      purpose: config.purpose || 'Execute workflow',
      agents: agents.map(a => a.name)
    }];
  }
  
  private cleanupTempFile(tempFile: string): void {
    
    try {
      if (existsSync(tempFile)) {
        unlinkSync(tempFile);
        console.log('🗑️  Cleaned up temp file');
      }
    } catch (error) {
      console.warn('Failed to cleanup temp file:', tempFile);
    }
  }
  
  private generateDefaultWorkflowName(targetPath: string): string {
    // './agents' → 'all-workflow'
    // './agents/spec' → 'spec-workflow'
    // '.claude/agents/demo' → 'demo-workflow'
    
    const cleaned = targetPath.replace(/^\.\//, '').replace(/^\.claude\//, '');
    
    if (cleaned === 'agents') {
      return 'all-workflow';
    }
    
    const parts = cleaned.split('/');
    const dirName = parts[parts.length - 1];
    return `${dirName}-workflow`;
  }
  
  /**
   * Comprehensive environment validation
   */
  async validateEnvironment(): Promise<void> {
    try {
      this.getCoreScriptPath();
    } catch (error) {
      throw new CLIError(
        'cc-flow-core is not installed or script is missing',
        { 
          operation: 'environment-validation',
          component: 'ScriptExecutor',
          details: { 
            suggestion: 'Run: npm install @hiraoku/cc-flow-core' 
          }
        },
        error instanceof Error ? error : undefined
      );
    }
  }
  
  /**
   * Test if the create-workflow.sh script exists and is executable
   * @deprecated Use validateEnvironment() instead
   */
  async validateScriptEnvironment(): Promise<boolean> {
    try {
      await this.validateEnvironment();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get available workflow creation options by testing the script
   */
  async getScriptUsage(): Promise<string> {
    await this.validateEnvironment();
    
    const scriptPath = this.getCoreScriptPath();
    const execOptions: ExecSyncOptions = {
      cwd: this.basePath,
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 5000
    };
    
    try {
      const output = execFileSync('bash', [scriptPath, '--help'], execOptions);
      return output.toString();
    } catch (error) {
      // The script may return usage info in stderr when called without arguments
      const execError = error as { stdout?: Buffer; stderr?: Buffer; message?: string };
      const output = execError.stdout || execError.stderr;
      if (output) {
        return output.toString();
      }

      throw new CLIError(
        'Failed to get script usage information',
        {
          operation: 'script-usage',
          component: 'ScriptExecutor',
          details: { scriptPath }
        },
        error instanceof Error ? error : undefined
      );
    }
  }
}
