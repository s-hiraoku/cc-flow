#!/usr/bin/env node

import { EnvironmentChecker } from '../services/EnvironmentChecker.js';
import { ScriptExecutor } from '../services/ScriptExecutor.js';
import { WelcomeScreen } from '../ui/screens/WelcomeScreen.js';
import { MenuScreen } from '../ui/screens/MenuScreen.js';
import { ConversionScreen } from '../ui/screens/ConversionScreen.js';
import { ConversionCompleteScreen } from '../ui/screens/ConversionCompleteScreen.js';
import { EnvironmentScreen } from '../ui/screens/EnvironmentScreen.js';
import { DirectoryScreen } from '../ui/screens/DirectoryScreen.js';
import { WorkflowNameScreen } from '../ui/screens/WorkflowNameScreen.js';
import { AgentSelectionScreen } from '../ui/screens/AgentSelectionScreen.js';
import { OrderScreen } from '../ui/screens/OrderScreen.js';
import { PreviewScreen } from '../ui/screens/PreviewScreen.js';
import { CompleteScreen } from '../ui/screens/CompleteScreen.js';
import type { WorkflowConfig } from '../models/Agent.js';
import chalk from 'chalk';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { ErrorHandler } from '../utils/ErrorHandler.js';

/**
 * Main CLI application class for CC-Flow workflow builder
 * 
 * Provides interactive TUI for creating Claude Code workflows
 * with agent selection, ordering, and generation capabilities.
 * 
 * @example
 * ```typescript
 * const builder = new WorkflowBuilder();
 * await builder.run();
 * ```
 */
export class WorkflowBuilder {
  private envChecker: EnvironmentChecker;
  private scriptExecutor: ScriptExecutor;
  
  /**
   * Initialize the workflow builder with default services
   */
  constructor() {
    this.envChecker = new EnvironmentChecker();
    this.scriptExecutor = new ScriptExecutor();
  }
  
  /**
   * Run the interactive CLI application
   * 
   * This method orchestrates the entire workflow creation process:
   * 1. Welcome screen
   * 2. Environment validation
   * 3. Directory selection
   * 4. Agent selection and ordering
   * 5. Preview and confirmation
   * 6. Workflow generation
   * 
   * @throws {CLIError} When critical errors occur during execution
   */
  async run(): Promise<void> {
    try {
      // Show welcome screen once
      const welcomeScreen = new WelcomeScreen();
      const shouldContinue = await welcomeScreen.show();
      if (!shouldContinue) {
        return;
      }
      
      let continueApp = true;
      while (continueApp) {
        // Show main menu
        const menuScreen = new MenuScreen();
        const menuChoice = await menuScreen.show();
        
        switch (menuChoice) {
          case 'create-workflow':
            await this.runWorkflowCreation();
            break;
            
          case 'convert-commands':
            await this.runCommandConversion();
            break;
            
          case 'help':
            // Help is handled in MenuScreen
            break;
            
          case 'exit':
            continueApp = false;
            break;
        }
      }
      
    } catch (error) {
      ErrorHandler.handleError(error, {
        operation: 'main-application',
        component: 'WorkflowBuilder'
      });
    }
  }
  
