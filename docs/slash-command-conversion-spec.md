# スラッシュコマンド→エージェント変換機能 設計仕様書

## 1. 概要

### 1.1 目的
CC-Flowプロジェクトにおいて、カスタムスラッシュコマンド（`.claude/commands/`）をサブエージェント形式（`.claude/agents/`）に変換し、既存のワークフロー作成機能と統合する機能を提供します。

### 1.2 スコープ
- スラッシュコマンドの自動検出・解析
- テンプレートベースの確実な変換
- TUI統合による直感的な操作
- 既存ワークフロー作成との完全統合

### 1.3 非スコープ
- スラッシュコマンドの新規作成機能
- エージェント実行環境の提供
- 外部システムとの連携

## 2. アーキテクチャ

### 2.1 システム構成

```
┌─────────────────────────────────────────────────────────────┐
│                    TUI Layer                                 │
│  ┌─────────────────────┐    ┌─────────────────────────────┐  │
│  │  ConversionScreen   │    │   AgentSelectionScreen     │  │
│  │  (新規追加)         │───▶│   (既存・統合拡張)          │  │
│  └─────────────────────┘    └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                  Shell Script Layer                         │
│  ┌─────────────────────┐    ┌─────────────────────────────┐  │
│  │ slash-command-      │    │  conversion-processor.sh   │  │
│  │ discovery.sh        │───▶│  (新規作成)                │  │
│  │ (新規作成)          │    └─────────────────────────────┘  │
│  └─────────────────────┘              │                     │
│             │                         │                     │
│  ┌─────────────────────┐    ┌─────────────────────────────┐  │
│  │ template-processor. │◀───┤  agent-discovery.sh        │  │
│  │ sh (既存・活用)     │    │  (既存・拡張統合)          │  │
│  └─────────────────────┘    └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────┐
│                  File System Layer                          │
│  ┌─────────────────────┐    ┌─────────────────────────────┐  │
│  │ .claude/commands/   │    │  .claude/agents/            │  │
│  │ (スラッシュコマンド)  │───▶│  (全エージェント統合保存)     │  │
│  └─────────────────────┘    └─────────────────────────────┘  │
│                              │                              │
│  ┌─────────────────────┐    ┌─────────────────────────────┐  │
│  │ templates/          │    │  .claude/workflows/         │  │
│  │ agent-template.md   │    │  (生成されたワークフロー)      │  │
│  └─────────────────────┘    └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 データフロー

```
1. 発見フェーズ
   .claude/commands/ → slash-command-discovery.sh → FOUND_COMMANDS[]

2. 解析フェーズ  
   FOUND_COMMANDS[] → parse_command_metadata() → COMMAND_METADATA{}

3. フィルタリング
   COMMAND_METADATA{} → filter_convertible_commands() → CONVERSION_CANDIDATES[]

4. 変換フェーズ
   CONVERSION_CANDIDATES[] → conversion-processor.sh → .claude/agents/

5. 統合フェーズ
   .claude/agents/ → AgentSelectionScreen → ワークフロー作成
