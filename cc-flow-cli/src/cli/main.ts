#!/usr/bin/env node

import { EnvironmentChecker } from '../services/EnvironmentChecker.js';
import { ScriptExecutor } from '../services/ScriptExecutor.js';
import { WelcomeScreen } from '../ui/screens/WelcomeScreen.js';
import { EnvironmentScreen } from '../ui/screens/EnvironmentScreen.js';
import { DirectoryScreen } from '../ui/screens/DirectoryScreen.js';
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
      let createAnother = true;
      
      // Show welcome screen once
      const welcomeScreen = new WelcomeScreen();
      const shouldContinue = await welcomeScreen.show();
      if (!shouldContinue) {
        return;
      }
      
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
        
        // Purpose input (optional)
        const agentScreen = new AgentSelectionScreen();
        const purpose = await agentScreen.getPurpose();
        
        // Agent selection
        const selectionResult = await agentScreen.show(selectedDirectory, purpose);
        
        // Order configuration
        const orderScreen = new OrderScreen();
        const orderedAgents = await orderScreen.show(selectionResult.selectedAgents);
        
        // Create workflow config
        const config: WorkflowConfig = {
          targetPath: selectedDirectory.path,
          purpose: selectionResult.purpose || 'Workflow created without specific purpose',
          selectedAgents: orderedAgents,
          executionOrder: orderedAgents.map(a => a.name),
          createdAt: new Date()
        };
        
        // Preview and confirmation
        const previewScreen = new PreviewScreen();
        let previewResult = await previewScreen.show(config);
        
        while (previewResult.action === 'edit') {
          // For now, just show preview again
          // In a full implementation, we'd go back to agent selection
          console.log(chalk.yellow('Edit functionality not yet implemented. Showing preview again...'));
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
      ErrorHandler.handleError(error, {
        operation: 'workflow-execution',
        component: 'WorkflowBuilder'
      });
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