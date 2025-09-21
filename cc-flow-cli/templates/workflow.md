---
description: { DESCRIPTION }
argument-hint: { ARGUMENT_HINT }
allowed-tools: [Read, Bash]
---

# {WORKFLOW_NAME}

Execute multiple sub-agents sequentially or in parallel to efficiently process complex tasks.

## Usage

```bash
/{WORKFLOW_NAME} "your task or requirement"
```

This command processes the task through the configured sub-agents in order.
Each agent receives the user task and builds upon previous agent results (see the generated instructions for the exact sequence).

######## POML GENERATED INSTRUCTIONS ########
{POML_GENERATED_INSTRUCTIONS}
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
/{WORKFLOW_NAME} "create a user authentication system"

Step 1 of 3: Execute spec-requirements
→ spec-requirements: [requirements analysis response]

Step 2 of 3: Execute spec-design
→ spec-design: [design specification response]

Step 3 of 3: Execute spec-implementation
→ spec-implementation: [implementation details response]

✅ Workflow completed
```
