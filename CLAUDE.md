# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CC-Flow is a Claude Code workflow platform that enables sequential execution of sub-agents through custom slash commands. It features a beautiful interactive Terminal User Interface (TUI) built with React Ink for creating workflows visually, and uses POML (Prompt Orchestration Markup Language) for workflow orchestration.

## Key Commands

### Development Commands

```bash
# Install dependencies for CLI package
cd cc-flow-cli && npm install

# Run CLI in development mode
cd cc-flow-cli && npm run dev

# Build CLI package
cd cc-flow-cli && npm run build

# Run tests
cd cc-flow-cli && npm test

# Type checking
cd cc-flow-cli && npm run type-check

# Validate build (type-check + build)
cd cc-flow-cli && npm run validate
```

### Using the CLI

```bash
# Run interactive TUI (recommended)
npx @hiraoku/cc-flow-cli

# Or after global install
npm install -g @hiraoku/cc-flow-cli
cc-flow

# Non-interactive script mode (for automation)
scripts/create-workflow.sh ./agents/spec "3 4 1 6 2"

# With custom purpose
scripts/create-workflow.sh ./agents/spec "3 4 1 6 2" "API仕様書作成"

# Execute generated workflow
/spec-workflow "Your task context"
```

## Architecture

### Project Structure

The codebase is organized as a monorepo with two main parts:

```
cc-flow/
├── cc-flow-cli/                    # React Ink TUI application (TypeScript)
│   ├── src/
│   │   ├── ink/                    # TUI components and screens
│   │   │   ├── screens/            # Screen components (Welcome, Menu, etc.)
│   │   │   ├── components/         # Reusable UI components
│   │   │   ├── design-system/      # Design system and layout patterns
│   │   │   └── themes/             # Color themes and responsive design
│   │   ├── services/               # Business logic services
│   │   ├── models/                 # Data models and types
│   │   └── utils/                  # Utility functions
│   ├── scripts/                    # Build and deployment scripts
│   ├── templates/                  # POML workflow templates
│   └── bin/                        # Executable entry point
├── scripts/                        # Workflow creation shell scripts
├── .claude/                        # Claude Code configuration
│   ├── commands/                   # Slash command definitions
│   └── agents/                     # Sub-agent definitions
└── templates/                      # POML workflow templates
```

### TUI Architecture (React Ink)

The interactive CLI is built with React Ink and follows a screen-based architecture:

- **App.tsx**: Main application component with state management
- **Screens**: Self-contained UI screens for different workflow steps
- **Design System**: Reusable components with consistent styling
- **Interactive Components**: Focus-aware menu and input components
- **Theme System**: Responsive design with color themes

Key TUI features:
- Bilingual UI (English/Japanese)
- Keyboard navigation and accessibility
- Responsive terminal layouts
- Beautiful ASCII art and visual feedback

### Command System

Commands are defined as markdown files with YAML frontmatter:

```markdown
---
description: Command description
argument-hint: <args>
allowed-tools: [Bash]
---

# command-name

\`\`\`bash
ARGUMENTS="$*"
./scripts/script.sh "$ARGUMENTS"
\`\`\`
```

### POML Integration

- **Templates**: Use `{WORKFLOW_AGENT_LIST}` placeholder for agent arrays
- **Syntax**: Arrays must use single quotes: `['agent1', 'agent2']`
- **Variables**: Use `{{variable}}` for POML context variables
- **Loops**: `<item for="item in ['a', 'b']">{{item}}</item>`

### Agent Structure

Agents are markdown files with specific metadata:

- **Location**: `.claude/agents/<category>/<agent-name>.md`
- **Categories**: `spec/` (specification workflow), `utility/` (helper agents)
- **Workflow Integration**: Agents can be chained together in custom workflows

## Working with the TUI

### Creating Workflows

1. Run `npx @hiraoku/cc-flow-cli` to launch the TUI
2. Select "Create workflow from existing agents"
3. Choose agent directory (e.g., "spec")
4. Select agents using checkbox interface
5. Set execution order interactively
6. Preview and confirm workflow creation

### Converting Slash Commands

1. Run the CLI and select "Convert slash commands to agents"
2. Choose source directory containing commands
3. Select commands to convert
4. Generated agents can be used in workflows

### Script Mode (Non-Interactive)

For automation or CI/CD:

```bash
# Create workflow with agent order
scripts/create-workflow.sh ./agents/spec "3 4 1 6 2"

# Create workflow with agent order and custom purpose
scripts/create-workflow.sh ./agents/spec "3 4 1 6 2" "API仕様書作成ワークフロー"

# Interactive mode with custom purpose
scripts/create-workflow.sh ./agents/spec "" "テスト作成ワークフロー"

# Convert slash commands
scripts/convert-slash-commands.sh demo --dry-run
```

## Important Implementation Details

### TypeScript Configuration

- **Target**: ES2022 with ESNext modules
- **Module System**: ESModules with .js imports
- **Build Output**: Compiled to `dist/` directory
- **Node.js**: Minimum version 18.0.0

### React Ink Specifics

- **Components**: Functional components with hooks
- **Layout**: Box model with flexbox
- **Input Handling**: `useInput` hook for keyboard events
- **State Management**: React state with custom hooks
- **Testing**: Vitest with coverage reporting

### Development Workflow

1. **Local Development**: Use `npm run dev` for hot reloading
2. **Type Checking**: Run `npm run type-check` before commits
3. **Testing**: Use `npm test` for unit tests
4. **Building**: `npm run build` compiles TypeScript to JavaScript
5. **Publishing**: `npm run prepublishOnly` runs full validation

### Error Handling

- **Shell Execution**: Scripts handle all error checking internally
- **TUI Errors**: Graceful error display with recovery options
- **Validation**: Input validation at multiple levels
- **Debugging**: Console output for development debugging

## Development Notes

- **Dependencies**: Uses modern React Ink v6+ with TypeScript 5.6
- **Package Management**: npm with package-lock.json
- **Accessibility**: Terminal UI follows accessibility best practices
- **Responsive Design**: Adapts to different terminal sizes
- **Internationalization**: Bilingual UI with Japanese/English support
- **Claude Code Integration**: Generated commands call `claude subagent`

### Common Patterns

- **Screen Components**: Follow `UnifiedScreen` pattern for consistency
- **Menu Systems**: Use `FocusableMenu` for interactive selections
- **Layout**: Use design system components for consistent spacing
- **Colors**: Use theme system for consistent color schemes
- **Error Messages**: Japanese emoji patterns (❌, ✅, 🔍, 📂)

### POML Workflow Conversion

**Goal**: Convert workflows using formal POML files for processing, enabling sub-agents to execute in the specified order as instructed.

- **Workflow Processing**: Use formal POML syntax for dynamic workflow generation
- **Sub-agent Execution**: Ensure sub-agents execute sequentially according to POML instructions
- **Template Conversion**: Convert agent selections into proper POML workflow files
- **Execution Flow**: Generated workflows should call `claude subagent` for each step
- **Context Passing**: Pass task context through the workflow chain