#!/bin/bash

# POML処理関連の関数

# 現在のスクリプトのディレクトリを取得
LIB_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$LIB_SCRIPT_DIR/../utils/common.sh"

# Node.js環境の依存関係チェック
check_nodejs_dependencies() {
    info "Node.js環境をチェックしています..."

    if ! command -v node >/dev/null 2>&1; then
        error_exit "Node.jsが見つかりません。Node.jsをインストールしてください"
    fi

    if ! command -v npm >/dev/null 2>&1; then
        error_exit "npmが見つかりません。npmをインストールしてください"
    fi

    if ! command -v npx >/dev/null 2>&1; then
        error_exit "npxが見つかりません。Node.js 8.2.0以上をインストールしてください"
    fi

    success "Node.js環境の確認が完了しました"
}

# jq依存関係チェック
check_jq_dependency() {
    if ! command -v jq >/dev/null 2>&1; then
        warn "jqが見つかりません。JSONパースでフォールバック処理を使用します"
        return 1
    fi
    return 0
}

# SELECTED_AGENTS から JSON 配列文字列を生成
create_agent_array_json() {
    local first=true
    printf '['
    for agent in "${SELECTED_AGENTS[@]}"; do
        if [[ "$first" == true ]]; then
            first=false
        else
            printf ', '
        fi
        printf '"%s"' "$agent"
    done
    printf ']'
}

# POMLファイルをMarkdownに変換（内部プロセッサーを使用）
convert_poml_to_markdown() {
    local poml_content="$1"
    local workflow_name="$2"
    local workflow_purpose="$3"

    # Node.js環境をチェック（サイレント）
    check_nodejs_dependencies >/dev/null 2>&1

    # エージェントリストを唯一のソースから生成
    local agent_array
    agent_array="$(create_agent_array_json)"

    # ワークフローコンテキストは標準値を使用（必要に応じて拡張）
    local workflow_context="sequential agent execution"

    # 一時POMLファイルを安全に作成
    local temp_poml
    local template_root="$LIB_SCRIPT_DIR/../../templates"

    local temp_dir
    if ! temp_dir=$(mktemp -d "${TMPDIR:-/tmp}/workflow_${workflow_name}_XXXXXX"); then
        error_exit "一時ディレクトリの作成に失敗しました"
    fi

    local temp_poml="$temp_dir/workflow.poml"

    # POMLテンプレートの変数置換を行う
    local processed_poml="$poml_content"

    # 処理済みPOMLファイルを保存
    echo "$processed_poml" > "$temp_poml"

    # include 参照を解決するため、partials ディレクトリをコピー
    if [[ -d "$template_root/partials" ]]; then
        cp -R "$template_root/partials" "$temp_dir/"
    fi

    # pomljsを使ってPOMLをマークダウンに変換
    local poml_output
    local temp_error="$temp_dir/poml_error.log"
    trap "rm -rf '$temp_dir'" EXIT

    local context_file="$temp_dir/context.json"
    NODE_CONTEXT_PATH="$context_file" \
    NODE_WORKFLOW_NAME="$workflow_name" \
    NODE_WORKFLOW_CONTEXT="$workflow_context" \
    NODE_WORKFLOW_PURPOSE="${workflow_purpose:-}" \
    NODE_WORKFLOW_AGENTS_JSON="$agent_array" \
    node - <<'NODE'
const fs = require('fs');
const data = {
  workflowName: process.env.NODE_WORKFLOW_NAME,
  workflowContext: process.env.NODE_WORKFLOW_CONTEXT,
  workflowPurpose: process.env.NODE_WORKFLOW_PURPOSE || '',
  workflowAgents: JSON.parse(process.env.NODE_WORKFLOW_AGENTS_JSON)
};
fs.writeFileSync(process.env.NODE_CONTEXT_PATH, JSON.stringify(data));
NODE

    if ! poml_output=$(npx pomljs --file "$temp_poml" --cwd "$temp_dir" --format dict --context-file "$context_file" 2>"$temp_error"); then
        local poml_error
        poml_error=$(cat "$temp_error" 2>/dev/null || echo "")
        error_exit "pomljsによるPOML変換に失敗しました: $poml_error"
    fi

    # 一時ファイルをクリーンアップ
    rm -rf "$temp_dir"
    trap - EXIT

    # pomljsのJSON出力からマークダウンコンテンツを抽出
    local markdown_text
    if check_jq_dependency; then
        # jqが利用可能な場合、JSONからcontentを抽出
        markdown_text=$(echo "$poml_output" | jq -r '.messages[0].content' 2>/dev/null)
        if [[ -z "$markdown_text" || "$markdown_text" == "null" ]]; then
            # jqでの抽出に失敗した場合、poml_outputをそのまま使用
            markdown_text="$poml_output"
        fi
    else
        # jqが利用できない場合、sedで抽出を試行
        markdown_text=$(echo "$poml_output" | sed -n 's/.*"content":"\([^"]*\)".*/\1/p' | head -1)
        if [[ -z "$markdown_text" ]]; then
            markdown_text="$poml_output"
        fi
    fi

    # エスケープされた文字を復元
    markdown_text="${markdown_text//\\n/$'\n'}"
    markdown_text="${markdown_text//\\\"/\"}"

    # シェル用ラッパーを付けずにPOMLで生成された指示のみ返す
    printf '%s\n' "$markdown_text"
}

