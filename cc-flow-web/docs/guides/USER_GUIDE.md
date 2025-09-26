# User Guide

Complete guide for using the CC-Flow Web Editor to create and manage workflows visually.

## 🚀 Getting Started

### Accessing the Editor
1. **From CC-Flow CLI**: Run `cc-flow web` (planned integration)
2. **Direct Access**: Navigate to `http://localhost:3002/editor`
3. **From Homepage**: Click "Open Editor" button

### Interface Overview
The web editor consists of three main areas:

```
┌─────────────┬─────────────────────────┬─────────────────┐
│             │                         │                 │
│   Agent     │                         │   Properties    │
│   Palette   │        Canvas           │     Panel       │
│             │      (ReactFlow)        │                 │
│             │                         │                 │
└─────────────┴─────────────────────────┴─────────────────┘
```

## 🎨 Creating Your First Workflow

### Step 1: Set Workflow Metadata
1. In the **Properties Panel** (right sidebar):
   - Enter a **Workflow Name** (required)
   - Add a **Purpose** description
   - Select a **Model** (claude-3-sonnet, claude-opus-4, etc.)
   - Add **Argument Hint** if needed (e.g., `<context>`)

### Step 2: Add Agents to Canvas
1. Browse available agents in the **Agent Palette** (left sidebar)
2. **Drag and drop** agents onto the canvas
3. Agents will appear as interactive nodes

### Step 3: Connect Agents (Optional)
1. Hover over an agent node to see connection handles
2. **Drag from output handle** (bottom) to input handle (top) of another agent
3. Create execution flow connections

### Step 4: Preview and Save
1. View the **JSON Preview** in the Properties Panel
2. Click **Save** when ready (requires workflow name and at least one agent)

## 🖱️ Using the Canvas

### Navigation
- **Pan**: Click and drag empty canvas area
- **Zoom**: Mouse wheel or zoom controls
- **Fit View**: Use controls panel to fit all nodes
- **Mini Map**: Overview in bottom right corner

### Working with Nodes
- **Select**: Click on any node
- **Move**: Drag selected nodes
- **Delete**: Select node and press `Delete` key
- **Multi-select**: Ctrl/Cmd + click multiple nodes

### Node Types
1. **Agent Nodes**: Represent individual agents
   - Display agent name and description
   - Show category badge
   - Draggable connection handles

2. **Step Group Nodes**: Groups of agents (planned)
   - Sequential or parallel execution
   - Multiple agent management

## 🔍 Agent Palette Features

### Browsing Agents
- **All Agents**: View complete agent library
- **Categories**: Filter by agent type (spec, utility, etc.)
- **Search**: Find agents by name or description

### Agent Information
Each agent card shows:
- **Name**: Agent identifier
- **Description**: Purpose and functionality
- **Category**: Classification badge
- **Path**: File location (tooltip)

### Adding Agents
1. **Drag & Drop**: Primary method for adding agents
2. **Visual Feedback**: Dashed border indicates draggable items
3. **Drop Zones**: Entire canvas accepts agent drops

## ⚙️ Properties Panel

### Workflow Configuration
- **Name**: Required identifier for the workflow
- **Purpose**: Description of workflow goals
- **Model**: AI model selection for execution
- **Argument Hint**: Parameter guidance for users

### Workflow Statistics
- **Nodes**: Count of agents in workflow
- **Connections**: Number of agent connections
- **Real-time Updates**: Statistics update automatically

### JSON Preview
- **Live Preview**: Real-time workflow configuration
- **Copy-friendly**: Formatted JSON for CLI use
- **Validation**: Visual indication of completeness

## 🔗 Workflow Connections

### Creating Connections
1. **Hover** over any agent node
2. **Drag** from the bottom handle (source)
3. **Drop** on the top handle of target agent
4. Connection line appears between agents

### Connection Types
- **Sequential**: One agent follows another
- **Parallel**: Multiple agents from one source (planned)
- **Conditional**: Branching logic (planned)

### Managing Connections
- **Delete**: Select connection line and press `Delete`
- **Reconnect**: Drag connection end to new target
- **Visual Feedback**: Highlight on hover

## 💾 Saving Workflows

