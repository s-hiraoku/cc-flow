# CC-Flow: Claude Code Workflow Platform

🚀 **A comprehensive platform for creating interactive workflows with beautiful Terminal UI**

CC-Flow enables you to create custom workflows that execute Claude Code sub-agents sequentially, now featuring a modern TypeScript-based TUI (Terminal User Interface) that replaces traditional command-line interactions with an intuitive visual experience.

## Overview

CC-Flow enables you to create custom slash commands that automatically execute multiple Claude Code sub-agents sequentially, passing context between each step. This creates powerful automation workflows for complex development tasks.

The included `spec` agents are provided as a sample workflow demonstrating specification-driven development. You can create your own agent collections for any domain or workflow pattern.

## ✨ Key Features

### 🎨 **Modern TUI Experience**
- **Beautiful ASCII Art Welcome**: Eye-catching 3-color CC-FLOW logo with responsive design
- **Interactive Terminal UI**: Modern @inquirer/prompts-based interface
- **Visual Workflow Creation**: Select agents and configure execution order with intuitive menus
- **Real-time Validation**: Immediate feedback during workflow configuration
- **Responsive Design**: Adapts to any terminal size (minimum 50 characters wide)

### ⚙️ **Advanced Technical Stack**
- **TypeScript 2025 Standards**: Full ESM support with latest TypeScript 5.6
- **Test-Driven Development**: 19 comprehensive tests following Kent Beck's TDD methodology
- **Production-Ready Build**: Complete build pipeline with validation and binary generation
- **Error Handling**: Contextual error management with user-friendly messages
- **Full Accessibility**: Screen reader support, voice commands, keyboard navigation

### 🔧 **Workflow Capabilities**
- **Sequential Sub-agent Execution**: Chain multiple Claude Code agents together
- **Context Passing**: Results from each agent are passed to the next in the sequence
- **Interactive Agent Selection**: Visual agent picker with descriptions and validation
- **POML Integration**: Uses POML (Prompt Orchestration Markup Language) for workflow definitions
- **Specialized Agents**: 7+ utility agents for development assistance
- **Flexible Patterns**: Support for different workflow patterns and agent combinations

## 🏗️ Architecture

### 🎯 **TUI Application (cc-flow-cli/)**

The modern TypeScript TUI application that provides the interactive experience:

```
cc-flow-cli/
├── src/
│   ├── cli/main.ts              # Main CLI orchestration
│   ├── ui/screens/              # Screen components
│   │   ├── WelcomeScreen.ts     # Beautiful ASCII art welcome
│   │   ├── DirectoryScreen.ts   # Agent directory selection
│   │   ├── AgentSelectionScreen.ts # Visual agent picker
│   │   └── OrderScreen.ts       # Execution order configuration
│   ├── core/                    # Business logic
│   │   ├── WorkflowCreator.ts   # Workflow creation engine
│   │   └── *.test.ts            # Comprehensive test suite
│   └── utils/ErrorHandler.ts    # Robust error management
├── bin/cc-flow.js               # Executable CLI binary
├── package.json                 # Modern ESM configuration
└── tsconfig.json                # TypeScript 2025 standards
```

**Usage:**
```bash
# Launch interactive TUI
./cc-flow-cli/bin/cc-flow.js

# Or via npm
cd cc-flow-cli && npm start
```

### 🤖 **Specialized Development Agents**

Utility agents that assist in the development process:
- **typescript-helper**: 2025 TypeScript best practices and configuration
- **npm-package-builder**: Package optimization and build systems
- **tui-designer**: Modern terminal interface patterns and UX
- **inquirer-ui-expert**: Latest @inquirer/prompts API and interactions
- **cli-tester**: Comprehensive CLI testing strategies
- **error-handler**: Robust error management patterns
- **accessibility-checker**: Full accessibility compliance validation

### 🎛️ **Core Components

1. **Templates** (`/templates/`): Base templates for creating new workflow commands
   - `workflow.md`: Markdown template for Claude Code slash commands
   - `workflow.poml`: POML template for workflow orchestration logic

2. **Sub-agents** (`/.claude/agents/`): Specialized agents for different tasks
   - `spec/`: Sample specification-related agents (init, design, implementation, etc.)
   - `utility/`: Utility agents (date handling, POML research, etc.)

3. **Script Architecture** (`/scripts/`): Modular implementation following GitHub spec-kit patterns
   - `create-workflow.sh`: Main entry point with error handling
   - `lib/`: Feature-specific modules (discovery, interaction, processing)
   - `utils/`: Shared utilities and common functions

4. **Command Generator**: The `/create-workflow` command that calls the script architecture

### 🔄 **TUI Workflow Flow**

