---
description: Execute utility workflow
argument-hint: [context]
allowed-tools: [Read, Bash]
---

# utility-workflow

Execute multiple sub-agents sequentially based on workflow type.

## Usage

```bash
/utility-workflow "context description"
```

## Execution

```bash
# Parse arguments
USER_CONTEXT="$*"

# Define agent list directly
AGENT_LIST="typescript-helper npm-package-builder tui-designer inquirer-ui-expert cli-tester error-handler accessibility-checker"

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

- `Execute utility workflow`: Brief workflow description
- `[context]`: Expected arguments format  
- `utility-workflow`: Command name (matches filename)

## Example

For `example-workflow.md`:
- `Execute utility workflow` → "Execute example workflow"
- `[context]` → "[context]"
- `utility-workflow` → "example-workflow"

Usage: `/example-workflow "your task description"`
