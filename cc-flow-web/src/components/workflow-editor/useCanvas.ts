import { useCallback, useEffect, useRef } from 'react';
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
  const { screenToFlowPosition, updateEdge: updateEdgeInstance } = useReactFlow();
  const isReconnectingRef = useRef(false);

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

  const handleReconnectStart = useCallback(() => {
    isReconnectingRef.current = true;
  }, []);

  const applyEdgeUpdate = useCallback((edgeToUpdate: WorkflowEdge, connection: Connection) => {
    if (!connection.source || !connection.target) {
      return;
    }

    const normalizedSourceHandle = connection.sourceHandle ?? null;
    const normalizedTargetHandle = connection.targetHandle ?? null;

    const updatedEdge: WorkflowEdge = {
      ...edgeToUpdate,
      source: connection.source,
      target: connection.target,
      sourceHandle: normalizedSourceHandle,
      targetHandle: normalizedTargetHandle,
      type: edgeToUpdate.type ?? 'custom',
      reconnectable: edgeToUpdate.reconnectable ?? true,
    };

    updateEdgeInstance?.(edgeToUpdate.id, () => updatedEdge, { replace: true });

    const withoutUpdated = edges.filter(edge => edge.id !== edgeToUpdate.id);
    const cleanedEdges = withoutUpdated.filter(edge => {
      const sameSourceHandle =
        edge.source === connection.source && (edge.sourceHandle ?? null) === normalizedSourceHandle;
      const sameTargetHandle =
        edge.target === connection.target && (edge.targetHandle ?? null) === normalizedTargetHandle;
      return !(sameSourceHandle || sameTargetHandle);
    });

    onEdgesChange([...cleanedEdges, updatedEdge]);
    onConnect(connection);
  }, [edges, onConnect, onEdgesChange, updateEdgeInstance]);

  const handleReconnect = useCallback((oldEdge: Edge, connection: Connection) => {
    const existingEdge = edges.find(edge => edge.id === oldEdge.id);
    if (!existingEdge) {
      return;
    }

    applyEdgeUpdate(existingEdge, connection);
  }, [edges, applyEdgeUpdate]);

  const handleReconnectEnd = useCallback(() => {
    isReconnectingRef.current = false;
  }, []);

  // 接続時のハンドラ
  const handleConnect = useCallback((params: Connection) => {
    if (isReconnectingRef.current) {
      onConnect(params);
      return;
    }

    if (!params.source || !params.target) {
      return;
    }

    const normalizedSourceHandle = params.sourceHandle ?? null;
    const normalizedTargetHandle = params.targetHandle ?? null;

    const sourceConflict = edges.find(edge =>
      edge.source === params.source && (edge.sourceHandle ?? null) === normalizedSourceHandle
    );

    if (sourceConflict) {
      applyEdgeUpdate(sourceConflict, params);
      return;
    }

    const targetConflict = edges.find(edge =>
      edge.target === params.target && (edge.targetHandle ?? null) === normalizedTargetHandle
    );

    if (targetConflict) {
      applyEdgeUpdate(targetConflict, params);
      return;
    }

    const newEdge: WorkflowEdge = {
      id: `edge-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      source: params.source,
      target: params.target,
      sourceHandle: normalizedSourceHandle,
      targetHandle: normalizedTargetHandle,
      type: 'custom',
      reconnectable: true,
    };

    onEdgesChange([...edges, newEdge]);
    onConnect(params);
  }, [edges, applyEdgeUpdate, onEdgesChange, onConnect]);


  return {
    screenToFlowPosition,
    handleNodesChange,
    handleEdgesChange,
    handleReconnectStart,
    handleReconnect,
    handleReconnectEnd,
    handleConnect,
  };
}
