"use client";

import React, { useState } from "react";
import { Handle, Position, useReactFlow, NodeProps } from "@xyflow/react";
import { Card } from "@/components/ui";
import { StartNodeData } from "@/types/workflow";

export default function StartNode({ id, data, selected }: NodeProps<StartNodeData>) {
  const [isHovered, setIsHovered] = useState(false);
  const { deleteElements } = useReactFlow();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteElements({ nodes: [{ id }] });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div
      className="relative group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Card
        className={`min-w-[180px] p-3 border-l-4 border-l-emerald-500 bg-emerald-50/60 shadow-sm transition-all ${
          selected ? "ring-2 ring-emerald-500" : "hover:shadow-md"
        }`}
      >
        {/* Delete button */}
        <button
          onClick={handleDelete}
          className="absolute top-1 right-1 w-5 h-5 bg-gray-500 hover:bg-gray-600 text-white rounded-full flex items-center justify-center shadow-sm transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
          style={{ zIndex: 1000 }}
          title="Delete node"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>

        <div className="flex items-start">
          <div className="w-8 h-8 flex items-center justify-center bg-emerald-200 rounded-full text-emerald-700">
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 12h14M12 5l7 7-7 7"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-semibold text-emerald-900">{data.label}</h3>
            {data.description && (
              <p className="text-xs text-emerald-700/80 mt-1">{data.description}</p>
            )}
          </div>
        </div>

        <Handle
          type="source"
          position={Position.Bottom}
          className="w-3 h-3 bg-emerald-500 border-2 border-white"
        />
      </Card>
    </div>
  );
}