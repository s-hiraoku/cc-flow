---
description: 名前指定テスト
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
architecture-designer quality-checker

Each agent receives the user task and builds upon previous agent results.

# Role

demo-workflow Workflow Orchestrator

# Task

You are a workflow orchestrator that must delegate tasks to specialized sub-agents sequentially. User Instruction: workflow execution Context: sequential agent execution IMPORTANT: You MUST execute each sub-agent in the following order using the Task tool. DO NOT attempt to complete these tasks yourself. Instead, delegate each task to its specialized sub-agent. Execute the following sub-agents in sequence: 

**Step 1 of 2: architecture-designer** Use the Task tool to launch the "architecture-designer" sub-agent with: - subagent_type: "architecture-designer" - description: "Execute architecture-designer for workflow step 1" - prompt: "workflow execution" The sub-agent will handle the specialized task and return its results. Wait for the sub-agent to complete before proceeding to the next step.

**Step 2 of 2: quality-checker** Use the Task tool to launch the "quality-checker" sub-agent with: - subagent_type: "quality-checker" - description: "Execute quality-checker for workflow step 2" - prompt: "workflow execution" The sub-agent will handle the specialized task and return its results. Wait for the sub-agent to complete before proceeding to the next step.

 **Final Step: Consolidation** After all sub-agents have completed their tasks: 1. Aggregate all sub-agent responses 2. Provide a comprehensive summary of the workflow results 3. Return the consolidated output with clear section headers for each sub-agent's contribution

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
