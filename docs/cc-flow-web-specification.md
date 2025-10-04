# CC-Flow Web エディタ仕様書

## 概要

CC-Flow Webは、CC-Flowワークフローを視覚的に作成・編集するためのWebベースのビジュアルエディタです。ReactFlowをベースとしたドラッグ&ドロップインターフェースを提供し、直感的なワークフロー設計を可能にします。

**バージョン**: 0.0.1
**リリース日**: 2025年
**開発フレームワーク**: Next.js 15 + React 19 + TypeScript 5

## アーキテクチャ

### 技術スタック

- **Frontend Framework**: Next.js 15 (App Router)
- **Visual Editor**: ReactFlow (XyFlow) v12.8.5
- **UI Components**: shadcn/ui + Radix UI + Tailwind CSS v4
- **Type System**: TypeScript 5
- **State Management**: React 19 hooks + Custom hooks
- **Testing**: Vitest + Testing Library + MSW
- **Form Validation**: React Hook Form + Valibot

### プロジェクト構成

```
cc-flow-web/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── page.tsx               # ランディングページ
│   │   ├── editor/page.tsx        # エディタページ
│   │   └── api/                   # API Routes
│   ├── components/
│   │   ├── workflow-editor/       # ワークフローエディタコア
│   │   │   ├── Canvas.tsx         # ReactFlowキャンバス
│   │   │   ├── nodes/             # カスタムノード定義
│   │   │   └── edges/             # カスタムエッジ定義
│   │   ├── panels/                # UIパネル
│   │   │   ├── AgentPalette/      # エージェントパレット
│   │   │   └── PropertiesPanel/   # プロパティパネル
│   │   ├── editor/                # エディタUI
│   │   │   ├── EditorToolbar.tsx  # ツールバー
│   │   │   └── EditorNotificationArea.tsx
│   │   ├── ui/                    # shadcn/ui コンポーネント
│   │   └── common/                # 共通コンポーネント
│   ├── hooks/                     # カスタムReact Hooks
│   │   ├── useWorkflowEditor.ts   # エディタ状態管理
│   │   ├── useAgents.ts           # エージェント管理
│   │   ├── useWorkflowGenerate.ts # ワークフロー生成
│   │   ├── useWorkflowSave.ts     # 保存機能
│   │   └── useWorkflowRestore.ts  # 復元機能
│   ├── services/                  # ビジネスロジック
│   │   ├── WorkflowService.ts     # ワークフロー処理
│   │   └── AgentService.ts        # エージェント処理
│   ├── types/                     # TypeScript型定義
│   │   ├── workflow.ts            # ワークフロー型
│   │   └── agent.ts               # エージェント型
│   └── utils/                     # ユーティリティ
├── public/                        # 静的アセット
├── bin/                          # CLIエントリーポイント
└── docs/                         # ドキュメント
```

## 主要機能

### 1. ビジュアルワークフローエディタ

#### キャンバス (Canvas)
- **ReactFlowベース**: ノードとエッジのビジュアル編集
- **ドラッグ&ドロップ**: Agent Paletteからキャンバスへのドラッグ
- **ズーム・パン**: マウス/タッチ操作でのナビゲーション
- **ノード選択**: 単一/複数選択対応
- **接続管理**: ノード間の接続作成・削除

#### ノードタイプ
1. **Start Node**: ワークフローの開始点
   - Workflow Name設定
   - Workflow Purpose設定
   - バリデーション: 必須フィールドチェック

2. **Agent Node**: 個別エージェント
   - Agent Name表示
   - Category表示
   - Description表示

3. **Step Group Node**: エージェントグループ
   - Title設定
   - Mode選択 (sequential/parallel)
   - Purpose設定
   - Agents配列管理
   - バリデーション: 必須フィールドチェック

4. **End Node**: ワークフローの終了点
   - 固定ラベル "End"

### 2. Agent Palette (エージェントパレット)

