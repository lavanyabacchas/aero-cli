import React, { useRef, useEffect } from 'react';
import { Terminal, ShieldAlert, CheckCircle2, XCircle, Zap, Play } from 'lucide-react';

export const TerminalView = ({
  logs = [],
  pendingPrompt = null,
  onResolvePrompt,
  onRunPrompt,
  isExecuting = false,
  mockMode = true,
  setMockMode
}) => {
  const terminalEndRef = useRef(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs, pendingPrompt]);

  return (
    <div className="glass-panel rounded-lg border border-zinc-800 flex flex-col h-[520px] overflow-hidden shadow-2xl relative">
      {/* Terminal Top Bar */}
      <div className="bg-zinc-950 border-b border-zinc-800 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-zinc-700 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-zinc-700 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-zinc-700 inline-block"></span>
          </div>
          <span className="font-mono text-xs text-zinc-400 font-semibold flex items-center gap-1.5 ml-2">
            <Terminal className="w-3.5 h-3.5 text-zinc-200" />
            aerocli @ terminal-runner (bash)
          </span>
        </div>

        {/* Environment Toggle: MOCK_AI=true */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMockMode(!mockMode)}
            className={`text-xs px-2.5 py-1 rounded border font-mono transition-all flex items-center gap-1.5 ${
              mockMode
                ? 'bg-zinc-100 text-black border-white font-semibold'
                : 'bg-zinc-900 text-zinc-400 border-zinc-700'
            }`}
            title="Toggle MOCK_AI offline mode"
          >
            <Zap className="w-3 h-3" />
            MOCK_AI={mockMode ? 'true' : 'false'}
          </button>
        </div>
      </div>

      {/* Terminal Content Screen */}
      <div className="flex-1 bg-black/40 backdrop-blur-sm p-4 font-mono text-xs leading-relaxed overflow-y-auto space-y-1 text-zinc-200">
        <div className="text-zinc-500 pb-2 border-b border-zinc-900 mb-2">
          AeroCLI v1.0.0 — Autonomous Terminal-to-Browser Agent Bridge
          <br />
          Type a task below or click a quick action to launch agent execution.
        </div>

        {logs.map((log, idx) => {
          const isCmd = log.startsWith('$') || log.startsWith('>');
          const isSafety = log.includes('[SAFETY_PROMPT]') || log.includes('[SAFETY_ALERT]');
          const isSuccess = log.includes('COMPLETED') || log.includes('passed') || log.includes('✔');

          return (
            <div
              key={idx}
              className={`${
                isCmd
                  ? 'text-white font-semibold pl-1'
                  : isSafety
                  ? 'text-amber-300 bg-amber-950/20 px-2 py-0.5 rounded border border-amber-900/40 my-1'
                  : isSuccess
                  ? 'text-emerald-400 font-medium'
                  : 'text-zinc-400'
              }`}
            >
              {log}
            </div>
          );
        })}

        {/* DRY RUN SAFETY PERMISSION PROMPT MODAL / BANNER */}
        {pendingPrompt && (
          <div className="my-3 p-3.5 bg-zinc-900 border-2 border-amber-500/80 rounded-md shadow-lg animate-pulse-subtle">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              DRY-RUN SAFETY PERMISSION PROMPT
            </div>
            <p className="text-zinc-200 text-xs mb-3">
              AeroCLI agent requests authorization to execute command:
              <br />
              <code className="text-white font-mono bg-black px-2 py-1 rounded border border-zinc-700 block my-1">
                {pendingPrompt.command}
              </code>
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => onResolvePrompt('YES')}
                className="bg-white text-black font-semibold text-xs px-3 py-1.5 rounded hover:bg-zinc-200 transition-colors flex items-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                [Y]es (Allow)
              </button>

              <button
                onClick={() => onResolvePrompt('NO')}
                className="bg-zinc-800 text-zinc-300 font-medium text-xs px-3 py-1.5 rounded border border-zinc-700 hover:bg-zinc-700 hover:text-white transition-colors flex items-center gap-1"
              >
                <XCircle className="w-3.5 h-3.5" />
                [N]o (Deny)
              </button>

              <button
                onClick={() => onResolvePrompt('TURBO')}
                className="bg-amber-400 text-black font-bold text-xs px-3 py-1.5 rounded hover:bg-amber-300 transition-colors flex items-center gap-1 ml-auto"
                title="Auto-approve all remaining session commands"
              >
                <Zap className="w-3.5 h-3.5" />
                [T]urbo (Auto-Approve All)
              </button>
            </div>
          </div>
        )}

        <div ref={terminalEndRef} />
      </div>

      {/* Terminal Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const input = e.target.elements.promptInput.value.trim();
          if (input && !isExecuting) {
            onRunPrompt(input);
            e.target.elements.promptInput.value = '';
          }
        }}
        className="bg-zinc-950 border-t border-zinc-800 p-2.5 flex items-center gap-2"
      >
        <span className="text-zinc-400 font-mono text-xs pl-2">$</span>
        <input
          name="promptInput"
          type="text"
          disabled={isExecuting}
          placeholder={
            isExecuting
              ? 'Agent task running...'
              : 'Enter task (e.g. "Add dark mode toggle and verify")...'
          }
          className="flex-1 bg-transparent text-white font-mono text-xs focus:outline-none placeholder-zinc-600 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isExecuting}
          className="btn-monochrome text-xs px-3 py-1.5 flex items-center gap-1.5 disabled:opacity-40"
        >
          <Play className="w-3 h-3" />
          Run
        </button>
      </form>
    </div>
  );
};
