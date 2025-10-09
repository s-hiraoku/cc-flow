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
  const basePanelClasses = "relative transition-all duration-300 lg:flex-shrink-0";
  const collapsedPanelClasses =
    "lg:absolute lg:right-6 lg:top-1/2 lg:z-40 lg:w-auto lg:-translate-y-1/2 lg:rounded-3xl lg:border-transparent lg:bg-white/90 lg:px-3 lg:py-4 lg:shadow-2xl lg:backdrop-blur-md lg:ring-1 lg:ring-black/10 lg:h-auto";
  const expandedPanelClasses = "lg:static lg:h-full lg:w-[24rem] lg:rounded-3xl lg:shadow-xl";
  const panelClassName = `${basePanelClasses} ${collapsed ? collapsedPanelClasses : expandedPanelClasses}`;
  const collapsedButtonClasses =
    "flex h-10 w-10 items-center justify-center rounded-2xl bg-white/85 text-gray-600 shadow-md ring-1 ring-black/5 transition hover:bg-indigo-500 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500";

  const headerContent = collapsed ? undefined : (
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
        aria-expanded={!collapsed}
        onClick={() => setCollapsed(true)}
        className="p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
      >
        <PanelRightClose className="h-4 w-4" />
      </Button>
    </div>
  );

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
    { label: "Nodes", value: nodes.length, icon: Layers, accent: "bg-indigo-50 text-indigo-600" },
    { label: "Connections", value: edges.length, icon: GitBranch, accent: "bg-sky-50 text-sky-600" },
    { label: "Agents", value: workflowSummary.agentCount, icon: Users, accent: "bg-purple-50 text-purple-600" },
    { label: "Step Groups", value: workflowSummary.stepGroupCount, icon: Layers, accent: "bg-emerald-50 text-emerald-600" },
  ];
  const jsonPanels = [
    { label: "create-workflow.sh input", value: createWorkflowJSONString.json },
    { label: "Serialized workflow payload", value: serializedWorkflowJSON.json },
  ];

  return (
    <Panel
      variant="default"
      title={headerContent}
      subtitle={collapsed ? undefined : "Tune nodes, review stats, and inspect JSON outputs"}
      className={panelClassName}
    >
      {collapsed ? (
        <div className="flex flex-col items-center gap-4" role="group" aria-label="Collapsed properties panel">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500 text-white shadow-lg">
            <Settings2 className="h-5 w-5" aria-hidden />
            <span className="sr-only">Properties panel</span>
          </span>
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              className={collapsedButtonClasses}
              onClick={() => setCollapsed(false)}
              title="Workflow stats"
            >
              <BarChart3 className="h-5 w-5" aria-hidden />
              <span className="sr-only">Workflow stats</span>
            </button>
            <button
              type="button"
              className={collapsedButtonClasses}
              onClick={() => setCollapsed(false)}
              title="Review workflow JSON"
            >
              <FileCode className="h-5 w-5" aria-hidden />
              <span className="sr-only">Review workflow JSON</span>
            </button>
            <button
              type="button"
              className={collapsedButtonClasses}
              onClick={() => setCollapsed(false)}
              title="Playbook actions"
            >
              <PlayCircle className="h-5 w-5" aria-hidden />
              <span className="sr-only">Playbook actions</span>
            </button>
          </div>
          <div className="h-10 w-px rounded-full bg-gradient-to-b from-indigo-200 via-gray-200 to-transparent" aria-hidden />
          <button
            type="button"
            className={collapsedButtonClasses}
            onClick={() => setCollapsed(false)}
            aria-label="Expand properties"
            aria-expanded={!collapsed}
          >
            <PanelRightOpen className="h-5 w-5" aria-hidden />
          </button>
        </div>
      ) : (
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
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                        <Users className="h-4 w-4" aria-hidden />
                      </span>
                      <div className="flex-1 space-y-1 text-sm text-gray-700">
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

                {/* Start/End Configuration */}
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

                {/* Quantitative Stats - 2x2 Grid */}
                <div className="space-y-3">
                  {/* Row 1: Nodes and Connections */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                          <Layers className="h-3.5 w-3.5" aria-hidden />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Nodes</p>
                          <p className="text-lg font-bold text-gray-900">{nodes.length}</p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                          <GitBranch className="h-3.5 w-3.5" aria-hidden />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Connections</p>
                          <p className="text-lg font-bold text-gray-900">{edges.length}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Row 2: Agents and Step Groups */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                          <Users className="h-3.5 w-3.5" aria-hidden />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Agents</p>
                          <p className="text-lg font-bold text-gray-900">{workflowSummary.agentCount}</p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                          <Layers className="h-3.5 w-3.5" aria-hidden />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Step Groups</p>
                          <p className="text-lg font-bold text-gray-900">{workflowSummary.stepGroupCount}</p>
                        </div>
                      </div>
                    </div>
                  </div>
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
