#!/bin/bash

# テンプレート処理関連の関数

# 現在のスクリプトのディレクトリを取得
LIB_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$LIB_SCRIPT_DIR/../utils/common.sh"

# テンプレートファイルを読み込み
load_templates() {
    local workflow_md_template
    local workflow_poml_template
    
    # workflow.mdテンプレートを読み込み
    if ! workflow_md_template=$(cat templates/workflow.md 2>/dev/null); then
        error_exit "テンプレートファイル 'templates/workflow.md' が見つかりません"
    fi
    
    # workflow.pomlテンプレートを読み込み
    if ! workflow_poml_template=$(cat templates/workflow.poml 2>/dev/null); then
        error_exit "テンプレートファイル 'templates/workflow.poml' が見つかりません"
    fi
    
    # グローバル変数に設定
    WORKFLOW_MD_TEMPLATE="$workflow_md_template"
    WORKFLOW_POML_TEMPLATE="$workflow_poml_template"
}

# エージェントリストをJSON配列形式に変換
create_agent_list_json() {
    local json="["
    
    for i in "${!SELECTED_AGENTS[@]}"; do
        [[ $i -gt 0 ]] && json+=", "
        json+="\"${SELECTED_AGENTS[$i]}\""
    done
    
    json+="]"
    echo "$json"
}

# テンプレート変数を置換
process_templates() {
    local agent_dir="$1"
    local workflow_name="${agent_dir}-workflow"
    local description="Execute $agent_dir workflow"
    local argument_hint="[type] [context]"
    local workflow_type="implementation"
    local agent_list_json
    
    agent_list_json=$(create_agent_list_json)
    
    # workflow.mdテンプレートの変数置換
    WORKFLOW_MD_CONTENT="$WORKFLOW_MD_TEMPLATE"
    WORKFLOW_MD_CONTENT="${WORKFLOW_MD_CONTENT//\{DESCRIPTION\}/$description}"
    WORKFLOW_MD_CONTENT="${WORKFLOW_MD_CONTENT//\{ARGUMENT_HINT\}/$argument_hint}"
    WORKFLOW_MD_CONTENT="${WORKFLOW_MD_CONTENT//\{WORKFLOW_NAME\}/$workflow_name}"
    WORKFLOW_MD_CONTENT="${WORKFLOW_MD_CONTENT//\{WORKFLOW_TYPE\}/$workflow_type}"
    
    # workflow.pomlテンプレートの変数置換
    WORKFLOW_POML_CONTENT="$WORKFLOW_POML_TEMPLATE"
    WORKFLOW_POML_CONTENT="${WORKFLOW_POML_CONTENT//\{WORKFLOW_NAME\}/$workflow_name}"
    WORKFLOW_POML_CONTENT="${WORKFLOW_POML_CONTENT//\{WORKFLOW_AGENT_LIST\}/$agent_list_json}"
    WORKFLOW_POML_CONTENT="${WORKFLOW_POML_CONTENT//\{WORKFLOW_TYPE_DEFINITIONS\}/}"
    WORKFLOW_POML_CONTENT="${WORKFLOW_POML_CONTENT//\{WORKFLOW_SPECIFIC_INSTRUCTIONS\}/}"
    WORKFLOW_POML_CONTENT="${WORKFLOW_POML_CONTENT//\{ACCUMULATED_CONTEXT\}/}"
    
    # ワークフロー名をグローバル変数に設定
    WORKFLOW_NAME="$workflow_name"
}

# ファイルを生成
generate_files() {
    # 出力ディレクトリを作成
    safe_mkdir ".claude/commands"
    safe_mkdir ".claude/commands/poml"
    
    # ファイルを書き込み
    safe_write_file ".claude/commands/$WORKFLOW_NAME.md" "$WORKFLOW_MD_CONTENT"
    safe_write_file ".claude/commands/poml/$WORKFLOW_NAME.poml" "$WORKFLOW_POML_CONTENT"
}

# 成功メッセージを表示
show_success_message() {
    local agent_order_display=""
    
    # エージェント実行順序を表示用に整形
    for i in "${!SELECTED_AGENTS[@]}"; do
        [[ $i -gt 0 ]] && agent_order_display+=" → "
        agent_order_display+="${SELECTED_AGENTS[$i]}"
    done
    
    # 成功メッセージ
    success "ワークフローコマンドを作成しました: /$WORKFLOW_NAME"
    echo "📁 生成されたファイル:"
    echo "   - .claude/commands/$WORKFLOW_NAME.md"
    echo "   - .claude/commands/poml/$WORKFLOW_NAME.poml"
    echo ""
    echo "エージェント実行順序: $agent_order_display"
    echo ""
    echo "使用方法: /$WORKFLOW_NAME <type> \"<context>\""
}