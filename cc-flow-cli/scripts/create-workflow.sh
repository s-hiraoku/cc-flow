#!/bin/bash

# CC-Flow: ワークフローコマンド生成スクリプト
# エージェントディレクトリから新しいワークフローコマンドを生成します

set -euo pipefail

# スクリプトのディレクトリを取得
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ライブラリを読み込み
source "$SCRIPT_DIR/utils/common.sh"
source "$SCRIPT_DIR/lib/agent-discovery.sh"
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
declare AGENT_DIR=""
declare GENERATED_FILE_PATH=""
declare WORKFLOW_STEPS_JSON="${WORKFLOW_STEPS_JSON:-}"

# ワークフロー設定を一括解析（効率的な1回実行）
parse_workflow_config() {
    local raw_json="$1"

    if [[ -z "$raw_json" ]]; then
        # デフォルト値を返す（steps_json, name, purpose, model, argument_hint）
        echo ""
        echo ""
        echo ""
        echo ""
        echo ""
        return 0
    fi

    local steps_json meta_name meta_purpose meta_model meta_argument_hint
    {
        read -r steps_json
        read -r meta_name
        read -r meta_purpose
        read -r meta_model
        read -r meta_argument_hint
    } < <(NODE_RAW_JSON="$raw_json" node - <<'NODE'
const raw = process.env.NODE_RAW_JSON;
let parsed;
try {
  parsed = JSON.parse(raw);
} catch (error) {
  console.error('ワークフロー設定ファイルの解析に失敗しました');
  process.exit(1);
}

let steps = [];
let name = '';
let purpose = '';
let model = '';
let argumentHint = '';

// ステップ配列の抽出
if (Array.isArray(parsed)) {
  steps = parsed;
} else if (parsed && Array.isArray(parsed.workflowSteps)) {
  steps = parsed.workflowSteps;

  // メタデータの抽出（workflowSteps形式の場合のみ）
  if (typeof parsed.workflowName === 'string') {
    name = parsed.workflowName;
  }
  if (typeof parsed.workflowPurpose === 'string') {
    purpose = parsed.workflowPurpose;
  }
  if (typeof parsed.workflowModel === 'string') {
    model = parsed.workflowModel;
  }
  if (typeof parsed.workflowArgumentHint === 'string') {
    argumentHint = parsed.workflowArgumentHint;
  }
} else if (parsed && Array.isArray(parsed.WORKFLOW_STEPS_JSON)) {
  steps = parsed.WORKFLOW_STEPS_JSON;
} else {
  console.error('ステップ定義は配列、もしくは {"workflowSteps": [...] } / {"WORKFLOW_STEPS_JSON": [...]} 形式で指定してください');
  process.exit(1);
}

// 出力: steps_json, name, purpose, model, argument_hint
console.log(JSON.stringify(steps));
console.log(name || '');
console.log(purpose || '');
console.log(model || '');
console.log(argumentHint || '');
NODE
    )

    if [[ $? -ne 0 ]]; then
        error_exit "ワークフロー設定の読み込みに失敗しました"
    fi

    # 戻り値を設定（グローバル変数経由）
    WORKFLOW_STEPS_JSON="$steps_json"

    # 環境変数を設定（既存の値がある場合は上書きしない）
    [[ -z "${WORKFLOW_NAME:-}" && -n "$meta_name" ]] && export WORKFLOW_NAME="$meta_name"
    [[ -z "${WORKFLOW_PURPOSE:-}" && -n "$meta_purpose" ]] && export WORKFLOW_PURPOSE="$meta_purpose"
    [[ -z "${WORKFLOW_MODEL:-}" && -n "$meta_model" ]] && export WORKFLOW_MODEL="$meta_model"
    [[ -z "${WORKFLOW_ARGUMENT_HINT:-}" && -n "$meta_argument_hint" ]] && export WORKFLOW_ARGUMENT_HINT="$meta_argument_hint"
}

# 簡潔な使用方法を表示
show_usage() {
    echo "使用方法: $0 <対象パス> --steps-json <path>"
    echo ""
    echo "例:"
    echo "  $0 ./agents/spec --steps-json ./workflow.json"
    echo ""
    echo "詳細: $0 --help または $0 --examples"
}

