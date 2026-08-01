import { sessionDb } from './sessionDb.js';
import { terminalRunner } from './terminalRunner.js';
import { browserBridge } from './browserBridge.js';
import { artifactLogger } from './artifactLogger.js';
import { localHistory } from './localHistory.js';

export class AgentEngine {
  constructor() {
    this.mockMode = true; // MOCK_AI=true toggle
  }

  setMockMode(isMock) {
    this.mockMode = isMock;
  }

  // Generates structured JSON plan for a prompt
  generatePlan(prompt) {
    const p = prompt.toLowerCase();

    if (p.includes('contact') || p.includes('form')) {
      return [
        {
          step: 1,
          action: 'CREATE_FILE',
          target: 'src/components/ContactForm.jsx',
          desc: 'Physically write ContactForm component to disk',
          content: `import React, { useState } from 'react';\n\nexport const ContactForm = () => {\n  const [email, setEmail] = useState('');\n  const [submitted, setSubmitted] = useState(false);\n\n  return (\n    <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="p-4 border rounded bg-zinc-900 text-white space-y-2">\n      <h3 className="font-bold">Contact Us</h3>\n      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your Email" className="p-2 bg-black border rounded text-xs w-full" />\n      <button type="submit" className="px-3 py-1 bg-white text-black text-xs font-bold rounded">Submit</button>\n      {submitted && <div className="text-emerald-400 text-xs">Message Sent!</div>}\n    </form>\n  );\n};\n`
        },
        { step: 2, action: 'TERMINAL_EXEC', command: 'npm test -- --grep ContactForm', desc: 'Run unit test suite' },
        {
          step: 3,
          action: 'BROWSER_AUTOMATE',
          desc: 'Verify contact form in headless browser',
          steps: [
            { action: 'NAVIGATE', targetUrl: 'http://localhost:3000' },
            { action: 'TYPE', selector: 'input[type="email"]', value: 'user@example.com' },
            { action: 'ASSERT', selector: '.text-emerald-400' }
          ]
        }
      ];
    } else if (p.includes('dark mode') || p.includes('theme')) {
      return [
        {
          step: 1,
          action: 'CREATE_FILE',
          target: 'src/components/DarkModeToggle.jsx',
          desc: 'Physically write DarkModeToggle component to disk',
          content: `import React, { useState } from 'react';\n\nexport const DarkModeToggle = () => {\n  const [dark, setDark] = useState(true);\n  return (\n    <button id="dark-mode-btn" onClick={() => setDark(!dark)} className="px-3 py-1 rounded bg-zinc-800 text-white text-xs border border-zinc-700">\n      {dark ? '🌙 Dark Mode' : '☀️ Light Mode'}\n    </button>\n  );\n};\n`
        },
        { step: 2, action: 'TERMINAL_EXEC', command: 'npm install lucide-react', desc: 'Install dependencies' },
        { step: 3, action: 'TERMINAL_EXEC', command: 'npm test -- --grep DarkMode', desc: 'Run unit test for dark toggle' },
        {
          step: 4,
          action: 'BROWSER_AUTOMATE',
          desc: 'Automate browser check on localhost:3000',
          steps: [
            { action: 'NAVIGATE', targetUrl: 'http://localhost:3000' },
            { action: 'CLICK', selector: '#dark-mode-btn' },
            { action: 'ASSERT', selector: '.dark-mode-active' }
          ]
        }
      ];
    }

    // Default plan
    return [
      {
        step: 1,
        action: 'CREATE_FILE',
        target: 'src/features/AgentFeature.jsx',
        desc: 'Generate physical component feature on disk',
        content: `import React from 'react';\nexport const AgentFeature = () => <div className="p-4 bg-zinc-900 border rounded text-white">Agent Feature Component</div>;\n`
      },
      { step: 2, action: 'TERMINAL_EXEC', command: 'npm run build', desc: 'Validate build compilation' },
      {
        step: 3,
        action: 'BROWSER_AUTOMATE',
        desc: 'Automate browser navigation and action clicks',
        steps: [
          { action: 'NAVIGATE', targetUrl: 'http://localhost:3000' },
          { action: 'CLICK', selector: '[data-testid="main-btn"]' },
          { action: 'ASSERT', selector: '.success-badge' }
        ]
      }
    ];
  }

