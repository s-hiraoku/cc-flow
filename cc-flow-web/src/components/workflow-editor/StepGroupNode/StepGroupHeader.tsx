import React from 'react';

interface StepGroupHeaderProps {
  title: string;
  purpose?: string;
  mode: 'sequential' | 'parallel';
  onDelete: (e: React.MouseEvent) => void;
}

export default function StepGroupHeader({
  title,
  purpose,
  mode,
  onDelete,
}: Omit<StepGroupHeaderProps, "isHovered">) {
  return (
    <div className="absolute left-0 right-0 top-0 flex items-start gap-2 rounded-t-2xl border-b border-purple-300 bg-purple-100 px-3 py-2.5">
      {/* Delete button */}
      <button
        onClick={onDelete}
        className="absolute right-3 top-3 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 bg-gray-100 text-gray-600 opacity-0 shadow-sm transition-all hover:bg-gray-200 hover:text-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400 group-hover:opacity-100"
        title="Delete node"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>

      <div className="flex flex-1 items-center gap-3 pr-8">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/30 text-purple-800">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="truncate text-sm font-semibold text-gray-900">{title}</h3>
          {purpose && (
            <p className="mt-0.5 line-clamp-2 text-xs text-gray-600">{purpose}</p>
          )}
        </div>
      </div>
    </div>
  );
}
