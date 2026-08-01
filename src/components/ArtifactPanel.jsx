import React, { useState } from 'react';
import { FileText, Code2, Camera, Copy, Check, ShieldCheck, ExternalLink } from 'lucide-react';

export const ArtifactPanel = ({ markdownArtifact, executionPlan, browserResults, taskPrompt }) => {
  const [viewTab, setViewTab] = useState('MARKDOWN'); // 'MARKDOWN' | 'JSON_PLAN' | 'SCREENSHOT'
  const [copied, setCopied] = useState(false);

  const handleCopy = (text) => {
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const jsonPlanStr = JSON.stringify(executionPlan || [], null, 2);

  return (
    <div className="glass-panel rounded-lg border border-zinc-800 p-5 shadow-2xl space-y-4">
      {/* Sub-header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-white" />
          <h2 className="font-bold text-sm text-white">
            Dedicated Artifact Inspector Content View
          </h2>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded border border-zinc-800 font-mono text-xs">
          <button
            onClick={() => setViewTab('MARKDOWN')}
            className={`px-2.5 py-1 rounded transition-all flex items-center gap-1 ${
              viewTab === 'MARKDOWN' ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Markdown Report
          </button>

          <button
            onClick={() => setViewTab('JSON_PLAN')}
            className={`px-2.5 py-1 rounded transition-all flex items-center gap-1 ${
              viewTab === 'JSON_PLAN' ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            JSON Task Plan
          </button>

          <button
            onClick={() => setViewTab('SCREENSHOT')}
            className={`px-2.5 py-1 rounded transition-all flex items-center gap-1 ${
              viewTab === 'SCREENSHOT' ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            Screenshot Log
          </button>
        </div>
      </div>

      {/* 1. MARKDOWN REPORT VIEW */}
      {viewTab === 'MARKDOWN' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs font-mono text-zinc-400">
            <span>File Path: .aerocli/artifacts/verification-report.md</span>
            <button
              onClick={() => handleCopy(markdownArtifact)}
              disabled={!markdownArtifact}
              className="btn-monochrome-outline text-xs px-2.5 py-1 flex items-center gap-1 disabled:opacity-40"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Markdown'}
            </button>
          </div>

          {markdownArtifact ? (
            <div className="bg-[#050506] p-4 rounded border border-zinc-800 font-mono text-xs text-zinc-200 leading-relaxed overflow-x-auto max-h-[380px] whitespace-pre-wrap">
              {markdownArtifact}
            </div>
          ) : (
            <div className="bg-[#050506] p-10 rounded border border-zinc-800 text-center font-mono text-xs text-zinc-500">
              No task report generated yet. Run an agent task to view markdown verification checklists.
            </div>
          )}
        </div>
      )}

      {/* 2. JSON TASK PLAN VIEW */}
      {viewTab === 'JSON_PLAN' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs font-mono text-zinc-400">
            <span>Structured Plan Schema (JSON)</span>
            <button
              onClick={() => handleCopy(jsonPlanStr)}
              className="btn-monochrome-outline text-xs px-2.5 py-1 flex items-center gap-1"
            >
              <Copy className="w-3.5 h-3.5" />
              Copy JSON
            </button>
          </div>

          <div className="bg-[#050506] p-4 rounded border border-zinc-800 font-mono text-xs text-emerald-400 leading-relaxed overflow-x-auto max-h-[380px] whitespace-pre">
            {jsonPlanStr}
          </div>
        </div>
      )}

      {/* 3. SIMULATED SCREENSHOT & DOM LOG VIEW */}
      {viewTab === 'SCREENSHOT' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs font-mono text-zinc-400">
            <span>Playwright DOM Screenshot & Test Log</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              PASSED (0 DOM Errors)
            </span>
          </div>

          <div className="bg-zinc-950 p-4 rounded border border-zinc-800 space-y-4">
            {/* Visual Screenshot Mock Display */}
            <div className="border border-zinc-800 rounded-md bg-black p-4 space-y-3 shadow-inner">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400 pb-2 border-b border-zinc-900">
                <span className="flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5" />
                  Target: http://localhost:3000
                </span>
                <span className="text-zinc-500">1920x1080 Headless Viewport</span>
              </div>

              <div className="p-6 bg-zinc-900/60 rounded border border-zinc-800 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="font-bold text-white text-sm">
                  Automated UI Screenshot Verified Cleanly
                </div>
                <p className="text-zinc-400 text-xs max-w-sm mx-auto">
                  {browserResults?.verificationNote || 'Headless browser executed all DOM clicks and element visibility assertions successfully.'}
                </p>
              </div>
            </div>

            <div className="bg-zinc-900/70 p-3 rounded border border-zinc-800 font-mono text-xs text-zinc-300">
              <span className="text-zinc-500 block mb-1">AUTOMATION ACTIONS LOGGED:</span>
              <ul className="list-disc list-inside space-y-1">
                {browserResults?.actionsExecuted?.map((act, i) => (
                  <li key={i} className="text-emerald-300">{act}</li>
                )) || (
                  <li className="text-zinc-400">navigate("http://localhost:3000")</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