```

## 3. コンポーネント仕様

### 3.1 slash-command-discovery.sh
**役割**: スラッシュコマンドの検出・解析・分類
**詳細**: `docs/shell-library-specification.md` の第4章参照

### 3.2 conversion-processor.sh  
**役割**: テンプレートベースの変換処理
**詳細**: `docs/shell-library-specification.md` の第5章参照

### 3.3 ConversionScreen.ts (新規作成)
**役割**: 変換機能のTUIインターフェース

#### 3.3.1 画面構成（概要）
```
┌─ 🔄 スラッシュコマンド → エージェント変換 ─────┐
│                                               │
│ 📋 検出されたスラッシュコマンド:               │
│   ☐ utility/my-tool       - Custom utility   │
│   ☐ analysis/code-review  - Code analyzer    │
│   ☐ workflow/deploy       - Deployment tool  │
│                                               │
│ 🎯 変換設定:                                  │
│   出力先: .claude/agents/                     │
│   カテゴリ: utility/custom/workflow           │
│   テンプレート: agent-template.md             │
│   検証: ☑ 変換後に妥当性をチェック             │
│                                               │
│ 🚀 [変換実行] 🔙 [戻る]                       │
└───────────────────────────────────────────────┘
```

#### 3.3.2 処理フロー
1. **初期表示**: `slash-command-discovery.sh` で検出したコマンド一覧
2. **選択**: チェックボックスで変換対象を複数選択
3. **設定**: 出力先、テンプレート、オプション設定
4. **実行**: バッチ変換処理 + 進捗表示
5. **完了**: 結果サマリー + エージェント選択画面への遷移

#### 3.3.3 画面レイアウト（詳細）

ステップ1: コマンド一覧（カテゴリ別・チェックボックス）
```
┌─ 🔄 スラッシュコマンド → エージェント変換 ─────────────────────┐
│                                                               │
│ 📋 検出されたスラッシュコマンド: (12個)                        │
│                                                               │
│ ┌─ utility ─────────────────────────────────────────────────┐ │
│ │ ☐ my-tool          - Custom development utility          │ │
│ │ ☐ code-formatter   - Automatic code formatting tool     │ │
│ │ ☐ log-analyzer     - Parse and analyze log files        │ │
│ └───────────────────────────────────────────────────────────┘ │
│                                                               │
│ ┌─ workflow ────────────────────────────────────────────────┐ │
│ │ ☐ deploy-checker   - Deployment validation workflow     │ │
│ │ ☐ test-runner      - Automated testing pipeline        │ │
│ └───────────────────────────────────────────────────────────┘ │
│                                                               │
│ ┌─ analysis ────────────────────────────────────────────────┐ │
│ │ ☐ security-scan    - Security vulnerability scanner     │ │
│ │ ☐ performance-test - Performance benchmarking tool      │ │
│ └───────────────────────────────────────────────────────────┘ │
│                                                               │
│ 💡 ヒント: スペースキーで選択/解除、Enterで次へ                │
│                                                               │
│ 🚀 [次へ: 設定] 🔙 [戻る] 📊 [プレビュー]                      │
└───────────────────────────────────────────────────────────────┘
```

ステップ2: 変換設定
```
┌─ ⚙️ 変換設定 ───────────────────────────────────────────────┐
│                                                               │
│ 📂 出力設定:                                                  │
│   ベースディレクトリ: .claude/agents/                         │
│   ☑ カテゴリ別に分類して保存                                   │
│                                                               │
│ 🎨 エージェント設定:                                          │
│   デフォルトモデル: [sonnet ▼]                                │
│   デフォルトカラー: [blue   ▼]                                │
│   ☑ 既存エージェントとの名前衝突をチェック                      │
│                                                               │
│ 🔍 検証設定:                                                  │
│   ☑ 変換後に妥当性をチェック                                  │
│   ☑ 機能等価性を検証                                          │
│                                                               │
│ 🚀 [変換実行] 🔙 [戻る]                                       │
└───────────────────────────────────────────────────────────────┘
```

ステップ3: 進捗表示
```
┌─ ⏳ 変換を実行中… ───────────────────────────────────────────┐
│                                                               │
│ 進捗: ████▉  78% (28/36)                                      │
│ 現在: analysis/security-scan.md → agents/analysis/security…    │
│ 検証: validate_tool_equivalence…                               │
│                                                               │
│ 詳細ログ:                                                     │
│   - Parsed metadata: name=security-scan, tools=[Read,Bash]     │
│   - Template: templates/agent-template.md                      │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

ステップ4: 結果サマリー
```
┌─ ✅ 変換が完了しました ───────────────────────────────────────┐
│                                                               │
│ 📊 変換結果:                                                  │
│   ✅ 成功: 5個   ⚠️ 警告: 1個   ❌ エラー: 0個                 │
│                                                               │
│ 📁 出力先: .claude/agents                                     │
│ 📄 作成:                                                       │
│   • .claude/agents/utility/my-tool.md                        │
│   • .claude/agents/workflow/deploy-checker.md                │
│   • .claude/agents/analysis/security-scan.md                 │
│                                                               │
│ ⚠️ 警告: utility/log-analyzer → 大きなシェルスクリプト検出      │
│                                                               │
│ 🚀 [ワークフロー作成へ] 🔙 [メインメニューへ] 📊 [詳細表示]     │
└───────────────────────────────────────────────────────────────┘
```

