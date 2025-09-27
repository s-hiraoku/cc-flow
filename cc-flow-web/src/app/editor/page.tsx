"use client";

import React, { useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
import Canvas from "@/components/workflow-editor/Canvas";
import AgentPalette from "@/components/panels/AgentPalette";
import PropertiesPanel from "@/components/panels/PropertiesPanel";
import { ErrorBoundary } from "@/components/common";
import { useWorkflowEditor, useAgents, useWorkflowSave } from "@/hooks";
import { Agent } from "@/types/agent";

export default function EditorPage() {
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
  const { saving, error: saveError, lastSaved, saveWorkflow } = useWorkflowSave();

  // Event handlers
  const handleAgentDragStart = useCallback((agent: Agent) => {
    console.log("Dragging agent:", agent);
  }, []);

  const handleSaveWorkflow = useCallback(async () => {
    await saveWorkflow(metadata, nodes, edges);
  }, [saveWorkflow, metadata, nodes, edges]);

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
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center">
            <Link href="/" className="text-gray-500 hover:text-gray-700 mr-4">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">
              Workflow Editor
            </h1>
            <span className="ml-4 text-sm text-gray-500">
              {nodes.length} node{nodes.length !== 1 ? "s" : ""}, {edges.length}{" "}
              connection{edges.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={handlePreviewJSON}
            >
              Preview JSON
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveWorkflow}
              disabled={!canSave || saving}
            >
              {saving ? "Saving..." : "Save Workflow"}
            </Button>
          </div>
        </div>

        {(lastSaved || saveError) && (
          <div className="px-6 pt-4 bg-white border-b border-gray-200">
            {lastSaved && (
              <div className="mb-3 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 shadow-sm">
                <p className="font-medium">Workflow saved successfully.</p>
                <p className="mt-1">{lastSaved.workflowName}</p>
                {(lastSaved.filename || lastSaved.path) && (
                  <p className="mt-1 text-emerald-700/80">
                    {lastSaved.filename && <span>File: {lastSaved.filename}</span>}
                    {lastSaved.filename && lastSaved.path && <span> · </span>}
                    {lastSaved.path && <span>Path: {lastSaved.path}</span>}
                  </p>
                )}
              </div>
            )}
            {saveError && (
              <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm">
                <p className="font-medium">Failed to save workflow.</p>
                <p className="mt-1">{saveError}</p>
              </div>
            )}
          </div>
        )}

        {/* ReactFlow Canvas */}
        <div className="flex-1">
          <Canvas
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
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
      />
      </div>
    </ErrorBoundary>
  );
}
