# CC-Flow Web Editor 概要設計書

## 背景と目的

### 現在の課題

- CC-Flow CLI の TUI がワークフロー設定の複雑化に対応できない
- 新しい JSON 形式（workflowModel, workflowArgumentHint 等）への対応が困難
- ステップ定義の構造化（title, mode, purpose, agents）を TUI で入力するのが非現実的
- Sequential/Parallel モードの視覚的理解が困難

### 解決すべき問題

1. **複雑なワークフロー設定の視覚的編集**
2. **直感的なエージェント配置と依存関係設定**
3. **リアルタイムプレビューとバリデーション**
4. **既存 cc-flow-cli とのシームレスな統合**

## システム概要

### アーキテクチャ

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   cc-flow-cli   │───▶│ cc-flow-web     │───▶│  Local Files    │
│     (CLI)       │    │ (Next.js+React) │    │ (.claude/...)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
    WebEditor起動           ブラウザUI            JSON生成・保存
```

### 技術スタック

- **Frontend**: Next.js 15 + TypeScript + ReactFlow
- **Styling**: Tailwind CSS + shadcn/ui
- **Server**: Next.js API Routes (ローカルサーバ)
- **Integration**: cc-flow-cli からの起動・統合

## 機能仕様

### 1. ワークフローエディタ（ReactFlow）

#### 1.1 ノードタイプ

```typescript
interface WorkflowNode {
  id: string;
  type: "agent" | "step-group" | "start" | "end";
  data: {
    // エージェントノード
    agentName?: string;
    agentPath?: string;

    // ステップグループノード
    title?: string;
    mode?: "sequential" | "parallel";
    purpose?: string;
    agents?: string[];

    // 表示用
    label: string;
    description?: string;
  };
  position: { x: number; y: number };
}
```

#### 1.2 エッジ（接続線）

```typescript
interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  type: "default" | "step";
  data?: {
    condition?: string;
  };
}
```

#### 1.3 UI 機能

- **ドラッグ&ドロップ**: エージェントパレットからキャンバスへ
- **ビジュアル接続**: ノード間の依存関係を線で表現
- **グループ化**: Sequential/Parallel ステップのグループ表示
- **リアルタイムプレビュー**: JSON 出力の即座表示

### 2. ワークフロー設定パネル

#### 2.1 メタデータ設定

```typescript
interface WorkflowMetadata {
  workflowName: string; // 必須
  workflowPurpose: string; // 必須
  workflowModel?: string; // オプション（Claude model指定）
  workflowArgumentHint?: string; // オプション（引数ヒント）
}
```

#### 2.2 エージェント設定

- エージェント一覧の表示
- カテゴリ別フィルタリング
- エージェント詳細表示（説明文、tools 等）

#### 2.3 ステップ設定

- Step title, mode, purpose の設定
- エージェント割り当て
- 実行順序の視覚的調整

### 3. API 仕様

#### 3.1 エージェント取得 API

```typescript
// GET /api/agents
interface AgentsResponse {
  categories: {
    [category: string]: {
      path: string;
      agents: {
        name: string;
        path: string;
        description: string;
        metadata?: Record<string, any>;
      }[];
    };
  };
}
```

#### 3.2 ワークフロー保存 API

```typescript
// POST /api/workflow/save
interface SaveWorkflowRequest {
  metadata: WorkflowMetadata;
  steps: WorkflowStep[];
  outputPath?: string; // デフォルト: .claude/commands/
}

interface SaveWorkflowResponse {
  success: boolean;
  filePath: string;
  errors?: string[];
}
```

#### 3.3 バリデーション API

```typescript
// POST /api/workflow/validate
interface ValidateRequest {
  metadata: WorkflowMetadata;
  steps: WorkflowStep[];
}

interface ValidateResponse {
  valid: boolean;
  errors: {
    field: string;
    message: string;
    severity: "error" | "warning";
  }[];
}
```

## データフロー

### 1. エディタ起動フロー

```
cc-flow web
    ↓
Next.jsサーバ起動 (localhost:3000)
    ↓
ブラウザ自動起動
    ↓
エージェント一覧取得 (/api/agents)
    ↓
エディタ画面表示
```

### 2. ワークフロー作成フロー

```
エージェント選択
    ↓
キャンバスに配置（ドラッグ&ドロップ）
    ↓
ノード間接続（依存関係設定）
    ↓
ステップグループ作成
    ↓
メタデータ設定
    ↓
リアルタイムプレビュー
    ↓
バリデーション
    ↓
