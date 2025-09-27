"use client";

import React, { useMemo, useCallback, useState } from "react";
import { Panel, Input, Textarea, SelectField, Card, Button } from "@/components/ui";
import { PanelRightOpen, PanelRightClose } from "lucide-react";
import { WorkflowMetadata, WorkflowNode, WorkflowEdge, isAgentNodeData } from "@/types/workflow";
import { WORKFLOW_MODELS } from "@/constants/workflow";
import { WorkflowService } from "@/services/WorkflowService";
import { createWorkflowJSON } from "@/utils/workflowUtils";

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
  const [collapsed, setCollapsed] = useState(false);

  // Metadata update handler
  const updateMetadata = useCallback((field: keyof WorkflowMetadata, value: string) => {
    onMetadataChange({
      ...metadata,
      [field]: value,
    });
  }, [metadata, onMetadataChange]);

  const serializedWorkflowJSON = useMemo(() => {
    try {
      return WorkflowService.generateWorkflowJSON(metadata, nodes, edges);
    } catch (error) {
      console.error('Failed to generate workflow preview JSON', error);
      return JSON.stringify({ error: 'Unable to generate preview' }, null, 2);
    }
  }, [metadata, nodes, edges]);

  const createWorkflowJSONString = useMemo(() => {
    return createWorkflowJSON(metadata, nodes);
  }, [metadata, nodes]);

  const summary = useMemo(() => {
    const startNode = nodes.find((node) => node.type === 'start');
    const endNode = nodes.find((node) => node.type === 'end');
    const agentNodes = nodes.filter((node) => isAgentNodeData(node.data));
    const stepGroupNodes = nodes.filter((node) => node.type === 'step-group');

    return {
      startLabel: startNode?.data.label ?? null,
      endLabel: endNode?.data.label ?? null,
      agentCount: agentNodes.length,
      stepGroupCount: stepGroupNodes.length,
      edgeCount: edges.length,
    };
  }, [nodes, edges]);

  return (
    <Panel
      title={collapsed ? (
        <div className="flex items-center justify-center">
          <Button
            variant="ghost"
            size="sm"
            aria-label="Expand properties"
            onClick={() => setCollapsed(false)}
            className="p-1"
          >
            <PanelRightOpen className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <span>Properties</span>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Collapse properties"
            onClick={() => setCollapsed(true)}
            className="p-1"
          >
            <PanelRightClose className="h-4 w-4" />
          </Button>
        </div>
      )}
      subtitle={collapsed ? undefined : "Configure workflow settings"}
      className={`relative transition-all duration-200 ${collapsed ? 'w-12 shadow-lg' : 'w-80'}`}
    >
      {!collapsed && (
        <div className="flex flex-col h-full min-h-0">
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="p-4 space-y-6">
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
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Start Node</span>
                  <span className="font-medium text-gray-900">
                    {summary.startLabel ?? 'Not configured'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">End Node</span>
                  <span className="font-medium text-gray-900">
                    {summary.endLabel ?? 'Not configured'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-md bg-indigo-50 px-3 py-2 text-indigo-700">
                    <p className="text-xs uppercase tracking-wide">Agents</p>
                    <p className="text-lg font-semibold">{summary.agentCount}</p>
                  </div>
                  <div className="rounded-md bg-slate-50 px-3 py-2 text-slate-700">
                    <p className="text-xs uppercase tracking-wide">Step Groups</p>
                    <p className="text-lg font-semibold">{summary.stepGroupCount}</p>
                  </div>
                </div>
                <div className="rounded-md bg-emerald-50 px-3 py-2 text-emerald-700">
                  <p className="text-xs uppercase tracking-wide">Edges</p>
                  <p className="text-lg font-semibold">{summary.edgeCount}</p>
                </div>
              </div>
            </div>

            {/* JSON Preview Section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                JSON Preview
              </h3>
              <div className="space-y-4">
                <Card className="p-3">
                  <p className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    create-workflow.sh Input
                  </p>
                  <pre className="text-xs font-mono text-slate-700 whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {createWorkflowJSONString}
                  </pre>
                </Card>
                <Card className="p-3">
                  <p className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Serialized Workflow Payload
                  </p>
                  <pre className="text-xs font-mono text-green-600 whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {serializedWorkflowJSON}
                  </pre>
                </Card>
              </div>
            </div>
          </div>
        </div>
        </div>
      )}
    </Panel>
  );
}
