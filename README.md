# N2 Design v0.1

> Open-source interactive UI prototype studio from Noisy Neighbor Studio

A weekend-spike tool that harnesses local coding-agent CLIs (Claude Code, Codex, Grok) to rapidly generate, preview, and export UI prototypes with design-system fidelity.

**Status:** v0.1 (weekend spike) — functional prototype, not production-ready

---

## Features

- 🤖 **Multi-CLI Support** — Works with Claude Code, Codex CLI, and Grok CLI
- 💬 **Chat-Driven Generation** — Simple chat interface to guide AI agents
- 👁️ **Live Preview** — Sandboxed iframe preview of generated HTML
- 📁 **Project Management** — Create and manage multiple prototype projects
- 🎨 **Design System** — Built-in N2 Design system for tasteful defaults
- 📸 **Screenshot Export** — Automatic screenshot capture with project export
- 📦 **ZIP Export** — Export complete projects with source and screenshots

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Browser (Port 3000)                 │
│  ┌────────────┬─────────────┬──────────────────────┐   │
│  │  Project   │    Chat     │     Live Preview     │   │
│  │    List    │   Panel     │   (Sandboxed iframe) │   │
│  └────────────┴─────────────┴──────────────────────┘   │
│                         │                                │
│                         │ API Calls / SSE                │
│                         ▼                                │
└─────────────────────────────────────────────────────────┘
                          │
                          │
┌─────────────────────────────────────────────────────────┐
│                    Daemon (Port 3001)                    │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Express REST API                     │  │
│  │  • /api/projects  - CRUD for projects            │  │
│  │  • /api/cli       - CLI adapter detection        │  │
│  │  • /api/agent     - Execute tasks (SSE stream)   │  │
│  │  • /api/export    - ZIP export with screenshots  │  │
│  └───────────────────────────────────────────────────┘  │
│                         │                                │
│  ┌──────────────────┬──────────────────┬─────────────┐  │
│  │  ProjectService  │  CLIAdapterSvc   │ ExportSvc   │  │
│  │  • Create/CRUD   │  • Detect CLIs   │ • ZIP       │  │
│  │  • File I/O      │  • Spawn process │ • Screenshot│  │
│  │  • DESIGN.md     │  • Stream output │ • Playwright│  │
│  └──────────────────┴──────────────────┴─────────────┘  │
│                         │                                │
└─────────────────────────────────────────────────────────┘
                          │
                          │ spawn child process
                          ▼
┌─────────────────────────────────────────────────────────┐
│           Local Coding-Agent CLIs (on PATH)             │
│                                                          │
│    claude CLI        codex CLI         grok CLI         │
│  (if installed)    (if installed)   (if installed)      │
│                                                          │
│  Works in project directory, streams stdout/stderr      │
└─────────────────────────────────────────────────────────┘
```

### Key Components

#### Web UI (`apps/web`)
- Built with React + Vite
- Three-panel layout: Projects, Chat, Preview
- Real-time SSE streaming for agent output
- Sandboxed iframe for safe HTML preview

#### Daemon (`apps/daemon`)
- Node.js + Express backend
- Manages project filesystem
- Spawns and streams CLI processes
- Captures screenshots with Playwright
- Creates ZIP exports

#### CLI Adapters
- Detect available CLIs on system PATH
- Spawn child processes with project context
- Stream stdout/stderr to frontend via SSE
- Handle errors gracefully with helpful install hints

---

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- At least one CLI agent (see [CLI Setup](#cli-setup))

### Installation

```bash
# Clone the repository
git clone https://github.com/noisyneighborstudio/n2-design.git
cd n2-design

# Install dependencies
pnpm install

# Install Playwright browsers (for screenshots)
cd apps/daemon
npx playwright install chromium
cd ../..

# Start the dev servers
pnpm dev
```

This will start:
- Daemon on `http://localhost:3001`
- Web UI on `http://localhost:3000`

Open `http://localhost:3000` in your browser.

---

## CLI Setup

N2 Design works with three coding-agent CLIs. **You need at least one installed.**

### Claude Code

```bash
# Follow installation instructions at:
https://claude.ai/download
```

### Codex CLI

```bash
npm install -g @openai/codex-cli
# Configure with your OpenAI API key
```

### Grok CLI

```bash
# Follow installation instructions at:
https://grok.x.ai/cli
```

**Note:** On startup, the daemon will detect which CLIs are available and display their status in the web UI.

---

## Demo Walkthrough

### 1. Create a Project

1. Open `http://localhost:3000`
2. Click **New Project**
3. Enter a name (e.g., "Landing Page")
4. Optional: Add a description
5. Click **Create**

### 2. Select Your CLI

In the header, select an available CLI from the dropdown (shows ✓ for installed CLIs).

### 3. Generate Your Prototype

In the chat panel, describe what you want:

```
Create a modern landing page for a SaaS product with:
- Hero section with headline and CTA
- Features grid (3 columns)
- Pricing table
- Footer
Use the N2 Design system colors and spacing
```

Watch as the agent:
- Generates HTML/CSS files
- Streams output to the chat
- Updates the file list in real-time

### 4. Preview Live

The preview panel automatically shows generated HTML files. If multiple HTML files exist, switch between them with the dropdown.

### 5. Regenerate or Refine

