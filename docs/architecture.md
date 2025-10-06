# CC-Flow アーキテクチャ

## 概要

CC-Flowは、Claude Codeのワークフロー作成を支援するツール群です。
コアロジックと複数のインターフェースで構成されています。

## アーキテクチャ設計

```
┌─────────────────────────────────────┐
│         CC-Flow Core                │
│  (scripts/ → cc-flow-core/)        │
│                                     │
│  - ワークフロー生成ロジック          │
│  - テンプレート管理                 │
│  - POML処理                        │
│  - 共通スクリプト                   │
└─────────────────────────────────────┘
              ↑          ↑
              │          │
     ┌────────┴──┐  ┌───┴─────────┐
     │           │  │             │
┌────┴────┐ ┌───┴──────┐ ┌──────┴─────┐
│ CLI     │ │   Web    │ │  Future    │
│         │ │          │ │  (VSCode?) │
│ TUI     │ │  Next.js │ │            │
│ Wrapper │ │  GUI     │ │            │
└─────────┘ └──────────┘ └────────────┘
```

## コアの責務

### CC-Flow Core (`scripts/` → `cc-flow-core/`)

**唯一の真実の源（Single Source of Truth）**

- ワークフロー生成の全ロジック
- テンプレート（workflow.md, workflow.poml, partials）
- POML → Markdown 変換
- エージェント検出・変換
- 共通ユーティリティ

**コアを改善 = 全インターフェースが改善される**

### インターフェース層の責務

各インターフェースは**薄いラッパー**に過ぎない：

#### cc-flow-cli
- Inquirer.js ベースの TUI
- ユーザー入力の収集
- コアスクリプトの呼び出し
- 結果の表示

#### cc-flow-web
- Next.js ベースの Web GUI
- ビジュアルエディタ
- コアスクリプトの呼び出し（API経由）
- 結果の表示

#### 将来の拡張
- VSCode 拡張
- GitHub Actions
- その他任意のインターフェース

## 設計原則

### 1. 関心の分離
- **コア**: ビジネスロジック
- **インターフェース**: UI/UX のみ

### 2. 単一責任
- コアはワークフロー生成のみに集中
- インターフェースはユーザー体験のみに集中

### 3. 拡張性
- 新しいインターフェースの追加が容易
- コアの改善が全てに波及

## 依存関係

```json
// cc-flow-core/package.json
{
  "name": "@hiraoku/cc-flow-core",
  "bin": {
    "cc-flow-create-workflow": "./bin/create-workflow.sh"
  }
}

// cc-flow-cli/package.json
{
  "dependencies": {
    "@hiraoku/cc-flow-core": "^1.0.0"
  }
}

// cc-flow-web/package.json
{
  "dependencies": {
    "@hiraoku/cc-flow-core": "^1.0.0"
  }
}
```

## リファクタリング計画

### Phase 1: コアパッケージ作成
1. `scripts/` を `cc-flow-core/` に rename
2. package.json を作成
3. bin スクリプトを export

### Phase 2: CLI 移行
1. cc-flow-cli から重複コードを削除
2. @hiraoku/cc-flow-core を依存関係に追加
3. コアスクリプトを呼び出すように修正

### Phase 3: Web 移行
1. cc-flow-web から重複コードを削除
2. @hiraoku/cc-flow-core を依存関係に追加
3. API ルートでコアスクリプトを呼び出し

### Phase 4: 公開
1. cc-flow-core を npm に公開
2. cli と web を更新して公開

## メリット

✅ **保守性**: コードの重複ゼロ
✅ **一貫性**: 全インターフェースで同じロジック
✅ **拡張性**: 新規インターフェースの追加が容易
✅ **テスト**: コアのテストで全体をカバー
✅ **バージョン管理**: セマンティックバージョニングが明確

## 現在の課題と解決策

### 課題
- スクリプトとテンプレートが複数箇所にコピーされている
- 同じロジックの変更を複数箇所で行う必要がある
- 依存関係が不明確

### 解決策
コアパッケージ化により：
- 単一のソースコード
- npm による明確な依存関係
- セマンティックバージョニング

## 次のステップ

1. [ ] `scripts/` を `cc-flow-core/` に rename
2. [ ] cc-flow-core の package.json 作成
3. [ ] cc-flow-cli のリファクタリング
4. [ ] cc-flow-web のリファクタリング
5. [ ] テストとドキュメント
6. [ ] npm 公開
