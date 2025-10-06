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

# プレースホルダーを空白有無どちらの形式でも置換
replace_placeholder_variants() {
    local content="$1"
    local key="$2"
    local value="$3"

    for pattern in "{$key}" "{ $key}" "{$key }" "{ $key }"; do
        content="${content//$pattern/$value}"
    done

    printf '%s' "$content"
}

# 選択されたエージェントからデフォルトのステップJSONを生成
build_default_workflow_steps_json() {
    if [[ ${#SELECTED_AGENTS[@]} -eq 0 ]]; then
        printf '[]'
        return
    fi

    local agents_json
    agents_json=$(create_agent_array_json)

    NODE_SELECTED_AGENTS_JSON="$agents_json" node - <<'NODE'
const agents = JSON.parse(process.env.NODE_SELECTED_AGENTS_JSON || '[]');
const steps = agents.map((agent, index) => ({
  title: `Step ${index + 1}: ${agent}`,
  mode: 'sequential',
  agents: [agent]
}));
process.stdout.write(JSON.stringify(steps));
NODE
}

# ワークフローステップ定義から SELECTED_AGENTS を再構築
hydrate_selected_agents_from_steps() {
    local steps_json="$1"

    SELECTED_AGENTS=()

    if [[ -z "$steps_json" ]]; then
        return 0
    fi

    while IFS= read -r agent_line; do
        [[ -z "$agent_line" ]] && continue
        SELECTED_AGENTS+=("$agent_line")
    done < <(NODE_WORKFLOW_STEPS_JSON="$steps_json" node - <<'NODE'
const steps = JSON.parse(process.env.NODE_WORKFLOW_STEPS_JSON || '[]');
if (!Array.isArray(steps)) {
  process.exit(0);
}
for (const step of steps) {
  if (!step || !Array.isArray(step.agents)) {
    continue;
  }
  for (const agent of step.agents) {
    if (typeof agent === 'string' && agent.length > 0) {
      console.log(agent);
    }
  }
}
NODE
    )
}

# テンプレート変数を置換
process_templates() {
    local agent_dir="$1"
    local workflow_name="${WORKFLOW_NAME:-${agent_dir}-workflow}"
    local description="${WORKFLOW_PURPOSE:-Execute $agent_dir workflow}"
    local argument_hint="${WORKFLOW_ARGUMENT_HINT:-[context]}"
    local steps_json="${WORKFLOW_STEPS_JSON:-}"

    if [[ -z "$steps_json" ]]; then
        steps_json=$(build_default_workflow_steps_json)
    else
        hydrate_selected_agents_from_steps "$steps_json"
    fi

    local temp_instructions
    if ! temp_instructions=$(mktemp "${TMPDIR:-/tmp}/poml_instructions_XXXXXX.md"); then
        error_exit "一時指示ファイルの作成に失敗しました"
    fi
    trap "rm -f '$temp_instructions'" EXIT
    local poml_result
    poml_result=$(convert_poml_to_markdown "$WORKFLOW_POML_TEMPLATE" "$workflow_name" "$description" "$steps_json")

    echo "$poml_result" > "$temp_instructions"

    WORKFLOW_MD_CONTENT="$WORKFLOW_MD_TEMPLATE"
    WORKFLOW_MD_CONTENT=$(replace_placeholder_variants "$WORKFLOW_MD_CONTENT" "DESCRIPTION" "$description")
    WORKFLOW_MD_CONTENT=$(replace_placeholder_variants "$WORKFLOW_MD_CONTENT" "ARGUMENT_HINT" "$argument_hint")
    WORKFLOW_MD_CONTENT=$(replace_placeholder_variants "$WORKFLOW_MD_CONTENT" "WORKFLOW_NAME" "$workflow_name")
    
    # Claude Code推奨設定のデフォルト値を設定
    WORKFLOW_MD_CONTENT=$(replace_placeholder_variants "$WORKFLOW_MD_CONTENT" "ALLOWED_TOOLS" "[Read, Bash]")
    
    # model設定: 指定されていれば使用、なければフィールド自体を省略
    if [[ -n "${WORKFLOW_MODEL:-}" ]]; then
        WORKFLOW_MD_CONTENT=$(replace_placeholder_variants "$WORKFLOW_MD_CONTENT" "MODEL" "$WORKFLOW_MODEL")
    else
        # MODELフィールドを完全に削除（省略時の推奨動作）
        WORKFLOW_MD_CONTENT=$(replace_placeholder_variants "$WORKFLOW_MD_CONTENT" "model: { MODEL }" "")
    fi

    local poml_instructions
    poml_instructions=$(cat "$temp_instructions")
    WORKFLOW_MD_CONTENT=$(replace_placeholder_variants "$WORKFLOW_MD_CONTENT" "POML_GENERATED_INSTRUCTIONS" "$poml_instructions")

    rm -f "$temp_instructions"

    WORKFLOW_POML_CONTENT="$WORKFLOW_POML_TEMPLATE"
    WORKFLOW_STEPS_JSON="$steps_json"

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

# 指定されたディレクトリにファイルを生成
generate_files_to() {
    local output_dir="$1"

    # 出力ディレクトリを作成
    safe_mkdir "$output_dir"

    # 直接マークダウンファイルを生成
    safe_write_file "$output_dir/$WORKFLOW_NAME.md" "$WORKFLOW_MD_CONTENT"

    # 生成されたファイルパスを保存
    GENERATED_FILE_PATH="$output_dir/$WORKFLOW_NAME.md"
    info "✅ ワークフローファイルを生成しました: $GENERATED_FILE_PATH"
}