#### 機能
- **エージェント一覧表示**: カテゴリ別にグループ化
- **検索機能**: エージェント名・説明での絞り込み
- **カテゴリフィルタ**: 特定カテゴリの表示/非表示
- **ドラッグ開始**: エージェントをキャンバスにドラッグ

#### UI要素
- **カテゴリ別アコーディオン**: 折りたたみ可能なセクション
- **エージェントカード**: ホバーで拡大アニメーション
- **検索バー**: リアルタイム検索
- **統計表示**: 利用可能なエージェント数

#### レイアウト改善
- **スクロール領域**: `py-6`で上下パディング追加
- **カードアニメーション**: `scale(1.05)`でホバー時に拡大
- **切り取り防止**: 上側の余白確保

### 3. Properties Panel (プロパティパネル)

#### セクション構成

1. **Settings Section** (設定セクション)
   - 選択ノード情報表示
   - ノード固有の設定フォーム
   - バリデーションエラー表示
   - アイコン: Users, Settings2

2. **Workflow Stats** (ワークフロー統計)
   - **Start/End Node**: 設定状態表示
     - Start node: PlayCircleアイコン
     - End node: Flagアイコン

   - **Quantitative Stats**: 2x2グリッドレイアウト
     - Row 1:
       - Nodes: 総ノード数 (Layersアイコン, indigo)
       - Connections: 総エッジ数 (GitBranchアイコン, sky)
     - Row 2:
       - Agents: 総エージェント数 (Usersアイコン, purple)
         - Agent Nodeのカウント
         - Step Group内のAgentsもカウント
       - Step Groups: Step Groupノード数 (Layersアイコン, emerald)

3. **JSON Preview Section** (JSONプレビュー)
   - **create-workflow.sh input**: CLI入力用JSON
   - **Serialized workflow payload**: 内部処理用JSON
   - エラー表示: バリデーション失敗時

#### UI/UX改善
- **折りたたみ機能**: パネルの開閉
- **アイコン配置**: 各セクションにアイコン追加
- **間隔調整**: `gap-3`で適切なスペーシング
- **選択情報**: アイコンとテキストを垂直中央揃え

### 4. Editor Toolbar (エディタツールバー)

#### ボタン構成
1. **戻るボタン**: トップページへ遷移 (ArrowLeftアイコン)
2. **Restoreボタン**: JSONファイルからワークフロー復元 (Uploadアイコン)
3. **Saveボタン**: ワークフローをJSONで保存 (Downloadアイコン)
4. **Generate workflowボタン**: CLI実行用コマンド生成 (PlayCircleアイコン)

#### 状態管理
- **canSave**: 保存可能状態の判定
- **generating**: 生成処理中フラグ
- **ボタン無効化**: 条件に応じた無効化

### 5. ワークフロー管理機能

#### 保存機能 (useWorkflowSave)
```typescript
interface WorkflowSaveData {
  workflowName: string;
  workflowPurpose?: string;
  workflowModel?: string;
  workflowArgumentHint?: string;
  workflowSteps: WorkflowStep[];
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}
```
- JSON形式でダウンロード
- ファイル名: `{workflowName}.json`
- 完全なワークフロー状態を保存

#### 復元機能 (useWorkflowRestore)
- ファイルピッカーでJSON選択
- メタデータ抽出
- ノード・エッジの復元
  - 保存されている場合: そのまま使用
  - ない場合: workflowStepsから再構築
- エラーハンドリング

#### 生成機能 (useWorkflowGenerate)
- バリデーション実行
- CLI実行用コマンド生成
- 進行状況表示
- エラー通知

### 6. 通知システム (EditorNotificationArea)

#### 通知タイプ
1. **生成中**: 進行状況表示
2. **エラー**: バリデーションエラー表示
3. **成功**: 自動非表示 (5秒後にフェードアウト)

#### アニメーション
- `useAutoHideMessage`: 自動非表示ロジック
- フェードアウトアニメーション

### 7. コマンドコンバーター (Command Converter)

#### 機能概要
- スラッシュコマンドをCC-Flowエージェントに変換
- `.claude/commands/` 配下のディレクトリを選択
- `convert-slash-commands.sh` スクリプトを実行

