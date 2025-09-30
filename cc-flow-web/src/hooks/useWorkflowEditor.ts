import { useState, useCallback, useMemo, useEffect } from 'react';
import { Connection } from '@xyflow/react';
import { WorkflowNode, WorkflowEdge, WorkflowMetadata } from '@/types/workflow';
import { autoSaveWorkflow, loadAutoSavedWorkflow } from '@/utils/autoSave';

interface UseWorkflowEditorReturn {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  metadata: WorkflowMetadata;
  setMetadata: (metadata: WorkflowMetadata) => void;
  handleNodesChange: (newNodes: WorkflowNode[]) => void;
  handleEdgesChange: (newEdges: WorkflowEdge[]) => void;
  handleConnect: (connection: Connection) => void;
  generatePreviewJSON: () => string;
  canSave: boolean;
}

const DEFAULT_METADATA: WorkflowMetadata = {
  workflowName: "",
  workflowPurpose: "",
  workflowModel: "default",
  workflowArgumentHint: "",
};

export function useWorkflowEditor(): UseWorkflowEditorReturn {
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [edges, setEdges] = useState<WorkflowEdge[]>([]);
  const [metadata, setMetadata] = useState<WorkflowMetadata>(DEFAULT_METADATA);

  // Load auto-saved data on mount
  useEffect(() => {
    const autoSaved = loadAutoSavedWorkflow();
    if (autoSaved) {
      console.log('Loaded auto-saved workflow data');
      setNodes(autoSaved.nodes);
      setEdges(autoSaved.edges);
      setMetadata(autoSaved.metadata);
    }
  }, []);

  // Auto-save whenever data changes
  useEffect(() => {
    autoSaveWorkflow(metadata, nodes, edges);
  }, [metadata, nodes, edges]);

  const handleNodesChange = useCallback((newNodes: WorkflowNode[]) => {
    setNodes(newNodes);
  }, []);

  const handleEdgesChange = useCallback((newEdges: WorkflowEdge[]) => {
    setEdges(newEdges);
  }, []);

  const handleConnect = useCallback((connection: Connection) => {
    console.log("New connection:", connection);
  }, []);

  const generatePreviewJSON = useMemo(() => {
    return () => JSON.stringify(
      {
        ...metadata,
        workflowSteps: [
          {
            title: "Generated Step",
            mode: "sequential" as const,
            purpose: metadata.workflowPurpose || "Sample workflow step",
            agents: nodes
              .filter((node) => node.type === 'agent')
              .map((node) => node.data.agentName || node.data.label)
              .filter(Boolean),
          },
        ],
      },
      null,
      2
    );
  }, [metadata, nodes]);

  const canSave = useMemo(() => {
    return Boolean(metadata.workflowName?.trim() && nodes.length > 0);
  }, [metadata.workflowName, nodes.length]);

  return {
    nodes,
    edges,
    metadata,
    setMetadata,
    handleNodesChange,
    handleEdgesChange,
    handleConnect,
    generatePreviewJSON,
    canSave,
  };
}
