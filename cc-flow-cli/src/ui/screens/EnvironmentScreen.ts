import chalk from 'chalk';
import { input } from '@inquirer/prompts';
import type { EnvironmentStatus } from '../../models/Agent.js';

export class EnvironmentScreen {
  async show(status: EnvironmentStatus): Promise<boolean> {
    console.clear();
    console.log(chalk.bold('┌─ Environment Check ─────────────────────┐'));
    console.log('│                                         │');
    console.log('│ Checking your project...                │');
    
    // Check results
    const claudeDirStatus = status.claudeDir ? '✅' : '❌';
    const agentsDirStatus = status.agentsDir ? '✅' : '❌';
    
    console.log(`│ ${claudeDirStatus} .claude directory found              │`);
    console.log(`│ ${agentsDirStatus} agents directory found               │`);
    console.log('│                                         │');
    
    if (status.isValid) {
      console.log('│ Available agent directories:            │');
      
      // Show directory info (skip "all" option for display)
      const regularDirs = status.availableDirectories.filter(dir => dir.displayName !== 'all');
      for (const dir of regularDirs) {
        const displayName = `${dir.displayName} (${dir.agentCount} agents)`;
        console.log(`│ • ${displayName.padEnd(38)} │`);
      }
      
      // Show total count
      const totalText = `• all (${status.totalAgents} agents total)`;
      console.log(`│ ${totalText.padEnd(39)} │`);
    } else {
      console.log('│                                         │');
      console.log(chalk.red('│ ❌ Project setup incomplete             │'));
      
      if (!status.claudeDir) {
        console.log('│    Missing .claude directory            │');
      }
      if (!status.agentsDir) {
        console.log('│    Missing .claude/agents directory     │');
      }
      if (status.totalAgents === 0) {
        console.log('│    No agents found                      │');
      }
    }
    
    console.log('│                                         │');
    console.log('│ [Enter] Continue                        │');
    console.log('└─────────────────────────────────────────┘');
    
    if (!status.isValid) {
      console.log(chalk.red('\n⚠️  Please ensure you are in a Claude Code project directory'));
      console.log('   with .claude/agents containing agent files.');
    }
    
    await input({
      message: ''
    });
    
    return status.isValid;
  }
}