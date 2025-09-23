import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            CC-Flow Web Editor
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Visual Workflow Editor for CC-Flow CLI
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/editor"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Open Workflow Editor
            </Link>
            <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors">
              View Documentation
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Visual Editor
            </h3>
            <p className="text-gray-600">
              Drag and drop agents to create complex workflows with visual connections
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Real-time Preview
            </h3>
            <p className="text-gray-600">
              See your workflow configuration in JSON format as you build
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              CLI Integration
            </h3>
            <p className="text-gray-600">
              Seamlessly integrate with existing cc-flow-cli workflows
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Getting Started
          </h2>
          <div className="bg-white rounded-lg p-6 shadow-sm text-left max-w-2xl mx-auto">
            <ol className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">1</span>
                <span>Launch from CC-Flow CLI: <code className="bg-gray-100 px-2 py-1 rounded text-sm">cc-flow web</code></span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">2</span>
                <span>Select agents from your .claude/agents directory</span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">3</span>
                <span>Design your workflow with drag & drop</span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">4</span>
                <span>Export as CC-Flow compatible JSON</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
