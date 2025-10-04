import { useState, useCallback } from 'react';
import { WorkflowMetadata, WorkflowNode, WorkflowEdge } from '@/types/workflow';

interface RestoreSuccessSummary {
  workflowName: string;
  nodeCount: number;
  edgeCount: number;
}

interface UseWorkflowRestoreReturn {
  restoring: boolean;
  error: string | null;
  lastRestored: RestoreSuccessSummary | null;
  restoreWorkflow: (file: File) => Promise<{
    metadata: WorkflowMetadata;
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
  } | null>;
}

interface WorkflowJSON {
  workflowName: string;
  workflowPurpose?: string;
  workflowModel?: string;
  workflowArgumentHint?: string;
  workflowSteps: Array<{
    title: string;
    mode: 'sequential' | 'parallel';
    purpose?: string;
    agents: string[];
  }>;
  nodes?: WorkflowNode[];
  edges?: WorkflowEdge[];
}

export function useWorkflowRestore(): UseWorkflowRestoreReturn {
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRestored, setLastRestored] = useState<RestoreSuccessSummary | null>(null);

  const restoreWorkflow = useCallback(async (file: File) => {
    try {
      setRestoring(true);
      setError(null);
      setLastRestored(null);

      // Read file content
      const content = await file.text();
      const data = JSON.parse(content) as WorkflowJSON;

      // Validate required fields
      if (!data.workflowName) {
        throw new Error('Invalid workflow file: missing workflowName');
      }

      if (!data.workflowSteps || !Array.isArray(data.workflowSteps)) {
        throw new Error('Invalid workflow file: missing or invalid workflowSteps');
      }

      // Extract metadata
      const metadata: WorkflowMetadata = {
        workflowName: data.workflowName,
        workflowPurpose: data.workflowPurpose || '',
        workflowModel: data.workflowModel,
        workflowArgumentHint: data.workflowArgumentHint,
      };

      // Extract nodes and edges if available, otherwise reconstruct from steps
      let nodes: WorkflowNode[] = [];
      let edges: WorkflowEdge[] = [];

      if (data.nodes && data.edges) {
        // Use saved nodes and edges directly
        nodes = data.nodes;
        edges = data.edges;
      } else {
        // Reconstruct nodes and edges from workflowSteps
        nodes = reconstructNodesFromSteps(data.workflowSteps);
        edges = reconstructEdgesFromSteps(data.workflowSteps, nodes);
      }

      setLastRestored({
        workflowName: data.workflowName,
        nodeCount: nodes.length,
        edgeCount: edges.length,
      });

      return { metadata, nodes, edges };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to restore workflow';
      setError(errorMessage);
      setLastRestored(null);
      console.error('Error restoring workflow:', err);
      return null;
    } finally {
      setRestoring(false);
    }
  }, []);

  return {
    restoring,
    error,
    lastRestored,
    restoreWorkflow,
  };
}

// Reconstruct nodes from workflow steps
function reconstructNodesFromSteps(steps: WorkflowJSON['workflowSteps']): WorkflowNode[] {
  const nodes: WorkflowNode[] = [];

  // Add start node
  nodes.push({
    id: 'start',
    type: 'start',
    position: { x: 100, y: 100 },
    data: { label: 'Start' },
  });

  let yPosition = 250;

  // Add step group nodes
  steps.forEach((step, index) => {
    const stepId = `step-${index + 1}`;

    nodes.push({
      id: stepId,
      type: 'stepGroup',
      position: { x: 100, y: yPosition },
      data: {
        label: step.title,
        mode: step.mode,
        purpose: step.purpose,
        agents: step.agents,
      },
    });

    yPosition += 200;
  });

  // Add end node
  nodes.push({
    id: 'end',
    type: 'end',
    position: { x: 100, y: yPosition },
    data: { label: 'End' },
  });

  return nodes;
}

// Reconstruct edges from workflow steps
function reconstructEdgesFromSteps(
  steps: WorkflowJSON['workflowSteps'],
  nodes: WorkflowNode[]
): WorkflowEdge[] {
  const edges: WorkflowEdge[] = [];

  // Connect start to first step
  if (nodes.length > 2) {
    edges.push({
      id: 'e-start-step-1',
      source: 'start',
      target: 'step-1',
      type: 'smoothstep',
    });
  }

  // Connect steps sequentially
  for (let i = 0; i < steps.length - 1; i++) {
    edges.push({
      id: `e-step-${i + 1}-step-${i + 2}`,
      source: `step-${i + 1}`,
      target: `step-${i + 2}`,
      type: 'smoothstep',
    });
  }

  // Connect last step to end
  if (steps.length > 0) {
    edges.push({
      id: `e-step-${steps.length}-end`,
      source: `step-${steps.length}`,
      target: 'end',
      type: 'smoothstep',
    });
  }

  return edges;
}
