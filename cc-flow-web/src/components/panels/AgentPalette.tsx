"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Panel, Button } from "@/components/ui";
import { LoadingSpinner } from "@/components/common";
import { Agent } from "@/types/agent";
import { AgentService } from "@/services";
import {
  getCategoryBorderAndBg,
  getCategoryIcon,
  getCategoryIconColor
} from "@/utils/agentPaletteUtils";
import { PanelLeftOpen, PanelLeftClose } from "lucide-react";

type PrimitiveNodeType = "start" | "end" | "group" | "step-group";

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
    type: "step-group",
    name: "Parallel Group",
    description: "Container for parallel execution of nested workflow nodes.",
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
  const [collapsed, setCollapsed] = useState(false);

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
    payload: { type: string; name: string; description?: string; path?: string; category?: string }
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
          category: payload.category,
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
          category: agent.category,
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





  return (
    <Panel
      title={collapsed ? (
        <div className="flex items-center justify-center">
          <Button
            variant="ghost"
            size="sm"
            aria-label="Expand agent palette"
            onClick={() => setCollapsed(false)}
            className="p-1"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <span>Agent Palette</span>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Collapse agent palette"
            onClick={() => setCollapsed(true)}
            className="p-1"
          >
            <PanelLeftClose className="h-4 w-4" />
          </Button>
        </div>
      )}
      subtitle={collapsed ? undefined : "Drag agents to the canvas"}
      className={`relative transition-all duration-200 ${collapsed ? 'w-12 shadow-lg' : 'w-80'}`}
    >
      {!collapsed && (
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
                  className={`p-3 rounded-lg cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition ${
                    primitive.type === "step-group"
                      ? "border-2 border-dashed border-purple-300 bg-gradient-to-r from-white to-purple-50"
                      : primitive.type === "end"
                      ? "border border-orange-200 bg-gradient-to-r from-white to-orange-50"
                      : "border border-emerald-200 bg-gradient-to-r from-white to-emerald-50"
                  }`}
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
                          : primitive.type === "step-group"
                          ? "bg-purple-100 text-purple-700"
                          : primitive.type === "end"
                          ? "bg-orange-100 text-orange-700"
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
                      ) : primitive.type === "step-group" ? (
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
                            d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"
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
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Agent Nodes
            </h3>
            <div>
              <input
                type="text"
                placeholder="Search agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed placeholder-gray-500"
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
                    className={`p-4 cursor-grab active:cursor-grabbing hover:shadow-lg transition-all duration-200 border-2 border-solid rounded-lg shadow-sm select-none ${
                      getCategoryBorderAndBg(agent.category || "default")
                    }`}
                    draggable={true}
                    onDragStart={(e) => handleAgentDragStart(e, agent)}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 pointer-events-none">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${getCategoryIconColor(
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
                        </div>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {agent.description}
                        </p>
                        {agent.category && (
                          <div className="mt-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryIconColor(agent.category)}`}>
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
      )}
    </Panel>
  );
}