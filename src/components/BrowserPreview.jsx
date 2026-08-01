import React from 'react';
import { Globe, ShieldCheck, Camera, MousePointer, RefreshCw } from 'lucide-react';

export const BrowserPreview = ({ currentStep, results, isExecuting }) => {
  const url = results?.url || 'http://localhost:5173';

  return (
    <div className="glass-panel rounded-lg border border-zinc-800 flex flex-col h-[520px] overflow-hidden shadow-2xl">
      {/* Browser Top Navigation Bar */}
      <div className="bg-zinc-950 border-b border-zinc-800 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1 max-w-lg">
          <Globe className="w-3.5 h-3.5 text-zinc-400" />
          <div className="bg-zinc-900 border border-zinc-800 rounded px-3 py-1 text-xs font-mono text-zinc-300 w-full truncate flex items-center justify-between">
            <span>{url}</span>
            <span className="text-[10px] text-emerald-400 font-medium px-1.5 py-0.2 bg-emerald-950/60 rounded border border-emerald-900">
              HEADLESS PLAYWRIGHT
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isExecuting && (
            <span className="flex items-center gap-1.5 text-xs text-amber-400 font-mono animate-pulse">
              <RefreshCw className="w-3 h-3 animate-spin" />
              Automating...
            </span>
          )}
          {results?.passed && (
            <span className="flex items-center gap-1 text-xs text-emerald-400 font-mono font-medium px-2 py-0.5 bg-emerald-950/50 rounded border border-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5" />
              VERIFIED
            </span>
          )}
        </div>
      </div>

      {/* Browser Live Viewport */}
      <div className="flex-1 bg-black/40 backdrop-blur-sm relative p-6 flex flex-col justify-between overflow-hidden">
        {/* Simulated Web Application Display */}
        <div className="w-full h-full border border-zinc-800/80 rounded-md bg-zinc-950/40 p-5 flex flex-col justify-between relative shadow-inner">
          {/* Header Bar */}
          <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
            <div className="font-bold text-sm tracking-tight text-white flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-white"></div>
              AeroCLI Target Local App
            </div>

            {/* Dark Mode Toggle Demo Button */}
            <button
              id="dark-mode-btn"
              className={`px-3 py-1.5 rounded text-xs font-mono transition-all flex items-center gap-2 border ${
                currentStep?.action === 'CLICK'
                  ? 'ring-2 ring-amber-400 bg-white text-black font-bold scale-105'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-200'
              }`}
            >
              <span>Dark Mode</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </button>
          </div>

          {/* Interactive Content Canvas Area */}
          <div className="my-auto text-center space-y-3 py-8">
            <h3 className="text-xl font-bold text-zinc-100">
              Local App Automated Test Environment
            </h3>
            <p className="text-zinc-400 text-xs max-w-md mx-auto">
              AeroCLI Headless Automation Bridge is monitoring DOM elements, verifying state transitions, and snapshotting artifacts.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs font-mono text-zinc-300">
              <MousePointer className="w-3.5 h-3.5 text-zinc-400" />
              <span>
                Active Target: {currentStep ? `${currentStep.action} (${currentStep.selector || 'window'})` : 'Idle'}
              </span>
            </div>
          </div>

          {/* Test Action Log Footer */}
          <div className="bg-zinc-900/90 border border-zinc-800 p-2.5 rounded text-xs font-mono flex items-center justify-between text-zinc-300">
            <div className="flex items-center gap-2">
              <Camera className="w-3.5 h-3.5 text-zinc-400" />
              <span>Snapshot Logger: Active</span>
            </div>
            <span className="text-[11px] text-zinc-500">
              {results?.actionsExecuted?.length || 0} Actions Executed
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
