"use client";

import React from "react";
import { Handle, Position, useReactFlow, NodeProps } from "@xyflow/react";
import { Card } from "@/components/ui";
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

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteElements({ nodes: [{ id }] });
  };


  return (
    <div className="relative group">
      <Card
        className={`min-w-[200px] p-4 cursor-pointer transition-all duration-200 border-2 ${
          hasError
            ? "border-red-500 bg-red-50"
            : `${colors.solidBorder} ${colors.solidBg}`
        } ${
          selected
            ? hasError
              ? "ring-2 ring-red-500 shadow-lg"
              : `ring-2 ${colors.ring} shadow-lg`
            : "hover:shadow-md"
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

        <Handle
          type="target"
          position={Position.Top}
          className={`w-3 h-3 border-2 border-white ${
            hasError ? "bg-red-500" : colors.handle
          }`}
        />

        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colors.icon}`}>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={icon}
                />
              </svg>
            </div>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-semibold text-gray-900">{agentData.label}</h3>
            {agentData.stepTitle && agentData.stepTitle !== agentData.agentName && (
              <p className="text-xs font-medium text-indigo-600 mt-0.5">
                title: {agentData.stepTitle}
              </p>
            )}
            {agentData.description && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                {agentData.description}
              </p>
            )}
            {category && category !== "default" && (
              <div className="mt-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors.icon}`}>
                  {category}
                </span>
              </div>
            )}
          </div>
        </div>

        <Handle
          type="source"
          position={Position.Bottom}
          className={`w-3 h-3 border-2 border-white ${
            hasError ? "bg-red-500" : colors.handle
          }`}
        />
      </Card>
    </div>
  );
}