/**
 * Workflow generation step types
 */
export type WorkflowStep =
  | 'validating'
  | 'generating-json'
  | 'executing-script'
  | 'reading-output'
  | 'complete';

/**
 * Error information for workflow generation
 */
export interface GenerateError {
  step: WorkflowStep;
  message: string;
  details?: string[];
}

/**
 * Result of successful workflow generation
 */
export interface GenerateResult {
  commandName: string;
  commandPath: string;
}

/**
 * Step configuration for progress indicator
 */
export interface StepConfig {
  name: WorkflowStep;
  label: string;
}
