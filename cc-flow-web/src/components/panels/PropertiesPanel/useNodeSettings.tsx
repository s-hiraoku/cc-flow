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
import { WorkflowMetadataSchema, StepGroupSettingsSchema, AgentStepSettingsSchema } from "@/schemas/workflowValidation";

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

  // React Hook Form for Step Group node validation
  const {
    register: registerStepGroup,
    formState: { errors: stepGroupErrors },
    setValue: setStepGroupValue,
  } = useForm({
    resolver: valibotResolver(StepGroupSettingsSchema),
    mode: "onBlur",
    defaultValues: (primarySelectedNode && isStepGroupNode(primarySelectedNode)) ? {
      title: primarySelectedNode.data.title || '',
      purpose: primarySelectedNode.data.purpose || '',
    } : undefined,
  });

  // React Hook Form for Agent node validation
  const {
    register: registerAgent,
    formState: { errors: agentErrors },
    setValue: setAgentValue,
  } = useForm({
    resolver: valibotResolver(AgentStepSettingsSchema),
    mode: "onBlur",
    defaultValues: (primarySelectedNode && isAgentNode(primarySelectedNode)) ? {
      stepTitle: primarySelectedNode.data.stepTitle || primarySelectedNode.data.agentName || '',
      stepPurpose: primarySelectedNode.data.stepPurpose || '',
    } : undefined,
  });

  // Sync form values with metadata changes
  useEffect(() => {
    setValue("workflowName", metadata.workflowName);
    setValue("workflowPurpose", metadata.workflowPurpose);
    setValue("workflowModel", metadata.workflowModel);
    setValue("workflowArgumentHint", metadata.workflowArgumentHint);
  }, [metadata, setValue]);

  // Update Start Node with metadata changes (separate effect to avoid infinite loop)
  useEffect(() => {
    if (primarySelectedNode?.type === 'start' && onNodeUpdate) {
      const startNodeData = primarySelectedNode.data;
      // Only update if values have actually changed
      if (startNodeData.workflowName !== metadata.workflowName ||
          startNodeData.workflowPurpose !== metadata.workflowPurpose) {
        onNodeUpdate(primarySelectedNode.id, {
          workflowName: metadata.workflowName,
          workflowPurpose: metadata.workflowPurpose,
        });
      }
    }
  }, [metadata.workflowName, metadata.workflowPurpose, primarySelectedNode?.id, primarySelectedNode?.type, onNodeUpdate]);

  // Sync Step Group form values when node changes
  useEffect(() => {
    if (primarySelectedNode && isStepGroupNode(primarySelectedNode)) {
      setStepGroupValue("title", primarySelectedNode.data.title || '');
      setStepGroupValue("purpose", primarySelectedNode.data.purpose || '');
    }
  }, [primarySelectedNode, setStepGroupValue]);

  // Sync Agent form values when node changes
  useEffect(() => {
    if (primarySelectedNode && isAgentNode(primarySelectedNode)) {
      const stepTitle = primarySelectedNode.data.stepTitle || primarySelectedNode.data.agentName || '';
      setAgentValue("stepTitle", stepTitle);
      setAgentValue("stepPurpose", primarySelectedNode.data.stepPurpose || '');

      // Set default stepTitle if not already set
      if (!primarySelectedNode.data.stepTitle && primarySelectedNode.data.agentName && onNodeUpdate) {
        onNodeUpdate(primarySelectedNode.id, {
          stepTitle: primarySelectedNode.data.agentName,
        });
      }
    }
  }, [primarySelectedNode, setAgentValue, onNodeUpdate]);

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
                value={agentData.stepTitle || agentData.agentName || ""}
                {...registerAgent("stepTitle", {
                  onChange: (e) =>
                    onNodeUpdate?.(primarySelectedNode.id, {
                      stepTitle: e.target.value,
                    }),
                })}
                id="step-title"
                required
                error={agentErrors.stepTitle?.message}
              />

              <Textarea
                label="Step Purpose"
                placeholder="Describe what this step accomplishes..."
                value={agentData.stepPurpose || ""}
                {...registerAgent("stepPurpose", {
                  onChange: (e) =>
                    onNodeUpdate?.(primarySelectedNode.id, {
                      stepPurpose: e.target.value,
                    }),
                })}
                id="step-purpose"
                rows={3}
                error={agentErrors.stepPurpose?.message}
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
              {...registerStepGroup("title", {
                onChange: (e) =>
                  onNodeUpdate?.(primarySelectedNode.id, {
                    title: e.target.value,
                  }),
              })}
              id="step-group-title"
              required
              error={stepGroupErrors.title?.message}
            />

            <Textarea
              label="Purpose"
              placeholder="Describe the group's purpose..."
              value={stepGroupData.purpose || ""}
              {...registerStepGroup("purpose", {
                onChange: (e) =>
                  onNodeUpdate?.(primarySelectedNode.id, {
                    purpose: e.target.value,
                  }),
              })}
              id="step-group-purpose"
              rows={3}
              error={stepGroupErrors.purpose?.message}
            />

            <div className="mt-2">
              <div className="text-xs text-gray-500">
                Agents: {stepGroupData.agents.length}/10
              </div>
              {stepGroupData.agents.length === 0 && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md text-xs text-red-700">
                  <span className="font-semibold">Error: </span>
                  At least one agent must be added to the step group
                </div>
              )}
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
    registerStepGroup,
    stepGroupErrors,
    registerAgent,
    agentErrors,
  ]);

  // Check if there are any validation errors
  // Combine errors from Start node, Agent node, and Step Group node
  const combinedErrors = primarySelectedNode?.type === 'start'
    ? errors
    : primarySelectedNode?.type === 'agent'
    ? agentErrors
    : primarySelectedNode?.type === 'step-group'
    ? stepGroupErrors
    : {};

  // Check for Step Group specific validation (empty agents array)
  const hasStepGroupAgentError = primarySelectedNode?.type === 'step-group' &&
    isStepGroupNode(primarySelectedNode) &&
    primarySelectedNode.data.agents.length === 0;

  const hasErrors = Object.keys(combinedErrors).length > 0 || hasStepGroupAgentError;

  return {
    renderNodeSettings,
    hasErrors,
    errors: combinedErrors,
  };
}
