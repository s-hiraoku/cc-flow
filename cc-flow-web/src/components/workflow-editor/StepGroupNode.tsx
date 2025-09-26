"use client";

import React from "react";
import { Handle, Position } from "@xyflow/react";
import { Card } from "@/components/ui";
import { StepGroupNodeData } from "@/types/workflow";

interface StepGroupNodeProps {
  data: StepGroupNodeData;
  selected?: boolean;
}

export default function StepGroupNode({ data, selected }: StepGroupNodeProps) {
  const modeColor =
    data.mode === "parallel"
      ? "bg-green-100 text-green-800"
      : "bg-blue-100 text-blue-800";
  const iconColor =
    data.mode === "parallel" ? "text-green-600" : "text-blue-600";

  return (
    <Card
      className={`min-w-[250px] p-4 cursor-pointer transition-all duration-200 ${
        selected ? "ring-2 ring-indigo-500 shadow-lg" : "hover:shadow-md"
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-indigo-500 border-2 border-white"
      />

      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900">
              {data.title}
            </h3>
            {data.purpose && (
              <p className="text-xs text-gray-500 mt-1">{data.purpose}</p>
            )}
          </div>
          <div className="flex-shrink-0 ml-2">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                data.mode === "parallel" ? "bg-green-100" : "bg-blue-100"
              }`}
            >
              {data.mode === "parallel" ? (
                <svg
                  className={`w-4 h-4 ${iconColor}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className={`w-4 h-4 ${iconColor}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 5l7 7-7 7M5 5l7 7-7 7"
                  />
                </svg>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${modeColor}`}
          >
            {data.mode === "parallel" ? "Parallel" : "Sequential"}
          </span>
          <span className="text-xs text-gray-500">
            {data.agents.length} agent{data.agents.length !== 1 ? "s" : ""}
          </span>
        </div>

        {data.agents.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-700">Agents:</p>
            <div className="flex flex-wrap gap-1">
              {data.agents.slice(0, 3).map((agent, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-700"
                >
                  {agent}
                </span>
              ))}
              {data.agents.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-700">
                  +{data.agents.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-indigo-500 border-2 border-white"
      />
    </Card>
  );
}