#### UI構成

1. **ディレクトリ選択**
   - ドロップダウンメニュー
   - 利用可能なコマンドディレクトリ一覧
   - `.claude/commands/` から自動検出

2. **アクションボタン**
   - **Preview (Dry Run)**: 変換プレビュー (実行なし)
   - **Convert to Agents**: 実際の変換実行

3. **結果表示**
   - 成功メッセージ (CheckCircle アイコン)
   - 出力ログ (pre 要素)
   - 警告メッセージ (あれば)
   - エラーメッセージ (AlertCircle アイコン)

#### API統合

**エンドポイント**:
- `GET /api/commands`: コマンドディレクトリ一覧取得
- `POST /api/commands/convert`: 変換実行

**リクエスト形式**:
```json
{
  "directory": "utility",
  "dryRun": false
}
```

**レスポンス形式**:
```json
{
  "success": true,
  "output": "変換結果のログ",
  "error": "警告メッセージ (あれば)",
  "dryRun": false
}
```

#### カスタムフック

1. **useCommandDirectories**
   - コマンドディレクトリ一覧取得
   - ローディング状態管理
   - エラーハンドリング

2. **useCommandConversion**
   - 変換処理実行
   - 結果・エラー状態管理
   - プログレス表示

#### 使用方法

1. Converterページにアクセス (`/converter`)
2. ディレクトリを選択
3. Preview (Dry Run) で確認 (オプション)
4. Convert to Agents で変換実行
5. 変換されたエージェントは `.claude/agents/` に保存

## データフロー

### 1. ワークフロー編集フロー

```
User Action (Canvas)
  ↓
handleNodesChange / handleEdgesChange
  ↓
useWorkflowEditor (State Update)
  ↓
PropertiesPanel (Display Update)
  ↓
JSON Preview (Auto Generation)
```

### 2. エージェント追加フロー

```
Agent Palette (Drag Start)
  ↓
Canvas (Drop Event)
  ↓
Create New Node
  ↓
Update Nodes State
  ↓
Re-render Canvas
```

### 3. 保存・復元フロー

```
Save:
  EditorToolbar (Save Button)
    ↓
  useWorkflowSave
    ↓
  Generate JSON
    ↓
  Download File

Restore:
  EditorToolbar (Restore Button)
    ↓
  File Picker
    ↓
  useWorkflowRestore
    ↓
  Parse JSON
    ↓
  Update Editor State
```

## バリデーション

### ノードバリデーション

#### Start Node
- `workflowName`: 必須
- `workflowPurpose`: 任意

#### Agent Node
- バリデーションなし (読み取り専用)

#### Step Group Node
- `title`: 必須
- `mode`: 必須 (sequential/parallel)
- `purpose`: 任意
- `agents`: 必須、1つ以上

#### End Node
- バリデーションなし

### ワークフローバリデーション
- Start Nodeの存在チェック
- End Nodeの存在チェック
- エッジの接続整合性チェック
- 循環参照チェック

### エラー表示
- **ノードレベル**: `hasError`フラグで視覚的表示
- **パネルレベル**: "Needs attention"バッジ表示
- **JSON Preview**: エラーメッセージ表示

## アクセシビリティ

### キーボードナビゲーション
- Tab: フォーカス移動
- Shift+Tab: 逆方向フォーカス移動
- Enter/Space: アクション実行
- Escape: モーダル/ドロップダウンを閉じる

### スクリーンリーダー対応
- `aria-label`: 明示的なラベル
- `aria-hidden`: 装飾要素の非表示化
- `sr-only`: 視覚的に非表示、スクリーンリーダーに表示

### コントラスト
- WCAG AA準拠
- ハイコントラストモード対応

### モーション
- `prefers-reduced-motion`対応
- アニメーション無効化オプション

## パフォーマンス最適化

### React最適化
- `useMemo`: 高コスト計算のメモ化
- `useCallback`: 関数メモ化
- `React.memo`: コンポーネントメモ化

### ReactFlow最適化
- ノード/エッジの仮想化
- 部分レンダリング
- パフォーマンスモニタリング

