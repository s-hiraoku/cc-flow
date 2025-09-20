import { execSync, type ExecSyncOptions } from 'child_process';
import { join, dirname, resolve } from 'path';
import { existsSync, accessSync, constants } from 'fs';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
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
    const scriptsDir = dirname(scriptPath);
    const finalWorkflowName = workflowName || this.generateDefaultWorkflowName(targetPath);
    
    // Set environment variable for workflow name
    process.env['WORKFLOW_NAME'] = finalWorkflowName;
    
    // Script expects: <targetPath> [agent1,agent2,agent3] (comma-separated for item-names mode)
    // If no agents are selected, script will run in interactive mode
    // Use relative path when executing from scripts directory
    const scriptName = './create-workflow.sh';
    let command = `"${scriptName}" "${targetPath}"`;

    if (selectedAgents && selectedAgents.length > 0) {
      const agentNames = selectedAgents.map(agent => agent.name).join(',');
      // Add trailing comma to ensure item-names mode (not indices mode)
      const agentNamesWithComma = agentNames + ',';
      command = `"${scriptName}" "${targetPath}" "${agentNamesWithComma}"`;
    }
    
    console.log(`\n🚀 Executing workflow creation script:`);
    console.log(`  Script path: ${scriptPath}`);
    console.log(`  Working directory: ${scriptsDir}`);
    console.log(`  Target path: ${targetPath}`);
    
    if (selectedAgents && selectedAgents.length > 0) {
      const agentNames = selectedAgents.map(agent => agent.name).join(',');
      console.log(`  Agent names: ${agentNames}`);
      console.log(`  Mode: item-names (comma-separated)`);
    } else {
      console.log(`  Agent names: (none - interactive mode)`);
      console.log(`  Mode: interactive`);
    }
    
    console.log(`  Workflow name: ${finalWorkflowName}`);
    console.log(`  Full command: ${command}`);
    
    // Execute from scripts directory to match shell script expectations
    const execOptions: ExecSyncOptions = {
      cwd: scriptsDir,
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
    console.log('🔍 Debug: Searching for script...');

    // First try to find script in user's project (for development)
    // Check if we're in cc-flow-cli directory structure
    const userProjectScript1 = join(this.basePath, 'scripts/create-workflow.sh');
    const userProjectScript2 = join(this.basePath, 'cc-flow-cli/scripts/create-workflow.sh');

    console.log(`🔍 Debug: Checking user project: ${userProjectScript1}`);
    if (existsSync(userProjectScript1)) {
      console.log('✅ Debug: Found in user project (scripts/)');
      return userProjectScript1;
    }

    console.log(`🔍 Debug: Checking user project: ${userProjectScript2}`);
    if (existsSync(userProjectScript2)) {
      console.log('✅ Debug: Found in user project (cc-flow-cli/scripts/)');
      return userProjectScript2;
    }
    
    // Fall back to package's built-in script (for npx usage)
    try {
      // Method 1: Try to resolve package location using require.resolve
      const require = createRequire(import.meta.url);
      const packagePath = require.resolve('@hiraoku/cc-flow-cli/package.json');
      const packageRoot = dirname(packagePath);
      const packageScript1 = join(packageRoot, 'scripts/create-workflow.sh');
      console.log(`🔍 Debug: Package method 1: ${packageScript1}`);
      if (existsSync(packageScript1)) {
        console.log('✅ Debug: Found via package resolution');
        return packageScript1;
      }
    } catch (error) {
      console.log(`❌ Debug: Package resolution failed: ${error}`);
    }
    
    try {
      // Method 2: Use current file location
      const currentFile = fileURLToPath(import.meta.url);
      const currentDir = dirname(currentFile);
      console.log(`🔍 Debug: Current file: ${currentFile}`);
      console.log(`🔍 Debug: Current dir: ${currentDir}`);
      
      // Try different possible paths
      const possiblePaths = [
        join(currentDir, '../../scripts/create-workflow.sh'),  // dist/services -> root
        join(currentDir, '../../../scripts/create-workflow.sh'), // node_modules case
        join(currentDir, '../../../../scripts/create-workflow.sh'), // deeper nesting
      ];
      
      for (const packageScript of possiblePaths) {
        console.log(`🔍 Debug: Checking package path: ${packageScript}`);
        if (existsSync(packageScript)) {
          console.log('✅ Debug: Found in package');
          return packageScript;
        }
      }
    } catch (error) {
      console.log(`❌ Debug: Error in module path detection: ${error}`);
    }
    
    console.log('❌ Debug: Script not found anywhere');
    // Return default path for error reporting
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