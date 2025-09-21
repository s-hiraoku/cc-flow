# CC-Flow CLI

Interactive TUI to create Claude Code workflows from your local agents. It discovers agents under `.claude/agents`, lets you pick and order them, then generates a runnable slash command (Markdown) in `.claude/commands/`.

Links
- npm: https://www.npmjs.com/package/@hiraoku/cc-flow-cli
- Repo: https://github.com/s-hiraoku/cc-flow

## Quick Start

```bash
# Recommended
npx @hiraoku/cc-flow-cli

# Or install globally
npm install -g @hiraoku/cc-flow-cli
cc-flow
```

Then follow the TUI:
- Environment check → Directory select → Agent select → Order → Preview → Generate

Result:
- Generates `.claude/commands/<workflow-name>.md`
- POML is created as an intermediate and removed in the default flow

Run your command in Claude Code:

```bash
# Example
/spec-workflow "Build an authentication system"
```

## Requirements
- Node.js ≥ 18
- A Claude Code project with agents at `.claude/agents/**.md`
- Script execution permission where applicable (`chmod +x` on shell scripts)

## How It Works

The TUI delegates actual file generation to a shell script:

- Script: `scripts/create-workflow.sh`
- Arguments passed: `"<targetPath>" "<agentName,agentName,...>" "[purpose]"`
- Workflow name: set via env var `WORKFLOW_NAME` (falls back to `<dir>-workflow`)
- Purpose: set via env var `WORKFLOW_PURPOSE` or third argument (optional)

Script lookup order
1. Your project’s `scripts/create-workflow.sh` (preferred)
2. Built-in script bundled with this package

Target path format (new style)
- `./agents/<dir>` (e.g., `./agents/spec`)
- `./agents` (cross-category selection)

Notes
- Short form `spec` is still accepted by the script for back-compat but emits a warning.
- In the default flow, the POML intermediate file is cleaned up; only the final `.md` remains.

## Examples (script, without TUI)

You can call the script directly (useful for CI):

```bash
# Index-based order
scripts/create-workflow.sh ./agents/spec "1 3 4"

# Name-based order (comma-separated agent IDs)
scripts/create-workflow.sh ./agents/spec "spec-init,spec-requirements,spec-design"

# With custom purpose
scripts/create-workflow.sh ./agents/spec "1 3 4" "API仕様書作成ワークフロー"

# Cross-category selection
scripts/create-workflow.sh ./agents "spec-init,utility-date"

# Interactive mode with purpose
scripts/create-workflow.sh ./agents/spec "" "カスタム目的"
```

This generates `.claude/commands/<dir>-workflow.md`. Run it in Claude Code as `/spec-workflow "..."`.

## TUI Flow (Overview)
- Welcome screen
- Environment check (validates `.claude` and available agent directories)
- Directory selection (`spec`, `utility`, or all)
- Workflow name input (press Enter to use default)
- Agent selection (checkboxes)
- Execution order builder (step-by-step)
- Preview and confirm
- Execute generator script and show completion

For a detailed design, see `docs/cc-flow-tui-design.md` (sections 4, 14–22).

## Troubleshooting
- “Script not found or not executable”
  - Ensure `scripts/create-workflow.sh` exists and is executable.
  - If your project doesn’t have it, the CLI uses the packaged fallback. If both are missing, copy from this repo: `cc-flow-cli/scripts` and `cc-flow-cli/templates` into your project root.
- “No agents found”
  - Ensure `.claude/agents/<dir>/*.md` exist.
- “POML file is expected in tests”
  - Current default deletes the intermediate POML; update tests or run in a mode that retains it.

## Development

```bash
cd cc-flow-cli
npm install

# Dev (TypeScript, ESM)
npm run dev

# Build and fix bin
npm run build

# Lint/type-check
npm run type-check

# Run tests
npm test
```

Project layout
```
cc-flow-cli/
├─ bin/cc-flow.js            # Entry for npx / global
├─ scripts/                  # Bash helpers (create-workflow.sh etc.)
├─ templates/                # workflow.md / workflow.poml
├─ src/
│  ├─ cli/main.ts            # TUI entry
│  ├─ services/ScriptExecutor.ts # Locates and invokes the script
│  └─ ui/screens/*           # Screens (Welcome, Env, Directory, Agents, Order, Preview, Complete)
└─ dist/                     # Compiled output
```

## License

MIT

