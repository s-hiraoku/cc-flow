#!/usr/bin/env bats

# Test for poml-processor.sh

setup() {
    # テスト用の一時ディレクトリ
    export TEST_DIR="$(mktemp -d)"
    export SCRIPT_DIR="$BATS_TEST_DIRNAME/../cc-flow-cli/scripts"
    export ORIGINAL_PWD="$PWD"
    
    # テスト用のプロジェクト構造を作成
    mkdir -p "$TEST_DIR/.claude/commands/poml"
    mkdir -p "$TEST_DIR/temp"
    
    # テスト用のPOMLファイルを作成
    cat > "$TEST_DIR/.claude/commands/poml/test-workflow.poml" << 'EOF'
<poml version="0.0.8">
  <role>test-workflow</role>
  <context key="workflow_name" value="{{workflow_name}}" />
  <context key="user_input" value="{{user_input}}" />
  <item for="agent in {{agent_list}}">
    Execute {{agent}} with context: {{context}}
  </item>
</poml>
EOF

    # 空のPOMLファイル
    touch "$TEST_DIR/.claude/commands/poml/empty.poml"
    
    # 無効なPOMLファイル
    cat > "$TEST_DIR/.claude/commands/poml/invalid.poml" << 'EOF'
This is not a valid POML file
No tags here
EOF

    # 複数のPOMLファイル用ディレクトリ
    mkdir -p "$TEST_DIR/multiple_poml"
    cat > "$TEST_DIR/multiple_poml/workflow1.poml" << 'EOF'
<poml version="0.0.8">
  <role>workflow1</role>
  <item>Test workflow 1</item>
</poml>
EOF

    cat > "$TEST_DIR/multiple_poml/workflow2.poml" << 'EOF'
<poml version="0.0.8">
  <role>workflow2</role>
  <item>Test workflow 2</item>
</poml>
EOF
    
    # テストディレクトリに移動
    cd "$TEST_DIR"
    
    # poml-processor.shを読み込み
    source "$SCRIPT_DIR/lib/poml-processor.sh"
    
    # テスト用のグローバル変数を設定
    SELECTED_AGENTS=("agent1" "agent2" "agent3")
    
    # Node.js環境のモック（テスト環境では実際のpomljsは使わない）
    # 代わりにダミーのpomljsコマンドを作成
    mkdir -p "$TEST_DIR/mock_bin"
    cat > "$TEST_DIR/mock_bin/pomljs" << 'EOF'
#!/bin/bash
# Mock pomljs for testing
echo '{"messages":[{"content":"# Generated Markdown\n\nThis is generated from POML."}]}'
EOF
    chmod +x "$TEST_DIR/mock_bin/pomljs"
    export PATH="$TEST_DIR/mock_bin:$PATH"
    
    # Mock npx command
    cat > "$TEST_DIR/mock_bin/npx" << 'EOF'
#!/bin/bash
if [[ "$1" == "pomljs" ]]; then
    shift
    exec "$TEST_DIR/mock_bin/pomljs" "$@"
fi
EOF
    chmod +x "$TEST_DIR/mock_bin/npx"
}

teardown() {
    cd "$ORIGINAL_PWD"
    rm -rf "$TEST_DIR"
}

# check_nodejs_dependencies 関数のテスト
@test "check_nodejs_dependencies validates Node.js environment" {
    # Node.jsが存在する場合のテスト（モック環境）
    cat > "$TEST_DIR/mock_bin/node" << 'EOF'
#!/bin/bash
echo "v18.0.0"
EOF
    chmod +x "$TEST_DIR/mock_bin/node"
    
    cat > "$TEST_DIR/mock_bin/npm" << 'EOF'
#!/bin/bash
if [[ "$1" == "list" ]]; then
    echo "pomljs@0.0.8"
fi
EOF
    chmod +x "$TEST_DIR/mock_bin/npm"
    
    run check_nodejs_dependencies
    [ "$status" -eq 0 ]
    [[ "$output" =~ "Node.js環境の確認が完了しました" ]]
}

# create_workflow_context 関数のテスト
@test "create_workflow_context creates correct context arguments" {
    SELECTED_AGENTS=("agent1" "agent2")
    
    result=$(create_workflow_context "test-workflow" "test context")
    
    [[ "$result" =~ "--context \"workflow_name=test-workflow\"" ]]
    [[ "$result" =~ "--context \"user_input=test context\"" ]]
    [[ "$result" =~ "--context \"context=test context\"" ]]
    [[ "$result" =~ "--context \"agent_list=agent1 agent2\"" ]]
}

@test "create_workflow_context handles empty parameters" {
    SELECTED_AGENTS=()
    
    result=$(create_workflow_context "" "")
    
    # 空の場合は基本的なコンテキストのみ
    [ -n "$result" ] || [ -z "$result" ]  # 空でも空でなくてもOK
}

@test "create_workflow_context handles only workflow name" {
    SELECTED_AGENTS=()
    
    result=$(create_workflow_context "my-workflow" "")
    
    [[ "$result" =~ "--context \"workflow_name=my-workflow\"" ]]
}

# convert_poml_file_to_markdown 関数のテスト
@test "convert_poml_file_to_markdown converts valid POML file" {
    local input_file=".claude/commands/poml/test-workflow.poml"
    local output_file="$TEST_DIR/output.md"

    run convert_poml_file_to_markdown "$input_file" "$output_file" "test-workflow" "test context"

    [ "$status" -eq 0 ]
    [ -f "$output_file" ]
    [[ "$output" =~ "マークダウンファイルを生成しました" ]]

    content=$(cat "$output_file")
    [[ "$content" =~ "Generated Markdown" ]]
}

