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

# グローバル変数の宣言と初期化
declare -a AGENT_FILES=()
declare -a AGENT_NAMES=()
declare -a SELECTED_AGENTS=()
declare -a ITEM_NAMES_SPECIFIED=()
declare -a ITEM_FILES=()
declare -a ITEM_NAMES=()
declare WORKFLOW_MD_TEMPLATE=""
declare WORKFLOW_POML_TEMPLATE=""
declare WORKFLOW_MD_CONTENT=""
declare WORKFLOW_POML_CONTENT=""
declare WORKFLOW_NAME="${WORKFLOW_NAME:-}"  # 環境変数から読み込み、未設定なら空文字列
declare TARGET_PATH=""
declare MODE=""
declare AGENT_DIR=""
declare ORDER_SPEC=""
declare GENERATED_FILE_PATH=""

# 使用方法を表示
show_usage() {
    echo "使用方法: $0 <対象パス> [順序またはアイテム名] [目的]"
    echo ""
    echo "対象パス形式:"
    echo "  ./agents/spec              # 特定ディレクトリ"
    echo "  ./agents                   # 全エージェント"
    echo "  ../.claude/agents/demo     # 直接相対パス"
    echo "  spec                       # 旧形式（廃止予定）"
    echo ""
    echo "順序指定例:"
    echo "  $0 ./agents/spec                           # 対話モード"
    echo "  $0 ./agents/spec \"1 3 4 6\"                # インデックス指定"
    echo "  $0 ./agents/spec \"spec-init,spec-impl\"     # アイテム名指定"
    echo "  $0 ./agents \"spec-init,utility-date\"       # 横断指定"
    echo ""
    echo "目的指定例:"
    echo "  $0 ./agents/spec \"1 2\" \"API仕様書作成\"    # 目的を指定"
    echo "  $0 ./agents/spec \"\" \"テスト作成\"           # 対話モード+目的指定"
    echo ""
    echo "指定された対象パスから、順次実行するワークフローコマンドを生成します。"
    echo "順序を指定しない場合は対話モードで実行されます。"
    echo "目的を指定すると、生成されるスラッシュコマンドの説明に反映されます。"
}

# 引数を解析
parse_arguments() {
    local target_path="$1"
    local order_spec="${2:-}"
    local purpose="${3:-}"
    
    # purpose が指定された場合、環境変数に設定
    if [[ -n "$purpose" ]]; then
        export WORKFLOW_PURPOSE="$purpose"
    fi
    
    # 引数のバリデーション
    validate_args "$target_path" "対象パス"
    
    # 相対パス形式の処理
    case "$target_path" in
        */.claude/agents/* | */.claude/commands/*)
            # 直接.claudeパスが指定された場合
            TARGET_PATH="$target_path"
            # 後方互換性のためにAGENT_DIRも設定
            AGENT_DIR=$(basename "$target_path")
            [[ "$AGENT_DIR" == "agents" ]] && AGENT_DIR="all"
            [[ "$AGENT_DIR" == "commands" ]] && AGENT_DIR="all"
            ;;
        ./*)
            # 新形式: 相対パス
            TARGET_PATH="$target_path"
            # 後方互換性のためにAGENT_DIRも設定
            if [[ "$target_path" == "./agents/"* ]]; then
                AGENT_DIR=$(basename "$target_path")
                [[ "$AGENT_DIR" == "agents" ]] && AGENT_DIR="all"
            else
                AGENT_DIR="all"  # 非agentsディレクトリの場合
            fi
            ;;
        *)
            # 旧形式: 短縮形（後方互換性、廃止予定警告）
            warn "短縮形式 '$target_path' は廃止予定です。'./agents/$target_path' を使用してください"
            TARGET_PATH="./agents/$target_path"
            AGENT_DIR="$target_path"
            ;;
    esac
    
    # アイテム名リストが指定された場合の処理
    if [[ "$order_spec" == *","* ]]; then
        # カンマ区切りはアイテム名リスト
        IFS=',' read -ra ITEM_NAMES_SPECIFIED <<< "$order_spec"
        MODE="item-names"
    elif [[ -n "$order_spec" ]]; then
        # スペース区切りは従来の数字インデックス
        MODE="indices"
    else
        MODE="interactive"
    fi
    
    ORDER_SPEC="$order_spec"
}

# メイン処理
main() {
    local target_path="$1"
    local order_spec="${2:-}"
    local purpose="${3:-}"

    # 引数解析
    parse_arguments "$target_path" "$order_spec" "$purpose"

    # 処理開始メッセージ
    info "処理開始: 対象パス '$TARGET_PATH'"

    # アイテム検索
    if [[ "$TARGET_PATH" == */.claude/* ]]; then
        # 直接.claudeパスが指定された場合
        discover_direct_path "$TARGET_PATH"
        extract_item_names
    elif [[ "$TARGET_PATH" == ./* ]]; then
        # 新形式: 相対パスを使用
        discover_items "$TARGET_PATH"
        extract_item_names
    else
        # 後方互換性: 旧形式の短縮形を使用
        discover_agents "$AGENT_DIR"
        extract_agent_names
    fi
    
    # エージェント一覧を表示
    display_agent_list "$AGENT_DIR"
    
    # 実行順序を決定
    case "$MODE" in
        "item-names")
            # アイテム名指定モード
            process_item_names_specification
            ;;
        "indices")
            # インデックス指定モード（従来）
            process_order_specification "$ORDER_SPEC"
            ;;
        *)
            # 対話モード
            show_selection_instructions
            get_execution_order
            ;;
    esac
    
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