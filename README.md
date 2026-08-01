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

## 📁 Repository Structure

What is "AeroCLI" (Terminal-to-Browser Agent Bridge)?In layman's language, imagine you have a robot software assistant living on your computer. Instead of you having to manually type commands, open a browser, click buttons, and check if your code works, AeroCLI acts as the bridge that connects your computer's black-and-white terminal directly to a live browser window controlled by an AI agent.How it helps the user (The Problem & Solution):The Pain Point: Normally, when you ask an AI to code a feature, it writes the text, but you have to manually copy it, save the file, go to your terminal, type npm run dev, open Chrome, click around, realize there's a bug, look at the error log, and go back to the AI. It's a lot of tedious context-switching.The AeroCLI Solution: You give a single natural-language command to your tool (e.g., "Add a dark mode toggle to the settings page and verify it works"). The agent uses AeroCLI to:Write and save the code automatically.Open the terminal behind the scenes to spin up your local app server.Launch a headless browser window to click the toggle button itself.Look at the screen (via automated screenshots or logs) to confirm there are no visual bugs, and report back: "Done, and I verified it works."  How to Build It inside an "Antigravity" ArchitectureSince you want to build this locally just for your Git portfolio (no deployment needed), you can structure it as a local Node.js or Python CLI tool that taps into local developer tools and a lightweight browser automation library.Here is how the architecture fits together:1. The Core Components You Need to Code:The CLI Entry Point (bin/aerocli.js or Python cli.py):Allows you to run commands from your terminal like: aerocli run "Fix the login button alignment".The Terminal Execution Engine:A safe wrapper script that lets the AI trigger safe commands (like npm test or npm run build) while blocking dangerous system commands using a permission checker (just like Antigravity's security rules).The Browser Automation Bridge:Uses a tool like Playwright or Puppeteer (industry-standard libraries for driving web browsers with code). The AI agent writes mini-scripts to open your local web app, click elements, and take a screenshot if something fails.The Artifact Logger:Instead of flooding your terminal with messy walls of text, it saves a neat summary folder locally (a markdown task checklist, terminal output logs, and a snapshot screenshot) so you can review what the agent did.2. Suggested Directory Structure for Your Git Repo:Plaintextaerocli/


├── bin/
│   └── aerocli              # The command-line executable script
├── src/
│   ├── agent.js             # Core logic connecting to an LLM API
│   ├── terminalRunner.js    # Safely executes shell commands
│   ├── browserBridge.js     # Playwright/Puppeteer script runner
│   └── artifactLogger.js    # Saves local JSON plans and screenshots
├── package.json
└── README.md                # Exceptional documentation with a GIF demo
