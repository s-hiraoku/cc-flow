#!/bin/bash

# スラッシュコマンド→エージェント変換メインスクリプト

set -euo pipefail

# スクリプトのディレクトリを取得
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKFLOW_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# 必要なスクリプトをソース
source "$WORKFLOW_DIR/utils/common.sh"
source "$WORKFLOW_DIR/lib/slash-command-discovery.sh"
source "$WORKFLOW_DIR/lib/conversion-processor.sh"

# 使用方法を表示
show_usage() {
    cat << EOF
使用方法: $0 <command_directory> [options]

引数:
  command_directory   変換対象のコマンドディレクトリ
                     (例: utility, workflow, analysis, all)

オプション:
  --output-dir DIR   出力先ディレクトリ (デフォルト: .claude/agents)
  --template FILE    使用するテンプレートファイル (デフォルト: templates/agent-template.md)
  --dry-run          実際の変換は行わず、対象ファイルのみ表示
  --help, -h         このヘルプを表示

例:
  $0 utility                    # utilityディレクトリのコマンドを変換
  $0 all --output-dir custom    # 全コマンドをcustomディレクトリに変換
  $0 workflow --dry-run         # workflowディレクトリの対象ファイルを確認
EOF
}

# メイン処理
main() {
    local command_dir=""
    local output_dir=".claude/agents"
    local template_file="templates/agent-template.md"
    local dry_run=false
    
    # 引数解析
    while [[ $# -gt 0 ]]; do
        case $1 in
            --output-dir)
                output_dir="$2"
                shift 2
                ;;
            --template)
                template_file="$2"
                shift 2
                ;;
            --dry-run)
                dry_run=true
                shift
                ;;
            --help|-h)
                show_usage
                exit 0
                ;;
            -*)
                echo "❌ 不明なオプション: $1" >&2
                show_usage >&2
                exit 1
                ;;
            *)
                if [[ -z "$command_dir" ]]; then
                    command_dir="$1"
                else
                    echo "❌ 複数のディレクトリは指定できません" >&2
                    exit 1
                fi
                shift
                ;;
        esac
    done
    
    # 必須引数のチェック
    if [[ -z "$command_dir" ]]; then
        echo "❌ コマンドディレクトリを指定してください" >&2
        show_usage >&2
        exit 1
    fi
    
    echo "🔍 スラッシュコマンド→エージェント変換を開始"
    echo "   📂 対象: $command_dir"
    echo "   📁 出力先: $output_dir"
    echo "   📄 テンプレート: $template_file"
    
    if [[ "$dry_run" == true ]]; then
        echo "   🏃 モード: ドライラン（実際の変換は行いません）"
    fi
    
    echo ""
    
    # コマンド検索
    echo "🔍 コマンドを検索中..."
    discover_commands "$command_dir"
    
    if [[ ${#COMMAND_FILES[@]} -eq 0 ]]; then
        echo "❌ 変換対象のコマンドが見つかりませんでした"
        exit 1
    fi
    
    # コマンド名を抽出
    extract_command_names
    
    # 検索結果を表示
    display_command_list "$command_dir"
    
    echo ""
    echo "📊 変換対象: ${#COMMAND_FILES[@]} 個のコマンド"
    
    # ドライランの場合はここで終了
    if [[ "$dry_run" == true ]]; then
        echo ""
        echo "✅ ドライラン完了（実際の変換は行われませんでした）"
        exit 0
    fi
    
    echo ""
    echo "🚀 変換を開始します..."
    
    # 個別変換
    local converted_count=0
    local failed_count=0
    
    for file in "${COMMAND_FILES[@]}"; do
        local command_name=$(basename "$file" .md)
        local target_dir
        
        if [[ "$command_dir" == "all" ]]; then
            # 全体変換の場合、ディレクトリ構造を保持
            local relative_path=${file#.claude/commands/}
            local subdir=$(dirname "$relative_path")
            target_dir="$output_dir/$subdir"
        else
            # 特定ディレクトリの場合
            target_dir="$output_dir/$command_dir"
        fi
        
        if convert_command_to_agent "$file" "$target_dir" "$template_file"; then
            ((converted_count++))
        else
            ((failed_count++))
        fi
    done
    
    echo ""
    echo "📊 変換完了!"
    echo "   ✅ 成功: $converted_count"
    echo "   ❌ 失敗: $failed_count"
    echo "   📁 出力先: $output_dir"
    
    if [[ $failed_count -eq 0 ]]; then
        echo ""
        echo "🎉 すべてのコマンドが正常に変換されました!"
        echo "   変換されたエージェントは既存のワークフロー作成機能で使用できます。"
    fi
}

# スクリプトが直接実行された場合のみmainを呼び出し
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