#### 3.3.4 操作とキーバインド
- 選択: Space（チェック/解除）
- 決定/遷移: Enter
- 戻る: `b` または `Esc`
- プレビュー: `p`（選択中コマンドのフロントマター/本文を表示）
- ページング: ↑/↓/PgUp/PgDn（一覧が長い場合）

#### 3.3.5 アクセシビリティ
- 画面遷移/主要操作時に `TUIManager.announceToScreenReader()` を呼び出す。
- 進捗更新時は一定間隔で割合と対象ファイル名を読み上げ用テキストに反映。

#### 3.3.6 画面遷移
```
コマンド一覧 → 変換設定 → 進捗表示 → 結果サマリー → （成功時）エージェント選択画面
```

### 3.4 templates/agent-template.md (新規作成)
**役割**: スラッシュコマンド→エージェント変換用テンプレート

#### 3.4.1 テンプレート構造
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

---

## 変換情報

- **変換元**: {SOURCE_PATH}
- **変換日時**: {CONVERSION_DATE}  
- **変換バージョン**: {CONVERSION_VERSION}
- **機能保証**: 変換元スラッシュコマンドと100%機能等価
```

#### 3.4.2 変換マッピング

| スラッシュコマンド | エージェント | 変換ルール |
|-------------------|-------------|-----------|
| `name: my-tool` | `name: my-tool` | そのまま継承 |
| `description: "..."` | `description: "..."` | そのまま継承 |
| `tools: [Read, Write]` | `tools: [Read, Write]` | そのまま継承 |
| `(なし)` | `model: sonnet` | デフォルト値 |
| `(なし)` | `color: blue` | デフォルト値 |
| Markdown本文 | Markdown本文 | 完全保持 |

### 3.5 convert-slash-commands.sh (CLI)
**役割**: スラッシュコマンド→エージェント変換のエントリポイント。検索・表示・一括変換を司る。

#### 3.5.1 Usage
```bash
scripts/convert-slash-commands.sh <command_directory> [options]

Arguments:
  command_directory   変換対象ディレクトリ
                      (例: utility, workflow, analysis, all)

Options:
  --output-dir DIR    出力先ディレクトリ (既定: .claude/agents)
  --template FILE     テンプレートファイル (既定: templates/agent-template.md)
  --dry-run           変換は行わず対象のみ表示
  --help, -h          ヘルプ表示
```

#### 3.5.2 動作仕様
- 検出: `discover_commands <dir>` で `.claude/commands/<dir>` を走査し `COMMAND_FILES[]` を生成。
- 表示: `extract_command_names` → `display_command_list <dir>` で一覧表示（アイコン/説明付き）。
- 変換: `--dry-run` 未指定時、各ファイルに対し `convert_command_to_agent` を実行。
- 出力先の決定:
  - `<dir> == all` の場合: 入力のサブディレクトリ構造を保持する。
    - 例) `.claude/commands/workflow/deploy.md` → `--output-dir/workflow/deploy.md`
  - それ以外: `--output-dir/<dir>/` 配下に出力。
- テンプレート解決: `--template` は実行時のカレントディレクトリ基準で存在確認する。
- 進捗/結果: 成功・失敗件数と出力先をサマリー表示する。

#### 3.5.3 事前条件と異常系
- 事前条件:
  - `.claude/commands/<dir>` が存在し、`.md` が1件以上存在すること（`all` は `.claude/commands` 配下）
  - `--template` 指定時はファイルが存在すること
- エラー時の挙動:
  - 検索対象が存在しない/0件: エラーメッセージを表示して終了
  - テンプレート不存在: エラーメッセージを表示して終了
  - いずれも非0で終了（`set -euo pipefail` 準拠）

#### 3.5.4 使用例
```bash
# utility ディレクトリを既定の出力先に変換
scripts/convert-slash-commands.sh utility

# 全ディレクトリを構造維持で custom/ に出力（ドライラン）
scripts/convert-slash-commands.sh all --output-dir custom --dry-run

# workflow ディレクトリを指定テンプレートで変換
scripts/convert-slash-commands.sh workflow \
  --template templates/agent-template.md \
  --output-dir .claude/agents
