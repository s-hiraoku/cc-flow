import { StepConfig, WorkflowStep } from './types';

/**
 * Workflow generation steps configuration
 */
export const WORKFLOW_STEPS: StepConfig[] = [
  { name: 'validating', label: 'Validating workflow' },
  { name: 'generating-json', label: 'Generating JSON' },
  { name: 'executing-script', label: 'Executing create-workflow.sh' },
  { name: 'reading-output', label: 'Reading generated files' },
  { name: 'complete', label: 'Complete' },
];

/**
 * Step execution order
 */
export const STEP_ORDER: WorkflowStep[] = [
  'validating',
  'generating-json',
  'executing-script',
  'reading-output',
  'complete',
];
