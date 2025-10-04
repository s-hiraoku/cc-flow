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
import {
  AlertTriangle,
  Filter,
  PanelLeftOpen,
  PanelLeftClose,
  Search,
  Sparkles,
  Users,
  Workflow,
} from "lucide-react";

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

const formatCategoryLabel = (category: string) => {
  if (!category) {
    return "Uncategorized";
  }

  if (category === "all") {
    return "All";
  }

  return category
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
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
              className="p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-3 text-base font-semibold text-gray-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Sparkles className="h-4 w-4" aria-hidden />
              </span>
              <span className="leading-tight">Agent Palette</span>
            </span>
            <Button
              variant="ghost"
              size="sm"
              aria-label="Collapse agent palette"
              onClick={() => setCollapsed(true)}
              className="p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          </div>
        )
      }
      subtitle={collapsed ? undefined : "Drag nodes and agents onto the canvas"}
      className={`relative transition-all duration-200 ${
        collapsed ? "w-full shadow-lg lg:w-14" : "w-full shadow-xl lg:w-72"
      } lg:flex-shrink-0`}
    >
      {!collapsed && (
        <div className="flex h-full flex-col overflow-hidden">
          <div className="space-y-6 px-5 pb-4 pt-6">
            {/* Error State */}
            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
                    <AlertTriangle className="h-4 w-4" aria-hidden />
                  </div>
                  <div>
                    <p className="font-semibold text-rose-800">Failed to load agents</p>
                    <p className="text-rose-600">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Workflow primitives */}
            <section>
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                  <Workflow className="h-4 w-4" aria-hidden />
                </span>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
                    Workflow Nodes
                  </h3>
                  <p className="text-xs text-gray-500">
                    Drop-in building blocks like start, end, and parallel groups.
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                {PRIMITIVE_NODES.map((primitive) => (
                  <div
                    key={primitive.type}
                    className={`cursor-grab select-none rounded-2xl border ${
                      PRIMITIVE_THEME[primitive.type]?.card ?? "border-gray-200 bg-white"
                    } px-4 py-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:border-indigo-400 hover:shadow-lg active:cursor-grabbing active:scale-[0.98]`}
                    draggable
                    onDragStart={(event) => handlePrimitiveDragStart(event, primitive)}
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
                        <h4 className="text-base font-medium text-gray-900">{primitive.name} node</h4>
                        <p className="mt-1 text-sm leading-relaxed text-gray-700">{primitive.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <Users className="h-4 w-4" aria-hidden />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-900">
                      Agent Nodes
                    </h3>
                    <p className="text-xs text-gray-500">Browse reusable automations and drag them into your workflow.</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-600 shadow-sm ring-1 ring-gray-200">
                  <Filter className="h-3.5 w-3.5" aria-hidden />
                  {loading ? "Loading..." : `${filteredAgents.length} available`}
                </span>
              </div>

              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden />
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
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 pl-9 text-sm text-gray-900 placeholder-gray-500 shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
                  aria-describedby="agent-filter-status"
                />
              </div>

              <div className="flex flex-wrap gap-2" role="group" aria-label="Filter agents by category">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 ${
                      selectedCategory === category
                        ? "border-indigo-400 bg-indigo-100 text-indigo-900"
                        : "border-gray-300 bg-white text-gray-700 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-900"
                    }`}
                    aria-pressed={selectedCategory === category}
                  >
                    {formatCategoryLabel(category)}
                  </button>
                ))}
              </div>

              <p id="agent-filter-status" className="text-xs text-gray-500" aria-live="polite">
                {loading
                  ? "Loading agents..."
                  : `${filteredAgents.length} agent${filteredAgents.length === 1 ? "" : "s"} available`}
              </p>
            </section>
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-6">
            {loading ? (
              <div className="flex h-full items-center justify-center text-gray-600">
                <LoadingSpinner size="md" className="mr-3" />
                <span className="text-sm">Loading agents...</span>
              </div>
            ) : filteredAgents.length > 0 ? (
              <div className="space-y-4 pb-2">
                {filteredAgents.map((agent) => (
                  <div
                    key={agent.name}
                    className={`group cursor-grab select-none rounded-2xl border px-4 py-4 shadow-sm transition-all duration-200 hover:scale-[1.01] hover:border-indigo-300 hover:shadow-lg active:cursor-grabbing active:scale-[0.98] ${getCategoryBorderAndBg(
                      agent.category || "default"
                    )}`}
                    draggable
                    onDragStart={(event) => handleAgentDragStart(event, agent)}
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
                      <div className="pointer-events-none flex-1 min-w-0">
                        <h3 className="text-base font-medium text-gray-900 truncate">{agent.name}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-gray-700 line-clamp-3 overflow-hidden">{agent.description}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-gray-900 ${getCategoryIconColor(
                              agent.category || "default"
                            )}`}
                          >
                            {formatCategoryLabel(agent.category || "")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-center text-gray-600">
                <div>
                  <p className="text-sm font-medium text-gray-800">No agents found</p>
                  <p className="mt-1 text-xs">Adjust your search or select a different category.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Panel>
  );
}
