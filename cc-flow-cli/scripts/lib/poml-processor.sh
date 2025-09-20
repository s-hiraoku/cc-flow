#!/bin/bash

# POML処理関連の関数

# 現在のスクリプトのディレクトリを取得
LIB_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$LIB_SCRIPT_DIR/../utils/common.sh"

# Node.js環境の依存関係チェック
check_nodejs_dependencies() {
    info "Node.js環境をチェックしています..."
    
    # Node.jsの存在確認
    if ! command -v node >/dev/null 2>&1; then
        error_exit "Node.jsが見つかりません。Node.jsをインストールしてください"
    fi
    
    # npmの存在確認
    if ! command -v npm >/dev/null 2>&1; then
        error_exit "npmが見つかりません。npmをインストールしてください"
    fi
    
    # pomljsパッケージの存在確認
    if ! npm list -g pomljs >/dev/null 2>&1 && ! npm list pomljs >/dev/null 2>&1; then
        warn "pomljsパッケージが見つかりません。インストールを試行します..."
        if ! npm install pomljs >/dev/null 2>&1; then
            error_exit "pomljsパッケージのインストールに失敗しました"
        fi
        success "pomljsパッケージをインストールしました"
    fi
    
    success "Node.js環境の確認が完了しました"
}

# POMMLファイルからマークダウンを生成
process_poml_to_markdown() {
    local poml_file="$1"
    local output_file="$2"
    local context_vars="$3"
    
    # 引数の検証
    validate_args "$poml_file" "POMLファイルパス"
    validate_args "$output_file" "出力ファイルパス"
    
    # POMLファイルの存在確認
    check_file "$poml_file" "POMLファイル"
    
    info "POMMLファイルを処理しています: $poml_file"
    
    # pomljsコマンドを構築
    local poml_command="npx pomljs --file \"$poml_file\""
    
    # コンテキスト変数が指定されている場合は追加
    if [[ -n "$context_vars" ]]; then
        poml_command="$poml_command $context_vars"
    fi
    
    # POMMLファイルを処理してマークダウンを生成
    local poml_output
    if ! poml_output=$(eval "$poml_command" 2>&1); then
        error_exit "pomljsの実行に失敗しました: $poml_output"
    fi
    
    # JSON出力からメッセージ内容を抽出
    local markdown_content
    if [[ "$poml_output" =~ \"content\":\"([^\"]*) ]]; then
        # JSONから実際のコンテンツを抽出しようとする
        markdown_content=$(echo "$poml_output" | jq -r '.messages[0].content' 2>/dev/null || echo "$poml_output")
    else
        markdown_content="$poml_output"
    fi
    
    # 出力ファイルに書き込み
    if ! echo "$markdown_content" > "$output_file" 2>/dev/null; then
        error_exit "出力ファイル '$output_file' への書き込みに失敗しました"
    fi
    
    success "マークダウンファイルを生成しました: $output_file"
}

# POMLファイルをMarkdownに変換（pomljsを使用）
convert_poml_to_markdown() {
    local poml_content="$1"
    local agent_list_json="$2"
    local workflow_name="$3"

    # info "POMLファイルをpomljsで変換しています..."

    # Node.js環境をチェック（サイレント）
    check_nodejs_dependencies >/dev/null 2>&1

    # 一時POMLファイルを作成
    local temp_poml="/tmp/workflow_${workflow_name}_$$.poml"

    # POMLテンプレートからエージェントリストを置換した内容を作成
    echo "$poml_content" | sed "s/{WORKFLOW_AGENT_LIST}/$agent_list_json/g" | sed "s/{WORKFLOW_NAME}/$workflow_name/g" > "$temp_poml"

    # pomljsでPOMLを実行してMarkdownを生成（必要な変数を渡す）
    local poml_output
    if ! poml_output=$(npx pomljs --file "$temp_poml" --context 'user_input=workflow execution' --context 'context=sequential agent execution' 2>&1); then
        rm -f "$temp_poml"
        error_exit "pomljsの実行に失敗しました: $poml_output"
    fi

    # 一時ファイルをクリーンアップ
    rm -f "$temp_poml"

    # JSON出力からメッセージ内容を抽出
    local markdown_content
    if command -v jq >/dev/null 2>&1; then
        # jqが利用可能な場合
        markdown_content=$(echo "$poml_output" | jq -r '.messages[0].content' 2>/dev/null)
        if [[ -z "$markdown_content" || "$markdown_content" == "null" ]]; then
            markdown_content="$poml_output"
        fi
    else
        # jqが利用できない場合はシンプルな抽出
        markdown_content=$(echo "$poml_output" | sed -n 's/.*"content":"\([^"]*\)".*/\1/p' | head -1)
        if [[ -z "$markdown_content" ]]; then
            markdown_content="$poml_output"
        fi
    fi

    # Markdownを出力
    echo "$markdown_content"
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
    
    # ファイルパスを構築
    local poml_file=".claude/commands/poml/$workflow_name.poml"
    local output_file=".claude/commands/$workflow_name.md"
    
    # コンテキスト変数を生成
    local context_vars
    context_vars=$(create_workflow_context "$workflow_name" "$user_context")
    
    # POMLファイルを処理
    process_poml_to_markdown "$poml_file" "$output_file" "$context_vars"
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
    local context_vars="$3"
    
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
        process_poml_to_markdown "$poml_file" "$output_file" "$context_vars"
    done
    
    success "全てのPOMLファイルの処理が完了しました"
}