# ファイルからPOMLを読み込んでMarkdownに変換
convert_poml_file_to_markdown() {
    local poml_file="$1"
    local output_file="$2"
    local workflow_name="$3"
    local user_context="$4"

    validate_args "$poml_file" "POMLファイルパス"
    validate_args "$output_file" "出力ファイルパス"
    check_file "$poml_file" "POMLファイル"

    info "POMLファイルを変換しています: $poml_file"

    local effective_workflow_name="$workflow_name"
    if [[ -z "$effective_workflow_name" ]]; then
        effective_workflow_name="$(basename "$poml_file" .poml)"
    fi

    local poml_content
    if ! poml_content=$(cat "$poml_file" 2>/dev/null); then
        error_exit "POMLファイル '$poml_file' の読み込みに失敗しました"
    fi

    local markdown_output
    if ! markdown_output=$(convert_poml_to_markdown "$poml_content" "$effective_workflow_name" "$user_context"); then
        error_exit "POMLからMarkdownへの変換に失敗しました"
    fi

    if ! safe_write_file "$output_file" "$markdown_output"; then
        error_exit "出力ファイル '$output_file' への書き込みに失敗しました"
    fi

    success "マークダウンファイルを生成しました: $output_file"
}

# ワークフロー用のコンテキスト変数を生成
create_workflow_context() {
    local workflow_name="$1"
    local user_context="$2"
    
    # 基本的なコンテキスト変数
    local context_args=""
    
    # ワークフロー名を追加
    if [[ -n "$workflow_name" ]]; then
        context_args="$context_args --context \"workflow_name=$workflow_name\""
    fi
    
    # ユーザーコンテキストを追加
    if [[ -n "$user_context" ]]; then
        context_args="$context_args --context \"user_input=$user_context\""
        context_args="$context_args --context \"context=$user_context\""
    fi
    
    # エージェントリストが設定されている場合は追加
    if [[ ${#SELECTED_AGENTS[@]} -gt 0 ]]; then
        local agent_list="${SELECTED_AGENTS[*]}"
        context_args="$context_args --context \"agent_list=$agent_list\""
    fi
    
    echo "$context_args"
}

# ワークフロー用のPOML処理を実行
process_workflow_poml() {
    local workflow_name="$1"
    local user_context="${2:-default_context}"

    local poml_file=".claude/commands/poml/$workflow_name.poml"
    local output_file=".claude/commands/$workflow_name.md"

    convert_poml_file_to_markdown "$poml_file" "$output_file" "$workflow_name" "$user_context"
}

# POML処理の事前チェック
validate_poml_processing() {
    local poml_file="$1"
    
    # Node.js環境チェック
    check_nodejs_dependencies
    
    # POMLファイルの構文チェック（基本的な検証）
    if [[ -f "$poml_file" ]]; then
        # POMLファイルが空でないことを確認
        if [[ ! -s "$poml_file" ]]; then
            error_exit "POMLファイル '$poml_file' が空です"
        fi
        
        # 基本的な構文チェック（POMLタグの存在確認）
        if ! grep -q "<.*>" "$poml_file"; then
            warn "POMLファイルにタグが見つかりません。通常のテキストファイルの可能性があります"
        fi
    fi
}

# POML処理のクリーンアップ
cleanup_poml_processing() {
    local temp_files=("$@")
    
    # 一時ファイルの削除
    for temp_file in "${temp_files[@]}"; do
        if [[ -f "$temp_file" ]] && [[ "$temp_file" == *.tmp ]] || [[ "$temp_file" == */tmp/* ]]; then
            rm -f "$temp_file" >/dev/null 2>&1
            info "一時ファイルを削除しました: $temp_file"
        fi
    done
}

# POML処理の詳細ログ
show_poml_processing_info() {
    local poml_file="$1"
    local output_file="$2"
    
    echo ""
    echo "🔧 POML処理詳細:"
    echo "   入力: $poml_file"
    echo "   出力: $output_file"
    echo "   処理エンジン: pomljs"
    
    # POMLファイルのサイズ情報
    if [[ -f "$poml_file" ]]; then
        local file_size
        file_size=$(wc -c < "$poml_file")
        echo "   POMLファイルサイズ: ${file_size}バイト"
    fi
    
    echo ""
}

# バッチPOML処理（複数ファイル対応）
process_multiple_poml_files() {
    local poml_dir="$1"
    local output_dir="$2"
    
    # ディレクトリの存在確認
    check_directory "$poml_dir" "POMLディレクトリ"
    safe_mkdir "$output_dir"
    
    # POMLファイルを検索
    local poml_files=()
    while IFS= read -r -d '' file; do
        poml_files+=("$file")
    done < <(find "$poml_dir" -name "*.poml" -type f -print0 | sort -z)
    
    if [[ ${#poml_files[@]} -eq 0 ]]; then
        warn "POMLファイルが見つかりませんでした: $poml_dir"
        return 0
    fi
    
    info "${#poml_files[@]}個のPOMLファイルを処理します"
    
    # 各POMLファイルを処理
    for poml_file in "${poml_files[@]}"; do
        local basename
        basename=$(basename "$poml_file" .poml)
        local output_file="$output_dir/$basename.md"
        
        echo ""
        progress "処理中: $basename"
        convert_poml_file_to_markdown "$poml_file" "$output_file" "$basename" ""
    done
    
    success "全てのPOMLファイルの処理が完了しました"
}
