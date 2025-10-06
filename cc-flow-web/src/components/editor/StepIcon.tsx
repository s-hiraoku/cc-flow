import React from "react";
import { WorkflowStep, GenerateError } from "./types";

interface StepIconProps {
  currentStep?: WorkflowStep;
  error?: GenerateError | null;
  stepName: WorkflowStep;
  completedSteps: WorkflowStep[];
}

/**
 * Step icon component that displays different states:
 * - Error (red X)
 * - Active (spinning loader)
 * - Completed (green checkmark)
 * - Pending (gray circle)
 */
export default function StepIcon({
  currentStep,
  error,
  stepName,
  completedSteps,
}: StepIconProps) {
  // Error state
  if (error?.step === stepName) {
    return (
      <svg
        className="mr-2 h-4 w-4 text-rose-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    );
  }

  // Active/Loading state
  if (currentStep === stepName) {
    return (
      <svg
        className="mr-2 h-4 w-4 animate-spin text-sky-300"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );
  }

  // Completed state
  if (completedSteps.includes(stepName)) {
    return (
      <svg
        className="mr-2 h-4 w-4 text-emerald-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      </svg>
    );
  }

  // Pending state
  return (
    <svg
      className="mr-2 h-4 w-4 text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="10" strokeWidth={2} />
    </svg>
  );
}
