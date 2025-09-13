#!/bin/bash

# ユーザー対話関連の関数

# 現在のスクリプトのディレクトリを取得
LIB_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$LIB_SCRIPT_DIR/../utils/common.sh"

# 実行順序選択の説明を表示
show_selection_instructions() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🎯 ワークフローを作成します"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "実行したいエージェントを選択してください。"
    echo ""
    echo "💡 選択方法:"
    echo "   • 番号をスペース区切りで入力（例: 1 3 5 7）"
    echo "   • 順序は自由に指定可能"
    echo "   • 必要なエージェントのみ選択"
    echo ""
    
    # 実際のエージェント名を使った例を表示
    if [[ ${#AGENT_NAMES[@]} -gt 4 ]]; then
        echo "📝 例: 1 3 5 7"
        echo "   ↳ ${AGENT_NAMES[0]} → ${AGENT_NAMES[2]} → ${AGENT_NAMES[4]} → ${AGENT_NAMES[6]}"
    else
        echo "📝 例: 1 2 3"
        echo "   ↳ 全エージェントを順番通り実行"
    fi
    echo ""
}

# ユーザーから実行順序を取得
get_execution_order() {
    local order_input
    local order_array
    local selected_agents=()
    local seen_agents=()
    local valid
    
    while true; do
        echo "🔢 選択する番号を入力してください:"
        printf "   → "
        read order_input
        
        # 入力を配列に変換
        read -ra order_array <<< "$order_input"
        
        if [[ ${#order_array[@]} -eq 0 ]]; then
            echo "   ⚠️  エージェントが選択されていません"
            echo ""
            continue
        fi
        
        # 選択を検証
        selected_agents=()
        seen_agents=()
        valid=true
        
        for num in "${order_array[@]}"; do
            # 数字の妥当性チェック
            if ! [[ "$num" =~ ^[0-9]+$ ]] || [ "$num" -lt 1 ] || [ "$num" -gt "${#AGENT_NAMES[@]}" ]; then
                echo "   ❌ 無効な番号: '$num' (1-${#AGENT_NAMES[@]}の範囲で入力してください)"
                valid=false
                break
            fi
            
            local agent_name="${AGENT_NAMES[$((num-1))]}"
            
            # 重複チェック
            if [[ ${#seen_agents[@]} -gt 0 ]] && array_contains "$agent_name" "${seen_agents[@]}"; then
                echo "   ⚠️  エージェント '$agent_name' が重複しています"
                valid=false
                break
            fi
            
            seen_agents+=("$agent_name")
            selected_agents+=("$agent_name")
        done
        
        [[ "$valid" = false ]] && continue
        
        # 選択確認
        echo ""
        echo "✅ 選択されたワークフロー:"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        for i in "${!selected_agents[@]}"; do
            if [[ $i -eq 0 ]]; then
                echo "   $((i+1)). 🚀 ${selected_agents[$i]} (開始)"
            elif [[ $i -eq $((${#selected_agents[@]}-1)) ]]; then
                echo "   $((i+1)). 🏁 ${selected_agents[$i]} (完了)"
            else
                echo "   $((i+1)). ⚙️  ${selected_agents[$i]}"
            fi
        done
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        
        if confirm_selection; then
            # グローバル配列に結果を設定
            SELECTED_AGENTS=("${selected_agents[@]}")
            break
        else
            echo ""
            echo "🔄 もう一度選択してください。"
            echo ""
        fi
    done
}

# 選択確認
confirm_selection() {
    local confirm
    
    echo "🤔 このワークフローで実行しますか？"
    printf "   [y] はい / [n] いいえ: "
    read confirm
    
    [[ "$confirm" =~ ^[Yy]$ ]]
}

# 順序指定モードで選択を処理
process_order_specification() {
    local order_spec="$1"
    local order_array
    local selected_agents=()
    local seen_agents=()
    
    # 入力を配列に変換
    read -ra order_array <<< "$order_spec"
    
    if [[ ${#order_array[@]} -eq 0 ]]; then
        error_exit "エージェントが選択されていません"
    fi
    
    # 選択を検証
    for num in "${order_array[@]}"; do
        # 数字の妥当性チェック
        if ! [[ "$num" =~ ^[0-9]+$ ]] || [ "$num" -lt 1 ] || [ "$num" -gt "${#AGENT_NAMES[@]}" ]; then
            error_exit "無効な番号: '$num' (1-${#AGENT_NAMES[@]}の範囲で入力してください)"
        fi
        
        local agent_name="${AGENT_NAMES[$((num-1))]}"
        
        # 重複チェック
        if [[ ${#seen_agents[@]} -gt 0 ]] && array_contains "$agent_name" "${seen_agents[@]}"; then
            error_exit "エージェント '$agent_name' が重複しています"
        fi
        
        seen_agents+=("$agent_name")
        selected_agents+=("$agent_name")
    done
    
    # グローバル配列に結果を設定
    SELECTED_AGENTS=("${selected_agents[@]}")
    
    # 選択確認表示
    echo ""
    echo "✅ 選択されたワークフロー (順序指定モード):"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    for i in "${!selected_agents[@]}"; do
        if [[ $i -eq 0 ]]; then
            echo "   $((i+1)). 🚀 ${selected_agents[$i]} (開始)"
        elif [[ $i -eq $((${#selected_agents[@]}-1)) ]]; then
            echo "   $((i+1)). 🏁 ${selected_agents[$i]} (完了)"
        else
            echo "   $((i+1)). ⚙️  ${selected_agents[$i]}"
        fi
    done
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# 最終確認メッセージ
show_final_confirmation() {
    echo ""
    echo "🔧 ワークフローコマンドを生成しています..."
    echo ""
}