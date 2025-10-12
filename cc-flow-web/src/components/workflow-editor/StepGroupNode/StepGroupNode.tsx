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
  const targetHandleClasses = "rounded-full";
  const sourceHandleClasses = targetHandleClasses;
  const baseHandleStyle = {
    width: "20px",
    height: "20px",
    border: "4px solid white",
    background: hasError ? "#ef4444" : "#a855f7",
    boxShadow: hasError
      ? "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 10px rgba(239, 68, 68, 0.5)"
      : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 10px rgba(168, 85, 247, 0.5)",
  };
  const leftHandleStyle = {
    ...baseHandleStyle,
    top: "50%",
    left: "0",
    transform: "translate(-50%, -50%)",
  } as const;
  const rightHandleStyle = {
    ...baseHandleStyle,
    top: "50%",
    right: "0",
    transform: "translate(50%, -50%)",
  } as const;

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
  const headerHeight = 80; // pt-20 = 80px
  const dropZoneHeight = agentCount >= 10 ? 0 : 150; // Hide drop zone when 10 agents reached
  const agentItemHeight = 52; // Height per agent item including gap
  const padding = 24; // px-3 pb-3 = 12px * 2
  const titleHeight = 28; // Title height with margin
  const minAgentAreaHeight = 100; // Minimum height for agent area

  // Calculate agent area height - expand to show all agents
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
              ? "border-red-500/70 bg-red-50 shadow-lg ring-2 ring-red-400/60"
              : isDragOver
              ? "border-red-500/70 bg-red-50 shadow-md"
              : "border-red-500/50 bg-red-50/50 hover:border-red-400/70 hover:bg-red-50 hover:shadow-md"
            : selected
            ? "border-purple-400/70 bg-purple-50 shadow-lg ring-2 ring-purple-400/60"
            : isDragOver
            ? "border-purple-400/70 bg-purple-50 shadow-md"
            : "border-purple-400/40 bg-white hover:border-purple-300/60 hover:bg-purple-50/50 hover:shadow-md"
        }`}
        style={{
          position: "relative",
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Target handle on the left */}
        <Handle
          type="target"
          position={Position.Left}
          className={targetHandleClasses}
          style={leftHandleStyle}
        />

        <StepGroupHeader
          title={stepData.title}
          purpose={stepData.purpose}
          mode={stepData.mode}
          onDelete={handleDelete}
        />

        {/* Content area with agents */}
        <div className="flex h-full flex-col px-3 pb-3 pt-20">
          {/* Title outside the border */}
          <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-purple-700">
            Agents ({agentCount}/10)
          </h4>

          {/* Agent list area - dynamic height */}
          <div className="mb-2 rounded-xl border border-purple-200 bg-gray-50 p-3">
            {agentCount > 0 ? (
              <AgentList
                agents={stepData.agents}
                onRemoveAgent={handleRemoveAgent}
              />
            ) : (
              <div className="flex h-20 w-full items-center justify-center text-center text-sm text-gray-500">
                No agents yet
              </div>
            )}
          </div>

          {/* Fixed height drop zone at bottom */}
          {agentCount < 10 && (
            <div
              className={`rounded-xl border-2 border-dashed p-4 transition-all ${
              isDragOver
                ? "border-purple-400/70 bg-purple-100"
                : "border-purple-400/40 bg-gray-50"
            }`}
            style={{ height: `${dropZoneHeight}px`, flexShrink: 0 }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center text-center h-full">
              <svg
                className={`mb-2 h-8 w-8 transition-colors ${
                  isDragOver ? "text-purple-600" : "text-purple-500"
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
                isDragOver ? "text-purple-700" : "text-purple-600"
              }`}>
                Drop agents here
              </p>
              <p className="mt-1 text-xs text-purple-600">
                {agentCount}/10 agents
              </p>
            </div>
          </div>
          )}
        </div>

        {/* Source handle on the right */}
        <Handle
          type="source"
          position={Position.Right}
          className={sourceHandleClasses}
          style={rightHandleStyle}
        />
      </div>
    </div>
  );
}
