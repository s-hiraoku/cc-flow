# CC-Flow シェルライブラリ詳細設計仕様書

## 概要

CC-Flowのワークフロー管理システムで使用されるシェルライブラリの詳細設計仕様書です。
各ライブラリは特定の責務を持ち、モジュール化されたアーキテクチャを構成しています。

## 1. agent-discovery.sh - エージェント検索ライブラリ

### 1.1 概要
エージェントファイルの検索、抽出、表示に関する機能を提供します。

### 1.2 依存関係
- `../utils/common.sh` - 共通ユーティリティ関数

### 1.3 グローバル変数
- `AGENT_FILES[]` - 検索されたエージェントファイルパスの配列
- `AGENT_NAMES[]` - 抽出されたエージェント名の配列

### 1.4 関数仕様

#### 1.4.1 discover_agents()
**目的**: 指定されたディレクトリからエージェントファイルを検索する

**構文**: 
```bash
discover_agents <agent_dir>
```

**パラメータ**:
- `agent_dir` (必須): エージェントディレクトリ名

**処理フロー**:
1. エージェントパス `.claude/agents/$agent_dir` を構築
2. ディレクトリの存在確認 (`check_directory`使用)
3. `*.md`ファイルをソート済みで検索 (`find`コマンド使用)
4. 検索結果をグローバル配列 `AGENT_FILES` に格納

**エラーハンドリング**:
- ディレクトリが存在しない場合: `error_exit`でプロセス終了
- エージェントファイルが見つからない場合: `error_exit`でプロセス終了

**戻り値**: なし (グローバル変数に結果格納)

#### 1.4.2 extract_agent_names()
**目的**: エージェントファイルパスからエージェント名を抽出する

**構文**: 
```bash
extract_agent_names
```

**パラメータ**: なし

**処理フロー**:
1. `AGENT_FILES`配列を反復処理
2. 各ファイルパスから`basename`で拡張子を除去
3. 結果をグローバル配列 `AGENT_NAMES` に格納

**前提条件**: `AGENT_FILES`配列が初期化済み

**戻り値**: なし (グローバル変数に結果格納)

#### 1.4.3 display_agent_list()
**目的**: 発見されたエージェントを視覚的に一覧表示する

**構文**: 
```bash
display_agent_list <agent_dir>
```

**パラメータ**:
- `agent_dir` (必須): エージェントディレクトリ名（表示用）

**処理フロー**:
1. ヘッダー情報を表示
2. エージェント名に基づいて適切なアイコンと説明を決定
3. 番号付きでフォーマット出力

**アイコン分類ロジック**:
```
*init*      -> 🏗️  初期化・セットアップ
*requirements* -> 📋 要件定義・分析
*design*    -> 🎨 設計・アーキテクチャ
*tasks*     -> 📝 タスク分解・計画
*impl*      -> ⚡ 実装・開発
*status*    -> 📊 進捗・ステータス確認
*test*      -> 🧪 テスト・検証
*deploy*    -> 🚀 デプロイメント
*steering*  -> 🎯 方向性・ガイダンス
デフォルト   -> ⚙️  処理・実行
```

**戻り値**: なし (標準出力に表示)

#### 1.4.4 get_agent_count()
**目的**: 利用可能なエージェント数を取得する

**構文**: 
```bash
count=$(get_agent_count)
```

**パラメータ**: なし

**処理フロー**:
1. `AGENT_NAMES`配列の要素数を計算
2. 標準出力に数値を出力

**戻り値**: エージェント数（整数）

#### 1.4.5 get_agent_name_by_index()
**目的**: インデックスに対応するエージェント名を取得する

**構文**: 
```bash
agent_name=$(get_agent_name_by_index <index>)
```

**パラメータ**:
- `index` (必須): 0ベースのインデックス

**処理フロー**:
1. インデックスの範囲検証 (0 <= index < 配列サイズ)
2. 有効な場合は対応するエージェント名を出力
3. 無効な場合は戻り値1でエラー終了

**戻り値**: 
- 成功時: エージェント名（文字列）
- 失敗時: 戻り値1

#### 1.4.6 discover_all_items()
**目的**: `.claude/agents`（将来的には `.claude/commands` も）配下から全アイテムを検索

**構文**:
```bash
discover_all_items ".claude/agents"
```

**処理フロー**:
1. 基底ディレクトリの存在検証
2. `find -name "*.md"` で再帰検索し、ソート
3. `ITEM_FILES[]` と後方互換のため `AGENT_FILES[]` に格納（0件は `error_exit`）

**戻り値**: なし (グローバル変数に結果格納)

#### 1.4.7 discover_directory_items()
**目的**: 指定ディレクトリ配下のアイテムを検索

**構文**:
```bash
discover_directory_items ".claude/agents/<dir>"
```

