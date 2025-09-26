"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Panel } from "@/components/ui";
import { LoadingSpinner } from "@/components/common";
import { Agent } from "@/types/agent";
import { AgentService } from "@/services";
import {
  CATEGORY_ICONS,
  CATEGORY_COLORS,
  CategoryType,
} from "@/constants/workflow";

type PrimitiveNodeType = "start" | "end" | "group";

interface PrimitiveNode {
  type: PrimitiveNodeType;
  name: string;
  description: string;
}

const PRIMITIVE_NODES: PrimitiveNode[] = [
  {
    type: "start",
    name: "Start",
    description: "Workflow entry point. Use exactly one per workflow.",
  },
  {
    type: "end",
    name: "End",
    description: "Marks workflow completion and aggregates results.",
  },
  {
    type: "group",
    name: "Group",
    description: "Container to organize and group related nodes.",
  },
];

interface AgentPaletteProps {
  agents: Agent[];
  loading?: boolean;
  error?: string | null;
  onAgentDragStart?: (agent: Agent) => void;
}

export default function AgentPalette({
  agents,
  loading = false,
  error = null,
  onAgentDragStart,
}: AgentPaletteProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Memoized categories
  const categories = useMemo(
    () => AgentService.getUniqueCategories(agents),
    [agents]
  );

  // Memoized filtered agents
  const filteredAgents = useMemo(() => {
    let result = AgentService.filterAgentsByCategory(agents, selectedCategory);
    if (searchTerm) {
      result = AgentService.filterAgentsBySearch(result, searchTerm);
    }
    return result;
  }, [agents, selectedCategory, searchTerm]);

  // Drag start handler
  const setPaletteData = (
    event: React.DragEvent,
    payload: { type: string; name: string; description?: string; path?: string }
  ) => {
    event.dataTransfer.setData("application/reactflow", payload.type);
    event.dataTransfer.setData(
      "application/palette-node",
      JSON.stringify(payload)
    );
    if (payload.type === "agent") {
      event.dataTransfer.setData(
        "application/agent",
        JSON.stringify({
          name: payload.name,
          description: payload.description,
          path: payload.path,
        })
      );
    }
  };

  const handleAgentDragStart = useCallback(
    (event: React.DragEvent, agent: Agent) => {
      try {
        setPaletteData(event, {
          type: "agent",
          name: agent.name,
          description: agent.description,
          path: agent.path,
        });
        event.dataTransfer.effectAllowed = "move";

        const dragElement = event.currentTarget as HTMLElement;
        event.dataTransfer.setDragImage(dragElement, 0, 0);

        onAgentDragStart?.(agent);
      } catch (error) {
        console.error("Error in handleDragStart:", error);
      }
    },
    [onAgentDragStart]
  );

  const handlePrimitiveDragStart = useCallback(
    (event: React.DragEvent, primitive: PrimitiveNode) => {
      try {
        setPaletteData(event, {
          type: primitive.type,
          name: primitive.name,
          description: primitive.description,
        });
        event.dataTransfer.effectAllowed = "move";

        const dragElement = event.currentTarget as HTMLElement;
        event.dataTransfer.setDragImage(dragElement, 0, 0);
      } catch (error) {
        console.error("Error in handlePrimitiveDragStart:", error);
      }
    },
    []
  );

  // Helper functions
  const getCategoryIcon = useCallback((category: string) => {
    return CATEGORY_ICONS[category as CategoryType] || CATEGORY_ICONS.default;
  }, []);

  const getCategoryColor = useCallback((category: string) => {
    return CATEGORY_COLORS[category as CategoryType] || CATEGORY_COLORS.default;
  }, []);

  return (
    <Panel
      title="Agent Palette"
      subtitle="Drag agents to the canvas"
      className="w-80"
    >
      <div className="p-4 space-y-4">
        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="flex items-center">
              <div className="text-red-500 mr-2">⚠️</div>
              <div className="text-sm text-red-700">
                <p className="font-medium">Failed to load agents</p>
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Workflow primitives */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
            Workflow Nodes
          </h3>
          <div className="space-y-2">
            {PRIMITIVE_NODES.map((primitive) => (
              <div
                key={primitive.type}
                className="p-3 border border-emerald-200 rounded-lg bg-gradient-to-r from-white to-emerald-50 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition"
                draggable
                onDragStart={(event) =>
                  handlePrimitiveDragStart(event, primitive)
                }
              >
                <div className="flex items-start">
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      primitive.type === "group"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {primitive.type === "start" ? (
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
                    ) : primitive.type === "end" ? (
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
                    ) : (
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
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3 pointer-events-none">
                    <h4 className="text-sm font-medium text-gray-900">
                      {primitive.name} Node
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">
                      {primitive.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Search Field */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
            Workflow Nodes
          </h3>
          <div>
            <input
              type="text"
              placeholder="Search agents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          {/* カテゴリフィルタ */}
          <div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedCategory === category
                      ? "bg-indigo-100 text-indigo-800"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Agents List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="md" className="mr-3" />
                <span className="text-sm text-gray-500">Loading agents...</span>
              </div>
            )}

            {!loading &&
              filteredAgents.map((agent) => (
                <div
                  key={agent.name}
                  className="p-4 cursor-grab active:cursor-grabbing hover:shadow-lg hover:border-indigo-300 transition-all duration-200 border-2 border-dashed border-gray-300 hover:border-indigo-400 bg-gradient-to-r from-white to-gray-50 hover:from-indigo-50 hover:to-blue-50 rounded-lg shadow-sm bg-white select-none"
                  draggable={true}
                  onDragStart={(e) => handleAgentDragStart(e, agent)}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pointer-events-none">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${getCategoryColor(
                          agent.category || "default"
                        )}`}
                      >
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
                            d={getCategoryIcon(agent.category || "default")}
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-3 flex-1 pointer-events-none">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900">
                          {agent.name}
                        </h3>
                        <div className="flex items-center text-xs text-indigo-600 opacity-70">
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16l4-4m0 0l4-4m-4 4v12"
                            />
                          </svg>
                          Drag
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {agent.description}
                      </p>
                      {agent.category && (
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            {agent.category}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

            {!loading && filteredAgents.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No agents found</p>
                <p className="text-xs mt-1">
                  Try adjusting your search or filter
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Panel>
  );
}
