"use client";

import React, { useMemo } from "react";
import StepIcon from "./StepIcon";
import ErrorDetails from "./ErrorDetails";
import { WorkflowStep, GenerateError } from "./types";
import { WORKFLOW_STEPS, STEP_ORDER } from "./constants";

interface WorkflowProgressIndicatorProps {
  currentStep?: WorkflowStep;
  error?: GenerateError | null;
}

/**
 * Workflow progress indicator component
 * Displays the current progress of workflow generation with step-by-step status
 */
export default function WorkflowProgressIndicator({
  currentStep,
  error,
}: WorkflowProgressIndicatorProps) {
  // Calculate completed steps based on current step
  const completedSteps = useMemo(() => {
    if (!currentStep) return [];
    const currentStepIndex = STEP_ORDER.indexOf(currentStep);
    return currentStepIndex >= 0 ? STEP_ORDER.slice(0, currentStepIndex) : [];
  }, [currentStep]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="mb-3 rounded-2xl border border-sky-400/40 bg-slate-900/60 px-4 py-3 text-sm text-slate-200 shadow-lg backdrop-blur"
    >
      <div className="space-y-2">
        {WORKFLOW_STEPS.map((step) => (
          <div key={step.name} className="flex items-center">
            <StepIcon
              currentStep={currentStep}
              error={error}
              stepName={step.name}
              completedSteps={completedSteps}
            />
            <span
              className={
                currentStep === step.name || error?.step === step.name
                  ? "font-semibold text-white"
                  : "text-slate-300"
              }
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {error && (
        <div className="mt-3 rounded-xl border border-rose-400/40 bg-rose-500/10 p-3">
          <ErrorDetails error={error} />
        </div>
      )}
    </div>
  );
}
