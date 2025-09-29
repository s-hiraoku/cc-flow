import { WorkflowNode, WorkflowMetadata, isAgentNode } from "@/types/workflow";

export type WorkflowMode = "sequential" | "parallel";

export interface WorkflowStepPayload {
  title: string;
  mode: WorkflowMode;
  purpose: string;
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
export function createWorkflowJSON(
  metadata: WorkflowMetadata,
  nodes: WorkflowNode[]
): string {
  const agentNodes = nodes.filter(isAgentNode);

  const workflowSteps: WorkflowStepPayload[] = agentNodes.map((node) => {
    // node.data is now strongly typed as AgentNodeData
    const agentName = node.data.agentName || node.data.label;
    return {
      title: node.data.stepTitle || agentName,
      mode: node.data.stepMode || "sequential",
      purpose: node.data.stepPurpose || "",
      agents: [agentName],
    };
  });

  const payload: CreateWorkflowPayload = {
    workflowName: metadata.workflowName || "",
    workflowPurpose: metadata.workflowPurpose || "",
    workflowModel: metadata.workflowModel || "default",
    workflowArgumentHint: metadata.workflowArgumentHint || "",
    workflowSteps,
  };

  return JSON.stringify(payload, null, 2);
}
