# create-workflow コマンド仕様書 (Draft)

## 概要

Claude Codeのカスタムスラッシュコマンド`/create-workflow`を作成する。このコマンドは、指定されたエージェントディレクトリから新しいワークフローコマンドを自動生成する。

## 目的

- テンプレートベースでワークフローコマンドを自動生成
- エージェントディレクトリの構造を解析し、適切なワークフロー定義を作成
- 手動でのコマンド作成作業を自動化

## カスタムワークフロー作成方法

### 前提条件
- `templates/workflow.md`: Claude Codeスラッシュコマンドのテンプレート
- `templates/workflow.poml`: POML形式のワークフロー定義テンプレート
- `/.claude/agents/<category>/`: 実行したいエージェントが格納されたディレクトリ

### 作成手順
1. **エージェント準備**: `/.claude/agents/<category>/`にエージェント（`.md`ファイル）を配置
2. **コマンド実行**: `/create-workflow <category>`を実行
3. **順序決定**: 対話形式でエージェントの実行順序を選択
4. **確認**: 生成される`/<category>-workflow`コマンドの動作確認

### テンプレート変数の自動置換
コマンド実行時に以下の変数が自動的に置換される：

#### workflow.mdテンプレート
- `{DESCRIPTION}` → `"Execute <category> workflow"`
- `{ARGUMENT_HINT}` → `"[type] [context]"`
- `{WORKFLOW_NAME}` → `"<category>-workflow"`
- `{WORKFLOW_TYPE}` → `"implementation"`（デフォルト例）

#### workflow.pomlテンプレート  
- `{WORKFLOW_NAME}` → `"<category>-workflow"`
- `{WORKFLOW_AGENT_LIST}` → 選択されたエージェントリスト（カンマ区切り配列形式）
- `{WORKFLOW_TYPE_DEFINITIONS}` → （現状不要のため空文字で置換）
- `{WORKFLOW_SPECIFIC_INSTRUCTIONS}` → カテゴリ固有の指示

### 例：testワークフローの作成
```bash
# 1. テストエージェントをディレクトリに配置
/.claude/agents/test/
├── test-setup.md
├── test-unit.md  
├── test-integration.md
└── test-report.md

# 2. ワークフロー作成コマンド実行
/create-workflow test

# 3. 対話形式で順序選択
Enter execution order: 1 2 3 4

# 4. 生成されたコマンドを使用
/test-workflow implementation "API testing suite"
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

## 処理フロー

1. **入力検証**
   - 引数の妥当性チェック
   - 指定されたエージェントディレクトリの存在確認

2. **エージェント解析**
   - `/.claude/agents/<directory>/`内のエージェントファイル（`.md`）を検索
   - エージェント名のリスト作成
   - 発見されたエージェントの一覧表示

3. **対話的順序決定**
   - ユーザーに対してエージェントの実行順序を対話形式で決定
   - エージェントリストの表示と番号選択
   - 選択されたエージェントの順序確認
   - 最終的な実行順序の確定

4. **テンプレート処理**
   - `templates/workflow.md`の読み込み
   - `templates/workflow.poml`の読み込み
   - テンプレート変数の置換処理（確定した順序を含む）

5. **ファイル生成**
   - `/.claude/commands/<directory>-workflow.md`の生成
   - 対応するPOMLファイルがあれば生成

## テンプレート変数置換

### workflow.mdテンプレートで置換する変数
- `{DESCRIPTION}`: ワークフローの説明文
- `{ARGUMENT_HINT}`: 引数のヒント
- `{WORKFLOW_NAME}`: ワークフロー名（例: `spec-workflow`）
- `{WORKFLOW_TYPE}`: ワークフロータイプの例

### workflow.pomlテンプレートで置換する変数
- `{WORKFLOW_NAME}`: ワークフロー名
- `{WORKFLOW_AGENT_LIST}`: エージェントリスト
- `{WORKFLOW_TYPE_DEFINITIONS}`: ワークフロータイプ定義
- `{WORKFLOW_SPECIFIC_INSTRUCTIONS}`: ワークフロー固有の指示

## 対話形式仕様

### エージェント一覧表示
```
Found agents in 'spec' directory:
1. spec-init
2. spec-requirements  
3. spec-design
4. spec-tasks
5. spec-impl
6. spec-status
7. steering
8. steering-custom

