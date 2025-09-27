import React from 'react';

interface AgentListProps {
  agents: string[];
  onRemoveAgent: (agentName: string) => void;
}

export default function AgentList({ agents, onRemoveAgent }: AgentListProps) {
  if (agents.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-purple-400 text-sm">
        Drop agents here
      </div>
    );
  }

  return (
    <div className="flex-1 p-2 space-y-1 overflow-y-auto">
      {agents.map((agentName) => (
        <div
          key={agentName}
          className="bg-white/80 border border-purple-200 rounded px-2 py-1 text-xs flex items-center justify-between group/agent"
        >
          <span className="font-medium text-purple-700">{agentName}</span>
          <button
            onClick={() => onRemoveAgent(agentName)}
            className="w-4 h-4 text-gray-400 hover:text-red-500 opacity-0 group-hover/agent:opacity-100 transition-opacity"
            title="Remove agent"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}