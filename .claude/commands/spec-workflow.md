---
description: Execute spec workflow
argument-hint: [context]
allowed-tools: [Read, Bash]
---

# spec-workflow

Execute multiple sub-agents sequentially based on workflow type.

## Usage

```bash
/spec-workflow "context description"
```

## Execution

```bash
# Parse arguments
USER_CONTEXT="$ARGUMENTS"

# Get agent list from POML
WORKFLOW_DEF=$(npx pomljs --file "poml/commands/spec-workflow.poml" \
  --context "user_input=$USER_CONTEXT" \
  --context "context=$USER_CONTEXT")

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
- `[context]`: Expected arguments format  
- `spec-workflow`: Command name (matches filename)

## Example

For `spec-workflow.md`:
- `Execute spec workflow` → "Execute specification workflow"
- `[context]` → "[context]"
- `spec-workflow` → "spec-workflow"

Usage: `/spec-workflow "create auth system"`