  /**
   * Run the workflow creation process
   */
  private async runWorkflowCreation(): Promise<void> {
    try {
      let createAnother = true;
      
      while (createAnother) {
        // Environment check
        const envStatus = await this.envChecker.checkEnvironment();
        const envScreen = new EnvironmentScreen();
        const envValid = await envScreen.show(envStatus);
        
        if (!envValid) {
          console.log(chalk.red('❌ Environment check failed. Please fix the issues above.'));
          break;
        }
        
        // Directory selection
        const dirScreen = new DirectoryScreen();
        const selectedDirectory = await dirScreen.show(envStatus.availableDirectories);
        
        // Workflow name input
        const nameScreen = new WorkflowNameScreen();
        const workflowName = await nameScreen.show(selectedDirectory);
        
        // Purpose input (optional)
        const agentScreen = new AgentSelectionScreen();
        const purpose = await agentScreen.getPurpose();
        
        // Agent selection
        const selectionResult = await agentScreen.show(selectedDirectory, purpose);
        
        // Order configuration
        const orderScreen = new OrderScreen();
        const orderedAgents = await orderScreen.show(selectionResult.selectedAgents);
        
        if (!orderedAgents) {
          // User chose to go back from order screen
          continue;
        }
        
        // Create workflow config
        const config: WorkflowConfig = {
          targetPath: selectedDirectory.path,
          workflowName: workflowName,
          purpose: selectionResult.purpose || 'Workflow created without specific purpose',
          selectedAgents: orderedAgents,
          executionOrder: orderedAgents.map(a => a.name),
          createdAt: new Date()
        };
        
        // Preview and confirmation
        const previewScreen = new PreviewScreen();
        let previewResult = await previewScreen.show(config);
        
        while (previewResult.action === 'edit') {
          // Show edit options and re-configure workflow
          const editResult = await this.editWorkflowConfiguration(config);
          if (editResult) {
            // Update config with edited values
            Object.assign(config, editResult);
          }
          previewResult = await previewScreen.show(config);
        }
        
        if (previewResult.action === 'cancel') {
          console.log(chalk.yellow('Workflow creation cancelled.'));
          createAnother = false;
          continue;
        }
        
        // Execute workflow creation
        try {
          console.log(chalk.blue('\n🔧 Creating workflow...'));
          await this.scriptExecutor.executeWorkflowCreation(config);
          
          // Show completion screen
          const completeScreen = new CompleteScreen();
          const completeResult = await completeScreen.show(config);
          createAnother = completeResult.createAnother;
          
        } catch (error) {
          ErrorHandler.logError(error, {
            operation: 'workflow-creation',
            component: 'ScriptExecutor',
            details: { workflowConfig: config }
          });
          console.log(chalk.yellow('\nWorkflow creation failed. You can try again or exit.'));
          createAnother = false;
        }
      }
      
    } catch (error) {
      ErrorHandler.logError(error, {
        operation: 'workflow-creation',
        component: 'WorkflowBuilder'
      });
      console.log(chalk.red('❌ Workflow creation failed. Returning to main menu.'));
    }
  }
  
