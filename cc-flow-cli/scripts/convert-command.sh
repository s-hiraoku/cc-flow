#!/bin/bash

# スラッシュコマンド→エージェント変換実行スクリプト（シンプル版）
# Usage: ./scripts/convert-command.sh <source_file> <target_directory> [template_file]

# パラメータを取得
SOURCE_FILE="$1"
TARGET_DIRECTORY="$2"
TEMPLATE_FILE="${3:-templates/agent-template.md}"

# 引数チェック
if [ -z "$SOURCE_FILE" ] || [ -z "$TARGET_DIRECTORY" ]; then
    echo "Usage: $0 <source_file> <target_directory> [template_file]"
    exit 1
fi

# ファイル存在チェック
if [ ! -f "$SOURCE_FILE" ]; then
    echo "❌ エラー: ソースファイルが見つかりません: $SOURCE_FILE"
    exit 1
fi

if [ ! -f "$TEMPLATE_FILE" ]; then
    echo "❌ エラー: テンプレートファイルが見つかりません: $TEMPLATE_FILE"
    exit 1
fi

# ターゲットディレクトリを作成
mkdir -p "$TARGET_DIRECTORY"

# コマンド名を抽出
COMMAND_NAME=$(basename "$SOURCE_FILE" .md)
TARGET_FILE="$TARGET_DIRECTORY/$COMMAND_NAME.md"

echo "🔄 変換中: $SOURCE_FILE → $TARGET_FILE"

# 互換性チェック
WARNINGS=""

# Bashコードブロックの存在チェック
if grep -q '```bash' "$SOURCE_FILE"; then
    WARNINGS="$WARNINGS\n⚠️  このコマンドにはbashコードが含まれています。エージェントでは直接実行できません。"
fi

# 引数処理のチェック
if grep -q '\$[0-9]' "$SOURCE_FILE"; then
    WARNINGS="$WARNINGS\n⚠️  このコマンドは引数(\$1, \$2等)を使用しています。エージェントでは異なる引数処理が必要です。"
fi

# exit文のチェック
if grep -q 'exit [0-9]' "$SOURCE_FILE"; then
    WARNINGS="$WARNINGS\n⚠️  このコマンドはexit文を使用しています。エージェントでは適切なエラーハンドリングに変更が必要です。"
fi

if [ -n "$WARNINGS" ]; then
    echo "⚠️  変換警告:"
    echo -e "$WARNINGS"
fi

# シンプルな変換：メタデータを抽出してテンプレートに適用
# YAMLフロントマターから情報を抽出
DESCRIPTION=$(sed -n '/^---$/,/^---$/p' "$SOURCE_FILE" | grep '^description:' | sed 's/^description: *//' | tr -d '"')
TOOLS=$(sed -n '/^---$/,/^---$/p' "$SOURCE_FILE" | grep '^allowed-tools:' | sed 's/^allowed-tools: *//')

# デフォルト値を設定
if [ -z "$DESCRIPTION" ]; then
    DESCRIPTION="Converted from slash command: $COMMAND_NAME"
fi

if [ -z "$TOOLS" ]; then
    TOOLS="[Read, Write, Bash]"
fi

# Markdownコンテンツを抽出（フロントマター以降）
CONTENT=$(sed -n '/^---$/,/^---$/!p' "$SOURCE_FILE" | sed '/^---$/,$!d' | sed '1d')

# 変換日時
CONVERSION_DATE=$(date '+%Y-%m-%d %H:%M:%S')

# テンプレートをコピーして変数を置換
cp "$TEMPLATE_FILE" "$TARGET_FILE"

# テンプレート変数を置換（macOS/Linux互換）
if command -v sed >/dev/null 2>&1; then
    # sedでプレースホルダーを置換（スペース付きプレースホルダー）
    sed -i.bak "s|{ AGENT_NAME }|$COMMAND_NAME|g" "$TARGET_FILE"
    sed -i.bak "s|{ AGENT_DESCRIPTION }|$DESCRIPTION|g" "$TARGET_FILE"
    sed -i.bak "s|{ AGENT_MODEL }|sonnet|g" "$TARGET_FILE"
    sed -i.bak "s|{ AGENT_TOOLS }|$TOOLS|g" "$TARGET_FILE"
    sed -i.bak "s|{ AGENT_COLOR }|blue|g" "$TARGET_FILE"
    sed -i.bak "s|{AGENT_NAME}|$COMMAND_NAME|g" "$TARGET_FILE"
    sed -i.bak "s|{AGENT_CONTENT}|$(echo "$CONTENT" | sed 's/|/\\|/g')|g" "$TARGET_FILE"
    sed -i.bak "s|{SOURCE_PATH}|$SOURCE_FILE|g" "$TARGET_FILE"
    sed -i.bak "s|{CONVERSION_DATE}|$CONVERSION_DATE|g" "$TARGET_FILE"
    
    # バックアップファイルを削除
    rm -f "$TARGET_FILE.bak"
fi

echo "✅ 変換完了: $TARGET_FILE"