```mermaid
graph TD
    A[Launch cc-flow.js] --> B[Welcome Screen with ASCII Art]
    B --> C[Environment Check & Agent Discovery]
    C --> D[Directory Selection UI]
    D --> E[Visual Agent Selection]
    E --> F[Execution Order Configuration]
    F --> G[Workflow Preview & Confirmation]
    G --> H[Generate Workflow Commands]
    H --> I[Execute Created Workflow]
    I --> J[Agent 1: Execute with context]
    J --> K[Agent 2: Execute with results]
    K --> L[Agent N: Execute with accumulated context]
    L --> M[Completion Screen with Summary]
```

## 🚀 Usage

### 🎨 **Interactive TUI Mode (Recommended)**

Launch the beautiful Terminal User Interface:

```bash
# Navigate to TUI application
cd cc-flow-cli

# Launch interactive TUI
./bin/cc-flow.js
# or
npm start
```

**TUI Experience:**
1. **Welcome Screen**: Beautiful 3-color CC-FLOW ASCII art logo
2. **Environment Check**: Automatic validation of project setup
3. **Directory Selection**: Choose from available agent directories
4. **Agent Selection**: Visual picker with descriptions and validation
5. **Order Configuration**: Drag-and-drop style execution order setup
6. **Preview & Confirm**: Review workflow before creation
7. **Generation**: Create workflow with progress feedback

### 📝 **Traditional Command Mode**

For automation or scripting, use the traditional `/create-workflow` command:

```bash
/create-workflow spec
```

**Interactive Agent Selection Process:**

1. **Agent Discovery**: The command scans the specified directory and lists all available agents
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
```

2. **Order Selection**: Choose execution order by entering numbers
```
Enter execution order: 1 2 3 5
```

3. **Confirmation**: Review and confirm your selection
```
Selected execution order:
1. spec-init
2. spec-requirements
3. spec-design
4. spec-impl

Is this correct? (y/n): y
```

4. **Generation**: Creates the workflow command and supporting files
```
✅ Created workflow command: /spec-workflow
📁 Generated files:
   - .claude/commands/spec-workflow.md
   - .claude/commands/poml/spec-workflow.poml

Agent execution order: spec-init → spec-requirements → spec-design → spec-impl
```

**Note**: The `spec` workflow is a sample implementation. You can create workflows for any domain by organizing agents in directories under `/.claude/agents/`.

### Running a Workflow

Execute the generated workflow command:

```bash
/spec-workflow implementation "create authentication system"
```

**Arguments:**
- `implementation`: The workflow type/variant
- `"create authentication system"`: Context description passed to all agents

### Workflow Execution Example

For the `spec` workflow with `implementation` type:

```
→ spec-init: Initializing project structure...
→ spec-requirements: Generating requirements documentation...
→ spec-design: Creating technical design...
→ spec-tasks: Breaking down implementation tasks...
→ spec-impl: Implementing core functionality...
✅ Workflow completed
```

## Sample Sub-agents

### Specification Agents (`/.claude/agents/spec/`) - Sample Implementation

The `spec` agents demonstrate a complete specification-driven development workflow:

- **spec-init**: Initialize new specification with directory structure
- **spec-requirements**: Generate comprehensive requirements using EARS format  
- **spec-design**: Create technical design with research and requirements mapping
- **spec-tasks**: Generate detailed implementation tasks with TDD approach
- **spec-impl**: Execute specification tasks using Kent Beck's TDD methodology
- **spec-status**: Generate progress reports and status tracking
- **steering**: Create and update Kiro steering documents
- **steering-custom**: Create custom steering documents for specialized contexts

### 🛠️ **Utility Agents (`/.claude/agents/utility/`)**

#### **Development Assistance Agents**
- **typescript-helper**: Expert in TypeScript 2025 best practices, ESM configuration, and modern tooling
- **npm-package-builder**: Package.json optimization, dependency management, and build systems
- **tui-designer**: Terminal UI design patterns, visual hierarchy, and user experience
- **inquirer-ui-expert**: Latest @inquirer/prompts API, UX patterns, and accessibility
- **cli-tester**: CLI testing strategies, user flow validation, and automated testing
- **error-handler**: Robust error management, logging, and graceful failure recovery
- **accessibility-checker**: Screen reader compatibility, keyboard navigation, and a11y compliance

#### **Core Utility Agents**
- **date-utility**: Provides current date and time information
- **poml-spec-researcher**: Research POML specifications and syntax
- **spec-creation-expert**: Create comprehensive technical specifications
- **tdd-typescript-dev**: Kent Beck's TDD methodology for TypeScript development

**Note**: These agents provide specialized development assistance. The TUI application uses them internally for guidance and best practices.

## Template Structure

### Workflow Command Template (`templates/workflow.md`)

Creates a Claude Code slash command with:
- Argument parsing for workflow type and context
- POML integration for dynamic agent selection
- Sequential agent execution with context passing
- Progress reporting and error handling

### POML Template (`templates/workflow.poml`)

Defines the workflow orchestration logic using POML syntax:
- Dynamic agent selection based on workflow type
- Context accumulation between agents
- Structured output formatting
- Workflow-specific instructions and configurations

## Configuration

### 📦 **Dependencies**

#### **TUI Application Dependencies**
- **@inquirer/prompts**: Modern terminal prompts and interactions
- **chalk**: Terminal styling and colors
- **figlet**: ASCII art text generation
- **boxen**: Terminal boxes and layouts
- **typescript**: TypeScript compiler and language support
- **vitest**: Fast testing framework

#### **Core Platform Dependencies**
- **pomljs**: POML processing library for workflow definitions
- **Claude Code**: Required runtime environment

### File Structure

```
cc-flow/
├── .claude/
│   ├── agents/
│   │   ├── spec/          # Sample specification workflow agents
│   │   └── utility/       # Sample utility agents
│   ├── commands/
│   │   ├── create-workflow.md    # Workflow generator command
│   │   └── poml/                 # Generated POML files (auto-created)
│   └── settings.local.json
├── scripts/               # Modular script architecture (GitHub spec-kit style)
│   ├── create-workflow.sh # Main workflow generator script
│   ├── lib/
│   │   ├── agent-discovery.sh      # Agent discovery and listing
│   │   ├── template-processor.sh   # Template processing and generation
│   │   └── user-interaction.sh     # Interactive order selection
│   └── utils/
│       └── common.sh      # Common utilities and error handling
├── templates/
│   ├── workflow.md        # Command template
│   └── workflow.poml      # POML workflow template
├── docs/
│   └── create-workflow-spec.md    # Detailed implementation specification
├── package.json
└── README.md
```

## Workflow Types

Different workflow types can be defined to execute different combinations of agents:

- **implementation**: Full specification workflow (init → requirements → design → tasks → impl)
- **design-only**: Design-focused workflow (requirements → design)
- **planning**: Planning workflow (init → requirements → tasks)

## Implementation Details

### Script Architecture Benefits

Following GitHub spec-kit patterns provides several advantages:

- **Maintainability**: Logic separated into focused modules
- **Testability**: Each script can be tested independently  
- **Reusability**: Modules can be imported by other scripts
- **Extensibility**: Easy to add new functionality without affecting core logic
- **Error Handling**: Centralized error management and user feedback

### Module Responsibilities

- **agent-discovery.sh**: Finds and validates agent files, extracts metadata
- **user-interaction.sh**: Manages all user input/output, validation, confirmation
- **template-processor.sh**: Handles file I/O, variable substitution, generation
- **common.sh**: Provides consistent error handling, logging, and utilities

### Direct Script Usage

You can also run the script directly for testing or automation:

```bash
# Interactive mode
./scripts/create-workflow.sh spec

