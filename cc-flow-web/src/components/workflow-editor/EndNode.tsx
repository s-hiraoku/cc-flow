"use client";

import React from "react";
import { Handle, Position, useReactFlow, NodeProps } from "@xyflow/react";
import { EndNodeData } from "@/types/workflow";

export default function EndNode({ id, data, selected }: NodeProps) {
  const { deleteElements } = useReactFlow();
  const endData = data as EndNodeData;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteElements({ nodes: [{ id }] });
  };

  return (
    <div
      className="group relative"
      style={{
        width: 400,
        height: "auto",
        minWidth: 400,
      }}
    >
      <div
        className={`relative w-full rounded-2xl border-l-4 border-l-amber-500 px-4 py-4 backdrop-blur transition-all duration-200 ${
          selected ? "ring-2 ring-amber-400/60 shadow-lg" : "hover:shadow-md"
        } bg-amber-50`}
      >
        <Handle
          type="target"
          position={Position.Top}
          className="h-3 w-3 border-2 border-white bg-amber-500"
        />
        {/* Delete button */}
        <button
          onClick={handleDelete}
          className="absolute right-3 top-3 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 bg-gray-100 text-gray-600 opacity-0 shadow-sm transition-all hover:bg-gray-200 hover:text-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 group-hover:opacity-100"
          title="Delete node"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>



        <div className="flex items-start">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/30 text-amber-800">
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 2H21l-3 6 3 6h-8.5l-1-2H5a2 2 0 00-2 2zm9-13.5V9"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-semibold text-gray-900">{endData.label}</h3>
            {endData.description && (
              <p className="mt-1 text-xs text-gray-600">{endData.description}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
