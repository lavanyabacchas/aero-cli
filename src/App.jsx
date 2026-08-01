import React, { useState } from 'react';
import { ParticleBackground } from './components/ParticleBackground';
import { TerminalView } from './components/TerminalView';
import { BrowserPreview } from './components/BrowserPreview';
import { SessionDbViewer } from './components/SessionDbViewer';
import { LocalHistoryViewer } from './components/LocalHistoryViewer';
import { ArtifactPanel } from './components/ArtifactPanel';
import { SafetyConfirmationModal } from './components/SafetyConfirmationModal';
import { agentEngine } from './services/agentEngine';
import { Terminal, Database, FileText, Sparkles, Command, History, Layers } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('CONSOLE'); // 'CONSOLE' | 'DATABASE' | 'HISTORY' | 'ARTIFACTS'
  const [logs, setLogs] = useState([
    'AeroCLI v1.0.0 — Autonomous Terminal-to-Browser Agent Bridge',
    'Translucent Control Center online. Cursor particle physics enabled everywhere.',
    'Click top tabs to switch between Live Control, SQLite Session DB, Local History, and Artifact Inspector.',
    'Type a task prompt or click a quick preset to execute real file writing & verification.'
  ]);

  const [pendingPrompt, setPendingPrompt] = useState(null);
  const [pendingResolver, setPendingResolver] = useState(null);
  const [executionPlan, setExecutionPlan] = useState([]);
  const [currentBrowserStep, setCurrentBrowserStep] = useState(null);
  const [browserResults, setBrowserResults] = useState(null);
  const [markdownArtifact, setMarkdownArtifact] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [mockMode, setMockMode] = useState(true);
  const [currentTaskPrompt, setCurrentTaskPrompt] = useState('');

  const presets = [
    'Create a contact form with email validation',
    'Add dark mode toggle to navigation bar and verify',
    'Run Vitest test suite and check homepage rendering'
  ];

  const handleRunTask = async (taskPrompt) => {
    if (isExecuting) return;
    setIsExecuting(true);
    setCurrentTaskPrompt(taskPrompt);
    setLogs((prev) => [...prev, `\n$ aerocli run "${taskPrompt}"`]);
    setBrowserResults(null);
    setCurrentBrowserStep(null);

    agentEngine.setMockMode(mockMode);

    await agentEngine.runAgentTask(taskPrompt, {
      onLog: (line) => {
        setLogs((prev) => [...prev, line]);
      },
      onPlanReady: (plan) => {
        setExecutionPlan(plan);
      },
      onPermissionPrompt: (cmd) => {
        return new Promise((resolve) => {
          setPendingPrompt({ command: cmd });
          setPendingResolver(() => (choice) => {
            setPendingPrompt(null);
            resolve(choice);
          });
        });
      },
      onBrowserUpdate: (idx, step) => {
        setCurrentBrowserStep(step);
      },
      onComplete: ({ session, markdownArtifact: md }) => {
        setBrowserResults(session.browserResults);
        setMarkdownArtifact(md);
        setIsExecuting(false);
      }
    });
  };

  const handleResolvePrompt = (choice) => {
    if (pendingResolver) {
      pendingResolver(choice);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505]/90 text-zinc-100 relative font-sans p-6 sm:p-8 space-y-8">
      {/* Granular Safety Confirmation Pop-up Modal */}
      <SafetyConfirmationModal
        pendingPrompt={pendingPrompt}
        onResolvePrompt={handleResolvePrompt}
      />

      {/* Interactive Translucent Canvas Particle Background */}
      <ParticleBackground />

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        {/* Header Bar */}
        <header className="glass-panel rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-6 border border-zinc-800 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-white text-black flex items-center justify-center font-bold font-mono shadow-xl shrink-0">
              <Command className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                AeroCLI
                <span className="text-xs font-mono font-normal px-2.5 py-0.5 bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-md">
                  v1.0.0
                </span>
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Autonomous Terminal-to-Browser Agent Bridge
              </p>
            </div>
          </div>

          {/* Working Top Navigation Pills */}
          <nav className="flex items-center gap-2 bg-zinc-950/80 p-1.5 rounded-lg border border-zinc-800 font-mono text-xs">
            <button
              onClick={() => setActiveTab('CONSOLE')}
              className={`px-3.5 py-2 rounded-md transition-all flex items-center gap-2 ${
                activeTab === 'CONSOLE'
                  ? 'bg-white text-black font-bold shadow-lg scale-[1.02]'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              ⚡ Live Control
            </button>

            <button
              onClick={() => setActiveTab('DATABASE')}
              className={`px-3.5 py-2 rounded-md transition-all flex items-center gap-2 ${
                activeTab === 'DATABASE'
                  ? 'bg-white text-black font-bold shadow-lg scale-[1.02]'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-zinc-400" />
              💾 SQLite Session DB
            </button>

            <button
              onClick={() => setActiveTab('HISTORY')}
              className={`px-3.5 py-2 rounded-md transition-all flex items-center gap-2 ${
                activeTab === 'HISTORY'
                  ? 'bg-white text-black font-bold shadow-lg scale-[1.02]'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              📜 Local History
            </button>

            <button
              onClick={() => setActiveTab('ARTIFACTS')}
              className={`px-3.5 py-2 rounded-md transition-all flex items-center gap-2 ${
                activeTab === 'ARTIFACTS'
                  ? 'bg-white text-black font-bold shadow-lg scale-[1.02]'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              📄 Artifact Inspector
            </button>
          </nav>
        </header>

        {/* Quick Task Presets with 2px/8px Spacing */}
        <div className="glass-panel rounded-lg p-4 border border-zinc-800/80 flex flex-wrap items-center gap-3 font-mono text-xs">
          <span className="text-zinc-400 font-semibold flex items-center gap-1.5 pr-2 border-r border-zinc-800">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Quick Presets:
          </span>
          {presets.map((p, idx) => (
            <button
              key={idx}
              disabled={isExecuting}
              onClick={() => handleRunTask(p)}
              className="px-3 py-1.5 rounded-md bg-zinc-900/90 border border-zinc-700/80 text-zinc-200 hover:border-white hover:text-white transition-all disabled:opacity-40 shadow-sm"
            >
              "{p}"
            </button>
          ))}
        </div>

        {/* View Switching Container with Spacious 24px Gaps */}
        <main className="space-y-8">
          {activeTab === 'CONSOLE' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <TerminalView
                logs={logs}
                pendingPrompt={pendingPrompt}
                onResolvePrompt={handleResolvePrompt}
                onRunPrompt={handleRunTask}
                isExecuting={isExecuting}
                mockMode={mockMode}
                setMockMode={setMockMode}
              />

              <BrowserPreview
                currentStep={currentBrowserStep}
                results={browserResults}
                isExecuting={isExecuting}
              />
            </div>
          )}

          {activeTab === 'DATABASE' && <SessionDbViewer />}

          {activeTab === 'HISTORY' && <LocalHistoryViewer />}

          {activeTab === 'ARTIFACTS' && (
            <ArtifactPanel
              markdownArtifact={markdownArtifact}
              executionPlan={executionPlan}
              browserResults={browserResults}
              taskPrompt={currentTaskPrompt}
            />
          )}
        </main>
      </div>
    </div>
  );
}
