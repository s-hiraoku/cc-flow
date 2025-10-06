#!/bin/bash

# スラッシュコマンド→エージェント変換処理ライブラリ

# 現在のスクリプトのディレクトリを取得
LIB_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$LIB_SCRIPT_DIR/../utils/common.sh"
source "$LIB_SCRIPT_DIR/template-processor.sh"

# GNU/BSD portable in-place sed wrapper
sed_inplace() {
    local file="$1"
    shift

    if [[ "$OSTYPE" == darwin* ]]; then
        sed -i '' "$@" "$file"
    else
        sed -i "$@" "$file"
    fi
}

# Escape sed replacement strings (handles \\ | &)
escape_sed_replacement() {
    local value="$1"
    value="${value//\\/\\\\}"
    value="${value//&/\\&}"
    value="${value//|/\\|}"
    printf '%s' "$value"
}

# Replace placeholders written with or without spacing
replace_placeholder() {
    local file="$1"
    local placeholder="$2"
    local raw_value="$3"
    local value
    value="$(escape_sed_replacement "$raw_value")"

    sed_inplace "$file" "s|{ ${placeholder} }|$value|g"
    sed_inplace "$file" "s|{${placeholder}}|$value|g"
}

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
    extract_command_metadata "$source_file"

    # 抽出された変数を確認
    local name="${EXTRACTED_NAME:-}"
    local description="${EXTRACTED_DESCRIPTION:-}"
    local tools="${EXTRACTED_TOOLS:-}"
    local content="${EXTRACTED_CONTENT:-}"
    local argument_hint
    argument_hint="$(extract_argument_hint "$source_file")"
    local conversion_date="$(date '+%Y-%m-%d %H:%M:%S')"
    local conversion_version="1.0"
    local target_category="$(basename "$target_directory")"
    local template_name="$(basename "$template_file")"
    local validation_status="✅ 変換完了"
    local conversion_warnings="なし"
    local cc_flow_version="0.0.5"

    # 一時ファイルにテンプレートをコピー
    cp "$template_file" "$target_file"

    # sedを使ってプレースホルダーを置換
    replace_placeholder "$target_file" "AGENT_NAME" "$name"
    replace_placeholder "$target_file" "AGENT_DESCRIPTION" "$description"
    replace_placeholder "$target_file" "AGENT_MODEL" "sonnet"
    replace_placeholder "$target_file" "AGENT_TOOLS" "$tools"
    replace_placeholder "$target_file" "AGENT_COLOR" "blue"
    replace_placeholder "$target_file" "SOURCE_PATH" "$source_file"
    replace_placeholder "$target_file" "SOURCE_COMMAND_NAME" "$command_name"
    replace_placeholder "$target_file" "SOURCE_ARGUMENT_HINT" "$argument_hint"
    replace_placeholder "$target_file" "SOURCE_ALLOWED_TOOLS" "$tools"
    replace_placeholder "$target_file" "CONVERSION_DATE" "$conversion_date"
    replace_placeholder "$target_file" "CONVERSION_VERSION" "$conversion_version"
    replace_placeholder "$target_file" "TARGET_CATEGORY" "$target_category"
    replace_placeholder "$target_file" "TEMPLATE_NAME" "$template_name"
    replace_placeholder "$target_file" "VALIDATION_STATUS" "$validation_status"
    replace_placeholder "$target_file" "CONVERSION_WARNINGS" "$conversion_warnings"
    replace_placeholder "$target_file" "CC_FLOW_VERSION" "$cc_flow_version"

    # { AGENT_CONTENT } を実際のコンテンツに置換
    # 一時ファイルを使用して複数行コンテンツを処理
    local temp_file
    temp_file=$(mktemp)

    # { AGENT_CONTENT } の前までを取得
    sed -n '/{ AGENT_CONTENT }/q;p' "$target_file" > "$temp_file"

    # コンテンツを追加
    echo "$content" >> "$temp_file"

    # { AGENT_CONTENT } の後を追加
    sed -n '/{ AGENT_CONTENT }/,${/{ AGENT_CONTENT }/!p;}' "$target_file" >> "$temp_file"

    # ファイルを置き換え
    mv "$temp_file" "$target_file"

    # 残りのプレースホルダーも置換
    replace_placeholder "$target_file" "AGENT_CONTENT" ""

    echo "✅ 変換完了: $target_file"
}

# スラッシュコマンドからメタデータを抽出
extract_command_metadata() {
    local source_file="$1"

    # YAMLフロントマターを抽出
    local frontmatter=$(sed -n '/^---$/,/^---$/p' "$source_file" | sed '1d;$d')

    # 各フィールドを抽出
    local extracted_name=$(echo "$frontmatter" | grep '^name:' | sed 's/^name: *//' | tr -d '"')
    local extracted_description=$(echo "$frontmatter" | grep '^description:' | sed 's/^description: *//' | tr -d '"')
    local extracted_tools=$(echo "$frontmatter" | grep '^tools:' | sed 's/^tools: *//')

    # デフォルト値の設定
    if [[ -z "$extracted_name" ]]; then
        extracted_name=$(basename "$source_file" .md)
    fi

    if [[ -z "$extracted_description" ]]; then
        extracted_description="Converted from slash command"
    fi

    if [[ -z "$extracted_tools" ]]; then
        extracted_tools="[Read, Write, Bash]"
    fi

    # Markdownコンテンツを抽出（フロントマター以降）
    local extracted_content=$(sed -n '/^---$/,/^---$/!p' "$source_file" | sed '/^---$/,$!d' | sed '1d')

    # グローバル変数に結果を設定（Bash 3.2互換）
    EXTRACTED_NAME="$extracted_name"
    EXTRACTED_DESCRIPTION="$extracted_description"
    EXTRACTED_TOOLS="$extracted_tools"
    EXTRACTED_CONTENT="$extracted_content"
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
