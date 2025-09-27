"use client";

import React from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { WorkflowNode, WorkflowEdge } from "@/types/workflow";
import AgentNode from "./AgentNode";
import StepGroupNode from "./StepGroupNode/StepGroupNode";
import StartNode from "./StartNode";
import EndNode from "./EndNode";
import CustomEdge from "./CustomEdge";
import { useCanvas } from "./useCanvas";
import { useCanvasDragDrop } from "./useCanvasDragDrop";

// カスタムノードタイプを定義
const nodeTypes = {
  agent: AgentNode,
  "step-group": StepGroupNode,
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
  const canvasHandlers = useCanvas({
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
  });

  const dragDropHandlers = useCanvasDragDrop({
    nodes,
    onNodesChange,
    screenToFlowPosition: canvasHandlers.screenToFlowPosition,
  });

  return (
    <div
      className="h-full w-full"
      onDrop={dragDropHandlers.onDrop}
      onDragOver={dragDropHandlers.onDragOver}
    >
      <ReactFlow
        nodes={nodes as Node[]}
        edges={edges as Edge[]}
        onNodesChange={canvasHandlers.handleNodesChange}
        onEdgesChange={canvasHandlers.handleEdgesChange}
        onConnect={canvasHandlers.handleConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        deleteKeyCode={["Backspace", "Delete"]}
        fitView
        className="bg-gray-50"
        nodesDraggable={true}
        nodesConnectable={true}
        elementsSelectable={true}
        edgesReconnectable={true}
        defaultEdgeOptions={{
          type: "custom",
          animated: false,
        }}
        onInit={(reactFlowInstance) => {
          // Force fit view to ensure nodes are visible
          setTimeout(() => {
            reactFlowInstance.fitView({ padding: 0.2 });
          }, 100);
        }}
      >
        <Background color="#e5e7eb" gap={20} size={1} />
        <Controls />
        <MiniMap />
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
