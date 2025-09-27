#!/bin/bash
# Delegates to the shared workflow script located at repo-level scripts/workflow.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LOCAL_LINK="$SCRIPT_DIR/workflow/create-workflow.sh"
SHARED_SCRIPT="$REPO_ROOT/../scripts/workflow/create-workflow.sh"

if [ -f "$LOCAL_LINK" ]; then
  exec "$LOCAL_LINK" "$@"
fi

if [ -f "$SHARED_SCRIPT" ]; then
  exec "$SHARED_SCRIPT" "$@"
fi

echo "⚠️  Shared workflow script not found (checked $LOCAL_LINK and $SHARED_SCRIPT)" >&2
echo "Please ensure the repository scripts/workflow directory is available." >&2
exit 1
