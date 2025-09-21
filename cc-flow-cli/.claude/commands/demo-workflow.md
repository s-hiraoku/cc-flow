---
description: デモ用のスラッシュコマンドです
argument-hint: [context]
allowed-tools: [Read, Bash]
---

# demo-workflow

Execute multiple sub-agents sequentially or in parallel to efficiently process complex tasks.

## Usage

```bash
/demo-workflow "your task or requirement"
```

This command processes the task through the configured sub-agents in order.
Each agent receives the user task and builds upon previous agent results (see the generated instructions for the exact sequence).

######## POML GENERATED INSTRUCTIONS ########
**Role:** demo-workflow Workflow Orchestrator

## POML Generated Instructions You are a demo-workflow orchestrator that must delegate tasks to specialized sub-agents sequentially. User Instruction: $ARGUMENTS Context: sequential agent execution IMPORTANT: You MUST execute each sub-agent in the following order using the Task tool. DO NOT attempt to complete these tasks yourself. Instead, delegate each task to its specialized sub-agent. ### Sub-agent Execution Order 

- **Step 1 of 2: architecture-designer** Use the Task tool to launch the "architecture-designer" sub-agent with: - subagent_type: "architecture-designer" - description: "Execute architecture-designer for workflow step 1" - prompt: $ARGUMENTS Wait for the sub-agent to complete before proceeding to the next step.

- **Step 2 of 2: code-generator** Use the Task tool to launch the "code-generator" sub-agent with: - subagent_type: "code-generator" - description: "Execute code-generator for workflow step 2" - prompt: $ARGUMENTS Wait for the sub-agent to complete before proceeding to the next step.

 ### Final Consolidation After all sub-agents have completed their tasks: 1. Aggregate all sub-agent responses 2. Provide a comprehensive summary of the workflow results 3. Return the consolidated output with clear section headers for each sub-agent's contribution Output format: → [agent-name]: [response] Final output: ✅ Workflow completed

**Example:** ### Example Workflow Execution 

- Step 1: Execute architecture-designer - Input: $ARGUMENTS - Expected: Specialized processing by architecture-designer

- Step 2: Execute code-generator - Input: $ARGUMENTS - Expected: Specialized processing by code-generator

**Stepwise Instructions:** ### Stepwise Instructions 

- Step 1: Launch architecture-designer sub-agent - Use Task tool with subagent_type: "architecture-designer" - Pass user task: $ARGUMENTS - Wait for completion before next step

- Step 2: Launch code-generator sub-agent - Use Task tool with subagent_type: "code-generator" - Pass user task: $ARGUMENTS - Wait for completion before next step

- Final Step: Consolidate all sub-agent responses into comprehensive summary
######## POML GENERATED INSTRUCTIONS ########

## Workflow Execution

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
