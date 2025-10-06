import { useState, useCallback, useRef } from 'react';
import { WorkflowMetadata, WorkflowNode, WorkflowEdge } from '@/types/workflow';
import { createWorkflowJSON } from '@/utils/workflowUtils';

export type GenerateStep =
  | 'validating'
  | 'generating-json'
  | 'executing-script'
  | 'reading-output'
  | 'complete';

interface GenerateResult {
  commandName: string;
  commandPath: string;
  commandContent: string;
}

interface GenerateError {
  message: string;
  step: GenerateStep;
  details?: string[];
}

interface UseWorkflowGenerateReturn {
  generating: boolean;
  currentStep: GenerateStep | null;
  error: GenerateError | null;
  result: GenerateResult | null;
  generateWorkflow: (
    metadata: WorkflowMetadata,
    nodes: WorkflowNode[],
    edges: WorkflowEdge[]
  ) => Promise<boolean>;
}

export function useWorkflowGenerate(): UseWorkflowGenerateReturn {
  const [generating, setGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState<GenerateStep | null>(null);
  const [error, setError] = useState<GenerateError | null>(null);
  const [result, setResult] = useState<GenerateResult | null>(null);

  // Use ref to track the current step for error handling
  const currentStepRef = useRef<GenerateStep | null>(null);

  const generateWorkflow = useCallback(async (
    metadata: WorkflowMetadata,
    nodes: WorkflowNode[],
    edges: WorkflowEdge[]
  ): Promise<boolean> => {
    try {
      setGenerating(true);
      setError(null);
      setResult(null);
      setCurrentStep('validating');
      currentStepRef.current = 'validating';

      // Step 1: Validate workflow structure
      const validationErrors: string[] = [];

      if (!metadata.workflowName?.trim()) {
        validationErrors.push('Workflow name is required');
      }

      const hasStartNode = nodes.some(node => node.type === 'start');
      if (!hasStartNode) {
        validationErrors.push('Start node is required');
      }

      const hasEndNode = nodes.some(node => node.type === 'end');
      if (!hasEndNode) {
        validationErrors.push('End node is required');
      }

      if (validationErrors.length > 0) {
        throw {
          message: 'Workflow validation failed',
          step: 'validating' as GenerateStep,
          details: validationErrors,
        };
      }

      await new Promise(resolve => setTimeout(resolve, 300)); // Brief pause for UI feedback

      setCurrentStep('generating-json');
      currentStepRef.current = 'generating-json';
      // Step 2: Generate create-workflow.sh compatible JSON
      let workflowJSON: string;
      try {
        workflowJSON = createWorkflowJSON(metadata, nodes, edges);
      } catch (err) {
        let errorMessage = err instanceof Error ? err.message : 'Failed to generate workflow JSON';
        // Remove "Error [WorkflowValidationError]: " prefix if present
        errorMessage = errorMessage.replace(/^Error \[WorkflowValidationError\]:\s*/, '');

        throw {
          message: errorMessage,
          step: 'generating-json' as GenerateStep,
          details: [errorMessage],
        };
      }

      setCurrentStep('executing-script');
      currentStepRef.current = 'executing-script';
      // Step 3: Call API to generate workflow
      const response = await fetch('/api/workflows/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          json: workflowJSON,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw {
          message: data.message || 'Failed to execute create-workflow.sh',
          step: 'executing-script',
          details: data.errors || ['Script execution failed'],
        };
      }

      setCurrentStep('reading-output');
      currentStepRef.current = 'reading-output';
      await new Promise(resolve => setTimeout(resolve, 200)); // Brief pause for UI feedback

      setCurrentStep('complete');
      currentStepRef.current = 'complete';
      console.log('Workflow generated successfully:', data.commandName);
      setResult({
        commandName: data.commandName,
        commandPath: data.commandPath,
        commandContent: data.commandContent,
      });
      return true;
    } catch (err) {
      try {
        const generateError = err as GenerateError;

        // Better error logging with safe access
        console.error('Error generating workflow:');
        console.error('  Type:', typeof err);
        console.error('  Is Error?:', err instanceof Error);
        console.error('  Has step?:', 'step' in (err as object));
        console.error('  Has message?:', 'message' in (err as object));

        try {
          console.error('  Message:', generateError.message);
        } catch (e) {
          console.error('  Message: [error accessing message]');
        }

        try {
          console.error('  Step:', generateError.step);
        } catch (e) {
          console.error('  Step: [error accessing step]');
        }

        try {
          console.error('  Details:', generateError.details);
        } catch (e) {
          console.error('  Details: [error accessing details]');
        }

        try {
          console.error('  Raw error:', JSON.stringify(err));
        } catch (e) {
          console.error('  Raw error: [cannot stringify]', err);
        }

        if (generateError.step && generateError.message) {
          // Structured error from our own throws
          console.log('Setting structured error');
          setError(generateError);
        } else if (err instanceof Error) {
          // Standard Error object
          console.log('Setting Error object error');
          setError({
            message: err.message,
            step: currentStepRef.current || 'validating',
            details: [err.message],
          });
        } else {
          // Unknown error type
          console.log('Setting unknown error');
          setError({
            message: 'An unexpected error occurred',
            step: currentStepRef.current || 'validating',
            details: ['Please try again or contact support'],
          });
        }
      } catch (loggingError) {
        console.error('Error in error handler:', loggingError);
        setError({
          message: 'An unexpected error occurred',
          step: currentStepRef.current || 'validating',
          details: ['Error details unavailable'],
        });
      }
      setResult(null);
      return false;
    } finally {
      setGenerating(false);
      // Don't reset currentStep - keep it for display
      // It will be reset on the next generateWorkflow call
    }
  }, []);

  return {
    generating,
    currentStep,
    error,
    result,
    generateWorkflow,
  };
}
