---
description: エージェントディレクトリからワークフローコマンドを生成
argument-hint: <エージェントディレクトリ>
allowed-tools: [Bash]
---

# create-workflow

既存のエージェントディレクトリから新しいワークフローコマンドを生成します。

## 使用方法

```bash
/create-workflow <エージェントディレクトリ>
```

エージェントを順次実行するワークフローコマンドを作成します。

## 実行

```bash
# 引数を取得
ARGUMENTS="$*"

# スクリプトを実行
./scripts/create-workflow.sh "$ARGUMENTS"
```