```

#### 3.5.5 連携コンポーネント
- 検索/表示: `scripts/lib/slash-command-discovery.sh`
- 変換処理: `scripts/lib/conversion-processor.sh`
- テンプレート適用: `scripts/lib/template-processor.sh`

## 4. 統合仕様

### 4.1 TUIManager.ts への統合

#### 4.1.1 メニュー追加
```typescript
// 既存の環境チェック後に変換オプションを追加
const mainMenu = [
  'Create workflow from existing agents',
  'Convert slash commands to agents',  // ← 新規追加
  'Help',
  'Exit'
];
```

#### 4.1.2 フロー統合
```typescript
case 'Convert slash commands to agents':
  const conversionScreen = new ConversionScreen();
  const conversionResult = await conversionScreen.show();
  
  if (conversionResult.success) {
    // 変換成功 → 既存のエージェント選択画面に遷移
    const agentScreen = new AgentSelectionScreen();
    return await agentScreen.show(conversionResult.targetDirectory);
  }
  break;
```

### 4.2 AgentSelectionScreen.ts への統合

#### 4.2.1 変換済みエージェントの統合表示
```typescript
// 既存の agent-discovery.sh がそのまま .claude/agents/ 全体を検索
// 変換済みエージェントも自動的に既存エージェントと統合表示される
// 追加の実装は不要 - 既存システムがそのまま動作
```

### 4.3 ディレクトリ構造

```
.claude/
├── commands/           # 既存スラッシュコマンド
│   ├── utility/
│   │   ├── convert-to-agent.md
│   │   └── orchestrator.md
│   ├── demo/          # デモ用コマンド
│   │   ├── analyze-code.md
│   │   ├── generate-docs.md
│   │   └── create-tests.md
│   └── workflow/
├── agents/             # 全エージェント統合保存
│   ├── spec/          # 既存仕様ワークフローエージェント
│   ├── utility/       # 既存 + 変換済みユーティリティエージェント
│   ├── demo/          # 変換済みデモエージェント ← 新規
│   │   ├── analyze-code.md
│   │   ├── generate-docs.md
│   │   └── create-tests.md
│   └── workflow/      # 変換済みワークフローエージェント ← 新規
└── workflows/         # 生成されたワークフロー
```

### 4.4 ファイル保存仕様

#### 4.4.1 デフォルト保存ルール

**基本原則**: ディレクトリ構造を保持した変換

```bash
# 変換元
.claude/commands/{category}/{command-name}.md

# 変換先  
.claude/agents/{category}/{command-name}.md
```

**具体例**:
```bash
# utility ディレクトリの場合
.claude/commands/utility/convert-to-agent.md
    ↓ 変換
.claude/agents/utility/convert-to-agent.md

# demo ディレクトリの場合
.claude/commands/demo/analyze-code.md
    ↓ 変換
.claude/agents/demo/analyze-code.md
```

#### 4.4.2 カスタム出力先指定

**コマンドライン指定**:
```bash
# カスタムディレクトリへの保存
./scripts/convert-slash-commands.sh demo --output-dir .claude/agents/converted

# 結果
.claude/agents/converted/demo/analyze-code.md
.claude/agents/converted/demo/generate-docs.md
.claude/agents/converted/demo/create-tests.md
```

**TUI設定画面**:
- デフォルト: `.claude/agents`
- カスタム指定可能: 任意のディレクトリパス
- ディレクトリ構造保持: 常に適用

#### 4.4.3 統合の仕組み

**agent-discovery.sh による自動統合**:
```bash
# 既存の検索パス
discover_agents() {
    find ".claude/agents" -name "*.md" -type f
    # ↑ 変換済みエージェントも自動的に検出
}
```

**ワークフロー作成での統合表示**:
- 既存エージェント + 変換済みエージェント = 統合表示
- カテゴリ別の自動分類
- 追加実装不要（既存システムで動作）

#### 4.4.4 名前衝突の処理

**重複回避ルール**:
1. **同名ファイル検出**: 変換前に存在チェック
2. **上書き確認**: TUIで明示的な確認
3. **バックアップ生成**: `{name}.md.backup.{timestamp}`
4. **スキップオプション**: 衝突時の処理選択

**実装例**:
```bash
if [[ -f "$target_file" ]]; then
    echo "⚠️  既存ファイルが存在: $target_file"
    read -p "上書きしますか? (y/N): " confirm
    if [[ "$confirm" != "y" ]]; then
        echo "⏭️  スキップ: $command_name"
        continue
    fi
    cp "$target_file" "$target_file.backup.$(date +%s)"