Please select the execution order by entering numbers separated by spaces.
Example: 1 2 3 5 (to execute spec-init, spec-requirements, spec-design, spec-impl)
```

### 順序選択プロンプト
```
Enter execution order: 
```

### 選択確認
```
Selected execution order:
1. spec-init
2. spec-requirements
3. spec-design
4. spec-impl

Is this correct? (y/n): 
```

### 修正対応
- `n`選択時: 順序選択に戻る
- `y`選択時: ファイル生成に進む

## 出力仕様

### 生成されるファイル
1. `/.claude/commands/<directory>-workflow.md`
   - Claude Codeスラッシュコマンド定義
   - 引数解析ロジック
   - 確定した順序でのエージェント実行ロジック

2. `/.claude/commands/poml/<directory>-workflow.poml`
   - POML形式のワークフロー定義
   - エージェント実行順序とロジック

### 出力例
```bash
✅ Created workflow command: /spec-workflow
📁 Generated files:
   - /.claude/commands/spec-workflow.md
   - /.claude/commands/poml/spec-workflow.poml

Agent execution order: spec-init → spec-requirements → spec-design → spec-impl

Usage: /spec-workflow <type> "<context>"
```

## エラーハンドリング

### 想定されるエラー
1. **引数不足**: `Error: Agent directory name required`
2. **ディレクトリ不存在**: `Error: Agent directory '...' not found`
3. **エージェントなし**: `Error: No agents found in directory '...'`
4. **テンプレート不存在**: `Error: Template file not found`
5. **ファイル書き込み権限**: `Error: Cannot write to commands directory`
6. **無効な順序入力**: `Error: Invalid agent number '...'`
7. **重複選択**: `Error: Agent '...' selected multiple times`
8. **空の順序選択**: `Error: No agents selected for execution`

## 実装仕様詳細

### エージェント名の取得
- **命名規則**: ファイル名 = エージェント名
- **例**: `spec-init.md` → エージェント名は `spec-init`
- **拡張子除去**: `.md`拡張子を取り除いてエージェント名とする

### POMLファイル参照方法
- **参照パス**: 生成されたworkflow.mdから相対パスで参照
- **例**: `npx pomljs --file "poml/<category>-workflow.poml"`

### エージェントリスト形式
- **POML配列形式**: カンマ区切りの配列として置換
- **例**: `["spec-init", "spec-requirements", "spec-design"]`

### エラー処理方針
- **最低限の処理**: エラー発生時は処理を中断
- **エラー出力**: エラー理由を明確に表示
- **例**: `Error: Cannot create poml directory: Permission denied`

## 実装技術要件

### 必要なツール
- `Read`: テンプレートファイル読み込み
- `Write`: 新しいコマンドファイル作成
- `Bash`: ディレクトリ検索、ファイル操作
- `Glob`: エージェントファイル検索

### 依存関係
- テンプレートファイルの存在（`templates/workflow.md`, `templates/workflow.poml`）
- `/.claude/agents/`ディレクトリ構造
- `/.claude/commands/`ディレクトリ（書き込み権限）
- `/.claude/commands/poml/`ディレクトリ（POMLファイル配置用、自動作成）

## 拡張仕様（将来対応）

### 設定ファイル対応
- エージェント実行順序のカスタマイズ
- ワークフロータイプ定義のカスタマイズ
- テンプレート選択

### 対話的モード
- エージェント選択UI
- カスタム変数入力
- プレビュー機能

## テスト要件

### 基本テストケース
1. 正常系：`spec`ディレクトリでのコマンド生成
2. 異常系：存在しないディレクトリ指定
3. 境界値：空のディレクトリ指定
4. ファイル上書き確認

### 検証項目
- 生成されたコマンドの構文正確性
- テンプレート変数の正しい置換
- エージェントリストの正確性
- 実行可能性の確認