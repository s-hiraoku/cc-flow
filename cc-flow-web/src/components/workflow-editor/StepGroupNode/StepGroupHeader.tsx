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
}: Omit<StepGroupHeaderProps, 'isHovered'>) {
  return (
    <div className="absolute top-0 left-0 right-0 bg-white border-b border-purple-200 px-3 py-2.5 rounded-t-lg">
      {/* Delete button */}
      <button
        onClick={onDelete}
        className="absolute top-2 right-2 w-5 h-5 bg-gray-500 hover:bg-gray-600 text-white rounded-full flex items-center justify-center shadow-sm transition-all opacity-0 group-hover:opacity-100 cursor-pointer z-10"
        title="Delete node"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>

      <div className="flex items-center gap-2 pr-8">
        <div className="w-8 h-8 flex items-center justify-center bg-purple-100 rounded-lg">
          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-gray-900 truncate">{title}</h3>
          {purpose && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{purpose}</p>
          )}
        </div>
      </div>
    </div>
  );
}