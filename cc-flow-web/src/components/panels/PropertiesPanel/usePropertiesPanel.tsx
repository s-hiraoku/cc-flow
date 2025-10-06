import { useMemo, useCallback } from "react";
import { WorkflowMetadata, WorkflowNode, WorkflowEdge, WorkflowNodeData, isAgentNodeData, AgentNodeData } from "@/types/workflow";
import { WorkflowService } from "@/services/WorkflowService";
import { createWorkflowJSON } from "@/utils/workflowUtils";

interface UsePropertiesPanelProps {
  metadata: WorkflowMetadata;
  onMetadataChange: (metadata: WorkflowMetadata) => void;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNodeIds: string[];
  onNodesChange?: (nodes: WorkflowNode[]) => void;
}

export function usePropertiesPanel({
  metadata,
  onMetadataChange,
  nodes,
  edges,
  selectedNodeIds,
  onNodesChange,
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

  // Node data update handler
  const onNodeUpdate = useCallback(
    (nodeId: string, updates: Partial<WorkflowNodeData>) => {
      if (!onNodesChange) return;

      const updatedNodes = nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              ...updates,
            },
          };
        }
        return node;
      });

      onNodesChange(updatedNodes);
    },
    [nodes, onNodesChange]
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

  // Generate workflow JSONs with error tracking
  const serializedWorkflowJSON = useMemo(() => {
    try {
      return { json: WorkflowService.generateWorkflowJSON(metadata, nodes, edges), error: null };
    } catch (error) {
      console.error("Failed to generate workflow preview JSON", error);

      // Extract error message from WorkflowValidationError or generic Error
      const errorMessage = error instanceof Error
        ? error.message.replace(/^Error \[WorkflowValidationError\]:\s*/, '')
        : "Unable to generate preview";

      return {
        json: JSON.stringify({ error: "Unable to generate preview" }, null, 2),
        error: errorMessage
      };
    }
  }, [metadata, nodes, edges]);

  const createWorkflowJSONString = useMemo(() => {
    try {
      return { json: createWorkflowJSON(metadata, nodes, edges), error: null };
    } catch (error) {
      // Silently handle validation errors during preview
      // These are expected when the workflow is incomplete

      // Extract error message from WorkflowValidationError or generic Error
      const errorMessage = error instanceof Error
        ? error.message.replace(/^Error \[WorkflowValidationError\]:\s*/, '')
        : "Invalid workflow structure";

      return {
        json: JSON.stringify({ error: "Invalid workflow structure" }, null, 2),
        error: errorMessage
      };
    }
  }, [metadata, nodes, edges]);

  // Generate workflow summary statistics
  const workflowSummary = useMemo(() => {
    const startNode = nodes.find((node) => node.type === "start");
    const endNode = nodes.find((node) => node.type === "end");
    const agentNodes = nodes.filter((node) => isAgentNodeData(node.data));
    const stepGroupNodes = nodes.filter((node) => node.type === "step-group");

    // Count total agents: direct agent nodes + agents in step groups
    const agentsInStepGroups = stepGroupNodes.reduce((count, node) => {
      const stepGroupData = node.data as { agents?: (string | { name: string })[] };
      return count + (stepGroupData.agents?.length ?? 0);
    }, 0);
    const totalAgentCount = agentNodes.length + agentsInStepGroups;

    return {
      startLabel: startNode?.data.label ?? null,
      endLabel: endNode?.data.label ?? null,
      agentCount: totalAgentCount,
      stepGroupCount: stepGroupNodes.length,
      edgeCount: edges.length,
      nodeCount: nodes.length,
    };
  }, [nodes, edges]);

  return {
    selectedNodes,
    primarySelectedNode,
    updateMetadata,
    onNodeUpdate,
    getSettingsTitle,
    serializedWorkflowJSON,
    createWorkflowJSONString,
    workflowSummary,
  };
}