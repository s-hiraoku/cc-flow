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

# 簡潔な使用方法を表示
show_usage() {
    echo "使用方法: $0 <対象パス> [オプション...]"
    echo ""
    echo "基本的な使い方:"
    echo "  $0 ./agents/spec              # 対話モード"
    echo "  $0 ./agents/spec -o \"1 2 3\"   # 順序指定"
    echo "  $0 ./agents/spec -p \"目的\"     # 目的指定"
    echo ""
    echo "オプション:"
    echo "  -o, --order ORDER       エージェント順序 (例: \"1 2 3\" または \"agent1,agent2\")"
    echo "  -p, --purpose PURPOSE   ワークフローの目的・説明"
    echo "  -n, --name NAME         ワークフロー名"
    echo "  -i, --interactive       対話モード強制"
    echo "  --quick                 クイック作成 (全エージェント順番通り)"
    echo "  --all                   全エージェント選択"
    echo "  -h, --help             この使用方法を表示"
    echo "  --examples             詳細な例を表示"
    echo ""
    echo "詳細: $0 --help または $0 --examples"
}

# 詳細なヘルプを表示
show_detailed_help() {
    echo "=== CC-Flow ワークフロー作成スクリプト ==="
    echo ""
    echo "使用方法: $0 <対象パス> [オプション...]"
    echo ""
    echo "🎯 対象パス形式:"
    echo "  ./agents/spec              特定ディレクトリのエージェント"
    echo "  ./agents                   全エージェント"
    echo "  ../.claude/agents/demo     直接相対パス"
    echo "  spec                       旧形式（廃止予定、警告表示）"
    echo ""
    echo "⚙️  オプション:"
    echo "  -o, --order ORDER          エージェント実行順序"
    echo "                             • 数字: \"1 2 3\" (インデックス指定)"
    echo "                             • 名前: \"spec-init,spec-impl\" (名前指定)"
    echo "  -p, --purpose PURPOSE      ワークフローの目的・説明文"
    echo "  -n, --name NAME            生成するワークフロー名"
    echo "  -i, --interactive          対話モード強制実行"
    echo "  --quick                    クイック作成 (推奨順序で全選択)"
    echo "  --all                      全エージェント選択 (番号順)"
    echo "  -h, --help                 詳細ヘルプ表示"
    echo "  --examples                 使用例表示"
    echo ""
    echo "🔧 動作:"
    echo "• 指定されたパスからエージェントを検出"
    echo "• 順序に従ってワークフローを生成"
    echo "• .claude/commands/ にスラッシュコマンドファイルを出力"
    echo "• 生成されたコマンドは Claude Code で /workflow-name として実行可能"
    echo ""
    echo "💡 ヒント:"
    echo "• オプション未指定時は対話モードで実行"
    echo "• 後方互換性のため従来の引数形式も使用可能"
    echo "• 環境変数 WORKFLOW_NAME, WORKFLOW_PURPOSE でも設定可能"
}

# 使用例を表示
show_examples() {
    echo "=== CC-Flow 使用例 ==="
    echo ""
    echo "🚀 基本的な使い方:"
    echo "  $0 ./agents/spec"
    echo "    → 対話モードで spec ディレクトリのエージェントから選択"
    echo ""
    echo "  $0 ./agents/spec --order \"1 2 3\""
    echo "    → 1番目、2番目、3番目のエージェントを順番に実行"
    echo ""
    echo "  $0 ./agents/spec --purpose \"API仕様書作成\""
    echo "    → 対話モード + 目的指定"
    echo ""
    echo "⚡ 便利なショートカット:"
    echo "  $0 ./agents/spec --quick"
    echo "    → 推奨順序で全エージェント選択"
    echo ""
    echo "  $0 ./agents/spec --all"
    echo "    → 全エージェントを番号順で選択"
    echo ""
    echo "🎯 詳細指定:"
    echo "  $0 ./agents/spec -o \"spec-init,spec-design\" -p \"設計フェーズ\" -n \"design-workflow\""
    echo "    → 名前指定 + 目的 + ワークフロー名"
    echo ""
    echo "  $0 ./agents \"spec-init,utility-date\" --purpose \"クロスカテゴリ実行\""
    echo "    → 複数カテゴリからエージェント選択"
    echo ""
    echo "🔄 従来形式 (後方互換):"
    echo "  $0 ./agents/spec \"1 2 3\" \"目的\""
    echo "    → 従来の位置引数形式"
    echo ""
    echo "📝 設定ファイル利用:"
    echo "  export WORKFLOW_NAME=\"my-workflow\""
    echo "  export WORKFLOW_PURPOSE=\"カスタム目的\""
    echo "  $0 ./agents/spec --order \"1 2\""
    echo "    → 環境変数で事前設定"
}

# 新しいオプションフラグ式の引数解析
parse_modern_arguments() {
    
    TARGET_PATH=""
    local order_spec=""
    local purpose=""
    local workflow_name=""
    local force_interactive=false
    local quick_mode=false
    local all_mode=false
    
    # 最初の引数（対象パス）を取得
    if [[ $# -eq 0 ]]; then
        show_usage
        exit 1
    fi
    
    TARGET_PATH="$1"

    shift
    
    # オプション解析

    while [[ $# -gt 0 ]]; do

        case $1 in
            -o|--order)
                order_spec="$2"

                shift 2
                ;;
            -p|--purpose)
                purpose="$2"
                export WORKFLOW_PURPOSE="$purpose"

                shift 2
                ;;
            -n|--name)
                workflow_name="$2"
                export WORKFLOW_NAME="$workflow_name"

                shift 2
                ;;
            -i|--interactive)
                force_interactive=true

                shift
                ;;
            --quick)
                quick_mode=true

                shift
                ;;
            --all)
                all_mode=true

                shift
                ;;
            -h|--help)
                show_detailed_help
                exit 0
                ;;
            --examples)
                show_examples
                exit 0
                ;;
            *)
                error_exit "不明なオプション: $1
