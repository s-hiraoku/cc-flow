#!/bin/bash

# エージェント検索関連の関数

# 現在のスクリプトのディレクトリを取得
LIB_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$LIB_SCRIPT_DIR/../utils/common.sh"

# エージェントディレクトリからエージェントファイルを検索
discover_agents() {
    local agent_dir="$1"
    local agent_path=".claude/agents/$agent_dir"
    
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
    echo "📂 '$agent_dir' ディレクトリで見つかったエージェント："
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