'use client';

import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import LiquidGlass from 'liquid-glass-react';

export default function EditorPage() {
  const nodes = [
    {
      id: '1',
      position: { x: 100, y: 100 },
      data: { label: 'Start' },
      type: 'input',
    },
    {
      id: '2',
      position: { x: 300, y: 100 },
      data: { label: 'Agent 1' },
    },
    {
      id: '3',
      position: { x: 500, y: 100 },
      data: { label: 'Agent 2' },
    },
    {
      id: '4',
      position: { x: 700, y: 100 },
      data: { label: 'End' },
      type: 'output',
    },
  ];

  const edges = [
    {
      id: 'e1-2',
      source: '1',
      target: '2',
    },
    {
      id: 'e2-3',
      source: '2',
      target: '3',
    },
    {
      id: 'e3-4',
      source: '3',
      target: '4',
    },
  ];

  return (
    <div className="h-screen flex bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_30%_300px,#3b82f6,transparent)] opacity-10"></div>
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      {/* Agent Palette */}
      <LiquidGlass displacementScale={10} blurAmount={2}>
        <div className="w-80 backdrop-blur-xl bg-black/20 border-r border-white/10 p-6 relative z-10">
          <h2 className="text-xl font-semibold mb-6 text-white">Agent Palette</h2>
          <div className="space-y-3">
            <LiquidGlass displacementScale={8} blurAmount={1}>
              <div className="backdrop-blur-xl bg-white/10 p-4 rounded-xl border border-white/20 cursor-move hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
                <h3 className="font-semibold text-white">spec-designer</h3>
                <p className="text-sm text-white/70">Design specifications</p>
              </div>
            </LiquidGlass>
            <LiquidGlass displacementScale={8} blurAmount={1}>
              <div className="backdrop-blur-xl bg-white/10 p-4 rounded-xl border border-white/20 cursor-move hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
                <h3 className="font-semibold text-white">code-generator</h3>
                <p className="text-sm text-white/70">Generate code</p>
              </div>
            </LiquidGlass>
            <LiquidGlass displacementScale={8} blurAmount={1}>
              <div className="backdrop-blur-xl bg-white/10 p-4 rounded-xl border border-white/20 cursor-move hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
                <h3 className="font-semibold text-white">quality-checker</h3>
                <p className="text-sm text-white/70">Quality assurance</p>
              </div>
            </LiquidGlass>
          </div>
        </div>
      </LiquidGlass>

      {/* Main Editor */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Toolbar */}
        <LiquidGlass displacementScale={8} blurAmount={2}>
          <div className="h-16 backdrop-blur-xl bg-black/20 border-b border-white/10 flex items-center px-6">
            <h1 className="text-2xl font-semibold mr-8 text-white">Workflow Editor</h1>
            <div className="flex gap-3">
              <LiquidGlass displacementScale={6} blurAmount={1}>
                <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-300 transform hover:scale-105">
                  Save Workflow
                </button>
              </LiquidGlass>
              <LiquidGlass displacementScale={6} blurAmount={1}>
                <button className="px-6 py-2 backdrop-blur-xl bg-white/10 hover:bg-white/20 border border-white/30 text-white rounded-xl font-medium transition-all duration-300">
                  Preview JSON
                </button>
              </LiquidGlass>
            </div>
          </div>
        </LiquidGlass>

        {/* ReactFlow Canvas */}
        <div className="flex-1 relative">
          <LiquidGlass displacementScale={5} blurAmount={1}>
            <div className="h-full backdrop-blur-sm bg-black/10 border border-white/5 rounded-lg m-2">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                fitView
                className="rounded-lg"
                style={{
                  background: 'transparent',
                }}
              >
                <Background
                  color="#ffffff20"
                  gap={20}
                  size={1}
                />
                <Controls
                  className="[&>button]:backdrop-blur-xl [&>button]:bg-white/10 [&>button]:border-white/20 [&>button]:text-white"
                />
                <MiniMap
                  className="backdrop-blur-xl bg-white/10 border border-white/20"
                  nodeColor="#ffffff40"
                  maskColor="rgba(0,0,0,0.3)"
                />
              </ReactFlow>
            </div>
          </LiquidGlass>
        </div>
      </div>

      {/* Properties Panel */}
      <LiquidGlass displacementScale={10} blurAmount={2}>
        <div className="w-80 backdrop-blur-xl bg-black/20 border-l border-white/10 p-6 relative z-10">
          <h2 className="text-xl font-semibold mb-6 text-white">Properties</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Workflow Name
              </label>
              <LiquidGlass displacementScale={5} blurAmount={1}>
                <input
                  type="text"
                  className="w-full px-4 py-3 backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="my-workflow"
                />
              </LiquidGlass>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Purpose
              </label>
              <LiquidGlass displacementScale={5} blurAmount={1}>
                <textarea
                  className="w-full px-4 py-3 backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={3}
                  placeholder="Describe workflow purpose..."
                />
              </LiquidGlass>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Model
              </label>
              <LiquidGlass displacementScale={5} blurAmount={1}>
                <select className="w-full px-4 py-3 backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="" className="bg-slate-800">Default</option>
                  <option value="claude-3-5-haiku-20241022" className="bg-slate-800">Claude 3.5 Haiku</option>
                  <option value="claude-3-5-sonnet-20241022" className="bg-slate-800">Claude 3.5 Sonnet</option>
                </select>
              </LiquidGlass>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Argument Hint
              </label>
              <LiquidGlass displacementScale={5} blurAmount={1}>
                <input
                  type="text"
                  className="w-full px-4 py-3 backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="<context>"
                />
              </LiquidGlass>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-3 text-white">JSON Preview</h3>
            <LiquidGlass displacementScale={8} blurAmount={2}>
              <div className="backdrop-blur-xl bg-black/40 border border-white/20 p-4 rounded-xl text-xs font-mono max-h-48 overflow-y-auto">
                <pre className="text-white/90 whitespace-pre-wrap">
                  {JSON.stringify({
                    workflowName: "my-workflow",
                    workflowPurpose: "Sample workflow",
                    workflowSteps: [
                      {
                        title: "Step 1",
                        mode: "sequential",
                        agents: ["agent1", "agent2"]
                      }
                    ]
                  }, null, 2)}
                </pre>
              </div>
            </LiquidGlass>
          </div>
        </div>
      </LiquidGlass>
    </div>
  );
}