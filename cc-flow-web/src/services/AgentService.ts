import { Agent, AgentsResponse } from '@/types/agent';

export class AgentService {
  private static readonly BASE_URL = '/api/agents';

  static async fetchAgents(): Promise<Agent[]> {
    const response = await fetch(this.BASE_URL);

    if (!response.ok) {
      throw new Error(`Failed to fetch agents: ${response.status} ${response.statusText}`);
    }

    const data: AgentsResponse = await response.json();

    // Extract all agents from categories
    const allAgents: Agent[] = [];
    Object.values(data.categories || {}).forEach((category) => {
      if (category?.agents) {
        allAgents.push(...category.agents);
      }
    });

    return allAgents;
  }

  static filterAgentsByCategory(agents: Agent[], category: string): Agent[] {
    if (category === 'all') {
      return agents;
    }
    return agents.filter(agent => agent.category === category);
  }

  static filterAgentsBySearch(agents: Agent[], searchTerm: string): Agent[] {
    const term = searchTerm.toLowerCase();
    return agents.filter(agent =>
      agent.name.toLowerCase().includes(term) ||
      agent.description.toLowerCase().includes(term)
    );
  }

  static getUniqueCategories(agents: Agent[]): string[] {
    const categories = new Set(agents.map(agent => agent.category || 'uncategorized'));
    return ['all', ...Array.from(categories)];
  }
}