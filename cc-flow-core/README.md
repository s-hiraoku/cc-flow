# @hiraoku/cc-flow-core

> Core workflow generation logic for CC-Flow - Claude Code workflow creation toolkit

## 概要

`@hiraoku/cc-flow-core` は、Claude Code のワークフロー作成を支援するコアロジックパッケージです。
このパッケージは CC-Flow エコシステムの**心臓部**であり、全てのインターフェース（CLI、Web など）から利用されます。

## アーキテクチャ

```
┌─────────────────────────────────────┐
│      @hiraoku/cc-flow-core          │
│                                     │
│  ワークフロー生成のコアロジック      │
└─────────────────────────────────────┘
              ↑          ↑
              │          │
     ┌────────┴──┐  ┌───┴─────────┐
     │  CLI      │  │   Web       │
     └───────────┘  └─────────────┘
```

## 機能

- ✅ ワークフロー生成（workflow.md）
- ✅ POML → Markdown 変換
- ✅ テンプレート管理
- ✅ エージェント検出・変換
- ✅ スラッシュコマンド変換

## インストール

```bash
npm install @hiraoku/cc-flow-core
```

## 使用方法

### スクリプト引数仕様

#### create-workflow.sh

```bash
create-workflow.sh <agents-dir> <commands-dir> --steps-json <path>
```

**引数:**
- `<agents-dir>`: エージェントファイル(.md)が配置されているディレクトリの**絶対パス**
- `<commands-dir>`: 生成されるワークフローファイルの出力先ディレクトリの**絶対パス**
- `--steps-json <path>`: ワークフロー定義JSONファイルのパス

**JSONファイル形式:**

```json
{
  "workflowName": "my-workflow",
  "workflowPurpose": "ワークフローの目的",
  "workflowModel": "claude-3-5-sonnet-20241022",
  "workflowArgumentHint": "<context>",
  "workflowSteps": [
    {
      "title": "Step 1",
      "mode": "sequential",
      "purpose": "目的",
      "agents": ["agent1", "agent2"]
    }
  ]
}
```

**使用例:**

```bash
# 絶対パスを指定して実行
./workflow/create-workflow.sh \
  /path/to/project/.claude/agents \
  /path/to/project/.claude/commands \
  --steps-json ./workflow.json
```

#### convert-slash-commands.sh

```bash
convert-slash-commands.sh <commands-dir> <agents-dir> [--dry-run]
```

**引数:**
- `<commands-dir>`: 変換対象のコマンドディレクトリの**絶対パス**
- `<agents-dir>`: 出力先エージェントディレクトリの**絶対パス**
- `--dry-run`: (オプション) 実際の変換は行わず、プレビューのみ表示

**ディレクトリ構造の保持:**

`/path/to/.claude/commands/kiro` を指定すると、出力は `/path/to/.claude/agents/kiro` に作成されます。

**使用例:**

```bash
# kiroディレクトリのコマンドを .claude/agents/kiro に変換
./workflow/utils/convert-slash-commands.sh \
  /path/to/project/.claude/commands/kiro \
  /path/to/project/.claude/agents

# utilityカテゴリのコマンドを .claude/agents/utility に変換
./workflow/utils/convert-slash-commands.sh \
  /path/to/project/.claude/commands/utility \
  /path/to/project/.claude/agents

# dry-runモードで確認
./workflow/utils/convert-slash-commands.sh \
  /path/to/project/.claude/commands \
  /path/to/project/.claude/agents \
  --dry-run
```

### コマンドラインから直接実行

```bash
# ワークフロー作成
npx cc-flow-create-workflow ./agents/my-workflow

# スラッシュコマンド変換
npx cc-flow-convert-commands utility
```

### プログラムから利用（Node.js / TypeScript）

```javascript
const { spawn } = require('child_process');
const { join } = require('path');
const { writeFileSync } = require('fs');
const { tmpdir } = require('os');

// パッケージのパスを取得
const corePackage = require.resolve('@hiraoku/cc-flow-core/package.json');
const corePath = join(corePackage, '..');
const scriptPath = join(corePath, 'workflow/create-workflow.sh');

// ワークフロー定義を作成
const workflowConfig = {
  workflowName: 'demo-workflow',
  workflowPurpose: 'Demo purpose',
  workflowSteps: [
    {
      title: 'Step 1',
      mode: 'sequential',
      purpose: 'Process data',
      agents: ['agent1']
    }
  ]
};

// 一時ファイルに保存
const tempFile = join(tmpdir(), 'workflow-config.json');
writeFileSync(tempFile, JSON.stringify(workflowConfig));

// スクリプトを実行（絶対パスを渡す）
const agentsDir = join(process.cwd(), '.claude/agents');
const commandsDir = join(process.cwd(), '.claude/commands');

const child = spawn('bash', [
  scriptPath,
  agentsDir,
  commandsDir,
  '--steps-json',
  tempFile
], {
  cwd: process.cwd(),
  stdio: 'inherit'
});

child.on('close', (code) => {
  console.log(`Workflow generated with exit code ${code}`);
});
```

## パッケージ構成

```
@hiraoku/cc-flow-core/
├── create-workflow.sh          # ワークフロー生成メインスクリプト
├── convert-slash-commands.sh   # コマンド変換スクリプト
├── workflow/                   # コアロジック
│   ├── lib/                    # ライブラリ
│   └── utils/                  # ユーティリティ
└── templates/                  # テンプレートファイル
    ├── workflow.md
    ├── workflow.poml
    └── partials/
```

## 依存パッケージ

### CLI インターフェース
- [@hiraoku/cc-flow-cli](https://www.npmjs.com/package/@hiraoku/cc-flow-cli)

### Web インターフェース
- [@hiraoku/cc-flow-web](https://www.npmjs.com/package/@hiraoku/cc-flow-web)

## 開発

### テンプレートのカスタマイズ

`templates/` ディレクトリ内のファイルを編集することで、生成されるワークフローをカスタマイズできます。

### 新機能の追加

コアロジックに新機能を追加すると、全てのインターフェース（CLI、Web）で自動的に利用可能になります。

## ライセンス

MIT

## リンク

- [GitHub Repository](https://github.com/hiraoku/cc-flow)
- [Documentation](https://github.com/hiraoku/cc-flow#readme)
- [Issues](https://github.com/hiraoku/cc-flow/issues)
