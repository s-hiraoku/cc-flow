# CC-Flow: Claude Code Workflow Platform

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/s-hiraoku/cc-flow)

```
   ██████╗ ██████╗       ███████╗██╗      ██████╗ ██╗    ██╗
  ██╔════╝██╔════╝      ██╔════╝██║     ██╔═══██╗██║    ██║
  ██║     ██║     █████╗█████╗  ██║     ██║   ██║██║ █╗ ██║
  ██║     ██║     ╚════╝██╔══╝  ██║     ██║   ██║██║███╗██║
  ╚██████╗╚██████╗      ██║     ███████╗╚██████╔╝╚███╔███╔╝
   ╚═════╝ ╚═════╝      ╚═╝     ╚══════╝ ╚═════╝  ╚══╝╚══╝
```

🚀 **Build Claude Code workflows from both a modern terminal UI and a visual web editor.**

> **Latest (2025-10-12):** `@hiraoku/cc-flow-web` v0.1.2 adds dynamic Step Group sizing, automatic drop-zone handling, and parallel group fixes. `@hiraoku/cc-flow-cli` v0.1.1 ships POML-powered workflow generation with a fully interactive Ink TUI.

CC-Flow is an opinionated toolkit for chaining Claude Code agents. It combines a beautiful terminal interface, a drag-and-drop web editor, and a reusable shell toolkit so you can design, validate, and run workflows without touching brittle scripts.

## Platform Overview

- **Interactive CLI (`@hiraoku/cc-flow-cli`)** – Ink-powered terminal UI for discovering agents, configuring workflows, and converting existing slash commands.
- **Visual Web Editor (`@hiraoku/cc-flow-web`)** – Next.js + ReactFlow application with Step Group modeling, validation overlays, and JSON export.
- **Automation Core (`@hiraoku/cc-flow-core`)** – Shell-first workflow engine that both front-ends call to render production-ready commands.

## Package Responsibilities

- **cc-flow-core**
  - Owns the workflow generation pipeline, including template rendering, POML authoring, and Markdown command emission.
  - Ships battle-tested shell scripts (`create-workflow.sh`, `convert-slash-commands.sh`) that can run standalone or be embedded by other tools.
  - Defines the workflow schema, validation rules, and filesystem conventions shared across the platform.
- **cc-flow-cli**
  - Provides a guided Ink TUI that orchestrates `cc-flow-core` scripts via TypeScript services.
  - Handles environment checks, agent discovery, and user input while delegating final workflow output to the core package.
  - Offers headless and conversion modes for CI usage or bulk command migration.
- **cc-flow-web**
  - Exposes a ReactFlow-based canvas for visually authoring Step Groups and agents.
  - Persists editor state as JSON, then calls the same core workflow generator to produce executable commands.
  - Adds real-time validation, property panels, and notifications tailored for browser usage.

## cc-flow-core Architecture

The core package acts as the contract between human-facing editors and Claude Code. Its architecture is deliberately shell-first so it can run in CI/CD, the CLI, or the web editor's server runtime without bundling TypeScript.

**Key Components**

- `create-workflow.sh`: Main entrypoint that accepts agent lists, ordering, purpose, and metadata via flags. It orchestrates dependency checks, template rendering, and output writing.
- `convert-slash-commands.sh`: Reads existing slash command Markdown, normalizes metadata, and generates agent files that the CLI/Web can consume.
- `workflow/` templates: Authoritative POML and Markdown blueprints. Placeholders such as `{WORKFLOW_AGENT_ARRAY}` and `{WORKFLOW_PURPOSE}` are replaced during generation.
- `templates/` helper snippets: Shared fragments reused across workflow flavors (sequential, parallel, quick-start).

**Execution Pipeline**

1. **Environment validation** – Ensures `node`, `npm`, `npx`, `jq`, and `pomljs` are present, short-circuiting with actionable errors.
2. **Input normalization** – Parses flag arguments, resolves agent paths, and assembles ordered agent arrays.
3. **Template rendering** – Generates POML using the template directory, substituting placeholders and writing to a secure `mktemp` directory.
4. **POML → Markdown conversion** – Invokes `pomljs` to emit Claude-ready Markdown commands with embedded execution steps.
5. **Cleanup & reporting** – Moves the final command into `.claude/commands/`, removes temporary files, and writes success messages consumed by the CLI/Web UIs.

**Integration Points**

- **CLI**: Binds to the scripts through `ScriptExecutor.ts`, streams stdout/stderr into Ink components, and surfaces validation results inline.
- **Web Editor**: Executes the scripts from the server runtime (Next.js API route/CLI binary) after serializing canvas state to the same JSON payload the CLI uses.
- **Direct Shell Usage**: Teams can call the scripts from CI pipelines, rendering workflows without spinning up UIs.

## Quick Start

### 1. Prepare Your Claude Project

- Organize agents under `.claude/agents/<category>/*.md`.
- Optional: keep existing slash commands in `.claude/commands/` for conversion.
- Ensure Node.js 18+ is available.

### 2. Pick Your Editor

```bash
# Launch the interactive terminal experience
npx @hiraoku/cc-flow-cli

# (from inside your .claude directory) launch the web editor
cc-flow-web --port 3000
```

Both UIs talk to the same core engine, so you can start in one interface and finish in the other.

### 3. Generate & Run Your Workflow

```bash
/your-workflow "describe your task here"
```

Generated commands live under `.claude/commands/<workflow-name>.md`, ready to execute inside Claude Code.

## Usage Examples

### cc-flow-cli (Ink TUI)

