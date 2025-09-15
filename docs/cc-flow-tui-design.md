# cc-flow TUI 設計書

## 1. プロジェクト概要

### 目的

- cc-flow の`/create-workflow`コマンドを TUI で置き換え
- 数字入力による選択 → 視覚的なチェックボックス選択
- ワークフローの目的を明確化し、より意味のあるワークフロー作成

### 位置づけ

- **独立した npm パッケージ**: `@hiraoku/cc-flow-cli`
- **npx 実行**: `npx @hiraoku/cc-flow-cli`
- **cc-flow との連携**: 既存のスクリプトを活用して処理実行

## 2. アーキテクチャ設計

### 全体フロー

```
npx @hiraoku/cc-flow-cli
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
npx @hiraoku/cc-flow-cli

# 将来的に引数指定も可能
npx @hiraoku/cc-flow-cli --directory spec  # planned
npx @hiraoku/cc-flow-cli --non-interactive # planned
```

### 理由

- **学習コスト 0**: 引数を覚える必要なし
- **発見性**: 利用可能なディレクトリが一目瞭然
- **ガイド性**: 各段階で適切な説明提供

## 4. TUI フロー設計

### 4.1 Welcome 画面（実装準拠）

```
   ██████╗ ██████╗       ███████╗██╗      ██████╗ ██╗    ██╗
  ██╔════╝██╔════╝      ██╔════╝██║     ██╔═══██╗██║    ██║
  ██║     ██║     █████╗█████╗  ██║     ██║   ██║██║ █╗ ██║
  ██║     ██║     ╚════╝██╔══╝  ██║     ██║   ██║██║███╗██║
  ╚██████╗╚██████╗      ██║     ███████╗╚██████╔╝╚███╔███╔╝
   ╚═════╝ ╚═════╝      ╚═╝     ╚══════╝ ╚═════╝  ╚══╝╚══╝

⚡ Claude Code Workflow Orchestration Platform ⚡

🚀 Create custom workflows for your Claude Code agents
   Build powerful agent orchestration with visual TUI

Press Enter to get started, or type "q" to quit
```

### 4.2 環境チェック（実装準拠・日本語UI）

```
┌─ 🔍 プロジェクト環境チェック ───────────┐
│                                         │
│ プロジェクト構成をチェック中...         │
│                                         │
│ ✅ .claude ディレクトリ                  │
│ ✅ agents ディレクトリ                   │
│                                         │
│ 利用可能なエージェント:                 │
│ • spec (7個)                            │
│ • utility (3個)                         │
│ • …                                     │
│ • 全て (合計10個のエージェント)        │
│                                         │
└─────────────────────────────────────────┘

メニュー:
- ▶️  次へ進む
- 📚 ヘルプを表示
- ❌ 終了
```

### 4.3 ディレクトリ選択（実装準拠・日本語UI）

```
┌─ 📁 ディレクトリ選択 ───────────────────┐
│                                         │
│ ワークフロー作成対象のディレクトリを     │
│ 選択してください:                        │
│                                         │
│ 📁 spec (7個のエージェント)              │
│ 📁 utility (3個のエージェント)           │
│ 📁 all (10個のエージェント - 全ディレクトリ)│
│                                         │
└─────────────────────────────────────────┘

選択後: 「✅ spec を選択しました」
```

### 4.4 ワークフロー名の設定（実装準拠・日本語UI）

```
┌─ 📝 ワークフロー名の設定 ───────────────┐
│                                         │
│ 💡 ワークフロー名を入力してください:     │
│   • 英数字、ハイフン、アンダースコア     │
│   • 例: my-workflow, test_flow          │
│   • 空白でデフォルト名を使用             │
│   • ヘルプ: help                         │
│                                         │
└─────────────────────────────────────────┘

プロンプト: 「ワークフロー名を入力:\n> 」
（空入力時は `spec-workflow` / 全体は `all-workflow`）
```

### 4.5 ワークフロー目的入力（将来拡張・据え置き）

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

### 4.6 エージェント選択（実装準拠・日本語UI）

