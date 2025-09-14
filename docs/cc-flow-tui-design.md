# cc-flow TUI 設計書

## 1. プロジェクト概要

### 目的

- cc-flow の`/create-workflow`コマンドを TUI で置き換え
- 数字入力による選択 → 視覚的なチェックボックス選択
- ワークフローの目的を明確化し、より意味のあるワークフロー作成

### 位置づけ

- **独立した npm パッケージ**: `cc-flow`
- **npx 実行**: `npx cc-flow`
- **cc-flow との連携**: 既存のスクリプトを活用して処理実行

## 2. アーキテクチャ設計

### 全体フロー

```
npx cc-flow
    ↓
TUI起動・対話的設定
    ↓
設定情報収集
    ↓
既存のcreate-workflow.shに処理委譲
    ↓
ワークフローファイル生成
    ↓
ユーザー環境に展開
```

### 責任分離

- **TUI**: UI/UX、エージェント選択、順序設定、環境チェック
- **既存 scripts**: ファイル生成、テンプレート処理、実際の展開

## 3. 実行方式

### コマンド

```bash
# シンプル実行（推奨）
npx cc-flow

# 将来的に引数指定も可能
npx cc-flow --directory spec
npx cc-flow --non-interactive
```

### 理由

- **学習コスト 0**: 引数を覚える必要なし
- **発見性**: 利用可能なディレクトリが一目瞭然
- **ガイド性**: 各段階で適切な説明提供

## 4. TUI フロー設計

### 4.1 Welcome 画面

```
┌─ CC-Flow Workflow Creator ──────────────┐
│                                         │
│  ██████╗ ██████╗      ███████╗██╗       │
│ ██╔════╝██╔════╝      ██╔════╝██║       │
│ ██║     ██║     █████╗█████╗  ██║       │
│ ██║     ██║     ╚════╝██╔══╝  ██║       │
│ ╚██████╗╚██████╗      ██║     ███████╗  │
│  ╚═════╝ ╚═════╝      ╚═╝     ╚══════╝  │
│                                         │
│        Workflow Creator                 │
│                                         │
│ Create custom workflows for your        │
│ Claude Code agents                      │
│                                         │
│ [Enter] Get Started  [Q] Quit           │
└─────────────────────────────────────────┘
```

### 4.2 環境チェック

```
┌─ Environment Check ─────────────────────┐
│                                         │
│ Checking your project...                │
│ ✅ .claude directory found              │
│ ✅ agents directory found               │
│                                         │
│ Available agent directories:            │
│ • spec (7 agents)                      │
│ • utility (3 agents)                   │
│ • deploy (2 agents)                    │
│ • all (12 agents total)               │
│                                         │
│ [Enter] Continue                        │
└─────────────────────────────────────────┘
```

### 4.3 対象ディレクトリ選択

```
┌─ Select Agent Directory ────────────────┐
│                                         │
│ Which agent directory do you want to    │
│ create a workflow for?                  │
│                                         │
│ Available directories:                  │
│ → spec (7 agents)                      │
│   utility (3 agents)                   │
│   deploy (2 agents)                    │
│   custom-auth (5 agents)               │
│   ─────────────────────────             │
│   all (12 agents from all directories) │
│                                         │
│ This will create: /all-workflow         │
│                                         │
│ [↑↓] Navigate  [Enter] Select           │
└─────────────────────────────────────────┘
```

### 4.4 ワークフロー目的入力

```
┌─ Workflow Purpose ──────────────────────┐
│                                         │
│ Describe the purpose of this workflow:  │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ Create authentication system        │ │
│ │ specification and implementation    │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ This will be used to:                   │
│ • Guide agent execution                 │
│ • Generate documentation               │
│ • Create meaningful descriptions        │
│                                         │
│ [Enter] Continue                        │
└─────────────────────────────────────────┘
```

### 4.5 エージェント選択

```
┌─ Select Agents (spec directory) ────────┐
│                                         │
│ Purpose: Create authentication system   │
│ specification and implementation        │
│                                         │
│ Available agents:                       │
│ [✓] spec-init                          │
│     Initialize project structure        │
│                                         │
│ [✓] spec-requirements                   │
│     Generate requirements using EARS    │
│                                         │
│ [ ] spec-tasks                         │
│     Generate implementation tasks       │
│                                         │
│ [✓] spec-impl                          │
│     Implement using TDD methodology     │
│                                         │
│ Selected: 3 agents                      │
│                                         │
│ [Space] Toggle  [A] All  [Enter] Next   │
└─────────────────────────────────────────┘
```

### 4.6 実行順序設定

