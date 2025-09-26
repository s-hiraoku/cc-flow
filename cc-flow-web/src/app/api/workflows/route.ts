import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { WorkflowNode, WorkflowEdge, WorkflowMetadata, isAgentNodeData } from '@/types/workflow';

interface SaveWorkflowRequest {
  metadata: WorkflowMetadata;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

interface WorkflowStep {
  title: string;
  mode: 'sequential' | 'parallel';
  purpose: string;
  agents: string[];
}

interface POMLWorkflow {
  workflowName: string;
  workflowPurpose: string;
  workflowModel?: string;
  workflowArgumentHint?: string;
  workflowSteps: WorkflowStep[];
}

const WORKFLOWS_BASE_PATH = process.env.WORKFLOWS_PATH || '../workflows';

function convertToWorkflowSteps(nodes: WorkflowNode[], edges: WorkflowEdge[]): WorkflowStep[] {
  // Group nodes by their connection order
  const steps: WorkflowStep[] = [];

  // For now, create a single step with all agents
  // In a more complex implementation, we would analyze the edge connections
  // to determine the proper sequential/parallel execution order
  if (nodes.length > 0) {
    const agents = nodes
      .filter(node => node.type === 'agent')
      .map(node => {
        if (isAgentNodeData(node.data)) {
          return node.data.agentName || node.data.label;
        }
        return node.data.label;
      })
      .filter(Boolean);

    if (agents.length > 0) {
      steps.push({
        title: "Generated Step",
        mode: "sequential",
        purpose: "Execute selected agents in workflow",
        agents
      });
    }
  }

  return steps;
}

export async function POST(request: NextRequest) {
  try {
    const body: SaveWorkflowRequest = await request.json();
    const { metadata, nodes, edges } = body;

    // Validate required fields
    if (!metadata.workflowName) {
      return NextResponse.json(
        { error: 'Workflow name is required' },
        { status: 400 }
      );
    }

    // Convert nodes and edges to workflow steps
    const workflowSteps = convertToWorkflowSteps(nodes, edges);

    // Create POML workflow object
    const pomlWorkflow: POMLWorkflow = {
      workflowName: metadata.workflowName,
      workflowPurpose: metadata.workflowPurpose || '',
      workflowModel: metadata.workflowModel,
      workflowArgumentHint: metadata.workflowArgumentHint,
      workflowSteps
    };

    // Ensure workflows directory exists
    const workflowsPath = join(process.cwd(), WORKFLOWS_BASE_PATH);
    await mkdir(workflowsPath, { recursive: true });

    // Save workflow JSON file
    const filename = `${metadata.workflowName.replace(/[^a-zA-Z0-9]/g, '-')}.json`;
    const filePath = join(workflowsPath, filename);

    await writeFile(filePath, JSON.stringify(pomlWorkflow, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      message: 'Workflow saved successfully',
      filename,
      path: filePath,
      workflow: pomlWorkflow
    });

  } catch (error) {
    console.error('Failed to save workflow:', error);
    return NextResponse.json(
      { error: 'Failed to save workflow' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Future implementation: Return list of saved workflows
  return NextResponse.json({
    message: 'Workflow listing not yet implemented'
  });
}