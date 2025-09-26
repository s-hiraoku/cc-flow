import { useState, useCallback } from 'react';
import { WorkflowMetadata, WorkflowNode, WorkflowEdge } from '@/types/workflow';

interface UseWorkflowSaveReturn {
  saving: boolean;
  error: string | null;
  saveWorkflow: (metadata: WorkflowMetadata, nodes: WorkflowNode[], edges: WorkflowEdge[]) => Promise<boolean>;
}

export function useWorkflowSave(): UseWorkflowSaveReturn {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveWorkflow = useCallback(async (
    metadata: WorkflowMetadata,
    nodes: WorkflowNode[],
    edges: WorkflowEdge[]
  ): Promise<boolean> => {
    if (!metadata.workflowName?.trim()) {
      setError("Workflow name is required");
      return false;
    }

    try {
      setSaving(true);
      setError(null);

      const response = await fetch("/api/workflows", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          metadata,
          nodes,
          edges,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Workflow saved:", result);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error("Error saving workflow:", err);
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  return {
    saving,
    error,
    saveWorkflow,
  };
}