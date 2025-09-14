#!/usr/bin/env bats

# Test for agent-discovery.sh

setup() {
    # テスト用の一時ディレクトリ
    export TEST_DIR="$(mktemp -d)"
    export SCRIPT_DIR="$BATS_TEST_DIRNAME/../scripts"
    export ORIGINAL_PWD="$PWD"
    
    # テスト用のエージェント構造を作成
    mkdir -p "$TEST_DIR/.claude/agents/test-agents"
    mkdir -p "$TEST_DIR/.claude/agents/empty-dir"
    
    # テスト用のエージェントファイルを作成
    cat > "$TEST_DIR/.claude/agents/test-agents/spec-init.md" << EOF
# Spec Init Agent
Initialize specification
EOF

    cat > "$TEST_DIR/.claude/agents/test-agents/spec-design.md" << EOF
# Spec Design Agent  
Create technical design
EOF

    cat > "$TEST_DIR/.claude/agents/test-agents/spec-impl.md" << EOF
# Spec Implementation Agent
Implement the specification
EOF

    # 非エージェントファイルも作成（.md以外）
    echo "Not an agent" > "$TEST_DIR/.claude/agents/test-agents/readme.txt"
    
    # テストディレクトリに移動
    cd "$TEST_DIR"
    
    # agent-discovery.shを読み込み
    source "$SCRIPT_DIR/lib/agent-discovery.sh"
    source "$SCRIPT_DIR/utils/common.sh"
    
    # グローバル変数を初期化
    AGENT_FILES=()
    AGENT_NAMES=()
}

teardown() {
    cd "$ORIGINAL_PWD"
    rm -rf "$TEST_DIR"
}

@test "discover_agents finds all .md files in directory" {
    discover_agents "test-agents"
    
    # 3つのエージェントファイルが見つかることを確認
    [ "${#AGENT_FILES[@]}" -eq 3 ]
    
    # ファイルパスが正しいことを確認
    [[ "${AGENT_FILES[0]}" =~ "spec-design.md" ]]
    [[ "${AGENT_FILES[1]}" =~ "spec-impl.md" ]]
    [[ "${AGENT_FILES[2]}" =~ "spec-init.md" ]]
}

@test "discover_agents ignores non-.md files" {
    discover_agents "test-agents"
    
    # readme.txtは含まれない
    for file in "${AGENT_FILES[@]}"; do
        [[ ! "$file" =~ "readme.txt" ]]
    done
}

@test "discover_agents fails with non-existent directory" {
    run discover_agents "non-existent"
    
    [ "$status" -ne 0 ]
    [[ "$output" =~ "エラー" ]]
}

@test "discover_agents fails with empty directory" {
    run discover_agents "empty-dir"
    
    [ "$status" -ne 0 ]
    [[ "$output" =~ "エラー" ]]
}

@test "extract_agent_names creates correct agent names" {
    # まずエージェントを発見
    discover_agents "test-agents"
    
    # エージェント名を抽出
    extract_agent_names
    
    # エージェント名が正しいことを確認
    [ "${#AGENT_NAMES[@]}" -eq 3 ]
    [ "${AGENT_NAMES[0]}" = "spec-design" ]
    [ "${AGENT_NAMES[1]}" = "spec-impl" ]
    [ "${AGENT_NAMES[2]}" = "spec-init" ]
}

@test "display_agent_list shows formatted output" {
    # エージェントを発見
    discover_agents "test-agents"
    extract_agent_names
    
    # 表示をテスト
    run display_agent_list "test-agents"
    
    [ "$status" -eq 0 ]
    [[ "$output" =~ "test-agents" ]]
    [[ "$output" =~ "spec-design" ]]
    [[ "$output" =~ "spec-impl" ]]
    [[ "$output" =~ "spec-init" ]]
    [[ "$output" =~ "1." ]]
    [[ "$output" =~ "2." ]]
    [[ "$output" =~ "3." ]]
}

@test "agent discovery sorts files alphabetically" {
    # 追加のエージェントファイルを作成（逆順の名前）
    cat > "$TEST_DIR/.claude/agents/test-agents/z-last.md" << EOF
# Last Agent
EOF
    cat > "$TEST_DIR/.claude/agents/test-agents/a-first.md" << EOF  
# First Agent
EOF
    
    discover_agents "test-agents"
    extract_agent_names
    
    # アルファベット順になっていることを確認
    [ "${AGENT_NAMES[0]}" = "a-first" ]
    [ "${AGENT_NAMES[4]}" = "z-last" ]  # 配列の最後の要素を明示的に指定
}

@test "agent discovery handles directories with spaces" {
    # スペースを含むディレクトリを作成
    mkdir -p "$TEST_DIR/.claude/agents/test with spaces"
    cat > "$TEST_DIR/.claude/agents/test with spaces/agent.md" << EOF
# Space Agent
EOF
    
    discover_agents "test with spaces"
    
    [ "${#AGENT_FILES[@]}" -eq 1 ]
    [[ "${AGENT_FILES[0]}" =~ "agent.md" ]]
}