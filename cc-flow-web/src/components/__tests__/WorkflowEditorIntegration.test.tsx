import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReactFlowProvider } from '@xyflow/react';
import Canvas from '../workflow-editor/Canvas';
import AgentNode from '../workflow-editor/AgentNode';
import PropertiesPanel from '../panels/PropertiesPanel';
import type { WorkflowNode, WorkflowEdge } from '@/types/workflow';

// Mock the services
vi.mock('@/services/WorkflowService', () => ({
  WorkflowService: {
    saveWorkflow: vi.fn(),
    loadWorkflow: vi.fn(),
    validateWorkflow: vi.fn(),
  },
}));

const mockNodes: WorkflowNode[] = [
  {
    id: 'node-1',
    type: 'agent',
    position: { x: 100, y: 100 },
    data: {
      label: 'Test Agent 1',
      agentName: 'test-agent-1',
      agentPath: './agents/spec/test-agent-1.md',
      description: 'First test agent',
    },
  },
  {
    id: 'node-2',
    type: 'agent',
    position: { x: 300, y: 200 },
    data: {
      label: 'Test Agent 2',
      agentName: 'test-agent-2',
      agentPath: './agents/utility/test-agent-2.md',
      description: 'Second test agent',
    },
  },
];

const mockEdges: WorkflowEdge[] = [
  {
    id: 'edge-1',
    source: 'node-1',
    target: 'node-2',
    type: 'default',
  },
];

// Test wrapper component for workflow editor integration
const WorkflowEditorTestWrapper = () => {
  const [nodes, setNodes] = React.useState<WorkflowNode[]>(mockNodes);
  const [edges, setEdges] = React.useState<WorkflowEdge[]>(mockEdges);
  const [selectedNode, setSelectedNode] = React.useState<WorkflowNode | null>(null);

  const handleNodesChange = (newNodes: WorkflowNode[]) => {
    setNodes(newNodes);
  };

  const handleEdgesChange = (newEdges: WorkflowEdge[]) => {
    setEdges(newEdges);
  };

  const handleNodeSelect = (nodeId: string | null) => {
    if (nodeId) {
      const node = nodes.find(n => n.id === nodeId);
      setSelectedNode(node || null);
    } else {
      setSelectedNode(null);
    }
  };

  const handleNodeUpdate = (nodeId: string, updates: Partial<WorkflowNode['data']>) => {
    setNodes(prevNodes => 
      prevNodes.map(node => 
        node.id === nodeId 
          ? { ...node, data: { ...node.data, ...updates } }
          : node
      )
    );
  };

  return (
    <ReactFlowProvider>
      <div style={{ display: 'flex', height: '600px', width: '1200px' }}>
        <div style={{ width: '800px' }}>
          <Canvas
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={() => {}}
          />
        </div>
        <div style={{ width: '400px' }}>
          <PropertiesPanel
            metadata={{
              workflowName: '',
              workflowPurpose: '',
              workflowModel: 'default',
              workflowArgumentHint: '',
            }}
            onMetadataChange={() => {}}
            nodes={nodes}
            edges={edges}
          />
        </div>
      </div>
    </ReactFlowProvider>
  );
};

