import React, { useState, useCallback, useEffect } from 'react';
import { Handle, Position, useReactFlow, useUpdateNodeInternals, NodeProps } from '@xyflow/react';
import { StepGroupNodeData } from '@/types/workflow';
import StepGroupHeader from './StepGroupHeader';
import AgentList from './AgentList';

export default function StepGroupNode({ id, data, selected }: NodeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const { deleteElements } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();
  const stepData = data as StepGroupNodeData;

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    deleteElements({ nodes: [{ id }] });
  }, [deleteElements, id]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const handleRemoveAgent = useCallback((agentName: string) => {
    const updateNodeData = (window as { __updateNodeData?: (id: string, data: Record<string, unknown>) => void }).__updateNodeData;
    if (typeof updateNodeData === 'function') {
      const updatedAgents = stepData.agents.filter((agent) => {
        if (typeof agent === 'string') {
          return agent !== agentName;
        }
        return agent.name !== agentName;
      });
      updateNodeData(id, { agents: updatedAgents });
    }
  }, [stepData.agents, id]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(() => {
    setIsDragOver(false);
    // Let Canvas handle all drop logic
  }, []);

  // Fixed node height to prevent overflow
  const agentCount = stepData.agents.length;
  const headerHeight = 64; // pt-16 = 64px
  const agentListHeight = 140; // Fixed height for agent list with scroll
  const dropZoneHeight = 150; // Fixed height for drop zone
  const padding = 24; // px-3 pb-3 = 12px * 2
  const titleHeight = 24; // Title height
  const totalHeight = headerHeight + titleHeight + agentListHeight + dropZoneHeight + padding + 16; // 16px extra spacing

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
        className={`w-full h-full border-2 border-dashed rounded-lg transition-all ${
          selected
            ? "border-purple-500 shadow-lg ring-2 ring-purple-200"
            : isDragOver
            ? "border-purple-500 shadow-md"
            : "border-purple-300 hover:border-purple-400 hover:shadow-md"
        } bg-white`}
        style={{
          position: 'relative',
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Target handle at the top */}
        <Handle
          type="target"
          position={Position.Top}
          className="w-3 h-3 bg-purple-500 border-2 border-white"
        />

        <StepGroupHeader
          title={stepData.title}
          purpose={stepData.purpose}
          mode={stepData.mode}
          onDelete={handleDelete}
        />

        {/* Content area with agents */}
        <div className="pt-16 px-3 pb-3 flex flex-col h-full">
          {/* Title outside the border */}
          <h4 className="text-xs font-semibold text-gray-600 mb-1.5">
            Agents ({agentCount}/10)
          </h4>
          
          {/* Agent list area - fixed height with scroll */}
          <div className="mb-2 border-2 border-gray-200 rounded-lg bg-gray-50/50 p-3 overflow-y-auto" style={{ height: '140px' }}>
            {agentCount > 0 ? (
              <AgentList
                agents={stepData.agents}
                onRemoveAgent={handleRemoveAgent}
              />
            ) : (
              <div className="flex items-center justify-center h-20 text-gray-400 text-sm w-full text-center">
                No agents yet
              </div>
            )}
          </div>
          
          {/* Fixed height drop zone at bottom */}
          <div
            className={`border-2 border-dashed rounded-lg p-4 transition-all ${
              isDragOver
                ? "border-purple-500 bg-purple-50"
                : "border-purple-200 bg-purple-25"
            }`}
            style={{ height: `${dropZoneHeight}px`, flexShrink: 0 }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center text-center h-full">
              <svg
                className={`w-8 h-8 mb-2 transition-colors ${
                  isDragOver ? "text-purple-500" : "text-purple-300"
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
              <p
                className={`text-sm font-medium transition-colors ${
                  isDragOver ? "text-purple-600" : "text-purple-400"
                }`}
              >
                Drop agents here
              </p>
              <p className="text-xs text-purple-300 mt-1">
                {agentCount}/10 agents
              </p>
            </div>
          </div>
        </div>

        {/* Source handle at the bottom */}
        <Handle
          type="source"
          position={Position.Bottom}
          className="w-3 h-3 bg-purple-500 border-2 border-white"
        />
      </div>
    </div>
  );
}