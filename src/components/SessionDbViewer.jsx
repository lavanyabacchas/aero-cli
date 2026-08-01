import React, { useState } from 'react';
import { Database, Clock, FileCheck, CheckCircle2, ChevronRight, RefreshCw, Trash2 } from 'lucide-react';
import { sessionDb } from '../services/sessionDb';

export const SessionDbViewer = () => {
  const [sessions, setSessions] = useState(() => sessionDb.getAllSessions());
  const [selectedId, setSelectedId] = useState(() => sessions[0]?.id || null);

  const activeSession = sessions.find(s => s.id === selectedId);

  const handleRefresh = () => {
    const updated = sessionDb.getAllSessions();
    setSessions([...updated]);
  };

  const handleClear = () => {
    sessionDb.clearHistory();
    setSessions([]);
    setSelectedId(null);
  };

  return (
    <div className="glass-panel rounded-lg border border-zinc-800 p-5 shadow-2xl">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-4">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-white" />
          <h2 className="font-bold text-sm text-white">SQLite Session Log Database</h2>
          <span className="text-xs px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded font-mono border border-zinc-700">
            aerocli_sqlite_v1
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="btn-monochrome-outline text-xs px-2.5 py-1 flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            Refresh Query
          </button>
          <button
            onClick={handleClear}
            className="text-xs px-2.5 py-1 bg-zinc-900 text-zinc-400 border border-zinc-800 rounded hover:text-rose-400 hover:border-rose-900 transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            Clear DB
          </button>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-10 text-zinc-500 font-mono text-xs">
          No records found in SQLite database. Run an agent task to populate session logs.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Session List Column */}
          <div className="space-y-2 border-r border-zinc-800 pr-3 max-h-[380px] overflow-y-auto">
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-2">
              Task Executions ({sessions.length})
            </span>
            {sessions.map(s => (
              <div
                key={s.id}
                onClick={() => setSelectedId(s.id)}
                className={`p-3 rounded-md border text-xs cursor-pointer transition-all ${
                  s.id === selectedId
                    ? 'bg-zinc-100 text-black border-white font-medium shadow-md'
                    : 'bg-zinc-900/60 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between font-mono text-[11px] mb-1 opacity-80">
                  <span>{s.id}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="font-semibold line-clamp-1">{s.prompt}</div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[10px] px-1.5 py-0.5 rounded border border-current font-mono">
                    {s.mode}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    {s.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Session Details View */}
          <div className="lg:col-span-2 space-y-4 font-mono text-xs">
            {activeSession ? (
              <>
                <div className="bg-zinc-950 p-3.5 rounded border border-zinc-800 space-y-2">
                  <div className="text-zinc-400 text-[11px] flex justify-between">
                    <span>QUERY_RESULT: SELECT * FROM sessions WHERE id='{activeSession.id}'</span>
                    <span className="text-emerald-400">STATUS: 200 OK</span>
                  </div>
                  <div className="font-bold text-white text-sm">
                    Prompt: "{activeSession.prompt}"
                  </div>
                </div>

                {/* Execution Plan Table */}
                <div className="bg-zinc-950 p-3.5 rounded border border-zinc-800 space-y-2">
                  <span className="text-zinc-400 text-xs font-bold block mb-1 flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-zinc-300" />
                    Generated Execution Plan ({activeSession.executionPlan?.length || 0} steps)
                  </span>

                  <div className="space-y-1.5">
                    {activeSession.executionPlan?.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2 bg-zinc-900/70 p-2 rounded border border-zinc-800">
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-500 mt-0.5" />
                        <div>
                          <span className="font-bold text-white">Step {step.step}:</span>{' '}
                          <span className="text-zinc-300">{step.desc}</span>
                          <span className="ml-2 text-[10px] text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700">
                            {step.action}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Test Results Summary */}
                <div className="bg-zinc-950 p-3.5 rounded border border-zinc-800">
                  <span className="text-zinc-400 text-xs font-bold block mb-1">
                    Browser Test Result Snapshot
                  </span>
                  <div className="text-zinc-300 text-xs leading-relaxed">
                    {activeSession.browserResults?.verificationNote || 'Browser test completed cleanly.'}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-zinc-500 text-center py-12">
                Select a session from the query list to inspect logs.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
