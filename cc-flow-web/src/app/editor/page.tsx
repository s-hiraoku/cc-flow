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
      <div className="h-screen flex bg-gray-50">
        {/* Agent Palette */}
        <AgentPalette
          agents={agents}
          loading={agentsLoading}
          error={agentsError}
          onAgentDragStart={handleAgentDragStart}
        />

        {/* Main Editor */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <EditorToolbar
            nodeCount={nodes.length}
            edgeCount={edges.length}
            canSave={canSave}
            generating={generating}
            onPreviewJSON={handlePreviewJSON}
            onGenerateWorkflow={handleGenerateWorkflow}
          />

          {/* Notification Area (Progress & Success Messages) */}
          <EditorNotificationArea
            generating={generating}
            currentStep={currentStep}
            error={generateError}
            result={generateResult}
            showSuccessMessage={showSuccessMessage}
            isSuccessVisible={isSuccessVisible}
          />

          {/* ReactFlow Canvas */}
          <div className="flex-1">
            <Canvas
              nodes={nodes}
              edges={edges}
              onNodesChange={handleNodesChangeWithSelection}
              onEdgesChange={handleEdgesChange}
              onConnect={handleConnect}
            />
          </div>
        </div>

        {/* Properties Panel */}
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
