"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { ArrowLeft, GitBranch, Keyboard, PlayCircle } from "lucide-react";

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
  const nodeLabel = `${nodeCount} node${nodeCount !== 1 ? "s" : ""}`;
  const connectionLabel = `${edgeCount} connection${edgeCount !== 1 ? "s" : ""}`;

  return (
    <header className="supports-[backdrop-filter]:bg-white/95 relative z-30 flex items-center justify-between gap-6 border-b border-gray-200 bg-white px-8 py-4 text-gray-900 shadow-md backdrop-blur">
      <div className="flex flex-1 items-center gap-4">
        <Link
          href="/"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-700 transition hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          <span className="sr-only">Back to CC-Flow overview</span>
        </Link>
        <h1 className="text-base font-semibold text-gray-900">Workflow Editor</h1>
      </div>

      <div
        className="hidden items-center gap-3 lg:flex"
        role="status"
        aria-live="polite"
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-gradient-to-b from-white to-gray-50 px-3 py-1.5 text-sm font-medium text-gray-900 shadow-sm">
          <Keyboard className="h-3.5 w-3.5 text-indigo-500" aria-hidden />
          <span className="sr-only">Current node count:</span>
          <span aria-hidden>{nodeLabel}</span>
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-gradient-to-b from-white to-gray-50 px-3 py-1.5 text-sm font-medium text-gray-900 shadow-sm">
          <GitBranch className="h-3.5 w-3.5 text-sky-500" aria-hidden />
          <span className="sr-only">Current connection count:</span>
          <span aria-hidden>{connectionLabel}</span>
        </span>
      </div>

      <div className="flex flex-shrink-0 items-center gap-2">
        <Button
          variant="secondary"
          onClick={onPreviewJSON}
          className="focus:ring-offset-white"
        >
          Preview JSON
        </Button>
        <Button
          variant="primary"
          onClick={onGenerateWorkflow}
          disabled={!canSave || generating}
          className="inline-flex items-center gap-2 focus:ring-offset-white"
        >
          <PlayCircle className="h-4 w-4" aria-hidden />
          {generating ? "Generating" : "Generate workflow"}
        </Button>
      </div>
    </header>
  );
}