## CLI統合

### 起動方法
```bash
# グローバルインストール
npm install -g @hiraoku/cc-flow-web
cc-flow-web

# ローカル実行
npx @hiraoku/cc-flow-web
```

### CLIオプション
- `-p, --port <port>`: ポート指定 (default: 3000)
- `--no-open`: ブラウザ自動起動無効化
- `-h, --help`: ヘルプ表示
- `-V, --version`: バージョン表示

### ディレクトリ構造要件
```
.claude/
├── agents/          # エージェント定義
│   ├── spec/
│   ├── utility/
│   └── ...
└── commands/        # スラッシュコマンド
```

## JSON出力形式

### create-workflow.sh input
```json
{
  "workflowName": "example-workflow",
  "workflowPurpose": "Example purpose",
  "workflowModel": "claude-3-5-sonnet",
  "workflowArgumentHint": "<context>",
  "workflowSteps": [
    {
      "title": "Step 1",
      "mode": "sequential",
      "purpose": "Design phase",
      "agents": ["agent1", "agent2"]
    }
  ]
}
```

### Serialized workflow payload
```json
{
  "workflowName": "example-workflow",
  "workflowPurpose": "Example purpose",
  "workflowSteps": [...],
  "nodes": [...],
  "edges": [...]
}
```

## ランディングページ

### セクション構成

1. **Hero Section**
   - タイトル: "Design and share CC-Flow workflows without friction"
   - サブタイトル: アクセシビリティと協業の強調
   - CTA: "Launch the editor" / "Browse the docs"
   - 統計カード:
     - Keyboard-first controls
     - 5-minute walkthrough

2. **Features Section**
   - Focus-friendly canvas: キーボードナビゲーション
   - Adaptive theming: ライト/ダーク/ハイコントラスト
   - Workflow transparency: ライブJSON プレビュー
   - Secure hand-off: CLI統合とバリデーション

3. **Editor Tips Section**
   - Keyboard navigation
   - Canvas shortcuts
   - Validation & export
   - Generator

4. **Experience Section**
   - Screen reader-ready
   - Reduced motion aware
   - Accessible contrast

5. **Steps Section**
   - Structure agents visually
   - Audit logic instantly
   - Export with confidence

6. **CTA Section**
   - "Ready to build your next agent workflow?"
   - Start in the editor
   - View the repository

### デザインシステム
- **カラースキーム**: Slate + Indigo + Purple + Sky
- **フォント**: システムフォント (sans-serif)
- **アニメーション**: motion-safe対応
- **グラデーション**: 背景エフェクト

## テスト戦略

### ユニットテスト (Vitest)
- Hooks: useWorkflowEditor, useAgents, etc.
- Services: WorkflowService, AgentService
- Utilities: workflowUtils

### コンポーネントテスト (Testing Library)
- Canvas: ドラッグ&ドロップ
- AgentPalette: 検索、フィルタ
- PropertiesPanel: フォーム入力

### E2Eテスト (Playwright)
- ワークフロー作成フロー
- 保存・復元フロー
- バリデーションフロー

### MSW (Mock Service Worker)
- API モック
- エージェント発見モック

## 今後の拡張

### Phase 2 (計画中)
- テンプレートライブラリ
- ワークフロー共有機能
- バージョン管理
- コラボレーション機能

### Phase 3 (検討中)
- グラフ分析
- 最適化提案
- CI/CD統合
- 外部サービス連携

## 参考資料

### ドキュメント
- [User Guide](./docs/guides/USER_GUIDE.md)
- [Development Guide](./docs/development/DEVELOPMENT_GUIDE.md)
- [Technical Architecture](./docs/architecture/TECHNICAL_ARCHITECTURE.md)
- [Testing Guide](./docs/testing/TESTING_GUIDE.md)

### 外部リンク
- [ReactFlow Documentation](https://reactflow.dev/)
- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**最終更新**: 2025年
**バージョン**: 0.0.1
**メンテナンス**: CC-Flow Development Team
