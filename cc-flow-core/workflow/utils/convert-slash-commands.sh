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
使用方法: $0 <commands-dir> <agents-dir> [options]

引数:
  <commands-dir>     変換対象のコマンドディレクトリの絶対パス
  <agents-dir>       出力先エージェントディレクトリの絶対パス

オプション:
  --template FILE    使用するテンプレートファイルの絶対パス
  --dry-run          実際の変換は行わず、対象ファイルのみ表示
  --help, -h         このヘルプを表示

例:
  # utilityディレクトリのコマンドを .claude/agents/utility に変換
  $0 /path/to/.claude/commands/utility /path/to/.claude/agents

  # kiroディレクトリのコマンドを .claude/agents/kiro に変換
  $0 /path/to/.claude/commands/kiro /path/to/.claude/agents

  # dry-runモードで確認
  $0 /path/to/.claude/commands /path/to/.claude/agents --dry-run
EOF
}

# メイン処理
main() {
    local commands_dir=""
    local agents_dir=""
    # SCRIPT_DIRからテンプレートへの絶対パスを構築
    local template_file="$SCRIPT_DIR/../../templates/agent-template.md"
    local dry_run=false

    # 最初の2つの引数をディレクトリパスとして取得
    if [[ $# -lt 2 ]]; then
        show_usage
        exit 1
    fi

    commands_dir="$1"
    agents_dir="$2"
    shift 2

    # オプション引数解析
    while [[ $# -gt 0 ]]; do
        case $1 in
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
            *)
                echo "❌ 不明なオプション: $1" >&2
                show_usage >&2
                exit 1
                ;;
        esac
    done

    # ディレクトリの存在確認
    if [[ ! -d "$commands_dir" ]]; then
        echo "❌ コマンドディレクトリが見つかりません: $commands_dir" >&2
        exit 1
    fi

    # エージェントディレクトリは存在しなければ作成
    if [[ ! -d "$agents_dir" ]]; then
        mkdir -p "$agents_dir"
    fi

    echo "🔍 スラッシュコマンド→エージェント変換を開始"
    echo "   📂 対象: $commands_dir"
    echo "   📁 出力先: $agents_dir"
    echo "   📄 テンプレート: $template_file"

    if [[ "$dry_run" == true ]]; then
        echo "   🏃 モード: ドライラン（実際の変換は行いません）"
    fi

    echo ""

    # コマンドファイルを直接検索
    echo "🔍 コマンドを検索中..."
    local command_files=()
    while IFS= read -r -d '' file; do
        command_files+=("$file")
    done < <(find "$commands_dir" -name "*.md" -type f -print0 | sort -z)

    if [[ ${#command_files[@]} -eq 0 ]]; then
        echo "❌ $commands_dir にコマンドが見つかりません"
        exit 1
    fi

    COMMAND_FILES=("${command_files[@]}")

    # コマンド名を抽出
    extract_command_names

    # 検索結果を表示
    echo ""
    echo "📂 見つかったコマンド:"
    echo ""

    for i in "${!COMMAND_NAMES[@]}"; do
        local command_name="${COMMAND_NAMES[$i]}"
        printf "   %2d. %-20s\n" "$((i+1))" "$command_name"
    done

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

    # commands_dirのディレクトリ名を取得（例: kiro）
    local commands_dirname="$(basename "$commands_dir")"

    for file in "${COMMAND_FILES[@]}"; do
        # commands_dir からの相対パスを取得（末尾のスラッシュを確実に追加）
        local commands_dir_with_slash="${commands_dir%/}/"
        local relative_path="${file#$commands_dir_with_slash}"
        local relative_dir="$(dirname "$relative_path")"

        # agents_dir配下にcommands_dirnameのディレクトリを作成し、その中に配置
        local target_dir="$agents_dir/$commands_dirname"
        if [[ "$relative_dir" != "." ]]; then
            target_dir="$agents_dir/$commands_dirname/$relative_dir"
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
    echo "   📁 出力先: $agents_dir"

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
