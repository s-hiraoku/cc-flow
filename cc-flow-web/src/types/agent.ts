// CC-Flow Agent Types

export interface Agent {
  name: string;
  path: string;
  description: string;
  metadata?: Record<string, any>;
}

export interface AgentCategory {
  path: string;
  agents: Agent[];
}

export interface AgentsResponse {
  categories: {
    [category: string]: AgentCategory;
  };
}