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
    <div className="mb-3 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 shadow-sm">
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
                  ? 'font-medium'
                  : ''
              }
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {error && <ErrorDetails error={error} />}
    </div>
  );
}
