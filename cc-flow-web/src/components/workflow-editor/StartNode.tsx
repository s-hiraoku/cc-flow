"use client";

import React from "react";
import { Handle, Position, useReactFlow, NodeProps } from "@xyflow/react";
import { StartNodeData } from "@/types/workflow";

export default function StartNode({ id, data, selected }: NodeProps) {
  const { deleteElements } = useReactFlow();
  const startData = data as StartNodeData;
  const hasError = startData.hasError || false;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteElements({ nodes: [{ id }] });
  };

  return (
    <div
      className="group relative"
      style={{
        width: 400,
        minHeight: 180,
        minWidth: 400,
      }}
    >
      <div
        className={`relative w-full rounded-2xl border-l-4 px-4 py-6 backdrop-blur transition-all duration-200 ${
          hasError
            ? "border-l-red-500 bg-red-50"
            : "border-l-emerald-500 bg-emerald-50"
        } ${
          selected
            ? hasError
              ? "ring-2 ring-red-400/60 shadow-lg"
              : "ring-2 ring-emerald-400/60 shadow-lg"
            : "hover:shadow-md"
        }`}
      >
        {/* Delete button */}
        <button
          onClick={handleDelete}
          className="absolute right-3 top-3 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 bg-gray-100 text-gray-600 opacity-0 shadow-sm transition-all hover:bg-gray-200 hover:text-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 group-hover:opacity-100"
          title="Delete node"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>

        <div className="flex items-start">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full ${
              hasError ? "bg-red-500/30 text-red-700" : "bg-emerald-500/30 text-emerald-800"
            }`}
          >
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
                d="M5 12h14M12 5l7 7-7 7"
              />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-semibold text-gray-900">{startData.label}</h3>
            {startData.description && (
              <p className="mt-1 text-xs text-gray-600">{startData.description}</p>
            )}
            {startData.workflowName && (
              <div className="mt-2 text-xs text-gray-700">
                <span className="font-medium text-gray-900">Workflow:</span> {startData.workflowName}
              </div>
            )}
            {startData.workflowPurpose && (
              <div className="mt-1 text-xs text-gray-700">
                <span className="font-medium text-gray-900">Purpose:</span> {startData.workflowPurpose}
              </div>
            )}
          </div>
        </div>
        <Handle
          type="source"
          position={Position.Bottom}
          className={`h-3 w-3 border-2 border-white ${
            hasError ? "bg-red-500" : "bg-emerald-500"
          }`}
        />
      </div>
    </div>
  );
}
