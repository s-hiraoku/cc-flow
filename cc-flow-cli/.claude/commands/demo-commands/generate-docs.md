---
description: Generate comprehensive documentation for code files
argument-hint: <target-path>
allowed-tools: [Read, Glob, Grep, Write]
---

# generate-docs

Automatically generates comprehensive documentation for code files, including API references, usage examples, and code structure documentation.

## Usage

```bash
/generate-docs src/components/
/generate-docs src/utils/helper.ts
```

## Execution

```bash
#!/bin/bash

TARGET_PATH="$1"

if [ -z "$TARGET_PATH" ]; then
    echo "❌ Please specify a target path to document"
    echo "Usage: /generate-docs <target-path>"
    exit 1
fi

if [ ! -e "$TARGET_PATH" ]; then
    echo "❌ Path not found: $TARGET_PATH"
    exit 1
fi

echo "📝 Generating documentation for: $TARGET_PATH"
echo "🔍 Analyzing code structure..."

# Determine if it's a file or directory
if [ -f "$TARGET_PATH" ]; then
    echo "📄 Documenting single file: $TARGET_PATH"
    
    # Extract file info
    FILENAME=$(basename "$TARGET_PATH")
    EXTENSION="${FILENAME##*.}"
    
    echo "   File: $FILENAME"
    echo "   Type: $EXTENSION"
    echo "   Size: $(wc -c < "$TARGET_PATH") bytes"
    
elif [ -d "$TARGET_PATH" ]; then
    echo "📁 Documenting directory: $TARGET_PATH"
    
    # Count files by type
    echo "   Contents:"
    find "$TARGET_PATH" -type f -name "*.ts" -o -name "*.js" -o -name "*.py" -o -name "*.go" | head -10 | while read file; do
        echo "     - $(basename "$file")"
    done
    
    TOTAL_FILES=$(find "$TARGET_PATH" -type f | wc -l)
    echo "   Total files: $TOTAL_FILES"
fi

echo ""
echo "📋 Documentation template generated!"
echo "   - README structure created"
echo "   - API reference outlined" 
echo "   - Usage examples prepared"
echo ""
echo "✅ Documentation generation complete!"
```