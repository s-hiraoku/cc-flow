#!/usr/bin/env bats

# Test for slash-command-discovery.sh functions

setup() {
    # テスト用の一時ディレクトリとファイル
    export TEST_DIR="$(mktemp -d)"
    export SCRIPT_DIR="$BATS_TEST_DIRNAME/../scripts/workflow"
    export ORIGINAL_PWD="$PWD"
    
    # slash-command-discovery.shをテスト環境にコピー
    mkdir -p "$TEST_DIR/utils"
    mkdir -p "$TEST_DIR/lib"
    cp "$SCRIPT_DIR/lib/slash-command-discovery.sh" "$TEST_DIR/"
    cp "$SCRIPT_DIR/utils/common.sh" "$TEST_DIR/utils/"
    
    # slash-command-discovery.sh内のパスを修正
    sed -i.bak 's|$LIB_SCRIPT_DIR/../utils/common.sh|$TEST_DIR/utils/common.sh|' "$TEST_DIR/slash-command-discovery.sh"
    
    # テスト用のコマンドディレクトリ構造を作成
    mkdir -p "$TEST_DIR/.claude/commands/utility"
    mkdir -p "$TEST_DIR/.claude/commands/workflow"
    mkdir -p "$TEST_DIR/.claude/commands/analysis"
    
    # テスト用のコマンドファイルを作成
    cat > "$TEST_DIR/.claude/commands/utility/test-util.md" << EOF
---
name: test-util
description: Test utility command
allowed-tools: [Bash]
---
# Test Utility
Test content
EOF

    cat > "$TEST_DIR/.claude/commands/utility/helper.md" << EOF
---
name: helper
description: Helper command
---
# Helper
Helper content
EOF

    cat > "$TEST_DIR/.claude/commands/workflow/create-flow.md" << EOF
---
name: create-flow
description: Create workflow
---
# Create Flow
Workflow creation
EOF

    cat > "$TEST_DIR/.claude/commands/analysis/analyze.md" << EOF
---
name: analyze
description: Analysis command
---
# Analyze
Analysis content
EOF
    
    # テストディレクトリに移動
    cd "$TEST_DIR"
    
    # slash-command-discovery.shを読み込み
    source "$TEST_DIR/slash-command-discovery.sh"
}

teardown() {
    # 元のディレクトリに戻る
    cd "$ORIGINAL_PWD"
    # テストディレクトリを削除
    rm -rf "$TEST_DIR"
}

# ヘルパー関数: check_directoryのモック実装
check_directory() {
    local dir="$1"
    local desc="$2"
    
    if [[ ! -d "$dir" ]]; then
        echo "❌ エラー: $desc が見つかりません: '$dir'" >&2
        exit 1
    fi
}

# ヘルパー関数: error_exitのモック実装
error_exit() {
    echo "ERROR: $1" >&2
    exit 1
}

@test "discover_commands finds commands in utility directory" {
    discover_commands "utility"
    
    [ "${#COMMAND_FILES[@]}" -eq 2 ]
    [[ "${COMMAND_FILES[0]}" =~ "helper.md" ]]
    [[ "${COMMAND_FILES[1]}" =~ "test-util.md" ]]
}

@test "discover_commands finds commands in workflow directory" {
    discover_commands "workflow"
    
    [ "${#COMMAND_FILES[@]}" -eq 1 ]
    [[ "${COMMAND_FILES[0]}" =~ "create-flow.md" ]]
}

@test "discover_commands with 'all' finds all commands" {
    discover_commands "all"
    
    [ "${#COMMAND_FILES[@]}" -eq 4 ]
}

@test "discover_commands fails with non-existent directory" {
    run discover_commands "nonexistent"
    
    [ "$status" -ne 0 ]
    [[ "$output" =~ "コマンドディレクトリ が見つかりません" ]]
}

@test "discover_commands fails with empty directory" {
    mkdir -p ".claude/commands/empty"
    
    run discover_commands "empty"
    
    [ "$status" -ne 0 ]
    [[ "$output" =~ "にコマンドが見つかりません" ]]
}

@test "extract_command_names extracts correct names" {
    COMMAND_FILES=(
        ".claude/commands/utility/test-util.md"
        ".claude/commands/utility/helper.md"
        ".claude/commands/workflow/create-flow.md"
    )
    
    extract_command_names
    
    [ "${#COMMAND_NAMES[@]}" -eq 3 ]
    [ "${COMMAND_NAMES[0]}" = "test-util" ]
    [ "${COMMAND_NAMES[1]}" = "helper" ]
    [ "${COMMAND_NAMES[2]}" = "create-flow" ]
}

