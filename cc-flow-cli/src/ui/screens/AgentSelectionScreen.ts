import chalk from 'chalk';
import { checkbox } from '@inquirer/prompts';
import type { Agent, DirectoryInfo } from '../../models/Agent.js';
import { SimpleUITheme } from '../themes/SimpleUITheme.js';
import { BaseScreen } from './BaseScreen.js';

export interface AgentSelectionResult {
  selectedAgents: Agent[];
  purpose: string;
}

export class AgentSelectionScreen extends BaseScreen {
  async show(directory: DirectoryInfo, purpose?: string): Promise<AgentSelectionResult> {
    const agents = directory.agents;
    
    this.showScreenFrame(`エージェント選択 - ${directory.displayName}`, this.theme.icons.check, () => {
      // Empty content - agents will be displayed below
    });
    
    // Prepare choices for checkbox
    const choices = agents.map(agent => ({
      name: `${agent.name} - ${agent.description.slice(0, 35)}${agent.description.length > 35 ? '...' : ''}`,
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
  
  // Removed showHeader method - now using SimpleUITheme.createHeader()
}