#!/bin/bash

# スラッシュコマンド検索関連の関数
# agent-discovery.sh のスラッシュコマンド版

# 現在のスクリプトのディレクトリを取得
LIB_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$LIB_SCRIPT_DIR/../utils/common.sh"

# スラッシュコマンドディレクトリからコマンドファイルを検索
discover_commands() {
    local command_dir="$1"
    
    if [[ "$command_dir" == "all" ]]; then
        # 全コマンド検索
        discover_all_commands ".claude/commands"
    else
        # 特定ディレクトリ検索
        local command_path=".claude/commands/$command_dir"
        
        # ディレクトリの存在確認
        check_directory "$command_path" "コマンドディレクトリ"
        
        # コマンドファイルを検索
        local command_files=()
        while IFS= read -r -d '' file; do
            command_files+=("$file")
        done < <(find "$command_path" -name "*.md" -type f -print0 | sort -z)
        
        if [[ ${#command_files[@]} -eq 0 ]]; then
            error_exit "ディレクトリ '$command_dir' にコマンドが見つかりません"
        fi
        
        # グローバル配列に結果を設定
        COMMAND_FILES=("${command_files[@]}")
    fi
}

# コマンドファイルからコマンド名を抽出
extract_command_names() {
    COMMAND_NAMES=()
    
    for file in "${COMMAND_FILES[@]}"; do
        local command_name=$(basename "$file" .md)
        COMMAND_NAMES+=("$command_name")
    done
}

# コマンド一覧を表示
display_command_list() {
    local command_dir="$1"
    
    echo ""
    if [[ "$command_dir" == "all" ]]; then
        echo "📂 全ディレクトリで見つかったコマンド："
    else
        echo "📂 '$command_dir' ディレクトリで見つかったコマンド："
    fi
    echo ""
    
    for i in "${!COMMAND_NAMES[@]}"; do
        local command_name="${COMMAND_NAMES[$i]}"
        local description=""
        
        # コマンドの種類に応じたアイコンと説明を追加
        case "$command_name" in
            *convert*) description="🔄 変換・変更" ;;
            *create*) description="🏗️  作成・生成" ;;
            *utility*) description="⚙️  ユーティリティ" ;;
            *workflow*) description="🚀 ワークフロー" ;;
            *analysis*) description="📊 分析・解析" ;;
            *test*) description="🧪 テスト・検証" ;;
            *deploy*) description="🚀 デプロイメント" ;;
            *) description="📝 コマンド" ;;
        esac
        
        printf "   %2d. %-20s %s\n" "$((i+1))" "$command_name" "$description"
    done
}

# 利用可能なコマンド数を取得
get_command_count() {
    echo "${#COMMAND_NAMES[@]}"
}

# インデックスからコマンド名を取得
get_command_name_by_index() {
    local index="$1"
    
    if [[ $index -ge 0 && $index -lt ${#COMMAND_NAMES[@]} ]]; then
        echo "${COMMAND_NAMES[$index]}"
    else
        return 1
    fi
}

# ========================================
# 全コマンド発見機能
# ========================================

# 全コマンド発見機能
discover_all_commands() {
    local base_path="$1"  # ".claude/commands"
    local command_files=()
    
    # ディレクトリの存在確認
    if [[ ! -d "$base_path" ]]; then
        error_exit "ディレクトリ '$base_path' が見つかりません"
    fi
    
    while IFS= read -r -d '' file; do
        command_files+=("$file")
    done < <(find "$base_path" -name "*.md" -type f -print0 | sort -z)
    
    if [[ ${#command_files[@]} -eq 0 ]]; then
        error_exit "$base_path にコマンドが見つかりません"
    fi
    
    # グローバル配列に結果を設定
    COMMAND_FILES=("${command_files[@]}")
}

# 特定ディレクトリのコマンド発見
discover_directory_commands() {
    local target_path="$1"  # ".claude/commands/utility"
    
    check_directory "$target_path" "対象ディレクトリ"
    
    local command_files=()
    while IFS= read -r -d '' file; do
        command_files+=("$file")
    done < <(find "$target_path" -name "*.md" -type f -print0 | sort -z)
    
    if [[ ${#command_files[@]} -eq 0 ]]; then
        error_exit "$target_path にコマンドが見つかりません"
    fi
    
    # グローバル配列に結果を設定
    COMMAND_FILES=("${command_files[@]}")
}