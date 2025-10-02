import React, { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { valibotResolver } from "@hookform/resolvers/valibot";
import { Input, Textarea, SelectField } from "@/components/ui";
import {
  WorkflowMetadata,
  WorkflowNode,
  WorkflowNodeData,
  isAgentNode,
  isStepGroupNode,
} from "@/types/workflow";
import { WORKFLOW_MODELS } from "@/constants/workflow";
import { WorkflowMetadataSchema } from "@/schemas/workflowValidation";

interface UseNodeSettingsProps {
  primarySelectedNode?: WorkflowNode;
  metadata: WorkflowMetadata;
  updateMetadata: (field: keyof WorkflowMetadata, value: string) => void;
  onNodeUpdate?: (nodeId: string, updates: Partial<WorkflowNodeData>) => void;
}

export function useNodeSettings({
  primarySelectedNode,
  metadata,
  updateMetadata,
  onNodeUpdate,
}: UseNodeSettingsProps) {
  // React Hook Form for Start node validation
  const {
    register,
    formState: { errors },
    setValue,
    trigger,
  } = useForm({
    resolver: valibotResolver(WorkflowMetadataSchema),
    mode: "onBlur",
    defaultValues: metadata,
  });

  // Sync form values with metadata changes
  useEffect(() => {
    setValue("workflowName", metadata.workflowName);
    setValue("workflowPurpose", metadata.workflowPurpose);
    setValue("workflowModel", metadata.workflowModel);
    setValue("workflowArgumentHint", metadata.workflowArgumentHint);
  }, [metadata, setValue]);

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
              {...register("workflowName", {
                onChange: (e) => updateMetadata("workflowName", e.target.value),
              })}
              id="workflow-name"
              required
              error={errors.workflowName?.message}
            />
            <Textarea
              label="Purpose"
              placeholder="Describe workflow purpose..."
              value={metadata.workflowPurpose}
              {...register("workflowPurpose", {
                onChange: (e) => updateMetadata("workflowPurpose", e.target.value),
              })}
              id="workflow-purpose"
              rows={3}
              error={errors.workflowPurpose?.message}
            />
            <SelectField
              label="Model"
              placeholder="Select a model"
              value={metadata.workflowModel}
              onValueChange={(value) => {
                updateMetadata("workflowModel", value);
                setValue("workflowModel", value, { shouldValidate: true });
              }}
              id="workflow-model"
              options={[...WORKFLOW_MODELS]}
            />
            <Input
              label="Argument Hint"
              placeholder="<context>"
              value={metadata.workflowArgumentHint}
              {...register("workflowArgumentHint", {
                onChange: (e) => updateMetadata("workflowArgumentHint", e.target.value),
              })}
              id="argument-hint"
              error={errors.workflowArgumentHint?.message}
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
        if (!isStepGroupNode(primarySelectedNode)) return null;

        const stepGroupData = primarySelectedNode.data;

        return (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Configure step group execution mode and agents
            </div>

            <Input
              label="Group Title"
              placeholder="Parallel Group"
              value={stepGroupData.title || ""}
              onChange={(e) =>
                onNodeUpdate?.(primarySelectedNode.id, {
                  title: e.target.value,
                })
              }
              id="step-group-title"
              required
            />

            <Textarea
              label="Purpose"
              placeholder="Describe the group's purpose..."
              value={stepGroupData.purpose || ""}
              onChange={(e) =>
                onNodeUpdate?.(primarySelectedNode.id, {
                  purpose: e.target.value,
                })
              }
              id="step-group-purpose"
              rows={3}
            />

            <div className="text-xs text-gray-500 mt-2">
              Agents: {stepGroupData.agents.length}/10
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
    register,
    errors,
    trigger,
    setValue,
  ]);

  // Check if there are any validation errors
  const hasErrors = Object.keys(errors).length > 0;

  return {
    renderNodeSettings,
    hasErrors,
    errors,
  };
}
