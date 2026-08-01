import React, { useState } from 'react';
import { History, GitCommit, FileCode, CheckCircle2, RefreshCw, Trash2, Download } from 'lucide-react';
import { localHistory } from '../services/localHistory';

export const LocalHistoryViewer = () => {
  const [history, setHistory] = useState(() => localHistory.getHistory());
  const [selectedCommit, setSelectedCommit] = useState(() => history[0] || null);

  const handleRefresh = async () => {
    try {
      const res = await fetch('http://localhost:3002/api/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
        if (data.length) setSelectedCommit(data[0]);
        return;
      }
    } catch (e) {}

    const local = localHistory.getHistory();
    setHistory([...local]);
    if (local.length) setSelectedCommit(local[0]);
  };

  const handleClear = () => {
    localHistory.clearHistory();
    setHistory([]);
    setSelectedCommit(null);
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "aerocli_history_transits.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="glass-panel rounded-lg border border-zinc-800 p-5 shadow-2xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-white" />
          <h2 className="font-bold text-sm text-white">Local Agent Transit History & Commit Tracker</h2>
          <span className="text-xs px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded font-mono border border-zinc-700">
            .aerocli/history.json
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJson}
            disabled={history.length === 0}
            className="btn-monochrome-outline text-xs px-2.5 py-1 flex items-center gap-1.5 disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            Export JSON
          </button>

          <button
            onClick={handleRefresh}
            className="btn-monochrome-outline text-xs px-2.5 py-1 flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>

          <button
            onClick={handleClear}
            className="text-xs px-2.5 py-1 bg-zinc-900 text-zinc-400 border border-zinc-800 rounded hover:text-rose-400 hover:border-rose-900 transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear History
          </button>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-10 font-mono text-xs text-zinc-500">
          No transit history logged yet. Run an agent task to record commits in .aerocli/history.json.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Commit List */}
          <div className="space-y-2 border-r border-zinc-800 pr-3 max-h-[380px] overflow-y-auto">
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider block mb-2">
              Commit Transits ({history.length})
            </span>
            {history.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedCommit(item)}
                className={`p-3 rounded-md border text-xs cursor-pointer transition-all ${
                  selectedCommit?.id === item.id
                    ? 'bg-white text-black border-white font-medium shadow-md'
                    : 'bg-zinc-900/60 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-mono text-[11px] mb-1 font-bold">
                  <GitCommit className="w-3.5 h-3.5 text-zinc-400" />
                  {item.id}
                </div>
                <div className="font-semibold line-clamp-1">{item.commitMessage}</div>
                <div className="mt-1.5 text-[10px] opacity-70 font-mono">
                  {new Date(item.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          {/* Commit Details Viewer */}
          <div className="lg:col-span-2 space-y-4 font-mono text-xs">
            {selectedCommit ? (
              <>
                <div className="bg-zinc-950 p-3.5 rounded border border-zinc-800 space-y-2">
                  <div className="text-zinc-400 text-[11px] flex items-center justify-between">
                    <span className="flex items-center gap-1 text-white font-bold">
                      <GitCommit className="w-3.5 h-3.5 text-emerald-400" />
                      {selectedCommit.commitMessage}
                    </span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {selectedCommit.status}
                    </span>
                  </div>
                  <div className="text-zinc-300 text-xs pt-1 border-t border-zinc-900">
                    Prompt: "{selectedCommit.taskPrompt}"
                  </div>
                </div>

                {/* Plan Steps */}
                <div className="bg-zinc-950 p-3.5 rounded border border-zinc-800 space-y-2">
                  <span className="text-zinc-400 font-bold block mb-1">
                    Executed Plan Transit Steps
                  </span>
                  <div className="space-y-1.5">
                    {selectedCommit.executionPlan?.map((step, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-zinc-900/80 p-2 rounded border border-zinc-800">
                        <div className="flex items-center gap-2">
                          <FileCode className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Step {step.step}: {step.desc}</span>
                        </div>
                        <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded text-zinc-300 border border-zinc-700">
                          {step.action}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-zinc-500 text-center py-12">
                Select a commit transit to view JSON details.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
