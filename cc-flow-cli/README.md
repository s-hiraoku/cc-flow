# CC-Flow CLI

Interactive Terminal User Interface (TUI) for creating Claude Code workflows.

- npm: https://www.npmjs.com/package/@hiraoku/cc-flow-cli
- repo: https://github.com/s-hiraoku/cc-flow

## Features

- 🎯 **Interactive Agent Selection**: Choose from available Claude Code agents
- 📋 **Workflow Ordering**: Configure execution order with step-by-step selection
- 🔄 **Slash Command Conversion**: Convert custom slash commands to reusable agents
- 🎨 **Modern TUI Design**: Clean, accessible terminal interface
- ⚡ **TypeScript**: Fully typed for better development experience
- 🛡️ **Robust Error Handling**: Comprehensive error management and debugging

## Installation

```bash
# Run via npx (recommended)
npx @hiraoku/cc-flow-cli

# Or install globally
npm install -g @hiraoku/cc-flow-cli
```

## Usage

```bash
# npx
npx @hiraoku/cc-flow-cli

# or, if installed globally
cc-flow
```

The CLI will guide you through:

### Workflow Creation Mode
1. **Environment Check**: Validates Claude Code project structure
2. **Directory Selection**: Choose agent directory (spec, utility, etc.)
3. **Agent Selection**: Pick agents to include in your workflow
4. **Order Configuration**: Arrange execution order
5. **Preview & Generate**: Review and create the workflow

### Slash Command Conversion Mode  
1. **Command Discovery**: Automatically finds custom slash commands
2. **Selection**: Choose which commands to convert to agents
3. **Configuration**: Review conversion settings and output location
4. **Conversion**: Transform slash commands to agent format with compatibility warnings

## Requirements

- Node.js ≥18.0.0
- npm ≥8.0.0
- Claude Code project with `.claude/agents` directory

## Slash Command Conversion Limitations

While CC-Flow can convert most custom slash commands to agents, some features require manual adjustment:

### ❌ Not Directly Compatible
- **Bash Scripts**: Agents cannot execute bash code blocks directly
- **Arguments**: `$1`, `$2` style arguments work differently in agents
- **System Commands**: `exit`, `kill`, `sudo` are not available in agents
- **Interactive Input**: Commands that wait for user input (`read -p`)
- **OS-Specific Commands**: Platform-dependent operations (e.g., `pbcopy`, `apt-get`)

### ⚠️ Requires Manual Adjustment
- **Simple Commands**: Basic shell operations can be rewritten using agent tools
- **File Operations**: Direct file manipulation should use agent's Read/Write tools
- **External Tools**: Dependencies on `jq`, `docker`, etc. need alternative approaches

### ✅ Fully Compatible
- **Documentation Commands**: Information display and documentation generation
- **Configuration Files**: Reading and processing configuration
- **Text Processing**: Markdown and text manipulation tasks

**Conversion Process**: The tool automatically detects compatibility issues and provides warnings during conversion, helping you identify what needs manual adjustment.

### Examples

**✅ Fully Compatible Command**
```markdown
---
description: Generate project documentation  
tools: [Read, Glob, Write]
---

# generate-docs

Scans project files and creates comprehensive documentation.

## Features
- Analyzes code structure
- Generates API documentation  
- Creates usage examples
```

**❌ Requires Manual Adjustment**
```markdown
---
description: System cleanup utility
tools: [Bash]
---

# cleanup-system

```bash
#!/bin/bash
sudo rm -rf /tmp/*
docker system prune -f
read -p "Restart system? (y/N): " choice
```
```

This command needs rewriting because it uses system commands, external tools, and interactive input.

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check

# Start built version
npm start
```

## Project Structure

```
src/
├── cli/           # Main CLI application
├── models/        # TypeScript interfaces and types
├── services/      # Core business logic
├── ui/screens/    # TUI screen components
└── utils/         # Utilities and error handling
```

## License

ISC