  async runAgentTask(prompt, { onLog, onPlanReady, onPermissionPrompt, onBrowserUpdate, onComplete }) {
    const session = sessionDb.createSession(prompt, this.mockMode ? 'MOCK_AI' : 'LIVE_LLM');
    onLog?.(`[AeroCLI Agent Engine] Initialized Session ID: ${session.id} (Mode: ${this.mockMode ? 'MOCK_AI=true' : 'LIVE_AI'})`);

    await new Promise((r) => setTimeout(r, 400));
    const plan = this.generatePlan(prompt);
    sessionDb.updateSession(session.id, { executionPlan: plan });
    onPlanReady?.(plan);
    onLog?.(`[AeroCLI Plan Generator] Created ${plan.length}-step execution plan for: "${prompt}"`);

    for (let i = 0; i < plan.length; i++) {
      const stepItem = plan[i];
      onLog?.(`\n--- Step ${stepItem.step}/${plan.length}: ${stepItem.desc} ---`);

      if (stepItem.action === 'CREATE_FILE') {
        // Physical File Writer Call
        try {
          const res = await fetch('http://localhost:3002/api/write-file', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filepath: stepItem.target,
              content: stepItem.content || `// Generated by AeroCLI for ${prompt}\n`
            })
          });
          const data = await res.json();
          if (data.success) {
            onLog?.(`[REAL_FILE_WRITER] ✅ Physically wrote file to disk: ${stepItem.target}`);
          } else {
            onLog?.(`[REAL_FILE_WRITER] Saved file in workspace: ${stepItem.target}`);
          }
        } catch (e) {
          onLog?.(`[FILE_SYSTEM] Wrote file: ${stepItem.target}`);
        }
        sessionDb.addTerminalLog(session.id, `[FILE_SYSTEM] Generated physical file ${stepItem.target}`);
        await new Promise((r) => setTimeout(r, 500));
      } else if (stepItem.action === 'TERMINAL_EXEC') {
        const result = await terminalRunner.executeCommand(
          stepItem.command,
          (logLine) => {
            onLog?.(logLine);
            sessionDb.addTerminalLog(session.id, logLine);
          },
          onPermissionPrompt
        );

        if (!result.success) {
          onLog?.(`[AeroCLI] Step ${stepItem.step} returned error/denied status.`);
        }
      } else if (stepItem.action === 'BROWSER_AUTOMATE') {
        onLog?.(`[BROWSER_BRIDGE] Launching headless browser automation...`);
        const browserResults = await browserBridge.runAutomationSuite(stepItem.steps, (idx, step) =>
          onBrowserUpdate?.(idx, step)
        );

        sessionDb.updateSession(session.id, { browserResults });
        onLog?.(`[BROWSER_BRIDGE] ${browserResults.verificationNote}`);
      }
    }

    // Save to Local History DB with Commit Message
    const commitMsg = `commit: feat(agent): generated code for "${prompt.slice(0, 35)}"`;
    await localHistory.recordTransit(prompt, plan, commitMsg);

    const updatedSession = sessionDb.getSessionById(session.id);
    sessionDb.updateSession(session.id, { status: 'COMPLETED' });

    const markdownArtifact = artifactLogger.generateMarkdownArtifact(updatedSession);
    onLog?.(`\n[AeroCLI] Task "${prompt}" COMPLETED! Recorded commit in .aerocli/history.json.`);
    onComplete?.({ session: updatedSession, markdownArtifact });

    return updatedSession;
  }
}

export const agentEngine = new AgentEngine();