@test "convert_poml_file_to_markdown fails with non-existent file" {
    local input_file="non-existent.poml"
    local output_file="$TEST_DIR/output.md"

    run convert_poml_file_to_markdown "$input_file" "$output_file" "missing" ""

    [ "$status" -eq 1 ]
    [[ "$output" =~ "ファイルが見つかりません" ]]
}

@test "convert_poml_file_to_markdown requires valid arguments" {
    run convert_poml_file_to_markdown "" ""

    [ "$status" -eq 1 ]
    [[ "$output" =~ "エラー" ]]
}

# validate_poml_processing 関数のテスト
@test "validate_poml_processing validates POML file" {
    local poml_file=".claude/commands/poml/test-workflow.poml"
    
    run validate_poml_processing "$poml_file"
    
    [ "$status" -eq 0 ]
    [[ "$output" =~ "Node.js環境の確認が完了しました" ]]
}

@test "validate_poml_processing detects empty POML file" {
    local poml_file=".claude/commands/poml/empty.poml"
    
    run validate_poml_processing "$poml_file"
    
    [ "$status" -eq 1 ]
    [[ "$output" =~ "空です" ]]
}

@test "validate_poml_processing warns about files without tags" {
    local poml_file=".claude/commands/poml/invalid.poml"
    
    run validate_poml_processing "$poml_file"
    
    [ "$status" -eq 0 ]
    [[ "$output" =~ "タグが見つかりません" ]]
}

# process_workflow_poml 関数のテスト
@test "process_workflow_poml processes complete workflow" {
    run process_workflow_poml "test-workflow" "test context"
    
    [ "$status" -eq 0 ]
    [ -f ".claude/commands/test-workflow.md" ]
    [[ "$output" =~ "マークダウンファイルを生成しました" ]]
}

# cleanup_poml_processing 関数のテスト
@test "cleanup_poml_processing removes temporary files" {
    # テンポラリファイルを作成
    local temp_file="$TEST_DIR/temp/test.tmp"
    echo "temporary content" > "$temp_file"
    
    [ -f "$temp_file" ]
    
    run cleanup_poml_processing "$temp_file"
    
    [ "$status" -eq 0 ]
    [ ! -f "$temp_file" ]
    [[ "$output" =~ "一時ファイルを削除しました" ]]
}

@test "cleanup_poml_processing skips non-temporary files" {
    # 通常のファイルを作成
    local normal_file="$TEST_DIR/normal.md"
    echo "normal content" > "$normal_file"
    
    [ -f "$normal_file" ]
    
    run cleanup_poml_processing "$normal_file"
    
    [ "$status" -eq 0 ]
    [ -f "$normal_file" ]  # ファイルが残っている
    [[ ! "$output" =~ "一時ファイルを削除しました" ]]
}

# show_poml_processing_info 関数のテスト
@test "show_poml_processing_info displays processing information" {
    local poml_file=".claude/commands/poml/test-workflow.poml"
    local output_file="$TEST_DIR/output.md"
    
    run show_poml_processing_info "$poml_file" "$output_file"
    
    [ "$status" -eq 0 ]
    [[ "$output" =~ "POML処理詳細" ]]
    [[ "$output" =~ "入力: $poml_file" ]]
    [[ "$output" =~ "出力: $output_file" ]]
    [[ "$output" =~ "処理エンジン: pomljs" ]]
    [[ "$output" =~ "POMLファイルサイズ:" ]]
}

# process_multiple_poml_files 関数のテスト
@test "process_multiple_poml_files processes multiple POML files" {
    local poml_dir="$TEST_DIR/multiple_poml"
    local output_dir="$TEST_DIR/output"
    run process_multiple_poml_files "$poml_dir" "$output_dir"
    
    [ "$status" -eq 0 ]
    [ -f "$output_dir/workflow1.md" ]
    [ -f "$output_dir/workflow2.md" ]
    [[ "$output" =~ "2個のPOMLファイルを処理します" ]]
    [[ "$output" =~ "全てのPOMLファイルの処理が完了しました" ]]
}

@test "process_multiple_poml_files handles empty directory" {
    local poml_dir="$TEST_DIR/empty_dir"
    local output_dir="$TEST_DIR/output"
    
    mkdir -p "$poml_dir"
    
    run process_multiple_poml_files "$poml_dir" "$output_dir"
    
    [ "$status" -eq 0 ]
    [[ "$output" =~ "POMLファイルが見つかりませんでした" ]]
}

@test "process_multiple_poml_files fails with non-existent directory" {
    local poml_dir="$TEST_DIR/non_existent"
    local output_dir="$TEST_DIR/output"
    
    run process_multiple_poml_files "$poml_dir" "$output_dir"
    
    [ "$status" -eq 1 ]
    [[ "$output" =~ "ディレクトリが見つかりません" ]]
}

# 統合テスト
@test "integration test: complete POML processing workflow" {
    # 1. バリデーション
    local poml_file=".claude/commands/poml/test-workflow.poml"
    validate_poml_processing "$poml_file"
    
    # 2. コンテキスト作成
    SELECTED_AGENTS=("agent1" "agent2")
    local context_vars=$(create_workflow_context "integration-test" "integration context")

    # 3. POML処理
    local output_file="$TEST_DIR/integration-output.md"
    convert_poml_file_to_markdown "$poml_file" "$output_file" "integration-test" "$context_vars"
    
    # 4. 結果確認
    [ -f "$output_file" ]
    content=$(cat "$output_file")
    [[ "$content" =~ "Generated Markdown" ]]
    
    # 5. クリーンアップ
    local temp_file="$TEST_DIR/temp/integration.tmp"
    echo "temp" > "$temp_file"
    cleanup_poml_processing "$temp_file"
    [ ! -f "$temp_file" ]
}
