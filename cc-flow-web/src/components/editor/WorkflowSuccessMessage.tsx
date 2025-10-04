"use client";

import React from "react";

interface WorkflowSuccessMessageProps {
  commandName?: string;
  commandPath?: string;
  isVisible: boolean;
  isAnimating: boolean;
}

/**
 * Workflow success message component
 * Displays a success message with command information when workflow is generated
 * Includes auto-hide animation controlled by parent
 */
export default function WorkflowSuccessMessage({
  commandName,
  commandPath,
  isVisible,
  isAnimating,
}: WorkflowSuccessMessageProps) {
  if (!isVisible) return null;

  return (
    <div
      className={`overflow-hidden rounded-md border border-emerald-200 bg-emerald-50 text-sm text-emerald-800 shadow-sm transition-all duration-500 ${
        isAnimating
          ? 'opacity-100 max-h-96 mb-3 py-3 px-4'
          : 'opacity-0 max-h-0 mb-0 py-0 px-4'
      }`}
    >
      <p className="font-medium flex items-center gap-2">
        <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Workflow command generated successfully!
      </p>
      <p className="mt-2">
        <span className="font-medium">Command:</span> /{commandName}
      </p>
      <p className="mt-1 text-emerald-700/80">
        <span className="font-medium">Path:</span> {commandPath}
      </p>
      <p className="mt-2 text-emerald-700/80">
        You can now use: <code className="bg-emerald-100 px-1 py-0.5 rounded">/{commandName} &quot;your task&quot;</code>
      </p>
    </div>
  );
}