```
┌─ 🎯 エージェント選択 ───────────────────┐
│                                         │
│ 📁 ディレクトリ: spec                    │
│ 📊 利用可能: 7個のエージェント           │
│                                         │
│ ワークフローに含めるエージェントを選択  │
│ してください (スペースでチェック/解除):  │
│ [✓] spec-init        - Initialize ...    │
│ [✓] spec-requirements- Generate ...      │
│ [ ] spec-impl        - Implement ...     │
│                                         │
│ ✅ 3個のエージェントを選択しました！     │
└─────────────────────────────────────────┘
```

### 4.7 実行順序設定（逐次選択方式・実装準拠）

```
┌─ 🔄 実行順序の設定 ─────────────────────┐
│                                         │
│ 📋 現在の実行順序:                      │
│   1. spec-init                          │
│                                         │
│ 次に実行するエージェントを選択:         │
│   spec-requirements - 要件定義           │
│   spec-impl         - 実装               │
│   …                                     │
│                                         │
│ 🔗 実行フロー: spec-init → …             │
│                                         │
│ [Enter] 決定  [ヘルプ]  [この順序で確定]   │
└─────────────────────────────────────────┘
```

### 4.8 プレビュー（実装準拠・日本語UI）

```
┌─ 📋 ワークフロー プレビュー ─────────────┐
│                                         │
│ ワークフロー: /spec-workflow            │
│ 目的: Create authentication system ...  │
│                                         │
│ 実行順序:                               │
│ 1. spec-init                           │
│    → Initialize project structure       │
│ 2. spec-requirements                    │
│    → Generate requirements using EARS   │
│ 3. spec-impl                           │
│    → Implement using TDD methodology    │
│                                         │
│ 生成されるファイル:                     │
│ • .claude/commands/spec-workflow.md     │
│                                         │
└─────────────────────────────────────────┘

メニュー:
- 🚀 ワークフローを作成する
- ✏️  設定を編集する（未実装）
- 📚 ヘルプを表示
- ❌ キャンセル
```

### 4.9 完了画面（実装準拠・日本語UI）

```
┌─ ✅ ワークフロー作成完了 ────────────────┐
│                                         │
│            🎉 成功しました！             │
│                                         │
│ コマンド: /spec-workflow                 │
│ 生成されたファイル:                     │
│ • .claude/commands/spec-workflow.md     │
│                                         │
│ 使用方法:                               │
│ /spec-workflow "タスクの内容"            │
│                                         │
└─────────────────────────────────────────┘

メニュー:
- 🔄 新しいワークフローを作成する
- 📚 ヘルプを表示
- 👋 アプリケーションを終了
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

### 5.2 WorkflowConfig（実装準拠）

```typescript
interface WorkflowConfig {
  targetPath: string;      // "./agents/spec" または "./agents"
  workflowName?: string;   // 省略時は "<dir>-workflow"
  purpose: string;         // 空文字の場合あり（現状は未入力）
  selectedAgents: Agent[]; // 選択されたエージェント
  executionOrder: string[]; // ["spec-init", "spec-requirements", ...]
  createdAt: Date;
}
```

### 5.3 TUI 実行結果（実装準拠）

```typescript
interface TUIResult {
  targetPath: string;
  purpose?: string;
  selectedAgents: string[];
  executionOrder: string[];
}
```

## 6. ディレクトリ構成

### npm パッケージ構成

```
cc-flow-cli/                # npmパッケージルート
├── package.json            # パッケージ定義
├── README.md
├── LICENSE
├── bin/
│   └── cc-flow.js         # npx実行エントリーポイント
├── src/                   # TypeScriptソース
│   ├── index.ts           # メインエクスポート
│   ├── cli/
│   │   └── main.ts        # CLI実行ロジック
│   ├── ui/                # TUI画面
│   │   ├── screens/
│   │   │   ├── WelcomeScreen.ts
│   │   │   ├── EnvironmentScreen.ts
│   │   │   ├── DirectoryScreen.ts
│   │   │   ├── WorkflowNameScreen.ts
│   │   │   ├── AgentSelectionScreen.ts
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

### 依存関係（実装準拠）

```json
{
  "dependencies": {
    "@inquirer/prompts": "^5.0.0",
    "@inquirer/checkbox": "^2.0.0",
    "@inquirer/select": "^2.0.0",
    "@inquirer/input": "^2.0.0",
    "chalk": "^5.3.0",
    "figlet": "^1.7.0",
    "boxen": "^7.0.0"
  },
  "devDependencies": {
    "@types/figlet": "^1.5.8",
    "@types/node": "^22.0.0",
    "typescript": "~5.6.0",
    "tsx": "^4.19.0",
    "vitest": "^2.0.5",
    "@vitest/coverage-v8": "^2.0.5"
  }
}
```