**処理フロー**:
1. ディレクトリの存在を検証（`check_directory`）
2. `*.md` を検索し `ITEM_FILES[]`（および `AGENT_FILES[]`）に格納（0件は `error_exit`）

**戻り値**: なし (グローバル変数に結果格納)

#### 1.4.8 discover_items()
**目的**: `.claude/` 配下の汎用パスに基づき、全体/特定ディレクトリのアイテムを検索

**構文**:
```bash
discover_items "./agents"|"./agents/<dir>"|"./commands"|"./commands/<dir>"
```

**処理フロー**:
1. `./agents`/`./commands` のいずれかを判定
2. 全体は `discover_all_items`、特定は `discover_directory_items` を呼び出し
3. サポート外の形式は `error_exit`

**戻り値**: なし

#### 1.4.9 extract_item_info_from_path()
**目的**: ファイルパスから `category/directory/name` 形式の情報を抽出

**構文**:
```bash
extract_item_info_from_path ".claude/agents/spec/spec-init.md"
```

**出力**: `agents/spec/spec-init`

**戻り値**: 0（標準出力にパス要素を出力）

#### 1.4.10 extract_item_names()
**目的**: `ITEM_FILES[]`（なければ `AGENT_FILES[]`）からアイテム名配列を生成

**構文**:
```bash
extract_item_names
```

**処理フロー**:
1. 各パスのベース名から拡張子 `.md` を除去
2. 後方互換のため `AGENT_NAMES[]` と `ITEM_NAMES[]` の両方に格納

**戻り値**: なし (グローバル変数に結果格納)

## 2. template-processor.sh - テンプレート処理ライブラリ

### 2.1 概要
ワークフロー定義ファイル（.mdと.poml）のテンプレート処理機能を提供します。

### 2.2 依存関係
- `../utils/common.sh` - 共通ユーティリティ関数

### 2.3 グローバル変数
- `WORKFLOW_MD_TEMPLATE` - workflow.mdテンプレートの内容
- `WORKFLOW_POML_TEMPLATE` - workflow.pomlテンプレートの内容
- `WORKFLOW_MD_CONTENT` - 変数置換後のworkflow.md内容
- `WORKFLOW_POML_CONTENT` - 変数置換後のworkflow.poml内容
- `WORKFLOW_NAME` - 生成されるワークフロー名
- `SELECTED_AGENTS[]` - 選択されたエージェントの配列

### 2.4 関数仕様

#### 2.4.1 load_templates()
**目的**: テンプレートファイルをメモリに読み込む

**構文**: 
```bash
load_templates
```

**パラメータ**: なし

**処理フロー**:
1. `templates/workflow.md`を読み込み
2. `templates/workflow.poml`を読み込み
3. 各テンプレート内容をグローバル変数に格納

**エラーハンドリング**:
- テンプレートファイルが存在しない場合: `error_exit`でプロセス終了

**戻り値**: なし (グローバル変数に結果格納)

#### 2.4.2 create_agent_list_json()
**目的**: エージェントリストをJSON配列形式に変換する

**構文**: 
```bash
json_array=$(create_agent_list_json)
```

**パラメータ**: なし

**処理フロー**:
1. 開始括弧 "[" を設定
2. `SELECTED_AGENTS`配列を反復処理
3. 各要素をシングルクォートで囲み、カンマ区切りで結合
4. 終了括弧 "]" を追加

**前提条件**: `SELECTED_AGENTS`配列が初期化済み

**出力形式**: `['agent1', 'agent2', 'agent3']`

**戻り値**: JSON配列文字列

#### 2.4.3 process_templates()
**目的**: テンプレートの変数置換を実行する

**構文**: 
```bash
process_templates <agent_dir>
```

**パラメータ**:
- `agent_dir` (必須): エージェントディレクトリ名

**処理フロー**:
1. ワークフロー名、説明、引数ヒントを生成
2. JSON形式のエージェントリストを作成
3. workflow.mdテンプレートの変数置換:
   - `{DESCRIPTION}` -> 動的生成された説明
   - `{ARGUMENT_HINT}` -> "[context]"
   - `{WORKFLOW_NAME}` -> 生成されたワークフロー名
   - `{POML_GENERATED_INSTRUCTIONS}` -> pomljsで生成されたワークフロー手順
4. workflow.pomlテンプレートの変数置換:
   - `{WORKFLOW_NAME}` -> 生成されたワークフロー名
   - `{WORKFLOW_AGENT_ARRAY}` -> JSON配列形式のエージェントリスト
   - `{WORKFLOW_CONTEXT}` -> `'sequential agent execution'`
   - その他のプレースホルダーを空文字で置換

**変数置換パターン**:
```bash
CONTENT="${CONTENT//\{VARIABLE\}/$value}"
```