show_detailed_help() {
    echo "=== CC-Flow ワークフロー作成スクリプト ==="
    echo ""
    echo "使用方法: $0 <対象パス> --steps-json <path>"
    echo ""
    echo "🎯 対象パス形式:"
    echo "  ./agents/spec              特定ディレクトリのエージェント"
    echo "  ./agents                   全エージェント"
    echo "  ../.claude/agents/demo     直接相対パス"
    echo ""
    echo "⚙️  必須オプション:"
    echo "  --steps-json <path>        ワークフロー定義 JSON ファイル"
    echo "                             • 配列、または { workflowSteps: [...] } 形式"
    echo "                             • workflowName / workflowPurpose を含む場合は既定値として採用"
    echo ""
    echo "🔧 動作概要:"
    echo "• ステップ定義からエージェント順序とメタ情報を取得"
    echo "• テンプレートをレンダリングし、.claude/commands/ に Markdown を出力"
}

show_examples() {
    echo "=== CC-Flow 使用例 ==="
    echo ""
    echo "🚀 基本的な使い方:"
    echo "  cat > workflow.json <<'JSON'"
    echo "  {"
    echo "    \"workflowName\": \"demo-workflow\"," 
    echo "    \"workflowPurpose\": \"Demo purpose\"," 
    echo "    \"workflowSteps\": ["
    echo "      { \"title\": \"Stage 1\", \"mode\": \"sequential\", \"agents\": [\"agent-a\"] }"
    echo "    ]"
    echo "  }"
    echo "  JSON"
    echo ""
    echo "  $0 ./agents/spec --steps-json workflow.json"
    echo "    → JSON の内容を元にワークフローを生成"
}

parse_target_path() {
    local input_path="$1"

    case "$input_path" in
        */.claude/agents/*)
            TARGET_PATH="$input_path"
            AGENT_DIR="$(basename "$input_path")"
            ;;
        ./.claude/agents/*)
            TARGET_PATH="$input_path"
            AGENT_DIR="$(basename "$input_path")"
            ;;
        ./agents)
            TARGET_PATH="$input_path"
            AGENT_DIR="all"
            ;;
        ./agents/*)
            TARGET_PATH="$input_path"
            local remainder="${input_path#./agents/}"
            AGENT_DIR="${remainder%%/*}"
            ;;
        *)
            error_exit "サポートされていないパス形式: $input_path"
            ;;
    esac
}
# 新しいオプションフラグ式の引数解析
parse_modern_arguments() {
    TARGET_PATH=""
    local steps_source=""

    if [[ $# -eq 0 ]]; then
        show_usage
        exit 1
    fi

    TARGET_PATH="$1"
    shift

    while [[ $# -gt 0 ]]; do
        case "$1" in
            --steps-json)
                if [[ $# -lt 2 ]]; then
                    error_exit "--steps-json オプションには JSON ファイルのパスを指定してください"
                fi
                steps_source="$2"
                shift 2
                ;;
            *)
                error_exit "不明なオプション: $1"
                ;;
        esac
    done

    if [[ -z "$steps_source" ]]; then
        error_exit "--steps-json オプションが必須です"
    fi

    if [[ ! -f "$steps_source" ]]; then
        error_exit "ステップ定義ファイル '$steps_source' が見つかりません"
    fi

    # ワークフロー設定を一括解析
    parse_workflow_config "$(cat "$steps_source")"

    info "🔧 パス処理開始: $TARGET_PATH"
    parse_target_path "$TARGET_PATH"
    info "✅ パス処理完了"
}

main() {
    parse_modern_arguments "$@"

    info "処理開始: 対象パス '$TARGET_PATH'"

    if [[ "$TARGET_PATH" == */.claude/* ]]; then
        discover_direct_path "$TARGET_PATH"
        extract_item_names
    elif [[ "$TARGET_PATH" == ./* ]]; then
        discover_items "$TARGET_PATH"
        extract_item_names
    else
        discover_agents "$TARGET_PATH"
        extract_agent_names
    fi

    SELECTED_AGENTS=()
    hydrate_selected_agents_from_steps "$WORKFLOW_STEPS_JSON"

    if [[ ${#SELECTED_AGENTS[@]} -eq 0 ]]; then
        error_exit "ステップ定義にエージェントが含まれていません"
    fi

    info "✅ 選択されたエージェント: ${SELECTED_AGENTS[*]}"

    load_templates
    process_templates "$AGENT_DIR"
    generate_files
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
