---
description: {DESCRIPTION}
argument-hint: {ARGUMENT_HINT}
allowed-tools: [Read, Bash]
---

# {WORKFLOW_NAME}

Execute multiple sub-agents sequentially based on workflow type.

## Usage

```bash
/{WORKFLOW_NAME} {WORKFLOW_TYPE}
/{WORKFLOW_NAME} {WORKFLOW_TYPE} "context description"
```

## Execution

```bash
# Parse arguments
eval "args=($ARGUMENTS)"
WORKFLOW_TYPE="${args[0]}"
USER_CONTEXT="${args[@]:1}"

[[ -z "$WORKFLOW_TYPE" ]] && { echo "Error: Workflow type required"; exit 1; }

# Get agent list from POML
WORKFLOW_DEF=$(npx pomljs --file "poml/commands/workflow.poml" \
  --context "workflow_type=$WORKFLOW_TYPE" \
  --context "user_context=$USER_CONTEXT")

AGENT_LIST=$(echo "$WORKFLOW_DEF" | grep "AGENTS:" | sed 's/AGENTS: *//' | tr ',' ' ')
[[ -z "$AGENT_LIST" ]] && { echo "Error: No agents found"; exit 1; }

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
- `{WORKFLOW_TYPE}`: Example workflow type

## Example

For `spec-workflow.md`:
- `{DESCRIPTION}` → "Execute specification workflow"
- `{ARGUMENT_HINT}` → "[type] [context]"
- `{WORKFLOW_NAME}` → "spec-workflow"
- `{WORKFLOW_TYPE}` → "spec-implementation"

Usage: `/spec-workflow spec-implementation "create auth system"`