import React, { useCallback } from "react";
import { Input, Textarea, SelectField } from "@/components/ui";
import { WorkflowMetadata, WorkflowNode } from "@/types/workflow";
import { WORKFLOW_MODELS } from "@/constants/workflow";

interface UseNodeSettingsProps {
  primarySelectedNode?: WorkflowNode;
  metadata: WorkflowMetadata;
  updateMetadata: (field: keyof WorkflowMetadata, value: string) => void;
}

export function useNodeSettings({
  primarySelectedNode,
  metadata,
  updateMetadata,
}: UseNodeSettingsProps) {
  // Render node-specific settings components
  const renderNodeSettings = useCallback(() => {
    if (!primarySelectedNode) {
      return null;
    }

    switch (primarySelectedNode.type) {
      case 'start':
        return (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Configure workflow metadata and execution settings
            </div>
            <Input
              label="Workflow Name"
              placeholder="my-workflow"
              value={metadata.workflowName}
              onChange={(e) => updateMetadata("workflowName", e.target.value)}
              id="workflow-name"
              required
            />
            <Textarea
              label="Purpose"
              placeholder="Describe workflow purpose..."
              value={metadata.workflowPurpose}
              onChange={(e) =>
                updateMetadata("workflowPurpose", e.target.value)
              }
              id="workflow-purpose"
              rows={3}
              required
            />
            <SelectField
              label="Model"
              placeholder="Select a model"
              value={metadata.workflowModel}
              onValueChange={(value) =>
                updateMetadata("workflowModel", value)
              }
              id="workflow-model"
              options={[...WORKFLOW_MODELS]}
            />
            <Input
              label="Argument Hint"
              placeholder="<context>"
              value={metadata.workflowArgumentHint}
              onChange={(e) =>
                updateMetadata("workflowArgumentHint", e.target.value)
              }
              id="argument-hint"
            />
          </div>
        );

      case 'end':
        return (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Configure workflow completion behavior
            </div>
            <div className="text-sm text-gray-500">
              End node settings will be implemented here
            </div>
          </div>
        );

      case 'agent':
        return (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Configure agent execution parameters
            </div>
            <div className="text-sm text-gray-500">
              Agent node settings will be implemented here
            </div>
          </div>
        );

      case 'step-group':
        return (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Configure step group execution mode and agents
            </div>
            <div className="text-sm text-gray-500">
              Step group settings will be implemented here
            </div>
          </div>
        );

      default:
        return (
          <div className="text-sm text-gray-500">
            No settings available for this node type
          </div>
        );
    }
  }, [primarySelectedNode, metadata, updateMetadata]);

  return {
    renderNodeSettings,
  };
}