**戻り値**: なし (グローバル変数に結果格納)

#### 2.4.4 generate_files()
**目的**: 処理済みテンプレートをファイルに出力する

**構文**: 
```bash
generate_files
```

**パラメータ**: なし

**処理フロー**:
1. 出力ディレクトリを作成:
   - `.claude/commands`
   - `.claude/commands/poml`（中間ファイル用。生成後、空なら削除）
2. 処理済み内容をファイルに書き込み:
   - `.claude/commands/$WORKFLOW_NAME.md`（最終ファイル）
   - `.claude/commands/poml/$WORKFLOW_NAME.poml`（中間ファイル。最終的に削除）

**使用関数**:
- `safe_mkdir()` - ディレクトリ安全作成
- `safe_write_file()` - ファイル安全書き込み

**戻り値**: なし (ファイル生成)

#### 2.4.5 show_success_message()
**目的**: ワークフロー作成成功メッセージを表示する

**構文**: 
```bash
show_success_message
```

**パラメータ**: なし

**処理フロー**:
1. エージェント実行順序を矢印記号で結合
2. 成功メッセージを表示
3. 生成されたファイルパスを表示
4. 使用方法の例を表示

**表示形式**:
```
✅ ワークフローコマンドを作成しました: /workflow-name
📁 生成されたファイル:
   - .claude/commands/workflow-name.md

エージェント実行順序: agent1 → agent2 → agent3

使用方法: /workflow-name "<context>"
```

**戻り値**: なし (標準出力に表示)

## 3. user-interaction.sh - ユーザー対話ライブラリ

### 3.1 概要
ユーザーとの対話処理、入力検証、確認メッセージに関する機能を提供します。

### 3.2 依存関係
- `../utils/common.sh` - 共通ユーティリティ関数

### 3.3 グローバル変数
- `AGENT_NAMES[]` - 利用可能なエージェント名の配列
- `SELECTED_AGENTS[]` - ユーザーが選択したエージェントの配列

### 3.4 関数仕様

#### 3.4.1 show_selection_instructions()
**目的**: エージェント選択の説明とガイドラインを表示する

**構文**: 
```bash
show_selection_instructions
```

**パラメータ**: なし

**処理フロー**:
1. タイトルとセパレーターを表示
2. 選択方法の説明を表示
3. 実際のエージェント名を使用した例を動的生成
4. 利用可能エージェント数に応じて例を調整

**表示要素**:
- 装飾的なセパレーター線
- 選択方法の詳細ガイド
- 動的な使用例（実際のエージェント名使用）

**戻り値**: なし (標準出力に表示)

#### 3.4.2 get_execution_order()
**目的**: ユーザーからエージェント実行順序を対話的に取得する

**構文**: 
```bash
get_execution_order
```

**パラメータ**: なし

**処理フロー**:
1. ユーザー入力をループで受付
2. 入力の配列変換 (`read -ra`)
3. 各選択の妥当性検証:
   - 数値形式の確認
   - 範囲チェック (1-エージェント数)
   - 重複チェック
4. 選択内容の確認表示
5. ユーザー確認の取得
6. 確認が得られるまで繰り返し

**入力検証ロジック**:
- 正規表現による数値チェック: `^[0-9]+$`
- 範囲検証: `1 <= num <= ${#AGENT_NAMES[@]}`
- 重複検証: `array_contains`関数使用

**確認表示形式**:
```
✅ 選択されたワークフロー:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   1. 🚀 agent1 (開始)
   2. ⚙️  agent2
   3. 🏁 agent3 (完了)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**戻り値**: なし (グローバル変数 `SELECTED_AGENTS` に結果格納)

#### 3.4.3 confirm_selection()
**目的**: ユーザーから選択内容の確認を取得する

**構文**: 
```bash
if confirm_selection; then
    # 確認された場合の処理
