"use client";

import React from "react";
import WorkflowProgressIndicator from "./WorkflowProgressIndicator";
import WorkflowSuccessMessage from "./WorkflowSuccessMessage";
import { WorkflowStep, GenerateError, GenerateResult } from "./types";

interface EditorNotificationAreaProps {
  generating: boolean;
  currentStep?: WorkflowStep;
  error?: GenerateError | null;
  result?: GenerateResult | null;
  showSuccessMessage: boolean;
  isSuccessVisible: boolean;
}

/**
 * Editor notification area component
 * Manages the display of progress indicators and success messages
 */
export default function EditorNotificationArea({
  generating,
  currentStep,
  error,
  result,
  showSuccessMessage,
  isSuccessVisible,
}: EditorNotificationAreaProps) {
  if (!generating && !showSuccessMessage && !error) {
    return null;
  }

  const showProgress = (generating && currentStep) || (error && currentStep);

  return (
    <section
      aria-live="polite"
      className="border-b border-white/10 bg-slate-950/70 px-6 pb-4 pt-4 text-sm text-slate-100 backdrop-blur"
    >
      {showProgress ? (
        <WorkflowProgressIndicator currentStep={currentStep} error={error} />
      ) : null}

      <WorkflowSuccessMessage
        commandName={result?.commandName}
        commandPath={result?.commandPath}
        isVisible={showSuccessMessage}
        isAnimating={isSuccessVisible}
      />
    </section>
  );
}
