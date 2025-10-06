#!/bin/bash
# Wrapper script to keep backwards compatibility for create-workflow
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKFLOW_SCRIPT="$SCRIPT_DIR/workflow/create-workflow.sh"

if [ ! -f "$WORKFLOW_SCRIPT" ]; then
  echo "❌ scripts/workflow/create-workflow.sh not found" >&2
  exit 1
fi

exec "$WORKFLOW_SCRIPT" "$@"
