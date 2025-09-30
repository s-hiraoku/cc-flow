import { describe, it, expect } from 'vitest';
import {
  createWorkflowJSON,
  validateWorkflowGraph,
  WorkflowValidationError,
} from '../workflowUtils';
import {
  WorkflowNode,
  WorkflowEdge,
  WorkflowMetadata,
  AgentNodeData,
  StepGroupNodeData,
  StartNodeData,
  EndNodeData,
} from '@/types/workflow';

describe('Workflow Graph Traversal', () => {
  const createStartNode = (id: string): WorkflowNode<StartNodeData> => ({
    id,
    type: 'start',
    data: { kind: 'start', label: 'Start' },
    position: { x: 0, y: 0 },
  });

  const createEndNode = (id: string): WorkflowNode<EndNodeData> => ({
    id,
    type: 'end',
    data: { kind: 'end', label: 'End' },
    position: { x: 0, y: 0 },
  });

  const createAgentNode = (
    id: string,
    agentName: string
  ): WorkflowNode<AgentNodeData> => ({
    id,
    type: 'agent',
    data: {
      agentName,
      label: agentName,
      stepTitle: agentName,
      stepMode: 'sequential',
      stepPurpose: '',
    },
    position: { x: 0, y: 0 },
  });

  const createStepGroupNode = (
    id: string,
    title: string,
    agents: string[]
  ): WorkflowNode<StepGroupNodeData> => ({
    id,
    type: 'step-group',
    data: {
      title,
      mode: 'parallel',
      purpose: '',
      agents,
      label: title,
    },
    position: { x: 0, y: 0 },
  });

  const createEdge = (source: string, target: string): WorkflowEdge => ({
    id: `${source}-${target}`,
    source,
    target,
  });

  const metadata: WorkflowMetadata = {
    workflowName: 'test-workflow',
    workflowPurpose: 'Test workflow',
    workflowModel: 'default',
    workflowArgumentHint: '<context>',
  };

  describe('Valid Workflows', () => {
    it('should handle simple sequential flow: Start → Agent1 → Agent2 → End', () => {
      const nodes: WorkflowNode[] = [
        createStartNode('start'),
        createAgentNode('agent1', 'Agent1'),
        createAgentNode('agent2', 'Agent2'),
        createEndNode('end'),
      ];

      const edges: WorkflowEdge[] = [
        createEdge('start', 'agent1'),
        createEdge('agent1', 'agent2'),
        createEdge('agent2', 'end'),
      ];

      const result = createWorkflowJSON(metadata, nodes, edges);
      const parsed = JSON.parse(result);

      expect(parsed.workflowSteps).toHaveLength(2);
      expect(parsed.workflowSteps[0].agents).toEqual(['Agent1']);
      expect(parsed.workflowSteps[1].agents).toEqual(['Agent2']);
    });

    it('should handle parallel group: Start → StepGroup → End', () => {
      const nodes: WorkflowNode[] = [
        createStartNode('start'),
        createStepGroupNode('group1', 'Parallel Group', ['Agent1', 'Agent2']),
        createEndNode('end'),
      ];

      const edges: WorkflowEdge[] = [
        createEdge('start', 'group1'),
        createEdge('group1', 'end'),
      ];

      const result = createWorkflowJSON(metadata, nodes, edges);
      const parsed = JSON.parse(result);

      expect(parsed.workflowSteps).toHaveLength(1);
      expect(parsed.workflowSteps[0].mode).toBe('parallel');
      expect(parsed.workflowSteps[0].agents).toEqual(['Agent1', 'Agent2']);
    });

    it('should handle mixed flow: Start → Agent1 → StepGroup → Agent2 → End', () => {
      const nodes: WorkflowNode[] = [
        createStartNode('start'),
        createAgentNode('agent1', 'Agent1'),
        createStepGroupNode('group1', 'Parallel Group', ['Agent2', 'Agent3']),
        createAgentNode('agent4', 'Agent4'),
        createEndNode('end'),
      ];

      const edges: WorkflowEdge[] = [
        createEdge('start', 'agent1'),
        createEdge('agent1', 'group1'),
        createEdge('group1', 'agent4'),
        createEdge('agent4', 'end'),
      ];

      const result = createWorkflowJSON(metadata, nodes, edges);
      const parsed = JSON.parse(result);

      expect(parsed.workflowSteps).toHaveLength(3);
      expect(parsed.workflowSteps[0].agents).toEqual(['Agent1']);
      expect(parsed.workflowSteps[1].agents).toEqual(['Agent2', 'Agent3']);
      expect(parsed.workflowSteps[1].mode).toBe('parallel');
      expect(parsed.workflowSteps[2].agents).toEqual(['Agent4']);
    });

    it('should handle branching flow: Start → Agent1 → [Agent2, Agent3] → End', () => {
      const nodes: WorkflowNode[] = [
        createStartNode('start'),
        createAgentNode('agent1', 'Agent1'),
        createAgentNode('agent2', 'Agent2'),
        createAgentNode('agent3', 'Agent3'),
        createEndNode('end'),
      ];

      const edges: WorkflowEdge[] = [
        createEdge('start', 'agent1'),
        createEdge('agent1', 'agent2'),
        createEdge('agent1', 'agent3'),
        createEdge('agent2', 'end'),
        createEdge('agent3', 'end'),
      ];

      const result = createWorkflowJSON(metadata, nodes, edges);
      const parsed = JSON.parse(result);

      // BFS should visit all nodes in breadth-first order
      expect(parsed.workflowSteps).toHaveLength(3);
      expect(parsed.workflowSteps[0].agents).toEqual(['Agent1']);
    });
  });

  describe('Invalid Workflows', () => {
    it('should throw error when Start node is missing', () => {
      const nodes: WorkflowNode[] = [
        createAgentNode('agent1', 'Agent1'),
        createEndNode('end'),
      ];

      const edges: WorkflowEdge[] = [createEdge('agent1', 'end')];

      expect(() => createWorkflowJSON(metadata, nodes, edges)).toThrow(
        WorkflowValidationError
      );
      expect(() => createWorkflowJSON(metadata, nodes, edges)).toThrow(
        'Start node is required'
      );
    });

    it('should throw error when End node is missing', () => {
      const nodes: WorkflowNode[] = [
        createStartNode('start'),
        createAgentNode('agent1', 'Agent1'),
      ];

      const edges: WorkflowEdge[] = [createEdge('start', 'agent1')];

      expect(() => createWorkflowJSON(metadata, nodes, edges)).toThrow(
        WorkflowValidationError
      );
      expect(() => createWorkflowJSON(metadata, nodes, edges)).toThrow(
        'End node is required'
      );
    });

    it('should throw error when End is not reachable from Start', () => {
      const nodes: WorkflowNode[] = [
        createStartNode('start'),
        createAgentNode('agent1', 'Agent1'),
        createAgentNode('agent2', 'Agent2'),
        createEndNode('end'),
      ];

      const edges: WorkflowEdge[] = [
        createEdge('start', 'agent1'),
        createEdge('agent2', 'end'),
        // agent1 and agent2 are not connected
      ];

      expect(() => createWorkflowJSON(metadata, nodes, edges)).toThrow(
        WorkflowValidationError
      );
      expect(() => createWorkflowJSON(metadata, nodes, edges)).toThrow(
        'End node is not reachable from Start node'
      );
    });

    it('should throw error when disconnected nodes exist', () => {
      const nodes: WorkflowNode[] = [
        createStartNode('start'),
        createAgentNode('agent1', 'Agent1'),
        createAgentNode('agent2', 'Agent2'),
        createEndNode('end'),
      ];

      const edges: WorkflowEdge[] = [
        createEdge('start', 'agent1'),
        createEdge('agent1', 'end'),
        // agent2 is disconnected
      ];

      expect(() => createWorkflowJSON(metadata, nodes, edges)).toThrow(
        WorkflowValidationError
      );
      expect(() => createWorkflowJSON(metadata, nodes, edges)).toThrow(
        /disconnected nodes found/
      );
    });

    it('should throw error when cycle is detected', () => {
      const nodes: WorkflowNode[] = [
        createStartNode('start'),
        createAgentNode('agent1', 'Agent1'),
        createAgentNode('agent2', 'Agent2'),
        createEndNode('end'),
      ];

      const edges: WorkflowEdge[] = [
        createEdge('start', 'agent1'),
        createEdge('agent1', 'agent2'),
        createEdge('agent2', 'agent1'), // Creates cycle
        createEdge('agent2', 'end'),
      ];

      expect(() => createWorkflowJSON(metadata, nodes, edges)).toThrow(
        WorkflowValidationError
      );
      expect(() => createWorkflowJSON(metadata, nodes, edges)).toThrow(
        'Cycle detected in workflow graph'
      );
    });
  });

  describe('validateWorkflowGraph', () => {
    it('should return valid result for correct workflow', () => {
      const nodes: WorkflowNode[] = [
        createStartNode('start'),
        createAgentNode('agent1', 'Agent1'),
        createEndNode('end'),
      ];

      const edges: WorkflowEdge[] = [
        createEdge('start', 'agent1'),
        createEdge('agent1', 'end'),
      ];

      const result = validateWorkflowGraph(nodes, edges);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return detailed error information for invalid workflow', () => {
      const nodes: WorkflowNode[] = [
        createStartNode('start'),
        createAgentNode('agent1', 'Agent1'),
        createAgentNode('agent2', 'Agent2'),
        createEndNode('end'),
      ];

      const edges: WorkflowEdge[] = [
        createEdge('start', 'agent1'),
        createEdge('agent1', 'end'),
      ];

      const result = validateWorkflowGraph(nodes, edges);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('1 disconnected nodes found: agent2');
      expect(result.disconnectedNodes).toHaveLength(1);
      expect(result.disconnectedNodes![0].id).toBe('agent2');
    });
  });

  describe('Edge Cases', () => {
    it('should handle workflow with only Start and End', () => {
      const nodes: WorkflowNode[] = [
        createStartNode('start'),
        createEndNode('end'),
      ];

      const edges: WorkflowEdge[] = [createEdge('start', 'end')];

      const result = createWorkflowJSON(metadata, nodes, edges);
      const parsed = JSON.parse(result);

      expect(parsed.workflowSteps).toHaveLength(0);
    });

    it('should preserve metadata in output', () => {
      const customMetadata: WorkflowMetadata = {
        workflowName: 'custom-workflow',
        workflowPurpose: 'Custom purpose',
        workflowModel: 'claude-3-opus',
        workflowArgumentHint: '<custom>',
      };

      const nodes: WorkflowNode[] = [
        createStartNode('start'),
        createAgentNode('agent1', 'Agent1'),
        createEndNode('end'),
      ];

      const edges: WorkflowEdge[] = [
        createEdge('start', 'agent1'),
        createEdge('agent1', 'end'),
      ];

      const result = createWorkflowJSON(customMetadata, nodes, edges);
      const parsed = JSON.parse(result);

      expect(parsed.workflowName).toBe('custom-workflow');
      expect(parsed.workflowPurpose).toBe('Custom purpose');
      expect(parsed.workflowModel).toBe('claude-3-opus');
      expect(parsed.workflowArgumentHint).toBe('<custom>');
    });
  });
});