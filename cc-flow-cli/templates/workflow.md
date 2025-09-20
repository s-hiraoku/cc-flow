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

{POML_GENERATED_INSTRUCTIONS}

## Template Variables Reference

- `{DESCRIPTION}`: Brief workflow description
- `{ARGUMENT_HINT}`: Expected arguments format
- `{WORKFLOW_NAME}`: Command name (matches filename)
- `{WORKFLOW_AGENT_LIST}`: Space-separated list of agent names

## Example

For a workflow named `example-workflow` with agents `agent1 agent2`:

```
/{WORKFLOW_NAME} "implement user authentication with JWT tokens"

→ agent1
[agent1 analyzes requirements and creates design]
→ agent2
[agent2 implements the authentication logic]
✅ Workflow completed
```