  /**
   * Run the command conversion process
   */
  private async runCommandConversion(): Promise<void> {
    try {
      let continueConversion = true;
      
      while (continueConversion) {
        const conversionScreen = new ConversionScreen();
        const result = await conversionScreen.show();
        
        // Show conversion complete screen
        const completeScreen = new ConversionCompleteScreen();
        const completeResult = await completeScreen.show(result);
        
        if (completeResult.returnToMenu) {
          continueConversion = false;
        } else if (completeResult.startWorkflowCreation) {
          // Start workflow creation process
          await this.runWorkflowCreation();
          continueConversion = false;
        }
        // If both flags are false, we continue the loop to run another conversion
      }
      
    } catch (error) {
      ErrorHandler.logError(error, {
        operation: 'command-conversion',
        component: 'WorkflowBuilder'
      });
      console.log(chalk.red('❌ Command conversion failed. Returning to main menu.'));
    }
  }

  
  /**
   * Edit workflow configuration
   */
  private async editWorkflowConfiguration(currentConfig: WorkflowConfig): Promise<Partial<WorkflowConfig> | null> {
    try {
      let configChanges: Partial<WorkflowConfig> = {};
      
      while (true) {
        console.clear();
        console.log(chalk.cyan.bold('┌─ ✏️ ワークフロー設定編集 ────────────────┐'));
        console.log(chalk.cyan('│                                         │'));
        console.log(chalk.cyan('│') + '  編集する項目を選択してください          ' + chalk.cyan('│'));
        console.log(chalk.cyan('│                                         │'));
        console.log(chalk.cyan('└─────────────────────────────────────────┘'));
        console.log();

        const { select } = await import('@inquirer/prompts');
        
        const editChoice = await select({
        message: '編集する項目を選択してください:',
        choices: [
          {
            name: '📝 ワークフロー名を変更',
            value: 'name'
          },
          // {
          //   name: '🎯 目的を変更',
          //   value: 'purpose'
          // },
          {
            name: '🔧 エージェント選択を変更',
            value: 'agents'
          },
          {
            name: '📋 実行順序を変更',
            value: 'order'
          },
          {
            name: '🔙 プレビューに戻る',
            value: 'back'
          }
        ]
      });

        if (editChoice === 'back') {
          return Object.keys(configChanges).length > 0 ? configChanges : null;
        }

        if (editChoice === 'name') {
          const nameScreen = new WorkflowNameScreen();
          const newName = await nameScreen.show({ 
            path: currentConfig.targetPath, 
            displayName: currentConfig.targetPath.split('/').pop() || 'agents',
            category: 'agents',
            agentCount: currentConfig.selectedAgents.length,
            agents: currentConfig.selectedAgents
          });
          configChanges.workflowName = newName;
          console.log(chalk.green('\n✅ ワークフロー名を更新しました: ' + newName));
          console.log(chalk.blue('Enter キーで編集メニューに戻る...'));
          
          // Wait for user input
          process.stdin.setRawMode?.(true);
          process.stdin.resume();
          await new Promise(resolve => {
            process.stdin.once('data', () => {
              process.stdin.setRawMode?.(false);
              process.stdin.pause();
              resolve(undefined);
            });
          });
          continue;
        }

      // TODO: Implement purpose editing screen
      // if (editChoice === 'purpose') {
      //   const agentScreen = new AgentSelectionScreen();
      //   const newPurpose = await agentScreen.getPurpose();
      //   return { purpose: newPurpose };
      // }

        if (editChoice === 'agents') {
          // Re-run agent selection
          const agentScreen = new AgentSelectionScreen();
          const directory = { 
            path: currentConfig.targetPath, 
            displayName: currentConfig.targetPath.split('/').pop() || 'agents',
            category: 'agents',
            agentCount: currentConfig.selectedAgents.length,
            agents: currentConfig.selectedAgents
          };
          const selectionResult = await agentScreen.show(directory, currentConfig.purpose);
          
          // Re-run order configuration with new agents
          const orderScreen = new OrderScreen();
          const orderedAgents = await orderScreen.show(selectionResult.selectedAgents);
          
          if (orderedAgents) {
            Object.assign(configChanges, {
              selectedAgents: orderedAgents,
              executionOrder: orderedAgents.map(a => a.name),
              purpose: selectionResult.purpose
            });
            console.log(chalk.green('\n✅ エージェント選択と順序を更新しました'));
            console.log(chalk.blue('Enter キーで編集メニューに戻る...'));
            
            // Wait for user input
            process.stdin.setRawMode?.(true);
            process.stdin.resume();
            await new Promise(resolve => {
              process.stdin.once('data', () => {
                process.stdin.setRawMode?.(false);
                process.stdin.pause();
                resolve(undefined);
              });
            });
          }
          continue;
        }

        if (editChoice === 'order') {
          // Re-run order configuration with current agents
          const orderScreen = new OrderScreen();
          const currentAgents = configChanges.selectedAgents || currentConfig.selectedAgents;
          const orderedAgents = await orderScreen.show(currentAgents);
          
          if (orderedAgents) {
            Object.assign(configChanges, {
              selectedAgents: orderedAgents,
              executionOrder: orderedAgents.map(a => a.name)
            });
            console.log(chalk.green('\n✅ 実行順序を更新しました'));
            console.log(chalk.blue('Enter キーで編集メニューに戻る...'));
            
            // Wait for user input
            process.stdin.setRawMode?.(true);
            process.stdin.resume();
            await new Promise(resolve => {
              process.stdin.once('data', () => {
                process.stdin.setRawMode?.(false);
                process.stdin.pause();
                resolve(undefined);
              });
            });
          }
          continue;
        }
      }

    } catch (error) {
      ErrorHandler.logError(error, {
        operation: 'workflow-edit',
        component: 'WorkflowBuilder'
      });
      console.log(chalk.red('❌ 編集処理でエラーが発生しました。'));
      return null;
    }
  }
}

// Run the CLI if this file is executed directly
const currentFile = fileURLToPath(import.meta.url);
const mainFile = resolve(process.argv[1] || '');

if (currentFile === mainFile) {
  // Setup global error handlers
  ErrorHandler.handleProcessErrors();
  
  const builder = new WorkflowBuilder();
  builder.run().catch((error: unknown) => {
    ErrorHandler.handleError(error, {
      operation: 'cli-startup',
      component: 'main'
    });
  });
}