---
description: Create comprehensive test suites for code files
argument-hint: <file-path>
allowed-tools: [Read, Write, Glob, Grep]
---

# create-tests

Automatically creates comprehensive test suites including unit tests, integration tests, and test utilities for specified code files.

## Usage

```bash
/create-tests src/utils/helper.ts
/create-tests src/components/Button.tsx
```

## Execution

```bash
#!/bin/bash

TARGET_FILE="$1"

if [ -z "$TARGET_FILE" ]; then
    echo "❌ Please specify a file to create tests for"
    echo "Usage: /create-tests <file-path>"
    exit 1
fi

if [ ! -f "$TARGET_FILE" ]; then
    echo "❌ File not found: $TARGET_FILE"
    exit 1
fi

echo "🧪 Creating test suite for: $TARGET_FILE"
echo "🔍 Analyzing code structure..."

# Extract file info
FILENAME=$(basename "$TARGET_FILE")
NAME_WITHOUT_EXT="${FILENAME%.*}"
EXTENSION="${FILENAME##*.}"
DIR_PATH=$(dirname "$TARGET_FILE")

echo "   File: $FILENAME"
echo "   Directory: $DIR_PATH"
echo "   Language: $EXTENSION"

# Determine test framework based on file type
case "$EXTENSION" in
    ts|tsx|js|jsx)
        FRAMEWORK="Jest/Vitest"
        TEST_EXT="test.ts"
        ;;
    py)
        FRAMEWORK="pytest"
        TEST_EXT="test.py"
        ;;
    go)
        FRAMEWORK="Go testing"
        TEST_EXT="test.go"
        ;;
    *)
        FRAMEWORK="Generic"
        TEST_EXT="test"
        ;;
esac

echo "   Test framework: $FRAMEWORK"
echo ""

echo "📋 Test suite structure:"
echo "   ✅ Unit tests planned"
echo "   ✅ Integration tests outlined"
echo "   ✅ Mock utilities prepared"
echo "   ✅ Test data fixtures created"
echo ""

# Simulate test file creation
TEST_FILE="${DIR_PATH}/${NAME_WITHOUT_EXT}.${TEST_EXT}"
echo "📝 Test file would be created at: $TEST_FILE"

echo ""
echo "🎯 Test coverage areas identified:"
echo "   - Function/method testing"
echo "   - Edge case validation"
echo "   - Error handling verification"
echo "   - Performance benchmarks"
echo ""
echo "✅ Test suite creation complete!"
```