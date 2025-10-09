"use client";

import React from "react";
import { Handle, Position, useReactFlow, NodeProps } from "@xyflow/react";
import { AgentNodeData } from "@/types/workflow";
import { getCategoryColors, getCategoryIcon } from "@/utils/categoryStyles";

export default function AgentNode({ id, data, selected }: NodeProps) {
  const { deleteElements } = useReactFlow();

  // Get dynamic colors and icon based on category
  const agentData = data as AgentNodeData;
  const category = agentData?.category || "default";
  const hasError = agentData.hasError || false;
  const colors = getCategoryColors(category);
  const icon = getCategoryIcon(category);
  // Color mapping for handle backgrounds
  const colorMap: Record<string, { bg: string; shadow: string }> = {
    "border-sky-400": { bg: "#38bdf8", shadow: "rgba(56, 189, 248, 0.5)" },
    "border-emerald-400": { bg: "#34d399", shadow: "rgba(52, 211, 153, 0.5)" },
    "border-violet-400": { bg: "#a78bfa", shadow: "rgba(167, 139, 250, 0.5)" },
    "border-amber-400": { bg: "#fbbf24", shadow: "rgba(251, 191, 36, 0.5)" },
    "border-rose-400": { bg: "#fb7185", shadow: "rgba(251, 113, 133, 0.5)" },
    "border-indigo-400": { bg: "#818cf8", shadow: "rgba(129, 140, 248, 0.5)" },
    "border-teal-400": { bg: "#2dd4bf", shadow: "rgba(45, 212, 191, 0.5)" },
    "border-cyan-400": { bg: "#22d3ee", shadow: "rgba(34, 211, 238, 0.5)" },
    "border-indigo-300": { bg: "#a5b4fc", shadow: "rgba(165, 180, 252, 0.5)" }, // default
  };

  const handleColor = hasError
    ? { bg: "#ef4444", shadow: "rgba(239, 68, 68, 0.5)" }
    : colorMap[colors.handleBorder] || colorMap["border-indigo-300"];

  const handleClasses = "rounded-full";
  const baseHandleStyle = {
    width: "20px",
    height: "20px",
    border: "4px solid white",
    background: handleColor.bg,
    boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 10px ${handleColor.shadow}`,
  };
  const targetHandleStyle = {
    ...baseHandleStyle,
    top: "50%",
    left: "0",
    transform: "translate(-50%, -50%)",
  } as const;
  const sourceHandleStyle = {
    ...baseHandleStyle,
    top: "50%",
    right: "0",
    transform: "translate(50%, -50%)",
  } as const;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteElements({ nodes: [{ id }] });
  };


  return (
    <div className="relative group" style={{ width: 360, minWidth: 360 }}>
      <div
        className={`w-full cursor-pointer rounded-2xl border px-4 py-4 backdrop-blur transition-all duration-200 ${
          hasError
            ? "border-red-500/60 bg-red-50"
            : `${colors.solidBorder} bg-white`
        } ${
          selected
            ? hasError
              ? "ring-2 ring-red-400/70 shadow-lg"
              : `ring-2 ${colors.ring} shadow-lg`
            : "hover:shadow-lg"
        }`}
      >
        {/* Delete button */}
        <button
          onClick={handleDelete}
          className="absolute right-3 top-3 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 bg-gray-100 text-gray-600 opacity-0 shadow-sm transition-all hover:bg-gray-200 hover:text-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400 group-hover:opacity-100"
          title="Delete node"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
        <Handle
          type="target"
          position={Position.Left}
          className={handleClasses}
          style={targetHandleStyle}
        />

        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors.icon}`}>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={icon}
                />
              </svg>
            </div>
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 break-words line-clamp-2">{agentData.label}</h3>
            {agentData.stepTitle && (
              <p className={`mt-0.5 text-xs font-medium ${colors.text} break-words line-clamp-1`}>
                Title: {agentData.stepTitle}
              </p>
            )}
            {agentData.description && (
              <p className="mt-1 text-xs text-gray-600 break-words line-clamp-2">
                {agentData.description}
              </p>
            )}
            {category && category !== "default" && (
              <div className="mt-2">
                <span className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-medium uppercase tracking-wide ${colors.icon}`}>
                  {category}
                </span>
              </div>
            )}
          </div>
        </div>

        <Handle
          type="source"
          position={Position.Right}
          className={handleClasses}
          style={sourceHandleStyle}
        />
      </div>
    </div>
  );
}
