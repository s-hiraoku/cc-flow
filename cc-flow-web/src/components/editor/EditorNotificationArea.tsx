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
  // Don't render if there's nothing to show
  if (!generating && !showSuccessMessage && !error) {
    return null;
  }

  const showProgress = (generating && currentStep) || (error && currentStep);

  return (
    <div className="px-6 pt-4 bg-white border-b border-gray-200">
      {/* Progress indicator */}
      {showProgress && (
        <WorkflowProgressIndicator currentStep={currentStep} error={error} />
      )}

      {/* Success message */}
      <WorkflowSuccessMessage
        commandName={result?.commandName}
        commandPath={result?.commandPath}
        isVisible={showSuccessMessage}
        isAnimating={isSuccessVisible}
      />
    </div>
  );
}
