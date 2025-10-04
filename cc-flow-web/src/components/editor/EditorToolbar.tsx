"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui";

interface EditorToolbarProps {
  nodeCount: number;
  edgeCount: number;
  canSave: boolean;
  generating: boolean;
  onPreviewJSON: () => void;
  onGenerateWorkflow: () => void;
}

/**
 * Editor toolbar component
 * Displays navigation, workflow statistics, and action buttons
 */
export default function EditorToolbar({
  nodeCount,
  edgeCount,
  canSave,
  generating,
  onPreviewJSON,
  onGenerateWorkflow,
}: EditorToolbarProps) {
  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center">
        <Link href="/" className="text-gray-500 hover:text-gray-700 mr-4">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>
        <h1 className="text-xl font-semibold text-gray-900">
          Workflow Editor
        </h1>
        <span className="ml-4 text-sm text-gray-500">
          {nodeCount} node{nodeCount !== 1 ? "s" : ""}, {edgeCount}{" "}
          connection{edgeCount !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="flex gap-3">
        <Button
          variant="secondary"
          onClick={onPreviewJSON}
        >
          Preview JSON
        </Button>
        <Button
          variant="primary"
          onClick={onGenerateWorkflow}
          disabled={!canSave || generating}
        >
          {generating ? "Generating..." : "Generate Workflow"}
        </Button>
      </div>
    </div>
  );
}