fi
```

## 5. 変換制限事項・互換性

### 5.1 技術的制限

#### 5.1.1 サポート対象外の構文・機能

**❌ Bashスクリプトの実行**
```markdown
## 実行 (変換不可)

```bash
#!/bin/bash
echo "Hello World"
exit 0
```
```

- **問題**: エージェントはbashコードブロックを直接実行できない
- **対処**: エージェントのtoolsを使用した処理に書き換えが必要

**❌ 引数処理**
```bash
TARGET_FILE="$1"
if [ -z "$TARGET_FILE" ]; then
    echo "Usage: /command <file>"
    exit 1
fi
```

- **問題**: `$1`, `$2`等の引数は直接利用不可
- **対処**: エージェントでは文脈からの引数抽出が必要

**❌ システムコマンド・制御文**
```bash
exit 1          # プロセス終了
kill $PID       # プロセス制御
sudo command    # 権限昇格
rm -rf /path    # ファイル削除
```

- **問題**: システムレベルの操作は実行不可
- **対処**: エージェント用の安全な代替手段への変更

**❌ 対話型処理**
```bash
read -p "Continue? (y/N): " choice
if [[ "$choice" == "y" ]]; then
    echo "Proceeding..."
fi
```

- **問題**: 実行時の入力待ちは不可
- **対処**: 事前設定やデフォルト動作への変更

#### 5.1.2 環境依存要素

**❌ 特定OS依存コマンド**
```bash
# macOS専用
pbcopy < file.txt
open application.app

# Linux専用  
apt-get install package
systemctl restart service
```

- **対処**: クロスプラットフォーム対応に変更

**❌ 外部ツール依存**
```bash
# 特定ツールへの依存
jq '.field' data.json
docker run image
git commit -m "message"
```

- **対処**: エージェントの標準toolsでの代替実装

### 5.2 変換警告システム

#### 5.2.1 自動検出される問題パターン

**変換処理時の警告表示例**:
```
🔄 変換中: analyze-code.md → .claude/agents/demo/analyze-code.md

⚠️  変換警告:
⚠️  このコマンドにはbashコードが含まれています。エージェントでは直接実行できません。
⚠️  このコマンドは引数($1, $2等)を使用しています。エージェントでは異なる引数処理が必要です。
⚠️  このコマンドはexit文を使用しています。エージェントでは適切なエラーハンドリングに変更が必要です。

✅ 変換完了: .claude/agents/demo/analyze-code.md
```

#### 5.2.2 検出パターン詳細

| パターン | 正規表現 | 警告メッセージ |
|---------|----------|---------------|
| Bashコードブロック | ````bash` | エージェントでは直接実行できません |
| 引数参照 | `\$[0-9]` | 異なる引数処理が必要です |
| Exit文 | `exit [0-9]` | 適切なエラーハンドリングに変更が必要です |
| Kill/Signal | `kill\|pkill` | プロセス制御は使用できません |
| Sudo実行 | `sudo\|su ` | 権限昇格は実行不可です |
| 対話入力 | `read -p` | 対話型処理は使用できません |

### 5.3 変換可能性の判定

#### 5.3.1 完全変換可能 ✅

**情報系コマンド**
```markdown
---
description: Display system information
tools: [Read, Bash]
---

# system-info

システム情報を表示します。

## 機能
- CPU情報の表示
- メモリ使用量の確認
- ディスク容量の表示
```

**文書処理コマンド**
```markdown
---
description: Generate project documentation
tools: [Read, Write, Glob]
---

# generate-docs

プロジェクトドキュメントを自動生成します。
```

#### 5.3.2 修正後変換可能 ⚠️

