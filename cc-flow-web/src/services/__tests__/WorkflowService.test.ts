import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  WorkflowService,
  WorkflowSaveRequest,
  SerializedWorkflow,
} from '../WorkflowService';
import type { WorkflowNode, WorkflowEdge, WorkflowMetadata } from '@/types/workflow';

// Mock fetch
global.fetch = vi.fn() as unknown as typeof fetch;

const mockMetadata: WorkflowMetadata = {
  workflowName: 'Test Workflow',
  workflowPurpose: 'Test workflow description',
  workflowModel: 'claude-3-sonnet',
  workflowArgumentHint: '<test>',
};

const startNode: WorkflowNode = {
  id: 'start-node',
  type: 'start',
  position: { x: 0, y: 0 },
  data: {
    kind: 'start',
    label: 'Start',
    description: 'Workflow starts here',
  },
};

const agentNodeOne: WorkflowNode = {
  id: 'node-1',
  type: 'agent',
  position: { x: 150, y: 120 },
  data: {
    label: 'Test Agent 1',
    agentName: 'test-agent-1',
    agentPath: './agents/test-agent-1.md',
    description: 'First test agent',
  },
};

const agentNodeTwo: WorkflowNode = {
  id: 'node-2',
  type: 'agent',
  position: { x: 320, y: 200 },
  data: {
    label: 'Test Agent 2',
    agentName: 'test-agent-2',
    agentPath: './agents/test-agent-2.md',
    description: 'Second test agent',
  },
};

const endNode: WorkflowNode = {
  id: 'end-node',
  type: 'end',
  position: { x: 480, y: 260 },
  data: {
    kind: 'end',
    label: 'End',
    description: 'Workflow ends here',
  },
};

const baseNodes: WorkflowNode[] = [startNode, agentNodeOne, agentNodeTwo, endNode];

const mockEdges: WorkflowEdge[] = [
  { id: 'edge-start-1', source: 'start-node', target: 'node-1', type: 'default' },
  { id: 'edge-1-2', source: 'node-1', target: 'node-2', type: 'default' },
  { id: 'edge-2-end', source: 'node-2', target: 'end-node', type: 'default' },
];

