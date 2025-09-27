import React, { useState, useCallback } from 'react';
import { Handle, Position, useReactFlow, NodeProps } from '@xyflow/react';
import { StepGroupNodeData } from '@/types/workflow';
import StepGroupHeader from './StepGroupHeader';
import AgentList from './AgentList';

export default function StepGroupNode({ id, data, selected }: NodeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { deleteElements } = useReactFlow();
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
      const updatedAgents = stepData.agents.filter((name: string) => name !== agentName);
      updateNodeData(id, { agents: updatedAgents });
    }
  }, [stepData.agents, id]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback(() => {
    // Don't prevent default or stop propagation
    // Let Canvas handle all drop logic
  }, []);

  return (
    <div
      className="relative group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        width: 300,
        height: 200,
        minWidth: 300,
        minHeight: 200,
        zIndex: selected ? 1 : 0,
      }}
    >
      <div
        className={`w-full h-full border-2 border-dashed rounded-lg transition-all ${
          selected
            ? "border-purple-500 bg-purple-50/50"
            : "border-purple-300 bg-purple-50/30 hover:border-purple-400 hover:bg-purple-50/40"
        }`}
        style={{
          position: 'relative',
        }}
        onDragOver={handleDragOver}
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
          isHovered={isHovered}
        />

        {/* Content area */}
        <div className="flex flex-col h-full pt-16 pb-4">
          <AgentList
            agents={stepData.agents}
            onRemoveAgent={handleRemoveAgent}
          />
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