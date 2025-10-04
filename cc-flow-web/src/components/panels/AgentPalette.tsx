"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Panel, Button } from "@/components/ui";
import { LoadingSpinner } from "@/components/common";
import { Agent } from "@/types/agent";
import { AgentService } from "@/services";
import {
  getCategoryBorderAndBg,
  getCategoryIcon,
  getCategoryIconColor,
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
    description: "Container for parallel execution of grouped agents.",
  },
];

const PRIMITIVE_THEME: Record<PrimitiveNodeType, { card: string; icon: string }> = {
  start: {
    card: "border-emerald-400/40 bg-emerald-50",
    icon: "bg-emerald-500/30 text-emerald-800",
  },
  end: {
    card: "border-amber-400/40 bg-amber-50",
    icon: "bg-amber-500/30 text-amber-800",
  },
  group: {
    card: "border-indigo-400/40 bg-indigo-50",
    icon: "bg-indigo-500/30 text-indigo-800",
  },
  "step-group": {
    card: "border-purple-400/40 bg-purple-50",
    icon: "bg-purple-500/30 text-purple-800",
  },
};

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
    payload: {
      type: string;
      name: string;
      description?: string;
      path?: string;
      category?: string;
    }
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
      variant="default"
      title={
        collapsed ? (
          <div className="flex items-center justify-center">
            <Button
              variant="ghost"
              size="sm"
              aria-label="Expand agent palette"
              onClick={() => setCollapsed(false)}
              className="p-1 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
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
              className="p-1 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          </div>
        )
      }
      subtitle={collapsed ? undefined : "Drag items onto the canvas"}
      className={`relative transition-all duration-200 backdrop-blur ${
        collapsed ? "w-full shadow-lg lg:w-14" : "w-full lg:w-72"
      } lg:flex-shrink-0`}
    >
      {!collapsed && (
        <div className="px-5 py-6 space-y-6">
          {/* Error State */}
          {error && (
            <div className="rounded-xl border border-rose-400/40 bg-rose-500/10 p-3 text-sm text-rose-100">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-500/30 text-rose-200">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-rose-100">Failed to load agents</p>
                  <p className="text-rose-200/80">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Workflow primitives */}
          <div>
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-800">
              Workflow Nodes
            </h3>
            <div className="space-y-3">
              {PRIMITIVE_NODES.map((primitive) => (
                <div
                  key={primitive.type}
                  className={`cursor-grab select-none rounded-2xl border ${
                    PRIMITIVE_THEME[primitive.type]?.card ?? "border-gray-300 bg-white"
                  } px-4 py-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:border-indigo-400 hover:shadow-xl active:cursor-grabbing active:scale-[0.98]`}
                  draggable
                  onDragStart={(event) =>
                    handlePrimitiveDragStart(event, primitive)
                  }
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${
                        PRIMITIVE_THEME[primitive.type]?.icon ?? "bg-gray-100 text-gray-700"
                      }`}
                      aria-hidden
                    >
                      {primitive.type === "start" ? (
                        <svg
                          className="h-5 w-5"
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
                      ) : primitive.type === "end" ? (
                        <svg
                          className="h-5 w-5"
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
                      ) : primitive.type === "step-group" ? (
                        <svg
                          className="h-5 w-5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="h-5 w-5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-gray-600">
                        {primitive.type === "step-group" ? "Parallel" : primitive.type === "end" ? "Output" : "Entry"}
                      </p>
                      <h4 className="text-base font-medium text-gray-900">
                        {primitive.name} node
                      </h4>
                      <p className="mt-1 text-sm leading-relaxed text-gray-700">
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
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800">
              Agent Nodes
            </h3>
            <div>
              <label htmlFor="agent-search" className="sr-only">
                Search agents
              </label>
              <input
                id="agent-search"
                type="text"
                placeholder="Search agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loading}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
                aria-describedby="agent-filter-status"
              />
            </div>

            {/* カテゴリフィルタ */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 ${
                    selectedCategory === category
                      ? "border-indigo-400 bg-indigo-100 text-indigo-900"
                      : "border-gray-300 bg-white text-gray-700 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-900"
                  }`}
                  aria-pressed={selectedCategory === category}
                >
                  {category}
                </button>
              ))}
            </div>

            <p
              id="agent-filter-status"
              className="text-xs text-gray-600"
              aria-live="polite"
            >
              {loading
                ? "Loading agents..."
                : `${filteredAgents.length} agent${
                    filteredAgents.length === 1 ? "" : "s"
                  } available`}
            </p>

            {/* Agents List */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {loading && (
                <div className="flex items-center justify-center py-8 text-gray-700">
                  <LoadingSpinner size="md" className="mr-3" />
                  <span className="text-sm">Loading agents...</span>
                </div>
              )}

              {!loading &&
                filteredAgents.map((agent) => (
                  <div
                    key={agent.name}
                    className={`group cursor-grab select-none rounded-2xl border px-4 py-4 shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:cursor-grabbing active:scale-[0.98] ${getCategoryBorderAndBg(
                      agent.category || "default"
                    )}`}
                    draggable
                    onDragStart={(e) => handleAgentDragStart(e, agent)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="pointer-events-none">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-lg ${getCategoryIconColor(
                            agent.category || "default"
                          )}`}
                          aria-hidden
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth={2.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d={getCategoryIcon(agent.category || "default")}
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="pointer-events-none flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-medium text-gray-900">
                            {agent.name}
                          </h3>
                        </div>
                        <p className="mt-1 text-sm leading-relaxed text-gray-700 line-clamp-3">
                          {agent.description}
                        </p>
                        {agent.category && (
                          <div className="mt-2">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-gray-900 ${getCategoryIconColor(
                                agent.category
                              )}`}
                            >
                              {agent.category}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

              {!loading && filteredAgents.length === 0 && (
                <div className="py-8 text-center text-gray-600">
                  <p className="text-sm font-medium text-gray-800">
                    No agents found
                  </p>
                  <p className="mt-1 text-xs">
                    Adjust your search or select a different category.
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