**引数処理が必要なコマンド**
```markdown
# 変換前（問題あり）
TARGET="$1"
echo "Processing: $TARGET"

# 変換後（エージェント対応）
# エージェントが文脈から対象を判断
# ユーザーの指示に含まれるファイル名を解析
```

**シンプルなBashコマンド**
```markdown
# 変換前（問題あり）
```bash
ls -la | grep ".md"
```

# 変換後（エージェント対応）
プロジェクト内のMarkdownファイルを一覧表示します。
Globツールを使用してMarkdownファイルを検索し、表示します。
```

#### 5.3.3 変換困難 ❌

**複雑なシステム処理**
```bash
# Docker操作
docker build -t image .
docker run --rm -v $(pwd):/app image

# システム設定変更
echo "setting" | sudo tee /etc/config
systemctl restart service
```

**重い外部依存**
```bash
# 特殊ツールチェーン
npm install && npm run build
cargo build --release
make install PREFIX=/usr/local
```

### 5.4 エラー処理・検証

#### 5.4.1 変換適合性チェック

**必須要件**
- [ ] 有効なYAMLフロントマター
- [ ] `name` または `description` のいずれかが存在
- [ ] Markdownコンテンツ存在

**除外条件**
- [ ] システム予約コマンド (`create-workflow.md` など)
- [ ] 循環依存の可能性があるコマンド
- [ ] 非対応ツール使用コマンド

**警告条件**
- [ ] 大量の外部依存
- [ ] 複雑なシェルスクリプト埋め込み
- [ ] 対話型処理

### 5.2 機能等価性保証

#### 5.2.1 検証項目
1. **メタデータ保持**: 全フィールドの正確な移行
2. **コンテンツ保持**: Markdown本文の完全保持
3. **ツール等価性**: 同一ツールセットへのアクセス
4. **動作保証**: 同一入力に対する同一出力

#### 5.2.2 バリデーション手順
```bash
# 変換前後の検証
validate_conversion() {
    local source="$1"
    local target="$2"
    
    # メタデータ比較
    compare_metadata "$source" "$target"
    
    # コンテンツサイズ確認
    check_content_preservation "$source" "$target"
    
    # ツールセット検証
    validate_tool_equivalence "$source" "$target"
}
```

## 6. 実装フェーズ

### 6.1 フェーズ1: 基盤実装
- [ ] `slash-command-discovery.sh` 実装
- [ ] `conversion-processor.sh` 実装
- [ ] `templates/agent-template.md` 作成
- [ ] 基本的な変換処理のテスト

### 6.2 フェーズ2: TUI統合  
- [ ] `ConversionScreen.ts` 実装
- [ ] `TUIManager.ts` への統合
- [ ] `AgentSelectionScreen.ts` 拡張
- [ ] エンドツーエンドテスト

### 6.3 フェーズ3: 品質向上
- [ ] エラーハンドリング強化
- [ ] バリデーション機能追加
- [ ] パフォーマンス最適化
- [ ] ドキュメント整備

## 7. テスト戦略

### 7.1 単体テスト
- 各シェルスクリプト関数の個別テスト
- TypeScriptコンポーネントのユニットテスト
- テンプレート処理の検証

### 7.2 統合テスト
- スラッシュコマンド検出→変換→ワークフロー作成の一貫フロー
- 複数コマンドの一括変換テスト
- エラー条件での動作確認

### 7.3 受け入れテスト
- 実際のカスタムスラッシュコマンドでの変換テスト
- 変換されたエージェントでのワークフロー実行テスト
- TUIの操作性確認

## 8. 運用考慮事項

### 8.1 後方互換性
- 既存の `.claude/commands/` は変更なし
- 既存のワークフロー作成機能への影響なし
- 既存エージェントとの完全統合（同一ディレクトリ保存）
- 既存の `agent-discovery.sh` がそのまま変換済みエージェントも検出

### 8.2 移行支援
- 変換前後の対応表生成
- 変換履歴の記録
- ロールバック機能（将来拡張）

### 8.3 監視・ログ
- 変換処理のログ出力
- エラー詳細の記録
- パフォーマンス指標の収集

---

**作成日**: 2024-01-15  
**バージョン**: 1.0  
**作成者**: CC-Flow Development Team
