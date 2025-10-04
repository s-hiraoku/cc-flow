"use client";

import React, { useState } from "react";
import { Panel, Button } from "@/components/ui";
import {
  AlertCircle,
  BarChart3,
  FileCode,
  Flag,
  GitBranch,
  Layers,
  PanelRightClose,
  PanelRightOpen,
  PlayCircle,
  Settings2,
  Users,
} from "lucide-react";
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

  const selectionInfoContent = renderSelectionInfo();
  const jsonError = createWorkflowJSONString.error || serializedWorkflowJSON.error;
  const quantitativeStats = [
    { label: "Agents", value: workflowSummary.agentCount, icon: Users, accent: "bg-indigo-50 text-indigo-600" },
    { label: "Step Groups", value: workflowSummary.stepGroupCount, icon: Layers, accent: "bg-purple-50 text-purple-600" },
    { label: "Edges", value: workflowSummary.edgeCount, icon: GitBranch, accent: "bg-emerald-50 text-emerald-600" },
  ];
  const jsonPanels = [
    { label: "create-workflow.sh input", value: createWorkflowJSONString.json },
    { label: "Serialized workflow payload", value: serializedWorkflowJSON.json },
  ];

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
            className="p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            <PanelRightOpen className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-3 text-base font-semibold text-gray-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Settings2 className="h-4 w-4" aria-hidden />
            </span>
            <span className="leading-tight">Properties</span>
          </span>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Collapse properties"
            onClick={() => setCollapsed(true)}
            className="p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            <PanelRightClose className="h-4 w-4" />
          </Button>
        </div>
      )}
      subtitle={collapsed ? undefined : "Tune nodes, review stats, and inspect JSON outputs"}
      className={`relative transition-all duration-200 ${
        collapsed ? "w-full shadow-lg lg:w-14" : "w-full shadow-xl lg:w-[24rem]"
      } lg:flex-shrink-0`}
    >
      {!collapsed && (
        <div className="flex flex-col h-full min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-5 pb-6 pt-5">
            <div className="space-y-6">
              {/* Settings Section */}
              <section className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                      <Settings2 className="h-4 w-4" aria-hidden />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
                        {getSettingsTitle()}
                      </h3>
                      <p className="text-xs text-gray-500">
                        Adjust settings for the selected workflow element.
                      </p>
                    </div>
                  </div>
                  {hasErrors && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700">
                      <AlertCircle className="h-3.5 w-3.5" aria-hidden />
                      Needs attention
                    </span>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="rounded-xl border border-indigo-100 bg-white p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                        <Users className="h-4 w-4" aria-hidden />
                      </span>
                      <div className="space-y-1 text-sm text-gray-700">
                        {selectionInfoContent}
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    {renderNodeSettings()}
                  </div>
                </div>
              </section>

              {/* Workflow Stats */}
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <BarChart3 className="h-4 w-4" aria-hidden />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
                      Workflow Stats
                    </h3>
                    <p className="text-xs text-gray-500">Quick overview of configured start/end points and totals.</p>
                  </div>
                </div>
                <dl className="space-y-3 text-sm text-gray-700">
                  <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                    <dt className="flex items-center gap-3 text-gray-600">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                        <PlayCircle className="h-4 w-4" aria-hidden />
                      </span>
                      <span className="font-medium text-gray-900">Start node</span>
                    </dt>
                    <dd className="text-sm font-semibold text-gray-900">
                      {workflowSummary.startLabel ?? "Not configured"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                    <dt className="flex items-center gap-3 text-gray-600">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                        <Flag className="h-4 w-4" aria-hidden />
                      </span>
                      <span className="font-medium text-gray-900">End node</span>
                    </dt>
                    <dd className="text-sm font-semibold text-gray-900">
                      {workflowSummary.endLabel ?? "Not configured"}
                    </dd>
                  </div>
                </dl>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {quantitativeStats.map(({ label, value, icon: StatIcon, accent }) => (
                    <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${accent}`}>
                          <StatIcon className="h-4 w-4" aria-hidden />
                        </span>
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{label}</p>
                          <p className="text-xl font-bold text-gray-900">{value}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* JSON Preview Section */}
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <FileCode className="h-4 w-4" aria-hidden />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
                      JSON Preview
                    </h3>
                    <p className="text-xs text-gray-500">Inspect generated payloads before exporting to the CLI.</p>
                  </div>
                </div>
                {jsonError && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 shadow-sm">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden />
                      <span>{jsonError}</span>
                    </div>
                  </div>
                )}
                <div className="space-y-3">
                  {jsonPanels.map(({ label, value }) => (
                    <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-600">{label}</p>
                      <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap break-words rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs font-mono leading-relaxed text-gray-800">
                        {value || "-"}
                      </pre>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </Panel>
  );
}
