"use client";

import React from "react";
import { Handle, Position, useReactFlow, NodeProps } from "@xyflow/react";
import { Card } from "@/components/ui";
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
    <div className="relative group"
      style={{
        width: 400,
        height: 'auto',
        minWidth: 400
      }}
    >
      <Card
        className={`w-full h-full p-4 border-l-4 ${
          hasError
            ? "border-l-red-500 bg-red-50/60"
            : "border-l-emerald-500 bg-emerald-50/60"
        } shadow-sm transition-all relative ${
          selected
            ? hasError
              ? "ring-2 ring-red-500"
              : "ring-2 ring-emerald-500"
            : "hover:shadow-md"
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

        <div className="flex items-start">
          <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
            hasError
              ? "bg-red-200 text-red-700"
              : "bg-emerald-200 text-emerald-700"
          }`}>
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
          <div className="ml-3 flex-1">
            <h3 className={`text-sm font-semibold ${
              hasError ? "text-red-900" : "text-emerald-900"
            }`}>{startData.label}</h3>
            {startData.description && (
              <p className={`text-xs mt-1 ${
                hasError ? "text-red-700/80" : "text-emerald-700/80"
              }`}>{startData.description}</p>
            )}
            {startData.workflowName && (
              <div className={`mt-2 text-xs ${
                hasError ? "text-red-800" : "text-emerald-800"
              }`}>
                <span className="font-medium">Workflow:</span> {startData.workflowName}
              </div>
            )}
            {startData.workflowPurpose && (
              <div className={`mt-1 text-xs ${
                hasError ? "text-red-700/80" : "text-emerald-700/80"
              }`}>
                <span className="font-medium">Purpose:</span> {startData.workflowPurpose}
              </div>
            )}
          </div>
        </div>
        <Handle
          type="source"
          position={Position.Bottom}
          className={`w-3 h-3 border-2 border-white ${
            hasError ? "bg-red-500" : "bg-emerald-500"
          }`}
        />
      </Card>
    </div>
  );
}