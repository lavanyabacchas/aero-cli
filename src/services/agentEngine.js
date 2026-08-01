import { sessionDb } from './sessionDb.js';
import { terminalRunner } from './terminalRunner.js';
import { browserBridge } from './browserBridge.js';
import { artifactLogger } from './artifactLogger.js';

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

    if (p.includes('dark mode') || p.includes('theme')) {
      return [
        { step: 1, action: 'CREATE_FILE', target: 'src/components/DarkModeToggle.jsx', desc: 'Create dark mode toggle component' },
        { step: 2, action: 'TERMINAL_EXEC', command: 'npm install lucide-react', desc: 'Install icons dependency' },
        { step: 3, action: 'TERMINAL_EXEC', command: 'npm test -- --grep DarkMode', desc: 'Run unit test for dark toggle' },
        {
          step: 4, action: 'BROWSER_AUTOMATE', desc: 'Automate browser check on localhost:5173', steps: [
            { action: 'NAVIGATE', targetUrl: 'http://localhost:5173' },
            { action: 'CLICK', selector: '#dark-mode-btn' },
            { action: 'ASSERT', selector: '.dark-mode-active' }
          ]
        }
      ];
    } else if (p.includes('test') || p.includes('verify')) {
      return [
        { step: 1, action: 'TERMINAL_EXEC', command: 'npm test', desc: 'Execute Vitest test suite' },
        {
          step: 2, action: 'BROWSER_AUTOMATE', desc: 'Verify app rendering in browser', steps: [
            { action: 'NAVIGATE', targetUrl: 'http://localhost:5173' },
            { action: 'ASSERT', selector: 'header' }
          ]
        }
      ];
    }

    // Default versatile plan
    return [
      { step: 1, action: 'CREATE_FILE', target: 'src/features/AgentFeature.jsx', desc: 'Generate requested component feature' },
      { step: 2, action: 'TERMINAL_EXEC', command: 'npm run build', desc: 'Validate build compilation' },
      {
        step: 3, action: 'BROWSER_AUTOMATE', desc: 'Automate browser navigation and action clicks', steps: [
          { action: 'NAVIGATE', targetUrl: 'http://localhost:5173' },
          { action: 'CLICK', selector: '[data-testid="main-btn"]' },
          { action: 'ASSERT', selector: '.success-badge' }
        ]
      }
    ];
  }

  async runAgentTask(prompt, { onLog, onPlanReady, onPermissionPrompt, onBrowserUpdate, onComplete }) {
    // 1. Create SQLite Session
    const session = sessionDb.createSession(prompt, this.mockMode ? 'MOCK_AI' : 'LIVE_LLM');
    onLog?.(`[AeroCLI Agent Engine] Initialized Session ID: ${session.id} (Mode: ${this.mockMode ? 'MOCK_AI=true' : 'LIVE_AI'})`);

    // 2. Generate JSON Implementation Plan
    await new Promise(r => setTimeout(r, 400));
    const plan = this.generatePlan(prompt);
    sessionDb.updateSession(session.id, { executionPlan: plan });
    onPlanReady?.(plan);
    onLog?.(`[AeroCLI Plan Generator] Created ${plan.length}-step execution plan for: "${prompt}"`);

    // 3. Execute Plan Steps
    for (let i = 0; i < plan.length; i++) {
      const stepItem = plan[i];
      onLog?.(`\n--- Step ${stepItem.step}/${plan.length}: ${stepItem.desc} ---`);

      if (stepItem.action === 'CREATE_FILE') {
        onLog?.(`[FILE_SYSTEM] Saved file: ${stepItem.target}`);
        sessionDb.addTerminalLog(session.id, `[FILE_SYSTEM] Wrote file ${stepItem.target}`);
        await new Promise(r => setTimeout(r, 500));
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
        const browserResults = await browserBridge.runAutomationSuite(
          stepItem.steps,
          (idx, step) => onBrowserUpdate?.(idx, step)
        );

        sessionDb.updateSession(session.id, { browserResults });
        onLog?.(`[BROWSER_BRIDGE] ${browserResults.verificationNote}`);
      }
    }

    // 4. Wrap up session & generate Markdown Artifact
    const updatedSession = sessionDb.getSessionById(session.id);
    sessionDb.updateSession(session.id, { status: 'COMPLETED' });

    const markdownArtifact = artifactLogger.generateMarkdownArtifact(updatedSession);
    onLog?.(`\n[AeroCLI] Task "${prompt}" COMPLETED SUCCESSFULLY! Artifact checklist generated.`);
    onComplete?.({ session: updatedSession, markdownArtifact });

    return updatedSession;
  }
}

export const agentEngine = new AgentEngine();
