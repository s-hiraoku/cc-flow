"use client";

import React, { useCallback, useState } from "react";
import Canvas from "@/components/workflow-editor/Canvas";
import AgentPalette from "@/components/panels/AgentPalette";
import PropertiesPanel from "@/components/panels/PropertiesPanel/PropertiesPanel";
import { ErrorBoundary } from "@/components/common";
import { EditorToolbar, EditorNotificationArea } from "@/components/editor";
import { useWorkflowEditor, useAgents, useWorkflowGenerate, useAutoHideMessage } from "@/hooks";
import { Agent } from "@/types/agent";
import { WorkflowNode } from "@/types/workflow";
export default function EditorPage() {
  // All hooks must be called before any conditional returns
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);

  // Custom hooks for state management
  const {
    nodes,
    edges,
    metadata,
    setMetadata,
    handleNodesChange,
    handleEdgesChange,
    handleConnect,
    generatePreviewJSON,
    canSave,
  } = useWorkflowEditor();

  const { agents, loading: agentsLoading, error: agentsError } = useAgents();
  const { generating, currentStep, error: generateError, result: generateResult, generateWorkflow } = useWorkflowGenerate();

  // Auto-hide success message after 5 seconds with fade out animation
  const { isVisible: showSuccessMessage, isAnimating: isSuccessVisible } = useAutoHideMessage(
    Boolean(generateResult && !generating),
    5000
  );

  // Event handlers
  const handleNodesChangeWithSelection = useCallback((newNodes: WorkflowNode[]) => {
    handleNodesChange(newNodes);
    // Update selected nodes based on ReactFlow's selection
    const selectedNodes = newNodes.filter(node => node.selected);
    setSelectedNodeIds(selectedNodes.map(node => node.id));
  }, [handleNodesChange]);

  const handleAgentDragStart = useCallback((agent: Agent) => {
    console.log("Dragging agent:", agent);
  }, []);

  const handleGenerateWorkflow = useCallback(async () => {
    await generateWorkflow(metadata, nodes, edges);
  }, [generateWorkflow, metadata, nodes, edges]);

  const handlePreviewJSON = useCallback(() => {
    console.log("Preview JSON:", generatePreviewJSON());
  }, [generatePreviewJSON]);

  return (
    <ErrorBoundary>
      <div className="relative flex h-screen w-full flex-col overflow-hidden bg-gray-50 text-gray-900 lg:flex-row">

        <a
          href="#editor-canvas"
          className="absolute left-6 top-6 z-50 -translate-y-32 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg transition-transform focus-visible:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
        >
          Skip to workflow canvas
        </a>

        <AgentPalette
          agents={agents}
          loading={agentsLoading}
          error={agentsError}
          onAgentDragStart={handleAgentDragStart}
        />

        <main className="relative flex min-w-0 flex-1 flex-col">
          <EditorToolbar
            nodeCount={nodes.length}
            edgeCount={edges.length}
            canSave={canSave}
            generating={generating}
            onPreviewJSON={handlePreviewJSON}
            onGenerateWorkflow={handleGenerateWorkflow}
          />

          <EditorNotificationArea
            generating={generating}
            currentStep={currentStep}
            error={generateError}
            result={generateResult}
            showSuccessMessage={showSuccessMessage}
            isSuccessVisible={isSuccessVisible}
          />

          <section className="flex min-w-0 flex-1 flex-col gap-4 overflow-hidden p-4">
            <div
              id="editor-canvas"
              className="relative flex min-w-0 flex-1 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl"
            >
              <Canvas
                nodes={nodes}
                edges={edges}
                onNodesChange={handleNodesChangeWithSelection}
                onEdgesChange={handleEdgesChange}
                onConnect={handleConnect}
              />
            </div>
          </section>
        </main>

        <PropertiesPanel
          metadata={metadata}
          onMetadataChange={setMetadata}
          nodes={nodes}
          edges={edges}
          selectedNodeIds={selectedNodeIds}
          onNodesChange={handleNodesChange}
        />
      </div>
    </ErrorBoundary>
  );
}
