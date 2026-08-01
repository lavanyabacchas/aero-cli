// Lightweight SQLite-style Session Store for AeroCLI
// Persists tasks, execution plans, terminal output logs, and browser automation test results.

const DB_STORAGE_KEY = 'aerocli_sqlite_sessions_v1';

class SessionDatabase {
  constructor() {
    this.sessions = this.loadFromDisk();
  }

  loadFromDisk() {
    try {
      const data = localStorage.getItem(DB_STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to load AeroCLI SQLite sessions from storage', e);
    }

    // Default Seed Data if DB is empty
    return [
      {
        id: 'session-1722510001',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        prompt: 'Add dark mode toggle to navigation bar and verify',
        status: 'COMPLETED',
        mode: 'MOCK_AI',
        executionPlan: [
          { step: 1, action: 'CREATE_FILE', target: 'src/components/DarkModeToggle.jsx', desc: 'Add toggle state hook' },
          { step: 2, action: 'TERMINAL_EXEC', command: 'npm test -- --grep DarkMode', desc: 'Run unit test suite' },
          { step: 3, action: 'BROWSER_AUTOMATE', url: 'http://localhost:5173', desc: 'Click toggle and verify HTML class' }
        ],
        terminalLogs: [
          '[AeroCLI] Initiating dry-run plan for task: Add dark mode toggle...',
          '[SAFETY_PROMPT] Command: "npm test -- --grep DarkMode" [ALLOW: YES (Turbo)]',
          'PASS  src/components/DarkModeToggle.test.jsx (0.42s)',
          '1 test passed, 0 failed.'
        ],
        browserResults: {
          url: 'http://localhost:5173',
          actionsExecuted: ['navigate', 'click("#dark-toggle")', 'assertHasClass("dark")'],
          passed: true,
          screenshotSnapshot: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          verificationNote: 'Verified HTML root received dark class attribute.'
        }
      }
    ];
  }

  saveToDisk() {
    try {
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(this.sessions));
    } catch (e) {
      console.error('Error saving SQLite DB to local storage', e);
    }
  }

  getAllSessions() {
    return this.sessions;
  }

  getSessionById(id) {
    return this.sessions.find(s => s.id === id);
  }

  createSession(prompt, mode = 'MOCK_AI') {
    const newSession = {
      id: `session-${Date.now()}`,
      timestamp: new Date().toISOString(),
      prompt,
      status: 'IN_PROGRESS',
      mode,
      executionPlan: [],
      terminalLogs: [`[AeroCLI] Created session for task: "${prompt}"`],
      browserResults: null
    };

    this.sessions.unshift(newSession);
    this.saveToDisk();
    return newSession;
  }

  updateSession(id, updates) {
    const idx = this.sessions.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.sessions[idx] = { ...this.sessions[idx], ...updates };
      this.saveToDisk();
    }
    return this.sessions[idx];
  }

  addTerminalLog(id, logLine) {
    const session = this.getSessionById(id);
    if (session) {
      session.terminalLogs.push(logLine);
      this.saveToDisk();
    }
  }

  clearHistory() {
    this.sessions = [];
    this.saveToDisk();
  }
}

export const sessionDb = new SessionDatabase();
