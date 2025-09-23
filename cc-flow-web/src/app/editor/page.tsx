'use client';

import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

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
    <div className="h-screen flex">
      {/* Agent Palette */}
      <div className="w-80 bg-gray-50 border-r border-gray-200 p-4">
        <h2 className="text-lg font-semibold mb-4">Agent Palette</h2>
        <div className="space-y-2">
          <div className="bg-white p-3 rounded-lg border border-gray-200 cursor-move hover:shadow-sm">
            <h3 className="font-medium">spec-designer</h3>
            <p className="text-sm text-gray-600">Design specifications</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-200 cursor-move hover:shadow-sm">
            <h3 className="font-medium">code-generator</h3>
            <p className="text-sm text-gray-600">Generate code</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-200 cursor-move hover:shadow-sm">
            <h3 className="font-medium">quality-checker</h3>
            <p className="text-sm text-gray-600">Quality assurance</p>
          </div>
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center px-4">
          <h1 className="text-xl font-semibold mr-8">Workflow Editor</h1>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Save Workflow
            </button>
            <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
              Preview JSON
            </button>
          </div>
        </div>

        {/* ReactFlow Canvas */}
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            fitView
            className="bg-gray-100"
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>
      </div>

      {/* Properties Panel */}
      <div className="w-80 bg-gray-50 border-l border-gray-200 p-4">
        <h2 className="text-lg font-semibold mb-4">Properties</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Workflow Name
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="my-workflow"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purpose
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Describe workflow purpose..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">Default</option>
              <option value="claude-3-5-haiku-20241022">Claude 3.5 Haiku</option>
              <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Argument Hint
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="<context>"
            />
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-md font-semibold mb-2">JSON Preview</h3>
          <div className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs font-mono max-h-40 overflow-y-auto">
            <pre>{JSON.stringify({
              workflowName: "my-workflow",
              workflowPurpose: "Sample workflow",
              workflowSteps: [
                {
                  title: "Step 1",
                  mode: "sequential",
                  agents: ["agent1", "agent2"]
                }
              ]
            }, null, 2)}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}