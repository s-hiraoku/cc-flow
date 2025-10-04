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
  category?: string;
  // Workflow step properties
  stepTitle?: string;
  stepMode?: 'sequential' | 'parallel';
  stepPurpose?: string;
  // Validation state
  hasError?: boolean;
}

export interface StepGroupAgent {
  name: string;
  category?: string;
}

export interface StepGroupNodeData extends Record<string, unknown> {
  title: string;
  mode: 'sequential' | 'parallel';
  purpose?: string;
  agents: (string | StepGroupAgent)[];
  label: string;
  description?: string;
  // Validation state
  hasError?: boolean;
}

export interface StartNodeData extends Record<string, unknown> {
  kind: 'start';
  label: string;
  description?: string;
  workflowName?: string;
  workflowPurpose?: string;
  // Validation state
  hasError?: boolean;
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

// Node type guards for generic WorkflowNode
export function isAgentNode(node: WorkflowNode): node is AgentNode {
  return isAgentNodeData(node.data);
}

export function isStepGroupNode(node: WorkflowNode): node is StepGroupNode {
  return isStepGroupNodeData(node.data);
}

export function isStartNode(node: WorkflowNode): node is StartNode {
  return isStartNodeData(node.data);
}

export function isEndNode(node: WorkflowNode): node is EndNode {
  return isEndNodeData(node.data);
}

export interface WorkflowNode<T extends WorkflowNodeData = WorkflowNodeData> {
  id: string;
  type: 'agent' | 'step-group' | 'start' | 'end';
  data: T;
  position: { x: number; y: number };
  style?: React.CSSProperties;
  selected?: boolean;
  measured?: { width?: number; height?: number };
}

// Specific node types for better type safety
export type AgentNode = WorkflowNode<AgentNodeData>;
export type StepGroupNode = WorkflowNode<StepGroupNodeData>;
export type StartNode = WorkflowNode<StartNodeData>;
export type EndNode = WorkflowNode<EndNodeData>;

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  type?: 'default' | 'step' | 'custom';
  selected?: boolean;
  reconnectable?: boolean | 'source' | 'target';
  data?: {
    condition?: string;
  };
}
