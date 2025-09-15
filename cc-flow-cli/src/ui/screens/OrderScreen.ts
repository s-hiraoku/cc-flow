import chalk from 'chalk';
import { select, confirm } from '@inquirer/prompts';
import type { Agent } from '../../models/Agent.js';

export class OrderScreen {
  async show(selectedAgents: Agent[]): Promise<Agent[] | null> {
    let orderedAgents = [...selectedAgents];
    
    // If only one agent, skip ordering
    if (orderedAgents.length <= 1) {
      console.clear();
      this.showHeader();
      console.log('│ 1つのエージェントのみ選択済み           │');
      console.log('│ 順序設定は不要です。                    │');
      console.log('│                                         │');
      console.log('└─────────────────────────────────────────┘');
      await this.delay(1500);
      return orderedAgents;
    }
    
    while (true) {
      console.clear();
      this.showHeader();
      this.showCurrentOrder(orderedAgents);
      console.log('└─────────────────────────────────────────┘');
      console.log();
      
      const action = await select({
        message: '実行順序を設定してください:',
        choices: [
          {
            name: '✅ この順序で確定する',
            value: 'confirm'
          },
          {
            name: '🔄 順序を変更する',
            value: 'reorder'
          },
          {
            name: '📚 ヘルプを表示',
            value: 'help'
          },
          {
            name: '↩️ 前の画面に戻る',
            value: 'back'
          }
        ]
      });
      
      if (action === 'confirm') {
        break;
      }
      
      if (action === 'back') {
        // Return null to indicate user wants to go back
        return null;
      }
      
      if (action === 'help') {
        this.showHelp();
        await this.waitForKey();
        continue;
      }
      
      if (action === 'reorder') {
        // Show current order and let user reorder
        const reorderedAgents = await this.reorderAgents(orderedAgents);
        if (reorderedAgents) {
          orderedAgents = reorderedAgents;
        }
        continue;
      }
    }
    
    return orderedAgents;
  }
  
  private async reorderAgents(agents: Agent[]): Promise<Agent[] | null> {
    let orderedAgents: Agent[] = [];
    let remainingAgents = [...agents];
    
    while (remainingAgents.length > 0) {
      console.clear();
      console.log(chalk.bold('┌─ 🔄 実行順序の設定 ─────────────────────┐'));
      console.log('│                                         │');
      
      if (orderedAgents.length > 0) {
        console.log('│ 📋 確定済みの実行順序:                  │');
        orderedAgents.forEach((agent, index) => {
          const position = chalk.green(`${index + 1}.`);
          const name = chalk.white(agent.name.slice(0, 16));
          console.log(`│   ${position} ${name.padEnd(18)} │`);
        });
        console.log('│                                         │');
      }
      
      console.log(`│ 次に実行するエージェントを選択: (残り${remainingAgents.length}個) │`);
      console.log('│                                         │');
      console.log('└─────────────────────────────────────────┘');
      console.log();
      
      // Show remaining agents as choices
      const choices = remainingAgents.map((agent, index) => ({
        name: `${agent.name.padEnd(18)} - ${agent.description.slice(0, 20)}${agent.description.length > 20 ? '...' : ''}`,
        value: agent
      }));
      
      // Add control options
      if (orderedAgents.length > 0) {
        choices.push({
          name: '✅ この順序で確定する',
          value: 'confirm' as any
        });
      }
      
      choices.push({
        name: '↩️  キャンセル（順序変更せずに戻る）',
        value: 'cancel' as any
      });
      
      try {
        const selected = await select({
          message: orderedAgents.length === 0 
            ? '最初に実行するエージェントを選択してください: (↑↓で選択、Enterで決定)' 
            : `${orderedAgents.length + 1}番目に実行するエージェントを選択してください: (↑↓で選択、Enterで決定)`,
          choices,
          pageSize: 10
        });
        
        if (typeof selected === 'string' && selected === 'confirm') {
          // Add remaining agents to the end
          return [...orderedAgents, ...remainingAgents];
        }
        
        if (typeof selected === 'string' && selected === 'cancel') {
          return null;
        }
        
        // Add selected agent to ordered list and remove from remaining
        if (typeof selected === 'object' && selected !== null) {
          orderedAgents.push(selected as Agent);
          remainingAgents = remainingAgents.filter(agent => agent.id !== (selected as Agent).id);
        }
        
      } catch {
        return null;
      }
    }
    
    return orderedAgents;
  }
  
  private showHeader() {
    console.log(chalk.bold('┌─ 🔄 実行順序の設定 ─────────────────────┐'));
    console.log('│                                         │');
  }
  
  private showCurrentOrder(agents: Agent[]) {
    console.log('│ 📋 現在の実行順序:                      │');
    console.log('│                                         │');
    
    agents.forEach((agent, index) => {
      const position = chalk.cyan(`${index + 1}.`);
      const name = chalk.white(agent.name);
      const desc = chalk.dim(agent.description.slice(0, 15) + (agent.description.length > 15 ? '...' : ''));
      console.log(`│   ${position} ${name.padEnd(20)} ${desc.padEnd(15)} │`);
    });
    
    console.log('│                                         │');
    console.log(`│ 🔗 実行フロー: ${this.getFlowDisplay(agents)} │`);
    console.log('│                                         │');
  }
  
  private showHelp() {
    console.clear();
    console.log(chalk.bold('┌─ 📚 ヘルプ - 実行順序の設定 ──────────────┐'));
    console.log('│                                         │');
    console.log('│ 🎯 ' + chalk.cyan('順序設定の流れ:') + '                     │');
    console.log('│   1. 最初に実行するエージェントを選択    │');
    console.log('│   2. 次に実行するエージェントを選択      │');
    console.log('│   3. 残りがなくなるまで繰り返し          │');
    console.log('│                                         │');
    console.log('│ 📋 ' + chalk.cyan('確定済み順序の表示:') + '                 │');
    console.log('│   選択したエージェントが枠内に表示され   │');
    console.log('│   実行順序が視覚的に確認できます         │');
    console.log('│                                         │');
    console.log('│ ✅ ' + chalk.cyan('途中で確定:') + '                         │');
    console.log('│   "この順序で確定する"を選択すると       │');
    console.log('│   残りのエージェントは最後に追加されます │');
    console.log('│                                         │');
    console.log('│ 💡 ' + chalk.dim('選んだ順番がそのまま実行順序になります') + ' │');
    console.log('│                                         │');
    console.log('└─────────────────────────────────────────┘');
    console.log(chalk.dim('\nPress any key to continue...'));
  }
  
  private getFlowDisplay(agents: Agent[]): string {
    const flow = agents.map(a => a.name).join(' → ');
    return flow.length > 28 ? flow.substring(0, 25) + '...' : flow.padEnd(28);
  }
  
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  private async waitForKey(): Promise<void> {
    return new Promise(resolve => {
      process.stdin.setRawMode?.(true);
      process.stdin.resume();
      process.stdin.once('data', () => {
        process.stdin.setRawMode?.(false);
        process.stdin.pause();
        resolve();
      });
    });
  }
}