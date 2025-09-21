# create-workflow.sh スクリプト仕様書

## 概要

指定されたエージェントディレクトリから新しいワークフローコマンド（Claude Code のスラッシュコマンド .md）を自動生成するシェルスクリプトの仕様です。TUI（`npx @hiraoku/cc-flow-cli`）からも本スクリプトが呼び出されます。

## 目的

- テンプレートベースでワークフローコマンドを自動生成
- エージェントディレクトリの構造を解析し、適切なワークフロー定義を作成
- 手動でのコマンド作成作業を自動化

## 使用方法

### 前提条件
- `templates/workflow.md`: Claude Codeスラッシュコマンドのテンプレート
- `templates/workflow.poml`: POML形式のワークフロー定義テンプレート
- `.claude/agents/<category>/`: エージェント（`.md`ファイル）が格納されたディレクトリ

### 基本的な使用手順
```bash
# 1. エージェント準備（例: specディレクトリ）
.claude/agents/spec/
├── spec-init.md
├── spec-requirements.md
├── spec-design.md
└── spec-impl.md

# 2. ワークフローコマンド生成（推奨の新形式: 相対パス指定）
scripts/create-workflow.sh ./agents/spec "1 3 4"

# 旧形式（短縮形）は後方互換のために動作しますが警告付き（非推奨）
scripts/create-workflow.sh spec "1 3 4"

# 3. 生成されたコマンドを使用
/spec-workflow "Todoアプリを作成して"
```

## 入力仕様

### コマンド構文
```bash
scripts/create-workflow.sh <target_path> [order_spec]
```

### 引数
- `<target_path>`: 対象パス（新形式）
  - `./agents/<dir>`（例: `./agents/spec`）
  - `./agents`（全エージェント横断）
  - 短縮形 `<dir>` は後方互換のために受け付けますが、非推奨です（警告が出ます）。
- `[order_spec]`: 実行順序指定（省略時は対話モード）
  - 数値インデックス（スペース区切り）例: `"1 3 4"`
  - アイテム名（カンマ区切り）例: `"spec-init,spec-requirements,spec-design"`
  
備考: 現時点ではカスタムのワークフロー名引数は未対応です（既定の `<dir>-workflow`／`all-workflow` が使用されます）。

### モード
- インタラクティブ: `order_spec` を省略すると対話的に番号入力で順序を決定します。
- 非インタラクティブ: `order_spec` を与えると検証後にその順序で生成します。

## テンプレート変数置換

### workflow.mdテンプレート
- `{DESCRIPTION}` → `"Execute <category> workflow"`
- `{ARGUMENT_HINT}` → `"[context]"`
- `{WORKFLOW_NAME}` → `"<category>-workflow"`

### workflow.pomlテンプレート（中間ファイル）
- `{WORKFLOW_NAME}` → `"<category>-workflow"`
- `{WORKFLOW_AGENT_ARRAY}` → 選択されたエージェントリスト（JSON配列形式）
- その他の変数は現状空文字で置換

備考: POML ファイルは中間生成のみ行い、最終的に削除します（既定フローでは `pomljs` は起動しません）。

## 出力仕様

### ファイル生成プロセス
1. **中間ファイル生成**:
   - `.claude/commands/poml/<category>-workflow.poml`（一時ファイル）

2. **最終ファイル出力**:
   - `.claude/commands/<category>-workflow.md`（Claude Code スラッシュコマンド定義）

3. **クリーンアップ**:
   - 中間の `.poml` は削除されます（空の `poml` ディレクトリも削除）。

### 成功時の出力メッセージ（例）
```bash
✅ ワークフローコマンドを作成しました: /spec-workflow
📁 生成されたファイル:
   - .claude/commands/spec-workflow.md

エージェント実行順序: spec-init → spec-requirements → spec-design → spec-impl

使用方法: /spec-workflow "<context>"
```

## エラーハンドリング

### 想定されるエラー
1. **引数不足**: `エラー: エージェントディレクトリ名が必要です`
2. **ディレクトリ不存在**: `エラー: エージェントディレクトリ '...' が見つかりません`
3. **エージェントなし**: `エラー: ディレクトリ '...' にエージェントが見つかりません`
4. **テンプレート不存在**: `エラー: テンプレートファイルが見つかりません`
5. **ファイル書き込み権限**: `エラー: コマンドディレクトリに書き込みできません`
6. **無効な順序入力**: `エラー: 無効なエージェント番号 '...'`
7. **重複選択**: `エラー: エージェント '...' が重複して選択されています`
8. **空の順序選択**: `エラー: 実行するエージェントが選択されていません`
9. **POML処理失敗**: `エラー: pomljsの実行に失敗しました`
10. **Node.js/npm不存在**: `エラー: Node.jsまたはnpmが見つかりません`

## 技術仕様

### スクリプト構造
```
scripts/
├── create-workflow.sh          # メインスクリプト
├── lib/
│   ├── agent-discovery.sh      # エージェント検索
│   ├── template-processor.sh   # テンプレート処理
│   ├── user-interaction.sh     # 対話処理
│   └── poml-processor.sh       # POML実行処理
└── utils/
    └── common.sh               # 共通関数
```

### 依存関係
- `templates/workflow.md`, `templates/workflow.poml`
- `.claude/agents/` ディレクトリ構造
- `.claude/commands/` ディレクトリ（書き込み権限）
- 備考: 既定フローでは `pomljs` は不要です（POML は一時生成して削除）。

### エージェント名抽出規則
- ファイル名から `.md` 拡張子を除去してエージェント名とする
- 例：`spec-init.md` → `spec-init`

### 備考（将来拡張）
- `poml-processor.sh` により POML→MD 変換を行う経路も用意されていますが、現状の `create-workflow.sh` デフォルトフローでは使用しません。