fi
```

**パラメータ**: なし

**処理フロー**:
1. 確認メッセージを表示
2. ユーザー入力を読み取り
3. 正規表現で肯定回答をチェック

**入力判定**:
- 肯定: `[Yy]`にマッチする文字
- それ以外は否定と判断

**戻り値**: 
- 0: 確認された (Yes)
- 1: 確認されなかった (No)

#### 3.4.4 process_order_specification()
**目的**: 非対話モードでの順序指定を処理する

**構文**: 
```bash
process_order_specification "<order_spec>"
```

**パラメータ**:
- `order_spec` (必須): スペース区切りの番号順序 (例: "1 3 5")

**処理フロー**:
1. 入力文字列を配列に変換
2. 空の選択をチェック
3. 各番号の妥当性検証:
   - 数値形式確認
   - 範囲チェック
   - 重複チェック
4. 検証済みエージェントをグローバル配列に格納
5. 選択内容の確認表示

**エラーハンドリング**:
- 空の入力: `error_exit`
- 無効な番号: `error_exit`
- 重複エージェント: `error_exit`

**戻り値**: なし (グローバル変数 `SELECTED_AGENTS` に結果格納)

#### 3.4.5 show_final_confirmation()
**目的**: ワークフロー生成開始の確認メッセージを表示する

**構文**: 
```bash
show_final_confirmation
```

**パラメータ**: なし

**処理フロー**:
1. 生成開始メッセージを表示
2. 視覚的な待機表示を提供

**表示内容**:
```
🔧 ワークフローコマンドを生成しています...
```

**戻り値**: なし (標準出力に表示)

#### 3.4.6 process_item_names_specification()
**目的**: アイテム名（エージェント名）を直接指定して順序を決定する非対話モードを処理する

**構文**:
```bash
process_item_names_specification
```

**前提**:
- `ITEM_NAMES_SPECIFIED[]`: ユーザーが指定したアイテム名の配列
- `AGENT_NAMES[]`: 利用可能なエージェント名の配列

**処理フロー**:
1. `ITEM_NAMES_SPECIFIED` を順に走査
2. 各アイテム名が `AGENT_NAMES` に存在するか検証
3. 存在しない場合は `error_exit` で終了
4. 検証済みの名前を `SELECTED_AGENTS[]` に設定
5. `show_item_names_result` で結果を表示

**エラーハンドリング**:
- 未知のアイテム名指定時: `error_exit "指定されたアイテム '<name>' が見つかりません"`

**戻り値**: なし (グローバル変数 `SELECTED_AGENTS` に結果格納)

#### 3.4.7 show_item_names_result()
**目的**: アイテム名指定モードで選択された順序を視覚的に表示する

**構文**:
```bash
show_item_names_result <selected_agents...>
```

**処理フロー**:
1. 引数の配列を受け取り、開始・中間・完了で装飾して出力
2. `get_execution_order`/`process_order_specification` と同一の表示形式を用いる

**戻り値**: なし (標準出力に表示)

## 4. slash-command-discovery.sh - スラッシュコマンド検索ライブラリ

### 4.1 概要
`.claude/commands/` 配下のスラッシュコマンドファイルを検索・一覧表示する機能を提供します。
agent-discovery.sh のスラッシュコマンド版として、シンプルな検索・表示機能を実装します。

### 4.2 依存関係
- `../utils/common.sh` - 共通ユーティリティ関数
- `find`, `basename` - 標準Unix コマンド

### 4.3 グローバル変数

#### 4.3.1 COMMAND_FILES
**目的**: 検出されたスラッシュコマンドファイルのパス配列

**形式**: 
```bash
COMMAND_FILES=("path1" "path2" "path3")
```

#### 4.3.2 COMMAND_NAMES
**目的**: スラッシュコマンド名の配列

**形式**:
```bash
COMMAND_NAMES=("command1" "command2" "command3")
```

### 4.4 関数仕様

#### 4.4.1 discover_commands()
**目的**: 指定ディレクトリ配下のスラッシュコマンドファイルを検索

**構文**:
```bash
discover_commands <command_dir>
```

**パラメータ**:
- `command_dir`: 検索対象ディレクトリ（"utility", "workflow" など）

**処理フロー**:
1. `.claude/commands/$command_dir` の存在確認
2. `.md` ファイルを検索
3. 検出結果を `COMMAND_FILES` に格納



**使用例**:
```bash
discover_commands "utility"
echo "Found ${#COMMAND_FILES[@]} commands"
```

#### 4.4.2 extract_command_names()
**目的**: コマンドファイルからコマンド名を抽出

**構文**:
```bash
extract_command_names
```



**処理フロー**:
1. `COMMAND_FILES` 配列を走査
2. ファイル名から `.md` 拡張子を除去
3. 結果を `COMMAND_NAMES` に格納





#### 4.4.3 display_command_list()
**目的**: コマンド一覧を表示

**構文**: 
```bash
display_command_list <command_dir>
```

**処理フロー**:
1. `command_dir` に応じたヘッダーを表示（`all` の場合は全体）
2. `COMMAND_NAMES` を番号付きで列挙
3. 名前パターンに応じてアイコン/説明を付与
   - `*convert*` → 🔄 変換・変更
   - `*create*` → 🏗️ 作成・生成
   - `*utility*` → ⚙️ ユーティリティ
   - `*workflow*` → 🚀 ワークフロー
   - `*analysis*` → 📊 分析・解析
   - `*test*` → 🧪 テスト・検証
   - `*deploy*` → 🚀 デプロイメント
   - その他 → 📝 コマンド

**戻り値**: なし (標準出力に表示)

#### 4.4.4 get_command_count()
**目的**: 利用可能なコマンド数を取得

**構文**:
```bash
count=$(get_command_count)
```

**戻り値**: コマンド数（整数）

#### 4.4.5 get_command_name_by_index()
**目的**: インデックスに対応するコマンド名を取得

**構文**:
```bash
name=$(get_command_name_by_index <index>)
```

**パラメータ**:
- `index` (必須): 0ベースのインデックス

**戻り値**:
- 成功時: コマンド名（文字列）
- 失敗時: 戻り値1

#### 4.4.6 discover_all_commands()
**目的**: `.claude/commands` 配下の全ディレクトリからコマンドを検索

**構文**:
```bash
discover_all_commands ".claude/commands"
```

**処理フロー**:
1. 基底ディレクトリの存在を検証
2. `find -name "*.md"` で再帰検索し、ソート
3. `COMMAND_FILES[]` に格納（0件は `error_exit`）

**戻り値**: なし (グローバル変数に結果格納)

#### 4.4.7 discover_directory_commands()
**目的**: 特定ディレクトリ配下のコマンドを検索

**構文**:
```bash
discover_directory_commands ".claude/commands/<dir>"
```

**処理フロー**:
1. ディレクトリの存在を検証（`check_directory`）
2. `*.md` を検索し `COMMAND_FILES[]` に格納（0件は `error_exit`）

**戻り値**: なし (グローバル変数に結果格納)
## 5. conversion-processor.sh - スラッシュコマンド変換処理ライブラリ

### 5.1 概要
スラッシュコマンドファイルをサブエージェント形式に変換する処理を提供します。
`slash-command-discovery.sh` で準備されたデータを基に、テンプレートエンジンを使用して確実な変換を実行します。

### 5.2 依存関係
- `../utils/common.sh` - 共通ユーティリティ関数
- `slash-command-discovery.sh` - スラッシュコマンド検索機能
- `template-processor.sh` - テンプレート処理機能

### 5.3 グローバル変数

#### 5.3.1 CONVERSION_STATUS
**目的**: 各コマンドの変換状態を追跡

**形式**:
```bash
declare -A CONVERSION_STATUS
CONVERSION_STATUS["/path/to/cmd.md"]="pending|processing|completed|failed"
```

#### 5.3.2 CONVERSION_RESULTS
**目的**: 変換結果の詳細情報

**形式**:
```bash
declare -A CONVERSION_RESULTS
CONVERSION_RESULTS["/path/to/cmd.md:target"]="/path/to/agent.md"
CONVERSION_RESULTS["/path/to/cmd.md:status"]="success"
CONVERSION_RESULTS["/path/to/cmd.md:message"]="Conversion completed"
```

### 5.4 関数仕様

#### 5.4.1 convert_command_to_agent()
**目的**: 単一のスラッシュコマンドをエージェント形式に変換

**構文**:
```bash
convert_command_to_agent <source_file> <target_directory> [template_file]
```

**パラメータ**:
- `source_file` (必須): 変換元の `.md` ファイル
- `target_directory` (必須): 出力先ディレクトリ（存在しない場合は作成）
- `template_file` (任意): テンプレートファイル（デフォルト: `templates/agent-template.md`）

**処理フロー**:
1. 入力ファイル/テンプレートの存在検証（無い場合は `error_exit`）
2. コマンド名・メタデータ・本文の抽出（`extract_command_metadata`）
3. 引数ヒントの抽出（`extract_argument_hint`）
4. テンプレート変数を構築し `process_template` を実行
5. 変換完了メッセージを出力

**戻り値**: 0（エラー時は `error_exit` により終了）

#### 5.4.2 batch_convert_commands()
**目的**: ディレクトリ配下のコマンドを一括変換

**構文**:
```bash
batch_convert_commands <source_directory> <target_base_directory> [template_file]
```

**処理フロー**:
1. 入力/出力ディレクトリの検証と作成
2. `find -name "*.md"` で再帰的にソースを列挙
3. 各ファイルに対し `convert_command_to_agent` を実行
4. 成功/失敗数を集計・表示

**戻り値**: 0（処理結果は標準出力に表示）
#### 5.4.3 extract_command_metadata()
**目的**: スラッシュコマンドのフロントマターと本文を抽出

**構文**:
```bash
extract_command_metadata <source_file> name_ref description_ref tools_ref content_ref
```

**説明**:
- YAMLフロントマターから `name`/`description`/`tools` を取得
- 未指定時のデフォルト値を補完
- 本文はフロントマター以降のMarkdownを抽出

**戻り値**: 参照引数に値を設定

#### 5.4.4 extract_argument_hint()
**目的**: フロントマターから `argument-hint` を抽出

**構文**:
```bash
extract_argument_hint <source_file>
```

**戻り値**:
- 指定あり: その値
- 指定なし: `"<args>"`

#### 5.4.5 check_conversion_compatibility()
**目的**: コマンドが変換対象として妥当かの簡易チェック

**構文**:
```bash
check_conversion_compatibility <source_file>
```

**検証項目**:
1. ファイルの存在
2. YAMLフロントマターの有無
3. `name` または `description` の存在

**戻り値**:
- 0: 変換可能
- 1: ファイル無し
- 2: フロントマター無し
- 3: メタデータ不足

### 5.5 テンプレート仕様

#### 5.5.1 基本テンプレート構造
```markdown
---
name: {AGENT_NAME}
description: {AGENT_DESCRIPTION}
model: {AGENT_MODEL}
tools: {AGENT_TOOLS}
color: {AGENT_COLOR}
---

