# create-workflow Command Specification (Draft)

## Overview

Create a custom Claude Code slash command `/create-workflow` that automatically generates new workflow commands from specified agent directories.

## Purpose

- Template-based automatic workflow command generation
- Analyze agent directory structure and create appropriate workflow definitions
- Automate manual command creation workflow

## Custom Workflow Creation Method

### Prerequisites
- `templates/workflow.md`: Claude Code slash command template
- `templates/workflow.poml`: POML format workflow definition template
- `/.claude/agents/<category>/`: Directory containing agents to execute

### Creation Steps
1. **Agent Preparation**: Place agents (`.md` files) in `/.claude/agents/<category>/`
2. **Command Execution**: Run `/create-workflow <category>`
3. **Order Selection**: Interactively select agent execution order
4. **Confirmation**: Verify the generated `/<category>-workflow` command behavior

### Automatic Template Variable Replacement
The following variables are automatically replaced during command execution:

#### workflow.md Template
- `{DESCRIPTION}` → `"Execute <category> workflow"`
- `{ARGUMENT_HINT}` → `"[type] [context]"`
- `{WORKFLOW_NAME}` → `"<category>-workflow"`
- `{WORKFLOW_TYPE}` → `"implementation"` (default example)

#### workflow.poml Template  
- `{WORKFLOW_NAME}` → `"<category>-workflow"`
- `{WORKFLOW_AGENT_LIST}` → Selected agent list (comma-separated array format)
- `{WORKFLOW_TYPE_DEFINITIONS}` → (Currently unnecessary, replaced with empty string)
- `{WORKFLOW_SPECIFIC_INSTRUCTIONS}` → Category-specific instructions

### Example: Creating a test Workflow
```bash
# 1. Place test agents in directory
/.claude/agents/test/
├── test-setup.md
├── test-unit.md  
├── test-integration.md
└── test-report.md

# 2. Execute workflow creation command
/create-workflow test

# 3. Interactively select order
Enter execution order: 1 2 3 4

# 4. Use generated command
/test-workflow implementation "API testing suite"
```

## Input Specification

### Command Syntax
```bash
/create-workflow <agent-directory-name> [options]
```

### Arguments
- `<agent-directory-name>`: Directory name under `/.claude/agents/` (e.g., `spec`, `test`, `deploy`)

### Options (Future Extensions)
- `--output-dir`: Generation destination directory (default: `/.claude/commands/`)
- `--template`: Template to use (default: `templates/workflow.md`)

## Processing Flow

1. **Input Validation**
   - Argument validity check
   - Verify existence of specified agent directory

2. **Agent Analysis**
   - Search for agent files (`.md`) in `/.claude/agents/<directory>/`
   - Create list of agent names
   - Display discovered agents

3. **Interactive Order Selection**
   - Interactively determine agent execution order with user
   - Display agent list with numbered selection
   - Confirm selected agent order
   - Finalize execution order

4. **Template Processing**
   - Load `templates/workflow.md`
   - Load `templates/workflow.poml`
   - Replace template variables (including finalized order)

5. **File Generation**
   - Generate `/.claude/commands/<directory>-workflow.md`
   - Generate corresponding POML file if applicable

## Template Variable Replacement

### Variables Replaced in workflow.md Template
- `{DESCRIPTION}`: Workflow description
- `{ARGUMENT_HINT}`: Argument hints
- `{WORKFLOW_NAME}`: Workflow name (e.g., `spec-workflow`)
- `{WORKFLOW_TYPE}`: Workflow type example

### Variables Replaced in workflow.poml Template
- `{WORKFLOW_NAME}`: Workflow name
- `{WORKFLOW_AGENT_LIST}`: Agent list
- `{WORKFLOW_TYPE_DEFINITIONS}`: Workflow type definitions
- `{WORKFLOW_SPECIFIC_INSTRUCTIONS}`: Workflow-specific instructions

## Interactive Mode Specification

### Agent List Display
```
Found agents in 'spec' directory:
1. spec-init
2. spec-requirements  
3. spec-design
4. spec-tasks
5. spec-impl
6. spec-status
7. steering
8. steering-custom

Please select the execution order by entering numbers separated by spaces.
Example: 1 2 3 5 (to execute spec-init, spec-requirements, spec-design, spec-impl)
```

### Order Selection Prompt
```
Enter execution order: 
```

### Selection Confirmation
```
Selected execution order:
1. spec-init
2. spec-requirements
3. spec-design
4. spec-impl

Is this correct? (y/n): 
```

### Correction Handling
- On `n` selection: Return to order selection
- On `y` selection: Proceed to file generation

## Output Specification

### Generated Files
1. `/.claude/commands/<directory>-workflow.md`
   - Claude Code slash command definition
   - Argument parsing logic
   - Agent execution logic in finalized order

2. `/.claude/commands/poml/<directory>-workflow.poml`
   - POML format workflow definition
   - Agent execution order and logic

### Output Example
```bash
✅ Created workflow command: /spec-workflow
📁 Generated files:
   - /.claude/commands/spec-workflow.md
   - /.claude/commands/poml/spec-workflow.poml

Agent execution order: spec-init → spec-requirements → spec-design → spec-impl

Usage: /spec-workflow <type> "<context>"
```

## Error Handling

### Expected Errors
1. **Missing Arguments**: `Error: Agent directory name required`
2. **Directory Not Found**: `Error: Agent directory '...' not found`
3. **No Agents**: `Error: No agents found in directory '...'`
4. **Template Not Found**: `Error: Template file not found`
5. **File Write Permission**: `Error: Cannot write to commands directory`
6. **Invalid Order Input**: `Error: Invalid agent number '...'`
7. **Duplicate Selection**: `Error: Agent '...' selected multiple times`
8. **Empty Order Selection**: `Error: No agents selected for execution`

## Detailed Implementation Specification

### Agent Name Extraction
- **Naming Convention**: Filename = Agent name
- **Example**: `spec-init.md` → Agent name is `spec-init`
- **Extension Removal**: Remove `.md` extension to get agent name

### POML File Reference Method
- **Reference Path**: Relative path reference from generated workflow.md
- **Example**: `npx pomljs --file "poml/<category>-workflow.poml"`

### Agent List Format
- **POML Array Format**: Replace as comma-separated array
- **Example**: `["spec-init", "spec-requirements", "spec-design"]`

### Error Handling Policy
- **Minimal Processing**: Abort processing on error occurrence
- **Error Output**: Clearly display error reason
- **Example**: `Error: Cannot create poml directory: Permission denied`

## Technical Implementation Requirements

### Required Tools
- `Read`: Template file loading
- `Write`: New command file creation
- `Bash`: Directory search, file operations
- `Glob`: Agent file search

### Dependencies
- Template file existence (`templates/workflow.md`, `templates/workflow.poml`)
- `/.claude/agents/` directory structure
- `/.claude/commands/` directory (write permission)
- `/.claude/commands/poml/` directory (POML file placement, auto-created)

## Extension Specifications (Future Support)

### Configuration File Support
- Customize agent execution order
- Customize workflow type definitions
- Template selection

### Interactive Mode
- Agent selection UI
- Custom variable input
- Preview functionality

## Test Requirements

### Basic Test Cases
1. Normal case: Command generation with `spec` directory
2. Error case: Specify non-existent directory
3. Boundary case: Specify empty directory
4. File overwrite confirmation

### Verification Items
- Syntax accuracy of generated commands
- Correct template variable replacement
- Agent list accuracy
- Executability verification