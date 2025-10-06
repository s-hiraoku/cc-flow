# CC-Flow CLI

> **Version 0.1.0** - Modern Terminal UI with Icon System

Interactive TUI to create Claude Code workflows from your local agents. Features a modern icon system powered by `figures` for consistent cross-terminal display. Discovers agents under `.claude/agents`, lets you pick and order them, then generates runnable slash commands in `.claude/commands/`.

**Links**
- npm: https://www.npmjs.com/package/@hiraoku/cc-flow-cli
- Repo: https://github.com/s-hiraoku/cc-flow

**What's New in v0.1.0**
- ✨ Modern icon system using `figures` package (cross-terminal compatible)
- 🎨 Tailwind CSS-inspired color palette for better readability
- 📐 Improved layout calculations for full-width characters
- 🔧 Enhanced UX with clear visual distinction between selection and action icons

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
- **Unix/Linux/macOS**: Script execution permission (`chmod +x` on shell scripts)
- **Windows**: Git for Windows (provides bash) - [Download here](https://git-scm.com/download/win)

## How It Works

The TUI uses `@hiraoku/cc-flow-core` for workflow generation:

**Workflow Generation**
- Uses: `@hiraoku/cc-flow-core` npm package
- Input: Agent configuration, execution order, workflow metadata
- Output: `.claude/commands/<workflow-name>.md` (executable slash command)
- Format: Supports both simple agent lists and advanced step-based workflows

**Agent Discovery**
- Scans `.claude/agents/` directory structure
- Supports categorization by subdirectories (e.g., `spec/`, `utility/`)
- Reads agent metadata from `.md` files

**Workflow Configuration**
- Workflow name: User input or auto-generated
- Purpose: Optional description field
- Execution mode: Sequential (default) or parallel steps
- Model selection: Optional Claude model specification

## Features

### 🎨 Modern Icon System
- **Cross-terminal compatibility**: Uses `figures` package with automatic fallbacks
- **Visual clarity**: Clear distinction between selection indicators (▹) and action icons (→)
- **Consistent display**: Unicode symbols render consistently across all terminals

### 🎯 Intuitive TUI
- **Welcome screen**: Clear introduction and feature highlights
- **Directory selection**: Browse agent categories
- **Agent selection**: Checkbox-based multi-select
- **Order configuration**: Drag-and-drop style ordering (Ctrl/Cmd + ↑↓)
- **Preview**: Review workflow before generation
- **Status feedback**: Real-time progress indicators

### ⚙️ Workflow Conversion
- **Slash command conversion**: Convert existing `.claude/commands/*.md` to agent format
- **Batch processing**: Convert multiple commands at once
- **Validation**: Ensures compatibility and correctness

## TUI Flow

### Main Workflow
1. **Welcome Screen**: Introduction and feature highlights
2. **Menu Selection**: Choose between "Create Workflow" or "Convert Commands"

### Create Workflow Path
3. **Directory Selection**: Choose agent category or "All"
4. **Agent Selection**: Multi-select agents with checkboxes (Space to toggle)
5. **Order Configuration**: Arrange execution order (Ctrl/Cmd + ↑↓ to reorder)
6. **Workflow Configuration**: Set name and purpose
7. **Environment Check**: Validate dependencies and permissions
8. **Preview**: Review complete configuration
9. **Generation**: Create workflow file
10. **Completion**: Show generated file path and next steps

### Convert Commands Path
3. **Directory Selection**: Choose command directory
4. **Command Selection**: Select slash commands to convert
5. **Conversion**: Process selected commands
6. **Results**: Show conversion summary and generated agents

## Troubleshooting

### Common Issues

**"No agents found"**
- Ensure `.claude/agents/` directory exists
- Check that agent files are in `.md` format
- Verify agent files contain required metadata

**"Workflow generation failed"**
- Ensure `@hiraoku/cc-flow-core` is properly installed
- Check Node.js version (requires ≥18)
- Verify write permissions for `.claude/commands/`

**Display issues (garbled characters)**
- This should be resolved in v0.1.0 with the new icon system
- If issues persist, ensure your terminal supports Unicode
- **macOS/Linux**: iTerm2, Alacritty, or default terminal
- **Windows**: Windows Terminal (recommended), PowerShell 7+, or VSCode terminal

**Windows-specific: "bash: command not found"**
- Install Git for Windows which includes Git Bash
- Download from: https://git-scm.com/download/win
- Ensure `bash` is in your PATH after installation
- Alternative: Use WSL (Windows Subsystem for Linux)

**Command not found after global install**
- Run `npm install -g @hiraoku/cc-flow-cli` again
- Check your PATH includes npm global bin directory
- Use `npx @hiraoku/cc-flow-cli` as an alternative

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

### Project Structure
```
cc-flow-cli/
├─ bin/
│  └─ cc-flow.js                    # CLI entry point
├─ src/
│  ├─ ink/
│  │  ├─ App.tsx                    # Main TUI application
│  │  ├─ components/                # Reusable UI components
│  │  │  ├─ Interactive.tsx         # Menu, Checkbox, StatusBar
│  │  │  ├─ Layout.tsx              # Container, Section, Flex
│  │  │  └─ Frame.tsx               # Border frames
│  │  ├─ design-system/             # Design system
│  │  │  ├─ icons.ts                # Icon definitions (figures-based)
│  │  │  ├─ ScreenComponents.tsx    # UnifiedScreen, HintBox, etc.
│  │  │  └─ ScreenPatterns.ts       # Layout patterns
│  │  ├─ screens/                   # Screen components
│  │  │  ├─ WelcomeScreen.tsx
│  │  │  ├─ MenuScreen.tsx
│  │  │  ├─ DirectoryScreen.tsx
│  │  │  ├─ AgentSelectionScreen.tsx
│  │  │  ├─ OrderScreen.tsx
│  │  │  ├─ WorkflowNameScreen.tsx
│  │  │  ├─ EnvironmentScreen.tsx
│  │  │  ├─ PreviewScreen.tsx
│  │  │  ├─ CompleteScreen.tsx
│  │  │  ├─ CommandSelectionScreen.tsx
│  │  │  ├─ ConversionScreen.tsx
│  │  │  └─ ConversionCompleteScreen.tsx
│  │  ├─ themes/
│  │  │  └─ theme.ts                # Color palette and theme
│  │  └─ utils/
│  │     ├─ directoryUtils.ts       # Agent/directory discovery
│  │     └─ text.ts                 # Text rendering utilities
│  ├─ services/
│  │  ├─ ScriptExecutor.ts          # cc-flow-core integration
│  │  └─ EnvironmentChecker.ts      # Environment validation
│  └─ types/                        # TypeScript types
└─ dist/                            # Compiled output
```

### Key Dependencies
- `ink` (v6.3.0): React-based TUI framework
- `figures` (v6.1.0): Cross-terminal Unicode symbols
- `@hiraoku/cc-flow-core`: Workflow generation engine
- `chalk`: Terminal string styling
- `string-width` & `wrap-ansi`: Text layout utilities

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request

See [CONTRIBUTING.md](../CONTRIBUTING.md) for detailed guidelines.

## Roadmap

### Upcoming Features
- 🌐 **Web Editor** (Issue #13): Next.js + ReactFlow visual workflow editor
- 📊 **Workflow Templates**: Pre-built workflow templates library
- 🔍 **Agent Search**: Full-text search across agents
- 📝 **Workflow Validation**: Enhanced validation and error reporting

## License

MIT

## Links
- [Changelog](./CHANGELOG.md)
- [NPM Package](https://www.npmjs.com/package/@hiraoku/cc-flow-cli)
- [GitHub Repository](https://github.com/s-hiraoku/cc-flow)
- [Issue Tracker](https://github.com/s-hiraoku/cc-flow/issues)
