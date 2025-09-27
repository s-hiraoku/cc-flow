import { useState, useCallback } from 'react';
import { WorkflowMetadata, WorkflowNode, WorkflowEdge } from '@/types/workflow';

interface SaveSuccessSummary {
  workflowName: string;
  filename?: string;
  path?: string;
}

interface UseWorkflowSaveReturn {
  saving: boolean;
  error: string | null;
  lastSaved: SaveSuccessSummary | null;
  saveWorkflow: (metadata: WorkflowMetadata, nodes: WorkflowNode[], edges: WorkflowEdge[]) => Promise<boolean>;
}

export function useWorkflowSave(): UseWorkflowSaveReturn {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<SaveSuccessSummary | null>(null);

  const saveWorkflow = useCallback(async (
    metadata: WorkflowMetadata,
    nodes: WorkflowNode[],
    edges: WorkflowEdge[]
  ): Promise<boolean> => {
    if (!metadata.workflowName?.trim()) {
      setError("Workflow name is required");
      setLastSaved(null);
      return false;
    }

    try {
      setSaving(true);
      setError(null);
      setLastSaved(null);

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

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      console.log("Workflow saved:", result);
      setLastSaved({
        workflowName: metadata.workflowName,
        filename: result.filename,
        path: result.path,
      });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setLastSaved(null);
      console.error("Error saving workflow:", err);
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  return {
    saving,
    error,
    lastSaved,
    saveWorkflow,
  };
}
