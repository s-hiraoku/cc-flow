#!/bin/bash

# エージェント・アイテム検索関連の関数
# 将来的にitem-discovery.shに改名予定

# 現在のスクリプトのディレクトリを取得
LIB_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$LIB_SCRIPT_DIR/../utils/common.sh"

# エージェントディレクトリからエージェントファイルを検索
discover_agents() {
    local agent_dir="$1"

    # プロジェクトルートを動的に検出
    local project_root
    # cc-flow-cli/scripts から実行された場合は、cc-flow-cli がプロジェクトルート
    local cli_root="$(cd "$LIB_SCRIPT_DIR/../.." && pwd)"
    if [[ -d "$cli_root/.claude" ]]; then
        project_root="$cli_root"
    else
        # そうでなければ、3階層上を使用
        project_root="$(cd "$LIB_SCRIPT_DIR/../../.." && pwd)"
    fi

    if [[ "$agent_dir" == "all" ]]; then
        # 全エージェント検索
        discover_all_items "$project_root/.claude/agents"
    else
        # 特定ディレクトリ検索
        local agent_path="$project_root/.claude/agents/$agent_dir"

        # ディレクトリの存在確認
        check_directory "$agent_path" "エージェントディレクトリ"

        # エージェントファイルを検索
        local agent_files=()
        while IFS= read -r -d '' file; do
            agent_files+=("$file")
        done < <(find "$agent_path" -name "*.md" -type f -print0 | sort -z)

        if [[ ${#agent_files[@]} -eq 0 ]]; then
            error_exit "ディレクトリ '$agent_dir' にエージェントが見つかりません"
        fi

        # グローバル配列に結果を設定
        AGENT_FILES=("${agent_files[@]}")
    fi
}

# エージェントファイルからエージェント名を抽出
extract_agent_names() {
    AGENT_NAMES=()
    
    for file in "${AGENT_FILES[@]}"; do
        local agent_name=$(basename "$file" .md)
        AGENT_NAMES+=("$agent_name")
    done
}

# エージェント一覧を表示
display_agent_list() {
    local agent_dir="$1"
    
    echo ""
    if [[ "$agent_dir" == "all" ]]; then
        echo "📂 全ディレクトリで見つかったエージェント："
    else
        echo "📂 '$agent_dir' ディレクトリで見つかったエージェント："
    fi
    echo ""
    
    for i in "${!AGENT_NAMES[@]}"; do
        local agent_name="${AGENT_NAMES[$i]}"
        local description=""
        
        # エージェントの種類に応じたアイコンと説明を追加
        case "$agent_name" in
            *init*) description="🏗️  初期化・セットアップ" ;;
            *requirements*) description="📋 要件定義・分析" ;;
            *design*) description="🎨 設計・アーキテクチャ" ;;
            *tasks*) description="📝 タスク分解・計画" ;;
            *impl*) description="⚡ 実装・開発" ;;
            *status*) description="📊 進捗・ステータス確認" ;;
            *test*) description="🧪 テスト・検証" ;;
            *deploy*) description="🚀 デプロイメント" ;;
            *steering*) description="🎯 方向性・ガイダンス" ;;
            *) description="⚙️  処理・実行" ;;
        esac
        
        printf "   %2d. %-20s %s\n" "$((i+1))" "$agent_name" "$description"
    done
}

# 利用可能なエージェント数を取得
get_agent_count() {
    echo "${#AGENT_NAMES[@]}"
}

