#!/usr/bin/env bats

# Test for user-interaction.sh shell prompt functions

setup() {
    # テスト用の一時ディレクトリとファイル
    export TEST_DIR="$(mktemp -d)"
    export SCRIPT_DIR="$BATS_TEST_DIRNAME/../cc-flow-cli/scripts"
    export ORIGINAL_PWD="$PWD"
    
    # user-interaction.shをテスト環境にコピー
    cp "$SCRIPT_DIR/lib/user-interaction.sh" "$TEST_DIR/"
    cp "$SCRIPT_DIR/utils/common.sh" "$TEST_DIR/"
    
    # テスト用のエージェント名配列を設定
    export AGENT_NAMES=("agent1" "agent2" "agent3" "agent4")
    
    # テストディレクトリに移動
    cd "$TEST_DIR"
    
    # user-interaction.shを読み込み
    source "$TEST_DIR/user-interaction.sh"
}

teardown() {
    # 元のディレクトリに戻る
    cd "$ORIGINAL_PWD"
    # テストディレクトリを削除
    rm -rf "$TEST_DIR"
}

# ヘルパー関数: array_containsのモック実装
array_contains() {
    local needle="$1"
    shift
    local haystack=("$@")
    
    for item in "${haystack[@]}"; do
        [[ "$item" == "$needle" ]] && return 0
    done
    return 1
}

# ヘルパー関数: error_exitのモック実装
error_exit() {
    echo "ERROR: $1" >&2
    exit 1
}

@test "process_order_specification with valid single agent" {
    run process_order_specification "1"
    
    [ "$status" -eq 0 ]
    [[ "$output" =~ "選択されたワークフロー" ]]
    [[ "$output" =~ "agent1" ]]
    
    # SELECTED_AGENTSが正しく設定されることを確認
    [ "${SELECTED_AGENTS[0]}" = "agent1" ]
    [ "${#SELECTED_AGENTS[@]}" -eq 1 ]
}

@test "process_order_specification with valid multiple agents in order" {
    run process_order_specification "2 1 4"
    
    [ "$status" -eq 0 ]
    [[ "$output" =~ "選択されたワークフロー" ]]
    [[ "$output" =~ "agent2" ]]
    [[ "$output" =~ "agent1" ]]
    [[ "$output" =~ "agent4" ]]
    
    # SELECTED_AGENTSが正しい順序で設定されることを確認
    [ "${SELECTED_AGENTS[0]}" = "agent2" ]
    [ "${SELECTED_AGENTS[1]}" = "agent1" ]
    [ "${SELECTED_AGENTS[2]}" = "agent4" ]
    [ "${#SELECTED_AGENTS[@]}" -eq 3 ]
}

@test "process_order_specification with invalid agent number" {
    run process_order_specification "5"
    
    [ "$status" -eq 1 ]
    [[ "$output" =~ "無効な番号" ]]
    [[ "$output" =~ "5" ]]
}

@test "process_order_specification with zero agent number" {
    run process_order_specification "0"
    
    [ "$status" -eq 1 ]
    [[ "$output" =~ "無効な番号" ]]
    [[ "$output" =~ "0" ]]
}

@test "process_order_specification with negative agent number" {
    run process_order_specification "-1"
    
    [ "$status" -eq 1 ]
    [[ "$output" =~ "無効な番号" ]]
    [[ "$output" =~ "-1" ]]
}

@test "process_order_specification with non-numeric input" {
    run process_order_specification "abc"
    
    [ "$status" -eq 1 ]
    [[ "$output" =~ "無効な番号" ]]
    [[ "$output" =~ "abc" ]]
}

@test "process_order_specification with duplicate agents" {
    run process_order_specification "1 2 1"
    
    [ "$status" -eq 1 ]
    [[ "$output" =~ "重複" ]]
    [[ "$output" =~ "agent1" ]]
}

@test "process_order_specification with empty input" {
    run process_order_specification ""
    
    [ "$status" -eq 1 ]
    [[ "$output" =~ "エージェントが選択されていません" ]]
}

@test "process_order_specification with whitespace only" {
    run process_order_specification "   "
    
    [ "$status" -eq 1 ]
    [[ "$output" =~ "エージェントが選択されていません" ]]
}

@test "process_order_specification with mixed valid and invalid numbers" {
    run process_order_specification "1 99 2"
    
    [ "$status" -eq 1 ]
    [[ "$output" =~ "無効な番号" ]]
    [[ "$output" =~ "99" ]]
}

