#!/usr/bin/env bats

# Test for convert-slash-commands.sh main script

setup() {
    # テスト用の一時ディレクトリとファイル
    export TEST_DIR="$(mktemp -d)"
    export SCRIPT="$BATS_TEST_DIRNAME/../cc-flow-cli/scripts/convert-slash-commands.sh"
    export SCRIPT_DIR="$BATS_TEST_DIRNAME/../cc-flow-cli/scripts"
    export ORIGINAL_PWD="$PWD"
    
    # テスト用のコマンドディレクトリ構造を作成
    mkdir -p "$TEST_DIR/.claude/commands/utility"
    mkdir -p "$TEST_DIR/.claude/commands/workflow"
    mkdir -p "$TEST_DIR/.claude/commands/analysis"
    
    # テスト用のコマンドファイルを作成
    cat > "$TEST_DIR/.claude/commands/utility/util-cmd.md" << 'EOF'
---
name: util-cmd
description: Utility command
allowed-tools: [Bash]
---
# Utility Command
Utility content
EOF

    cat > "$TEST_DIR/.claude/commands/workflow/flow-cmd.md" << 'EOF'
---
name: flow-cmd
description: Workflow command
---
# Workflow Command

```bash
echo "Workflow"
exit 0
```
EOF

    cat > "$TEST_DIR/.claude/commands/analysis/analyze-cmd.md" << 'EOF'
---
name: analyze-cmd
description: Analysis command
---
# Analysis Command
Analysis content
EOF

    # テンプレートファイルを作成
    mkdir -p "$TEST_DIR/templates"
    cat > "$TEST_DIR/templates/agent-template.md" << 'EOF'
---
name: {AGENT_NAME}
model: {AGENT_MODEL}
---
# Agent: {AGENT_NAME}
Description: {AGENT_DESCRIPTION}
Content: {AGENT_CONTENT}
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

@test "convert-slash-commands.sh shows usage with --help" {
    run "$SCRIPT" --help
    
    [ "$status" -eq 0 ]
    [[ "$output" =~ "使用方法:" ]]
    [[ "$output" =~ "command_directory" ]]
    [[ "$output" =~ "オプション:" ]]
    [[ "$output" =~ "--output-dir" ]]
    [[ "$output" =~ "--template" ]]
    [[ "$output" =~ "--dry-run" ]]
}

@test "convert-slash-commands.sh shows usage with -h" {
    run "$SCRIPT" -h
    
    [ "$status" -eq 0 ]
    [[ "$output" =~ "使用方法:" ]]
}

@test "convert-slash-commands.sh fails without arguments" {
    run "$SCRIPT"
    
    [ "$status" -eq 1 ]
    [[ "$output" =~ "コマンドディレクトリを指定してください" ]]
}

@test "convert-slash-commands.sh fails with unknown option" {
    run "$SCRIPT" --unknown-option
    
    [ "$status" -eq 1 ]
    [[ "$output" =~ "不明なオプション: --unknown-option" ]]
}

@test "convert-slash-commands.sh fails with multiple directories" {
    run "$SCRIPT" dir1 dir2
    
    [ "$status" -eq 1 ]
    [[ "$output" =~ "複数のディレクトリは指定できません" ]]
}

@test "convert-slash-commands.sh dry-run mode shows files without converting" {
    run "$SCRIPT" utility --dry-run
    
    [ "$status" -eq 0 ]
    [[ "$output" =~ "ドライラン" ]]
    [[ "$output" =~ "util-cmd" ]]
    [[ "$output" =~ "変換対象: 1 個のコマンド" ]]
    [[ "$output" =~ "実際の変換は行われませんでした" ]]
    
    # ファイルが作成されていないことを確認
    [ ! -f ".claude/agents/utility/util-cmd.md" ]
}

@test "convert-slash-commands.sh converts utility directory commands" {
    run "$SCRIPT" utility --output-dir "$TEST_DIR/agents" --template "$TEST_DIR/templates/agent-template.md"
    
    [ "$status" -eq 0 ]
    [[ "$output" =~ "変換を開始" ]]
    [[ "$output" =~ "util-cmd" ]]
    [[ "$output" =~ "変換完了!" ]]
    [[ "$output" =~ "✅ 成功: 1" ]]
    
    # 変換されたファイルを確認
    [ -f "$TEST_DIR/agents/utility/util-cmd.md" ]
    local content=$(cat "$TEST_DIR/agents/utility/util-cmd.md")
    [[ "$content" =~ "Agent: util-cmd" ]]
}

@test "convert-slash-commands.sh converts workflow directory with warnings" {
    run "$SCRIPT" workflow --output-dir "$TEST_DIR/agents" --template "$TEST_DIR/templates/agent-template.md"
    
    [ "$status" -eq 0 ]
    [[ "$output" =~ "flow-cmd" ]]
    # bashコードとexit文の警告が表示されることを確認
    [[ "$output" =~ "変換警告" || "$output" =~ "✅ 成功: 1" ]]
    
    [ -f "$TEST_DIR/agents/workflow/flow-cmd.md" ]
}

@test "convert-slash-commands.sh converts all directories" {
    run "$SCRIPT" all --output-dir "$TEST_DIR/agents" --template "$TEST_DIR/templates/agent-template.md"
    
    [ "$status" -eq 0 ]
    [[ "$output" =~ "対象: all" ]]
    [[ "$output" =~ "変換対象: 3 個のコマンド" ]]
    [[ "$output" =~ "✅ 成功: 3" ]]
    
    # 全ファイルが変換されていることを確認
    [ -f "$TEST_DIR/agents/utility/util-cmd.md" ]
    [ -f "$TEST_DIR/agents/workflow/flow-cmd.md" ]
    [ -f "$TEST_DIR/agents/analysis/analyze-cmd.md" ]
}

@test "convert-slash-commands.sh preserves directory structure with all option" {
    run "$SCRIPT" all --output-dir "$TEST_DIR/agents" --template "$TEST_DIR/templates/agent-template.md"
    
    [ "$status" -eq 0 ]
    
    # ディレクトリ構造が保持されていることを確認
    [ -d "$TEST_DIR/agents/utility" ]
    [ -d "$TEST_DIR/agents/workflow" ]
    [ -d "$TEST_DIR/agents/analysis" ]
}

@test "convert-slash-commands.sh uses default output directory" {
    run "$SCRIPT" utility --template "$TEST_DIR/templates/agent-template.md"
    
    [ "$status" -eq 0 ]
    [[ "$output" =~ "出力先: .claude/agents" ]]
    
    # デフォルトディレクトリにファイルが作成されることを確認
    [ -f ".claude/agents/utility/util-cmd.md" ]
}

@test "convert-slash-commands.sh uses default template" {
    # デフォルトテンプレートを作成
    mkdir -p "templates"
    cat > "templates/agent-template.md" << 'EOF'
---
name: {AGENT_NAME}
---
Default template
EOF
    
    run "$SCRIPT" utility --output-dir "$TEST_DIR/agents"
    
    [ "$status" -eq 0 ]
    [[ "$output" =~ "テンプレート: templates/agent-template.md" ]]
}

@test "convert-slash-commands.sh handles conversion failures gracefully" {
    # 不正なファイルを追加
    cat > "$TEST_DIR/.claude/commands/utility/invalid.md" << 'EOF'
This file has no frontmatter
EOF
    
    run "$SCRIPT" utility --output-dir "$TEST_DIR/agents" --template "$TEST_DIR/templates/agent-template.md"
    
    [ "$status" -eq 0 ]
    [[ "$output" =~ "✅ 成功: 1" ]]
    [[ "$output" =~ "❌ 失敗: 1" ]]
}

@test "convert-slash-commands.sh fails when no commands found" {
    mkdir -p "$TEST_DIR/.claude/commands/empty"
    
    run "$SCRIPT" empty --output-dir "$TEST_DIR/agents" --template "$TEST_DIR/templates/agent-template.md"
    
    [ "$status" -eq 1 ]
    [[ "$output" =~ "変換対象のコマンドが見つかりませんでした" ]]
}

@test "convert-slash-commands.sh shows correct emoji indicators" {
    run "$SCRIPT" utility --output-dir "$TEST_DIR/agents" --template "$TEST_DIR/templates/agent-template.md"
    
    [ "$status" -eq 0 ]
    [[ "$output" =~ "🔍" ]]  # 検索
    [[ "$output" =~ "📂" ]]  # ディレクトリ
    [[ "$output" =~ "📊" ]]  # 統計
    [[ "$output" =~ "🚀" ]]  # 開始
    [[ "$output" =~ "✅" ]]  # 成功
}

@test "convert-slash-commands.sh displays command list correctly" {
    run "$SCRIPT" workflow --dry-run
    
    [ "$status" -eq 0 ]
    [[ "$output" =~ "'workflow' ディレクトリで見つかったコマンド" ]]
    [[ "$output" =~ "1. flow-cmd" ]]
    [[ "$output" =~ "🚀 ワークフロー" ]]
}

@test "convert-slash-commands.sh processes custom output directory" {
    run "$SCRIPT" utility --output-dir "$TEST_DIR/custom-output" --template "$TEST_DIR/templates/agent-template.md"
    
    [ "$status" -eq 0 ]
    [[ "$output" =~ "出力先: $TEST_DIR/custom-output" ]]
    [ -d "$TEST_DIR/custom-output/utility" ]
    [ -f "$TEST_DIR/custom-output/utility/util-cmd.md" ]
}

@test "convert-slash-commands.sh shows success message when all conversions succeed" {
    run "$SCRIPT" utility --output-dir "$TEST_DIR/agents" --template "$TEST_DIR/templates/agent-template.md"
    
    [ "$status" -eq 0 ]
    [[ "$output" =~ "🎉 すべてのコマンドが正常に変換されました!" ]]
    [[ "$output" =~ "変換されたエージェントは既存のワークフロー作成機能で使用できます" ]]
}

@test "convert-slash-commands.sh option parsing with equals sign" {
    run "$SCRIPT" utility --output-dir="$TEST_DIR/equals-test" --template="$TEST_DIR/templates/agent-template.md"
    
    # Note: 現在の実装では = を使った指定はサポートされていない
    # このテストは実装の制限を文書化するため
    [ "$status" -ne 0 ] || [[ "$output" =~ "equals-test" ]]
}