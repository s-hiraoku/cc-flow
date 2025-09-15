#!/usr/bin/env bats

# Test for convert-command.sh script

setup() {
    # テスト用の一時ディレクトリとファイル
    export TEST_DIR="$(mktemp -d)"
    export SCRIPT="$BATS_TEST_DIRNAME/../cc-flow-cli/scripts/convert-command.sh"
    export ORIGINAL_PWD="$PWD"
    
    # テスト用のソースファイルを作成
    mkdir -p "$TEST_DIR/source"
    cat > "$TEST_DIR/source/test-command.md" << 'EOF'
---
description: Test command description
allowed-tools: [Bash, Read]
argument-hint: <test-args>
---

# Test Command

This is a test command.

## Usage

Run this command with arguments.
EOF

    # bashコード付きのコマンドファイル
    cat > "$TEST_DIR/source/bash-heavy.md" << 'EOF'
---
description: Bash heavy command
allowed-tools: [Bash]
---

# Bash Heavy

```bash
#!/bin/bash
ARGS="$1"
VALUE=$2
echo "Processing: $*"
exit 0
```

More content here.
EOF

    # exitコード付きのコマンドファイル
    cat > "$TEST_DIR/source/with-exit.md" << 'EOF'
---
description: Command with exit
---

# Exit Command

```bash
if [ -z "$1" ]; then
    exit 1
fi
exit 0
```
EOF

    # テンプレートファイルを作成
    mkdir -p "$TEST_DIR/templates"
    cat > "$TEST_DIR/templates/agent-template.md" << 'EOF'
---
name: {AGENT_NAME}
model: {AGENT_MODEL}
tools: {AGENT_TOOLS}
color: {AGENT_COLOR}
---

# Agent: {AGENT_NAME}

Description: {AGENT_DESCRIPTION}

## Source
- Path: {SOURCE_PATH}
- Date: {CONVERSION_DATE}

## Content
{AGENT_CONTENT}
EOF
    
    # テストディレクトリに移動
    cd "$TEST_DIR"
}

teardown() {
    # 元のディレクトリに戻る
    cd "$ORIGINAL_PWD"
    # テストディレクトリを削除
    rm -rf "$TEST_DIR"
}

@test "convert-command.sh shows usage when no arguments" {
    run "$SCRIPT"
    
    [ "$status" -eq 1 ]
    [[ "$output" =~ "Usage:" ]]
    [[ "$output" =~ "<source_file> <target_directory>" ]]
}

@test "convert-command.sh shows usage with only one argument" {
    run "$SCRIPT" "source.md"
    
    [ "$status" -eq 1 ]
    [[ "$output" =~ "Usage:" ]]
}

@test "convert-command.sh fails with non-existent source file" {
    run "$SCRIPT" "nonexistent.md" "$TEST_DIR/output"
    
    [ "$status" -eq 1 ]
    [[ "$output" =~ "エラー: ソースファイルが見つかりません" ]]
    [[ "$output" =~ "nonexistent.md" ]]
}

@test "convert-command.sh fails with non-existent template" {
    run "$SCRIPT" "$TEST_DIR/source/test-command.md" "$TEST_DIR/output" "nonexistent-template.md"
    
    [ "$status" -eq 1 ]
    [[ "$output" =~ "エラー: テンプレートファイルが見つかりません" ]]
}

@test "convert-command.sh converts simple command successfully" {
    run "$SCRIPT" "$TEST_DIR/source/test-command.md" "$TEST_DIR/output" "$TEST_DIR/templates/agent-template.md"
    
    [ "$status" -eq 0 ]
    [[ "$output" =~ "🔄 変換中:" ]]
    [[ "$output" =~ "✅ 変換完了:" ]]
    [ -f "$TEST_DIR/output/test-command.md" ]
    
    # 生成されたファイルの内容確認
    local content=$(cat "$TEST_DIR/output/test-command.md")
    [[ "$content" =~ "Agent: test-command" ]]
    [[ "$content" =~ "Description: Test command description" ]]
    [[ "$content" =~ "tools: [Bash, Read]" ]]
    [[ "$content" =~ "model: sonnet" ]]
}

@test "convert-command.sh creates target directory if not exists" {
    [ ! -d "$TEST_DIR/new-output" ]
    
    run "$SCRIPT" "$TEST_DIR/source/test-command.md" "$TEST_DIR/new-output" "$TEST_DIR/templates/agent-template.md"
    
    [ "$status" -eq 0 ]
    [ -d "$TEST_DIR/new-output" ]
    [ -f "$TEST_DIR/new-output/test-command.md" ]
}

@test "convert-command.sh shows warning for bash code blocks" {
    run "$SCRIPT" "$TEST_DIR/source/bash-heavy.md" "$TEST_DIR/output" "$TEST_DIR/templates/agent-template.md"
    
    [ "$status" -eq 0 ]
    [[ "$output" =~ "⚠️  変換警告:" ]]
    [[ "$output" =~ "bashコードが含まれています" ]]
}

@test "convert-command.sh shows warning for argument usage" {
    run "$SCRIPT" "$TEST_DIR/source/bash-heavy.md" "$TEST_DIR/output" "$TEST_DIR/templates/agent-template.md"
    
    [ "$status" -eq 0 ]
    [[ "$output" =~ "引数(\$1, \$2等)を使用しています" ]]
}