### パッケージ設定

```json
{
  "name": "@hiraoku/cc-flow-cli",
  "version": "1.0.0",
  "description": "Interactive TUI for creating Claude Code workflows",
  "bin": {
    "cc-flow": "./bin/cc-flow.js"
  },
  "main": "dist/index.js",
  "files": ["dist/", "bin/", "README.md"],
  "engines": {
    "node": ">=18.0.0"
  }
}
```

## 8. 既存システムとの連携

### 8.1 連携方式

```typescript
import { execSync } from "child_process";

// TUI完了時、既存のcreate-workflow.shを呼び出し
const executeWorkflowCreation = (config: TUIResult): Promise<void> => {
  const { targetPath, executionOrder } = config;
  const orderSpec = executionOrder.join(","); // エージェント名CSV（実装準拠）

  // 既存スクリプトを非インタラクティブモードで実行
  const command = `./scripts/create-workflow.sh "${targetPath}" "${orderSpec}"`;

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

## 14. ステートマシン設計

### 14.1 主要ステート

- `WELCOME`: 起動直後のバナー表示、開始待機
- `ENV_CHECK`: 必要ディレクトリ・依存の検査と結果表示
- `DIRECTORY_SELECT`: 対象ディレクトリ選択（`spec`/`utility`/`all`）
- `WORKFLOW_NAME`: ワークフロー名入力（空時はデフォルト付与）
- `PURPOSE_INPUT`(optional): 目的入力（Phase 2 以降）
- `AGENT_SELECT`: エージェント複数選択（チェックボックス）
- `ORDER_BUILD`: 実行順序の構築（逐次追加）
- `PREVIEW`: 生成内容の最終確認
- `EXECUTE`: 既存スクリプト実行（同期/逐次ログ）
- `COMPLETE`: 成功表示・次のアクション
- `ERROR`: 失敗表示・再試行/中断

### 14.2 イベント/トランジション

- `START` → `WELCOME → ENV_CHECK`
- `NEXT` → 次の画面へ、`BACK` → 前の画面へ
- `SELECT_DIR(dir)` → `DIRECTORY_SELECT` で状態更新
- `INPUT_NAME(name)` → `WORKFLOW_NAME` で状態更新
- `TOGGLE_AGENT(id)` → `AGENT_SELECT` で選択切替
- `APPEND_ORDER(id)`/`REMOVE_ORDER(id)` → `ORDER_BUILD`
- `CONFIRM_PREVIEW` → `PREVIEW → EXECUTE`
- `EXECUTION_DONE` → `EXECUTE → COMPLETE`
- `EXECUTION_FAIL(error)` → `EXECUTE → ERROR`
- `RETRY(fromState)` → 指定ステートへ復帰
- `CANCEL` → プロセス終了（コード: 130）

```typescript
// src/models/State.ts
export type State =
  | { kind: "WELCOME" }
  | { kind: "ENV_CHECK"; result?: EnvironmentStatus }
  | { kind: "DIRECTORY_SELECT"; directory?: string }
  | { kind: "WORKFLOW_NAME"; name?: string }
  | { kind: "PURPOSE_INPUT"; purpose?: string }
  | { kind: "AGENT_SELECT"; directory: string; agents: Agent[]; selected: string[] }
  | { kind: "ORDER_BUILD"; selected: string[]; order: string[] }
  | { kind: "PREVIEW"; config: WorkflowConfig }
  | { kind: "EXECUTE"; config: WorkflowConfig }
  | { kind: "COMPLETE"; config: WorkflowConfig; artifacts: string[] }
  | { kind: "ERROR"; message: string; detail?: unknown; from?: string };

