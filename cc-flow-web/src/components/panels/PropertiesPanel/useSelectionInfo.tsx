import React, { useCallback } from "react";
import { WorkflowNode } from "@/types/workflow";

interface UseSelectionInfoProps {
  selectedNodes: WorkflowNode[];
  primarySelectedNode?: WorkflowNode;
}

export function useSelectionInfo({
  selectedNodes,
  primarySelectedNode,
}: UseSelectionInfoProps) {
  // Selection info component
  const renderSelectionInfo = useCallback(() => {
    if (selectedNodes.length === 0) {
      return (
        <div className="text-sm text-gray-500 italic">
          Select a node to configure its settings
        </div>
      );
    }

    if (selectedNodes.length === 1) {
      const node = selectedNodes[0];
      return (
        <div className="text-sm text-gray-600">
          Selected: <span className="font-medium">{node.data.label || node.type}</span>
        </div>
      );
    }

    return (
      <div className="text-sm text-gray-600">
        {selectedNodes.length} nodes selected
        <div className="text-xs text-gray-500 mt-1">
          Showing settings for: {primarySelectedNode?.data.label || primarySelectedNode?.type}
        </div>
      </div>
    );
  }, [selectedNodes, primarySelectedNode]);

  return {
    renderSelectionInfo,
  };
}