---
description: {DESCRIPTION}
argument-hint: {ARGUMENT_HINT}
allowed-tools: [Read, Bash]
---

# {WORKFLOW_NAME}

Execute multiple sub-agents sequentially based on workflow type.

## Usage

```bash
/{WORKFLOW_NAME} "context description"
```

## Execution

```bash
# Parse arguments
USER_CONTEXT="$*"

# Define agent list directly
AGENT_LIST="{WORKFLOW_AGENT_LIST}"

echo "Executing: $AGENT_LIST"

# Execute agents sequentially
CONTEXT="$USER_CONTEXT"
for agent in $AGENT_LIST; do
  echo "→ $agent"
  RESPONSE=$(echo "Task: $agent. Context: $CONTEXT" | claude subagent "$agent" 2>/dev/null || echo "Failed")
  CONTEXT="$CONTEXT. $agent: $RESPONSE"
  echo "$RESPONSE"
done

echo "✅ Workflow completed"
```

## Template Variables

- `{DESCRIPTION}`: Brief workflow description
- `{ARGUMENT_HINT}`: Expected arguments format  
- `{WORKFLOW_NAME}`: Command name (matches filename)

## Example

For `spec-workflow.md`:
- `{DESCRIPTION}` → "Execute specification workflow"
- `{ARGUMENT_HINT}` → "[context]"
- `{WORKFLOW_NAME}` → "spec-workflow"

Usage: `/spec-workflow "create auth system"`