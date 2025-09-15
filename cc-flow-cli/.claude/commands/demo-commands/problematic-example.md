---
description: Example of a problematic slash command (requires manual adjustment)
argument-hint: <target-directory>
allowed-tools: [Bash]
---

# problematic-example

⚠️ This command demonstrates patterns that require manual adjustment when converting to agent format.

## Problematic patterns

### Bash Script Execution
```bash
#!/bin/bash

TARGET_DIR="$1"

if [ -z "$TARGET_DIR" ]; then
    echo "❌ Usage: /problematic-example <directory>"
    exit 1
fi

if [ ! -d "$TARGET_DIR" ]; then
    echo "❌ Directory not found: $TARGET_DIR"
    exit 1
fi

# System commands
sudo chown -R $(whoami) "$TARGET_DIR"
find "$TARGET_DIR" -type f -exec chmod 644 {} \;

# Interactive input
read -p "Continue with cleanup? (y/N): " confirm
if [[ "$confirm" != "y" ]]; then
    echo "Aborted"
    exit 0
fi

# External tool dependency
if command -v docker &> /dev/null; then
    docker system prune -f
fi

echo "✅ Cleanup complete"
```

## Issues for agent conversion:
- ❌ Direct bash execution (`#!/bin/bash`)
- ❌ Argument handling (`$1`, exit codes)
- ❌ System commands (`sudo`, `chmod`)
- ❌ Interactive input (`read -p`)
- ❌ External dependencies (`docker`)

## Agent-friendly alternative:
Instead of this complex bash script, an agent would:
1. Use Read tool to analyze directory structure
2. Use Write tool to create cleanup recommendations
3. Provide step-by-step guidance instead of direct system modification
4. Use built-in tools rather than external dependencies