"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui";
import { ArrowRight, CheckCircle, Loader2, FolderOpen, AlertCircle, ChevronDown, Check, Search, Folder, FileText, BarChart3, Rocket, XCircle, Play, ClipboardList, RefreshCw, PartyPopper } from "lucide-react";
import { useCommandDirectories } from "@/hooks/useCommandDirectories";
import { useCommandConversion } from "@/hooks/useCommandConversion";

export default function CommandConverter() {
  const [selectedDirectory, setSelectedDirectory] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { directories, loading: loadingDirs, error: dirError } = useCommandDirectories();
  const { converting, result, error: conversionError, convertCommands } = useCommandConversion();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleConvert = async (dryRun = false) => {
    if (!selectedDirectory) return;
    await convertCommands(selectedDirectory, dryRun);
  };

  // Replace emoji with icons in output text
  const formatOutputWithIcons = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, index) => {
      // Define emoji to icon mapping
      const iconMap: { [key: string]: { icon: React.ComponentType<{ className?: string }>, color: string } } = {
        '🔍': { icon: Search, color: 'text-indigo-400' },
        '📂': { icon: Folder, color: 'text-blue-400' },
        '📁': { icon: FolderOpen, color: 'text-blue-400' },
        '📄': { icon: FileText, color: 'text-slate-400' },
        '📝': { icon: ClipboardList, color: 'text-amber-400' },
        '🏃': { icon: Play, color: 'text-emerald-400' },
        '📊': { icon: BarChart3, color: 'text-purple-400' },
        '✅': { icon: CheckCircle, color: 'text-emerald-400' },
        '❌': { icon: XCircle, color: 'text-rose-400' },
        '🚀': { icon: Rocket, color: 'text-indigo-400' },
        '🔄': { icon: RefreshCw, color: 'text-cyan-400' },
        '🎉': { icon: PartyPopper, color: 'text-pink-400' },
      };

      // Calculate indentation level (count leading spaces)
      const leadingSpaces = line.match(/^\s*/)?.[0].length || 0;
      const indentLevel = Math.floor(leadingSpaces / 3); // Every 3 spaces = 1 indent level

      // Find emoji in the line
      let IconComponent = null;
      let iconColor = '';
      let textWithoutEmoji = line.trim();

      for (const [emoji, { icon, color }] of Object.entries(iconMap)) {
        if (line.includes(emoji)) {
          IconComponent = icon;
          iconColor = color;
          textWithoutEmoji = line.replace(emoji, '').trim();
          break;
        }
      }

      // Map indent level to Tailwind classes
      const indentClasses: { [key: number]: string } = {
        0: '',
        1: 'ml-6',
        2: 'ml-12',
        3: 'ml-18',
        4: 'ml-24',
      };
      const indentClass = indentClasses[Math.min(indentLevel, 4)] || '';

      if (IconComponent) {
        return (
          <div key={index} className={`flex items-start gap-2 ${indentClass}`}>
            <IconComponent className={`h-4 w-4 flex-shrink-0 mt-0.5 ${iconColor}`} />
            <span className="flex-1">{textWithoutEmoji}</span>
          </div>
        );
      }

      // For lines without icons, preserve indentation
      if (textWithoutEmoji) {
        // Check if this is a command list item (starts with -)
        const isListItem = textWithoutEmoji.startsWith('-');
        const listIndent = isListItem ? 'pl-8' : '';

        return (
          <div key={index} className={`text-slate-300 ${indentClass} ${listIndent}`}>
            {isListItem ? textWithoutEmoji.substring(1).trim() : textWithoutEmoji}
          </div>
        );
      }

      // Empty line
      return <div key={index} className="h-2" />;
    });
  };

  if (loadingDirs) {
    return (
      <div className="flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 p-8 text-slate-300">
        <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
        <span>Loading command directories...</span>
      </div>
    );
  }

  if (dirError) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-rose-200/20 bg-rose-500/10 p-6 text-rose-200">
        <AlertCircle className="h-5 w-5 flex-shrink-0" aria-hidden />
        <div>
          <p className="font-semibold">Failed to load directories</p>
          <p className="mt-1 text-sm">{dirError}</p>
        </div>
      </div>
    );
  }

  if (directories.length === 0) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-6 text-slate-300">
        <FolderOpen className="h-5 w-5 flex-shrink-0" aria-hidden />
        <div>
          <p className="font-semibold">No command directories found</p>
          <p className="mt-1 text-sm">Make sure you have command directories in .claude/commands/</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Directory Selection */}
      <div className="space-y-3 relative z-50">
        <label htmlFor="command-dir" className="block text-sm font-semibold text-slate-100">
          Select Command Directory
        </label>
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-slate-100 shadow-sm backdrop-blur transition hover:border-white/30 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
          >
            <span className={selectedDirectory ? "text-slate-100" : "text-slate-400"}>
              {selectedDirectory || "Select a directory"}
            </span>
            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden />
          </button>

          {isOpen && (
            <div className="absolute z-50 mt-2 w-full rounded-xl border border-white/20 bg-slate-900/95 shadow-2xl backdrop-blur-xl">
              <ul className="max-h-60 overflow-auto rounded-xl py-2">
                {directories.map((dir) => (
                  <li key={dir.name}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDirectory(dir.name);
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-slate-200 transition hover:bg-indigo-500/20 hover:text-indigo-200"
                    >
                      <span className="flex items-center gap-2">
                        <FolderOpen className="h-4 w-4 text-indigo-400" aria-hidden />
                        {dir.name}
                      </span>
                      {selectedDirectory === dir.name && (
                        <Check className="h-4 w-4 text-indigo-400" aria-hidden />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          onClick={() => handleConvert(true)}
          disabled={!selectedDirectory || converting}
          variant="secondary"
          className="inline-flex items-center justify-center gap-2"
        >
          {converting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Preview...
            </>
          ) : (
            <>
              <FolderOpen className="h-4 w-4" aria-hidden />
              Preview (Dry Run)
            </>
          )}
        </Button>
        <Button
          onClick={() => handleConvert(false)}
          disabled={!selectedDirectory || converting}
          variant="primary"
          className="inline-flex items-center justify-center gap-2"
        >
          {converting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Converting...
            </>
          ) : (
            <>
              <ArrowRight className="h-4 w-4" aria-hidden />
              Convert to Agents
            </>
          )}
        </Button>
      </div>

      {/* Conversion Error */}
      {conversionError && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-200/20 bg-rose-500/10 p-4 text-rose-200">
          <AlertCircle className="h-5 w-5 flex-shrink-0" aria-hidden />
          <div>
            <p className="font-semibold">Conversion failed</p>
            <p className="mt-1 text-sm">{conversionError}</p>
          </div>
        </div>
      )}

      {/* Conversion Result */}
      {result && result.success && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200/20 bg-emerald-500/10 p-4 text-emerald-200">
            <CheckCircle className="h-5 w-5 flex-shrink-0" aria-hidden />
            <div>
              <p className="font-semibold">
                {result.dryRun ? 'Preview completed' : 'Conversion successful'}
              </p>
              <p className="mt-1 text-sm">
                {result.dryRun
                  ? 'Below is a preview of what will be converted'
                  : 'Commands have been converted to agents'}
              </p>
            </div>
          </div>

          {/* Output Display */}
          {result.output && (
            <div className="rounded-xl border border-white/10 bg-slate-950/50 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Output
              </p>
              <div className="max-h-64 overflow-y-auto space-y-1 text-sm text-slate-200">
                {formatOutputWithIcons(result.output)}
              </div>
            </div>
          )}

          {/* Error Messages (if any) */}
          {result.error && (
            <div className="rounded-xl border border-yellow-200/20 bg-yellow-500/10 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-yellow-200">
                Warnings
              </p>
              <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap text-sm text-yellow-100">
                {result.error}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
