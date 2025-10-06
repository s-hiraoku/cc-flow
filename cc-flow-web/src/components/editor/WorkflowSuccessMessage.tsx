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
      role="status"
      aria-live="polite"
      className={`overflow-hidden rounded-2xl border border-emerald-300 bg-emerald-50 text-sm text-emerald-800 shadow-lg backdrop-blur transition-all duration-500 ${
        isAnimating
          ? "mb-3 max-h-96 px-4 py-3 opacity-100"
          : "mb-0 max-h-0 px-4 py-0 opacity-0"
      }`}
    >
      <p className="flex items-center gap-2 font-semibold">
        <svg
          className="h-5 w-5 text-emerald-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Workflow command generated successfully!
      </p>
      <p className="mt-2 text-emerald-700">
        <span className="font-medium text-emerald-800">Command:</span> /{commandName}
      </p>
      <p className="mt-1 text-emerald-700">
        <span className="font-medium text-emerald-800">Path:</span> {commandPath}
      </p>
      <p className="mt-2 text-emerald-700">
        You can now use:
        <code className="ml-2 rounded bg-emerald-100 px-2 py-0.5 font-mono text-xs text-emerald-800">
          /{commandName} &quot;your task&quot;
        </code>
      </p>
    </div>
  );
}
