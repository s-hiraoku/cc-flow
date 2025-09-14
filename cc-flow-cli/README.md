# CC-Flow CLI

Interactive Terminal User Interface (TUI) for creating Claude Code workflows.

## Features

- 🎯 **Interactive Agent Selection**: Choose from available Claude Code agents
- 📋 **Workflow Ordering**: Configure execution order with drag-and-drop like interface
- 🎨 **Modern TUI Design**: Clean, accessible terminal interface
- ⚡ **TypeScript**: Fully typed for better development experience
- 🛡️ **Robust Error Handling**: Comprehensive error management and debugging

## Installation

```bash
npm install -g cc-flow-cli
```

## Usage

```bash
cc-flow
```

The CLI will guide you through:

1. **Environment Check**: Validates Claude Code project structure
2. **Directory Selection**: Choose agent directory (spec, utility, etc.)
3. **Agent Selection**: Pick agents to include in your workflow
4. **Order Configuration**: Arrange execution order
5. **Preview & Generate**: Review and create the workflow

## Requirements

- Node.js ≥16.0.0
- NPM ≥7.0.0
- Claude Code project with `.claude/agents` directory

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