# {AGENT_NAME}

{AGENT_CONTENT}

## 変換情報

- **変換元**: {SOURCE_PATH}
- **変換日時**: {CONVERSION_DATE}
- **変換バージョン**: {CONVERSION_VERSION}
```

#### 5.5.2 テンプレート変数
- `{AGENT_NAME}`: エージェント名
- `{AGENT_DESCRIPTION}`: エージェントの説明
- `{AGENT_MODEL}`: 使用モデル（sonnet/opus/haiku）
- `{AGENT_TOOLS}`: ツール配列
- `{AGENT_COLOR}`: エージェント色
- `{AGENT_CONTENT}`: Markdown本文
- `{SOURCE_PATH}`: 変換元ファイルパス
- `{CONVERSION_DATE}`: 変換実行日時
- `{CONVERSION_VERSION}`: 変換スクリプトバージョン

## 6. poml-processor.sh - POML実行処理ライブラリ（現状は任意）

### 5.1 概要
POMLファイルを処理してマークダウンファイルを生成する機能を提供します。将来拡張用として `pomljs` による POML→Markdown 変換を行えますが、現行の `create-workflow.sh` 既定フローでは使用していません（テンプレート置換で生成した `.md` を最終出力とし、POML は中間ファイルとして削除）。

### 6.2 依存関係（POML処理を行う場合）
- `../utils/common.sh` - 共通ユーティリティ関数
- Node.js 実行環境
- npm パッケージマネージャー
- `pomljs` パッケージ

### 5.3 グローバル変数
- `SELECTED_AGENTS[]` - 選択されたエージェントの配列（コンテキスト生成で使用）

### 5.4 関数仕様

#### 5.4.1 check_nodejs_dependencies()（任意）
**目的**: POML処理を行う場合に、Node.js 環境と `pomljs` パッケージの依存関係をチェックする

**構文**: 
```bash
check_nodejs_dependencies
```

**パラメータ**: なし

**処理フロー**:
1. Node.jsコマンドの存在確認
2. npmコマンドの存在確認
3. pomljsパッケージの存在確認（グローバル/ローカル）
4. pomljsが存在しない場合、自動インストールを試行

**エラーハンドリング**:
- Node.js不存在: `error_exit`でプロセス終了
- npm不存在: `error_exit`でプロセス終了
- pomljsインストール失敗: `error_exit`でプロセス終了

**戻り値**: なし (成功時は処理継続)

#### 5.4.2 convert_poml_file_to_markdown()
**目的**: POMLファイルを読み込み、`convert_poml_to_markdown` を介した正規ルートでMarkdownへ変換する

**構文**: 
```bash
convert_poml_file_to_markdown <poml_file> <output_file> [workflow_name] [user_context]
```

**パラメータ**:
- `poml_file` (必須): 入力POMLファイルパス
- `output_file` (必須): 出力マークダウンファイルパス
- `workflow_name` (オプション): POMLに適用するワークフロー名。省略時はファイル名から推測
- `user_context` (オプション): 追加コンテキスト文字列（将来拡張用）

**処理フロー**:
1. 引数の妥当性検証と入力ファイル存在確認
2. ワークフロー名を決定（引数またはファイル名）
3. POMLファイル内容を読み込み
4. `convert_poml_to_markdown` を呼び出してMarkdown文字列を生成
   - `pomljs --context-file` を用いて `workflowName` / `workflowPurpose` / `workflowSteps` / `workflowAgents` を注入
   - `workflowSteps` 要素は `{ title, mode, agents[], purpose? }`。`purpose` が指定されていればテンプレート側で表示される
   - `workflowSteps` から抽出できない場合のみ `workflowAgents`（一次元配列）でフォールバック
5. `safe_write_file` で出力ファイルに書き込み、成功メッセージを表示

**エラーハンドリング**:
- 引数不正: `validate_args`が `error_exit`
- POMLファイル不存在: `check_file`が `error_exit`
- 変換失敗: `convert_poml_to_markdown` 内で `error_exit`
- 出力ファイル書き込み失敗: `error_exit`

**戻り値**: なし (成功時はファイル生成)

#### 5.4.3 create_workflow_context()（任意）
**目的**: ワークフロー用のコンテキスト変数文字列を生成する

**構文**: 
```bash
context_vars=$(create_workflow_context <workflow_name> [user_context])
```

**パラメータ**:
- `workflow_name` (必須): ワークフロー名
- `user_context` (オプション): ユーザー指定のコンテキスト

**処理フロー**:
1. 基本コンテキスト変数の初期化
2. ワークフロー名の追加
3. ユーザーコンテキストの追加
4. エージェントリスト（`SELECTED_AGENTS`）の追加
5. 完成したコンテキスト文字列を出力

**生成される変数例**:
```bash
--context "workflow_name=spec-workflow" --context "user_input=test_context" --context "agent_list=spec-init spec-requirements"
```

**戻り値**: コンテキスト変数文字列

#### 5.4.4 process_workflow_poml()（任意）
**目的**: ワークフロー用のPOML処理を実行する（高レベルインターフェース・既定フローでは未使用）

**構文**: 
```bash
process_workflow_poml <workflow_name> [user_context]
```

**パラメータ**:
- `workflow_name` (必須): ワークフロー名
- `user_context` (オプション): ユーザーコンテキスト（デフォルト: "default_context"）

**処理フロー**:
1. ファイルパスの構築:
   - 入力: `.claude/commands/poml/<workflow_name>.poml`
   - 出力: `.claude/commands/<workflow_name>.md`
2. コンテキスト変数の生成
3. POML処理の実行

**戻り値**: なし (最終マークダウンファイル生成)

#### 5.4.5 validate_poml_processing()
**目的**: POML処理の事前検証を実行する

**構文**: 
```bash
validate_poml_processing <poml_file>
```

**パラメータ**:
- `poml_file` (必須): 検証対象POMLファイル

**処理フロー**:
1. Node.js環境の依存関係チェック
2. POMLファイルの基本検証:
   - ファイル存在確認
   - 空ファイルチェック
   - 基本的なタグ構文チェック（`<.*>`の存在）

**検証ポイント**:
- POMLファイルが空でないこと
- 最低限のPOMLタグが含まれていること
- 構文エラーの早期発見

**戻り値**: なし (問題時は`error_exit`または`warn`)

#### 5.4.6 show_poml_processing_info()
**目的**: POML処理の詳細情報を表示する

**構文**: 
```bash
show_poml_processing_info <poml_file> <output_file>
```

**パラメータ**:
- `poml_file` (必須): 入力POMLファイル
- `output_file` (必須): 出力マークダウンファイル

**処理フロー**:
1. 処理詳細のヘッダー表示
2. 入力/出力ファイル情報の表示
3. 処理エンジン情報の表示
4. POMLファイルサイズ情報の表示（存在する場合）

**表示形式**:
```
🔧 POML処理詳細:
   入力: input.poml
   出力: output.md
   処理エンジン: pomljs
   POMLファイルサイズ: 1638バイト
