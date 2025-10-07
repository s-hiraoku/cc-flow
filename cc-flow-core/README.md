# @hiraoku/cc-flow-core

> Core workflow generation logic for CC-Flow - Claude Code workflow creation toolkit

## Overview

`@hiraoku/cc-flow-core` is a core logic package that supports Claude Code workflow creation.
This package is the **heart** of the CC-Flow ecosystem and is used by all interfaces (CLI, Web, etc.).

## Architecture

```
┌─────────────────────────────────────┐
│      @hiraoku/cc-flow-core          │
│                                     │
│   Core Workflow Generation Logic   │
└─────────────────────────────────────┘
              ↑          ↑
              │          │
     ┌────────┴──┐  ┌───┴─────────┐
     │  CLI      │  │   Web       │
     └───────────┘  └─────────────┘
```

## Features

- ✅ Workflow generation (workflow.md)
- ✅ POML → Markdown conversion
- ✅ Template management
- ✅ Agent discovery & conversion
- ✅ Slash command conversion

## Installation

```bash
npm install @hiraoku/cc-flow-core
```

## Requirements

### Prerequisites

- **Node.js**: ≥18.0.0
- **Bash**: Unix-like shell environment

### Platform-Specific Requirements

#### Unix/Linux/macOS
- ✅ Natively supported
- Bash is pre-installed by default

#### Windows
cc-flow-core is Bash script-based, so Windows requires one of the following:

**Recommended: Git for Windows**
- Integrated package including Git Bash
- Download: https://git-scm.com/download/win
- After installation, `bash` command is added to PATH

**Alternative: WSL (Windows Subsystem for Linux)**
- Built-in Linux environment for Windows 10/11
- Setup: https://docs.microsoft.com/windows/wsl/install

**Limitations:**
- ❌ PowerShell alone does not work
- ❌ Command Prompt alone does not work
- ✅ `bash` command via Git Bash or WSL is required

### Environment Verification

Check if Bash environment is properly set up:

```bash
# Check Bash version
bash --version

# Check Node.js version
node --version
```

If both commands return version information, you can use cc-flow-core.

## Usage

### Script Argument Specification

#### create-workflow.sh

```bash
create-workflow.sh <agents-dir> <commands-dir> --steps-json <path>
```

**Arguments:**
- `<agents-dir>`: **Absolute path** to the directory containing agent files (.md)
- `<commands-dir>`: **Absolute path** to the output directory for generated workflow files
- `--steps-json <path>`: Path to workflow definition JSON file

**JSON File Format:**

```json
{
  "workflowName": "my-workflow",
  "workflowPurpose": "Workflow purpose",
  "workflowModel": "claude-sonnet-4-5-20250929",
  "workflowArgumentHint": "<context>",
  "workflowSteps": [
    {
      "title": "Step 1",
      "mode": "sequential",
      "purpose": "Purpose",
      "agents": ["agent1", "agent2"]
    }
  ]
}
```

**Example:**

```bash
# Execute with absolute paths
./workflow/create-workflow.sh \
  /path/to/project/.claude/agents \
  /path/to/project/.claude/commands \
  --steps-json ./workflow.json
```

#### convert-slash-commands.sh

```bash
convert-slash-commands.sh <commands-dir> <agents-dir> [--dry-run]
```

**Arguments:**
- `<commands-dir>`: **Absolute path** to the command directory to convert
- `<agents-dir>`: **Absolute path** to the output agent directory
- `--dry-run`: (Optional) Preview only without actual conversion

**Directory Structure Preservation:**

Specifying `/path/to/.claude/commands/kiro` will create output in `/path/to/.claude/agents/kiro`.

**Examples:**

```bash
# Convert kiro directory commands to .claude/agents/kiro
./workflow/utils/convert-slash-commands.sh \
  /path/to/project/.claude/commands/kiro \
  /path/to/project/.claude/agents

# Convert utility category commands to .claude/agents/utility
./workflow/utils/convert-slash-commands.sh \
  /path/to/project/.claude/commands/utility \
  /path/to/project/.claude/agents

# Verify with dry-run mode
./workflow/utils/convert-slash-commands.sh \
  /path/to/project/.claude/commands \
  /path/to/project/.claude/agents \
  --dry-run
```

### Direct Execution from Command Line

```bash
# Create workflow
npx cc-flow-create-workflow ./agents/my-workflow

# Convert slash commands
npx cc-flow-convert-commands utility
```

### Programmatic Usage (Node.js / TypeScript)

```javascript
const { spawn } = require('child_process');
const { join } = require('path');
const { writeFileSync } = require('fs');
const { tmpdir } = require('os');

// Get package path
const corePackage = require.resolve('@hiraoku/cc-flow-core/package.json');
const corePath = join(corePackage, '..');
const scriptPath = join(corePath, 'workflow/create-workflow.sh');

// Create workflow definition
const workflowConfig = {
  workflowName: 'demo-workflow',
  workflowPurpose: 'Demo purpose',
  workflowSteps: [
    {
      title: 'Step 1',
      mode: 'sequential',
      purpose: 'Process data',
      agents: ['agent1']
    }
  ]
};

// Save to temporary file
const tempFile = join(tmpdir(), 'workflow-config.json');
writeFileSync(tempFile, JSON.stringify(workflowConfig));

// Execute script (pass absolute paths)
const agentsDir = join(process.cwd(), '.claude/agents');
const commandsDir = join(process.cwd(), '.claude/commands');

const child = spawn('bash', [
  scriptPath,
  agentsDir,
  commandsDir,
  '--steps-json',
  tempFile
], {
  cwd: process.cwd(),
  stdio: 'inherit'
});

child.on('close', (code) => {
  console.log(`Workflow generated with exit code ${code}`);
});
```

## Package Structure

```
@hiraoku/cc-flow-core/
├── create-workflow.sh          # Main workflow generation script
├── convert-slash-commands.sh   # Command conversion script
├── workflow/                   # Core logic
│   ├── lib/                    # Libraries
│   └── utils/                  # Utilities
└── templates/                  # Template files
    ├── workflow.md
    ├── workflow.poml
    └── partials/
```

## Dependent Packages

### CLI Interface
- [@hiraoku/cc-flow-cli](https://www.npmjs.com/package/@hiraoku/cc-flow-cli)

### Web Interface
- [@hiraoku/cc-flow-web](https://www.npmjs.com/package/@hiraoku/cc-flow-web)

## Development

### Template Customization

You can customize generated workflows by editing files in the `templates/` directory.

### Adding New Features

Adding new features to the core logic automatically makes them available in all interfaces (CLI, Web).

## License

MIT

## Links

- [GitHub Repository](https://github.com/hiraoku/cc-flow)
- [Documentation](https://github.com/hiraoku/cc-flow#readme)
- [Issues](https://github.com/hiraoku/cc-flow/issues)
