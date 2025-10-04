import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { WorkflowNode, WorkflowEdge, WorkflowMetadata } from '@/types/workflow';
import { WorkflowService } from '@/services/WorkflowService';

interface SaveWorkflowRequest {
  metadata: WorkflowMetadata;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

// Workflows are saved relative to CLAUDE_ROOT_PATH
// This is set by the CLI when starting the server
const getWorkflowsPath = (): string => {
  const claudeRoot = process.env.CLAUDE_ROOT_PATH;
  const workflowsPath = process.env.WORKFLOWS_PATH;

  if (claudeRoot) {
    return workflowsPath || join(claudeRoot, 'workflows');
  }

  // Fallback for development mode
  return workflowsPath || join(process.cwd(), 'workflows');
};

export async function POST(request: NextRequest) {
  try {
    const body: SaveWorkflowRequest = await request.json();
    const { metadata, nodes, edges } = body;

    const validationError = WorkflowService.validateWorkflowData(metadata, nodes);
    if (validationError) {
      return NextResponse.json(
        { error: validationError },
        { status: 400 }
      );
    }

    const serializedWorkflow = WorkflowService.buildWorkflowPayload(metadata, nodes, edges);

    // Ensure workflows directory exists
    const workflowsPath = getWorkflowsPath();
    await mkdir(workflowsPath, { recursive: true });

    // Save workflow JSON file
    const filename = `${metadata.workflowName.replace(/[^a-zA-Z0-9]/g, '-')}.json`;
    const filePath = join(workflowsPath, filename);

    await writeFile(filePath, JSON.stringify(serializedWorkflow, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      message: 'Workflow saved successfully',
      filename,
      path: filePath,
      workflow: serializedWorkflow
    });

  } catch (error) {
    console.error('Failed to save workflow:', error);
    return NextResponse.json(
      { error: 'Failed to save workflow' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Future implementation: Return list of saved workflows
  return NextResponse.json({
    message: 'Workflow listing not yet implemented'
  });
}
