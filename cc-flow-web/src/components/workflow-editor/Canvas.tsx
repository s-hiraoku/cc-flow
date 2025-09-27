"use client";

import React from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  MiniMap,
  Panel,
  useReactFlow,
  useStore,
  useStoreApi,
  Node,
  Edge,
  Connection,
} from "@xyflow/react";
import { ZoomIn, ZoomOut, Maximize2, Lock, Unlock } from "lucide-react";
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
  custom: CustomEdge,
  default: CustomEdge,
};

interface CanvasProps {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  onNodesChange: (nodes: WorkflowNode[]) => void;
  onEdgesChange: (edges: WorkflowEdge[]) => void;
  onConnect: (connection: Connection) => void;
}

function CanvasControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const store = useStoreApi();
  const isInteractive = useStore(
    (state) => state.nodesDraggable || state.nodesConnectable || state.elementsSelectable,
  );

  const baseButtonClasses =
    "flex h-8 w-8 items-center justify-center rounded-md transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500";

  const buttonStyles = "bg-white/0 text-gray-700 hover:bg-gray-100 hover:text-indigo-600";

  const handleToggleInteractive = () => {
    const next = !isInteractive;
    store.setState({
      nodesDraggable: next,
      nodesConnectable: next,
      elementsSelectable: next,
    });
  };

  return (
    <Panel
      position="bottom-left"
      className="flex gap-2 rounded-lg border border-gray-200 bg-white/95 p-1.5 shadow-md backdrop-blur"
    >
      <button
        type="button"
        onClick={() => zoomIn({ duration: 150 })}
        className={`${baseButtonClasses} ${buttonStyles}`}
        aria-label="Zoom in"
      >
        <ZoomIn className="h-4 w-4" strokeWidth={2.2} />
      </button>
      <button
        type="button"
        onClick={() => zoomOut({ duration: 150 })}
        className={`${baseButtonClasses} ${buttonStyles}`}
        aria-label="Zoom out"
      >
        <ZoomOut className="h-4 w-4" strokeWidth={2.2} />
      </button>
      <button
        type="button"
        onClick={() => fitView({ padding: 0.2, duration: 200 })}
        className={`${baseButtonClasses} ${buttonStyles}`}
        aria-label="Fit view"
      >
        <Maximize2 className="h-4 w-4" strokeWidth={2.2} />
      </button>
      <button
        type="button"
        onClick={handleToggleInteractive}
        className={`${baseButtonClasses} ${buttonStyles} ${
          isInteractive ? "text-indigo-600" : "text-gray-500"
        }`}
        aria-label={isInteractive ? "Disable interactions" : "Enable interactions"}
        aria-pressed={isInteractive}
      >
        {isInteractive ? (
          <Unlock className="h-4 w-4" strokeWidth={2.2} />
        ) : (
          <Lock className="h-4 w-4" strokeWidth={2.2} />
        )}
      </button>
    </Panel>
  );
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
        onReconnectStart={canvasHandlers.handleReconnectStart}
        onReconnect={canvasHandlers.handleReconnect}
        onReconnectEnd={canvasHandlers.handleReconnectEnd}
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
          reconnectable: true,
        }}
        onInit={(reactFlowInstance) => {
          // Force fit view to ensure nodes are visible
          setTimeout(() => {
            reactFlowInstance.fitView({ padding: 0.2 });
          }, 100);
        }}
      >
        <Background color="#e5e7eb" gap={20} size={1} />
        <CanvasControls />
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
