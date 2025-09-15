# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CC-Flow is a Claude Code workflow platform that enables sequential execution of sub-agents through custom slash commands. It uses POML (Prompt Orchestration Markup Language) for workflow orchestration and follows a modular script architecture inspired by GitHub spec-kit patterns.

## Key Commands

```bash
# Install dependencies
npm install

# Inside Claude Code (slash command)
# Non-interactive mode is required in Claude Code (no stdin support)
/create-workflow spec "3 4 1 6 2"  # index-based order

# Example with the same order:
# 3=spec-init, 4=spec-requirements, 1=spec-design, 6=spec-tasks, 2=spec-impl
/create-workflow spec "3 4 1 6 2"

Note:
- "/create-workflow" is a slash command executed inside Claude Code. It is distinct from the shell script `scripts/create-workflow.sh` that you run in a terminal.
- Slash command uses a category name like `spec`; the script uses a path like `./agents/spec`.
- This repository does not ship `/create-workflow` by default. If it isn’t present in your project, use the terminal script examples below or add a corresponding `.claude/commands/create-workflow.md` in your project.

# Execute generated workflow
/spec-workflow "Your task context"
```

## Architecture

### Command System

- **Location**: `.claude/commands/`
- **Format**: Markdown files with YAML frontmatter and bash code blocks
- **Key insight**: Each `.md` file becomes a slash command. The bash code block is executed when the command runs.
- **Argument handling**: Commands receive arguments via `$*` or `$1`, `$2`, etc.

### POML Integration

- **Templates**: `templates/workflow.poml` uses `{WORKFLOW_AGENT_LIST}` placeholder for agent arrays
- **Syntax**: Arrays must use single quotes: `['agent1', 'agent2']`
- **Variables**: Use `{{variable}}` for POML context variables
- **Loops**: `<item for="item in ['a', 'b']">{{item}}</item>`

### Script Architecture

```
scripts/
├── create-workflow.sh      # Main entry, supports both interactive and non-interactive modes
├── lib/
│   ├── agent-discovery.sh  # Finds agents in directories
│   ├── template-processor.sh # Processes templates with variable substitution
│   └── user-interaction.sh # Interactive prompts and confirmations
└── utils/
    └── common.sh           # Error handling and utilities
```

**Non-interactive usage** (required for Claude Code):

```bash
# Recommended new path format
./scripts/create-workflow.sh ./agents/<dir> "<order>"

# Examples
./scripts/create-workflow.sh ./agents/spec "3 4 1 6 2"        # index-based
./scripts/create-workflow.sh ./agents/spec "spec-init,spec-impl" # name-based

# Back-compat short form (deprecated; emits a warning)
./scripts/create-workflow.sh spec "3 4 1 6 2"
```

### Agent Structure

- **Location**: `.claude/agents/<category>/<agent-name>.md`
- **Categories**: `spec/` (specification workflow), `utility/` (helper agents)
- **Workflow creation**: Interactive selection during `/create-workflow` execution

## Working with Workflows

### Creating New Workflows

1. Create agent directory: `.claude/agents/<category>/`
2. Add agent files: `<agent-name>.md`
3. Run `/create-workflow <category>`
4. Select agents and order interactively
5. Confirm to generate command files

### Generated Files

By default, the script generates a single final command file and cleans up intermediates:

- `.claude/commands/<workflow-name>.md` - The slash command (final)
- POML is created only as a temporary intermediate and removed in the default flow

### Template Variables

The template system (`template-processor.sh`) replaces these placeholders:

- `{WORKFLOW_NAME}` - Name of the workflow (e.g., "spec-workflow")
- `{WORKFLOW_AGENT_LIST}` - Array of agents (POML: `['agent1', 'agent2']`, Bash: `agent1 agent2`)
- `{DESCRIPTION}` - Command description
- `{ARGUMENT_HINT}` - Argument hint for command usage

## Important Implementation Details

### Bash Execution Context

- Each Bash tool call is a separate process - variables don't persist
- Use single command with `&&` or `;` to maintain context
- Scripts should handle all error checking internally

### POML Array Syntax

```poml
<!-- Correct -->
<item for="agent in ['spec-init', 'spec-requirements']">

<!-- Incorrect (will cause parse error) -->
<item for="agent in ["spec-init", "spec-requirements"]">
```

### Command File Structure

```markdown
---
description: Command description
argument-hint: <args>
allowed-tools: [Bash]
---

# command-name

Description

## Execution

\`\`\`bash

# Get arguments

ARGUMENTS="$\*"

# Execute script

./scripts/script.sh "$ARGUMENTS"
\`\`\`
```

## Development Notes

- POML version: 0.0.8 (see package.json)
- Script permissions: Ensure `.sh` files are executable (`chmod +x`)
- Error messages: Use Japanese emoji patterns (❌, ✅, 🔍, 📂) for consistency
- **Claude Code limitation**: No interactive input support - always use non-interactive mode with order specification