# インデックスからエージェント名を取得
get_agent_name_by_index() {
    local index="$1"
    
    if [[ $index -ge 0 && $index -lt ${#AGENT_NAMES[@]} ]]; then
        echo "${AGENT_NAMES[$index]}"
    else
        return 1
    fi
}
# ========================================
# 汎用的なアイテム発見機能（将来拡張用）
# ========================================

# 全アイテム発見機能
discover_all_items() {
    local base_path="$1"  # 絶対パス
    local item_files=()

    # ディレクトリの存在確認
    if [[ ! -d "$base_path" ]]; then
        error_exit "ディレクトリ '$base_path' が見つかりません"
    fi

    while IFS= read -r -d '' file; do
        item_files+=("$file")
    done < <(find "$base_path" -name "*.md" -type f -print0 | sort -z)

    if [[ ${#item_files[@]} -eq 0 ]]; then
        error_exit "$base_path にアイテムが見つかりません"
    fi

    # 後方互換性のためにAGENT_FILESにも設定
    AGENT_FILES=("${item_files[@]}")
    ITEM_FILES=("${item_files[@]}")
}

# 特定ディレクトリのアイテム発見
discover_directory_items() {
    local target_path="$1"  # 絶対パス

    check_directory "$target_path" "対象ディレクトリ"

    local item_files=()
    while IFS= read -r -d '' file; do
        item_files+=("$file")
    done < <(find "$target_path" -name "*.md" -type f -print0 | sort -z)

    if [[ ${#item_files[@]} -eq 0 ]]; then
        error_exit "$target_path にアイテムが見つかりません"
    fi

    # 後方互換性のためにAGENT_FILESにも設定
    AGENT_FILES=("${item_files[@]}")
    ITEM_FILES=("${item_files[@]}")
}

# TARGET_PATHに基づく汎用的なアイテム発見
discover_items() {
    local target_path="$1"  # "./agents/spec" or "./agents"
    # "./"プレフィックスを削除してクリーンなパスを作成
    local clean_path="${target_path#./}"

    # プロジェクトルートを動的に検出
    local project_root
    # cc-flow-cli/scripts から実行された場合は、cc-flow-cli がプロジェクトルート
    local cli_root="$(cd "$LIB_SCRIPT_DIR/../.." && pwd)"
    if [[ -d "$cli_root/.claude" ]]; then
        project_root="$cli_root"
    else
        # そうでなければ、3階層上を使用
        project_root="$(cd "$LIB_SCRIPT_DIR/../../.." && pwd)"
    fi
    local full_path="$project_root/.claude/$clean_path"

    case "$target_path" in
        "./agents")
            # 全エージェント
            discover_all_items "$full_path"
            ;;
        "./commands")
            # 全コマンド（将来）
            discover_all_items "$full_path"
            ;;
        "./agents/"*)
            # 特定エージェントディレクトリ
            discover_directory_items "$full_path"
            ;;
        "./commands/"*)
            # 特定コマンドディレクトリ（将来）
            discover_directory_items "$full_path"
            ;;
        *)
            error_exit "サポートされていないパス形式: $target_path"
            ;;
    esac
}

# パスからアイテム情報を抽出
extract_item_info_from_path() {
    local file_path="$1"      # ".claude/agents/spec/spec-init.md"
    local item_name=$(basename "$file_path" .md)    # "spec-init"
    local directory=$(basename "$(dirname "$file_path")")  # "spec"
    local category=$(basename "$(dirname "$(dirname "$file_path")")")  # "agents"
    
    echo "$category/$directory/$item_name"
}

# アイテム名配列を抽出（汎用版）
extract_item_names() {
    AGENT_NAMES=()  # 後方互換性
    ITEM_NAMES=()
    
    local files_array=("${ITEM_FILES[@]:-${AGENT_FILES[@]}}")
    
    for file in "${files_array[@]}"; do
        local item_name=$(basename "$file" .md)
        AGENT_NAMES+=("$item_name")  # 後方互換性
        ITEM_NAMES+=("$item_name")
    done
}

# 直接パス指定による発見
discover_direct_path() {
    local target_path="$1"  # "../.claude/agents/demo-commands" など

    # 相対パスを絶対パスに変換
    local full_path="$(cd "$(dirname "$target_path")" && pwd)/$(basename "$target_path")"

    # ディレクトリの存在確認
    check_directory "$full_path" "対象ディレクトリ"

    local item_files=()
    while IFS= read -r -d '' file; do
        item_files+=("$file")
    done < <(find "$full_path" -name "*.md" -type f -print0 | sort -z)

    if [[ ${#item_files[@]} -eq 0 ]]; then
        error_exit "$full_path にアイテムが見つかりません"
    fi

    # 後方互換性のためにAGENT_FILESにも設定
    AGENT_FILES=("${item_files[@]}")
    ITEM_FILES=("${item_files[@]}")
}
