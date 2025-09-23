// API Types

import { WorkflowConfig, WorkflowMetadata, WorkflowStep } from './workflow';

export interface SaveWorkflowRequest {
  metadata: WorkflowMetadata;
  steps: WorkflowStep[];
  outputPath?: string;
}

export interface SaveWorkflowResponse {
  success: boolean;
  filePath: string;
  errors?: string[];
}

export interface ValidateRequest {
  metadata: WorkflowMetadata;
  steps: WorkflowStep[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidateResponse {
  valid: boolean;
  errors: ValidationError[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}