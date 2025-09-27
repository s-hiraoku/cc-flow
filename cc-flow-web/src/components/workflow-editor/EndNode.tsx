"use client";

import React from "react";
import { Handle, Position, useReactFlow, NodeProps } from "@xyflow/react";
import { Card } from "@/components/ui";
import { EndNodeData } from "@/types/workflow";

export default function EndNode({ id, data, selected }: NodeProps) {
  const { deleteElements } = useReactFlow();
  const endData = data as EndNodeData;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteElements({ nodes: [{ id }] });
  };

  return (
    <div className="relative group"
      style={{
        width: 320,
        height: 'auto',
        minWidth: 320
      }}
    >
      <Card
        className={`w-full h-full p-4 border-l-4 border-l-orange-500 bg-orange-50/60 shadow-sm transition-all relative ${
          selected ? "ring-2 ring-orange-500" : "hover:shadow-md"
        }`}
      >
        {/* Delete button */}
        <button
          onClick={handleDelete}
          className="absolute top-2 right-2 w-5 h-5 bg-gray-500 hover:bg-gray-600 text-white rounded-full flex items-center justify-center shadow-sm transition-all opacity-0 group-hover:opacity-100 cursor-pointer z-10"
          title="Delete node"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>

        <Handle
          type="target"
          position={Position.Top}
          className="w-3 h-3 bg-orange-500 border-2 border-white"
        />

        <div className="flex items-start">
          <div className="w-8 h-8 flex items-center justify-center bg-orange-200 rounded-full text-orange-700">
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
                d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 2H21l-3 6 3 6h-8.5l-1-2H5a2 2 0 00-2 2zm9-13.5V9"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-semibold text-orange-900">{endData.label}</h3>
            {endData.description && (
              <p className="text-xs text-orange-700/80 mt-1">{endData.description}</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}