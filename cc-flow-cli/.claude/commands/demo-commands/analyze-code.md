---
description: Analyze code structure and provide insights
argument-hint: <file-path>
allowed-tools: [Read, Glob, Grep, WebSearch]
---

# analyze-code

Performs comprehensive code analysis including structure, patterns, complexity, and potential improvements.

## Usage

```bash
/analyze-code src/components/Button.tsx
```

## Execution

```bash
#!/bin/bash

TARGET_FILE="$1"

if [ -z "$TARGET_FILE" ]; then
    echo "❌ Please specify a file to analyze"
    echo "Usage: /analyze-code <file-path>"
    exit 1
fi

if [ ! -f "$TARGET_FILE" ]; then
    echo "❌ File not found: $TARGET_FILE"
    exit 1
fi

echo "🔍 Analyzing code structure for: $TARGET_FILE"
echo "📊 Generating analysis report..."

# Basic file info
echo "📄 File Information:"
echo "   Size: $(wc -c < "$TARGET_FILE") bytes"
echo "   Lines: $(wc -l < "$TARGET_FILE")"

# Language detection
case "$TARGET_FILE" in
    *.ts|*.tsx) echo "   Language: TypeScript" ;;
    *.js|*.jsx) echo "   Language: JavaScript" ;;
    *.py) echo "   Language: Python" ;;
    *.go) echo "   Language: Go" ;;
    *) echo "   Language: Unknown" ;;
esac

echo ""
echo "✅ Analysis complete. Review the insights above."
```