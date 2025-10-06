# CC-Flow: Claude Code Workflow Platform

```
   ██████╗ ██████╗       ███████╗██╗      ██████╗ ██╗    ██╗
  ██╔════╝██╔════╝      ██╔════╝██║     ██╔═══██╗██║    ██║
  ██║     ██║     █████╗█████╗  ██║     ██║   ██║██║ █╗ ██║
  ██║     ██║     ╚════╝██╔══╝  ██║     ██║   ██║██║███╗██║
  ╚██████╗╚██████╗      ██║     ███████╗╚██████╔╝╚███╔███╔╝
   ╚═════╝ ╚═════╝      ╚═╝     ╚══════╝ ╚═════╝  ╚══╝╚══╝
```

🚀 **Create powerful Claude Code workflows with a modern interactive terminal interface**

> **Latest:** v0.1.0 features a modern icon system with cross-terminal compatibility

CC-Flow makes it easy to build and run custom workflows that chain multiple Claude Code agents together. No complex configuration needed - just launch the interactive TUI and create workflows visually!

## 🎯 What is CC-Flow?

CC-Flow lets you:

- **Chain Claude Code agents** together in custom workflows
- **Create workflows visually** with an intuitive terminal interface
- **Convert slash commands to agents** for better organization and reusability
- **Automate complex tasks** by combining multiple specialized agents
- **Save time** by reusing workflows for similar tasks

Perfect for development workflows like: specification creation, code review processes, testing pipelines, deployment automation, and more.

## ⚡ Quick Start

### 1. **Launch the Interactive TUI**

```bash
npx @hiraoku/cc-flow-cli
# or (after global install):
cc-flow
```

> 📖 **For detailed CLI usage, installation options, and troubleshooting**, see the [CC-Flow CLI documentation](./cc-flow-cli/README.md)

**You'll see a beautiful welcome screen with:**

- 🎨 Colorful ASCII art logo
- 📋 Clear menu options with two main workflows:
  - 🚀 **Create workflow from existing agents** - Build workflows using existing sub-agents
  - 🔄 **Convert slash commands to agents** - Transform custom slash commands into reusable sub-agents
- ⌨️ Keyboard shortcuts
- 🌐 Bilingual UI (English/Japanese labels)

### 2. **Follow the Visual Setup**

- ✅ See the beautiful CC-FLOW welcome screen
- ✅ Choose your agent directory (e.g., "spec" for specification workflows)
- ✅ Select which agents you want to use
- ✅ Set the execution order
- ✅ Preview and confirm your workflow

**Interactive Features:**

- ✨ Visual agent cards with descriptions
- ✅ Checkbox-based selection in the TUI
- 🔢 Script mode supports numeric index and CSV selection
- 📝 Real-time validation and tips
- 👀 Preview before confirmation

### 3. **Run Your Workflow**

```bash
# Use the generated workflow command
/your-workflow "describe your task here"
```

That's it! 🎉 Your custom workflow is ready to use.

## 🎨 Features

### **Modern Terminal Interface (v0.1.0)**

- ✨ **Modern icon system** using `figures` package for cross-terminal compatibility
- 🎨 **Tailwind CSS-inspired colors** for better readability
- 📐 **Improved layout** with proper full-width character handling
- ⌨️ **Clear visual feedback** with distinct selection (▹) and action (→) icons
- 🌐 **Bilingual support** (English/Japanese labels)

**Terminal Experience:**

```
┌─ Select Agents (spec directory) ────────┐
│ Available agents:                        │
│ ▹ ● spec-init   → Initialize project    │
│   ● spec-design → Create architecture   │
│   ● spec-impl   → Implement features    │
└──────────────────────────────────────────┘

Icons: ▹ = Selected | → = Action | ● = Agent
```

### **Easy Workflow Creation**

- Visual agent selection with descriptions
- Step-by-step ordering (choose next agent sequentially)
- Real-time validation and error checking
- Preview before creating workflows

### **Powerful Automation**

- Chain multiple agents together
- Context flows between agents automatically
- Reusable workflows for common tasks
- Built-in error handling and recovery

## 📚 Common Use Cases

### **Software Development**

```bash
# Create a specification workflow
npx @hiraoku/cc-flow-cli
# Select: spec → spec-init, spec-requirements, spec-design, spec-impl
# Run: /spec-workflow "build user authentication system"
```

**Workflow Creation Flow:**

```
📁 Select Directory → 🔍 Choose Agents → 📋 Set Order → ✅ Confirm → 🎉 Ready!
```

### **Slash Command Conversion**

Transform your custom slash commands into reusable sub-agents:

```bash
# Convert slash commands to agents
npx @hiraoku/cc-flow-cli
# Select: "Convert slash commands to agents"
# Choose directory: demo (contains 3 example commands)
# Select commands: analyze-code, generate-docs, create-tests
# Result: Converted to .claude/agents/demo/ for workflow use
```

**Conversion Process:**

```
🔍 Search Commands → ☑️ Select Commands → ⚙️ Configure → 🔄 Convert → ✅ Ready for Workflows!
```

**Example Demo Commands Available:**

- 📊 **analyze-code** - Comprehensive code quality analysis
- 📚 **generate-docs** - Automatic documentation generation  
- 🧪 **create-tests** - Test suite generation

### **Code Review Process**

```bash
# Create a review workflow
npx @hiraoku/cc-flow-cli
# Select agents for: code analysis → security check → documentation
# Run: /review-workflow "review this pull request"
```

### **Testing Pipeline**

```bash
# Create a testing workflow
npx @hiraoku/cc-flow-cli
# Select agents for: unit tests → integration tests → e2e tests
# Run: /test-workflow "test the payment module"
```

