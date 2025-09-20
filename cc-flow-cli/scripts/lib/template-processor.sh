#!/bin/bash

# テンプレート処理関連の関数

# 現在のスクリプトのディレクトリを取得
LIB_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$LIB_SCRIPT_DIR/../utils/common.sh"
source "$LIB_SCRIPT_DIR/poml-processor.sh"

# テンプレートファイルを読み込み
load_templates() {
    local workflow_md_template
    local workflow_poml_template
    
    # スクリプトからテンプレートディレクトリへのパス
    local template_dir="$LIB_SCRIPT_DIR/../../templates"
    
    # workflow.mdテンプレートを読み込み
    if ! workflow_md_template=$(cat "$template_dir/workflow.md" 2>/dev/null); then
        error_exit "テンプレートファイル '$template_dir/workflow.md' が見つかりません"
    fi
    
    # workflow.pomlテンプレートを読み込み
    if ! workflow_poml_template=$(cat "$template_dir/workflow.poml" 2>/dev/null); then
        error_exit "テンプレートファイル '$template_dir/workflow.poml' が見つかりません"
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
        json+="'${SELECTED_AGENTS[$i]}'"
    done
    
    json+="]"
    echo "$json"
}

# テンプレート変数を置換
process_templates() {
    local agent_dir="$1"
    local workflow_name="${WORKFLOW_NAME:-${agent_dir}-workflow}"
    local description="Execute $agent_dir workflow"
    local argument_hint="[context]"
    local agent_list_json
    
    # エージェントリストをスペース区切り形式に変換（POMLでシンプルに処理するため）
    local agent_list_space="${SELECTED_AGENTS[*]}"

    # POMLからMarkdown実行指示を生成
    local temp_instructions="/tmp/poml_instructions_$$.md"

    # convert_poml_to_markdown関数を呼び出し
    local poml_result
    poml_result=$(convert_poml_to_markdown "$WORKFLOW_POML_TEMPLATE" "$agent_list_space" "$workflow_name")

    # 結果をファイルに書き込み
    echo "$poml_result" > "$temp_instructions"

    # workflow.mdテンプレートの変数置換
    WORKFLOW_MD_CONTENT="$WORKFLOW_MD_TEMPLATE"
    WORKFLOW_MD_CONTENT="${WORKFLOW_MD_CONTENT//\{DESCRIPTION\}/$description}"
    WORKFLOW_MD_CONTENT="${WORKFLOW_MD_CONTENT//\{ARGUMENT_HINT\}/$argument_hint}"
    WORKFLOW_MD_CONTENT="${WORKFLOW_MD_CONTENT//\{WORKFLOW_NAME\}/$workflow_name}"

    # エージェントリストをテンプレートに挿入
    WORKFLOW_MD_CONTENT="${WORKFLOW_MD_CONTENT//\{WORKFLOW_AGENT_LIST\}/$agent_list_space}"

    # POMLで生成された実行指示を挿入（シンプルな文字列置換）
    local poml_instructions=$(cat "$temp_instructions")
    WORKFLOW_MD_CONTENT="${WORKFLOW_MD_CONTENT//\{POML_GENERATED_INSTRUCTIONS\}/$poml_instructions}"

    # 一時ファイルをクリーンアップ
    rm -f "$temp_instructions"
    
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
    # 出力ディレクトリの決定
    local output_dir
    if [[ "$TARGET_PATH" == */.claude/* ]]; then
        # 直接.claudeパスが指定された場合、.claudeディレクトリまでのパスを抽出
        local path_before_claude="${TARGET_PATH%/.claude/*}"
        local claude_dir="$path_before_claude/.claude"
        output_dir="$claude_dir/commands"
    else
        # 従来の処理: agent-discovery.shと同じロジックを使用
        local cli_root="$(cd "$LIB_SCRIPT_DIR/../.." && pwd)"
        if [[ -d "$cli_root/.claude" ]]; then
            output_dir="$cli_root/.claude/commands"
        else
            local project_root="$(cd "$LIB_SCRIPT_DIR/../../.." && pwd)"
            output_dir="$project_root/.claude/commands"
        fi
    fi

    # 出力ディレクトリを作成
    safe_mkdir "$output_dir"
    safe_mkdir "$output_dir/poml"

    # POMLファイルを書き込み（中間ファイル）
    local poml_file="$output_dir/poml/$WORKFLOW_NAME.poml"
    safe_write_file "$poml_file" "$WORKFLOW_POML_CONTENT"

    # 直接マークダウンファイルを生成（シンプルなテンプレート処理）
    safe_write_file "$output_dir/$WORKFLOW_NAME.md" "$WORKFLOW_MD_CONTENT"

    # 中間POMLファイルを削除
    if [[ -f "$poml_file" ]]; then
        rm -f "$poml_file" >/dev/null 2>&1
        info "中間ファイルをクリーンアップしました: $poml_file"
    fi

    # pomlディレクトリが空の場合は削除
    if [[ -d "$output_dir/poml" ]] && [[ -z "$(ls -A "$output_dir/poml")" ]]; then
        rmdir "$output_dir/poml" >/dev/null 2>&1
        info "空のpomlディレクトリを削除しました: $output_dir/poml"
    fi

    info "ワークフローファイルを生成しました"

    # 生成されたファイルのパスを更新
    GENERATED_FILE_PATH="$output_dir/$WORKFLOW_NAME.md"
}

# 成功メッセージを表示
show_success_message() {
    local agent_order_display=""

    # エージェント実行順序を表示用に整形
    for i in "${!SELECTED_AGENTS[@]}"; do
        [[ $i -gt 0 ]] && agent_order_display+=" → "
        agent_order_display+="${SELECTED_AGENTS[$i]}"
    done

    # 生成されたファイルのパスを決定
    local display_file_path
    if [[ -n "${GENERATED_FILE_PATH:-}" ]]; then
        display_file_path="$GENERATED_FILE_PATH"
    else
        display_file_path=".claude/commands/$WORKFLOW_NAME.md"
    fi

    # 成功メッセージ
    success "ワークフローコマンドを作成しました: /$WORKFLOW_NAME"
    echo "📁 生成されたファイル:"
    echo "   - $display_file_path"
    echo ""
    echo "エージェント実行順序: $agent_order_display"
    echo ""
    echo "使用方法: /$WORKFLOW_NAME \"<context>\""
}