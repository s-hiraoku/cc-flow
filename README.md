# CC-Flow: Claude Code Workflow Platform

```
   ██████╗ ██████╗       ███████╗██╗      ██████╗ ██╗    ██╗
  ██╔════╝██╔════╝      ██╔════╝██║     ██╔═══██╗██║    ██║
  ██║     ██║     █████╗█████╗  ██║     ██║   ██║██║ █╗ ██║
  ██║     ██║     ╚════╝██╔══╝  ██║     ██║   ██║██║███╗██║
  ╚██████╗╚██████╗      ██║     ███████╗╚██████╔╝╚███╔███╔╝
   ╚═════╝ ╚═════╝      ╚═╝     ╚══════╝ ╚═════╝  ╚══╝╚══╝
```

🚀 **Create powerful Claude Code workflows with a beautiful interactive terminal interface**

CC-Flow makes it easy to build and run custom workflows that chain multiple Claude Code agents together. No complex configuration needed - just launch the interactive TUI and create workflows visually!

## 🎯 What is CC-Flow?

CC-Flow lets you:
- **Chain Claude Code agents** together in custom workflows
- **Create workflows visually** with an intuitive terminal interface  
- **Automate complex tasks** by combining multiple specialized agents
- **Save time** by reusing workflows for similar tasks

Perfect for development workflows like: specification creation, code review processes, testing pipelines, deployment automation, and more.

## ⚡ Quick Start

### 1. **Launch the Interactive TUI**

```bash
npx cc-work
```

**You'll see a beautiful welcome screen with:**
- 🎨 Colorful ASCII art logo
- 📋 Clear menu options
- ⌨️  Keyboard shortcuts
- 🌐 Language support (English/Japanese)

### 2. **Follow the Visual Setup**
- ✅ See the beautiful CC-FLOW welcome screen
- ✅ Choose your agent directory (e.g., "spec" for specification workflows)  
- ✅ Select which agents you want to use
- ✅ Set the execution order
- ✅ Preview and confirm your workflow

**Interactive Features:**
- ✨ Visual agent cards with descriptions
- 🎯 Smart selection modes (checkbox/number input/interactive)
- 📝 Real-time validation and tips
- 👀 Preview before confirmation

### 3. **Run Your Workflow**
```bash
# Use the generated workflow command
/your-workflow "describe your task here"
```

That's it! 🎉 Your custom workflow is ready to use.

## 🎨 Features

### **Beautiful Terminal Interface**
- 3-color ASCII art logo that adapts to your terminal size
- Intuitive menus and visual feedback
- Keyboard shortcuts and accessibility support
- Works on any terminal (minimum 50 characters wide)

**Terminal Experience:**
```
┌─ Select Agents (spec directory) ────────┐
│ Available agents:                        │
│ > ○ spec-init   🚀 Initialize project   │
│   ○ spec-design 🎨 Create architecture  │
│   ○ spec-impl   ⚙️  Implement features   │
└──────────────────────────────────────────┘
```

### **Easy Workflow Creation**
- Visual agent selection with descriptions
- Drag-and-drop style ordering
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
npx cc-work
# Select: spec → spec-init, spec-requirements, spec-design, spec-impl
# Run: /spec-workflow "build user authentication system"
```

**Workflow Creation Flow:**
```
📁 Select Directory → 🔍 Choose Agents → 📋 Set Order → ✅ Confirm → 🎉 Ready!
```

### **Code Review Process**
```bash
# Create a review workflow  
npx cc-work
# Select agents for: code analysis → security check → documentation
# Run: /review-workflow "review this pull request"
```

### **Testing Pipeline**
```bash
# Create a testing workflow
npx cc-work  
# Select agents for: unit tests → integration tests → e2e tests
# Run: /test-workflow "test the payment module"
```

## 🔧 Installation & Setup

### **Prerequisites** 
- Claude Code installed and running
- Node.js 18+ (for the TUI application)

### **Setup**
1. **Clone or download** the cc-flow repository
2. **Navigate to project**: `cd cc-flow`
3. **Install package globally**: `npm install -g cc-work`

### **Start Creating Workflows**
```bash
# Launch the TUI
npx cc-work

# Follow the interactive prompts
# Your workflow will be ready in minutes!
```

## 🤔 FAQ

### **How do I create my first workflow?**
Just run `npx cc-work` and follow the visual prompts. The TUI guides you through everything!

### **Can I use existing agents?**
Yes! CC-Flow comes with sample `spec` agents for specification-driven development. You can use them as-is or create your own.

### **How do I add new agents?**
1. Create a `.md` file in `/.claude/agents/your-category/`
2. Launch the TUI to include it in workflows
3. That's it! 

### **Can I run workflows without the TUI?**
Yes, you can also use the traditional `/create-workflow` command for scripting.

### **What if I need help?**
- The TUI has built-in help and validation
- Check the included sample agents for examples
- All workflows include error handling and recovery

## 🚀 Ready to Get Started?

```bash
npx cc-work
```

**Within 5 minutes you'll have:**
- ✅ A beautiful interactive workflow creator
- ✅ Custom workflows tailored to your needs  
- ✅ Powerful automation for your development tasks

**Success! Your workflow is ready:**
```bash
✅ /spec-workflow created successfully!
💡 Run: /spec-workflow "your task description"
🎯 Agents: spec-init → spec-requirements → spec-design → spec-impl
```

Happy workflow building! 🎉

---

**CC-Flow v1.0 - Production Ready** ✅  
*Complete with beautiful TUI and full accessibility support*