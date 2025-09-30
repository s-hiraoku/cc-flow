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
            className={`border rounded-lg px-3 py-2 flex items-center justify-between group/agent hover:shadow-sm transition-all ${colors.solidBg} ${colors.solidBorder}`}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${colors.icon}`}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-900 truncate">{agentName}</span>
            </div>
            <button
              onClick={() => onRemoveAgent(agentName)}
              className="w-5 h-5 flex-shrink-0 text-gray-400 hover:text-red-500 opacity-0 group-hover/agent:opacity-100 transition-all"
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