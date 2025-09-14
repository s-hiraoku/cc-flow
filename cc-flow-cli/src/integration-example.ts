/**
 * Integration Example - Demonstrates TUIManager and WorkflowCreator working together
 * Following Kent Beck's TDD principles: Integration tests after unit tests
 * 
 * This is an example file showing how the TDD-developed classes integrate
 */

import { TUIManager, TUIScreen } from './ui/TUIManager.js';
import { WorkflowCreator, WorkflowCreationOptions } from './core/WorkflowCreator.js';
import { ErrorHandler } from './utils/ErrorHandler.js';
import { input } from '@inquirer/prompts';
import chalk from 'chalk';

/**
 * Example screen that uses WorkflowCreator
 * This demonstrates the integration between TUI and business logic
 */
class WorkflowScreen implements TUIScreen {
  constructor(private workflowCreator: WorkflowCreator) {}

  async show(): Promise<void> {
    console.clear();
    console.log(chalk.cyan('🔧 Workflow Creation Screen'));
    console.log();

    try {
      // Collect workflow options via TUI
      const agentDirectory = await input({
        message: 'Enter agent directory path:',
        default: './agents/spec'
      });

      const agentInput = await input({
        message: 'Enter agents (comma-separated):',
        default: 'spec-init,spec-requirements'
      });

      const selectedAgents = agentInput.split(',').map(a => a.trim());

      const options: WorkflowCreationOptions = {
        agentDirectory,
        selectedAgents
      };

      // Use WorkflowCreator to create workflow
      const result = await this.workflowCreator.createWorkflow(options);

      // Display success
      console.log();
      console.log(chalk.green('✅ Workflow created successfully!'));
      console.log(chalk.dim(`Name: ${result.workflowName}`));
      console.log(chalk.dim(`Agents: ${result.agents.join(', ')}`));
      
    } catch (error) {
      ErrorHandler.logError(error, {
        operation: 'workflow-creation-screen',
        component: 'WorkflowScreen'
      });
    }
  }

  async onEnter(): Promise<void> {
    console.log(chalk.dim('Entering workflow creation...'));
  }

  async onExit(): Promise<void> {
    console.log(chalk.dim('Exiting workflow creation...'));
  }
}

/**
 * Example integration function
 * Shows how TUIManager orchestrates screens that use WorkflowCreator
 */
export async function runIntegrationExample(): Promise<void> {
  // Setup error handling
  ErrorHandler.handleProcessErrors();

  try {
    // Create instances following dependency injection pattern
    const workflowCreator = new WorkflowCreator();
    const tuiManager = new TUIManager({ 
      accessibility: true, 
      debug: true 
    });

    // Register the workflow screen
    const workflowScreen = new WorkflowScreen(workflowCreator);
    tuiManager.registerScreen('workflow', workflowScreen);

    // Start TUI
    await tuiManager.start();
    
    // Navigate to workflow screen
    await tuiManager.showScreen('workflow');

    console.log(chalk.green('\n🎉 Integration example completed successfully!'));

  } catch (error) {
    ErrorHandler.handleError(error, {
      operation: 'integration-example',
      component: 'IntegrationExample'
    });
  }
}

// Run example if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runIntegrationExample().catch(error => {
    ErrorHandler.handleError(error, {
      operation: 'integration-example-main',
      component: 'IntegrationExample'
    });
  });
}