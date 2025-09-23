'use client';

import Link from 'next/link';
import LiquidGlass from 'liquid-glass-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#3b82f6,transparent)] opacity-20"></div>
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <LiquidGlass displacementScale={20} blurAmount={3} elasticity={0.8}>
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-12 mb-8">
              <h1 className="text-6xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent mb-6">
                CC-Flow Web Editor
              </h1>
              <p className="text-2xl text-white/80 mb-8 leading-relaxed">
                Visual Workflow Editor for CC-Flow CLI
              </p>
              <div className="flex justify-center gap-6">
                <LiquidGlass displacementScale={15} blurAmount={2}>
                  <Link
                    href="/editor"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105"
                  >
                    Open Workflow Editor
                  </Link>
                </LiquidGlass>
                <LiquidGlass displacementScale={15} blurAmount={2}>
                  <button className="backdrop-blur-xl bg-white/10 hover:bg-white/20 border border-white/30 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300">
                    View Documentation
                  </button>
                </LiquidGlass>
              </div>
            </div>
          </LiquidGlass>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <LiquidGlass displacementScale={12} blurAmount={2}>
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 h-full">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-xl border border-blue-300/30 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">
                Visual Editor
              </h3>
              <p className="text-white/70 text-lg leading-relaxed">
                Drag and drop agents to create complex workflows with visual connections and real-time feedback
              </p>
            </div>
          </LiquidGlass>

          <LiquidGlass displacementScale={12} blurAmount={2}>
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 h-full">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-xl border border-green-300/30 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">
                Real-time Preview
              </h3>
              <p className="text-white/70 text-lg leading-relaxed">
                See your workflow configuration in JSON format as you build with instant validation
              </p>
            </div>
          </LiquidGlass>

          <LiquidGlass displacementScale={12} blurAmount={2}>
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 h-full">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-xl border border-purple-300/30 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">
                CLI Integration
              </h3>
              <p className="text-white/70 text-lg leading-relaxed">
                Seamlessly integrate with existing cc-flow-cli workflows and export configurations
              </p>
            </div>
          </LiquidGlass>
        </div>

        {/* Getting Started */}
        <div className="text-center">
          <h2 className="text-4xl font-semibold text-white mb-8">
            Getting Started
          </h2>
          <LiquidGlass displacementScale={15} blurAmount={3}>
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-10 text-left max-w-3xl mx-auto">
              <ol className="space-y-6 text-white/90">
                <li className="flex items-start">
                  <LiquidGlass displacementScale={8} blurAmount={1}>
                    <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold mr-6 mt-1">1</span>
                  </LiquidGlass>
                  <div className="flex-1">
                    <span className="text-xl">Launch from CC-Flow CLI:</span>
                    <LiquidGlass displacementScale={5} blurAmount={1}>
                      <code className="block mt-2 bg-black/30 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-xl text-lg font-mono text-blue-300">cc-flow web</code>
                    </LiquidGlass>
                  </div>
                </li>
                <li className="flex items-start">
                  <LiquidGlass displacementScale={8} blurAmount={1}>
                    <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold mr-6 mt-1">2</span>
                  </LiquidGlass>
                  <span className="text-xl">Select agents from your .claude/agents directory</span>
                </li>
                <li className="flex items-start">
                  <LiquidGlass displacementScale={8} blurAmount={1}>
                    <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold mr-6 mt-1">3</span>
                  </LiquidGlass>
                  <span className="text-xl">Design your workflow with drag & drop interface</span>
                </li>
                <li className="flex items-start">
                  <LiquidGlass displacementScale={8} blurAmount={1}>
                    <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold mr-6 mt-1">4</span>
                  </LiquidGlass>
                  <span className="text-xl">Export as CC-Flow compatible JSON configuration</span>
                </li>
              </ol>
            </div>
          </LiquidGlass>
        </div>
      </div>
    </div>
  );
}
