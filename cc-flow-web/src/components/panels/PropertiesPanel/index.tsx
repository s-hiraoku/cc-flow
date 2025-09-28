"use client";

import React, { useState } from "react";
import { Panel, Card, Button } from "@/components/ui";
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
}

export default function PropertiesPanel({
  metadata,
  onMetadataChange,
  nodes,
  edges,
  selectedNodeIds = [],
}: PropertiesPanelProps) {
  const [collapsed, setCollapsed] = useState(false);

  // Custom hooks for logic separation
  const {
    selectedNodes,
    primarySelectedNode,
    updateMetadata,
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
  });

  const { renderNodeSettings } = useNodeSettings({
    primarySelectedNode,
    metadata,
    updateMetadata,
  });

  const { renderSelectionInfo } = useSelectionInfo({
    selectedNodes,
    primarySelectedNode,
  });

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
      className={`relative transition-all duration-200 ${
        collapsed ? "w-12 shadow-lg" : "w-80"
      }`}
    >
      {!collapsed && (
        <div className="flex flex-col h-full min-h-0">
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="p-4 space-y-6">
              {/* Settings Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {getSettingsTitle()}
                </h3>
                
                {renderSelectionInfo()}
                
                <div className="mt-4">
                  {renderNodeSettings()}
                </div>
              </div>

              {/* Workflow Stats */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                  Workflow Stats
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Nodes:</span>
                    <span className="ml-2 font-medium">{workflowSummary.nodeCount}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Connections:</span>
                    <span className="ml-2 font-medium">{workflowSummary.edgeCount}</span>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Start Node</span>
                    <span className="font-medium text-gray-900">
                      {workflowSummary.startLabel ?? "Not configured"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">End Node</span>
                    <span className="font-medium text-gray-900">
                      {workflowSummary.endLabel ?? "Not configured"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-md bg-indigo-50 px-3 py-2 text-indigo-700">
                      <p className="text-xs uppercase tracking-wide">Agents</p>
                      <p className="text-lg font-semibold">
                        {workflowSummary.agentCount}
                      </p>
                    </div>
                    <div className="rounded-md bg-slate-50 px-3 py-2 text-slate-700">
                      <p className="text-xs uppercase tracking-wide">
                        Step Groups
                      </p>
                      <p className="text-lg font-semibold">
                        {workflowSummary.stepGroupCount}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-md bg-emerald-50 px-3 py-2 text-emerald-700">
                    <p className="text-xs uppercase tracking-wide">Edges</p>
                    <p className="text-lg font-semibold">{workflowSummary.edgeCount}</p>
                  </div>
                </div>
              </div>

              {/* JSON Preview Section */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
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