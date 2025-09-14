import chalk from 'chalk';
import { select, confirm } from '@inquirer/prompts';
import type { Agent } from '../../models/Agent.js';

export class OrderScreen {
  async show(selectedAgents: Agent[]): Promise<Agent[]> {
    let orderedAgents = [...selectedAgents];
    let modified = false;
    
    while (true) {
      console.clear();
      console.log(chalk.bold('┌─ Set Execution Order ───────────────────┐'));
      console.log('│                                         │');
      console.log('│ Set the execution order for selected    │');
      console.log('│ agents:                                 │');
      console.log('│                                         │');
      console.log('│ Current order:                          │');
      
      // Show current order
      orderedAgents.forEach((agent, index) => {
        const marker = index === 0 ? '→' : ' ';
        console.log(`│ ${marker} ${(index + 1).toString().padEnd(2)} ${agent.name.padEnd(30)} │`);
      });
      
      console.log('│                                         │');
      console.log('│ Execution flow:                         │');
      const flow = orderedAgents.map(a => a.name).join(' → ');
      const truncatedFlow = flow.length > 35 ? flow.substring(0, 32) + '...' : flow;
      console.log(`│ ${truncatedFlow.padEnd(39)} │`);
      console.log('│                                         │');
      console.log('└─────────────────────────────────────────┘');
      
      const choices = [
        { name: 'Move an agent', value: 'move' },
        { name: 'Confirm order', value: 'confirm' }
      ];
      
      const action = await select({
        message: 'What would you like to do?',
        choices
      });
      
      if (action === 'confirm') {
        break;
      }
      
      if (action === 'move') {
        const moved = await this.moveAgent(orderedAgents);
        if (moved) {
          orderedAgents = moved;
          modified = true;
        }
      }
    }
    
    if (modified) {
      console.log(chalk.green('\n✓ Execution order updated'));
    }
    
    return orderedAgents;
  }
  
  private async moveAgent(agents: Agent[]): Promise<Agent[] | null> {
    // Select which agent to move
    const agentChoices = agents.map((agent, index) => ({
      name: `${index + 1}. ${agent.name}`,
      value: index
    }));
    
    const agentIndex = await select({
      message: 'Which agent would you like to move?',
      choices: agentChoices
    });
    
    // Select new position
    const positionChoices = agents.map((_, index) => ({
      name: `Position ${index + 1}`,
      value: index,
      disabled: index === agentIndex
    }));
    
    const newPosition = await select({
      message: `Move ${agents[agentIndex]?.name ?? 'Agent'} to which position?`,
      choices: positionChoices
    });
    
    // Perform the move
    const newOrder = [...agents];
    const [movedAgent] = newOrder.splice(agentIndex, 1);
    if (movedAgent) {
      newOrder.splice(newPosition, 0, movedAgent);
    }
    
    return newOrder;
  }
}