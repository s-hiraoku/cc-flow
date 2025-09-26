import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WorkflowService, WorkflowSaveRequest } from '../WorkflowService';
import type { WorkflowNode, WorkflowEdge, WorkflowMetadata } from '@/types/workflow';

// Mock fetch
global.fetch = vi.fn();

const mockMetadata: WorkflowMetadata = {
  workflowName: 'Test Workflow',
  workflowPurpose: 'Test workflow description',
  workflowModel: 'claude-3-sonnet',
  workflowArgumentHint: '<test>',
};

const mockNodes: WorkflowNode[] = [
  {
    id: 'node-1',
    type: 'agent',
    position: { x: 100, y: 100 },
    data: {
      label: 'Test Agent 1',
      agentName: 'test-agent-1',
      agentPath: './agents/test-agent-1.md',
      description: 'First test agent',
    },
  },
  {
    id: 'node-2',
    type: 'agent',
    position: { x: 200, y: 200 },
    data: {
      label: 'Test Agent 2',
      agentName: 'test-agent-2',
      agentPath: './agents/test-agent-2.md',
      description: 'Second test agent',
    },
  },
];

const mockEdges: WorkflowEdge[] = [
  {
    id: 'edge-1',
    source: 'node-1',
    target: 'node-2',
    type: 'default',
  },
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
        workflowId: 'workflow-123' 
      };
      
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const request: WorkflowSaveRequest = {
        metadata: mockMetadata,
        nodes: mockNodes,
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
      
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => errorData,
      } as Response);

      const request: WorkflowSaveRequest = {
        metadata: mockMetadata,
        nodes: mockNodes,
        edges: mockEdges,
      };

      await expect(WorkflowService.saveWorkflow(request)).rejects.toThrow('Validation failed');
    });

    it('should handle save workflow error without error message', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({}),
      } as Response);

      const request: WorkflowSaveRequest = {
        metadata: mockMetadata,
        nodes: mockNodes,
        edges: mockEdges,
      };

      await expect(WorkflowService.saveWorkflow(request)).rejects.toThrow('HTTP 500: Internal Server Error');
    });

    it('should handle network error', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

      const request: WorkflowSaveRequest = {
        metadata: mockMetadata,
        nodes: mockNodes,
        edges: mockEdges,
      };

      await expect(WorkflowService.saveWorkflow(request)).rejects.toThrow('Network error');
    });

    it('should handle malformed JSON response', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => { throw new Error('Invalid JSON'); },
      } as unknown as Response);

      const request: WorkflowSaveRequest = {
        metadata: mockMetadata,
        nodes: mockNodes,
        edges: mockEdges,
      };

      await expect(WorkflowService.saveWorkflow(request)).rejects.toThrow('HTTP 400: Bad Request');
    });
  });

  describe('generateWorkflowJSON', () => {
    it('should generate workflow JSON correctly', () => {
      const result = WorkflowService.generateWorkflowJSON(mockMetadata, mockNodes);
      const parsed = JSON.parse(result);

      expect(parsed).toEqual({
        workflowName: 'Test Workflow',
        workflowPurpose: 'Test workflow description',
        workflowModel: 'claude-3-sonnet',
        workflowArgumentHint: '<test>',
        workflowSteps: [
          {
            title: 'Generated Step',
            mode: 'sequential',
            purpose: 'Test workflow description',
            agents: ['test-agent-1', 'test-agent-2'],
          },
        ],
      });
    });

    it('should use fallback purpose when workflowPurpose is empty', () => {
      const metadataWithoutPurpose = {
        ...mockMetadata,
        workflowPurpose: '',
      };

      const result = WorkflowService.generateWorkflowJSON(metadataWithoutPurpose, mockNodes);
      const parsed = JSON.parse(result);

      expect(parsed.workflowSteps[0].purpose).toBe('Sample workflow step');
    });

    it('should handle nodes without agentName', () => {
      const nodesWithoutAgentName: WorkflowNode[] = [
        {
          id: 'node-1',
          type: 'agent',
          position: { x: 100, y: 100 },
          data: {
            label: 'Test Agent Without AgentName',
            agentName: 'test-agent-fallback',
            agentPath: './agents/test-agent.md',
            description: 'Test description',
          },
        },
      ];

      const result = WorkflowService.generateWorkflowJSON(mockMetadata, nodesWithoutAgentName);
      const parsed = JSON.parse(result);

      expect(parsed.workflowSteps[0].agents).toEqual(['test-agent-fallback']);
    });

    it('should filter out nodes without label or agentName', () => {
      const nodesWithEmpty: WorkflowNode[] = [
        ...mockNodes,
        {
          id: 'node-3',
          type: 'agent',
          position: { x: 300, y: 300 },
          data: {
            label: '',
            agentName: '',
            agentPath: './agents/empty-agent.md',
            description: 'Empty agent',
          },
        },
      ];

      const result = WorkflowService.generateWorkflowJSON(mockMetadata, nodesWithEmpty);
      const parsed = JSON.parse(result);

      // Should only include nodes with agentName or label
      expect(parsed.workflowSteps[0].agents).toEqual(['test-agent-1', 'test-agent-2']);
    });

    it('should handle empty nodes array', () => {
      const result = WorkflowService.generateWorkflowJSON(mockMetadata, []);
      const parsed = JSON.parse(result);

      expect(parsed.workflowSteps[0].agents).toEqual([]);
    });
  });

  describe('validateWorkflowData', () => {
    it('should return null for valid workflow data', () => {
      const result = WorkflowService.validateWorkflowData(mockMetadata, mockNodes);
      expect(result).toBeNull();
    });

    it('should return error for missing workflow name', () => {
      const invalidMetadata = {
        ...mockMetadata,
        workflowName: '',
      };

      const result = WorkflowService.validateWorkflowData(invalidMetadata, mockNodes);
      expect(result).toBe('Workflow name is required');
    });

    it('should return error for whitespace-only workflow name', () => {
      const invalidMetadata = {
        ...mockMetadata,
        workflowName: '   ',
      };

      const result = WorkflowService.validateWorkflowData(invalidMetadata, mockNodes);
      expect(result).toBe('Workflow name is required');
    });

    it('should return error for empty nodes array', () => {
      const result = WorkflowService.validateWorkflowData(mockMetadata, []);
      expect(result).toBe('At least one node is required');
    });

    it('should handle undefined workflow name', () => {
      const invalidMetadata = {
        ...mockMetadata,
        workflowName: undefined as any,
      };

      const result = WorkflowService.validateWorkflowData(invalidMetadata, mockNodes);
      expect(result).toBe('Workflow name is required');
    });
  });
});