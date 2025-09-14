import chalk from 'chalk';
import { checkbox, input } from '@inquirer/prompts';
import type { Agent, DirectoryInfo } from '../../models/Agent.js';

export interface AgentSelectionResult {
  selectedAgents: Agent[];
  purpose: string;
}

export class AgentSelectionScreen {
  async show(directory: DirectoryInfo, purpose?: string): Promise<AgentSelectionResult> {
    console.clear();
    console.log(chalk.bold(`┌─ Select Agents (${directory.displayName} directory) ────────┐`));
    console.log('│                                         │');
    
    if (purpose) {
      console.log(chalk.dim(`│ Purpose: ${purpose.substring(0, 35).padEnd(35)} │`));
      console.log('│                                         │');
    }
    
    console.log('│ Available agents:                       │');
    console.log('└─────────────────────────────────────────┘');
    console.log();
    
    // Prepare choices for checkbox selection
    const choices = directory.agents.map(agent => ({
      name: `${agent.name}`,
      value: agent,
      description: agent.description,
      checked: false
    }));
    
    const selectedAgents = await checkbox({
      message: 'Select agents to include in the workflow:',
      choices,
      pageSize: 15,
      instructions: false,
      validate: (selections: readonly unknown[]) => {
        if (selections.length === 0) {
          return 'Please select at least one agent';
        }
        return true;
      }
    });
    
    console.log(chalk.green(`\n✓ Selected ${selectedAgents.length} agents`));
    
    return {
      selectedAgents,
      purpose: purpose || 'Default workflow purpose'
    };
  }
  
  async getPurpose(): Promise<string | undefined> {
    console.clear();
    console.log(chalk.bold('┌─ Workflow Purpose ──────────────────────┐'));
    console.log('│                                         │');
    console.log('│ Describe the purpose of this workflow:  │');
    console.log('│                                         │');
    console.log('│ This will be used to:                   │');
    console.log('│ • Guide agent execution                 │');
    console.log('│ • Generate documentation               │');
    console.log('│ • Create meaningful descriptions        │');
    console.log('│                                         │');
    console.log('└─────────────────────────────────────────┘');
    console.log();
    
    const purpose = await input({
      message: 'Workflow purpose (optional):',
      default: ''
    });
    
    return purpose.trim() || undefined;
  }
}