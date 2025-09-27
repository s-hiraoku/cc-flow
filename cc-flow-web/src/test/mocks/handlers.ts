import { http, HttpResponse } from 'msw';
import { Agent } from '@/types/agent';
import { WorkflowSaveResponse, WorkflowSaveRequest } from '@/services/WorkflowService';

// Mock data
const mockAgents: Agent[] = [
  {
    name: 'Test Agent 1',
    path: '/agents/test-agent-1.md',
    description: 'A test agent for testing purposes',
    category: 'test',
  },
  {
    name: 'Test Agent 2',
    path: '/agents/test-agent-2.md',
    description: 'Another test agent',
    category: 'test',
  },
  {
    name: 'Spec Agent',
    path: '/agents/spec/spec-agent.md',
    description: 'Specification agent',
    category: 'spec',
  },
];

export const handlers = [
  // Agents API
  http.get('/api/agents', () => {
    return HttpResponse.json({
      success: true,
      agents: mockAgents,
    });
  }),

  http.get('/api/agents', ({ request }) => {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    
    if (category) {
      const filteredAgents = mockAgents.filter(agent => agent.category === category);
      return HttpResponse.json({
        success: true,
        agents: filteredAgents,
      });
    }
    
    return HttpResponse.json({
      success: true,
      agents: mockAgents,
    });
  }),

  // Workflows API
  http.post('/api/workflows', async ({ request }) => {
    const body = (await request.json()) as WorkflowSaveRequest;
    
    // Simulate validation
    if (!body.metadata?.workflowName) {
      return HttpResponse.json(
        { success: false, error: 'Workflow name is required' },
        { status: 400 }
      );
    }

    if (!body.nodes || body.nodes.length === 0) {
      return HttpResponse.json(
        { success: false, error: 'At least one node is required' },
        { status: 400 }
      );
    }

    const response: WorkflowSaveResponse = {
      success: true,
      message: 'Workflow saved successfully',
      workflowId: 'mock-workflow-id',
    };

    return HttpResponse.json(response);
  }),

  // Error handlers for testing error scenarios
  http.get('/api/agents/error', () => {
    return HttpResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }),

  http.post('/api/workflows/error', () => {
    return HttpResponse.json(
      { success: false, error: 'Failed to save workflow' },
      { status: 500 }
    );
  }),
];
