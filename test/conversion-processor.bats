#!/usr/bin/env bats

# Test for conversion-processor.sh functions

setup() {
    # テスト用の一時ディレクトリとファイル
    export TEST_DIR="$(mktemp -d)"
    export SCRIPT_DIR="$BATS_TEST_DIRNAME/../cc-flow-cli/scripts"
    export ORIGINAL_PWD="$PWD"
    
    # conversion-processor.shをテスト環境にコピー
    cp "$SCRIPT_DIR/lib/conversion-processor.sh" "$TEST_DIR/"
    cp "$SCRIPT_DIR/lib/template-processor.sh" "$TEST_DIR/"
    cp "$SCRIPT_DIR/utils/common.sh" "$TEST_DIR/"
    
    # テスト用のソースコマンドファイルを作成
    mkdir -p "$TEST_DIR/.claude/commands/test"
    cat > "$TEST_DIR/.claude/commands/test/sample-command.md" << 'EOF'
---
name: sample-command
description: Sample command for testing
argument-hint: <context>
allowed-tools: [Bash, Read, Write]
---

# Sample Command

This is a sample command for testing.

## Usage

```bash
echo "Running sample command with: $1"
```
EOF

    # bashコード付きコマンドファイル
    cat > "$TEST_DIR/.claude/commands/test/bash-command.md" << 'EOF'
---
name: bash-command
description: Command with bash code
---

# Bash Command

```bash
#!/bin/bash
ARGS="$1"
exit 0
```
EOF

    # メタデータなしのコマンドファイル
    cat > "$TEST_DIR/.claude/commands/test/no-metadata.md" << 'EOF'
# No Metadata Command

This command has no YAML frontmatter.
EOF

    # テスト用のテンプレートファイルを作成
    mkdir -p "$TEST_DIR/templates"
    cat > "$TEST_DIR/templates/agent-template.md" << 'EOF'
---
name: {AGENT_NAME}
model: {AGENT_MODEL}
tools: {AGENT_TOOLS}
---

# Agent: {AGENT_NAME}

Description: {AGENT_DESCRIPTION}

## Source Information
- Source Path: {SOURCE_PATH}
- Conversion Date: {CONVERSION_DATE}
- Argument Hint: {SOURCE_ARGUMENT_HINT}

## Content
{AGENT_CONTENT}

## Metadata
- Category: {TARGET_CATEGORY}
- Version: {CONVERSION_VERSION}
- Status: {VALIDATION_STATUS}
- Warnings: {CONVERSION_WARNINGS}
EOF
    
    # テストディレクトリに移動
    cd "$TEST_DIR"
    
    # conversion-processor.shを読み込み
    source "$TEST_DIR/conversion-processor.sh"
}

teardown() {
    # 元のディレクトリに戻る
    cd "$ORIGINAL_PWD"
    # テストディレクトリを削除
    rm -rf "$TEST_DIR"
}

# ヘルパー関数: error_exitのモック実装
error_exit() {
    echo "ERROR: $1" >&2
    exit 1
}

@test "extract_command_metadata extracts all metadata fields" {
    local name description tools content
    
    extract_command_metadata ".claude/commands/test/sample-command.md" name description tools content
    
    [ "$name" = "sample-command" ]
    [ "$description" = "Sample command for testing" ]
    [ "$tools" = "[Bash, Read, Write]" ]
    [[ "$content" =~ "This is a sample command for testing" ]]
}

@test "extract_command_metadata sets defaults for missing fields" {
    local name description tools content
    
    # メタデータの一部が欠けているファイルを作成
    cat > "$TEST_DIR/.claude/commands/test/partial.md" << 'EOF'
---
description: Partial metadata
---
# Partial Command
Content here
EOF
    
    extract_command_metadata ".claude/commands/test/partial.md" name description tools content
    
    [ "$name" = "partial" ]  # ファイル名から取得
    [ "$description" = "Partial metadata" ]
    [ "$tools" = "[Read, Write, Bash]" ]  # デフォルト値
}

@test "extract_argument_hint extracts argument hint correctly" {
    local hint=$(extract_argument_hint ".claude/commands/test/sample-command.md")
    
    [ "$hint" = "<context>" ]
}

@test "extract_argument_hint returns default when not present" {
    local hint=$(extract_argument_hint ".claude/commands/test/bash-command.md")
    
    [ "$hint" = "<args>" ]
}

@test "convert_command_to_agent creates agent file successfully" {
    mkdir -p "$TEST_DIR/output/agents"
    
    run convert_command_to_agent \
        ".claude/commands/test/sample-command.md" \
        "$TEST_DIR/output/agents" \
        "templates/agent-template.md"
    
    [ "$status" -eq 0 ]
    [[ "$output" =~ "変換完了" ]]
    [ -f "$TEST_DIR/output/agents/sample-command.md" ]
    
    # 生成されたファイルの内容確認
    local content=$(cat "$TEST_DIR/output/agents/sample-command.md")
    [[ "$content" =~ "Agent: sample-command" ]]
    [[ "$content" =~ "Description: Sample command for testing" ]]
    [[ "$content" =~ "tools: [Bash, Read, Write]" ]]
}