```

**戻り値**: なし (標準出力に表示)

#### 5.4.7 cleanup_poml_processing()
**目的**: POML処理後のクリーンアップを実行する

**構文**: 
```bash
cleanup_poml_processing [temp_files...]
```

**パラメータ**:
- `temp_files...` (オプション): 削除対象の一時ファイル配列

**処理フロー**:
1. 指定された一時ファイルを反復処理
2. 安全性チェック（`.tmp`拡張子または`/tmp/`ディレクトリ内）
3. 条件を満たすファイルの削除
4. 削除結果のログ出力

**安全性対策**:
- `.tmp`拡張子または`/tmp/`パス内のファイルのみ削除
- 重要ファイルの誤削除防止

**戻り値**: なし (ファイル削除とログ出力)

#### 5.4.8 process_multiple_poml_files()
**目的**: 複数POMLファイルのバッチ処理を実行する

**構文**: 
```bash
process_multiple_poml_files <poml_dir> <output_dir> [context_vars]
```

**パラメータ**:
- `poml_dir` (必須): POMLファイル格納ディレクトリ
- `output_dir` (必須): 出力ディレクトリ
- `context_vars` (オプション): 共通コンテキスト変数

**処理フロー**:
1. ディレクトリの存在確認と作成
2. POMLファイルの検索（`*.poml`）
3. 発見されたファイル数の報告
4. 各POMLファイルの順次処理:
   - ベースネーム抽出（`.poml` → `.md`）
   - 個別ファイル処理の実行
   - 進捗表示

**検索仕様**:
- `find`コマンドでソート済み検索
- null区切り文字で安全な配列構築

**戻り値**: なし (複数マークダウンファイル生成)

### 5.5 使用例（参考）

> 既定フローでは POML 処理は行いません。必要な場合のみ以下を利用してください。

```bash
# 依存関係チェック
check_nodejs_dependencies