# View usage help
./scripts/create-workflow.sh
```

## Extension

### Adding New Agents

1. Create agent definition in `/.claude/agents/{category}/{agent-name}.md`
2. Use `/create-workflow {category}` to generate workflow with interactive selection
3. Test the generated workflow command

### Creating Custom Workflows

1. **Create Agent Directory**: Define your agent sequence in a new directory under `/.claude/agents/`
   ```bash
   mkdir .claude/agents/deploy
   # Add your agents: deploy-build.md, deploy-test.md, deploy-release.md
   ```

2. **Generate Workflow**: Run `/create-workflow {category}` to generate the workflow command
   ```bash
   /create-workflow deploy
   ```

3. **Interactive Selection**: Choose agents and execution order during the creation process

4. **Customize**: Modify the generated POML definitions for your specific use case

**Error Handling**: The creation process includes comprehensive validation:
- Directory existence checking
- Agent file validation
- Duplicate selection prevention
- Template file verification
- Permission checks for file generation

## 📊 Development Status

**Status**: ✅ **Production Ready** - TUI Implementation Complete  
**Version**: 1.0.0  
**Last Updated**: September 2025  

### 🎯 **Completed Features**
- ✅ Complete TUI implementation with TypeScript
- ✅ Beautiful responsive ASCII art interface
- ✅ 19 comprehensive tests (100% passing)
- ✅ Full accessibility support (screen readers, voice commands)
- ✅ Production-ready build pipeline
- ✅ 7 specialized development utility agents
- ✅ Modern 2025 TypeScript standards compliance
- ✅ Comprehensive error handling and validation

### 🔄 **Quality Metrics**
- **Test Coverage**: 19/19 tests passing
- **TypeScript**: Strict mode, no compilation errors
- **Build Status**: All validation checks passing
- **Accessibility**: Full compliance with terminal accessibility standards
- **Performance**: Fast startup and responsive interactions

### 🚀 **Getting Started**

1. **Quick Start**: `cd cc-flow-cli && ./bin/cc-flow.js`
2. **Development**: `npm run dev` for development mode
3. **Testing**: `npm test` to run the full test suite
4. **Building**: `npm run build` for production builds

The platform now features a complete, production-ready TUI that provides an exceptional user experience for workflow creation and management.