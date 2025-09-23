# ワークフロー作成スクリプト仕様書

## 📖 概要

**create-workflow.sh** は、Claude Code のカスタムスラッシュコマンドを自動生成するスクリプトです。JSON設定ファイルを使って、複数のエージェントを組み合わせた強力なワークフローコマンドを作成できます。

## 🚀 クイックスタート

### 1. 設定ファイルを作成

```bash
cat > workflow-config.json <<'JSON'
{
  "workflowName": "api-review",
  "workflowPurpose": "API設計レビューワークフロー",
  "workflowModel": "claude-3-5-haiku-20241022",
  "workflowArgumentHint": "<api-spec-url>",
  "workflowSteps": [
    {
      "title": "設計分析",
      "mode": "sequential",
      "agents": ["api-analyzer", "spec-validator"]
    },
    {
      "title": "品質チェック", 
      "mode": "parallel",
      "agents": ["security-checker", "performance-reviewer"]
    }
  ]
}
JSON
```

### 2. ワークフローを生成

```bash
scripts/create-workflow.sh ./agents/api --steps-json workflow-config.json
```

### 3. ワークフローを実行

```bash
/api-review "https://api.example.com/spec.yaml"
```

## ⚙️ コマンド仕様

### 基本構文

```bash
scripts/create-workflow.sh <target_path> --steps-json <config_file>
```

### 引数

- **`<target_path>`**: エージェントディレクトリのパス
  - `./agents/spec` - 特定カテゴリのエージェント
  - `./agents` - 全エージェント
  - `../.claude/agents/demo` - 相対パス指定も可能

- **`--steps-json <config_file>`**: ワークフロー設定JSONファイル

## 📝 設定ファイル形式

### ワークフロー全体設定

| フィールド | 型 | デフォルト | 説明 |
|-----------|----|-----------|----|
| `workflowName` | string | `<category>-workflow` | スラッシュコマンド名 |
| `workflowPurpose` | string | `Execute <category> workflow` | ワークフローの説明 |
| `workflowModel` | string | 省略 | Claudeモデル指定 |
| `workflowArgumentHint` | string | `[content]` | 引数のヒント |

### ステップ設定（必須）

```json
{
  "workflowSteps": [
    {
      "title": "ステップ名",                    // ステップの表示名
      "mode": "sequential" | "parallel",      // 実行モード
      "agents": ["agent1", "agent2"],        // 実行するエージェント（必須）
      "purpose": "ステップの説明"              // ステップの目的（省略可）
    }
  ]
}
```

#### ステップ設定の詳細

- **`title`**: ステップの表示名
- **`mode`**: 実行モード
  - `"sequential"`: エージェントを順次実行
  - `"parallel"`: エージェントを並列実行
- **`agents`**: 実行するエージェント名の配列（必須）
- **`purpose`**: ステップの説明（省略可、指定すると出力に含まれる）

### 設定ファイルの例

```json
{
  "workflowName": "code-review",
  "workflowPurpose": "コードレビューワークフロー",
  "workflowModel": "claude-3-5-sonnet-20241022",
  "workflowArgumentHint": "<pull-request-url>",
  "workflowSteps": [
    {
      "title": "静的解析",
      "mode": "parallel",
      "purpose": "コード品質とセキュリティの並列チェック",
      "agents": ["lint-checker", "security-scanner"]
    },
    {
      "title": "レビュー",
      "mode": "sequential",
      "purpose": "順次レビューとフィードバック",
      "agents": ["code-reviewer", "feedback-generator"]
    }
  ]
}
```

## 📤 出力結果

### 生成される frontmatter

上記設定から生成される `.claude/commands/code-review.md`:

```yaml
---
description: コードレビューワークフロー
argument-hint: <pull-request-url>
allowed-tools: [Read, Bash]
model: claude-3-5-sonnet-20241022
---
```

### 実行フロー

1. **設定解析**: JSONファイルから各フィールドを抽出
2. **テンプレート処理**: POML テンプレートでワークフロー生成
3. **ファイル出力**: `.claude/commands/<workflow-name>.md` に出力
4. **クリーンアップ**: 一時ファイルを削除

## 🔧 前提条件

### 必要なファイル

- `templates/workflow.md` - Claude Code スラッシュコマンドテンプレート
- `templates/workflow.poml` - POML ワークフロー定義テンプレート
- `.claude/agents/<category>/` - エージェントファイル（`.md`）

### 実行環境

- Node.js 18以上
- npm（pomljs パッケージ用）
- `.claude/commands/` ディレクトリ（書き込み権限）

## ❌ エラーハンドリング

### 一般的なエラー

| エラー | 原因 | 解決方法 |
|--------|------|----------|
| `ステップ定義の読み込みに失敗` | JSON構文エラー | JSON形式を確認 |
| `エージェントが見つかりません` | 存在しないエージェント指定 | エージェント名を確認 |
| `テンプレートファイルが見つかりません` | テンプレート不存在 | `templates/` ディレクトリを確認 |
| `Node.jsが見つかりません` | Node.js未インストール | Node.js をインストール |

### デバッグ方法

```bash
# 詳細ログ有効化
VERBOSE=1 scripts/create-workflow.sh ./agents/spec --steps-json config.json

# JSON設定の検証
node -e "console.log(JSON.parse(require('fs').readFileSync('config.json')))"
```

## 🏗️ 技術仕様

### スクリプト構造

```
scripts/
├── create-workflow.sh          # メインスクリプト
├── lib/
│   ├── agent-discovery.sh      # エージェント検索
│   ├── template-processor.sh   # テンプレート処理
│   └── poml-processor.sh       # POML処理
└── utils/
    └── common.sh               # 共通関数
```

### 処理の流れ

1. JSON設定ファイルを Node.js でパース
2. エージェントディレクトリをスキャン
3. POML テンプレートに設定を注入
4. `pomljs` でMarkdown生成
5. frontmatter プレースホルダーを置換
6. 最終ファイルを `.claude/commands/` に出力