Send follow-up messages to refine:

```
Make the hero section larger and add a background gradient
```

The agent will update the files, and the preview refreshes automatically.

### 6. Export

Click **Export ZIP** to download a package containing:
- All source files
- `DESIGN.md` with design system
- `screenshots/` folder with full-page captures

---

## Project Structure

```
n2-design/
├── apps/
│   ├── daemon/              # Backend server
│   │   ├── src/
│   │   │   ├── cli-adapters/    # CLI detection & execution
│   │   │   ├── routes/          # Express routes
│   │   │   ├── services/        # Business logic
│   │   │   ├── types/           # TypeScript types
│   │   │   └── index.ts         # Server entry
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web/                 # Frontend UI
│       ├── src/
│       │   ├── components/      # React components
│       │   ├── lib/             # API client
│       │   ├── types/           # TypeScript types
│       │   └── main.tsx         # App entry
│       ├── index.html
│       ├── package.json
│       └── vite.config.ts
│
├── templates/
│   └── starters/
│       └── n2-default/      # Default project template
│           ├── DESIGN.md        # N2 Design system
│           └── index.html       # Starter HTML
│
├── package.json             # Root package
├── pnpm-workspace.yaml      # Workspace config
└── README.md                # This file
```

---

## Available Scripts

```bash
# Development
pnpm dev          # Start daemon + web in parallel
pnpm build        # Build all packages
pnpm test         # Run all tests
pnpm lint         # Lint all packages
pnpm clean        # Remove node_modules and build outputs

# Per-package
cd apps/daemon
pnpm dev          # Start daemon only
pnpm test         # Run daemon tests

cd apps/web
pnpm dev          # Start web UI only
pnpm build        # Build for production
```

---

## Design Philosophy

N2 Design follows these principles:

1. **Design Taste** — No generic AI slop. Tasteful defaults via DESIGN.md
2. **Design-System Fidelity** — Built-in N2 system, extensible per-project
3. **Simplicity** — Simpler OSS alternative to complex tools
4. **Local-First** — Your CLIs, your machine, your data
5. **Weekend Spike Quality** — Functional prototype, not production software

### DESIGN.md Convention

Every project includes a `DESIGN.md` file with:
- Typography scale and font stacks
- Color palette
- Spacing and layout grid
- Component patterns
- Interaction guidelines
- Accessibility standards

This file guides the AI agents to generate consistent, tasteful output.

---

## Limitations (v0.1)

This is a weekend spike. Known limitations:

- **No canvas editing** — Chat + regenerate only (no drag/drop, comments, sliders)
- **No multi-file projects** — Best for single-page prototypes
- **No version control** — No git integration, no history
- **No GitHub imports** — DESIGN.md only from local files
- **No deck/PDF/video** — HTML/CSS prototypes only
- **Linux CI only** — Tests run on Linux (macOS/Windows untested)
- **No user auth** — Local-only, single-user

---

## Testing

```bash
# Run all tests
pnpm test

# Run daemon tests only
cd apps/daemon
pnpm test

# Run in watch mode
pnpm test:watch
```

Tests cover:
- Project CRUD operations
- File I/O
- CLI adapter detection
- Export ZIP contents

**Note:** Screenshot tests require Playwright browsers installed.

---

## Troubleshooting

### CLI not detected

**Problem:** Dropdown shows "✗" for a CLI you've installed

**Solution:**
1. Verify the CLI is on your PATH: `which claude` (or `codex`, `grok`)
2. Restart the daemon
3. Check daemon logs for errors

### Preview not updating

**Problem:** Changes don't appear in preview

**Solution:**
1. Check that HTML files are in `src/` directory
2. Refresh the browser
3. Check browser console for iframe errors

### Export fails

**Problem:** "Export failed" error

**Solution:**
1. Ensure Playwright is installed: `npx playwright install chromium`
2. Check that project has generated HTML files
3. Verify daemon has write permissions

### Daemon won't start

**Problem:** Port 3001 already in use

**Solution:**
```bash
# Find and kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or set custom port
PORT=3002 pnpm --filter @n2-design/daemon dev
```

---

## Contributing

This is a Noisy Neighbor Studio internal project, but we welcome issues and PRs.

### Development Setup

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Lint
pnpm lint

# Build
pnpm build
```

### Coding Standards

- TypeScript strict mode
- ESLint with recommended rules
- Meaningful commit messages
- Tests for new features

---

## Roadmap

Future ideas (not committed):

- [ ] Canvas editing mode with drag/drop
- [ ] Version history with git integration
- [ ] GitHub import for design systems
- [ ] Team collaboration features
- [ ] More export formats (Figma, PDF)
- [ ] Built-in component library
- [ ] More CLI adapters (Copilot, etc.)

---

## License

MIT — see [LICENSE](LICENSE) file

---

## Credits

Built with:
- React + Vite
- Node.js + Express
- Playwright
- TypeScript
- pnpm

Made by [Noisy Neighbor Studio](https://noisyneighborstudio.com)

---

## Support

- Issues: [GitHub Issues](https://github.com/noisyneighborstudio/n2-design/issues)
- Discussions: [GitHub Discussions](https://github.com/noisyneighborstudio/n2-design/discussions)

**This is a weekend spike — expect rough edges!**
