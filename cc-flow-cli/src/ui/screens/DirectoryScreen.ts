import chalk from 'chalk';
import { select } from '@inquirer/prompts';
import type { DirectoryInfo } from '../../models/Agent.js';

export class DirectoryScreen {
  async show(directories: DirectoryInfo[]): Promise<DirectoryInfo> {
    console.clear();
    console.log(chalk.bold('┌─ Select Agent Directory ────────────────┐'));
    console.log('│                                         │');
    console.log('│ Which agent directory do you want to    │');
    console.log('│ create a workflow for?                  │');
    console.log('│                                         │');
    
    // Prepare choices
    const choices = directories.map(dir => {
      let description: string;
      if (dir.displayName === 'all') {
        description = `${dir.agentCount} agents from all directories`;
      } else {
        description = `${dir.agentCount} agents`;
      }
      
      return {
        name: `${dir.displayName} (${description})`,
        value: dir,
        description: dir.path
      };
    });
    
    // Add separator before "all" option if it exists
    const regularChoices = choices.filter(c => c.value.displayName !== 'all');
    const allChoice = choices.find(c => c.value.displayName === 'all');
    
    let finalChoices = regularChoices;
    if (allChoice) {
      finalChoices.push(
        { name: '─────────────────────────', value: null, disabled: true } as any,
        allChoice
      );
    }
    
    const selected = await select({
      message: 'Available directories:',
      choices: finalChoices.filter(c => c.value !== null),
      pageSize: 10
    });
    
    // Show what will be created
    const workflowName = selected.displayName === 'all' ? 'all-workflow' : `${selected.displayName}-workflow`;
    console.log(chalk.dim(`\nThis will create: /${workflowName}`));
    
    return selected;
  }
}