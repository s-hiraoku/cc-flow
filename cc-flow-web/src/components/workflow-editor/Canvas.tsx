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
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  useReactFlow,
  NodeChange,
  EdgeChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { WorkflowNode, WorkflowEdge } from '@/types/workflow';
import AgentNode from './AgentNode';
import StepGroupNode from './StepGroupNode';

// カスタムノードタイプを定義
const nodeTypes = {
  agent: AgentNode,
  'step-group': StepGroupNode,
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
  const [reactFlowNodes, setNodes, onReactFlowNodesChange] = useNodesState(nodes as Node[]);
  const [reactFlowEdges, setEdges, onReactFlowEdgesChange] = useEdgesState(edges as Edge[]);
  const { screenToFlowPosition } = useReactFlow();

  // Sync props to ReactFlow state
  React.useEffect(() => {
    setNodes(nodes as Node[]);
  }, [nodes, setNodes]);

  React.useEffect(() => {
    setEdges(edges as Edge[]);
  }, [edges, setEdges]);

  // Optimized change handlers
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    onReactFlowNodesChange(changes);
    // Use requestAnimationFrame for better performance
    requestAnimationFrame(() => {
      onNodesChange(reactFlowNodes as WorkflowNode[]);
    });
  }, [onReactFlowNodesChange, onNodesChange, reactFlowNodes]);

  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    onReactFlowEdgesChange(changes);
    // Use requestAnimationFrame for better performance
    requestAnimationFrame(() => {
      onEdgesChange(reactFlowEdges as WorkflowEdge[]);
    });
  }, [onReactFlowEdgesChange, onEdgesChange, reactFlowEdges]);

  // 接続時のハンドラ
  const handleConnect = useCallback((params: Connection) => {
    const newEdges = addEdge(params, reactFlowEdges);
    setEdges(newEdges);
    onConnect(params);
  }, [reactFlowEdges, setEdges, onConnect]);

  // ドラッグオーバー処理
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // ドロップ処理
  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const nodeType = event.dataTransfer.getData('application/reactflow');
    const agentDataStr = event.dataTransfer.getData('application/agent');

    if (!nodeType || !agentDataStr) {
      return;
    }

    try {
      const agentData = JSON.parse(agentDataStr);
      
      // ReactFlow公式パターン: screenToFlowPositionを使用
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: WorkflowNode = {
        id: `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'agent',
        position,
        data: {
          label: agentData.name,
          agentName: agentData.name,
          agentPath: agentData.path,
          description: agentData.description,
        },
      };

      // Add new node
      setNodes((nds) => {
        const updatedNodes = nds.concat(newNode as Node);
        // Notify parent asynchronously
        requestAnimationFrame(() => {
          onNodesChange(updatedNodes as WorkflowNode[]);
        });
        return updatedNodes;
      });

    } catch (error) {
      console.error('Failed to parse dropped agent data:', error);
    }
  }, [screenToFlowPosition, setNodes, onNodesChange]);

  return (
    <div 
      className="h-full w-full" 
      onDrop={onDrop} 
      onDragOver={onDragOver}
    >
      <ReactFlow
        nodes={reactFlowNodes}
        edges={reactFlowEdges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        nodeTypes={nodeTypes}
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