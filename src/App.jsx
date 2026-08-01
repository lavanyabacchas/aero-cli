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
    'Move your cursor around to interact with the particle background mesh.',
    'Type a task below or click a quick preset to launch real file generation & verification.'
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
            resolve(choice); // 'YES' | 'NO' | 'TURBO'
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
    <div className="min-h-screen bg-[#050505] text-zinc-100 relative font-sans">
      {/* Granular Safety Confirmation Pop-up Modal */}
      <SafetyConfirmationModal
        pendingPrompt={pendingPrompt}
        onResolvePrompt={handleResolvePrompt}
      />

      {/* Interactive Mouse Particle Canvas */}
      <ParticleBackground />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Header Bar */}
        <header className="glass-panel rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-white text-black flex items-center justify-center font-bold font-mono shadow-lg">
              <Command className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                AeroCLI
                <span className="text-xs font-mono font-normal px-2 py-0.5 bg-zinc-900 border border-zinc-700 text-zinc-300 rounded">
                  v1.0.0
                </span>
              </h1>
              <p className="text-xs text-zinc-400">
                Autonomous Terminal-to-Browser Agent Bridge
              </p>
            </div>
          </div>

          {/* Navigation Pills */}
          <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-md border border-zinc-800 font-mono text-xs">
            <button
              onClick={() => setActiveTab('CONSOLE')}
              className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
                activeTab === 'CONSOLE'
                  ? 'bg-white text-black font-bold shadow'
                  : 'text-zinc-400 hover:text-white'
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
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              💾 SQLite DB
            </button>

            <button
              onClick={() => setActiveTab('HISTORY')}
              className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
                activeTab === 'HISTORY'
                  ? 'bg-white text-black font-bold shadow'
                  : 'text-zinc-400 hover:text-white'
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
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              📄 Artifact Inspector
            </button>
          </div>
        </header>

        {/* Quick Task Presets */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <span className="text-zinc-500 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Quick Presets:
          </span>
          {presets.map((p, idx) => (
            <button
              key={idx}
              disabled={isExecuting}
              onClick={() => handleRunTask(p)}
              className="px-2.5 py-1 rounded bg-zinc-900/80 border border-zinc-800 text-zinc-300 hover:border-zinc-600 hover:text-white transition-all disabled:opacity-40"
            >
              "{p}"
            </button>
          ))}
        </div>

        {/* View Switching */}
        {activeTab === 'CONSOLE' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
      </div>
    </div>
  );
}
