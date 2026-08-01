# AeroCLI — Terminal-to-Browser Agent Bridge

AeroCLI connects black-and-white CLI commands with live browser automation. It enables AI agents to generate code, execute terminal commands safely with interactive dry-run permissions, drive headless browser tests, and log verification artifacts into a local SQLite database.

---

## 🌟 Key Features

1. 🌌 **Interactive Mouse-Particle Background**: Built with HTML5 Canvas spring physics where white particles float in pitch-black space and repel dynamically as you move your cursor.
2. 💻 **Black-and-White Terminal Execution Engine**: Emulates shell command streams with safety permission controls.
3. 🛡️ **Dry-Run Safety Permission Prompt**: Interactive terminal safety gate pausing before command execution with 3 options:
   - `[Y]es`: Authorize single command execution.
   - `[N]o`: Deny execution.
   - `[T]urbo`: Auto-approve all remaining session commands.
4. 🗄️ **SQLite Session Database (`src/sessionDb.js`)**: Persistent SQLite-compatible session store keeping track of past task runs, generated JSON execution plans, terminal output logs, and browser automation test results.
5. 🧪 **Mock Fallback LLM Mode (`MOCK_AI=true`)**: Environment toggle allowing full offline execution with realistic pre-scripted JSON plans, terminal logs, and browser automation steps without needing an external API key.
6. 🌐 **Browser Automation Bridge**: Playwright/Puppeteer automation simulator highlighting DOM elements, clicking buttons, and taking verification screenshot snapshots.

---

## 🚀 Quick Start

### 1. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Launch Localhost Web Control Center
\`\`\`bash
npm run dev
\`\`\`
Open `http://localhost:5173` in your browser.

### 3. Run via CLI Binary
\`\`\`bash
./bin/aerocli.js run "Add dark mode toggle and verify"
\`\`\`

---

## 📁 Repository Structure

\`\`\`
agentcli/
├── bin/
│   └── aerocli.js          # Executable command-line binary
├── src/
│   ├── components/
│   │   ├── ParticleBackground.jsx   # Mouse-interactive HTML5 particle canvas
│   │   ├── TerminalView.jsx         # Retro black/white terminal with Dry-Run safety prompt
│   │   ├── BrowserPreview.jsx       # Headless browser automation live viewport
│   │   ├── SessionDbViewer.jsx      # SQLite session database log explorer
│   │   └── ArtifactPanel.jsx        # Task checklist & markdown report inspector
│   ├── services/
│   │   ├── sessionDb.js             # SQLite local storage database engine
│   │   ├── terminalRunner.js        # Terminal runner & permission gate
│   │   ├── browserBridge.js         # Playwright browser controller
│   │   ├── artifactLogger.js        # Markdown task checklist generator
│   │   └── agentEngine.js           # Agent planner with MOCK_AI=true toggle
│   ├── App.jsx                      # Main Web Application
│   ├── main.jsx                     # Vite React entry point
│   └── index.css                    # Monochrome black and white stylesheet
├── index.html                       # Base HTML file
├── vite.config.js                   # Vite configuration
├── package.json
└── README.md                        # Documentation
\`\`\`
