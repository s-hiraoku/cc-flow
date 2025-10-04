import React from 'react';
import { getCategoryColors } from '@/utils/categoryStyles';

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

        return (
          <div
            key={`${agentName}-${index}`}
            className={`flex min-w-0 items-center justify-between rounded-lg border px-3 py-2 transition-all hover:shadow-sm group/agent ${colors.solidBg} ${colors.solidBorder}`}
          >
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <div className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md ${colors.icon}`}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="truncate text-sm font-medium text-white">{agentName}</span>
            </div>
            <button
              onClick={() => onRemoveAgent(agentName)}
              className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-slate-400 opacity-0 transition-all hover:text-red-400 group-hover/agent:opacity-100"
              title="Remove agent"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