@test "process_order_specification displays correct emoji indicators" {
    run process_order_specification "1 2 3"
    
    [ "$status" -eq 0 ]
    [[ "$output" =~ "🚀 agent1 (開始)" ]]
    [[ "$output" =~ "⚙️  agent2" ]]
    [[ "$output" =~ "🏁 agent3 (完了)" ]]
}

@test "process_order_specification with all agents in reverse order" {
    run process_order_specification "4 3 2 1"
    
    [ "$status" -eq 0 ]
    [[ "$output" =~ "選択されたワークフロー" ]]
    
    # SELECTED_AGENTSが逆順で設定されることを確認
    [ "${SELECTED_AGENTS[0]}" = "agent4" ]
    [ "${SELECTED_AGENTS[1]}" = "agent3" ]
    [ "${SELECTED_AGENTS[2]}" = "agent2" ]
    [ "${SELECTED_AGENTS[3]}" = "agent1" ]
    [ "${#SELECTED_AGENTS[@]}" -eq 4 ]
}

@test "process_item_names_specification with valid agent names" {
    export ITEM_NAMES_SPECIFIED=("agent2" "agent1" "agent4")
    
    run process_item_names_specification
    
    [ "$status" -eq 0 ]
    [[ "$output" =~ "アイテム名指定モード" ]]
    [[ "$output" =~ "agent2.*agent1.*agent4" ]]
    
    # SELECTED_AGENTSが正しく設定されることを確認
    [ "${SELECTED_AGENTS[0]}" = "agent2" ]
    [ "${SELECTED_AGENTS[1]}" = "agent1" ]
    [ "${SELECTED_AGENTS[2]}" = "agent4" ]
    [ "${#SELECTED_AGENTS[@]}" -eq 3 ]
}

@test "process_item_names_specification with invalid agent name" {
    export ITEM_NAMES_SPECIFIED=("agent1" "nonexistent" "agent2")
    
    run process_item_names_specification
    
    [ "$status" -eq 1 ]
    [[ "$output" =~ "見つかりません" ]]
    [[ "$output" =~ "nonexistent" ]]
}

@test "process_item_names_specification with empty list" {
    export ITEM_NAMES_SPECIFIED=()
    
    run process_item_names_specification
    
    [ "$status" -eq 0 ]
    [[ "$output" =~ "指定されたアイテム名で処理します:" ]]
    
    # 空の配列が正しく処理されることを確認
    [ "${#SELECTED_AGENTS[@]}" -eq 0 ]
}

@test "show_selection_instructions displays proper formatting" {
    run show_selection_instructions
    
    [ "$status" -eq 0 ]
    [[ "$output" =~ "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" ]]
    [[ "$output" =~ "🎯 ワークフローを作成します" ]]
    [[ "$output" =~ "💡 選択方法:" ]]
    [[ "$output" =~ "📝 例:" ]]
}

@test "show_final_confirmation displays correct message" {
    run show_final_confirmation
    
    [ "$status" -eq 0 ]
    [[ "$output" =~ "🔧 ワークフローコマンドを生成しています..." ]]
}

# confirm_selection関数のテスト（対話的入力をモック）
@test "confirm_selection returns true for 'y' input" {
    # 標準入力をモック
    echo "y" | (
        confirm_selection
        echo "RESULT: $?"
    ) > output.txt
    
    local result=$(grep "RESULT:" output.txt | cut -d: -f2 | tr -d ' ')
    [ "$result" = "0" ]
}

@test "confirm_selection returns true for 'Y' input" {
    # 標準入力をモック
    echo "Y" | (
        confirm_selection
        echo "RESULT: $?"
    ) > output.txt
    
    local result=$(grep "RESULT:" output.txt | cut -d: -f2 | tr -d ' ')
    [ "$result" = "0" ]
}

@test "confirm_selection returns false for 'n' input" {
    # 標準入力をモック
    echo "n" | (
        confirm_selection
        echo "RESULT: $?"
    ) > output.txt
    
    local result=$(grep "RESULT:" output.txt | cut -d: -f2 | tr -d ' ')
    [ "$result" = "1" ]
}

@test "confirm_selection returns false for invalid input" {
    # 標準入力をモック
    echo "invalid" | (
        confirm_selection
        echo "RESULT: $?"
    ) > output.txt
    
    local result=$(grep "RESULT:" output.txt | cut -d: -f2 | tr -d ' ')
    [ "$result" = "1" ]
}