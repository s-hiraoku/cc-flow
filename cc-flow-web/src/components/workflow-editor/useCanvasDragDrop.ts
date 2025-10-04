import { useCallback } from 'react';
import { WorkflowNode, AgentNodeData } from '@/types/workflow';

type PaletteNodeType = 'agent' | 'start' | 'end' | 'step-group';

interface PaletteNodePayload {
  type: PaletteNodeType;
  name: string;
  description?: string;
  path?: string;
  category?: string;
}

interface UseCanvasDragDropProps {
  nodes: WorkflowNode[];
  onNodesChange: (nodes: WorkflowNode[]) => void;
  screenToFlowPosition: (position: { x: number; y: number }) => { x: number; y: number };
}

export function useCanvasDragDrop({
  nodes,
  onNodesChange,
  screenToFlowPosition,
}: UseCanvasDragDropProps) {
  // ドラッグオーバー処理
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // ドロップ処理
  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const nodeType = event.dataTransfer.getData('application/reactflow') as PaletteNodeType | '';
    let paletteDataStr = event.dataTransfer.getData('application/palette-node');

    if (!nodeType) {
      return;
    }

    try {
      if (!paletteDataStr && nodeType === 'agent') {
        // Fallback for legacy drag payloads
        paletteDataStr = event.dataTransfer.getData('application/agent');
      }

      if (!paletteDataStr) {
        return;
      }

      const paletteData = JSON.parse(paletteDataStr) as PaletteNodePayload;

      // ReactFlow公式パターン: screenToFlowPositionを使用
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const createNodeId = (base: string) => `${base}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

      let newNode: WorkflowNode | null = null;

      if (nodeType === 'agent') {
        newNode = {
          id: createNodeId('agent'),
          type: 'agent',
          position,
          data: {
            label: paletteData.name,
            agentName: paletteData.name,
            agentPath: paletteData.path,
            description: paletteData.description,
            category: paletteData.category,
            stepTitle: paletteData.name, // Set default stepTitle to agent name
          },
          style: {
            width: 200,
            height: 100,
          },
          measured: {
            width: 200,
            height: 100,
          },
        };
      }

      if (nodeType === 'start') {
        const hasStart = nodes.some((node) => node.type === 'start');
        if (hasStart) {
          return;
        }
        newNode = {
          id: createNodeId('start'),
          type: 'start',
          position,
          data: {
            kind: 'start',
            label: paletteData.name,
            description: paletteData.description,
          },
          style: {
            width: 120,
            height: 80,
          },
          measured: {
            width: 120,
            height: 80,
          },
        };
      }

      if (nodeType === 'end') {
        const hasEnd = nodes.some((node) => node.type === 'end');
        if (hasEnd) {
          return;
        }
        newNode = {
          id: createNodeId('end'),
          type: 'end',
          position,
          data: {
            kind: 'end',
            label: paletteData.name,
            description: paletteData.description,
          },
          style: {
            width: 120,
            height: 80,
          },
          measured: {
            width: 120,
            height: 80,
          },
        };
      }

      if (nodeType === 'step-group') {
        newNode = {
          id: createNodeId('step-group'),
          type: 'step-group',
          position,
          data: {
            title: paletteData.name,
            purpose: paletteData.description,
            mode: 'parallel' as const,
            agents: [],
            label: paletteData.name,
            description: paletteData.description,
          },
          style: {
            width: 300,
            height: 200,
          },
          measured: {
            width: 300,
            height: 200,
          },
        };
      }

      if (!newNode) {
        return;
      }

      // Check if the new node is dropped inside a container
      const containerNode = nodeType === 'agent' ? nodes.find(node => {
        if (node.type === 'step-group') {
          // Calculate dynamic height based on agent count
          const agentCount = (node.data.agents as Array<string | { name: string; category?: string }>)?.length || 0;
          const headerHeight = 64;
          const dropZoneHeight = 150;
          const agentItemHeight = 44;
          const padding = 24;
          const reservedSlots = 3;
          
          // Always reserve space for at least 3 agents, expand if more
          const visibleAgentCount = Math.max(reservedSlots, agentCount);
          const agentListHeight = visibleAgentCount * agentItemHeight + 8;
          const dynamicHeight = headerHeight + agentListHeight + dropZoneHeight + padding;

          const containerBounds = {
            x: node.position.x,
            y: node.position.y,
            width: 360,
            height: dynamicHeight,
          };

          const isInside = (
            position.x >= containerBounds.x &&
            position.x <= containerBounds.x + containerBounds.width &&
            position.y >= containerBounds.y &&
            position.y <= containerBounds.y + containerBounds.height
          );

          return isInside;
        }
        return false;
      }) : null;

      // If dropped inside a container, only update the container's agents list
      if (containerNode && nodeType === 'agent') {
        // Only update the container's agents list, don't create a new node
        const updatedNodes = nodes.map(node => {
          if (node.id === containerNode.id && node.type === 'step-group') {
            const currentAgents = (node.data.agents as Array<string | { name: string; category?: string }>) || [];
            const newAgentData = newNode.data as AgentNodeData;
            const newAgentName = newAgentData.agentName || newAgentData.label;
            const newAgentCategory = newAgentData.category;

            // Check if agent already exists in the container
            const agentExists = currentAgents.some(agent => 
              typeof agent === 'string' ? agent === newAgentName : agent.name === newAgentName
            );
            if (agentExists) {
              return node; // Return unchanged node
            }

            // Check max limit (10 agents)
            if (currentAgents.length >= 10) {
              console.warn('StepGroupNode can hold maximum 10 agents');
              return node;
            }

            // Add agent with category information
            const newAgent = newAgentCategory 
              ? { name: newAgentName, category: newAgentCategory }
              : newAgentName;
            const updatedAgents = [...currentAgents, newAgent];
            
            return {
              ...node,
              data: {
                ...node.data,
                agents: updatedAgents
              }
            };
          }
          return node;
        });

        onNodesChange(updatedNodes);
      } else {
        // Add new node directly to parent state
        onNodesChange([...nodes, newNode]);
      }

    } catch {
      // Silent error handling
    }
  }, [screenToFlowPosition, onNodesChange, nodes]);

  return {
    onDragOver,
    onDrop,
  };
}