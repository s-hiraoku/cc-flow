#!/bin/bash

# スラッシュコマンド→エージェント変換処理ライブラリ

# 現在のスクリプトのディレクトリを取得
LIB_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$LIB_SCRIPT_DIR/../utils/common.sh"
source "$LIB_SCRIPT_DIR/template-processor.sh"

# スラッシュコマンドをエージェントに変換
convert_command_to_agent() {
    local source_file="$1"
    local target_directory="$2"
    local template_file="${3:-templates/agent-template.md}"
    
    # ファイルの存在確認
    if [[ ! -f "$source_file" ]]; then
        error_exit "ソースファイルが見つかりません: $source_file"
    fi
    
    # テンプレートファイルの存在確認
    if [[ ! -f "$template_file" ]]; then
        error_exit "テンプレートファイルが見つかりません: $template_file"
    fi
    
    # ターゲットディレクトリの作成
    mkdir -p "$target_directory"
    
    # コマンド名を抽出
    local command_name=$(basename "$source_file" .md)
    local target_file="$target_directory/$command_name.md"
    
    echo "🔄 変換中: $source_file → $target_file"
    
    # メタデータを抽出
    local name description tools content
    extract_command_metadata "$source_file" name description tools content
    
    # テンプレート変数を設定
    declare -A template_vars=(
        ["AGENT_NAME"]="$name"
        ["AGENT_DESCRIPTION"]="$description"
        ["AGENT_MODEL"]="sonnet"
        ["AGENT_TOOLS"]="$tools"
        ["AGENT_COLOR"]="blue"
        ["AGENT_CONTENT"]="$content"
        ["SOURCE_PATH"]="$source_file"
        ["SOURCE_COMMAND_NAME"]="$command_name"
        ["SOURCE_ARGUMENT_HINT"]="$(extract_argument_hint "$source_file")"
        ["SOURCE_ALLOWED_TOOLS"]="$tools"
        ["CONVERSION_DATE"]="$(date '+%Y-%m-%d %H:%M:%S')"
        ["CONVERSION_VERSION"]="1.0"
        ["TARGET_CATEGORY"]="$(basename "$target_directory")"
        ["TEMPLATE_NAME"]="$(basename "$template_file")"
        ["VALIDATION_STATUS"]="✅ 変換完了"
        ["CONVERSION_WARNINGS"]="なし"
        ["CC_FLOW_VERSION"]="0.0.5"
    )
    
    # テンプレート処理
    process_template "$template_file" "$target_file" template_vars
    
    echo "✅ 変換完了: $target_file"
}

# スラッシュコマンドからメタデータを抽出
extract_command_metadata() {
    local source_file="$1"
    local -n name_ref="$2"
    local -n description_ref="$3"
    local -n tools_ref="$4"
    local -n content_ref="$5"
    
    # YAMLフロントマターを抽出
    local frontmatter=$(sed -n '/^---$/,/^---$/p' "$source_file" | sed '1d;$d')
    
    # 各フィールドを抽出
    name_ref=$(echo "$frontmatter" | grep '^name:' | sed 's/^name: *//' | tr -d '"')
    description_ref=$(echo "$frontmatter" | grep '^description:' | sed 's/^description: *//' | tr -d '"')
    tools_ref=$(echo "$frontmatter" | grep '^tools:' | sed 's/^tools: *//')
    
    # デフォルト値の設定
    if [[ -z "$name_ref" ]]; then
        name_ref=$(basename "$source_file" .md)
    fi
    
    if [[ -z "$description_ref" ]]; then
        description_ref="Converted from slash command"
    fi
    
    if [[ -z "$tools_ref" ]]; then
        tools_ref="[Read, Write, Bash]"
    fi
    
    # Markdownコンテンツを抽出（フロントマター以降）
    content_ref=$(sed -n '/^---$/,/^---$/!p' "$source_file" | sed '/^---$/,$!d' | sed '1d')
}

# 引数ヒントを抽出
extract_argument_hint() {
    local source_file="$1"
    local frontmatter=$(sed -n '/^---$/,/^---$/p' "$source_file" | sed '1d;$d')
    local argument_hint=$(echo "$frontmatter" | grep '^argument-hint:' | sed 's/^argument-hint: *//' | tr -d '"')
    
    if [[ -z "$argument_hint" ]]; then
        echo "<args>"
    else
        echo "$argument_hint"
    fi
}

# 複数のコマンドを一括変換
batch_convert_commands() {
    local source_directory="$1"
    local target_base_directory="$2"
    local template_file="${3:-templates/agent-template.md}"
    
    echo "📂 一括変換開始: $source_directory → $target_base_directory"
    
    # ソースディレクトリの確認
    if [[ ! -d "$source_directory" ]]; then
        error_exit "ソースディレクトリが見つかりません: $source_directory"
    fi
    
    # ターゲットディレクトリの作成
    mkdir -p "$target_base_directory"
    
    local converted_count=0
    local failed_count=0
    
    # .mdファイルを検索して変換
    while IFS= read -r -d '' file; do
        local relative_path=${file#$source_directory/}
        local target_dir="$target_base_directory/$(dirname "$relative_path")"
        
        if convert_command_to_agent "$file" "$target_dir" "$template_file"; then
            ((converted_count++))
        else
            ((failed_count++))
            echo "❌ 変換失敗: $file"
        fi
    done < <(find "$source_directory" -name "*.md" -type f -print0)
    
    echo ""
    echo "📊 変換結果:"
    echo "   ✅ 成功: $converted_count"
    echo "   ❌ 失敗: $failed_count"
    echo "   📁 出力先: $target_base_directory"
}

# 変換可能性をチェック
check_conversion_compatibility() {
    local source_file="$1"
    
    # ファイルの存在確認
    if [[ ! -f "$source_file" ]]; then
        return 1
    fi
    
    # YAMLフロントマターの確認
    if ! grep -q '^---$' "$source_file"; then
        return 2
    fi
    
    # 基本的なメタデータの確認
    local frontmatter=$(sed -n '/^---$/,/^---$/p' "$source_file" | sed '1d;$d')
    
    # nameまたはdescriptionのいずれかが存在することを確認
    if ! echo "$frontmatter" | grep -q '^name:\|^description:'; then
        return 3
    fi
    
    return 0
}