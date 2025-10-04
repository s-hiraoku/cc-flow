"use client";

import React, { useState } from "react";
import { Panel, Button } from "@/components/ui";
import { PanelRightOpen, PanelRightClose } from "lucide-react";
import {
  WorkflowMetadata,
  WorkflowNode,
  WorkflowEdge,
} from "@/types/workflow";
import { usePropertiesPanel } from "./usePropertiesPanel";
import { useNodeSettings } from "./useNodeSettings";
import { useSelectionInfo } from "./useSelectionInfo";

interface PropertiesPanelProps {
  metadata: WorkflowMetadata;
  onMetadataChange: (metadata: WorkflowMetadata) => void;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNodeIds?: string[];
  onNodesChange?: (nodes: WorkflowNode[]) => void;
}

export default function PropertiesPanel({
  metadata,
  onMetadataChange,
  nodes,
  edges,
  selectedNodeIds = [],
  onNodesChange,
}: PropertiesPanelProps) {
  const [collapsed, setCollapsed] = useState(false);

  // Custom hooks for logic separation
  const {
    selectedNodes,
    primarySelectedNode,
    updateMetadata,
    onNodeUpdate,
    getSettingsTitle,
    serializedWorkflowJSON,
    createWorkflowJSONString,
    workflowSummary,
  } = usePropertiesPanel({
    metadata,
    onMetadataChange,
    nodes,
    edges,
    selectedNodeIds,
    onNodesChange,
  });

  const { renderNodeSettings, hasErrors, errors } = useNodeSettings({
    primarySelectedNode,
    metadata,
    updateMetadata,
    onNodeUpdate,
  });

  // Update node error state when validation errors change
  React.useEffect(() => {
    if (primarySelectedNode && onNodesChange) {
      // Apply validation errors to nodes that have validation
      // Currently Start node, Agent node, and Step Group node have form validation via useNodeSettings
      const shouldHaveError =
        (primarySelectedNode.type === 'start' || primarySelectedNode.type === 'agent' || primarySelectedNode.type === 'step-group')
        && hasErrors;

      // Only update if error state changed
      if (primarySelectedNode.data.hasError !== shouldHaveError) {
        const updatedNodes = nodes.map(node =>
          node.id === primarySelectedNode.id
            ? { ...node, data: { ...node.data, hasError: shouldHaveError } }
            : node
        );
        onNodesChange(updatedNodes);
      }
    }
  }, [primarySelectedNode, hasErrors, errors, nodes, onNodesChange]);

  const { renderSelectionInfo } = useSelectionInfo({
    selectedNodes,
    primarySelectedNode,
  });

  return (
    <Panel
      variant="default"
      title={collapsed ? (
        <div className="flex items-center justify-center">
          <Button
            variant="ghost"
            size="sm"
            aria-label="Expand properties"
            onClick={() => setCollapsed(false)}
            className="p-1 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
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
            className="p-1 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          >
            <PanelRightClose className="h-4 w-4" />
          </Button>
        </div>
      )}
      subtitle={collapsed ? undefined : "Configure workflow settings"}
      className={`relative transition-all duration-200 backdrop-blur ${
        collapsed ? "w-full shadow-lg lg:w-14" : "w-full lg:w-[24rem]"
      } lg:flex-shrink-0`}
    >
      {!collapsed && (
        <div className="flex flex-col h-full min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4">
            <div className="space-y-4">
              {/* Settings Section */}
              <div>
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  {getSettingsTitle()}
                </h3>

                <div className="space-y-4 text-sm text-gray-700">
                  {renderSelectionInfo()}
                  <div>{renderNodeSettings()}</div>
                </div>
              </div>

              {/* Workflow Stats */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-800">
                  Workflow Stats
                </h3>
                <dl className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-center justify-between">
                    <dt>Start node</dt>
                    <dd className="font-semibold text-gray-900">
                      {workflowSummary.startLabel ?? "Not configured"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt>End node</dt>
                    <dd className="font-semibold text-gray-900">
                      {workflowSummary.endLabel ?? "Not configured"}
                    </dd>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <div className="rounded-xl border border-indigo-300 bg-indigo-50 px-3 py-2.5 text-indigo-700">
                      <p className="text-xs uppercase tracking-wider font-medium">Agents</p>
                      <p className="text-xl font-bold text-indigo-900 mt-1">
                        {workflowSummary.agentCount}
                      </p>
                    </div>
                    <div className="rounded-xl border border-purple-300 bg-purple-50 px-3 py-2.5 text-purple-700">
                      <p className="text-xs uppercase tracking-wider font-medium">Groups</p>
                      <p className="text-xl font-bold text-purple-900 mt-1">
                        {workflowSummary.stepGroupCount}
                      </p>
                    </div>
                    <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2.5 text-emerald-700">
                      <p className="text-xs uppercase tracking-wider font-medium">Edges</p>
                      <p className="text-xl font-bold text-emerald-900 mt-1">
                        {workflowSummary.edgeCount}
                      </p>
                    </div>
                  </div>
                </dl>
              </div>

              {/* JSON Preview Section */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-800">
                  JSON Preview
                </h3>
                {(createWorkflowJSONString.error || serializedWorkflowJSON.error) && (
                  <div className="mb-2 rounded-lg border border-rose-300 bg-rose-50 p-2 text-xs text-rose-700">
                    <span className="font-semibold">Error: </span>
                    {createWorkflowJSONString.error || serializedWorkflowJSON.error}
                  </div>
                )}
                <div className="space-y-3">
                  <div className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-600">
                      create-workflow.sh input
                    </p>
                    <pre className="max-h-24 max-w-full overflow-x-auto overflow-y-auto whitespace-pre-wrap break-words rounded-lg bg-white border border-gray-200 p-3 text-xs font-mono leading-loose text-gray-700">
                      {createWorkflowJSONString.json}
                    </pre>
                  </div>
                  <div className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-600">
                      Serialized workflow payload
                    </p>
                    <pre className="max-h-24 max-w-full overflow-x-auto overflow-y-auto whitespace-pre-wrap break-words rounded-lg bg-white border border-gray-200 p-3 text-xs font-mono leading-loose text-gray-700">
                      {serializedWorkflowJSON.json}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Panel>
  );
}
