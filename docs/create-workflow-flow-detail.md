# create-workflow コマンド実行フロー詳細

## 全体フロー概要

`scripts/create-workflow.sh <target_path> [order_spec]` 実行時の処理フローを段階的に説明。

```mermaid
flowchart TD
    A["スクリプト実行<br/>scripts/create-workflow.sh &lt;target_path&gt;"] --> B["引数解析・初期化"]
    B --> C{"エージェントディレクトリ<br/>存在チェック"}
    C -->|No| D["エラー: ディレクトリ不存在"]
    C -->|Yes| E["エージェントファイル検索<br/>.claude/agents/&lt;category&gt;/*.md"]
    E --> F{"エージェントファイル<br/>存在チェック"}
    F -->|No| G["エラー: エージェントなし"]
    F -->|Yes| H["エージェント一覧表示"]
    
    H --> I["実行順序入力（対話/非対話）"]
    I --> J["ユーザー入力受付"]
    J --> K{"入力値検証"}
    K -->|Invalid| L["エラー表示"]
    L --> I
    K -->|Valid| M["選択確認表示"]
    
    M --> N["確認プロンプト y/n"]
    N --> O{"ユーザー確認"}
    O -->|No| I
    O -->|Yes| P["テンプレートファイル読み込み"]
    
    P --> Q{"テンプレートファイル<br/>存在チェック (md/poml)"}
    Q -->|No| R["エラー: テンプレート不存在"]
    Q -->|Yes| S["変数置換処理"]
    
    S --> T["出力ディレクトリ作成"]
    T --> U{"書き込み権限チェック"}
    U -->|No| V["エラー: 書き込み権限なし"]
    U -->|Yes| W["&lt;category&gt;-workflow.md生成（最終）"]
    
    W --> X["&lt;category&gt;-workflow.poml生成（中間）"]
    X --> Y["中間POMLのクリーンアップ"]
    Y --> Z["成功メッセージ表示"]
    Z --> AA["完了<br/>コマンド利用可能"]
```

## 実行段階

### 1. 初期化
- `scripts/create-workflow.sh` 実行開始
- `target_path` を解析（例: `./agents/spec`、`./agents`、短縮形 `spec` は非推奨）
- 必要なライブラリモジュール読み込み

### 2. エージェント検索・表示
- `.claude/agents/spec/` 内の `.md` ファイルを検索
- エージェント名抽出（ファイル名から `.md` 除去）
- エージェント一覧を番号付きで表示

### 3. 順序指定（対話/非対話）
- 非対話: 数値インデックス（スペース区切り）またはアイテム名（カンマ区切り）を受理
  - 例（インデックス）: `"1 3 4 6 2"`
  - 例（アイテム名）: `"spec-init,spec-requirements,spec-design"`
- 対話: 入力プロンプトで番号を受け付け、検証→確認

### 4. テンプレート処理・ファイル生成
- テンプレートファイル読み込み（`.md`, `.poml`）
- 変数置換処理実行
- 出力ディレクトリ作成
- `.claude/commands/<category>-workflow.md` を生成（最終ファイル）
- `.claude/commands/poml/<category>-workflow.poml` を生成後にクリーンアップ（削除）
- 成功メッセージ表示

## 生成ファイル例

### spec-workflow.md（概要）
- Claude Codeスラッシュコマンド定義（最終ファイル）
- Bash セクションで `claude subagent` を順次実行
- 引数は全て `context` として処理

### spec-workflow.poml（中間）  
- 変数置換後に一時生成され、最終的に削除

## 主要なエラーハンドリング

- **引数不足**: 使用方法表示後終了
- **ディレクトリ不存在**: エラーメッセージ表示後終了  
- **エージェントファイルなし**: "エージェントが見つかりません" エラー
- **無効な順序入力**: 再入力要求
- **テンプレートファイル不存在**: エラーメッセージ表示後終了
- **書き込み権限エラー**: 権限エラーメッセージ表示

## モジュール構成

### 主要ライブラリ
- `agent-discovery.sh`: エージェント検索・表示
- `user-interaction.sh`: 対話処理・入力検証
- `template-processor.sh`: テンプレート処理・ファイル生成
- `common.sh`: 共通関数・エラー処理

## 動作例

```bash
# 1. スクリプト実行（例: spec ディレクトリ）
scripts/create-workflow.sh ./agents/spec "1 3 4 6 2"

# 2. 成功メッセージ
✅ ワークフローコマンドを作成しました: /spec-workflow

# 3. 生成されたコマンドの使用
/spec-workflow "Todo アプリを作成して"

# その他の例
scripts/create-workflow.sh ./agents "spec-init,utility-date"
```
