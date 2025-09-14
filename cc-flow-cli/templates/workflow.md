---
description: {DESCRIPTION}
argument-hint: {ARGUMENT_HINT}
allowed-tools: [Read, Bash]
---

# {WORKFLOW_NAME}

Execute multiple sub-agents sequentially based on workflow type.

## Usage

```
/{WORKFLOW_NAME} "your task or requirement"
```

## Execution Instructions

You are asked to execute a sequential workflow with the following agents:
`{WORKFLOW_AGENT_LIST}`

Please perform these steps:

1. **Parse Input**: Receive the user's context from the command arguments provided as "$*"

2. **Sequential Agent Execution**: For each agent in the list above, execute in order:
   
   a. Display progress indicator: "→ [agent-name]"
   
   b. Invoke the sub-agent with the current accumulated context:
      - Pass the task description and current context to the agent
      - Use the pattern: "Task: [agent-name]. Context: [accumulated-context]"
   
   c. Capture and display the agent's response
   
   d. Update the accumulated context by appending:
      "[agent-name]: [response]" to the existing context
   
   e. Continue to the next agent with the updated context

3. **Completion**: After all agents have been executed successfully, display:
   "✅ Workflow completed"

## Context Management

- Initial context: User-provided command arguments
- Context accumulation: Each agent's output enriches the context for subsequent agents
- Final output: Complete trace of all agent executions and their responses

## Error Handling

If any agent fails to execute:
- Display "Failed" for that agent
- Continue with remaining agents using the available context
- Include failure notation in the accumulated context

## Template Variables Reference

- `{DESCRIPTION}`: Brief workflow description
- `{ARGUMENT_HINT}`: Expected arguments format  
- `{WORKFLOW_NAME}`: Command name (matches filename)
- `{WORKFLOW_AGENT_LIST}`: Space-separated list of agent names

## Example

For a workflow named `example-workflow` with agents `agent1 agent2`:

```
/example-workflow "implement user authentication with JWT tokens"

→ agent1
[agent1 analyzes requirements and creates design]
→ agent2  
[agent2 implements the authentication logic]
✅ Workflow completed
```