import { Agent } from '@/types/agent';
import { WorkflowNode, WorkflowEdge, WorkflowMetadata } from '@/types/workflow';

export const createMockAgent = (overrides: Partial<Agent> = {}): Agent => ({
  name: 'Test Agent',
  path: '/agents/test-agent.md',
  description: 'A test agent',
  category: 'test',
  ...overrides,
});

export const createMockAgentNode = (overrides: Partial<WorkflowNode> = {}): WorkflowNode => ({
  id: 'node-1',
  type: 'agent',
  data: {
    agentName: 'Test Agent',
    agentPath: '/agents/test-agent.md',
    label: 'Test Agent',
    description: 'A test agent',
  },
  position: { x: 100, y: 100 },
  ...overrides,
});

export const createMockStepGroupNode = (overrides: Partial<WorkflowNode> = {}): WorkflowNode => ({
  id: 'step-1',
  type: 'step-group',
  data: {
    title: 'Test Step',
    mode: 'sequential' as const,
    purpose: 'Test purpose',
    agents: ['agent1', 'agent2'],
    label: 'Test Step',
    description: 'A test step group',
  },
  position: { x: 200, y: 200 },
  ...overrides,
});

export const createMockEdge = (overrides: Partial<WorkflowEdge> = {}): WorkflowEdge => ({
  id: 'edge-1',
  source: 'node-1',
  target: 'node-2',
  type: 'default',
  ...overrides,
});

export const createMockWorkflowMetadata = (overrides: Partial<WorkflowMetadata> = {}): WorkflowMetadata => ({
  workflowName: 'Test Workflow',
  workflowPurpose: 'Test workflow purpose',
  workflowModel: 'default',
  workflowArgumentHint: 'test-hint',
  ...overrides,
});

export const mockAgents: Agent[] = [
  createMockAgent({
    name: 'Agent 1',
    category: 'spec',
    path: '/agents/spec/agent-1.md',
  }),
  createMockAgent({
    name: 'Agent 2',
    category: 'spec',
    path: '/agents/spec/agent-2.md',
  }),
  createMockAgent({
    name: 'Utility Agent',
    category: 'utility',
    path: '/agents/utility/utility-agent.md',
  }),
];

export const mockWorkflowNodes: WorkflowNode[] = [
  createMockAgentNode({
    id: 'agent-1',
    data: {
      agentName: 'Agent 1',
      agentPath: '/agents/agent-1.md',
      label: 'Agent 1',
      description: 'First agent',
    },
  }),
  createMockAgentNode({
    id: 'agent-2',
    data: {
      agentName: 'Agent 2',
      agentPath: '/agents/agent-2.md',
      label: 'Agent 2',
      description: 'Second agent',
    },
  }),
];

export const mockWorkflowEdges: WorkflowEdge[] = [
  createMockEdge({
    id: 'edge-1',
    source: 'agent-1',
    target: 'agent-2',
  }),
];