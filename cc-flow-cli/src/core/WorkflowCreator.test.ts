import { describe, it, expect, beforeEach } from 'vitest';
import { WorkflowCreator } from './WorkflowCreator.js';

/**
 * Kent Beck's TDD Approach: Red-Green-Refactor
 * 
 * Test List (Kent Beck's pattern):
 * 1. ✗ WorkflowCreator should exist 
 * 2. ✗ Should create workflow with selected agents
 * 3. ✗ Should validate agent directory exists
 * 4. ✗ Should handle user cancellation gracefully
 * 5. ✗ Should provide accessibility support
 */

describe('WorkflowCreator', () => {
  let workflowCreator: WorkflowCreator;

  beforeEach(() => {
    // Kent Beck: "Isolated Test" pattern - fresh instance for each test
    workflowCreator = new WorkflowCreator();
  });

  it('should exist and be instantiable', () => {
    // Kent Beck: "Assert First" - write the assertion first
    expect(workflowCreator).toBeDefined();
    expect(workflowCreator).toBeInstanceOf(WorkflowCreator);
  });

  it('should have a createWorkflow method', () => {
    // Kent Beck: "Evident Data" - test data should express intent
    expect(typeof workflowCreator.createWorkflow).toBe('function');
  });

  it('should return a workflow configuration when creating workflow', async () => {
    // This test will fail first (Red phase)
    const mockOptions = {
      agentDirectory: './agents/spec',
      selectedAgents: ['spec-init', 'spec-requirements']
    };
    
    // Kent Beck: "Fake it till you make it" - expect the simplest possible return
    const result = await workflowCreator.createWorkflow(mockOptions);
    
    expect(result).toBeDefined();
    expect(result).toHaveProperty('agents');
    expect(result).toHaveProperty('workflowName');
  });

  it('should validate agent directory exists', async () => {
    // Kent Beck: Test for failure cases early
    const invalidOptions = {
      agentDirectory: './non-existent-directory',
      selectedAgents: ['spec-init']
    };

    // Should throw validation error
    await expect(workflowCreator.createWorkflow(invalidOptions)).rejects.toThrow('Agent directory not found');
  });

  it('should handle empty agent selection', async () => {
    // Kent Beck: "Triangulation" - test different scenarios
    const emptyOptions = {
      agentDirectory: './agents/spec',
      selectedAgents: []
    };

    await expect(workflowCreator.createWorkflow(emptyOptions)).rejects.toThrow('No agents selected');
  });
});