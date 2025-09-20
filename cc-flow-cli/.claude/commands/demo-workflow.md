---
description: Execute demo workflow
argument-hint: [context]
allowed-tools: [Read, Bash]
---

# demo-workflow

Execute multiple sub-agents sequentially using POML workflow orchestration.

## Usage

```bash
/demo-workflow "your task or requirement"
```

This command processes the task through the following agents in sequence:
architecture-designer code-generator

Each agent receives the user task and builds upon previous agent results.

# Role

demo-workflow Workflow Orchestrator

# Task

User Instruction: workflow execution Context: sequential agent execution Execute sequential workflow with the following sub-agents: 

**Step 0 of 2: Execute architecture-designer** - Task: architecture-designer - Context: sequential agent execution - User Input: workflow execution Call: `claude subagent "architecture-designer" "workflow execution"` Expected Output Format: → architecture-designer: [response]

**Step 1 of 2: Execute code-generator** - Task: code-generator - Context: sequential agent execution - User Input: workflow execution Call: `claude subagent "code-generator" "workflow execution"` Expected Output Format: → code-generator: [response]

 **Final Step: Consolidation** - Aggregate all sub-agent responses - Return consolidated workflow output

# Output Format

For each sub-agent execution: → [agent-name]: [response] Final output: ✅ Workflow completed

## Workflow Execution

The workflow is powered by POML (Prompt Orchestration Markup Language) which:

1. **Defines sequential execution**: Agents execute in the specified order
2. **Passes context**: Each agent receives the user input and accumulated context
3. **Tracks progress**: Shows step-by-step execution with loop indexes
4. **Standardizes output**: Consistent response format across all agents

## Sub-agent Execution Format

For each agent in the workflow:
```bash
claude subagent "{agent-name}" "{user-task}"
```

Output format:
```
Step {N} of {total}: Execute {agent-name}
→ {agent-name}: [response]
```

## Example

For a workflow with agents `spec-requirements spec-design spec-implementation`:

```bash
/demo-workflow "create a user authentication system"

Step 1 of 3: Execute spec-requirements
→ spec-requirements: [requirements analysis response]

Step 2 of 3: Execute spec-design
→ spec-design: [design specification response]

Step 3 of 3: Execute spec-implementation
→ spec-implementation: [implementation details response]

✅ Workflow completed
```
