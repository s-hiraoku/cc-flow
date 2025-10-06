"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, Zap } from "lucide-react";
import CommandConverter from "@/components/converter/CommandConverter";
import { ErrorBoundary } from "@/components/common";

export default function ConverterPage() {
  return (
    <ErrorBoundary>
      <div className="relative min-h-screen bg-slate-950 text-slate-100">
        <a
          href="#main-content"
          className="absolute left-6 top-6 z-50 -translate-y-32 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg transition-transform focus-visible:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
        >
          Skip to main content
        </a>

        <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur">
          <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-slate-100 transition hover:border-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
                <span className="sr-only">Back to CC-Flow overview</span>
              </Link>
              <h1 className="text-base font-semibold text-slate-100">Command Converter</h1>
            </div>
          </div>
        </header>

        <main id="main-content" className="relative isolate">
          <div className="pointer-events-none absolute inset-x-0 top-[-18rem] -z-10 transform-gpu overflow-hidden blur-3xl">
            <div
              className="relative left-[max(50%,25rem)] aspect-[1155/678] w-[72.1875rem] -translate-x-1/2 bg-gradient-to-tr from-indigo-500 via-sky-500 to-purple-500 opacity-30"
              aria-hidden
            />
          </div>

          <section className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="space-y-8">
              {/* Hero */}
              <div className="space-y-4">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-200">
                  <Zap className="h-3.5 w-3.5" aria-hidden />
                  Slash Command Migration
                </span>
                <h2 className="text-balance text-3xl font-semibold leading-tight sm:text-4xl">
                  Convert slash commands to CC-Flow agents
                </h2>
                <p className="max-w-2xl text-lg text-slate-300">
                  Transform your existing slash commands into reusable sub-agents. Select a command directory and preview or convert them into agent definitions compatible with the CC-Flow workflow system.
                </p>
              </div>

              {/* Converter Component */}
              <div className="relative z-40 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-lg sm:p-8">
                <CommandConverter />
              </div>

              {/* Instructions */}
              <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-100">
                  <Sparkles className="h-5 w-5 text-indigo-400" aria-hidden />
                  How it works
                </h3>
                <ol className="space-y-3 text-sm text-slate-300">
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-semibold text-indigo-200">
                      1
                    </span>
                    <span>
                      <strong className="text-slate-100">Select a directory:</strong> Choose from available command directories in your .claude/commands/ folder
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-semibold text-indigo-200">
                      2
                    </span>
                    <span>
                      <strong className="text-slate-100">Preview (Optional):</strong> Use &quot;Preview (Dry Run)&quot; to see what will be converted without making changes
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-semibold text-indigo-200">
                      3
                    </span>
                    <span>
                      <strong className="text-slate-100">Convert:</strong> Click &quot;Convert to Agents&quot; to generate agent definitions in .claude/agents/ directory
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-semibold text-indigo-200">
                      4
                    </span>
                    <span>
                      <strong className="text-slate-100">Use in workflows:</strong> The converted agents can now be used in the workflow editor
                    </span>
                  </li>
                </ol>
              </div>
            </div>
          </section>
        </main>
      </div>
    </ErrorBoundary>
  );
}
