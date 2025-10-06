import * as v from 'valibot';
import { WORKFLOW_MODELS } from '@/constants/workflow';

/**
 * Workflow Metadata Validation Schema
 * Using Valibot for type-safe, modular validation with minimal bundle size
 */
export const WorkflowMetadataSchema = v.object({
  workflowName: v.pipe(
    v.string(),
    v.check((value) => value.trim().length > 0, 'Workflow name is required'),
    v.maxLength(50, 'Workflow name must be 50 characters or less'),
    v.regex(
      /^[a-zA-Z0-9-_\s]+$/,
      'Only letters, numbers, hyphens, underscores, and spaces are allowed'
    )
  ),
  workflowPurpose: v.optional(
    v.pipe(
      v.string(),
      v.maxLength(5000, 'Purpose must be 5000 characters or less')
    )
  ),
  workflowModel: v.optional(
    v.pipe(
      v.string(),
      v.picklist(
        WORKFLOW_MODELS.map((m) => m.value),
        'Please select a valid model'
      )
    )
  ),
  workflowArgumentHint: v.optional(
    v.pipe(
      v.string(),
      v.maxLength(500, 'Argument hint must be 500 characters or less')
    )
  ),
});

/**
 * Agent Node Step Settings Validation Schema
 */
export const AgentStepSettingsSchema = v.object({
  stepTitle: v.pipe(
    v.string(),
    v.nonEmpty('Step title is required'),
    v.trim(),
    v.minLength(1, 'Step title cannot be empty'),
    v.maxLength(100, 'Step title must be 100 characters or less')
  ),
  stepPurpose: v.optional(
    v.pipe(
      v.string(),
      v.maxLength(500, 'Step purpose must be 500 characters or less')
    )
  ),
});

/**
 * Step Group Node Settings Validation Schema
 */
export const StepGroupSettingsSchema = v.object({
  title: v.pipe(
    v.string(),
    v.nonEmpty('Group title is required'),
    v.trim(),
    v.minLength(1, 'Group title cannot be empty'),
    v.maxLength(100, 'Group title must be 100 characters or less')
  ),
  purpose: v.optional(
    v.pipe(
      v.string(),
      v.maxLength(500, 'Group purpose must be 500 characters or less')
    )
  ),
});

// Export inferred types for TypeScript
export type WorkflowMetadataInput = v.InferInput<typeof WorkflowMetadataSchema>;
export type WorkflowMetadataOutput = v.InferOutput<typeof WorkflowMetadataSchema>;
export type AgentStepSettingsInput = v.InferInput<typeof AgentStepSettingsSchema>;
export type StepGroupSettingsInput = v.InferInput<typeof StepGroupSettingsSchema>;
