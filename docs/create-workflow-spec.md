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
# 1. ワークフロー定義 JSON を用意
cat > ./tmp/spec-workflow.json <<'JSON'
{
  "workflowName": "spec-workflow",
  "workflowPurpose": "Design review workflow",
  "workflowSteps": [
    {
      "title": "Planning",
      "mode": "sequential",
      "purpose": "Collect requirements",
      "agents": ["spec-init"]
    },
    {
      "title": "Delivery",
      "mode": "parallel",
      "purpose": "Draft solution and validate",
      "agents": ["spec-design", "spec-impl"]
    }
  ]
}
JSON

# 2. JSON ファイルを指定して生成
scripts/create-workflow.sh ./agents/spec \
  --steps-json ./tmp/spec-workflow.json

# 3. 生成されたコマンドを使用
/spec-workflow "要件整理から実装まで"
```

## 入力仕様

### コマンド構文
```bash
scripts/create-workflow.sh <target_path> --steps-json <path>
```

### 主なオプション

| オプション | 説明 |
| --- | --- |
| `--steps-json <path>` | ワークフローステップ定義ファイル。トップレベル配列、`{ "workflowSteps": [...] }`、`{ "WORKFLOW_STEPS_JSON": [...] }` の各形式をサポート。オブジェクトに `workflowName` / `workflowPurpose` が含まれている場合は、未指定時のデフォルト値として利用される |
### 引数
- `<target_path>`: 対象パス
  - `./agents/<dir>`（例: `./agents/spec`）
  - `./agents`（全エージェント横断）
  - 相対パス `../.claude/agents/...` なども指定可能
  

### モード
- ステップ定義モードのみ: `--steps-json` で指定した JSON ファイルから `{ title, mode, agents[], purpose? }` を読み込み、テンプレートへ注入する。`mode` は `sequential` または `parallel` を想定。

## テンプレート変数置換

### workflow.mdテンプレート
- `{DESCRIPTION}` → `"Execute <category> workflow"`
- `{ARGUMENT_HINT}` → `"[context]"`
- `{WORKFLOW_NAME}` → `"<category>-workflow"`

-### workflow.pomlテンプレート
- `workflowName` / `workflowPurpose` / `workflowSteps` / `workflowAgents` は `pomljs --context-file` で注入され、`partials/*.poml` から参照される。
- `workflowSteps` は `{ title, mode, agents[], purpose? }` の配列。`purpose` は任意だが、指定すると各ステップの説明として出力される。`mode` に応じてシーケンシャル／パラレルの文言が切り替わる。
- `workflowAgents` は一次元配列。`workflowSteps` が空の場合のフォールバックとして利用。

備考: `pomljs` の実行結果を Markdown として `.claude/commands/<workflow_name>.md` へ書き出し、テンポラリの `.poml` と `context.json` は後処理で削除される。

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
6. **POML処理失敗**: `エラー: pomljsの実行に失敗しました`
7. **Node.js/npm不存在**: `エラー: Node.jsまたはnpmが見つかりません`
8. **ステップ定義不正**: `エラー: ステップ定義にエージェントが含まれていません` / `エラー: ステップ定義の読み込みに失敗しました`

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
- `templates/workflow.md`, `templates/workflow.poml`, `templates/partials/*.poml`
- `.claude/agents/` ディレクトリ構造（エージェントの `.md` ファイル）
- `.claude/commands/` ディレクトリ（書き込み権限）
- Node.js 18 以上 / npm
- `pomljs`（`npm install` によりローカル解決できること。ネットワークアクセスが無い環境では事前インストール必須）

### エージェント名抽出規則
- ファイル名から `.md` 拡張子を除去してエージェント名とする
- 例：`spec-init.md` → `spec-init`

### 備考（将来拡張）
- `poml-processor.sh` により POML→MD 変換を行う経路も用意されていますが、現状の `create-workflow.sh` デフォルトフローでは使用しません。
