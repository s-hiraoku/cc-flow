"use client";

import React, { useMemo, useCallback } from "react";
import { Panel, Input, Textarea, SelectField, Card } from "@/components/ui";
import { WorkflowMetadata, WorkflowNode, WorkflowEdge, isAgentNodeData } from "@/types/workflow";
import { WORKFLOW_MODELS } from "@/constants/workflow";

interface PropertiesPanelProps {
  metadata: WorkflowMetadata;
  onMetadataChange: (metadata: WorkflowMetadata) => void;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export default function PropertiesPanel({
  metadata,
  onMetadataChange,
  nodes,
  edges,
}: PropertiesPanelProps) {
  // Metadata update handler
  const updateMetadata = useCallback((field: keyof WorkflowMetadata, value: string) => {
    onMetadataChange({
      ...metadata,
      [field]: value,
    });
  }, [metadata, onMetadataChange]);

  // Memoized JSON preview
  const previewJSON = useMemo(() => {
    return JSON.stringify(
      {
        ...metadata,
        workflowSteps: [
          {
            title: "Generated Step",
            mode: "sequential" as const,
            purpose: metadata.workflowPurpose || "Sample workflow step",
            agents: nodes
              .map((node) => {
                if (isAgentNodeData(node.data)) {
                  return node.data.agentName || node.data.label;
                }
                return node.data.label;
              })
              .filter(Boolean),
          },
        ],
      },
      null,
      2
    );
  }, [metadata, nodes]);

  return (
    <Panel
      title="Properties"
      subtitle="Configure workflow settings"
      className="w-80"
    >
      <div className="p-4 space-y-6 overflow-y-auto">
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
          onChange={(e) => updateMetadata("workflowPurpose", e.target.value)}
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

        {/* ワークフロー統計 */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            Workflow Stats
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Nodes:</span>
              <span className="ml-2 font-medium">{nodes.length}</span>
            </div>
            <div>
              <span className="text-gray-500">Connections:</span>
              <span className="ml-2 font-medium">{edges.length}</span>
            </div>
          </div>
        </div>

        {/* JSON Preview Section */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            JSON Preview
          </h3>
          <Card className="p-3">
            <pre className="text-xs font-mono text-green-600 whitespace-pre-wrap max-h-48 overflow-y-auto">
              {previewJSON}
            </pre>
          </Card>
        </div>
      </div>
    </Panel>
  );
}
