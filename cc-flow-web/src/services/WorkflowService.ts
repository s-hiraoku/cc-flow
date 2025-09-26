import { WorkflowMetadata, WorkflowNode, WorkflowEdge } from '@/types/workflow';

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

  static generateWorkflowJSON(metadata: WorkflowMetadata, nodes: WorkflowNode[]): string {
    return JSON.stringify(
      {
        ...metadata,
        workflowSteps: [
          {
            title: "Generated Step",
            mode: "sequential" as const,
            purpose: metadata.workflowPurpose || "Sample workflow step",
            agents: nodes
              .map((node) => node.data.agentName || node.data.label)
              .filter(Boolean),
          },
        ],
      },
      null,
      2
    );
  }

  static validateWorkflowData(metadata: WorkflowMetadata, nodes: WorkflowNode[]): string | null {
    if (!metadata.workflowName?.trim()) {
      return "Workflow name is required";
    }

    if (nodes.length === 0) {
      return "At least one node is required";
    }

    return null;
  }
}