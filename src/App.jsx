import React, { useState } from 'react';
import { ParticleBackground } from './components/ParticleBackground';
import { TerminalView } from './components/TerminalView';
import { BrowserPreview } from './components/BrowserPreview';
import { SessionDbViewer } from './components/SessionDbViewer';
import { LocalHistoryViewer } from './components/LocalHistoryViewer';
import { ArtifactPanel } from './components/ArtifactPanel';
import { SafetyConfirmationModal } from './components/SafetyConfirmationModal';
import { agentEngine } from './services/agentEngine';
import { Terminal, Database, FileText, Sparkles, Command, History } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('CONSOLE'); // 'CONSOLE' | 'DATABASE' | 'HISTORY' | 'ARTIFACTS'
  const [logs, setLogs] = useState([
    'AeroCLI v1.0.0 — Autonomous Terminal-to-Browser Agent Bridge',
    'Interactive Localhost Control Center online.',
    'Move your cursor around to interact with the particle background mesh floating behind text.',
    'Type a task prompt or click a quick preset to launch agent execution.'
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
    <div className="min-h-screen text-zinc-100 relative font-sans p-4 sm:p-6 space-y-2">
      {/* Granular Safety Confirmation Pop-up Modal */}
      <SafetyConfirmationModal
        pendingPrompt={pendingPrompt}
        onResolvePrompt={handleResolvePrompt}
      />

      {/* Fixed Fullscreen Particle Canvas Background */}
      <ParticleBackground />

      {/* Main Content Overlay directly floating on particles from top of screen */}
      <div className="relative z-10 max-w-7xl mx-auto space-y-3">
        {/* Header Bar */}
        <header className="glass-panel p-4 flex flex-col md:flex-row items-center justify-between gap-4 border border-zinc-800/80 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-white text-black flex items-center justify-center font-bold font-mono shadow-md shrink-0">
              <Command className="w-5 h-5" />
            </div>
            <div className="space-y-2px">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                AeroCLI
                <span className="text-xs font-mono font-normal px-2 py-0.5 bg-zinc-900/90 border border-zinc-700 text-zinc-300 rounded">
                  v1.0.0
                </span>
              </h1>
              <p className="text-xs text-zinc-400">
                Autonomous Terminal-to-Browser Agent Bridge
              </p>
            </div>
          </div>

          {/* Working Navigation Pills */}
          <nav className="flex items-center gap-2px bg-zinc-950/80 p-1 rounded-md border border-zinc-800/80 font-mono text-xs">
            <button
              onClick={() => setActiveTab('CONSOLE')}
              className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
                activeTab === 'CONSOLE'
                  ? 'bg-white text-black font-bold shadow'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              ⚡ Live Control
            </button>

            <button
              onClick={() => setActiveTab('DATABASE')}
              className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
                activeTab === 'DATABASE'
                  ? 'bg-white text-black font-bold shadow'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              💾 SQLite Session DB
            </button>

            <button
              onClick={() => setActiveTab('HISTORY')}
              className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
                activeTab === 'HISTORY'
                  ? 'bg-white text-black font-bold shadow'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              📜 Local History
            </button>

            <button
              onClick={() => setActiveTab('ARTIFACTS')}
              className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
                activeTab === 'ARTIFACTS'
                  ? 'bg-white text-black font-bold shadow'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              📄 Artifact Inspector
            </button>
          </nav>
        </header>

        {/* Quick Task Presets with 2px gaps */}
        <div className="glass-panel p-3 border border-zinc-800/80 flex flex-wrap items-center gap-2 font-mono text-xs">
          <span className="text-zinc-400 font-semibold flex items-center gap-1 pr-2 border-r border-zinc-800">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Quick Presets:
          </span>
          {presets.map((p, idx) => (
            <button
              key={idx}
              disabled={isExecuting}
              onClick={() => handleRunTask(p)}
              className="px-2.5 py-1 rounded bg-zinc-900/80 border border-zinc-800 text-zinc-300 hover:border-white hover:text-white transition-all disabled:opacity-40"
            >
              "{p}"
            </button>
          ))}
        </div>

        {/* Main Workspace Panels floating directly over particles */}
        <main className="space-y-4">
          {activeTab === 'CONSOLE' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
