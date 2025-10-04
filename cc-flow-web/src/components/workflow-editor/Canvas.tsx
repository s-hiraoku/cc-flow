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
    "flex h-9 w-9 items-center justify-center rounded-lg border transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400";

  const buttonStyles =
    "border-white/10 bg-white/10 text-slate-200 hover:border-indigo-400/60 hover:bg-indigo-500/20 hover:text-white";

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
      className="flex gap-2 rounded-xl border border-white/10 bg-slate-950/70 p-1.5 shadow-lg backdrop-blur"
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
          isInteractive
            ? "border-emerald-400/70 text-emerald-200"
            : "text-slate-300"
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
      className="h-full w-full min-w-0"
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
        className="bg-transparent"
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
        <Background color="rgba(148, 163, 184, 0.25)" gap={24} size={1} />
        <CanvasControls />
        <MiniMap
          style={{
            backgroundColor: "rgba(15, 23, 42, 0.85)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: 12,
            color: "#e2e8f0",
          }}
          maskColor="rgba(15, 23, 42, 0.85)"
          nodeStrokeColor={() => "#818cf8"}
          nodeColor={() => "#312e81"}
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