export type Event =
  | { type: "START" }
  | { type: "NEXT" } | { type: "BACK" }
  | { type: "SELECT_DIR"; directory: string }
  | { type: "INPUT_NAME"; name: string }
  | { type: "SET_PURPOSE"; purpose: string }
  | { type: "TOGGLE_AGENT"; id: string }
  | { type: "APPEND_ORDER"; id: string } | { type: "REMOVE_ORDER"; id: string }
  | { type: "CONFIRM_PREVIEW" }
  | { type: "EXECUTION_DONE"; artifacts: string[] }
  | { type: "EXECUTION_FAIL"; message: string; detail?: unknown }
  | { type: "RETRY"; to?: State["kind"] }
  | { type: "CANCEL" };
```

### 14.3 ストア/リデューサ

```typescript
// src/models/store.ts
export function reducer(state: State, event: Event): State {
  switch (state.kind) {
    case "WELCOME":
      if (event.type === "START" || event.type === "NEXT") return { kind: "ENV_CHECK" };
      break;
    case "DIRECTORY_SELECT":
      if (event.type === "SELECT_DIR") return { ...state, directory: event.directory };
      if (event.type === "NEXT" && state.directory)
        return { kind: "WORKFLOW_NAME" };
      break;
    // …他ステートも同様に分岐
  }
  return state;
}
```

## 15. CLI フラグと非対話モード

### 15.1 フラグ仕様

- `--directory, -d <name>`: `spec`/`utility`/`all`
- `--name, -n <workflow>`: ワークフロー名
- `--agents, -a <id,id,...>`: 事前選択するエージェントID群
- `--order, -o <id,id,...>`: 実行順序（省略時は TUI で設定）
- `--purpose, -p <text>`: ワークフロー目的（Phase 2）
- `--non-interactive, -y`: 非対話で確定実行（確認省略）
- `--dry-run`: 生成内容のみ表示、ファイルは書き込まない
- `--debug`: 詳細ログ出力、スクリプト標準出力を転送
- `--lang <ja|en>`: 表示言語強制（未指定時は環境から推定）

優先順位: フラグ > 環境変数 > 設定ファイル > 対話入力 > 既定値

### 15.2 環境変数

- `CC_FLOW_LANG=ja|en`
- `CC_FLOW_DEBUG=1`

### 15.3 設定ファイル

- 位置: `./.claude/cc-flow.config.json` または `./.ccflowrc.json`
- 例:

```jsonc
{
  "directory": "spec",
  "name": "spec-workflow",
  "agents": ["spec-init", "spec-requirements"],
  "order": ["spec-init", "spec-requirements"],
  "purpose": "Create auth system"
}
```

### 15.4 非対話モード契約

- 最低限 `directory` と `order` があれば実行可能
- `--non-interactive` かつ情報不足時はエラーコード 2 で終了（ガイダンス表示）
- `--dry-run` は出力プレビュー後に終了（コード 0）

## 16. エラーハンドリングとエッジケース

### 16.1 エラー分類とコード

- 1: 予期せぬ内部エラー（未捕捉例外）
- 2: 入力/設定不足（非対話モード）
- 3: 環境不備（必須ディレクトリ/依存欠如）
- 4: スクリプト失敗（`create-workflow.sh` 非ゼロ終了）
- 5: I/O 失敗（書き込み/権限/パス不正）
- 130: ユーザー中断（`CANCEL`）

### 16.2 主なエッジケース

- エージェント0件: `AGENT_SELECT` で警告→`DIRECTORY_SELECT` に戻す
- 重複名: 既存 `.claude/commands/<name>.md` がある場合は別名提案
- 非TTY: 自動で非対話モードに切替、情報不足なら終了コード2
- Windows/Git Bash: パス区切りを正規化、`sh` 前提コマンドは明示
- Node 版本違い: `engines` に従い警告表示（継続は可）
- スクリプト経路: `cwd` をプロジェクトルートに固定、相対コマンドを許容

## 17. ロギング/デバッグ

- 出力先: `./.claude/logs/cc-flow-cli.log`
- ログレベル: `info`/`warn`/`error`、`--debug` で `debug` 有効
- スクリプト実行の標準出力/標準エラーを行単位で転送
- 構造化ログ（JSON Lines）で時刻/phase/step/elapsed を記録
- 機密の打鍵入力はマスク（将来の認証機能に備え）

```typescript
// src/utils/logger.ts
export const logger = {
  info: (...a: unknown[]) => write("info", a),
  warn: (...a: unknown[]) => write("warn", a),
  error: (...a: unknown[]) => write("error", a),
  debug: (...a: unknown[]) => process.env.CC_FLOW_DEBUG ? write("debug", a) : undefined,
};
```

## 18. i18n とアクセシビリティ

### 18.1 i18n

- リソース: `src/i18n/{ja,en}.ts` にキー/文言を定義
- 画面側はキー参照のみ（直書き禁止）
- 言語切替は `--lang`/環境変数/OS ロケール

```typescript
export const ja = {
  welcome_start: "Enter で開始、q で終了",
  next: "次へ進む",
  back: "戻る",
  // ...
} as const;
```

### 18.2 アクセシビリティ

- すべての操作はキーボードのみで可能
- 色依存を避け、記号/文字で状態を表現（[✓]/[ ]）
- 低コントラスト回避の配色（WCAG 準拠近似）
- スクリーンリーダ配慮：選択中の説明文を逐次読み上げ（将来）
- 非TTY時の代替出力（テキスト指示）

## 19. テスト戦略

- ユニット: パーサ/整形/ソート/検証（Vitest）
- モック統合: `child_process.execSync` をモックしスクリプト失敗を再現
- スナップショット: プレビュー出力（`--dry-run`）の文言を固定
- 疑似E2E: `node-pty` でプロンプト選択を自動化（CI 任意）
- フィクスチャ: `.claude/agents` の最小構成を用意

## 20. ビルド/配布

- TypeScript → `tsc` で `dist/` 生成（ESM/CJS どちらかに統一）
- `bin/cc-flow.js` は shebang + `dist/cli/main.js` 呼び出し
- CI: Node 18/20 で lint/test/build、`npm publish --provenance`
- 互換: macOS/Linux/WSL、Windows (Git Bash) をサポート
- `npx @hiraoku/cc-flow-cli@latest` でのスモークテスト項目整備

## 21. 既存スクリプトとの契約詳細

- 呼出: `./scripts/create-workflow.sh <targetPath> <orderCSV>`
- 期待成果物: `.claude/commands/<name>.md` の生成
- 正常時: 終了コード 0、TUI 側は成功画面に遷移
- 失敗時: 非ゼロ終了→ログに標準エラーを保存→`ERROR` へ遷移
- 追加提案: スクリプト側で `--dry-run` 対応（将来）

## 22. メインフロー骨子（擬似コード）

```typescript
// src/cli/main.ts
async function run() {
  const args = parseArgs(process.argv.slice(2));
  const ctx = await bootstrapContext(args); // env/i18n/logger

  if (args.nonInteractive) {
    const config = resolveConfigFromArgs(args);
    validateNonInteractive(config); // 足りなければ throw(code=2)
    return args.dryRun ? preview(config) : execute(config);
  }

  // Interactive TUI
  await showWelcome(ctx);
  const env = await checkEnv(ctx);
  const dir = await pickDirectory(ctx, env);
  const name = await inputWorkflowName(ctx, dir);
  const purpose = await maybeInputPurpose(ctx);
  const agents = await selectAgents(ctx, dir);
  const order = await buildOrder(ctx, agents);
  const config = composeConfig({ dir, name, purpose, agents, order });
  await previewScreen(ctx, config);
  await execute(config);
  await completeScreen(ctx, config);
}
```

## 23. オープンクエスチョン

- 目的入力 `PURPOSE_INPUT` を Phase 1 に含めるべきか
- `all` 選択時の既定順序の定義方法（アルファベット順/推奨順）
- `.claude/logs` の規模上限とローテーション戦略
- i18n 文言の保守（翻訳フロー/責任分担）
- Windows ネイティブ `cmd.exe` への対応範囲

## 24. 実装タスク一覧（WBS）

- モデル定義: `Agent`, `WorkflowConfig`, `State`, `Event`
- サービス: `AgentDiscovery`, `EnvironmentChecker`, `ScriptExecutor`
- 画面: `Welcome → Complete` の各スクリーン雛形
- i18n: `ja/en` リソース追加、切替ユーティリティ
- CLI/引数: `parseArgs`, 非対話モードの検証/実行
- ログ: `logger` 実装と `.claude/logs` 出力
- テスト: ユニット/モック統合/スナップショット
- CI: ビルド/テスト/リリースのワークフロー
