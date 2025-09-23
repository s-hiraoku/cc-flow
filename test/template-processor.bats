#!/usr/bin/env bats

# Test for template-processor.sh

setup() {
    # テスト用の一時ディレクトリ
    export TEST_DIR="$(mktemp -d)"
    export SCRIPT_DIR="$BATS_TEST_DIRNAME/../cc-flow-cli/scripts"
    export ORIGINAL_PWD="$PWD"
    
    # テスト用のプロジェクト構造を作成
    mkdir -p "$TEST_DIR/templates"
    
    # テスト用のテンプレートファイルを作成
    cat > "$TEST_DIR/templates/workflow.md" << 'EOF'
---
description: {DESCRIPTION}
argument-hint: {ARGUMENT_HINT}
---

# {WORKFLOW_NAME}

POML OUTPUT:
{POML_GENERATED_INSTRUCTIONS}
EOF

    cat > "$TEST_DIR/templates/workflow.poml" << 'EOF'
<poml>
  <role>{{workflowName}}</role>
  <list for="subagent in workflowAgents">
    <item>Execute {{subagent}}</item>
  </list>
</poml>
EOF
    
    # テストディレクトリに移動
    cd "$TEST_DIR"
    
    # template-processor.shを読み込み
    source "$SCRIPT_DIR/lib/template-processor.sh"
    source "$SCRIPT_DIR/utils/common.sh"
    
    # テスト用のグローバル変数を設定
    SELECTED_AGENTS=("agent1" "agent2" "agent3")

    # pomljsをモック
    mkdir -p "$TEST_DIR/mock_bin"
    cat > "$TEST_DIR/mock_bin/pomljs" <<'EOF'
#!/bin/bash
echo '{"messages":[{"content":"# Generated Markdown\n\nThis is generated from POML."}]}'
EOF
    chmod +x "$TEST_DIR/mock_bin/pomljs"

    cat > "$TEST_DIR/mock_bin/npx" <<'EOF'
#!/bin/bash
if [[ "$1" == "pomljs" ]]; then
    shift
    exec "$TEST_DIR/mock_bin/pomljs" "$@"
fi
EOF
    local system_node
    system_node=$(command -v node || true)
    if [[ -n "$system_node" ]]; then
        cat > "$TEST_DIR/mock_bin/node" <<EOF
#!/bin/bash
"$system_node" "\$@"
EOF
        chmod +x "$TEST_DIR/mock_bin/node"
    fi

    chmod +x "$TEST_DIR/mock_bin/npx"
    export PATH="$TEST_DIR/mock_bin:$PATH"
}

teardown() {
    cd "$ORIGINAL_PWD"
    rm -rf "$TEST_DIR"
}

@test "create_agent_array_json creates correct JSON format" {
    SELECTED_AGENTS=("spec-init" "spec-design" "spec-impl")
    
    result=$(create_agent_array_json)
    expected='["spec-init", "spec-design", "spec-impl"]'
    
    [ "$result" = "$expected" ]
}

@test "create_agent_array_json handles single agent" {
    SELECTED_AGENTS=("single-agent")
    
    result=$(create_agent_array_json)
    expected='["single-agent"]'
    
    [ "$result" = "$expected" ]
}

@test "create_agent_array_json handles empty array" {
    SELECTED_AGENTS=()
    
    result=$(create_agent_array_json)
    expected="[]"
    
    [ "$result" = "$expected" ]
}

@test "load_templates reads template files successfully" {
    load_templates
    
    # テンプレート変数が設定されているかチェック
    [ -n "$WORKFLOW_MD_TEMPLATE" ]
    [ -n "$WORKFLOW_POML_TEMPLATE" ]
    [[ "$WORKFLOW_MD_TEMPLATE" =~ "{WORKFLOW_NAME}" ]]
    [[ "$WORKFLOW_POML_TEMPLATE" =~ "workflowAgents" ]]
}

@test "process_templates replaces variables correctly" {
    # テンプレートを読み込み
    load_templates
    
    # テンプレート処理を実行
    SELECTED_AGENTS=("agent1" "agent2")
    process_templates "test"
    
    # MD テンプレートの変数置換を確認
    [[ "$WORKFLOW_MD_CONTENT" =~ "test-workflow" ]]
    [[ "$WORKFLOW_MD_CONTENT" =~ "POML OUTPUT" ]]
    [[ "$WORKFLOW_MD_CONTENT" =~ "Generated Markdown" ]]
    [[ "$WORKFLOW_MD_CONTENT" != *"{POML_GENERATED_INSTRUCTIONS}"* ]]

    # POML テンプレートの変数置換を確認
    [[ "$WORKFLOW_POML_CONTENT" =~ "<role>{{workflowName}}</role>" ]]
    [[ "$WORKFLOW_POML_CONTENT" =~ "<list for=\"subagent in workflowAgents\">" ]]
}

@test "process_templates sets workflow name globally" {
    load_templates
    SELECTED_AGENTS=("agent1")
    
    process_templates "myworkflow"
    
    [ "$WORKFLOW_NAME" = "myworkflow-workflow" ]
}

@test "generate_files creates output files" {
    # テンプレート処理を実行
    load_templates
    SELECTED_AGENTS=("agent1" "agent2")
    process_templates "test"
    
    # ファイル生成
    run generate_files
    
    [ "$status" -eq 0 ]
    [ -f ".claude/commands/test-workflow.md" ]
    [ -f ".claude/commands/poml/test-workflow.poml" ]
    
    # ファイル内容を確認
    md_content=$(cat ".claude/commands/test-workflow.md")
    poml_content=$(cat ".claude/commands/poml/test-workflow.poml")
    
    [[ "$md_content" =~ "test-workflow" ]]
    [[ "$md_content" =~ "Generated Markdown" ]]
    [[ "$poml_content" =~ "<role>{{workflowName}}</role>" ]]
    [[ "$poml_content" =~ "<list for=\"subagent in workflowAgents\">" ]]
}
