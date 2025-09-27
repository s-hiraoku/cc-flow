import { WorkflowNode, WorkflowMetadata } from '@/types/workflow';
import { isAgentNodeData } from '@/types/workflow';

export interface WorkflowStepPayload {
  title: string;
  mode: 'sequential' | 'parallel';
  agents: string[];
}

export interface CreateWorkflowPayload {
  workflowName: string;
  workflowPurpose: string;
  workflowModel?: string;
  workflowArgumentHint?: string;
  workflowSteps: WorkflowStepPayload[];
}

/**
 * Creates a workflow JSON payload from metadata and nodes
 */
export function createWorkflowJSON(metadata: WorkflowMetadata, nodes: WorkflowNode[]): string {
  const agents = nodes
    .filter((node) => isAgentNodeData(node.data))
    .map((node) => node.data.agentName || node.data.label)
    .filter(Boolean);

  const payload: CreateWorkflowPayload = {
    workflowName: metadata.workflowName || '',
    workflowPurpose: metadata.workflowPurpose || '',
    workflowModel: metadata.workflowModel || 'default',
    workflowArgumentHint: metadata.workflowArgumentHint || '',
    workflowSteps: [
      {
        title: metadata.workflowPurpose || 'Generated Step',
        mode: 'sequential' as const,
        agents: agents as string[],
      },
    ],
  };

  return JSON.stringify(payload, null, 2);
}