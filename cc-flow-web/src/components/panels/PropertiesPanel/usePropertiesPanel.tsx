import { useMemo, useCallback } from "react";
import { WorkflowMetadata, WorkflowNode, WorkflowEdge, isAgentNodeData } from "@/types/workflow";
import { WorkflowService } from "@/services/WorkflowService";
import { createWorkflowJSON } from "@/utils/workflowUtils";

interface UsePropertiesPanelProps {
  metadata: WorkflowMetadata;
  onMetadataChange: (metadata: WorkflowMetadata) => void;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNodeIds: string[];
}

export function usePropertiesPanel({
  metadata,
  onMetadataChange,
  nodes,
  edges,
  selectedNodeIds,
}: UsePropertiesPanelProps) {
  // Get selected nodes
  const selectedNodes = useMemo(() => {
    return selectedNodeIds.map(nodeId => 
      nodes.find(n => n.id === nodeId)
    ).filter(Boolean) as WorkflowNode[];
  }, [selectedNodeIds, nodes]);

  // Get the primary selected node (first one for settings display)
  const primarySelectedNode = selectedNodes[0];

  // Metadata update handler
  const updateMetadata = useCallback(
    (field: keyof WorkflowMetadata, value: string) => {
      onMetadataChange({
        ...metadata,
        [field]: value,
      });
    },
    [metadata, onMetadataChange]
  );

  // Get settings section title based on selected node
  const getSettingsTitle = useCallback(() => {
    if (!primarySelectedNode) {
      return "Settings";
    }
    
    const nodeTypeLabels: Record<string, string> = {
      start: "Workflow Settings",
      end: "End Node Settings", 
      agent: "Agent Settings",
      "step-group": "Step Group Settings"
    };
    
    return nodeTypeLabels[primarySelectedNode.type] || "Node Settings";
  }, [primarySelectedNode]);

  // Generate workflow JSONs
  const serializedWorkflowJSON = useMemo(() => {
    try {
      return WorkflowService.generateWorkflowJSON(metadata, nodes, edges);
    } catch (error) {
      console.error("Failed to generate workflow preview JSON", error);
      return JSON.stringify({ error: "Unable to generate preview" }, null, 2);
    }
  }, [metadata, nodes, edges]);

  const createWorkflowJSONString = useMemo(() => {
    return createWorkflowJSON(metadata, nodes);
  }, [metadata, nodes]);

  // Generate workflow summary statistics
  const workflowSummary = useMemo(() => {
    const startNode = nodes.find((node) => node.type === "start");
    const endNode = nodes.find((node) => node.type === "end");
    const agentNodes = nodes.filter((node) => isAgentNodeData(node.data));
    const stepGroupNodes = nodes.filter((node) => node.type === "step-group");

    return {
      startLabel: startNode?.data.label ?? null,
      endLabel: endNode?.data.label ?? null,
      agentCount: agentNodes.length,
      stepGroupCount: stepGroupNodes.length,
      edgeCount: edges.length,
      nodeCount: nodes.length,
    };
  }, [nodes, edges]);

  return {
    selectedNodes,
    primarySelectedNode,
    updateMetadata,
    getSettingsTitle,
    serializedWorkflowJSON,
    createWorkflowJSONString,
    workflowSummary,
  };
}