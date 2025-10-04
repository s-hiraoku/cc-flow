import React, { useState, useCallback, useEffect } from "react";
import {
  Handle,
  Position,
  useReactFlow,
  useUpdateNodeInternals,
  NodeProps,
} from "@xyflow/react";
import { StepGroupNodeData } from "@/types/workflow";
import StepGroupHeader from "./StepGroupHeader";
import AgentList from "./AgentList";

export default function StepGroupNode({ id, data, selected }: NodeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const { deleteElements } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();
  const stepData = data as StepGroupNodeData;
  const hasError = stepData.hasError || false;

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      deleteElements({ nodes: [{ id }] });
    },
    [deleteElements, id]
  );

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const handleRemoveAgent = useCallback(
    (agentName: string) => {
      const updateNodeData = (
        window as {
          __updateNodeData?: (
            id: string,
            data: Record<string, unknown>
          ) => void;
        }
      ).__updateNodeData;
      if (typeof updateNodeData === "function") {
        const updatedAgents = stepData.agents.filter((agent) => {
          if (typeof agent === "string") {
            return agent !== agentName;
          }
          return agent.name !== agentName;
        });
        updateNodeData(id, { agents: updatedAgents });
      }
    },
    [stepData.agents, id]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(() => {
    setIsDragOver(false);
    // Let Canvas handle all drop logic
  }, []);

  // Calculate dynamic height based on number of agents
  const agentCount = stepData.agents.length;
  const headerHeight = 64; // pt-16 = 64px
  const dropZoneHeight = 150; // Fixed height for drop zone
  const agentItemHeight = 52; // Height per agent item including gap
  const padding = 24; // px-3 pb-3 = 12px * 2
  const titleHeight = 28; // Title height with margin
  const minAgentAreaHeight = 100; // Minimum height for agent area

  // Calculate agent area height (minimum 100px for "No agents yet")
  const agentAreaHeight =
    agentCount > 0
      ? agentCount * agentItemHeight + 24 // 24px for padding
      : minAgentAreaHeight;

  const totalHeight =
    headerHeight + titleHeight + agentAreaHeight + dropZoneHeight + padding;

  // Update node internals when size changes
  useEffect(() => {
    updateNodeInternals(id);
  }, [totalHeight, id, updateNodeInternals]);

  return (
    <div
      className="relative group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        width: 410,
        minWidth: 410,
        height: totalHeight,
        minHeight: totalHeight,
        zIndex: selected ? 1 : 0,
      }}
    >
      <div
        className={`w-full h-full rounded-2xl border-2 border-dashed transition-all ${
          hasError
            ? selected
              ? "border-red-500/70 bg-red-500/10 shadow-lg ring-2 ring-red-400/60"
              : isDragOver
              ? "border-red-500/70 bg-red-500/10 shadow-md"
              : "border-red-500/50 bg-red-500/5 hover:border-red-400/70 hover:bg-red-500/10 hover:shadow-md"
            : selected
            ? "border-purple-400/70 bg-purple-500/10 shadow-lg ring-2 ring-purple-400/60"
            : isDragOver
            ? "border-purple-400/70 bg-purple-500/10 shadow-md"
            : "border-purple-400/40 bg-slate-950/70 hover:border-purple-300/60 hover:bg-slate-950/80 hover:shadow-md"
        }`}
        style={{
          position: "relative",
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Target handle at the top */}
        <Handle
          type="target"
          position={Position.Top}
          className={`w-3 h-3 border-2 border-white ${
            hasError ? "bg-red-500" : "bg-purple-500"
          }`}
        />

        <StepGroupHeader
          title={stepData.title}
          purpose={stepData.purpose}
          mode={stepData.mode}
          onDelete={handleDelete}
        />

        {/* Content area with agents */}
        <div className="flex h-full flex-col px-3 pb-3 pt-16 text-slate-100">
          {/* Title outside the border */}
          <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-purple-200">
            Agents ({agentCount}/10)
          </h4>

          {/* Agent list area - dynamic height */}
          <div className="mb-2 rounded-xl border border-white/10 bg-slate-950/70 p-3">
            {agentCount > 0 ? (
              <AgentList
                agents={stepData.agents}
                onRemoveAgent={handleRemoveAgent}
              />
            ) : (
              <div className="flex h-20 w-full items-center justify-center text-center text-sm text-slate-400">
                No agents yet
              </div>
            )}
          </div>

          {/* Fixed height drop zone at bottom */}
          <div
            className={`rounded-xl border-2 border-dashed p-4 transition-all ${
              isDragOver
                ? "border-purple-400/70 bg-purple-500/15"
                : "border-purple-400/40 bg-slate-950/60"
            }`}
            style={{ height: `${dropZoneHeight}px`, flexShrink: 0 }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center text-center h-full">
              <svg
                className={`mb-2 h-8 w-8 transition-colors ${
                  isDragOver ? "text-purple-200" : "text-purple-400"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <p className={`text-sm font-medium transition-colors ${
                isDragOver ? "text-purple-200" : "text-purple-400"
              }`}>
                Drop agents here
              </p>
              <p className="mt-1 text-xs text-purple-300">
                {agentCount}/10 agents
              </p>
            </div>
          </div>
        </div>

        {/* Source handle at the bottom */}
        <Handle
          type="source"
          position={Position.Bottom}
          className={`h-3 w-3 border-2 border-slate-900 ${
            hasError ? "bg-red-500" : "bg-purple-500"
          }`}
        />
      </div>
    </div>
  );
}
