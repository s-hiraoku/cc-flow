// CC-Flow Workflow Types
import React from 'react';

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

export interface StartNodeData extends Record<string, unknown> {
  kind: 'start';
  label: string;
  description?: string;
}

export interface EndNodeData extends Record<string, unknown> {
  kind: 'end';
  label: string;
  description?: string;
}

export type WorkflowNodeData =
  | AgentNodeData
  | StepGroupNodeData
  | StartNodeData
  | EndNodeData;

// Type guards for better type safety
export function isAgentNodeData(data: WorkflowNodeData): data is AgentNodeData {
  return 'agentName' in data;
}

export function isStepGroupNodeData(data: WorkflowNodeData): data is StepGroupNodeData {
  return 'title' in data && 'mode' in data;
}

export function isStartNodeData(data: WorkflowNodeData): data is StartNodeData {
  return 'kind' in data && (data as StartNodeData).kind === 'start';
}

export function isEndNodeData(data: WorkflowNodeData): data is EndNodeData {
  return 'kind' in data && (data as EndNodeData).kind === 'end';
}

export interface WorkflowNode {
  id: string;
  type: 'agent' | 'step-group' | 'start' | 'end';
  data: WorkflowNodeData;
  position: { x: number; y: number };
  style?: React.CSSProperties;
  selected?: boolean;
  measured?: { width?: number; height?: number };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  type?: 'default' | 'step' | 'custom';
  selected?: boolean;
  data?: {
    condition?: string;
  };
}
