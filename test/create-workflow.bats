#!/usr/bin/env bats

# Test for create-workflow.sh main functionality

setup() {
    # テスト用の一時ディレクトリとファイル
    export TEST_DIR="$(mktemp -d)"
    export SCRIPT_DIR="$BATS_TEST_DIRNAME/../cc-flow-cli/scripts"
    export ORIGINAL_PWD="$PWD"
    
    # テスト用のプロジェクト構造を作成
    mkdir -p "$TEST_DIR/.claude/agents/test-agents"
    mkdir -p "$TEST_DIR/.claude/commands"
    mkdir -p "$TEST_DIR/templates"
    
    # テスト用のエージェントファイルを作成
    cat > "$TEST_DIR/.claude/agents/test-agents/agent1.md" << EOF
# Agent 1
Test agent 1
EOF
    cat > "$TEST_DIR/.claude/agents/test-agents/agent2.md" << EOF
# Agent 2
Test agent 2
EOF
    cat > "$TEST_DIR/.claude/agents/test-agents/agent3.md" << EOF
# Agent 3
Test agent 3
EOF
    
    # テンプレートファイルをコピー
    cp "$ORIGINAL_PWD/cc-flow-cli/templates/workflow.md" "$TEST_DIR/templates/"
    cp "$ORIGINAL_PWD/cc-flow-cli/templates/workflow.poml" "$TEST_DIR/templates/"
    
    # テストディレクトリに移動
    cd "$TEST_DIR"
}

teardown() {
    # 元のディレクトリに戻る
    cd "$ORIGINAL_PWD"
    # テストディレクトリを削除
    rm -rf "$TEST_DIR"
}

@test "create-workflow shows usage when no arguments" {
    run "$SCRIPT_DIR/create-workflow.sh"
    [ "$status" -eq 1 ]
    [[ "$output" =~ "使用方法" ]]
}

@test "create-workflow with non-existent directory fails" {
    run "$SCRIPT_DIR/create-workflow.sh" nonexistent
    [ "$status" -ne 0 ]
    [[ "$output" =~ "エラー" ]]
}

@test "create-workflow validates duplicate agent selection" {
    run "$SCRIPT_DIR/create-workflow.sh" test-agents "1 1 2"
    [ "$status" -ne 0 ]
    [[ "$output" =~ "重複" ]]
}

@test "create-workflow validates invalid agent numbers" {
    run "$SCRIPT_DIR/create-workflow.sh" test-agents "99"
    [ "$status" -ne 0 ]
    [[ "$output" =~ "無効な番号" ]]
}

@test "create-workflow with empty order enters interactive mode" {
    # 空の順序指定は対話モードに入る
    # 対話プロンプトが表示されることを確認（バックグラウンドで実行）
    "$SCRIPT_DIR/create-workflow.sh" test-agents "" > output.txt 2>&1 &
    local pid=$!
    
    # 少し待ってから出力をチェック
    sleep 1
    kill $pid 2>/dev/null || true
    wait $pid 2>/dev/null || true
    
    # 出力に対話プロンプトが含まれることを確認
    local output=$(cat output.txt)
    [[ "$output" =~ "選択する番号を入力してください" ]]
}

@test "create-workflow with valid order creates MD file and cleans POML" {
    # 正常な順序でワークフローを作成
    run "$SCRIPT_DIR/create-workflow.sh" test-agents "1 2 3"
    
    [ "$status" -eq 0 ]
    [[ "$output" =~ "ワークフローコマンドを作成しました" ]]
    
    # 最終出力(MD)のみが存在することを確認（POMLは中間生成後に削除）
    [ -f ".claude/commands/test-agents-workflow.md" ]
    [ ! -f ".claude/commands/poml/test-agents-workflow.poml" ]
}

@test "create-workflow generates correct agent list in md file" {
    run "$SCRIPT_DIR/create-workflow.sh" test-agents "2 1 3"
    
    [ "$status" -eq 0 ]
    
    # 生成されたMDファイルに正しい順序でエージェントが含まれていることを確認
    content=$(cat ".claude/commands/test-agents-workflow.md")
    # 新テンプレートでは、説明文中にバッククォートでエージェント一覧が埋め込まれる
    [[ "$content" =~ "You are asked to execute a sequential workflow with the following agents:" ]]
    [[ "$content" =~ \`agent2\ agent1\ agent3\` ]]
}

@test "create-workflow cleans up POML intermediate file" {
    run "$SCRIPT_DIR/create-workflow.sh" test-agents "2 1 3"
    
    [ "$status" -eq 0 ]
    
    # 中間POMLは削除され、空ディレクトリも削除される想定
    [ ! -e ".claude/commands/poml/test-agents-workflow.poml" ]
    [ ! -d ".claude/commands/poml" ]
}