@test "display_command_list shows utility commands with icons" {
    discover_commands "utility"
    extract_command_names
    
    run display_command_list "utility"
    
    [ "$status" -eq 0 ]
    [[ "$output" =~ "'utility' ディレクトリで見つかったコマンド" ]]
    [[ "$output" =~ "test-util" ]]
    [[ "$output" =~ "helper" ]]
    [[ "$output" =~ "⚙️  ユーティリティ" ]]
}

@test "display_command_list shows all commands when 'all' specified" {
    discover_commands "all"
    extract_command_names
    
    run display_command_list "all"
    
    [ "$status" -eq 0 ]
    [[ "$output" =~ "全ディレクトリで見つかったコマンド" ]]
}

@test "display_command_list assigns correct icons based on command type" {
    COMMAND_NAMES=("convert-test" "create-test" "utility-test" "workflow-test" "analyze-test" "test-cmd" "deploy-test" "generic")
    
    run display_command_list "all"
    
    [ "$status" -eq 0 ]
    [[ "$output" =~ "🔄 変換・変更" ]]      # convert
    [[ "$output" =~ "🏗️  作成・生成" ]]     # create
    [[ "$output" =~ "⚙️  ユーティリティ" ]]  # utility
    [[ "$output" =~ "🚀 ワークフロー" ]]    # workflow
    [[ "$output" =~ "📊 分析・解析" ]]      # analysis
    [[ "$output" =~ "🧪 テスト・検証" ]]    # test
    [[ "$output" =~ "🚀 デプロイメント" ]]  # deploy
    [[ "$output" =~ "📝 コマンド" ]]        # generic
}

@test "get_command_count returns correct count" {
    COMMAND_NAMES=("cmd1" "cmd2" "cmd3")
    
    local count=$(get_command_count)
    
    [ "$count" -eq 3 ]
}

@test "get_command_name_by_index returns correct name" {
    COMMAND_NAMES=("first" "second" "third")
    
    local name1=$(get_command_name_by_index 0)
    local name2=$(get_command_name_by_index 1)
    local name3=$(get_command_name_by_index 2)
    
    [ "$name1" = "first" ]
    [ "$name2" = "second" ]
    [ "$name3" = "third" ]
}

@test "get_command_name_by_index fails with invalid index" {
    COMMAND_NAMES=("first" "second")
    
    run get_command_name_by_index 5
    [ "$status" -ne 0 ]
    
    run get_command_name_by_index -1
    [ "$status" -ne 0 ]
}

@test "discover_all_commands finds all markdown files" {
    discover_all_commands ".claude/commands"
    
    [ "${#COMMAND_FILES[@]}" -eq 4 ]
    
    # ファイルがソート順であることを確認
    [[ "${COMMAND_FILES[0]}" =~ "analyze.md" ]]
}

@test "discover_all_commands fails with non-existent base path" {
    run discover_all_commands ".claude/nonexistent"
    
    [ "$status" -ne 0 ]
    [[ "$output" =~ "ディレクトリ '.claude/nonexistent' が見つかりません" ]]
}

@test "discover_directory_commands finds commands in specific directory" {
    discover_directory_commands ".claude/commands/workflow"
    
    [ "${#COMMAND_FILES[@]}" -eq 1 ]
    [[ "${COMMAND_FILES[0]}" =~ "create-flow.md" ]]
}

@test "discover_directory_commands fails with empty directory" {
    mkdir -p ".claude/commands/empty-test"
    
    run discover_directory_commands ".claude/commands/empty-test"
    
    [ "$status" -ne 0 ]
    [[ "$output" =~ "にコマンドが見つかりません" ]]
}

@test "COMMAND_FILES global array is properly set" {
    discover_commands "utility"
    
    [ "${#COMMAND_FILES[@]}" -gt 0 ]
    for file in "${COMMAND_FILES[@]}"; do
        [[ "$file" =~ \.md$ ]]
    done
}

@test "COMMAND_NAMES global array is properly set" {
    discover_commands "workflow"
    extract_command_names
    
    [ "${#COMMAND_NAMES[@]}" -eq 1 ]
    [ "${COMMAND_NAMES[0]}" = "create-flow" ]
}
