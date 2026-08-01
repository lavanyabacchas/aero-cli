// Local History & Section Tracker Service

const HISTORY_KEY = 'aerocli_local_history_v1';

class LocalHistoryService {
  constructor() {
    this.history = this.loadLocal();
  }

  loadLocal() {
    try {
      const data = localStorage.getItem(HISTORY_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed to load local history from localStorage', e);
    }
    return [
      {
        id: 'commit-1722511000',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        taskPrompt: 'Create a contact form with email validation',
        commitMessage: 'commit: feat(agent): generated ContactForm.jsx & validated state hooks',
        status: 'VERIFIED_PASSED',
        executionPlan: [
          { step: 1, action: 'CREATE_FILE', target: 'src/components/ContactForm.jsx', desc: 'Create physical contact form component' },
          { step: 2, action: 'TERMINAL_EXEC', command: 'npm test -- --grep ContactForm', desc: 'Run unit test suite' },
          { step: 3, action: 'BROWSER_AUTOMATE', targetUrl: 'http://localhost:3000', desc: 'Verify form input in headless browser' }
        ]
      }
    ];
  }

  saveLocal() {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(this.history));
    } catch (e) {
      console.error('Error saving history to localStorage', e);
    }
  }

  getHistory() {
    return this.history;
  }

  async recordTransit(taskPrompt, executionPlan, customCommitMsg) {
    const commitMsg = customCommitMsg || `commit: feat(agent): executed "${taskPrompt.slice(0, 45)}"`;

    const entry = {
      id: `commit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      taskPrompt,
      commitMessage: commitMsg,
      status: 'VERIFIED_PASSED',
      executionPlan
    };

    this.history.unshift(entry);
    this.saveLocal();

    // Call real Express backend API if active
    try {
      await fetch('http://localhost:3002/api/save-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
    } catch (e) {
      // Backend optional fallback
    }

    return entry;
  }

  clearHistory() {
    this.history = [];
    this.saveLocal();
  }
}

export const localHistory = new LocalHistoryService();
