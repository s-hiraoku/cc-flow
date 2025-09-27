import {
  WorkflowMetadata,
  WorkflowNode,
  WorkflowEdge,
  isAgentNodeData,
  isStepGroupNodeData,
  StepGroupNodeData,
} from '@/types/workflow';

export interface WorkflowSaveRequest {
  metadata: WorkflowMetadata;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface WorkflowSaveResponse {
  success: boolean;
  message: string;
  workflowId?: string;
}

export interface SerializedWorkflowNode {
  id: string;
  type: WorkflowNode['type'];
  position: WorkflowNode['position'];
  data: WorkflowNode['data'];
}

export interface SerializedAgentNode {
  id: string;
  label: string;
  agentName: string;
  agentPath?: string;
  description?: string;
}

export interface SerializedStepGroupNode {
  id: string;
  title: string;
  mode: StepGroupNodeData['mode'];
  purpose?: string;
  agents: string[];
}

export interface SerializedWorkflow {
  workflowName: string;
  workflowPurpose: string;
  workflowModel?: string;
  workflowArgumentHint?: string;
  startNode?: {
    id: string;
    label: string;
    description?: string;
  } | null;
  endNode?: {
    id: string;
    label: string;
    description?: string;
  } | null;
  agents: SerializedAgentNode[];
  stepGroups: SerializedStepGroupNode[];
  nodes: SerializedWorkflowNode[];
  edges: WorkflowEdge[];
}

export class WorkflowService {
  private static readonly BASE_URL = '/api/workflows';

  static async saveWorkflow(data: WorkflowSaveRequest): Promise<WorkflowSaveResponse> {
    const response = await fetch(this.BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  static generateWorkflowJSON(
    metadata: WorkflowMetadata,
    nodes: WorkflowNode[],
    edges: WorkflowEdge[] = [],
  ): string {
    return JSON.stringify(
      WorkflowService.buildWorkflowPayload(metadata, nodes, edges),
      null,
      2
    );
  }

  static validateWorkflowData(metadata: WorkflowMetadata, nodes: WorkflowNode[]): string | null {
    const errors: string[] = [];

    if (!metadata.workflowName?.trim()) {
      errors.push('Workflow name is required');
    }

    if (nodes.length === 0) {
      errors.push('At least one node is required');
    }

    const startNodes = nodes.filter((node) => node.type === 'start');
    if (startNodes.length === 0) {
      errors.push('Start node is required');
    } else if (startNodes.length > 1) {
      errors.push('Only one start node is allowed');
    }

    const endNodes = nodes.filter((node) => node.type === 'end');
    if (endNodes.length === 0) {
      errors.push('End node is required');
    } else if (endNodes.length > 1) {
      errors.push('Only one end node is allowed');
    }

    const agentNodes = nodes.filter((node) => node.type === 'agent');
    if (agentNodes.length === 0) {
      errors.push('At least one agent node is required');
    }

    return errors.length ? errors[0] : null;
  }

  static buildWorkflowPayload(
    metadata: WorkflowMetadata,
    nodes: WorkflowNode[],
    edges: WorkflowEdge[],
  ): SerializedWorkflow {
    const startNode = nodes.find((node) => node.type === 'start');
    const endNode = nodes.find((node) => node.type === 'end');

    const agents: SerializedAgentNode[] = nodes
      .filter((node): node is WorkflowNode & { type: 'agent' } => node.type === 'agent')
      .map((node) => {
        const data = node.data;
        const agentData = isAgentNodeData(data) ? data : undefined;
        return {
          id: node.id,
          label: data.label,
          agentName: agentData?.agentName ?? data.label,
          agentPath: agentData?.agentPath,
          description: agentData?.description,
        };
      });

    const stepGroups: SerializedStepGroupNode[] = nodes
      .filter((node): node is WorkflowNode & { type: 'step-group' } => node.type === 'step-group')
      .map((node) => {
        const data = node.data;
        const groupData = isStepGroupNodeData(data) ? data : (data as StepGroupNodeData);
        return {
          id: node.id,
          title: groupData.title,
          mode: groupData.mode,
          purpose: groupData.purpose,
          agents: groupData.agents,
        };
      });

    const serializedNodes: SerializedWorkflowNode[] = nodes.map((node) => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: node.data,
    }));

    return {
      workflowName: metadata.workflowName,
      workflowPurpose: metadata.workflowPurpose,
      workflowModel: metadata.workflowModel,
      workflowArgumentHint: metadata.workflowArgumentHint,
      startNode: startNode
        ? {
            id: startNode.id,
            label: startNode.data.label,
            description: (startNode.data as { description?: string }).description,
          }
        : null,
      endNode: endNode
        ? {
            id: endNode.id,
            label: endNode.data.label,
            description: (endNode.data as { description?: string }).description,
          }
        : null,
      agents,
      stepGroups,
      nodes: serializedNodes,
      edges,
    };
  }
}