@test "convert-command.sh shows warning for exit statements" {
    run "$SCRIPT" "$TEST_DIR/source/with-exit.md" "$TEST_DIR/output" "$TEST_DIR/templates/agent-template.md"
    
    [ "$status" -eq 0 ]
    [[ "$output" =~ "exit文を使用しています" ]]
}

@test "convert-command.sh extracts metadata correctly" {
    run "$SCRIPT" "$TEST_DIR/source/test-command.md" "$TEST_DIR/output" "$TEST_DIR/templates/agent-template.md"
    
    [ "$status" -eq 0 ]
    
    local content=$(cat "$TEST_DIR/output/test-command.md")
    [[ "$content" =~ "Test command description" ]]
    [[ "$content" =~ "[Bash, Read]" ]]
}

@test "convert-command.sh uses default values for missing metadata" {
    # メタデータが不完全なファイルを作成
    cat > "$TEST_DIR/source/minimal.md" << 'EOF'
---
---

# Minimal Command
Content
EOF
    
    run "$SCRIPT" "$TEST_DIR/source/minimal.md" "$TEST_DIR/output" "$TEST_DIR/templates/agent-template.md"
    
    [ "$status" -eq 0 ]
    
    local content=$(cat "$TEST_DIR/output/minimal.md")
    [[ "$content" =~ "Converted from slash command: minimal" ]]
    [[ "$content" =~ "[Read, Write, Bash]" ]]
}

@test "convert-command.sh preserves markdown content" {
    run "$SCRIPT" "$TEST_DIR/source/test-command.md" "$TEST_DIR/output" "$TEST_DIR/templates/agent-template.md"
    
    [ "$status" -eq 0 ]
    
    local content=$(cat "$TEST_DIR/output/test-command.md")
    [[ "$content" =~ "This is a test command" ]]
    [[ "$content" =~ "Run this command with arguments" ]]
}

@test "convert-command.sh handles special characters in content" {
    cat > "$TEST_DIR/source/special-chars.md" << 'EOF'
---
description: Command with special chars & symbols
---

# Special Characters

Content with $pecial ch@rs & |pipes| and \backslashes\
EOF
    
    run "$SCRIPT" "$TEST_DIR/source/special-chars.md" "$TEST_DIR/output" "$TEST_DIR/templates/agent-template.md"
    
    [ "$status" -eq 0 ]
    [ -f "$TEST_DIR/output/special-chars.md" ]
}

@test "convert-command.sh replaces all template placeholders" {
    run "$SCRIPT" "$TEST_DIR/source/test-command.md" "$TEST_DIR/output" "$TEST_DIR/templates/agent-template.md"
    
    [ "$status" -eq 0 ]
    
    local content=$(cat "$TEST_DIR/output/test-command.md")
    
    # プレースホルダーが残っていないことを確認
    [[ ! "$content" =~ "{AGENT_NAME}" ]]
    [[ ! "$content" =~ "{AGENT_DESCRIPTION}" ]]
    [[ ! "$content" =~ "{AGENT_MODEL}" ]]
    [[ ! "$content" =~ "{AGENT_TOOLS}" ]]
    [[ ! "$content" =~ "{AGENT_COLOR}" ]]
    [[ ! "$content" =~ "{SOURCE_PATH}" ]]
    [[ ! "$content" =~ "{CONVERSION_DATE}" ]]
}

@test "convert-command.sh handles spaces in placeholders" {
    # スペース付きプレースホルダーのテンプレート
    cat > "$TEST_DIR/templates/space-template.md" << 'EOF'
---
name: { AGENT_NAME }
model: { AGENT_MODEL }
---
# { AGENT_NAME }
Description: { AGENT_DESCRIPTION }
EOF
    
    run "$SCRIPT" "$TEST_DIR/source/test-command.md" "$TEST_DIR/output" "$TEST_DIR/templates/space-template.md"
    
    [ "$status" -eq 0 ]
    
    local content=$(cat "$TEST_DIR/output/test-command.md")
    [[ "$content" =~ "name: test-command" ]]
    [[ "$content" =~ "# test-command" ]]
    [[ ! "$content" =~ "{ AGENT_NAME }" ]]
}

@test "convert-command.sh sets correct conversion date" {
    run "$SCRIPT" "$TEST_DIR/source/test-command.md" "$TEST_DIR/output" "$TEST_DIR/templates/agent-template.md"
    
    [ "$status" -eq 0 ]
    
    local content=$(cat "$TEST_DIR/output/test-command.md")
    # 日付フォーマットが含まれていることを確認（YYYY-MM-DD HH:MM:SS形式）
    [[ "$content" =~ [0-9]{4}-[0-9]{2}-[0-9]{2}\ [0-9]{2}:[0-9]{2}:[0-9]{2} ]]
}

@test "convert-command.sh overwrites existing target file" {
    mkdir -p "$TEST_DIR/output"
    echo "Old content" > "$TEST_DIR/output/test-command.md"
    
    run "$SCRIPT" "$TEST_DIR/source/test-command.md" "$TEST_DIR/output" "$TEST_DIR/templates/agent-template.md"
    
    [ "$status" -eq 0 ]
    
    local content=$(cat "$TEST_DIR/output/test-command.md")
    [[ ! "$content" =~ "Old content" ]]
    [[ "$content" =~ "Agent: test-command" ]]
}