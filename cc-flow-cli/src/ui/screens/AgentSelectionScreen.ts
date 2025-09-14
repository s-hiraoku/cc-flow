import chalk from 'chalk';
import { checkbox } from '@inquirer/prompts';
import type { Agent, DirectoryInfo } from '../../models/Agent.js';

export interface AgentSelectionResult {
  selectedAgents: Agent[];
  purpose: string;
}

export class AgentSelectionScreen {
  async show(directory: DirectoryInfo, purpose?: string): Promise<AgentSelectionResult> {
    const agents = directory.agents;
    
    console.clear();
    this.showHeader(directory);
    
    // Prepare choices for checkbox
    const choices = agents.map(agent => ({
      name: `${agent.name.padEnd(15)} - ${agent.description.slice(0, 40)}${agent.description.length > 40 ? '...' : ''}`,
      value: agent
    }));
    
    const selectedAgents = await checkbox({
      message: 'ワークフローに含めるエージェントを選択してください (スペースでチェック/アンチェック):',
      choices,
      pageSize: 10,
      required: true,
      validate: (answer) => {
        if (answer.length === 0) {
          return '少なくとも1つのエージェントを選択してください';
        }
        return true;
      }
    });
    
    console.log(chalk.green(`\n✅ ${selectedAgents.length}個のエージェントを選択しました！`));
    
    return {
      selectedAgents,
      purpose: purpose || 'Custom workflow'
    };
  }
  
  async getPurpose(): Promise<string> {
    return '';
  }
  
  private showHeader(directory: DirectoryInfo) {
    console.log(chalk.bold('┌─ 🎯 エージェント選択 ───────────────────┐'));
    console.log('│                                         │');
    console.log(`│ 📁 ディレクトリ: ${directory.displayName.padEnd(20)} │`);
    console.log(`│ 📊 利用可能: ${directory.agentCount.toString().padEnd(2)}個のエージェント        │`);
    console.log('│                                         │');
    console.log('└─────────────────────────────────────────┘');
    console.log();
  }
}