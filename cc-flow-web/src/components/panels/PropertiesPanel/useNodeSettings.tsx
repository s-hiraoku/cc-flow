import React, { useCallback } from "react";
import { Input, Textarea, SelectField } from "@/components/ui";
import {
  WorkflowMetadata,
  WorkflowNode,
  AgentNodeData,
  isAgentNode,
} from "@/types/workflow";
import { WorkflowMode } from "@/utils/workflowUtils";
import { WORKFLOW_MODELS } from "@/constants/workflow";

interface UseNodeSettingsProps {
  primarySelectedNode?: WorkflowNode;
  metadata: WorkflowMetadata;
  updateMetadata: (field: keyof WorkflowMetadata, value: string) => void;
  onNodeUpdate?: (nodeId: string, updates: Partial<AgentNodeData>) => void;
}

export function useNodeSettings({
  primarySelectedNode,
  metadata,
  updateMetadata,
  onNodeUpdate,
}: UseNodeSettingsProps) {
  // Render node-specific settings components
  const renderNodeSettings = useCallback(() => {
    if (!primarySelectedNode) {
      return null;
    }

    switch (primarySelectedNode.type) {
      case "start":
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
              onValueChange={(value) => updateMetadata("workflowModel", value)}
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

      case "end":
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

      case "agent":
        if (!isAgentNode(primarySelectedNode)) return null;

        const agentData = primarySelectedNode.data;

        return (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Configure agent execution parameters
            </div>

            {/* Agent Info (Read-only) */}
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Agent Information
              </div>
              <div className="text-sm">
                <div>
                  <strong>Name:</strong> {agentData.agentName}
                </div>
                {agentData.description && (
                  <div className="text-gray-600 mt-1">
                    {agentData.description}
                  </div>
                )}
              </div>
            </div>

            {/* Workflow Step Settings */}
            <div className="space-y-4 border-t border-gray-200 pt-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Workflow Step Settings
              </div>

              <Input
                label="Step Title"
                placeholder={agentData.agentName}
                value={agentData.stepTitle || agentData.agentName}
                onChange={(e) =>
                  onNodeUpdate?.(primarySelectedNode.id, {
                    stepTitle: e.target.value,
                  })
                }
                id="step-title"
              />


              <Textarea
                label="Step Purpose"
                placeholder="Describe what this step accomplishes..."
                value={agentData.stepPurpose || ""}
                onChange={(e) =>
                  onNodeUpdate?.(primarySelectedNode.id, {
                    stepPurpose: e.target.value,
                  })
                }
                id="step-purpose"
                rows={3}
              />
            </div>
          </div>
        );

      case "step-group":
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
  }, [
    primarySelectedNode,
    metadata.workflowName,
    metadata.workflowPurpose,
    metadata.workflowModel,
    metadata.workflowArgumentHint,
    updateMetadata,
    onNodeUpdate,
  ]);

  return {
    renderNodeSettings,
  };
}
