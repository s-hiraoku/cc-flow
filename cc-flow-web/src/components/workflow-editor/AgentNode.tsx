"use client";

import React from "react";
import { Handle, Position } from "@xyflow/react";
import { Card } from "@/components/ui";
import { AgentNodeData } from "@/types/workflow";

interface AgentNodeProps {
  data: AgentNodeData;
  selected?: boolean;
}

export default function AgentNode({ data, selected }: AgentNodeProps) {
  return (
    <Card
      className={`min-w-[200px] p-4 cursor-pointer transition-all duration-200 ${
        selected ? "ring-2 ring-indigo-500 shadow-lg" : "hover:shadow-md"
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-indigo-500 border-2 border-white"
      />

      <div className="flex items-start">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
            <svg
              className="w-4 h-4 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-semibold text-gray-900">{data.label}</h3>
          {data.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              {data.description}
            </p>
          )}
          <div className="mt-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              Agent
            </span>
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-indigo-500 border-2 border-white"
      />
    </Card>
  );
}
