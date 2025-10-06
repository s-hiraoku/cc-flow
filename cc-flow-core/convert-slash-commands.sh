#!/bin/bash
# Wrapper script for convert-slash-commands
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONVERT_SCRIPT="$SCRIPT_DIR/workflow/utils/convert-slash-commands.sh"

if [ ! -f "$CONVERT_SCRIPT" ]; then
  echo "❌ scripts/workflow/utils/convert-slash-commands.sh not found" >&2
  exit 1
fi

exec "$CONVERT_SCRIPT" "$@"
