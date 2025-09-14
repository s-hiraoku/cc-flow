import chalk from 'chalk';
import { select } from '@inquirer/prompts';
import type { DirectoryInfo } from '../../models/Agent.js';

export class DirectoryScreen {
  async show(directories: DirectoryInfo[]): Promise<DirectoryInfo> {
    // Handle empty directories list
    if (directories.length === 0) {
      console.clear();
      console.log(chalk.bold('┌─ No Agents Found ───────────────────────┐'));
      console.log('│                                         │');
      console.log('│ No agent directories or files found.   │');
      console.log('│ Please add .md files to .claude/agents │');
      console.log('│                                         │');
      console.log('└─────────────────────────────────────────┘');
      throw new Error('No agent directories available');
    }

    // If there's only one directory (likely "all" with direct .md files), auto-select it
    if (directories.length === 1 && directories[0]) {
      const selected = directories[0];
      console.clear();
      console.log(chalk.bold('┌─ Agent Directory Detected ──────────────┐'));
      console.log('│                                         │');
      console.log(`│ Found ${selected.agentCount} agent(s) in ${selected.displayName.padEnd(18)} │`);
      console.log('│                                         │');
      console.log('│ Proceeding to agent selection...        │');
      console.log('└─────────────────────────────────────────┘');
      
      const workflowName = selected.displayName === 'all' ? 'workflow' : `${selected.displayName}-workflow`;
      console.log(chalk.dim(`\nThis will create: /${workflowName}`));
      
      // Brief pause to show the message
      await new Promise(resolve => setTimeout(resolve, 1000));
      return selected;
    }

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