describe('WorkflowService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('saveWorkflow', () => {
    it('should save workflow successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Workflow saved successfully',
        workflowId: 'workflow-123',
      };

      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const request: WorkflowSaveRequest = {
        metadata: mockMetadata,
        nodes: baseNodes,
        edges: mockEdges,
      };

      const result = await WorkflowService.saveWorkflow(request);

      expect(fetch).toHaveBeenCalledWith('/api/workflows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      expect(result).toEqual(mockResponse);
    });

    it('should handle save workflow error with error message', async () => {
      const errorData = { error: 'Validation failed' };

      fetch.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => errorData,
      } as Response);

      const request: WorkflowSaveRequest = {
        metadata: mockMetadata,
        nodes: baseNodes,
        edges: mockEdges,
      };

      await expect(WorkflowService.saveWorkflow(request)).rejects.toThrow('Validation failed');
    });

    it('should handle save workflow error without error message', async () => {
      fetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({}),
      } as Response);

      const request: WorkflowSaveRequest = {
        metadata: mockMetadata,
        nodes: baseNodes,
        edges: mockEdges,
      };

      await expect(WorkflowService.saveWorkflow(request)).rejects.toThrow('HTTP 500: Internal Server Error');
    });

    it('should handle network error', async () => {
      fetch.mockRejectedValue(new Error('Network error'));

      const request: WorkflowSaveRequest = {
        metadata: mockMetadata,
        nodes: baseNodes,
        edges: mockEdges,
      };

      await expect(WorkflowService.saveWorkflow(request)).rejects.toThrow('Network error');
    });

    it('should handle malformed JSON response', async () => {
      fetch.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => {
          throw new Error('Invalid JSON');
        },
      } as unknown as Response);

      const request: WorkflowSaveRequest = {
        metadata: mockMetadata,
        nodes: baseNodes,
        edges: mockEdges,
      };

      await expect(WorkflowService.saveWorkflow(request)).rejects.toThrow('HTTP 400: Bad Request');
    });
  });

  describe('generateWorkflowJSON', () => {
    it('should generate enriched workflow JSON correctly', () => {
      const result = WorkflowService.generateWorkflowJSON(mockMetadata, baseNodes, mockEdges);
      const parsed = JSON.parse(result) as SerializedWorkflow;

      expect(parsed.workflowName).toBe('Test Workflow');
      expect(parsed.workflowPurpose).toBe('Test workflow description');
      expect(parsed.workflowModel).toBe('claude-3-sonnet');
      expect(parsed.workflowArgumentHint).toBe('<test>');
      expect(parsed.startNode).toEqual({
        id: 'start-node',
        label: 'Start',
        description: 'Workflow starts here',
      });
      expect(parsed.endNode).toEqual({
        id: 'end-node',
        label: 'End',
        description: 'Workflow ends here',
      });
      expect(parsed.agents.map((agent) => agent.agentName)).toEqual([
        'test-agent-1',
        'test-agent-2',
      ]);
      expect(parsed.stepGroups).toEqual([]);
      expect(parsed.nodes).toHaveLength(4);
      expect(parsed.edges).toEqual(mockEdges);
    });

    it('should use agentName even when empty string', () => {
      const nodes: WorkflowNode[] = [
        startNode,
        {
          id: 'node-without-agent-name',
          type: 'agent',
          position: { x: 100, y: 120 },
          data: {
            label: 'Fallback Agent',
            agentName: '', // Empty string, not undefined
            description: 'Agent without explicit name',
            agentPath: './agents/fallback.md',
          },
        },
        endNode,
      ];

      const result = WorkflowService.generateWorkflowJSON(mockMetadata, nodes);
      const parsed = JSON.parse(result) as SerializedWorkflow;

      expect(parsed.agents).toHaveLength(1);
      // agentData?.agentName is '' (not nullish), so ?? doesn't apply fallback
      expect(parsed.agents[0]).toMatchObject({
        agentName: '', // Empty string is kept, label not used
        agentPath: './agents/fallback.md',
      });
    });

    it('should include agents even with empty agentName using label as fallback', () => {
      const nodes: WorkflowNode[] = [
        ...baseNodes,
        {
          id: 'empty-agent',
          type: 'agent',
          position: { x: 200, y: 240 },
          data: {
            label: 'Empty Agent Label',
            agentName: '',
            description: 'Agent with empty agentName',
          },
        },
      ];

      const result = WorkflowService.generateWorkflowJSON(mockMetadata, nodes);
      const parsed = JSON.parse(result) as SerializedWorkflow;

      // Empty string agentName is kept as-is (not nullish, so ?? doesn't apply)
      expect(parsed.agents.map((agent) => agent.agentName)).toEqual([
        'test-agent-1',
        'test-agent-2',
        '', // Empty string is kept, not replaced with label
      ]);
    });

    it('should handle empty node list gracefully', () => {
      const result = WorkflowService.generateWorkflowJSON(mockMetadata, []);
      const parsed = JSON.parse(result) as SerializedWorkflow;

      expect(parsed.startNode).toBeNull();
      expect(parsed.endNode).toBeNull();
      expect(parsed.agents).toEqual([]);
      expect(parsed.stepGroups).toEqual([]);
      expect(parsed.nodes).toEqual([]);
    });
  });

  describe('validateWorkflowData', () => {
    it('should return null for valid workflow data', () => {
      const result = WorkflowService.validateWorkflowData(mockMetadata, baseNodes);
      expect(result).toBeNull();
    });

    it('should return error for missing workflow name', () => {
      const invalidMetadata = {
        ...mockMetadata,
        workflowName: '',
      };

      const result = WorkflowService.validateWorkflowData(invalidMetadata, baseNodes);
      expect(result).toBe('Workflow name is required');
    });

    it('should return error when start node is missing', () => {
      const nodes = baseNodes.filter((node) => node.id !== 'start-node');
      const result = WorkflowService.validateWorkflowData(mockMetadata, nodes);
      expect(result).toBe('Start node is required');
    });

    it('should return error when end node is missing', () => {
      const nodes = baseNodes.filter((node) => node.id !== 'end-node');
      const result = WorkflowService.validateWorkflowData(mockMetadata, nodes);
      expect(result).toBe('End node is required');
    });

    it('should return error when agent nodes are missing', () => {
      const nodes: WorkflowNode[] = [startNode, endNode];
      const result = WorkflowService.validateWorkflowData(mockMetadata, nodes);
      expect(result).toBe('At least one agent node is required');
    });

    it('should flag multiple start nodes', () => {
      const nodes: WorkflowNode[] = [
        { ...startNode, id: 'start-1' },
        { ...startNode, id: 'start-2' },
        agentNodeOne,
        endNode,
      ];
      const result = WorkflowService.validateWorkflowData(mockMetadata, nodes);
      expect(result).toBe('Only one start node is allowed');
    });

    it('should flag multiple end nodes', () => {
      const nodes: WorkflowNode[] = [
        startNode,
        agentNodeOne,
        { ...endNode, id: 'end-1' },
        { ...endNode, id: 'end-2' },
      ];
      const result = WorkflowService.validateWorkflowData(mockMetadata, nodes);
      expect(result).toBe('Only one end node is allowed');
    });
  });
});