@test "convert_command_to_agent fails with non-existent source file" {
    run convert_command_to_agent \
        "nonexistent.md" \
        "$TEST_DIR/output" \
        "templates/agent-template.md"
    
    [ "$status" -ne 0 ]
    [[ "$output" =~ "ソースファイルが見つかりません" ]]
}

@test "convert_command_to_agent fails with non-existent template" {
    run convert_command_to_agent \
        ".claude/commands/test/sample-command.md" \
        "$TEST_DIR/output" \
        "nonexistent-template.md"
    
    [ "$status" -ne 0 ]
    [[ "$output" =~ "テンプレートファイルが見つかりません" ]]
}

@test "check_conversion_compatibility returns 0 for valid file" {
    run check_conversion_compatibility ".claude/commands/test/sample-command.md"
    
    [ "$status" -eq 0 ]
}

@test "check_conversion_compatibility returns 1 for non-existent file" {
    run check_conversion_compatibility "nonexistent.md"
    
    [ "$status" -eq 1 ]
}

@test "check_conversion_compatibility returns 2 for file without frontmatter" {
    run check_conversion_compatibility ".claude/commands/test/no-metadata.md"
    
    [ "$status" -eq 2 ]
}

@test "check_conversion_compatibility returns 3 for file without metadata" {
    cat > "$TEST_DIR/empty-frontmatter.md" << 'EOF'
---
---
# Empty Frontmatter
Content
EOF
    
    run check_conversion_compatibility "$TEST_DIR/empty-frontmatter.md"
    
    [ "$status" -eq 3 ]
}

@test "batch_convert_commands processes multiple files" {
    mkdir -p "$TEST_DIR/output/batch"
    
    run batch_convert_commands \
        ".claude/commands/test" \
        "$TEST_DIR/output/batch" \
        "templates/agent-template.md"
    
    [ "$status" -eq 0 ]
    [[ "$output" =~ "一括変換開始" ]]
    [[ "$output" =~ "変換結果" ]]
    
    # 変換されたファイルの確認（no-metadataは失敗するはず）
    [ -f "$TEST_DIR/output/batch/sample-command.md" ]
    [ -f "$TEST_DIR/output/batch/bash-command.md" ]
}

@test "batch_convert_commands fails with non-existent source directory" {
    run batch_convert_commands \
        "nonexistent-dir" \
        "$TEST_DIR/output" \
        "templates/agent-template.md"
    
    [ "$status" -ne 0 ]
    [[ "$output" =~ "ソースディレクトリが見つかりません" ]]
}

@test "batch_convert_commands preserves directory structure" {
    # ネストしたディレクトリ構造を作成
    mkdir -p ".claude/commands/nested/sub"
    cp ".claude/commands/test/sample-command.md" ".claude/commands/nested/cmd1.md"
    cp ".claude/commands/test/sample-command.md" ".claude/commands/nested/sub/cmd2.md"
    
    batch_convert_commands \
        ".claude/commands/nested" \
        "$TEST_DIR/output/nested" \
        "templates/agent-template.md"
    
    # ディレクトリ構造が保持されていることを確認
    [ -f "$TEST_DIR/output/nested/cmd1.md" ]
    [ -f "$TEST_DIR/output/nested/sub/cmd2.md" ]
}

@test "conversion includes warning for bash code blocks" {
    mkdir -p "$TEST_DIR/output/warnings"
    
    # bashコード付きのコマンドを変換
    convert_command_to_agent \
        ".claude/commands/test/bash-command.md" \
        "$TEST_DIR/output/warnings" \
        "templates/agent-template.md"
    
    # 生成されたファイルを確認
    local content=$(cat "$TEST_DIR/output/warnings/bash-command.md")
    [[ "$content" =~ "bash-command" ]]
}

@test "template variables are correctly replaced" {
    mkdir -p "$TEST_DIR/output/vars"
    
    convert_command_to_agent \
        ".claude/commands/test/sample-command.md" \
        "$TEST_DIR/output/vars" \
        "templates/agent-template.md"
    
    local content=$(cat "$TEST_DIR/output/vars/sample-command.md")
    
    # テンプレート変数が正しく置換されていることを確認
    [[ "$content" =~ "name: sample-command" ]]
    [[ "$content" =~ "model: sonnet" ]]
    [[ "$content" =~ "Category: vars" ]]
    [[ "$content" =~ "Version: 1.0" ]]
    [[ "$content" =~ "Status: ✅ 変換完了" ]]
    [[ "$content" =~ "Warnings: なし" ]]
    
    # プレースホルダーが残っていないことを確認
    [[ ! "$content" =~ "{AGENT_NAME}" ]]
    [[ ! "$content" =~ "{AGENT_DESCRIPTION}" ]]
}

@test "extract_command_metadata handles multiline content correctly" {
    cat > "$TEST_DIR/multiline.md" << 'EOF'
---
name: multiline-test
description: |
  This is a multiline
  description for testing
  purposes
tools: [Bash]
---

# Multiline Content

Line 1
Line 2
Line 3
EOF
    
    local name description tools content
    extract_command_metadata "$TEST_DIR/multiline.md" name description tools content
    
    [ "$name" = "multiline-test" ]
    [[ "$content" =~ "Line 1" ]]
    [[ "$content" =~ "Line 2" ]]
    [[ "$content" =~ "Line 3" ]]
}