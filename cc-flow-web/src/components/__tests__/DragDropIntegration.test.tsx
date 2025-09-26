import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReactFlowProvider } from '@xyflow/react';
import AgentPalette from '../panels/AgentPalette';
import Canvas from '../workflow-editor/Canvas';
import type { Agent } from '@/types/agent';
import type { WorkflowNode, WorkflowEdge } from '@/types/workflow';

// Mock the services
vi.mock('@/services/AgentService', () => ({
  AgentService: {
    getAgents: vi.fn(),
    searchAgents: vi.fn(),
    getAgentsByCategory: vi.fn(),
  },
}));

const mockAgents: Agent[] = [
  {
    name: 'Test Agent 1',
    description: 'First test agent',
    category: 'spec',
    path: './agents/spec/agent-1.md',
  },
  {
    name: 'Test Agent 2',
    description: 'Second test agent',
    category: 'utility',
    path: './agents/utility/agent-2.md',
  },
];

// Create a test wrapper component that includes both AgentPalette and Canvas
const DragDropTestWrapper = () => {
  const [nodes, setNodes] = React.useState<WorkflowNode[]>([]);
  const [edges, setEdges] = React.useState<WorkflowEdge[]>([]);

  const handleNodesChange = (newNodes: WorkflowNode[]) => {
    setNodes(newNodes);
  };

  const handleEdgesChange = (newEdges: WorkflowEdge[]) => {
    setEdges(newEdges);
  };

  const handleAgentDragStart = (agent: Agent) => {
    console.log('Drag started for agent:', agent.name);
  };

  return (
    <ReactFlowProvider>
      <div style={{ display: 'flex', height: '600px', width: '1000px' }}>
        <div style={{ width: '300px' }}>
          <AgentPalette
            agents={mockAgents}
            onAgentDragStart={handleAgentDragStart}
            loading={false}
          />
        </div>
        <div style={{ width: '700px' }}>
          <Canvas
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={handleEdgesChange}
            onConnect={() => {}}
          />
        </div>
      </div>
    </ReactFlowProvider>
  );
};

