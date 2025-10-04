import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AgentService } from '../AgentService';
import type { Agent } from '@/types/agent';

// Mock fetch
global.fetch = vi.fn() as unknown as typeof fetch;

const mockAgents: Agent[] = [
  {
    name: 'Test Agent 1',
    description: 'First test agent for specification tasks',
    category: 'spec',
    path: './agents/spec/agent-1.md',
  },
  {
    name: 'Test Agent 2',
    description: 'Second test agent for utility tasks',
    category: 'utility',
    path: './agents/utility/agent-2.md',
  },
  {
    name: 'Debug Agent',
    description: 'Agent for debugging and analysis',
    category: 'spec',
    path: './agents/spec/debug-agent.md',
  },
];

describe('AgentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchAgents', () => {
    it('should fetch all agents successfully', async () => {
      const mockResponse = {
        categories: {
          spec: {
            name: 'spec',
            path: './agents/spec',
            agents: [mockAgents[0], mockAgents[2]],
          },
          utility: {
            name: 'utility',
            path: './agents/utility',
            agents: [mockAgents[1]],
          },
        },
      };

      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await AgentService.fetchAgents();

      expect(fetch).toHaveBeenCalledWith('/api/agents');
      expect(result).toHaveLength(3);
      expect(result).toEqual([mockAgents[0], mockAgents[2], mockAgents[1]]);
    });

    it('should handle fetch agents error', async () => {
      fetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      await expect(AgentService.fetchAgents()).rejects.toThrow(
        'Failed to fetch agents: 500 Internal Server Error'
      );
    });

    it('should handle network error', async () => {
      fetch.mockRejectedValue(new Error('Network error'));

      await expect(AgentService.fetchAgents()).rejects.toThrow('Network error');
    });

    it('should handle empty categories response', async () => {
      const mockResponse = { categories: {} };

      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await AgentService.fetchAgents();

      expect(result).toEqual([]);
    });
  });

  describe('filterAgentsByCategory', () => {
    it('should filter agents by category', () => {
      const result = AgentService.filterAgentsByCategory(mockAgents, 'spec');
      
      expect(result).toHaveLength(2);
      expect(result).toEqual([mockAgents[0], mockAgents[2]]);
    });

    it('should return all agents when category is "all"', () => {
      const result = AgentService.filterAgentsByCategory(mockAgents, 'all');
      
      expect(result).toEqual(mockAgents);
    });

    it('should return empty array for non-existent category', () => {
      const result = AgentService.filterAgentsByCategory(mockAgents, 'non-existent');
      
      expect(result).toEqual([]);
    });
  });

  describe('filterAgentsBySearch', () => {
    it('should filter agents by name', () => {
      const result = AgentService.filterAgentsBySearch(mockAgents, 'Debug');
      
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Debug Agent');
    });

    it('should filter agents by description', () => {
      const result = AgentService.filterAgentsBySearch(mockAgents, 'specification');
      
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Test Agent 1');
    });

    it('should be case insensitive', () => {
      const result = AgentService.filterAgentsBySearch(mockAgents, 'TEST');
      
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no matches found', () => {
      const result = AgentService.filterAgentsBySearch(mockAgents, 'xyz123');
      
      expect(result).toEqual([]);
    });

    it('should return all agents for empty search term', () => {
      const result = AgentService.filterAgentsBySearch(mockAgents, '');
      
      expect(result).toEqual(mockAgents);
    });
  });

  describe('getUniqueCategories', () => {
    it('should return unique categories with "all" first', () => {
      const result = AgentService.getUniqueCategories(mockAgents);
      
      expect(result).toEqual(['all', 'spec', 'utility']);
    });

    it('should handle agents without category', () => {
      const agentsWithoutCategory = [
        ...mockAgents,
        {
          name: 'No Category Agent',
          description: 'Agent without category',
          path: './agents/no-category.md',
        },
      ];

      const result = AgentService.getUniqueCategories(agentsWithoutCategory);
      
      expect(result).toContain('uncategorized');
    });

    it('should handle empty agents array', () => {
      const result = AgentService.getUniqueCategories([]);
      
      expect(result).toEqual(['all']);
    });
  });
});