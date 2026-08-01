import React from 'react';
import { ShieldAlert, CheckCircle, XCircle, Zap, AlertTriangle } from 'lucide-react';

export const SafetyConfirmationModal = ({ pendingPrompt, onResolvePrompt }) => {
  if (!pendingPrompt) return null;

  const isDangerous =
    pendingPrompt.command.includes('rm -rf') ||
    pendingPrompt.command.includes('npm install') ||
    pendingPrompt.command.includes('delete');

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-zinc-950 border-2 border-amber-500 rounded-lg max-w-lg w-full p-6 shadow-2xl space-y-4 animate-pulse-subtle">
        {/* Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-zinc-800">
          <div className="p-2.5 bg-amber-950/60 border border-amber-800 rounded-md text-amber-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              GRANULAR SAFETY CONFIRMATION
              {isDangerous && (
                <span className="text-[10px] bg-rose-950 text-rose-300 font-mono px-2 py-0.5 rounded border border-rose-800">
                  HIGH SENSITIVITY
                </span>
              )}
            </h3>
            <p className="text-xs text-zinc-400">
              AeroCLI Terminal Runner requires explicit manual approval before executing this action.
            </p>
          </div>
        </div>

        {/* Command Details */}
        <div className="bg-black p-3.5 rounded border border-zinc-800 font-mono text-xs text-zinc-200 space-y-2">
          <div className="text-zinc-500 flex justify-between">
            <span>TARGET COMMAND</span>
            <span className="text-amber-400">STATUS: PAUSED_WAITING_APPROVAL</span>
          </div>
          <div className="text-sm font-bold text-white bg-zinc-900 p-2.5 rounded border border-zinc-700 break-all">
            $ {pendingPrompt.command}
          </div>
        </div>

        {/* Security Warning note */}
        <div className="flex items-start gap-2 bg-amber-950/20 border border-amber-900/50 p-2.5 rounded text-xs text-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            Executing commands like <code>npm install</code> or system scripts modifies your local environment. Click <strong>Allow</strong> to authorize or <strong>Block</strong> to abort.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => onResolvePrompt('YES')}
            className="flex-1 bg-white text-black font-bold text-xs py-2.5 px-4 rounded hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            ALLOW COMMAND
          </button>

          <button
            onClick={() => onResolvePrompt('NO')}
            className="flex-1 bg-zinc-900 text-zinc-300 font-bold text-xs py-2.5 px-4 rounded border border-zinc-800 hover:bg-rose-950 hover:text-rose-300 hover:border-rose-800 transition-colors flex items-center justify-center gap-2"
          >
            <XCircle className="w-4 h-4" />
            BLOCK COMMAND
          </button>

          <button
            onClick={() => onResolvePrompt('TURBO')}
            className="bg-amber-400 text-black font-bold text-xs py-2.5 px-3 rounded hover:bg-amber-300 transition-colors flex items-center gap-1 shrink-0"
            title="Auto-approve all commands in this session"
          >
            <Zap className="w-3.5 h-3.5" />
            TURBO
          </button>
        </div>
      </div>
    </div>
  );
};
