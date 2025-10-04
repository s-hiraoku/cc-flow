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
        height: "auto",
        minWidth: 400,
      }}
    >
      <div
        className={`relative w-full rounded-2xl border-l-4 px-4 py-4 backdrop-blur transition-all duration-200 ${
          hasError
            ? "border-l-red-500 bg-red-500/10"
            : "border-l-emerald-500 bg-emerald-500/10"
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
          className="absolute right-3 top-3 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-white/10 text-slate-200 opacity-0 shadow-sm transition-all hover:bg-white/20 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 group-hover:opacity-100"
          title="Delete node"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>

        <div className="flex items-start">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full ${
              hasError ? "bg-red-500/20 text-red-100" : "bg-emerald-500/20 text-emerald-100"
            }`}
          >
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
          <div className="ml-3 flex-1 text-slate-100">
            <h3 className="text-sm font-semibold text-white">{startData.label}</h3>
            {startData.description && (
              <p className="mt-1 text-xs text-slate-300">{startData.description}</p>
            )}
            {startData.workflowName && (
              <div className="mt-2 text-xs text-slate-200">
                <span className="font-medium text-slate-100">Workflow:</span> {startData.workflowName}
              </div>
            )}
            {startData.workflowPurpose && (
              <div className="mt-1 text-xs text-slate-200">
                <span className="font-medium text-slate-100">Purpose:</span> {startData.workflowPurpose}
              </div>
            )}
          </div>
        </div>
        <Handle
          type="source"
          position={Position.Bottom}
          className={`h-3 w-3 border-2 border-slate-900 ${
            hasError ? "bg-red-500" : "bg-emerald-500"
          }`}
        />
      </div>
    </div>
  );
}
