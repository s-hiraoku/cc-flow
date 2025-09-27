import React from 'react';

interface StepGroupHeaderProps {
  title: string;
  purpose?: string;
  mode: 'sequential' | 'parallel';
  onDelete: (e: React.MouseEvent) => void;
  isHovered: boolean;
}

export default function StepGroupHeader({
  title,
  purpose,
  mode,
  onDelete,
  isHovered,
}: StepGroupHeaderProps) {
  return (
    <div className="absolute top-0 left-0 right-0 bg-purple-600 text-white p-2 rounded-t-lg">
      {/* Delete button */}
      <button
        onClick={onDelete}
        className="absolute top-1 right-1 w-5 h-5 bg-gray-500 hover:bg-gray-600 text-white rounded-full flex items-center justify-center shadow-sm transition-all cursor-pointer z-10"
        style={{
          opacity: isHovered ? 1 : 0,
        }}
        title="Delete node"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>

      <div className="flex items-center justify-between pr-6">
        <div>
          <h3 className="font-semibold text-sm">{title}</h3>
          {purpose && (
            <p className="text-xs text-purple-200 mt-0.5">{purpose}</p>
          )}
        </div>
        <div className="text-xs bg-purple-500 px-2 py-1 rounded">
          {mode}
        </div>
      </div>
    </div>
  );
}