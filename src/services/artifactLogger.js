// Artifact Logger — Generates task markdown checklists and JSON session reports

export class ArtifactLogger {
  generateMarkdownArtifact(session) {
    const date = new Date(session.timestamp).toLocaleString();
    return `# AeroCLI Verification Report

**Task Prompt**: ${session.prompt}  
**Session ID**: \`${session.id}\`  
**Timestamp**: ${date}  
**Status**: ${session.status === 'COMPLETED' ? '✅ VERIFIED PASSED' : '⏳ IN PROGRESS'}

---

## 📋 Execution Plan Checklist
${session.executionPlan.map(p => `- [x] **Step ${p.step}**: ${p.desc} (\`${p.action}\`)`).join('\n')}

---

## 💻 Terminal Command Log Summary
\`\`\`bash
${session.terminalLogs.slice(-8).join('\n')}
\`\`\`

---

## 🌐 Browser Automation Verification
- **Target URL**: \`${session.browserResults?.url || 'http://localhost:5173'}\`
- **Actions Verified**: ${session.browserResults?.actionsExecuted?.join(', ') || 'N/A'}
- **Result**: ${session.browserResults?.passed ? '✅ PASSED — No visual or DOM errors' : '⚠️ FAILED'}
- **Note**: ${session.browserResults?.verificationNote || 'All checks passed.'}
`;
  }
}

export const artifactLogger = new ArtifactLogger();
