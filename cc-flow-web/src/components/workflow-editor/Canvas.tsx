'use client';

import React, { useCallback } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Connection,
  useReactFlow,
  NodeChange,
  EdgeChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { WorkflowNode, WorkflowEdge } from '@/types/workflow';
import AgentNode from './AgentNode';
import StepGroupNode from './StepGroupNode';
import StartNode from './StartNode';
import EndNode from './EndNode';
import CustomEdge from './CustomEdge';

type PaletteNodeType = 'agent' | 'start' | 'end' | 'step-group';

interface PaletteNodePayload {
  type: PaletteNodeType;
  name: string;
  description?: string;
  path?: string;
}

// カスタムノードタイプを定義
const nodeTypes = {
  agent: AgentNode,
  'step-group': StepGroupNode,
  start: StartNode,
  end: EndNode,
};

// カスタムエッジタイプを定義
const edgeTypes = {
  default: CustomEdge,
};

interface CanvasProps {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  onNodesChange: (nodes: WorkflowNode[]) => void;
  onEdgesChange: (edges: WorkflowEdge[]) => void;
  onConnect: (connection: Connection) => void;
}

function CanvasInner({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
}: CanvasProps) {
  const { screenToFlowPosition } = useReactFlow();

  // Direct change handlers without intermediate state
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    let updated = false;
    const newNodes = nodes.map(node => {
      const nodeChange = changes.find(change => change.id === node.id);
      if (nodeChange) {
        updated = true;
        if (nodeChange.type === 'position' && nodeChange.position) {
          return { ...node, position: nodeChange.position };
        }
        if (nodeChange.type === 'select') {
          return { ...node, selected: nodeChange.selected };
        }
      }
      return node;
    });

    // Handle node removal
    const removeChanges = changes.filter(change => change.type === 'remove');
    let filteredNodes = newNodes;
    if (removeChanges.length > 0) {
      const removeIds = new Set(removeChanges.map(change => change.id));
      filteredNodes = newNodes.filter(node => !removeIds.has(node.id));
      updated = true;
    }

    if (updated) {
      onNodesChange(filteredNodes);
    }
  }, [nodes, onNodesChange]);

  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    let updated = false;
    let newEdges = edges.slice();

    changes.forEach(change => {
      if (change.type === 'remove') {
        const index = newEdges.findIndex(edge => edge.id === change.id);
        if (index !== -1) {
          newEdges.splice(index, 1);
          updated = true;
        }
      }
      if (change.type === 'select') {
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
      const newEdge: WorkflowEdge = {
        id: `edge-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        source: params.source,
        target: params.target,
        sourceHandle: params.sourceHandle,
        targetHandle: params.targetHandle,
      };
      onEdgesChange([...edges, newEdge]);
      onConnect(params);
    }
  }, [edges, onEdgesChange, onConnect]);

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
        console.warn('No palette data found for drop event');
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
          },
        };
      }

      if (nodeType === 'start') {
        const hasStart = nodes.some((node) => node.type === 'start');
        if (hasStart) {
          console.warn('Start node already exists. Skipping additional start node.');
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
        };
      }

      if (nodeType === 'end') {
        const hasEnd = nodes.some((node) => node.type === 'end');
        if (hasEnd) {
          console.warn('End node already exists. Skipping additional end node.');
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
        };
      }



      if (!newNode) {
        console.warn('Unsupported node type dropped:', nodeType);
        return;
      }

      // Add new node directly to parent state
      onNodesChange([...nodes, newNode]);

    } catch (error) {
      console.error('Failed to parse dropped agent data:', error);
    }
  }, [screenToFlowPosition, onNodesChange, nodes]);

  return (
    <div 
      className="h-full w-full" 
      onDrop={onDrop} 
      onDragOver={onDragOver}
    >
      <ReactFlow
        nodes={nodes as Node[]}
        edges={edges as Edge[]}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        deleteKeyCode={['Backspace', 'Delete']}
        fitView
        className="bg-gray-50"
      >
        <Background
          color="#e5e7eb"
          gap={20}
          size={1}
        />
        <Controls className="bg-white shadow-md border border-gray-200 rounded-lg" />
        <MiniMap
          className="bg-white border border-gray-200 rounded-lg"
          nodeColor="#6366f1"
          maskColor="rgba(0,0,0,0.1)"
        />
      </ReactFlow>
    </div>
  );
}

// ReactFlowProviderでラップしたメインコンポーネント
export default function Canvas(props: CanvasProps) {
  return (
    <ReactFlowProvider>
      <CanvasInner {...props} />
    </ReactFlowProvider>
  );
}
