"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { ArrowLeft, PlayCircle, Upload, Download } from "lucide-react";

interface EditorToolbarProps {
  canSave: boolean;
  generating: boolean;
  onGenerateWorkflow: () => void;
  onRestoreWorkflow?: () => void;
  onSaveWorkflow?: () => void;
}

/**
 * Editor toolbar component
 * Displays navigation, workflow statistics, and action buttons
 */
export default function EditorToolbar({
  canSave,
  generating,
  onGenerateWorkflow,
  onRestoreWorkflow,
  onSaveWorkflow,
}: EditorToolbarProps) {
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

      <div className="flex flex-shrink-0 items-center gap-2">
        {onRestoreWorkflow && (
          <Button
            variant="secondary"
            onClick={onRestoreWorkflow}
            className="inline-flex items-center gap-2 focus:ring-offset-white"
          >
            <Upload className="h-4 w-4" aria-hidden />
            Restore
          </Button>
        )}
        {onSaveWorkflow && (
          <Button
            variant="secondary"
            onClick={onSaveWorkflow}
            disabled={!canSave}
            className="inline-flex items-center gap-2 focus:ring-offset-white"
          >
            <Download className="h-4 w-4" aria-hidden />
            Save
          </Button>
        )}
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
