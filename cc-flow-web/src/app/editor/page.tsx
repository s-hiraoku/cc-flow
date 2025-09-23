'use client';

import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import Link from 'next/link';

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
    <div className="h-screen flex bg-gray-50">
      {/* Agent Palette */}
      <div className="w-80 bg-white border-r border-gray-200 shadow-sm">
        {/* Palette Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Agent Palette</h2>
          <p className="text-sm text-gray-500 mt-1">Drag agents to the canvas</p>
        </div>

        {/* Agent List */}
        <div className="p-4 space-y-3 overflow-y-auto">
          <div className="bg-white border border-gray-200 rounded-lg p-4 cursor-move hover:shadow-md hover:border-indigo-300 transition-all duration-200">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-gray-900">spec-designer</h3>
                <p className="text-xs text-gray-500 mt-1">Design specifications</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 cursor-move hover:shadow-md hover:border-indigo-300 transition-all duration-200">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-gray-900">code-generator</h3>
                <p className="text-xs text-gray-500 mt-1">Generate code</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 cursor-move hover:shadow-md hover:border-indigo-300 transition-all duration-200">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-gray-900">quality-checker</h3>
                <p className="text-xs text-gray-500 mt-1">Quality assurance</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center">
            <Link href="/" className="text-gray-500 hover:text-gray-700 mr-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">Workflow Editor</h1>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              Preview JSON
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              Save Workflow
            </button>
          </div>
        </div>

        {/* ReactFlow Canvas */}
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            fitView
            className="bg-gray-50"
          >
            <Background
              color="#e5e7eb"
              gap={20}
              size={1}
            />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>
      </div>

      {/* Properties Panel */}
      <div className="w-80 bg-white border-l border-gray-200 shadow-sm">
        {/* Properties Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Properties</h2>
          <p className="text-sm text-gray-500 mt-1">Configure workflow settings</p>
        </div>

        {/* Properties Form */}
        <div className="p-4 space-y-6 overflow-y-auto">
          <div>
            <label htmlFor="workflow-name" className="block text-sm font-medium text-gray-700 mb-2">
              Workflow Name
            </label>
            <input
              type="text"
              id="workflow-name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="my-workflow"
            />
          </div>

          <div>
            <label htmlFor="workflow-purpose" className="block text-sm font-medium text-gray-700 mb-2">
              Purpose
            </label>
            <textarea
              id="workflow-purpose"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm resize-none"
              placeholder="Describe workflow purpose..."
            />
          </div>

          <div>
            <label htmlFor="workflow-model" className="block text-sm font-medium text-gray-700 mb-2">
              Model
            </label>
            <select
              id="workflow-model"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            >
              <option value="">Default</option>
              <option value="claude-3-5-haiku-20241022">Claude 3.5 Haiku</option>
              <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
            </select>
          </div>

          <div>
            <label htmlFor="argument-hint" className="block text-sm font-medium text-gray-700 mb-2">
              Argument Hint
            </label>
            <input
              type="text"
              id="argument-hint"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              placeholder="<context>"
            />
          </div>

          {/* JSON Preview Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">JSON Preview</h3>
            <div className="bg-gray-900 border border-gray-300 rounded-md p-3 text-xs font-mono max-h-48 overflow-y-auto">
              <pre className="text-green-400 whitespace-pre-wrap">
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
          </div>
        </div>
      </div>
    </div>
  );
}