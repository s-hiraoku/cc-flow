import React from 'react';
import { getCategoryColors, getCategoryIcon } from '@/utils/categoryStyles';

type AgentItem = string | { name: string; category?: string };

interface AgentListProps {
  agents: AgentItem[];
  onRemoveAgent: (agentName: string) => void;
}

export default function AgentList({ agents, onRemoveAgent }: AgentListProps) {
  if (agents.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 max-h-80 overflow-y-auto">
      {agents.map((agent, index) => {
        const agentName = typeof agent === 'string' ? agent : agent.name;
        const category = typeof agent === 'string' ? 'default' : (agent.category || 'default');
        const colors = getCategoryColors(category);
        const icon = getCategoryIcon(category);

        return (
          <div
            key={`${agentName}-${index}`}
            className={`flex min-w-0 items-center justify-between rounded-lg border px-3 py-2 transition-all hover:shadow-sm group/agent bg-white ${colors.solidBorder}`}
          >
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md ${colors.icon}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                </svg>
              </div>
              <span className="truncate text-sm font-medium text-gray-900">{agentName}</span>
            </div>
            <button
              onClick={() => onRemoveAgent(agentName)}
              className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-gray-400 opacity-0 transition-all hover:text-red-600 group-hover/agent:opacity-100"
              title="Remove agent"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
