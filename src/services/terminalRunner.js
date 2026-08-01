// Safe Shell Execution Engine with Dry-Run Safety Permission Prompts

export class TerminalRunner {
  constructor() {
    this.turboMode = false;
    this.allowedCommands = ['npm test', 'npm run build', 'npm run dev', 'git status', 'ls', 'vite build'];
    this.blockedCommands = ['rm -rf /', 'drop table', 'shutdown', 'format'];
  }

  setTurboMode(enabled) {
    this.turboMode = enabled;
  }

  isCommandBlocked(commandStr) {
    return this.blockedCommands.some(blocked => commandStr.toLowerCase().includes(blocked));
  }

  // Requests permission before running command
  async requestPermission(commandStr, onPermissionPrompt) {
    if (this.isCommandBlocked(commandStr)) {
      return { status: 'BLOCKED', reason: 'Command blocked by security policy' };
    }

    if (this.turboMode) {
      return { status: 'APPROVED', mode: 'TURBO' };
    }

    if (typeof onPermissionPrompt === 'function') {
      // Pause execution and ask user for YES / NO / TURBO
      const userChoice = await onPermissionPrompt(commandStr);
      if (userChoice === 'TURBO') {
        this.turboMode = true;
        return { status: 'APPROVED', mode: 'TURBO' };
      } else if (userChoice === 'YES') {
        return { status: 'APPROVED', mode: 'SINGLE' };
      } else {
        return { status: 'DENIED', mode: 'SINGLE' };
      }
    }

    return { status: 'APPROVED', mode: 'DEFAULT' };
  }

  async executeCommand(commandStr, onLog, onPermissionPrompt) {
    onLog?.(`$ ${commandStr}`);

    const permResult = await this.requestPermission(commandStr, onPermissionPrompt);

    if (permResult.status === 'BLOCKED') {
      onLog?.(`[SAFETY_ALERT] ❌ Command execution blocked: Dangerous system command detected.`);
      return { success: false, output: 'Blocked by AeroCLI security rules' };
    }

    if (permResult.status === 'DENIED') {
      onLog?.(`[PERMISSION_PROMPT] User DENIED execution of: "${commandStr}". Skipping step.`);
      return { success: false, output: 'Denied by user' };
    }

    if (permResult.mode === 'TURBO') {
      onLog?.(`[SAFETY_PROMPT] ⚡ [TURBO MODE ACTIVE] Auto-approved command: "${commandStr}"`);
    } else {
      onLog?.(`[SAFETY_PROMPT] ✅ User APPROVED command execution: "${commandStr}"`);
    }

    // Simulate Command Output for Web Demo
    await new Promise(r => setTimeout(r, 600));

    let output = '';
    if (commandStr.includes('npm test')) {
      output = `> aerocli@1.0.0 test\n> vitest run\n\n✓ src/app.test.js (3 tests passed)\nTest Files  1 passed (1)\nTests       3 passed (3)\nDuration    340ms`;
    } else if (commandStr.includes('npm install')) {
      output = `added 14 packages, and audited 180 packages in 1s\n32 packages are looking for funding`;
    } else if (commandStr.includes('npm run dev')) {
      output = `  VITE v6.0.7  ready in 210 ms\n  ➜  Local:   http://localhost:5173/\n  ➜  Network: use --host to expose`;
    } else {
      output = `[Command Executed Successfully] Output stream closed with exit code 0.`;
    }

    const lines = output.split('\n');
    for (const line of lines) {
      onLog?.(line);
    }

    return { success: true, output };
  }
}

export const terminalRunner = new TerminalRunner();