### Save Requirements
- ✅ **Workflow Name**: Must be provided
- ✅ **At least one agent**: Minimum workflow content
- ⚠️ **Valid configuration**: No circular dependencies

### Save Process
1. **Validate**: Automatic validation before saving
2. **Generate**: Convert visual workflow to JSON
3. **Save**: Store workflow file in designated location
4. **Feedback**: Success/error message display

### File Output
```json
{
  "workflowName": "my-workflow",
  "workflowPurpose": "Example workflow",
  "workflowModel": "claude-3-sonnet",
  "workflowSteps": [
    {
      "title": "Generated Step",
      "mode": "sequential",
      "purpose": "Execute selected agents",
      "agents": ["agent1", "agent2"]
    }
  ]
}
```

## ⌨️ Keyboard Shortcuts

### Navigation
- **Space + Drag**: Pan canvas
- **Mouse Wheel**: Zoom in/out
- **Ctrl/Cmd + 0**: Fit view to content
- **Ctrl/Cmd + 1**: Reset zoom to 100%

### Selection
- **Click**: Select single node
- **Ctrl/Cmd + Click**: Multi-select nodes
- **Ctrl/Cmd + A**: Select all nodes
- **Escape**: Clear selection

### Editing
- **Delete**: Remove selected nodes/connections
- **Ctrl/Cmd + Z**: Undo (planned)
- **Ctrl/Cmd + Y**: Redo (planned)
- **Ctrl/Cmd + S**: Save workflow

## 🎯 Best Practices

### Workflow Design
1. **Meaningful Names**: Use descriptive workflow names
2. **Clear Purpose**: Document workflow goals
3. **Logical Flow**: Arrange agents in execution order
4. **Agent Selection**: Choose appropriate agents for tasks

### Visual Organization
1. **Consistent Layout**: Align nodes for clarity
2. **Logical Grouping**: Keep related agents together
3. **Clear Connections**: Avoid crossing connection lines
4. **Use Space**: Don't overcrowd the canvas

### Performance Tips
1. **Moderate Size**: Keep workflows manageable
2. **Organized Palette**: Use categories and search
3. **Regular Saves**: Save work frequently
4. **Browser Performance**: Close unused tabs

## 🐛 Troubleshooting

### Common Issues

#### "Cannot save workflow"
- ✅ Check that workflow name is provided
- ✅ Ensure at least one agent is added
- ✅ Verify no browser errors in console

#### "Drag and drop not working"
- ✅ Ensure you're dragging from agent cards
- ✅ Try dropping on empty canvas area
- ✅ Check browser console for errors

#### "Agents not loading"
- ✅ Verify `.claude/agents/` directory exists
- ✅ Check file permissions
- ✅ Look for errors in browser console

#### "Canvas performance issues"
- ✅ Reduce number of nodes on canvas
- ✅ Close other browser tabs
- ✅ Check available system memory

### Getting Help
1. **Browser Console**: Press F12 to check for errors
2. **Documentation**: Review technical documentation
3. **GitHub Issues**: Report bugs and feature requests
4. **Community**: Join discussions and get support

## 🔮 Advanced Features (Planned)

### Templates
- **Workflow Templates**: Pre-built workflow patterns
- **Custom Templates**: Save workflows as reusable templates
- **Template Library**: Community-shared templates

### Collaboration
- **Real-time Editing**: Multiple users on same workflow
- **Version Control**: Track workflow changes
- **Comments**: Annotate workflows with notes

### Integration
- **CLI Sync**: Bidirectional workflow synchronization
- **Export Options**: Multiple output formats
- **Plugin System**: Extend functionality with plugins

## 📱 Browser Compatibility

### Supported Browsers
- ✅ **Chrome 90+**: Full functionality
- ✅ **Firefox 88+**: Full functionality  
- ✅ **Safari 14+**: Full functionality
- ✅ **Edge 90+**: Full functionality

### Required Features
- ES2020 JavaScript support
- CSS Grid and Flexbox
- Fetch API
- Local Storage

### Performance Recommendations
- **RAM**: 4GB+ for large workflows
- **Display**: 1280x720+ resolution
- **Network**: Stable internet connection

---

**User Guide Version**: 2.0
**Last Updated**: 2025-01-26
**Feedback**: [GitHub Issues](https://github.com/anthropics/claude-code/issues)