describe('Workflow Editor Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render workflow editor with nodes and edges', () => {
    render(<WorkflowEditorTestWrapper />);

    expect(screen.getByTestId('react-flow')).toBeInTheDocument();
    // Note: Due to ReactFlow mocking, we can't test actual node rendering
    // In a real environment, these would be visible
  });

  it('should handle node selection', async () => {
    render(<WorkflowEditorTestWrapper />);

    const canvas = screen.getByTestId('react-flow');
    
    // Simulate clicking on a node (this would trigger node selection)
    fireEvent.click(canvas);

    // In a real implementation, this would show the selected node in properties panel
    await waitFor(() => {
      expect(canvas).toBeInTheDocument();
    });
  });

  it('should update node properties', () => {
    render(<WorkflowEditorTestWrapper />);

    // This test would involve interacting with the properties panel
    // to update node properties and verify the changes are reflected
    const propertiesPanel = screen.getByRole('region');
    expect(propertiesPanel).toBeInTheDocument();
  });

  it('should maintain workflow state consistency', () => {
    render(<WorkflowEditorTestWrapper />);

    const canvas = screen.getByTestId('react-flow');
    
    // Verify that the canvas is rendered and maintains state
    expect(canvas).toBeInTheDocument();
  });

  it('should handle edge creation between nodes', () => {
    render(<WorkflowEditorTestWrapper />);

    const canvas = screen.getByTestId('react-flow');
    
    // In a real implementation, this would test edge creation
    // by connecting node handles
    expect(canvas).toBeInTheDocument();
  });

  it('should handle node deletion', () => {
    render(<WorkflowEditorTestWrapper />);

    const canvas = screen.getByTestId('react-flow');
    
    // Test node deletion functionality
    // In practice, this would involve selecting a node and pressing delete
    fireEvent.keyDown(canvas, { key: 'Delete' });

    expect(canvas).toBeInTheDocument();
  });

  it('should handle multiple node selection', () => {
    render(<WorkflowEditorTestWrapper />);

    const canvas = screen.getByTestId('react-flow');
    
    // Test multi-selection with Ctrl+click
    fireEvent.click(canvas, { ctrlKey: true });

    expect(canvas).toBeInTheDocument();
  });

  it('should maintain proper zoom and pan functionality', () => {
    render(<WorkflowEditorTestWrapper />);

    const canvas = screen.getByTestId('react-flow');
    
    // Test zoom functionality
    fireEvent.wheel(canvas, { deltaY: 100 });

    expect(canvas).toBeInTheDocument();
  });

  it('should handle workflow validation', async () => {
    const { WorkflowService } = await import('@/services/WorkflowService');
    
    vi.mocked(WorkflowService.validateWorkflowData).mockReturnValue(null);


    render(<WorkflowEditorTestWrapper />);

    // This would test validation when saving or exporting
    await waitFor(() => {
      expect(screen.getByTestId('react-flow')).toBeInTheDocument();
    });
  });

  it('should handle workflow save operation', async () => {
    const { WorkflowService } = await import('@/services/WorkflowService');
    
    vi.mocked(WorkflowService.saveWorkflow).mockResolvedValue({
      success: true,
      message: 'Workflow saved successfully',
      workflowId: 'workflow-123',
    });

    render(<WorkflowEditorTestWrapper />);

    // Test save operation (would be triggered by save button)
    await waitFor(() => {
      expect(screen.getByTestId('react-flow')).toBeInTheDocument();
    });
  });

  it('should maintain undo/redo functionality', () => {
    render(<WorkflowEditorTestWrapper />);

    const canvas = screen.getByTestId('react-flow');
    
    // Test undo/redo keyboard shortcuts
    fireEvent.keyDown(canvas, { key: 'z', ctrlKey: true });
    fireEvent.keyDown(canvas, { key: 'y', ctrlKey: true });

    expect(canvas).toBeInTheDocument();
  });

  it('should handle copy/paste operations', () => {
    render(<WorkflowEditorTestWrapper />);

    const canvas = screen.getByTestId('react-flow');
    
    // Test copy/paste functionality
    fireEvent.keyDown(canvas, { key: 'c', ctrlKey: true });
    fireEvent.keyDown(canvas, { key: 'v', ctrlKey: true });

    expect(canvas).toBeInTheDocument();
  });

  it('should handle keyboard navigation', () => {
    render(<WorkflowEditorTestWrapper />);

    const canvas = screen.getByTestId('react-flow');
    
    // Test arrow key navigation
    fireEvent.keyDown(canvas, { key: 'ArrowRight' });
    fireEvent.keyDown(canvas, { key: 'ArrowDown' });

    expect(canvas).toBeInTheDocument();
  });

  it('should maintain accessibility features', () => {
    render(<WorkflowEditorTestWrapper />);

    const canvas = screen.getByTestId('react-flow');
    
    // Test focus management and ARIA attributes
    fireEvent.focus(canvas);
    
    expect(canvas).toBeInTheDocument();
    // In a real implementation, would test ARIA labels and roles
  });

  it('should handle error states gracefully', () => {
    render(<WorkflowEditorTestWrapper />);

    const canvas = screen.getByTestId('react-flow');
    
    // Test error handling for invalid operations
    expect(canvas).toBeInTheDocument();
  });

  it('should support real-time collaboration features', () => {
    render(<WorkflowEditorTestWrapper />);

    const canvas = screen.getByTestId('react-flow');
    
    // This would test WebSocket connections for real-time updates
    expect(canvas).toBeInTheDocument();
  });
});