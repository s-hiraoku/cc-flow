import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useWorkflowEditor } from '../useWorkflowEditor';
import type { WorkflowNode, WorkflowEdge } from '@/types/workflow';

describe('useWorkflowEditor', () => {
  beforeEach(() => {
    // No setup needed for this hook
  });

  it('should initialize with empty nodes and edges', () => {
    const { result } = renderHook(() => useWorkflowEditor());

    expect(result.current.nodes).toEqual([]);
    expect(result.current.edges).toEqual([]);
    expect(result.current.metadata).toEqual({
      workflowName: "",
      workflowPurpose: "",
      workflowModel: "default",
      workflowArgumentHint: "",
    });
    expect(result.current.canSave).toBe(false);
  });

  it('should update nodes when handleNodesChange is called', () => {
    const { result } = renderHook(() => useWorkflowEditor());

    const newNodes: WorkflowNode[] = [
      {
        id: 'test-node',
        type: 'agent',
        position: { x: 100, y: 100 },
        data: {
          label: 'Test Agent',
          agentName: 'test-agent',
          agentPath: './agents/test-agent.md',
          description: 'Test description',
        },
      },
    ];

    act(() => {
      result.current.handleNodesChange(newNodes);
    });

    expect(result.current.nodes).toEqual(newNodes);
  });

  it('should update edges when handleEdgesChange is called', () => {
    const { result } = renderHook(() => useWorkflowEditor());

    const newEdges: WorkflowEdge[] = [
      {
        id: 'edge-1',
        source: 'node-1',
        target: 'node-2',
        type: 'default',
      },
    ];

    act(() => {
      result.current.handleEdgesChange(newEdges);
    });

    expect(result.current.edges).toEqual(newEdges);
  });

  it('should update metadata when setMetadata is called', () => {
    const { result } = renderHook(() => useWorkflowEditor());

    const newMetadata = {
      workflowName: 'Test Workflow',
      workflowPurpose: 'Test purpose',
      workflowModel: 'claude-3-sonnet',
      workflowArgumentHint: '<test>',
    };

    act(() => {
      result.current.setMetadata(newMetadata);
    });

    expect(result.current.metadata).toEqual(newMetadata);
  });

  it('should enable save when workflow has name and nodes', () => {
    const { result } = renderHook(() => useWorkflowEditor());

    // Initially cannot save
    expect(result.current.canSave).toBe(false);

    // Add workflow name but no nodes
    act(() => {
      result.current.setMetadata({
        workflowName: 'Test Workflow',
        workflowPurpose: '',
        workflowModel: 'default',
        workflowArgumentHint: '',
      });
    });

    expect(result.current.canSave).toBe(false);

    // Add nodes with start, agent, and end nodes
    act(() => {
      result.current.handleNodesChange([
        {
          id: 'start-node',
          type: 'start',
          position: { x: 0, y: 0 },
          data: {
            kind: 'start',
            label: 'Start',
            description: 'Workflow starts here',
          },
        },
        {
          id: 'test-node',
          type: 'agent',
          position: { x: 100, y: 100 },
          data: {
            label: 'Test Agent',
            agentName: 'test-agent',
            agentPath: './agents/test-agent.md',
            description: 'Test description',
          },
        },
        {
          id: 'end-node',
          type: 'end',
          position: { x: 200, y: 200 },
          data: {
            kind: 'end',
            label: 'End',
            description: 'Workflow ends here',
          },
        },
      ]);
    });

    // Add edges to connect nodes
    act(() => {
      result.current.handleEdgesChange([
        { id: 'e1', source: 'start-node', target: 'test-node', type: 'default' },
        { id: 'e2', source: 'test-node', target: 'end-node', type: 'default' },
      ]);
    });

    expect(result.current.canSave).toBe(true);
  });

  it('should generate preview JSON correctly', () => {
    const { result } = renderHook(() => useWorkflowEditor());

    // Set up workflow
    act(() => {
      result.current.setMetadata({
        workflowName: 'Test Workflow',
        workflowPurpose: 'Test purpose',
        workflowModel: 'claude-3-sonnet',
        workflowArgumentHint: '<test>',
      });

      result.current.handleNodesChange([
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
      ]);
    });

    const previewJSON = result.current.generatePreviewJSON();
    const parsed = JSON.parse(previewJSON);

    expect(parsed).toEqual({
      workflowName: 'Test Workflow',
      workflowPurpose: 'Test purpose',
      workflowModel: 'claude-3-sonnet',
      workflowArgumentHint: '<test>',
      workflowSteps: [
        {
          title: 'Generated Step',
          mode: 'sequential',
          purpose: 'Test purpose',
          agents: ['test-agent-1', 'test-agent-2'],
        },
      ],
    });
  });

  it('should handle connect callback', () => {
    const { result } = renderHook(() => useWorkflowEditor());

    // Should not throw error when calling handleConnect
    act(() => {
      result.current.handleConnect({
        source: 'node-1',
        target: 'node-2',
        sourceHandle: null,
        targetHandle: null,
      });
    });

    // No specific assertion needed as this just logs
  });

  it('should handle nodes without agentName in preview', () => {
    const { result } = renderHook(() => useWorkflowEditor());

    act(() => {
      result.current.setMetadata({
        workflowName: 'Test Workflow',
        workflowPurpose: 'Test purpose',
        workflowModel: 'default',
        workflowArgumentHint: '',
      });

      result.current.handleNodesChange([
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
      ]);
    });

    const previewJSON = result.current.generatePreviewJSON();
    const parsed = JSON.parse(previewJSON);

    expect(parsed.workflowSteps[0].agents).toEqual(['test-agent-fallback']);
  });

  it('should disable save when workflow name is empty or whitespace', () => {
    const { result } = renderHook(() => useWorkflowEditor());

    // Add nodes
    act(() => {
      result.current.handleNodesChange([
        {
          id: 'test-node',
          type: 'agent',
          position: { x: 100, y: 100 },
          data: {
            label: 'Test Agent',
            agentName: 'test-agent',
            agentPath: './agents/test-agent.md',
            description: 'Test description',
          },
        },
      ]);
    });

    // Empty name
    act(() => {
      result.current.setMetadata({
        workflowName: '',
        workflowPurpose: '',
        workflowModel: 'default',
        workflowArgumentHint: '',
      });
    });

    expect(result.current.canSave).toBe(false);

    // Whitespace name
    act(() => {
      result.current.setMetadata({
        workflowName: '   ',
        workflowPurpose: '',
        workflowModel: 'default',
        workflowArgumentHint: '',
      });
    });

    expect(result.current.canSave).toBe(false);
  });
});