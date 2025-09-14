# create-workflow コマンド仕様書

## 概要

Claude Codeのカスタムスラッシュコマンド`/create-workflow`の仕様。指定されたエージェントディレクトリから新しいワークフローコマンドを自動生成する。

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

# 2. ワークフローコマンド生成
/create-workflow spec

# 3. 生成されたコマンドを使用
/spec-workflow "Todoアプリを作成して"
```

## 入力仕様

### コマンド構文
```bash
/create-workflow <agent-directory-name> [options]
```

### 引数
- `<agent-directory-name>`: `/.claude/agents/`配下のディレクトリ名（例: `spec`, `test`, `deploy`）

### オプション（将来拡張用）
- `--output-dir`: 生成先ディレクトリ（デフォルト: `/.claude/commands/`）
- `--template`: 使用するテンプレート（デフォルト: `templates/workflow.md`）

## テンプレート変数置換

### workflow.mdテンプレート
- `{DESCRIPTION}` → `"Execute <category> workflow"`
- `{ARGUMENT_HINT}` → `"[context]"`
- `{WORKFLOW_NAME}` → `"<category>-workflow"`

### workflow.pomlテンプレート
- `{WORKFLOW_NAME}` → `"<category>-workflow"`
- `{WORKFLOW_AGENT_LIST}` → 選択されたエージェントリスト（JSON配列形式）
- その他の変数は現状空文字で置換

## 出力仕様

### ファイル生成プロセス
1. **中間ファイル生成**:
   - `.claude/commands/poml/<category>-workflow.poml` - POML形式のワークフロー定義（中間ファイル）
   - テンプレートベースの`.md`ファイル（中間ファイル）

2. **POML処理実行**:
   - `npx pomljs`を使用してPOMLファイルを処理
   - コンテキスト変数を注入してマークダウン出力を生成

3. **最終ファイル出力**:
   - `.claude/commands/<category>-workflow.md` - pomljsで生成された最終的なClaude Codeスラッシュコマンド定義

### 成功時の出力メッセージ
```bash
✅ ワークフローコマンドを作成しました: /spec-workflow
📁 生成されたファイル:
   - .claude/commands/spec-workflow.md (pomljsで生成)
   - .claude/commands/poml/spec-workflow.poml (中間ファイル)

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
- Node.js環境とnpmパッケージ`pomljs`
- `npx pomljs`コマンドの実行可能性

### エージェント名抽出規則
- ファイル名から `.md` 拡張子を除去してエージェント名とする
- 例：`spec-init.md` → `spec-init`

### POML処理仕様
- **実行コマンド**: `npx pomljs --file <poml-file> --context <context-vars>`
- **入力**: 中間生成されたPOMLファイル
- **出力**: 最終的なマークダウンファイル（Claude Codeスラッシュコマンド定義）
- **コンテキスト変数**: 動的に生成されたエージェントリストやワークフロー名を注入
- **エラー処理**: pomljsの実行失敗時は適切なエラーメッセージを表示して終了