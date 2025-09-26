// CC-Flow Agent Types

export interface Agent {
  name: string;
  path: string;
  description: string;
  category?: string;
  metadata?: Record<string, unknown>;
}

export interface AgentCategory {
  name: string;
  path: string;
  agents: Agent[];
  description?: string;
}

export interface AgentsResponse {
  categories: {
    [category: string]: AgentCategory;
  };
}

