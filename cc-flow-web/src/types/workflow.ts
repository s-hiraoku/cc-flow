// CC-Flow Workflow Types

export interface WorkflowMetadata {
  workflowName: string;
  workflowPurpose: string;
  workflowModel?: string;
  workflowArgumentHint?: string;
}

export interface WorkflowStep {
  title: string;
  mode: 'sequential' | 'parallel';
  purpose?: string;
  agents: string[];
}

export interface WorkflowConfig extends WorkflowMetadata {
  workflowSteps: WorkflowStep[];
}

// ReactFlow Node Types
export interface AgentNodeData extends Record<string, unknown> {
  agentName: string;
  agentPath?: string;
  label: string;
  description?: string;
}

export interface StepGroupNodeData extends Record<string, unknown> {
  title: string;
  mode: 'sequential' | 'parallel';
  purpose?: string;
  agents: string[];
  label: string;
  description?: string;
}

export type WorkflowNodeData = AgentNodeData | StepGroupNodeData;

// Type guards for better type safety
export function isAgentNodeData(data: WorkflowNodeData): data is AgentNodeData {
  return 'agentName' in data;
}

export function isStepGroupNodeData(data: WorkflowNodeData): data is StepGroupNodeData {
  return 'title' in data && 'mode' in data;
}

export interface WorkflowNode {
  id: string;
  type: 'agent' | 'step-group' | 'start' | 'end';
  data: WorkflowNodeData;
  position: { x: number; y: number };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  type?: 'default' | 'step';
  data?: {
    condition?: string;
  };
}