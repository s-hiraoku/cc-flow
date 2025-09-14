#!/bin/bash

# 共通ユーティリティ関数

# エラーメッセージを表示して終了
error_exit() {
    echo "❌ エラー: $1" >&2
    exit 1
}

# 成功メッセージを表示
success() {
    echo "✅ $1"
}

# 情報メッセージを表示
info() {
    echo "🔍 $1"
}

# 警告メッセージを表示
warn() {
    echo "⚠️  $1"
}

# プログレスメッセージを表示
progress() {
    echo "⏳ $1"
}

# ディレクトリの存在確認
check_directory() {
    local dir="$1"
    local description="$2"
    
    if [[ ! -d "$dir" ]]; then
        error_exit "$description '$dir' が見つかりません"
    fi
}

# ファイルの存在確認
check_file() {
    local file="$1"
    local description="$2"
    
    if [[ ! -f "$file" ]]; then
        error_exit "$description '$file' が見つかりません"
    fi
}

# 引数の検証
validate_args() {
    local arg="$1"
    local description="$2"
    
    # 空文字列または空白文字のみの場合はエラー
    if [[ -z "$arg" || "$arg" =~ ^[[:space:]]*$ ]]; then
        error_exit "$description が必要です"
    fi
}

# 配列に要素が含まれているかチェック
array_contains() {
    local element="$1"
    shift
    local array=("$@")
    
    for item in "${array[@]}"; do
        if [[ "$item" == "$element" ]]; then
            return 0
        fi
    done
    return 1
}

# ディレクトリを安全に作成
safe_mkdir() {
    local dir="$1"
    
    if ! mkdir -p "$dir" 2>/dev/null; then
        error_exit "ディレクトリ '$dir' を作成できません: 権限が拒否されました"
    fi
}

# ファイルを安全に作成
safe_write_file() {
    local file="$1"
    local content="$2"
    local parent_dir
    
    # 親ディレクトリを作成
    parent_dir=$(dirname "$file")
    safe_mkdir "$parent_dir"
    
    if ! echo "$content" > "$file" 2>/dev/null; then
        error_exit "ファイル '$file' を書き込めません"
    fi
}