```
┌─ Set Execution Order ───────────────────┐
│                                         │
│ Set the execution order for selected    │
│ agents:                                 │
│                                         │
│ Current order:                          │
│ → 1. spec-init                          │
│   2. spec-requirements                  │
│   3. spec-impl                          │
│                                         │
│ Execution flow:                         │
│ spec-init → spec-requirements → spec-impl│
│                                         │
│ [↑↓] Move selection                     │
│ [M] Move this agent                     │
│ [Enter] Confirm order                   │
└─────────────────────────────────────────┘
```

### 4.7 プレビュー

```
┌─ Workflow Preview ──────────────────────┐
│                                         │
│ Workflow: /spec-workflow                │
│ Purpose: Create authentication system   │
│ specification and implementation        │
│                                         │
│ Execution Order:                        │
│ 1. spec-init                           │
│    → Initialize project structure       │
│ 2. spec-requirements                    │
│    → Generate requirements using EARS   │
│ 3. spec-impl                           │
│    → Implement using TDD methodology    │
│                                         │
│ Generated Files:                        │
│ • .claude/commands/spec-workflow.md     │
│ • .claude/commands/poml/spec-workflow.poml│
│                                         │
│ [G] Generate  [E] Edit  [Q] Cancel      │
└─────────────────────────────────────────┘
```

### 4.8 完了画面

```
┌─ Workflow Created ──────────────────────┐
│                                         │
│            ✅ Success!                   │
│                                         │
│ Your workflow has been created:         │
│                                         │
│ Command: /spec-workflow                 │
│ Files generated:                        │
│ • .claude/commands/spec-workflow.md     │
│ • .claude/commands/poml/spec-workflow.poml│
│                                         │
│ Usage:                                  │
│ /spec-workflow "create authentication   │
│ system"                                 │
│                                         │
│ [Enter] Create Another  [Q] Quit        │
└─────────────────────────────────────────┘
```

## 5. データモデル

### 5.1 Agent

```typescript
interface Agent {
  id: string; // "spec-init"
  name: string; // "spec-init"
  description: string; // "Initialize project structure"
  filePath: string; // ".claude/agents/spec/spec-init.md"
  directory: string; // "spec"
  category?: string; // "initialization", "analysis", "implementation"
  estimatedTime?: string; // "~5 minutes"
  dependencies?: string[]; // 依存関係
}
```

### 5.2 WorkflowConfig

```typescript
interface WorkflowConfig {
  targetDirectory: string; // "spec"
  workflowName: string; // "spec-workflow"
  purpose?: string; // "Create authentication system..."
  selectedAgents: Agent[]; // 選択されたエージェント
  executionOrder: string[]; // ["spec-init", "spec-requirements", ...]
  createdAt: Date;
}
```

### 5.3 TUI 実行結果

```typescript
interface TUIResult {
  directory: string;
  purpose?: string;
  agents: string[];
  order: string[];
}
```

## 6. ディレクトリ構成

### npm パッケージ構成

```
cc-flow/                    # npmパッケージルート
├── package.json            # パッケージ定義
├── README.md
├── LICENSE
├── bin/
│   └── cc-flow.js         # npx実行エントリーポイント
├── src/                   # TypeScriptソース
│   ├── index.ts           # メインエクスポート
│   ├── cli/
│   │   ├── main.ts        # CLI実行ロジック
│   │   └── WorkflowBuilder.ts
│   ├── ui/                # TUI画面
│   │   ├── screens/
│   │   │   ├── WelcomeScreen.ts
│   │   │   ├── EnvironmentScreen.ts
│   │   │   ├── DirectoryScreen.ts
│   │   │   ├── PurposeScreen.ts
│   │   │   ├── SelectionScreen.ts
│   │   │   ├── OrderScreen.ts
│   │   │   ├── PreviewScreen.ts
│   │   │   └── CompleteScreen.ts
│   │   └── components/
│   │       ├── Banner.ts
│   │       └── Box.ts
│   ├── services/
│   │   ├── AgentDiscovery.ts
│   │   ├── EnvironmentChecker.ts
│   │   └── ScriptExecutor.ts
│   ├── models/
│   │   ├── Agent.ts
│   │   └── WorkflowConfig.ts
│   └── utils/
│       ├── colors.ts
│       └── formatting.ts
├── dist/                  # コンパイル後
└── test/                  # テスト
```

## 7. 技術スタック

### 依存関係

```json
{
  "dependencies": {
    "@inquirer/prompts": "^3.0.0",
    "@inquirer/checkbox": "^1.0.0",
    "@inquirer/select": "^1.0.0",
    "@inquirer/input": "^1.0.0",
    "chalk": "^5.0.0",
    "figlet": "^1.6.0",
    "boxen": "^7.0.0",
    "fs-extra": "^11.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/fs-extra": "^11.0.0",
    "typescript": "^5.0.0",
    "tsx": "^4.0.0"
  }
}
```

### パッケージ設定

