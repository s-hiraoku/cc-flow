import { useState, useCallback } from 'react';
import { WorkflowMetadata, WorkflowNode, WorkflowEdge } from '@/types/workflow';
import { createWorkflowJSON } from '@/utils/workflowUtils';
import { downloadWorkflowConfig } from '@/utils/fileDownload';

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

      // Generate create-workflow.sh compatible JSON
      const workflowJSON = createWorkflowJSON(metadata, nodes);

      // Download the JSON file using file picker modal
      const downloaded = await downloadWorkflowConfig(metadata.workflowName, workflowJSON);

      if (!downloaded) {
        // User cancelled the save operation
        console.log("Workflow save cancelled by user");
        setError(null);
        setLastSaved(null);
        return false;
      }

      console.log("Workflow JSON downloaded:", metadata.workflowName);
      setLastSaved({
        workflowName: metadata.workflowName,
        filename: `${metadata.workflowName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`,
      });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download workflow file';
      setError(errorMessage);
      setLastSaved(null);
      console.error("Error downloading workflow:", err);
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
