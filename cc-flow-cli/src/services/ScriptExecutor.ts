import { execSync, type ExecSyncOptions } from 'child_process';
import { join } from 'path';
import { existsSync, accessSync, constants } from 'fs';
import type { WorkflowConfig } from '../models/Agent.js';
import { CLIError } from '../utils/ErrorHandler.js';

export class ScriptExecutor {
  private basePath: string;

  constructor(basePath: string = process.cwd()) {
    this.basePath = basePath;
  }

  async executeWorkflowCreation(config: WorkflowConfig): Promise<void> {
    const { targetPath, workflowName, selectedAgents } = config;
    
    // Validate environment before execution
    await this.validateEnvironment();
    
    const scriptPath = this.getScriptPath();
    const agentNames = selectedAgents.map(agent => agent.name).join(',');
    const finalWorkflowName = workflowName || this.generateDefaultWorkflowName(targetPath);
    
    // Set environment variable for workflow name
    process.env['WORKFLOW_NAME'] = finalWorkflowName;
    
    const command = `"${scriptPath}" "${targetPath}" "${agentNames}"`;
    
    console.log(`\nExecuting: ${command}`);
    
    const execOptions: ExecSyncOptions = {
      cwd: this.basePath,
      stdio: 'inherit',
      encoding: 'utf8',
      timeout: 30000 // 30 second timeout
    };
    
    try {
      execSync(command, execOptions);
    } catch (error) {
      throw new CLIError(
        'Workflow creation script execution failed',
        {
          operation: 'script-execution',
          component: 'ScriptExecutor',
          details: {
            command,
            config,
            error: error instanceof Error ? error.message : String(error)
          }
        },
        error instanceof Error ? error : undefined
      );
    }
  }

  private getScriptPath(): string {
    // Path to the create-workflow.sh script relative to user's project root
    return join(this.basePath, 'scripts/create-workflow.sh');
  }

  private generateDefaultWorkflowName(targetPath: string): string {
    if (targetPath === './agents') {
      return 'all-workflow';
    }
    
    const pathParts = targetPath.split('/');
    const dirName = pathParts[pathParts.length - 1];
    return `${dirName}-workflow`;
  }

  /**
   * Comprehensive environment validation
   */
  private async validateEnvironment(): Promise<void> {
    const scriptPath = this.getScriptPath();
    
    // Check if script file exists
    if (!existsSync(scriptPath)) {
      throw new CLIError(
        `Workflow creation script not found at: ${scriptPath}`,
        {
          operation: 'environment-validation',
          component: 'ScriptExecutor',
          details: { expectedPath: scriptPath }
        }
      );
    }
    
    // Check if script is executable
    try {
      accessSync(scriptPath, constants.F_OK | constants.X_OK);
    } catch (error) {
      throw new CLIError(
        `Workflow creation script is not executable: ${scriptPath}`,
        {
          operation: 'environment-validation',
          component: 'ScriptExecutor',
          details: { 
            scriptPath,
            suggestion: 'Try running: chmod +x ' + scriptPath
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
    
    const scriptPath = this.getScriptPath();
    const execOptions: ExecSyncOptions = {
      cwd: this.basePath,
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 5000
    };
    
    try {
      const output = execSync(`"${scriptPath}"`, execOptions);
      return output.toString();
    } catch (error: any) {
      // The script may return usage info in stderr when called without arguments
      const output = error.stdout || error.stderr;
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