JSON生成・保存
```

### 3. JSON 変換フロー

```typescript
// ReactFlowデータ → CC-Flow JSON形式
const convertToWorkflowConfig = (
  nodes: Node[],
  edges: Edge[],
  metadata: WorkflowMetadata
): WorkflowConfig => {
  // ノードとエッジからステップ構造を構築
  const steps = buildStepsFromGraph(nodes, edges);

  return {
    ...metadata,
    workflowSteps: steps,
  };
};
```

## ファイル構成

```
cc-flow-web/
├── src/
│   ├── app/                      # App Router (Next.js 13+)
│   │   ├── page.tsx             # ダッシュボード (/)
│   │   ├── editor/
│   │   │   └── page.tsx         # メインエディタ (/editor)
│   │   ├── layout.tsx           # ルートレイアウト
│   │   ├── globals.css          # グローバルスタイル
│   │   └── api/
│   │       ├── agents/
│   │       │   └── route.ts     # エージェント一覧API
│   │       ├── workflow/
│   │       │   ├── save/
│   │       │   │   └── route.ts # ワークフロー保存
│   │       │   └── validate/
│   │       │       └── route.ts # バリデーション
│   │       └── health/
│   │           └── route.ts     # ヘルスチェック
│   ├── components/
│   │   ├── workflow-editor/
│   │   │   ├── Canvas.tsx          # ReactFlowキャンバス
│   │   │   ├── AgentNode.tsx       # エージェントノード
│   │   │   ├── StepGroupNode.tsx   # ステップグループノード
│   │   │   └── ConnectionEdge.tsx  # 接続エッジ
│   │   ├── panels/
│   │   │   ├── AgentPalette.tsx    # エージェントパレット
│   │   │   ├── PropertyPanel.tsx   # プロパティ設定パネル
│   │   │   ├── MetadataPanel.tsx   # ワークフローメタデータ
│   │   │   └── PreviewPanel.tsx    # JSON出力プレビュー
│   │   └── ui/
│   │       ├── Button.tsx          # 基本UIコンポーネント
│   │       ├── Input.tsx
│   │       └── Modal.tsx
│   ├── lib/
│   │   ├── workflow-converter.ts   # ReactFlow ⇔ CC-Flow変換
│   │   ├── agent-discovery.ts      # エージェント検出ロジック
│   │   ├── validation.ts           # バリデーションルール
│   │   └── file-system.ts          # ファイル操作ユーティリティ
│   └── types/
│       ├── workflow.ts             # ワークフロー型定義
│       ├── agent.ts                # エージェント型定義
│       └── api.ts                  # API型定義
├── tailwind.config.ts              # Tailwind設定
├── next.config.mjs                 # Next.js設定
├── tsconfig.json                   # TypeScript設定
└── package.json                    # 依存関係とスクリプト
```

## cc-flow-cli 統合

### 1. 新しいコマンド追加

```typescript
// cc-flow-cli/src/commands/web.ts
export const webCommand: CommandModule = {
  command: "web",
  describe: "Launch web-based workflow editor",
  builder: (yargs) =>
    yargs
      .option("port", {
        type: "number",
        default: 3000,
        describe: "Port number for web server",
      })
      .option("open", {
        type: "boolean",
        default: true,
        describe: "Automatically open browser",
      }),
  handler: async (args) => {
    await launchWebEditor(args.port, args.open);
  },
};
```

### 2. web エディタ起動ロジック

```typescript
// cc-flow-cli/src/services/web-launcher.ts
export async function launchWebEditor(
  port: number = 3000,
  openBrowser: boolean = true
) {
  try {
    // 利用可能ポートを確認
    const availablePort = await getAvailablePort(port);

    // Next.jsサーバ起動
    const webAppPath = path.join(__dirname, "../../cc-flow-web");
    const server = spawn("npm", ["run", "start"], {
      cwd: webAppPath,
      env: { ...process.env, PORT: availablePort.toString() },
      stdio: "pipe",
    });

    // サーバ起動待機
    await waitForServer(`http://localhost:${availablePort}`);

    console.log(`🌐 Web editor started at http://localhost:${availablePort}`);

    // ブラウザ自動起動
    if (openBrowser) {
      await open(`http://localhost:${availablePort}`);
    }

    // Graceful shutdown
    process.on("SIGINT", () => {
      server.kill();
      process.exit(0);
    });
  } catch (error) {
    console.error("Failed to launch web editor:", error);
    process.exit(1);
  }
}
```

## パフォーマンス考慮事項

### 1. 初期ロード最適化

- エージェント一覧の遅延ロード
- React.lazy による画面分割
- Next.js の静的生成活用

### 2. リアルタイム処理

- デバウンス付き JSON 生成（500ms）
- 差分更新によるプレビュー最適化
- Web Workers での重い処理分離

### 3. メモリ管理

- 大きなワークフローでのノード仮想化
- 未使用コンポーネントのアンマウント
- ReactFlow のパフォーマンス最適化設定

## セキュリティ考慮事項

### 1. ローカル環境での実行

- 外部通信なし（完全ローカル）
- ファイルシステムアクセス制限
- CSRF トークン不要（同一オリジン）

### 2. ファイル操作

- パストラバーサル攻撃防止
- 書き込み権限チェック
- ファイル拡張子バリデーション

### 3. 入力値検証

- XSS 攻撃防止
- JSON インジェクション防止
- スキーマベースバリデーション

## 今後の拡張可能性

### 1. 高度な機能

- ワークフロー実行結果の可視化
- エージェント パフォーマンス分析
- デバッグモード（ステップ実行）

### 2. 外部連携

- GitHub Actions 連携
- CI/CD パイプライン統合
- クラウドストレージ同期

### 3. チーム機能

- ワークフロー共有機能
- コメント・レビュー機能
- バージョン管理統合

## 実装スケジュール

### Phase 1: 基本実装（2-3 週間）

- [ ] Next.js プロジェクト構築
- [ ] ReactFlow 基本エディタ
- [ ] エージェント一覧表示
- [ ] 基本的な JSON 出力

### Phase 2: 高度な機能（2-3 週間）

- [ ] ステップグループ機能
- [ ] バリデーション機能
- [ ] プレビュー機能
- [ ] cc-flow-cli 統合

### Phase 3: 最適化・テスト（1-2 週間）

- [ ] パフォーマンス最適化
- [ ] エラーハンドリング強化
- [ ] テスト実装
- [ ] ドキュメント整備

---

この設計書をベースに実装を進め、必要に応じて詳細を調整していきます。
