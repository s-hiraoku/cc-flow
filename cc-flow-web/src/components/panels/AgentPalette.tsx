"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Panel } from "@/components/ui";
import { LoadingSpinner } from "@/components/common";
import { Agent } from "@/types/agent";
import { AgentService } from "@/services";
import { CATEGORY_ICONS, CATEGORY_COLORS, CategoryType } from "@/constants/workflow";

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
  const categories = useMemo(() =>
    AgentService.getUniqueCategories(agents),
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
  const handleDragStart = useCallback((event: React.DragEvent, agent: Agent) => {
    try {
      event.dataTransfer.setData("application/reactflow", "agent");
      event.dataTransfer.setData("application/agent", JSON.stringify(agent));
      event.dataTransfer.effectAllowed = "move";

      const dragElement = event.currentTarget as HTMLElement;
      event.dataTransfer.setDragImage(dragElement, 0, 0);

      onAgentDragStart?.(agent);
    } catch (error) {
      console.error('Error in handleDragStart:', error);
    }
  }, [onAgentDragStart]);

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

        {/* Search Field */}
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

          {!loading && filteredAgents.map((agent) => (
            <div
              key={agent.name}
              className="p-4 cursor-grab active:cursor-grabbing hover:shadow-lg hover:border-indigo-300 transition-all duration-200 border-2 border-dashed border-gray-300 hover:border-indigo-400 bg-gradient-to-r from-white to-gray-50 hover:from-indigo-50 hover:to-blue-50 rounded-lg shadow-sm bg-white select-none"
              draggable={true}
              onDragStart={(e) => handleDragStart(e, agent)}

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
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l4-4m0 0l4-4m-4 4v12" />
                      </svg>
                      Drag
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {agent.description}
                  </p>
                  <p className="text-xs text-indigo-600 mt-1 font-medium">
                    ← ドラッグしてキャンバスに追加
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
    </Panel>
  );
}
