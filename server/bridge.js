import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const app = express();
app.use(cors());
app.use(express.json());

const HISTORY_FILE = path.join(ROOT_DIR, '.aerocli', 'history.json');
const ARTIFACTS_DIR = path.join(ROOT_DIR, '.aerocli', 'artifacts');

if (!fs.existsSync(path.join(ROOT_DIR, '.aerocli'))) {
  fs.mkdirSync(path.join(ROOT_DIR, '.aerocli'), { recursive: true });
}
if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}
if (!fs.existsSync(HISTORY_FILE)) {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify([], null, 2), 'utf-8');
}

// REAL FILE WRITING BRIDGE
app.post('/api/write-file', (req, res) => {
  try {
    const { filepath, content } = req.body;
    if (!filepath || content === undefined) {
      return res.status(400).json({ error: 'filepath and content are required' });
    }

    const fullPath = path.isAbsolute(filepath)
      ? filepath
      : path.join(ROOT_DIR, filepath);

    if (!fullPath.startsWith(ROOT_DIR)) {
      return res.status(403).json({ error: 'Cannot write files outside workspace root' });
    }

    const parentDir = path.dirname(fullPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    fs.writeFileSync(fullPath, content, 'utf-8');
    console.log(`[REAL_FILE_WRITER] Successfully generated physical file: ${fullPath}`);

    res.json({
      success: true,
      message: `Physically generated file at ${path.relative(ROOT_DIR, fullPath)}`,
      path: fullPath
    });
  } catch (err) {
    console.error('[REAL_FILE_WRITER_ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/history', (req, res) => {
  try {
    const data = fs.readFileSync(HISTORY_FILE, 'utf-8');
    res.json(JSON.parse(data));
  } catch (err) {
    res.json([]);
  }
});

app.post('/api/save-history', (req, res) => {
  try {
    const { taskPrompt, executionPlan, commitMessage, status } = req.body;
    const history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));

    const entry = {
      id: `commit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      taskPrompt,
      commitMessage: commitMessage || `feat(agent): ${taskPrompt}`,
      executionPlan,
      status: status || 'VERIFIED_PASSED'
    };

    history.unshift(entry);
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf-8');

    const artifactPath = path.join(ARTIFACTS_DIR, `${entry.id}.md`);
    const markdownContent = `# AeroCLI Task Transit Artifact\n\n**Commit**: ${entry.commitMessage}\n**Task**: ${taskPrompt}\n**Date**: ${entry.timestamp}\n**Status**: ${entry.status}\n\n## Execution Plan\n` +
      executionPlan.map(p => `- [x] Step ${p.step}: ${p.desc} (${p.action})`).join('\n');

    fs.writeFileSync(artifactPath, markdownContent, 'utf-8');

    res.json({ success: true, entry });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`[AeroCLI Backend Bridge] Express server running on http://localhost:${PORT}`);
});
