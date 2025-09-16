import chalk from 'chalk';
import { select, confirm } from '@inquirer/prompts';
import type { Agent } from '../../models/Agent.js';
import { SimpleUITheme } from '../themes/SimpleUITheme.js';
import { BaseScreen } from './BaseScreen.js';

export class OrderScreen extends BaseScreen {
  async show(selectedAgents: Agent[]): Promise<Agent[] | null> {
    let orderedAgents = [...selectedAgents];
    
    // If only one agent, skip ordering
    if (orderedAgents.length <= 1) {
      console.clear();
      
      const headerLines = SimpleUITheme.createHeader('実行順序設定', SimpleUITheme.icons.order);
      headerLines.forEach(line => console.log(line));
      
      console.log(SimpleUITheme.createEmptyLine());
      console.log(SimpleUITheme.createContentLine('1つのエージェントのみ選択済み'));
      console.log(SimpleUITheme.createContentLine('順序設定は不要です。'));
      console.log(SimpleUITheme.createEmptyLine());
      console.log(SimpleUITheme.createFooter());
      await this.delay(1500);
      return orderedAgents;
    }
    
    while (true) {
      console.clear();
      
      const headerLines = SimpleUITheme.createHeader('実行順序設定', SimpleUITheme.icons.order);
      headerLines.forEach(line => console.log(line));
      
      console.log(SimpleUITheme.createEmptyLine());
      this.showCurrentOrder(orderedAgents);
      console.log(SimpleUITheme.createFooter());
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
      this.showScreenFrame('実行順序の設定', this.theme.icons.order, () => {
        if (orderedAgents.length > 0) {
          console.log(SimpleUITheme.createContentLine('📋 確定済みの実行順序:'));
          orderedAgents.forEach((agent, index) => {
            const position = chalk.green(`${index + 1}.`);
            const name = chalk.white(agent.name.slice(0, 20));
            console.log(SimpleUITheme.createContentLine(`  ${position} ${name}`));
          });
          console.log(SimpleUITheme.createEmptyLine());
        }
        
        console.log(SimpleUITheme.createContentLine(`次に実行するエージェントを選択: (残り${remainingAgents.length}個)`));
      });
      
      // Show remaining agents as choices
      const choices = remainingAgents.map((agent, index) => ({
        name: `${agent.name} - ${agent.description.slice(0, 25)}${agent.description.length > 25 ? '...' : ''}`,
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
  
  // Removed showHeader method - now using SimpleUITheme.createHeader()
  
  private showCurrentOrder(agents: Agent[]) {
    console.log(SimpleUITheme.createContentLine('📋 現在の実行順序:'));
    console.log(SimpleUITheme.createEmptyLine());
    
    agents.forEach((agent, index) => {
      const position = `${index + 1}.`;
      const name = agent.name;
      const desc = agent.description.slice(0, 20) + (agent.description.length > 20 ? '...' : '');
      console.log(SimpleUITheme.createContentLine(`${position} ${name} - ${desc}`));
    });
    
    console.log(SimpleUITheme.createEmptyLine());
    console.log(SimpleUITheme.createContentLine(`🔗 実行フロー: ${this.getFlowDisplay(agents)}`));
    console.log(SimpleUITheme.createEmptyLine());
  }
  
  private showHelp() {
    this.showScreenFrame('ヘルプ - 実行順序の設定', this.theme.icons.info, () => {
      console.log(SimpleUITheme.createContentLine(SimpleUITheme.colors.accent('🎯 順序設定の流れ:')));
      console.log(SimpleUITheme.createContentLine('  1. 最初に実行するエージェントを選択'));
      console.log(SimpleUITheme.createContentLine('  2. 次に実行するエージェントを選択'));
      console.log(SimpleUITheme.createContentLine('  3. 残りがなくなるまで繰り返し'));
      console.log(SimpleUITheme.createEmptyLine());
      console.log(SimpleUITheme.createContentLine(SimpleUITheme.colors.accent('📋 確定済み順序の表示:')));
      console.log(SimpleUITheme.createContentLine('  選択したエージェントが枠内に表示され'));
      console.log(SimpleUITheme.createContentLine('  実行順序が視覚的に確認できます'));
      console.log(SimpleUITheme.createEmptyLine());
      console.log(SimpleUITheme.createContentLine(SimpleUITheme.colors.accent('✅ 途中で確定:')));
      console.log(SimpleUITheme.createContentLine('  "この順序で確定する"を選択すると'));
      console.log(SimpleUITheme.createContentLine('  残りのエージェントは最後に追加されます'));
      console.log(SimpleUITheme.createEmptyLine());
      console.log(SimpleUITheme.createContentLine(SimpleUITheme.colors.muted('💡 選んだ順番がそのまま実行順序になります')));
    });
  }
  
  private getFlowDisplay(agents: Agent[]): string {
    const flow = agents.map(a => a.name).join(' → ');
    return flow.length > 30 ? flow.substring(0, 27) + '...' : flow;
  }
  
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}