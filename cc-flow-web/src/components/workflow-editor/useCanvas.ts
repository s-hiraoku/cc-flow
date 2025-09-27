import { useCallback, useEffect } from 'react';
import {
  useReactFlow,
  NodeChange,
  EdgeChange,
  Connection,
  Edge,
} from '@xyflow/react';
import { WorkflowNode, WorkflowEdge } from '@/types/workflow';

interface UseCanvasProps {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  onNodesChange: (nodes: WorkflowNode[]) => void;
  onEdgesChange: (edges: WorkflowEdge[]) => void;
  onConnect: (connection: Connection) => void;
}

export function useCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
}: UseCanvasProps) {
  const { screenToFlowPosition } = useReactFlow();

  // Create a function to update node data that can be accessed by child components
  const updateNodeData = useCallback((nodeId: string, newData: Record<string, unknown>) => {
    const updatedNodes = nodes.map(node =>
      node.id === nodeId
        ? { ...node, data: { ...node.data, ...newData } }
        : node
    );
    onNodesChange(updatedNodes);
  }, [nodes, onNodesChange]);

  // Expose the updateNodeData function globally for StepGroupNode to access
  useEffect(() => {
    (window as { __updateNodeData?: (id: string, data: Record<string, unknown>) => void }).__updateNodeData = updateNodeData;
  }, [updateNodeData]);

  // Direct change handlers without intermediate state
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    let updated = false;
    const newNodes = nodes.map(node => {
      const nodeChange = changes.find(change => 'id' in change && change.id === node.id);
      if (nodeChange) {
        updated = true;
        if (nodeChange.type === 'position' && 'position' in nodeChange && nodeChange.position) {
          return { ...node, position: nodeChange.position };
        }
        if (nodeChange.type === 'select' && 'selected' in nodeChange) {
          return { ...node, selected: nodeChange.selected };
        }
      }
      return node;
    });

    // Handle node removal
    const removeChanges = changes.filter(change => change.type === 'remove');
    let filteredNodes = newNodes;
    if (removeChanges.length > 0) {
      const removeIds = new Set(removeChanges.map(change => 'id' in change ? change.id : '').filter(id => id));
      filteredNodes = newNodes.filter(node => !removeIds.has(node.id));
      updated = true;
    }

    if (updated) {
      onNodesChange(filteredNodes);
    }
  }, [nodes, onNodesChange]);

  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    let updated = false;
    const newEdges = edges.slice();

    changes.forEach(change => {
      if (change.type === 'remove') {
        const index = newEdges.findIndex(edge => edge.id === change.id);
        if (index !== -1) {
          newEdges.splice(index, 1);
          updated = true;
        }
      }
      if (change.type === 'select' && 'selected' in change) {
        const index = newEdges.findIndex(edge => edge.id === change.id);
        if (index !== -1) {
          newEdges[index] = { ...newEdges[index], selected: change.selected };
          updated = true;
        }
      }
    });

    if (updated) {
      onEdgesChange(newEdges);
    }
  }, [edges, onEdgesChange]);

  // 接続時のハンドラ
  const handleConnect = useCallback((params: Connection) => {
    if (params.source && params.target) {
      // 競合するエッジをすべて識別
      const conflictingEdges = edges.filter(edge => {
        // 同じソースハンドルからの競合
        const sourceConflict = edge.source === params.source && edge.sourceHandle === params.sourceHandle;
        // 同じターゲットハンドルへの競合
        const targetConflict = edge.target === params.target && edge.targetHandle === params.targetHandle;
        return sourceConflict || targetConflict;
      });

      // 競合するエッジを除いたエッジリスト
      const cleanEdges = edges.filter(edge => !conflictingEdges.includes(edge));

      const newEdge: WorkflowEdge = {
        id: `edge-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        source: params.source,
        target: params.target,
        sourceHandle: params.sourceHandle,
        targetHandle: params.targetHandle,
        type: 'custom',
      };

      onEdgesChange([...cleanEdges, newEdge]);
      onConnect(params);
    }
  }, [edges, onEdgesChange, onConnect]);


  return {
    screenToFlowPosition,
    handleNodesChange,
    handleEdgesChange,
    handleConnect,
  };
}