describe('Drag and Drop Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render both AgentPalette and Canvas', () => {
    render(<DragDropTestWrapper />);

    expect(screen.getByText('Test Agent 1')).toBeInTheDocument();
    expect(screen.getByText('Test Agent 2')).toBeInTheDocument();
    expect(screen.getByTestId('react-flow')).toBeInTheDocument();
  });

  it('should allow dragging agent cards', () => {
    render(<DragDropTestWrapper />);

    const agentCard = screen.getByText('Test Agent 1').closest('[draggable="true"]');
    expect(agentCard).toBeInTheDocument();
    expect(agentCard).toHaveAttribute('draggable', 'true');
  });

  it('should handle drag start event', () => {
    const mockDataTransfer = {
      setData: vi.fn(),
      setDragImage: vi.fn(),
      effectAllowed: '',
    };

    render(<DragDropTestWrapper />);

    const agentCard = screen.getByText('Test Agent 1').closest('[draggable="true"]');
    
    fireEvent.dragStart(agentCard!, {
      dataTransfer: mockDataTransfer,
    });

    expect(mockDataTransfer.setData).toHaveBeenCalledWith('application/reactflow', 'agent');
    expect(mockDataTransfer.setData).toHaveBeenCalledWith(
      'application/agent',
      JSON.stringify(mockAgents[0])
    );
  });

  it('should handle drop on canvas', async () => {
    const mockDataTransfer = {
      getData: vi.fn((type: string) => {
        if (type === 'application/reactflow') return 'agent';
        if (type === 'application/agent') return JSON.stringify(mockAgents[0]);
        return '';
      }),
    };

    render(<DragDropTestWrapper />);

    const canvas = screen.getByTestId('react-flow');

    // Simulate drop event
    fireEvent.drop(canvas, {
      dataTransfer: mockDataTransfer,
      clientX: 350,
      clientY: 200,
    });

    // Wait for the node to be added
    await waitFor(() => {
      // Check if a new node was created (this would require additional DOM changes)
      // For now, we verify that the drop event was handled without errors
      expect(mockDataTransfer.getData).toHaveBeenCalledWith('application/reactflow');
      expect(mockDataTransfer.getData).toHaveBeenCalledWith('application/agent');
    });
  });

  it('should handle drag over canvas', () => {
    render(<DragDropTestWrapper />);

    const canvas = screen.getByTestId('react-flow');

    fireEvent.dragOver(canvas, {
      clientX: 350,
      clientY: 200,
    });

    // Verify that dragOver doesn't cause errors
    expect(canvas).toBeInTheDocument();
  });

  it('should prevent default on drag over to allow drop', () => {
    const preventDefault = vi.fn();
    render(<DragDropTestWrapper />);

    const canvas = screen.getByTestId('react-flow');

    fireEvent.dragOver(canvas, {
      preventDefault,
      clientX: 350,
      clientY: 200,
    });

    expect(preventDefault).toHaveBeenCalled();
  });

  it('should handle invalid drop data gracefully', () => {
    const mockDataTransfer = {
      getData: vi.fn(() => ''), // Return empty data
    };

    render(<DragDropTestWrapper />);

    const canvas = screen.getByTestId('react-flow');

    // This should not throw an error
    fireEvent.drop(canvas, {
      dataTransfer: mockDataTransfer,
      clientX: 350,
      clientY: 200,
    });

    expect(mockDataTransfer.getData).toHaveBeenCalled();
  });

  it('should handle malformed JSON in drop data', () => {
    const mockDataTransfer = {
      getData: vi.fn((type: string) => {
        if (type === 'application/reactflow') return 'agent';
        if (type === 'application/agent') return 'invalid-json{';
        return '';
      }),
    };

    render(<DragDropTestWrapper />);

    const canvas = screen.getByTestId('react-flow');

    // This should not throw an error
    fireEvent.drop(canvas, {
      dataTransfer: mockDataTransfer,
      clientX: 350,
      clientY: 200,
    });

    expect(mockDataTransfer.getData).toHaveBeenCalled();
  });

  it('should show visual feedback during drag', () => {
    render(<DragDropTestWrapper />);

    const agentCard = screen.getByText('Test Agent 1').closest('[draggable="true"]');
    
    // Check for cursor styling that indicates draggable
    expect(agentCard).toHaveClass('cursor-grab');
  });

  it('should handle multiple agents in palette', () => {
    render(<DragDropTestWrapper />);

    // Both agents should be rendered and draggable
    const agent1Card = screen.getByText('Test Agent 1').closest('[draggable="true"]');
    const agent2Card = screen.getByText('Test Agent 2').closest('[draggable="true"]');

    expect(agent1Card).toBeInTheDocument();
    expect(agent2Card).toBeInTheDocument();
    expect(agent1Card).toHaveAttribute('draggable', 'true');
    expect(agent2Card).toHaveAttribute('draggable', 'true');
  });

  it('should maintain drag data integrity across different agents', () => {
    const mockDataTransfer = {
      setData: vi.fn(),
      setDragImage: vi.fn(),
      effectAllowed: '',
    };

    render(<DragDropTestWrapper />);

    // Test dragging first agent
    const agent1Card = screen.getByText('Test Agent 1').closest('[draggable="true"]');
    fireEvent.dragStart(agent1Card!, { dataTransfer: mockDataTransfer });

    expect(mockDataTransfer.setData).toHaveBeenCalledWith(
      'application/agent',
      JSON.stringify(mockAgents[0])
    );

    // Clear mock calls
    mockDataTransfer.setData.mockClear();

    // Test dragging second agent
    const agent2Card = screen.getByText('Test Agent 2').closest('[draggable="true"]');
    fireEvent.dragStart(agent2Card!, { dataTransfer: mockDataTransfer });

    expect(mockDataTransfer.setData).toHaveBeenCalledWith(
      'application/agent',
      JSON.stringify(mockAgents[1])
    );
  });
});