import chalk from 'chalk';
import { select } from '@inquirer/prompts';
import type { Agent, WorkflowConfig } from '../../models/Agent.js';

export interface PreviewResult {
  action: 'generate' | 'edit' | 'cancel';
}

export class PreviewScreen {
  async show(config: WorkflowConfig): Promise<PreviewResult> {
    console.clear();
    console.log(chalk.bold('┌─ Workflow Preview ──────────────────────┐'));
    console.log('│                                         │');
    
    const workflowName = config.workflowName || this.generateWorkflowName(config.targetPath);
    console.log(`│ Workflow: /${workflowName.padEnd(29)} │`);
    
    if (config.purpose) {
      const purpose = config.purpose.length > 35 ? 
        config.purpose.substring(0, 32) + '...' : config.purpose;
      console.log(`│ Purpose: ${purpose.padEnd(30)} │`);
    }
    
    console.log('│                                         │');
    console.log('│ Execution Order:                        │');
    
    config.selectedAgents.forEach((agent, index) => {
      const stepNum = (index + 1).toString();
      const agentName = agent.name.length > 20 ? 
        agent.name.substring(0, 17) + '...' : agent.name;
      const description = agent.description.length > 30 ? 
        agent.description.substring(0, 27) + '...' : agent.description;
      
      console.log(`│ ${stepNum}. ${agentName.padEnd(20)} │`);
      console.log(`│    → ${description.padEnd(32)} │`);
    });
    
    console.log('│                                         │');
    console.log('│ Generated Files:                        │');
    console.log(`│ • .claude/commands/${workflowName}.md     │`);
    console.log('│                                         │');
    console.log('└─────────────────────────────────────────┘');
    
    const choices = [
      { name: '🚀 Generate workflow', value: 'generate' },
      { name: '✏️  Edit configuration', value: 'edit' },
      { name: '❌ Cancel', value: 'cancel' }
    ];
    
    const action = await select({
      message: 'What would you like to do?',
      choices
    }) as 'generate' | 'edit' | 'cancel';
    
    return { action };
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