# POMLファイルを処理
convert_poml_file_to_markdown "input.poml" "output.md" "input" "user context"

# ワークフロー用POML処理
process_workflow_poml "spec-workflow" "create todo app"

# 詳細制御の例
context_vars=$(create_workflow_context "spec-workflow" "user input")
convert_poml_file_to_markdown "spec-workflow.poml" "spec-workflow.md" "spec-workflow" "$context_vars"
```

#### バッチ処理
```bash
# 複数ファイル処理
process_multiple_poml_files ".claude/commands/poml" ".claude/commands"
```

### 5.6 技術仕様

#### pomljsコマンド実行形式
```bash
npx pomljs --file <poml-file> [--context "key=value"]...
```

#### エラーハンドリング戦略
- **即座失敗**: 依存関係エラー時は処理継続不可
- **詳細ログ**: pomljs実行エラーの詳細を取得・表示
- **安全な削除**: クリーンアップ時の誤削除防止

#### パフォーマンス考慮
- Node.js環境チェックは初回のみ実行
- バッチ処理時の効率的なファイル検索
- 大きなPOMLファイルでのメモリ使用量監視

## 6. 共通ユーティリティ (common.sh)

### 6.1 メッセージ関数群

#### 6.1.1 error_exit()
**目的**: エラーメッセージを表示してプロセスを終了する
**構文**: `error_exit "message"`
**戻り値**: なし (exit 1で終了)

#### 6.1.2 success(), info(), warn(), progress()
**目的**: 各種メッセージの統一表示
**構文**: `success "message"` など
**戻り値**: なし (標準出力に表示)

### 6.2 検証関数群

#### 6.2.1 check_directory(), check_file()
**目的**: ディレクトリ/ファイルの存在確認
**構文**: `check_directory "path" "description"`
**戻り値**: なし (存在しない場合はerror_exit)

#### 6.2.2 validate_args()
**目的**: 引数の非空確認
**構文**: `validate_args "$arg" "description"`
**戻り値**: なし (無効な場合はerror_exit)

#### 6.2.3 array_contains()
**目的**: 配列内要素の存在確認
**構文**: `array_contains "element" "${array[@]}"`
**戻り値**: 0=存在, 1=非存在

### 6.3 ファイル操作関数群

#### 6.3.1 safe_mkdir(), safe_write_file()
**目的**: 安全なディレクトリ作成とファイル書き込み
**構文**: `safe_mkdir "path"`, `safe_write_file "path" "content"`
**戻り値**: なし (失敗時はerror_exit)

## 7. アーキテクチャ設計原則

### 7.1 責務分離
- **agent-discovery.sh**: エージェント関連操作
- **template-processor.sh**: テンプレート処理
- **user-interaction.sh**: ユーザー対話
- **slash-command-discovery.sh**: スラッシュコマンド関連操作
- **poml-processor.sh**: POML実行処理
- **common.sh**: 共通ユーティリティ

### 7.2 エラーハンドリング戦略
- 即座失敗 (fail-fast): 不正な状態で続行しない
- 統一されたエラーメッセージ形式
- 適切な終了コード管理

### 7.3 グローバル状態管理
- 明確に定義されたグローバル変数
- 配列を使用した複数値管理
- 関数間での状態共有

### 7.4 ユーザビリティ
- 視覚的に分かりやすい出力
- 絵文字を使った状態表示
- 対話的および非対話的モードの両対応

## 8. 使用例

### 8.1 基本的なワークフロー作成
```bash
# エージェント検索
discover_agents "spec"
extract_agent_names
display_agent_list "spec"

# ユーザー対話
get_execution_order

# テンプレート処理
load_templates
process_templates "spec"
generate_files
show_success_message
```

### 8.2 非対話モードでの使用
```bash
# エージェント検索
discover_agents "spec"
extract_agent_names

# 順序指定処理
process_order_specification "1 3 5"

# テンプレート処理
load_templates
process_templates "spec"
generate_files
```

## 9. 拡張性考慮

### 9.1 新しいエージェントタイプの追加
`display_agent_list()`内のcase文にパターンを追加することで、新しいエージェントタイプのアイコン表示をサポート可能。

### 9.2 テンプレート変数の拡張
`process_templates()`内で新しい変数置換パターンを追加することで、テンプレートの表現力を向上可能。

### 9.3 検証ルールの追加
各ライブラリ内の検証ロジックを拡張することで、より厳密な入力チェックが実装可能。