使用方法については '$0 --help' を実行してください"
                ;;
        esac
    done
    
    # モード設定
    info "🔧 モード設定開始: quick=$quick_mode, all=$all_mode, interactive=$force_interactive, order='$order_spec'"
    if [[ "$quick_mode" == true ]]; then
        MODE="quick"
        info "✅ クイックモードに設定"
    elif [[ "$all_mode" == true ]]; then
        MODE="all"
        info "✅ 全選択モードに設定"
    elif [[ "$force_interactive" == true ]] || [[ -z "$order_spec" ]]; then
        MODE="interactive"
        info "✅ 対話モードに設定"
    elif [[ "$order_spec" == *","* ]]; then
        MODE="item-names"
        IFS=',' read -ra ITEM_NAMES_SPECIFIED <<< "$order_spec"
        info "✅ アイテム名モードに設定"
    else
        MODE="indices"
        info "✅ インデックスモードに設定"
    fi
    
    ORDER_SPEC="$order_spec"
    info "🔧 最終設定: MODE=$MODE, ORDER_SPEC='$ORDER_SPEC'"
    
    # パス処理（既存のロジックを再利用）
    info "🔧 パス処理開始: $TARGET_PATH"
    parse_target_path "$TARGET_PATH"
    info "✅ パス処理完了"
    
    # 引数バリデーション
    info "🔧 引数バリデーション開始"
    validate_args "$TARGET_PATH" "対象パス"
    info "✅ 引数バリデーション完了"
}

# 対象パス解析（既存のparse_arguments から分離）
parse_target_path() {
    local target_path="$1"
    info "🔍 パス解析開始: $target_path"
    
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
            info "⚠️ 短縮形式 '$target_path' を './agents/$target_path' に変換"
            TARGET_PATH="./agents/$target_path"
            AGENT_DIR="$target_path"
            ;;
    esac
    
    info "✅ パス解析完了: TARGET_PATH=$TARGET_PATH, AGENT_DIR=$AGENT_DIR"
}

# 従来の引数解析（後方互換性のため保持）
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
    # 新しい引数解析システムを使用
    detect_and_parse_arguments "$@"

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
        "quick")
            # クイックモード: 推奨順序で全選択
            process_quick_mode
            ;;
        "all")
            # 全選択モード: 番号順で全選択
            process_all_mode
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

# クイックモード処理
process_quick_mode() {
    info "クイックモード: 推奨順序で全エージェントを選択"
    
    # 全エージェントを推奨順序で選択
    SELECTED_AGENTS=()
    
    # 利用可能なエージェント数を確認
    local total_agents=${#AGENT_NAMES[@]}
    if [[ $total_agents -eq 0 ]]; then
        error_exit "利用可能なエージェントが見つかりません"
    fi
    
    # 全エージェントを順番通りに追加
    for i in $(seq 0 $((total_agents - 1))); do
        SELECTED_AGENTS+=("${AGENT_NAMES[$i]}")
    done
    
    info "✅ 選択されたエージェント: ${SELECTED_AGENTS[*]}"
}

# 全選択モード処理
process_all_mode() {
    info "全選択モード: 全エージェントを番号順で選択"
    
    # 全エージェントを番号順で選択
    SELECTED_AGENTS=()
    
    # 利用可能なエージェント数を確認
    local total_agents=${#AGENT_NAMES[@]}
    if [[ $total_agents -eq 0 ]]; then
        error_exit "利用可能なエージェントが見つかりません"
    fi
    
    # 全エージェントを追加
    for agent_name in "${AGENT_NAMES[@]}"; do
        SELECTED_AGENTS+=("$agent_name")
    done
    
    info "✅ 選択されたエージェント: ${SELECTED_AGENTS[*]}"
}

# 新しい引数形式を検出して適切な解析関数を呼び出す
detect_and_parse_arguments() {
    
    # オプションフラグが含まれているかチェック
    local has_flags=false
    for arg in "$@"; do
        if [[ "$arg" =~ ^-.*$ ]]; then
            has_flags=true

            break
        fi
    done
    
    if [[ "$has_flags" == true ]]; then
        # 新しいオプションフラグ式を使用

        parse_modern_arguments "$@"
    else
        # 従来の位置引数式を使用（後方互換性）

        parse_arguments "$@"
    fi
}

# エラーハンドラー
handle_error() {
    local exit_code=$?
    error_exit "予期しないエラーが発生しました (終了コード: $exit_code)"
}

# エラーハンドラーを設定
trap handle_error ERR

# メイン処理を実行
# 引数なしの場合のみ基本ヘルプを表示
if [[ $# -eq 0 ]]; then
    show_usage
    exit 1
fi

# 早期ヘルプ処理（対象パス解析前に処理）
case "${1:-}" in
    -h|--help)
        show_detailed_help
        exit 0
        ;;
    --examples)
        show_examples
        exit 0
        ;;
esac

main "$@"