## 🔧 Installation & Setup

### **Prerequisites**

- Claude Code CLI available on PATH (the generated commands call `claude subagent`)
- Node.js 18+ (for the TUI application)
- Project contains your agents under `.claude/agents/**.md`

### **Setup**

You can run the TUI via npx or install globally. The TUI ultimately invokes a local script `scripts/create-workflow.sh` in your current project directory to generate workflow commands.

- Option A: Run with npx (recommended)
  - From your Claude Code project root: `npx @hiraoku/cc-flow-cli`

- Option B: Global install
  - `npm install -g @hiraoku/cc-flow-cli`
  - Run with: `cc-flow`

Important: If you are using the CLI outside this repository, make sure your project has the CC-Flow helper files that the TUI calls:

- `scripts/workflow/` (contains `create-workflow.sh` and supporting libraries)
- `scripts/create-workflow.sh` (wrapper that invokes the shared script)
- `cc-flow-cli/templates/` (workflow templates)

If you need to copy them manually from this repo, use:

```bash
# from repo root
cp -r scripts/workflow scripts/create-workflow.sh cc-flow-cli/templates /path/to/your-project/
chmod +x /path/to/your-project/scripts/create-workflow.sh
```

Repository: https://github.com/s-hiraoku/cc-flow

npm: https://www.npmjs.com/package/@hiraoku/cc-flow-cli

Then ensure the workflow script is executable:

```bash
chmod +x scripts/create-workflow.sh
```

### **Start Creating Workflows**

```bash
# Launch the TUI
npx @hiraoku/cc-flow-cli

# Follow the interactive prompts
# Your workflow will be ready in minutes!
```

## 🤔 FAQ

### **How do I create my first workflow?**

Just run `npx @hiraoku/cc-flow-cli` (or `cc-flow` if installed globally) and follow the visual prompts. The TUI guides you through everything!

### **Can I use existing agents?**

Yes! CC-Flow comes with sample `spec` agents for specification-driven development. You can use them as-is or create your own.

### **How do I add new agents?**

1. Create a `.md` file in `/.claude/agents/your-category/`
2. Launch the TUI to include it in workflows
3. That's it!

### **Can I run workflow generation without the TUI?**

The TUI uses `@hiraoku/cc-flow-core` for workflow generation, which provides both programmatic API and CLI:

```bash
# Using cc-flow-core CLI (recommended)
npx @hiraoku/cc-flow-core create-workflow \
  --agents "spec-init,spec-requirements,spec-design" \
  --name "my-workflow" \
  --purpose "API specification workflow"

# Using the TUI programmatically
npx @hiraoku/cc-flow-cli --headless \
  --directory ".claude/agents/spec" \
  --agents "1,3,4" \
  --output ".claude/commands/spec-workflow.md"
```

This generates `.claude/commands/<workflow-name>.md` which you run inside Claude Code as a slash command, for example: `/my-workflow "your context"`.

### **Can I convert slash commands without the TUI?**

The conversion feature is integrated into `@hiraoku/cc-flow-core`:

```bash
# Using cc-flow-core CLI
npx @hiraoku/cc-flow-core convert \
  --input ".claude/commands/demo" \
  --output ".claude/agents/demo"

# Using the TUI with automation
npx @hiraoku/cc-flow-cli --mode convert \
  --directory ".claude/commands/demo"
```

This converts slash commands from `.claude/commands/` to sub-agents in `.claude/agents/` that can be used in workflows.

### **Can I edit from the preview screen?**

Not yet. Editing from the preview screen is planned. For now, cancel and re-run the wizard to change selection or order.

### **What if I need help?**

- The TUI has built-in help and validation
- Check the included sample agents for examples
- All workflows include error handling and recovery

## 🚀 Ready to Get Started?

```bash
npx @hiraoku/cc-flow-cli
```

**Within 5 minutes you'll have:**

- ✅ A beautiful interactive workflow creator
- ✅ Custom workflows tailored to your needs
- ✅ Powerful automation for your development tasks

**Success! Your workflow is ready:**

```bash
✅ ワークフローコマンドを作成しました: /spec-workflow
💡 実行: /spec-workflow "your task description"
🎯 Agents: spec-init → spec-requirements → spec-design → spec-impl
```

Happy workflow building! 🎉

---

## 📦 Packages

- **[@hiraoku/cc-flow-cli](./cc-flow-cli/)** (v0.1.0) - Interactive TUI for workflow creation
- **[@hiraoku/cc-flow-core](https://github.com/s-hiraoku/cc-flow-core)** (v0.0.8) - Core workflow generation engine

## 🗺️ Roadmap

### Current (v0.1.x)
- ✅ Modern icon system with cross-terminal compatibility
- ✅ Improved layout and visual feedback
- ✅ Slash command to agent conversion

### Next (v0.2.x)
- 🌐 **Web Editor** (Issue #13): Next.js + ReactFlow visual workflow editor
- 📊 **Workflow Templates**: Pre-built templates library
- 🔍 **Agent Search**: Full-text search across agents

### Future
- 📝 **Enhanced Validation**: Real-time workflow validation
- 🔄 **Workflow Versioning**: Track and manage workflow versions
- 🤝 **Team Collaboration**: Share and import workflows

## 📄 License

MIT

## 🔗 Links

- [NPM Package](https://www.npmjs.com/package/@hiraoku/cc-flow-cli)
- [GitHub Repository](https://github.com/s-hiraoku/cc-flow)
- [Issue Tracker](https://github.com/s-hiraoku/cc-flow/issues)
- [Changelog](./cc-flow-cli/CHANGELOG.md)

---

**CC-Flow v0.1.0**
Production-ready TUI for Claude Code workflow automation.
