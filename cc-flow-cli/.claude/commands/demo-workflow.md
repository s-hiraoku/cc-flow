---
description: Execute demo workflow
argument-hint: [context]
allowed-tools: [Read, Bash]
---

# demo-workflow

Execute sub-agents in sequence: **architecture-designer code-generator**

## Usage

```
/demo-workflow "your task or requirement"
```

## Execution Instructions

This workflow executes each sub-agent in the specified sequence, passing accumulated context between agents.

### Workflow Process

1. **Initialize Context**

   - Start with user-provided context: `$*`

2. **Execute Each Sub-Agent**

   For each agent in the sequence **architecture-designer code-generator**:

   - **Display Progress**

     ```
     → [agent-name]
     ```

   - **Invoke Sub-Agent**

     ```
     claude subagent "[agent-name]" "[accumulated-context]"
     ```

   - **Accumulate Context**

     Add the agent's response to the context for the next agent

3. **Complete Workflow**
   ```
   ✅ Workflow completed
   ```

### Context Management

- **Initial Context**: User input from command arguments
- **Progressive Context**: Each agent's output enriches the context
- **Final Output**: Complete trace of all agent executions

### Expected Execution Pattern

```
Initialize: "your task description"

→ architecture-designer
[Sub-agent executes with initial context]
Context: "your task description\narchitecture-designer: [design output]"

→ code-generator
[Sub-agent executes with enriched context]
Context: "your task description\narchitecture-designer: [design output]\ncode-generator: [implementation output]"

✅ Workflow completed
```

## Example

```
/demo-workflow "implement user authentication with JWT tokens"

→ architecture-designer
[architecture-designer analyzes requirements and creates design]
→ code-generator
[code-generator implements the authentication logic]
✅ Workflow completed
```
