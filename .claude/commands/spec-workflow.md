---
description: Execute spec workflow
argument-hint: [type] [context]
allowed-tools: [Read, Bash]
---

# spec-workflow

Execute multiple sub-agents sequentially based on workflow type.

## Usage

```bash
/spec-workflow implementation
/spec-workflow implementation "context description"
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

- `Execute spec workflow`: Brief workflow description
- `[type] [context]`: Expected arguments format  
- `spec-workflow`: Command name (matches filename)
- `implementation`: Example workflow type

## Example

For `spec-workflow.md`:
- `Execute spec workflow` → "Execute specification workflow"
- `[type] [context]` → "[type] [context]"
- `spec-workflow` → "spec-workflow"
- `implementation` → "spec-implementation"

Usage: `/spec-workflow spec-implementation "create auth system"`
