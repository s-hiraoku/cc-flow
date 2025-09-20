# 推奨 React Ink エコシステムパッケージ

React Ink 6.3.0 用の推奨パッケージリストです。これらのパッケージを追加することで、より豊富なUIコンポーネントが利用できます。

## 必須パッケージ（既にインストール済み）

- `ink@^6.3.0` - React Ink コアライブラリ
- `ink-big-text@^2.0.0` - 大きなテキスト表示
- `ink-gradient@^3.0.0` - グラデーション効果
- `ink-select-input@^6.2.0` - 選択メニュー
- `ink-spinner@^5.0.0` - スピナー・ローディング
- `ink-text-input@^6.0.0` - テキスト入力

## 追加推奨パッケージ

### レイアウト・UI強化
```bash
npm install --save \
  ink-table@^3.0.0 \
  ink-box@^1.0.0 \
  ink-divider@^3.0.0 \
  ink-link@^3.0.0 \
  ink-progress-bar@^3.0.0
```

### インタラクティブ要素
```bash
npm install --save \
  ink-multi-select@^2.0.0 \
  ink-confirm-input@^3.0.0 \
  ink-password-input@^5.0.0 \
  ink-scroll-indicator@^3.0.0
```

### 高度な機能
```bash
npm install --save \
  ink-markdown@^1.0.0 \
  ink-image@^2.0.0 \
  ink-syntax-highlight@^1.0.0 \
  ink-quicksearch@^2.0.0
```

### テスティング
```bash
npm install --save-dev \
  ink-testing-library@^3.0.0
```

## パッケージ説明

### ink-table
- 表形式データの表示
- カラムソート、フィルタリング機能
- レスポンシブデザイン対応

### ink-multi-select
- 複数選択可能なメニュー
- チェックボックス風の選択
- 現在のAgentSelectionScreenの置き換えに最適

### ink-confirm-input
- Yes/No確認ダイアログ
- カスタマイズ可能な確認メッセージ

### ink-progress-bar
- プログレスバー表示
- パーセンテージ、推定残り時間表示

### ink-quicksearch
- リアルタイム検索・フィルタリング
- 大量のデータから素早く選択

### ink-markdown
- Markdownファイルの表示
- ヘルプドキュメント表示に最適

## 実装例

### テーブル表示
```tsx
import Table from 'ink-table';

const data = [
  { name: 'spec-init', description: 'プロジェクト仕様の初期化', status: '✅' },
  { name: 'spec-requirements', description: '要件定義と分析', status: '⏳' },
];

<Table data={data} />
```

### プログレスバー
```tsx
import ProgressBar from 'ink-progress-bar';

<ProgressBar 
  percent={0.6} 
  left="Processing..." 
  right="60%" 
/>
```

### 確認ダイアログ
```tsx
import ConfirmInput from 'ink-confirm-input';

<ConfirmInput
  message="ワークフローを実行しますか？"
  onSubmit={handleConfirm}
/>
```

## 使用上の注意

1. **依存関係の競合**: 各パッケージがReact Inkの特定バージョンに依存している場合があります
2. **パフォーマンス**: 大量のパッケージ追加はバンドルサイズに影響します
3. **メンテナンス**: 各パッケージの最新状況を定期的にチェックしてください

## 代替実装との比較

現在のカスタム実装vs推奨パッケージ：

| 機能 | 現在の実装 | 推奨パッケージ | 利点 |
|------|------------|----------------|------|
| 選択メニュー | ink-select-input | ink-multi-select | 複数選択、カスタマイズ性 |
| チェックボックス | カスタム | ink-multi-select | 標準化、メンテナンス |
| プログレス | なし | ink-progress-bar | ユーザビリティ向上 |
| テーブル | カスタム | ink-table | ソート、フィルタ機能 |

推奨: 段階的に標準パッケージに移行することで、保守性とユーザビリティを向上させる。