```bash
# Launch interactive mode
npx @hiraoku/cc-flow-cli

# Headless generation
npx @hiraoku/cc-flow-cli \
  --directory ".claude/agents/spec" \
  --agents "spec-init,spec-design" \
  --name "spec-workflow" \
  --output ".claude/commands/spec-workflow.md"

# Convert existing commands to agents
npx @hiraoku/cc-flow-cli --mode convert --directory ".claude/commands/spec"
```

### cc-flow-web (Visual Editor)

```bash
cd /path/to/your/project/.claude
cc-flow-web --port 4000 --no-open
# Visit http://localhost:4000, design your workflow, then click "Generate" to export Markdown
```

### cc-flow-core (Shell-first)

```bash
# Sequential workflow with custom purpose
npx @hiraoku/cc-flow-core create-workflow \
  --agents "spec-init,spec-requirements,spec-design" \
  --name "spec-workflow" \
  --purpose "End-to-end specification pipeline"

# Convert legacy slash commands into agents
npx @hiraoku/cc-flow-core convert \
  --input ".claude/commands/demo" \
  --output ".claude/agents/demo"
```

All three workflows rely on the same templates and validation rules delivered by `cc-flow-core`, ensuring that workflows generated in one environment will execute consistently in another.

## Feature Highlights

### CLI v0.1.1 (Ink TUI)

- ✨ Three-pane Ink experience with bilingual labels and iconography powered by `figures`.
- 🧭 Guided wizard covering environment checks, directory selection, agent ordering, and preview.
- 🔄 Slash command conversion mode (`--mode convert`) that migrates legacy commands to agents.
- 📄 POML-backed workflow generation with secure temp file handling and rich error reporting.
- 🧪 Vitest test suite plus TypeScript strict mode for predictable contributions.

### Web Editor v0.1.2 (Next.js + ReactFlow)

- 🧱 Drag-and-drop canvas with Start, Agent, Step Group, and End nodes.
- 🔁 Step Groups support sequential or parallel execution with up to 10 agents per group.
- 📏 Nodes auto-resize to reveal every agent; drop-zones hide automatically when full.
- ⚠️ Real-time validation overlays highlight connection issues and misconfigured nodes.
- 🧭 Agent palette with search/filter, keyboard shortcuts, and dual-language labels.
- 💾 JSON persistence, download/upload support, and CLI-ready generation progress indicators.

### Core v0.1.0 (`@hiraoku/cc-flow-core`)

- 🧰 Shell scripts (`create-workflow.sh`, `convert-slash-commands.sh`) with modern flag parsing.
- 📦 Template system that renders Claude Code-compatible Markdown and POML bundles.
- 🔐 Hardened tmp directory handling, dependency validation (`node`, `npm`, `jq`, `pomljs`).

## Typical Workflow

- Create or update agents in `.claude/agents/` (e.g., `spec/spec-init.md`).
- Launch the CLI or Web Editor to select agents, reorder steps, and group parallel work.
- Preview the generated command, adjust Step Groups, and ensure validation passes.
- Export/Save the workflow, then call it inside Claude Code with your task context.

## Documentation & Guides

- CLI documentation: `cc-flow-cli/README.md`
- Web editor documentation suite: `cc-flow-web/docs/`
- System architecture notes: `docs/`

## FAQ

**How do I create my first workflow?**
Run `npx @hiraoku/cc-flow-cli` or `cc-flow-web` from inside your `.claude` directory. Follow the prompts, preview the workflow, then save.

**Can I reuse existing slash commands?**
Yes. Use the CLI conversion mode or run `npx @hiraoku/cc-flow-core convert --input ".claude/commands/demo" --output ".claude/agents/demo"` to turn commands into reusable agents.

**Is there a headless mode?**
The CLI exposes `--directory`, `--agents`, `--output`, and related flags so you can automate workflow generation in CI or scripts. The web editor produces the same JSON bundle used by the CLI.

**How many agents fit inside a Step Group?**
Step Groups support up to 10 agents. The web editor adapts node height automatically and hides the drop-zone once the limit is reached.

## Packages

| Package                                  | Version | Description                                                             |
| ---------------------------------------- | ------- | ----------------------------------------------------------------------- |
| [@hiraoku/cc-flow-cli](./cc-flow-cli/)   | 0.1.1   | Ink-based terminal UI for workflow creation and conversion              |
| [@hiraoku/cc-flow-web](./cc-flow-web/)   | 0.1.2   | Next.js/ReactFlow visual workflow editor with drag-and-drop Step Groups |
| [@hiraoku/cc-flow-core](./cc-flow-core/) | 0.1.0   | Shell-first workflow automation toolkit powering both front-ends        |

## Roadmap

**Current (v0.1.x)**

- ✅ Ink TUI with bilingual UI, POML generation, and slash command conversion
- ✅ Visual web editor with dynamic Step Groups and validation overlays
- ✅ Hardened workflow templates and secure shell tooling

**Next (v0.2.x)**

- 📊 Workflow template gallery shared between CLI and web
- 🔍 Agent search across large `.claude` directories
- 🔄 Bidirectional sync between saved JSON, Markdown commands, and POML

**Future**

- 📝 Advanced validation and linting for complex branching workflows
- 🤝 Collaboration features and shared workflow libraries
- 🔒 Fine-grained versioning for workflows and agent packs

## License

MIT

## Links

- npm (CLI): https://www.npmjs.com/package/@hiraoku/cc-flow-cli
- npm (Web): https://www.npmjs.com/package/@hiraoku/cc-flow-web
- GitHub issues: https://github.com/s-hiraoku/cc-flow/issues
- Changelogs: `cc-flow-cli/CHANGELOG.md`, `cc-flow-web/CHANGELOG.md`

Happy workflow building! 🎉
