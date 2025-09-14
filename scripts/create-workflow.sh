#!/bin/bash

# CC-Flow: ワークフローコマンド生成スクリプト
# エージェントディレクトリから新しいワークフローコマンドを生成します

set -euo pipefail

# スクリプトのディレクトリを取得
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ライブラリを読み込み
source "$SCRIPT_DIR/utils/common.sh"
source "$SCRIPT_DIR/lib/agent-discovery.sh"
source "$SCRIPT_DIR/lib/user-interaction.sh"
source "$SCRIPT_DIR/lib/template-processor.sh"

# グローバル変数の宣言
declare -a AGENT_FILES
declare -a AGENT_NAMES
declare -a SELECTED_AGENTS
declare WORKFLOW_MD_TEMPLATE
declare WORKFLOW_POML_TEMPLATE
declare WORKFLOW_MD_CONTENT
declare WORKFLOW_POML_CONTENT
declare WORKFLOW_NAME

# 使用方法を表示
show_usage() {
    echo "使用方法: $0 <エージェントディレクトリ> [順序]"
    echo ""
    echo "例:"
    echo "  $0 spec                    # 対話モード"
    echo "  $0 spec \"1 3 4 6\"         # 順序指定モード"
    echo ""
    echo "指定されたエージェントディレクトリから、順次実行するワークフローコマンドを生成します。"
    echo "順序を指定しない場合は対話モードで実行されます。"
}

# 引数を解析
parse_arguments() {
    local agent_dir="$1"
    local order_spec="${2:-}"
    
    # 引数のバリデーション
    validate_args "$agent_dir" "エージェントディレクトリ名"
    
    # エージェントディレクトリ名をグローバル変数に設定
    AGENT_DIR="$agent_dir"
    ORDER_SPEC="$order_spec"
}

# メイン処理
main() {
    local agent_dir="$1"
    local order_spec="${2:-}"
    
    # 引数解析
    parse_arguments "$agent_dir" "$order_spec"
    
    # 処理開始メッセージ
    info "処理開始: エージェントディレクトリ '$AGENT_DIR'"
    
    # エージェント検索
    discover_agents "$AGENT_DIR"
    extract_agent_names
    
    # エージェント一覧を表示
    display_agent_list "$AGENT_DIR"
    
    # 実行順序を決定
    if [[ -n "$ORDER_SPEC" ]]; then
        # 順序指定モード
        process_order_specification "$ORDER_SPEC"
    else
        # 対話モード
        show_selection_instructions
        get_execution_order
    fi
    
    # 確認メッセージ
    show_final_confirmation
    
    # テンプレート処理
    load_templates
    process_templates "$AGENT_DIR"
    
    # ファイル生成
    generate_files
    
    # 成功メッセージ表示
    show_success_message
}

# エラーハンドラー
handle_error() {
    local exit_code=$?
    error_exit "予期しないエラーが発生しました (終了コード: $exit_code)"
}

# エラーハンドラーを設定
trap handle_error ERR

# メイン処理を実行
if [[ $# -eq 0 ]]; then
    show_usage
    exit 1
fi

main "$@"