```json
{
  "name": "cc-flow",
  "version": "1.0.0",
  "description": "Interactive TUI for creating Claude Code workflows",
  "bin": {
    "cc-flow": "./bin/cc-flow.js"
  },
  "main": "dist/index.js",
  "files": ["dist/", "bin/", "README.md"],
  "engines": {
    "node": ">=16.0.0"
  }
}
```

## 8. 既存システムとの連携

### 8.1 連携方式

```typescript
import { execSync } from "child_process";

// TUI完了時、既存のcreate-workflow.shを呼び出し
const executeWorkflowCreation = (config: TUIResult): Promise<void> => {
  const { directory, agents, order } = config;
  const orderString = order.join(" ");

  // "all"選択時の特別処理
  const targetDirectory = directory === "all" ? "all" : directory;

  // 既存スクリプトを非インタラクティブモードで実行
  const command = `./scripts/create-workflow.sh "${targetDirectory}" "${orderString}"`;

  try {
    execSync(command, {
      stdio: "pipe",
      cwd: process.cwd(),
    });
  } catch (error) {
    throw new Error(`Workflow creation failed: ${error.message}`);
  }
};
```

### 8.2 エージェント発見

```typescript
// 既存のagent-discovery.shを活用
const discoverAgents = (directory: string): Agent[] => {
  let command: string;

  if (directory === "all") {
    // 全ディレクトリのエージェントを取得
    command = `find .claude/agents -name "*.md" -type f`;
  } else {
    // 特定ディレクトリのエージェントを取得
    command = `./scripts/lib/agent-discovery.sh "${directory}"`;
  }

  const output = execSync(command, { encoding: "utf8" });
  return parseAgentOutput(output);
};
```

### 8.3 環境チェック

```typescript
// 既存のcommon.shの関数を活用
const checkEnvironment = (): EnvironmentStatus => {
  const checks = [
    checkClaudeDirectory(),
    checkAgentsDirectory(),
    checkNodejs(),
    checkPoml(),
  ];

  return {
    isValid: checks.every((check) => check.passed),
    checks,
  };
};
```

## 9. 実装難易度・コスト

### 実装工数

```
設計・準備          : 0.5日
基本UI実装          : 2日
エージェント発見     : 1日 (既存スクリプト活用)
順序設定機能        : 1.5日
スクリプト連携       : 1日
テスト・調整        : 1日
npm公開準備         : 0.5日
─────────────────────
合計              : 7.5日
```

### 難易度

- **実装難易度**: ★★☆☆☆ (中程度)
- **技術的リスク**: 低 (既存スクリプトを活用)
- **投資対効果**: ★★★★★ (非常に高い)

## 10. 期待効果

### UX 改善

- **現在**: 数字入力による選択 (`"3 4 1 6 2"`)
- **改善後**: 視覚的チェックボックス選択
- **効果**: 学習コスト削減、操作ミス防止

### 機能向上

- ワークフロー目的の明確化
- エージェント説明の可視化
- 実行順序の直感的な設定
- 生成前のプレビュー機能

### エコシステム価値

- cc-flow の使いやすさ向上
- 新規ユーザーの参入障壁低下
- コミュニティ活性化

## 11. 実装フェーズ

### Phase 1: MVP (3-4 日)

- 基本 UI（Welcome → Directory → Selection → Order → Complete）
- 既存スクリプト連携
- 基本的なエラーハンドリング

### Phase 2: 機能拡張 (2-3 日)

- 目的入力機能
- プレビュー画面強化
- 高度なバリデーション
- エージェント説明の充実

### Phase 3: 改善 (1-2 日)

- UI/UX ポリッシュ
- パフォーマンス最適化
- ドキュメント整備
- npm 公開

## 12. 追加機能の可能性

### 12.1 カスタムエージェント自動変換

```typescript
// 将来的な機能として
interface CustomAgentConverter {
  scanDirectory(path: string): CustomScript[];
  convertToAgent(script: CustomScript): Agent;
  generateWorkflow(agents: Agent[]): void;
}
```

### 12.2 ワークフローテンプレート

```typescript
interface WorkflowTemplate {
  name: string;
  description: string;
  agents: string[];
  defaultOrder: string[];
  purpose: string;
}
```

### 12.3 実行履歴管理

```typescript
interface ExecutionHistory {
  workflowName: string;
  executedAt: Date;
  context: string;
  result: "success" | "failure";
  duration: number;
}
```

## 13. セキュリティ・品質

### セキュリティ考慮事項

- スクリプト実行時のパス検証
- ユーザー入力のサニタイズ
- ファイル書き込み権限の確認

### 品質保証

- TypeScript 型安全性
- エラーハンドリングの充実
- ユニットテストの実装
- 既存スクリプトとの互換性テスト

---

この設計により、cc-flow の既存機能を大幅に改善しつつ、独立したツールとして価値の高い TUI が実現できます。
