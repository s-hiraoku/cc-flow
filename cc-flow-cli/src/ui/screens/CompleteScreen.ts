import chalk from 'chalk';
import { select } from '@inquirer/prompts';
import type { WorkflowConfig } from '../../models/Agent.js';

export interface CompleteResult {
  createAnother: boolean;
}

export class CompleteScreen {
  async show(config: WorkflowConfig): Promise<CompleteResult> {
    console.clear();
    console.log(chalk.bold('┌─ Workflow Created ──────────────────────┐'));
    console.log('│                                         │');
    console.log(chalk.green('│            ✅ Success!                   │'));
    console.log('│                                         │');
    console.log('│ Your workflow has been created:         │');
    console.log('│                                         │');
    
    const workflowName = config.workflowName || this.generateWorkflowName(config.targetPath);
    console.log(`│ Command: /${workflowName.padEnd(29)} │`);
    
    console.log('│ Files generated:                        │');
    console.log(`│ • .claude/commands/${workflowName}.md     │`);
    console.log('│                                         │');
    console.log('│ Usage:                                  │');
    console.log(`│ /${workflowName} "your task context"      │`);
    console.log('│                                         │');
    console.log('└─────────────────────────────────────────┘');
    
    console.log(chalk.dim('\nExecution flow:'));
    const flow = config.selectedAgents.map(a => a.name).join(' → ');
    console.log(chalk.dim(flow));
    
    const choices = [
      { name: '🔄 Create another workflow', value: 'another' },
      { name: '👋 Quit', value: 'quit' }
    ];
    
    const action = await select({
      message: 'What would you like to do next?',
      choices
    });
    
    return { createAnother: action === 'another' };
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