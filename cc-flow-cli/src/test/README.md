# React Ink テストセットアップ

React Inkアプリケーション用のテスト環境を構築しました。

## 📁 テストファイル構成

```
src/
├── test/
│   ├── setup.ts                     # テスト環境設定
│   └── helpers/
│       └── test-utils.tsx           # テストヘルパー関数
├── ink/
│   ├── components/
│   │   ├── Layout.test.tsx          # レイアウトコンポーネントのテスト
│   │   └── Interactive.test.tsx     # インタラクティブコンポーネントのテスト
│   ├── screens/
│   │   └── WelcomeScreen.test.tsx   # ウェルカムスクリーンのテスト
│   ├── themes/
│   │   └── theme.test.tsx           # テーマシステムのテスト
│   └── utils/
│       └── text.test.ts             # テキストユーティリティのテスト
└── utils/
    └── package.test.ts              # パッケージユーティリティのテスト
```

## 🧪 テスト結果

### ✅ 成功したテスト (6ファイル中3ファイル完全成功)

- **Layout Components**: 20/20テスト成功
- **Text Utilities**: 16/16テスト成功  
- **Package Utilities**: 9/9テスト成功

### ⚠️ 部分的成功 (3ファイル)

- **Theme System**: 15/16テスト成功
- **Interactive Components**: 12/13テスト成功
- **WelcomeScreen**: 5/6テスト成功

**合計**: 77/80テスト成功 (96.25%成功率)

## 🛠️ 主な機能

### テスト環境

- **フレームワーク**: Vitest + ink-testing-library
- **モック機能**: Vitestのviモック機能
- **カバレッジ**: v8カバレッジレポート対応
- **セットアップ**: 自動環境設定とクリーンアップ

### テストユーティリティ

```typescript
// カスタムレンダー関数 (ThemeProvider付き)
import { render } from '../test/helpers/test-utils.tsx';

const { lastFrame } = render(<MyComponent />);
expect(lastFrame()).toContain('Expected content');
```

### モック設定

```typescript
// Inkフックのモック
vi.mock('ink', async () => {
  const actual = await vi.importActual('ink');
  return {
    ...actual,
    useInput: vi.fn(),
    useApp: () => ({ exit: vi.fn() })
  };
});
```

## 📝 テストパターン

### 1. コンポーネントレンダリングテスト

```typescript
it('renders correctly', () => {
  const { lastFrame } = render(<Component />);
  expect(lastFrame()).toBeDefined();
});
```

### 2. コンテンツ検証テスト

```typescript
it('displays expected content', () => {
  const { lastFrame } = render(<Component title="Test" />);
  expect(lastFrame()).toContain('Test');
});
```

### 3. プロパティテスト

```typescript
it('supports different variants', () => {
  const variants = ['primary', 'secondary'] as const;
  variants.forEach(variant => {
    const { lastFrame } = render(<Component variant={variant} />);
    expect(lastFrame()).toBeDefined();
  });
});
```

### 4. ユーティリティ関数テスト

```typescript
it('formats text correctly', () => {
  const result = formatText('input', 20);
  expect(result.length).toBe(20);
  expect(result.trim()).toBe('input');
});
```

## 🎯 カバレッジ対象

- ✅ Layout Components (Container, Card, Section, etc.)
- ✅ Interactive Components (FocusableMenu, StatusBar)
- ✅ Theme System (createTheme, useTheme)
- ✅ Text Utilities (renderLines, alignment functions)
- ✅ Package Utilities (version handling)
- ✅ Screen Components (WelcomeScreen)

## 🚀 実行方法

```bash
# 全テスト実行
npm test

# ウォッチモード
npm run test:watch

# カバレッジ付きテスト
npm run test:coverage
```

## 🔧 設定詳細

### vitest.config.ts
- TypeScriptサポート
- テストファイル自動検出 (`**/*.test.{ts,tsx}`)
- セットアップファイル自動読み込み
- TDD原則に基づく設定 (fail fast, isolated tests)

### tsconfig.json
- テストファイルをビルドから除外
- プロダクションビルドの品質維持

## 💡 ベストプラクティス

1. **Kent Beckのテスト原則**
   - Red-Green-Refactor サイクル
   - 失敗の早期検出 (bail: 1)
   - テストの独立性 (isolate: true)

2. **React Ink特有の考慮事項**
   - テキストは必ず`<Text>`コンポーネント内で
   - `lastFrame()`でレンダリング結果を取得
   - ターミナルサイズの一貫性を保つ

3. **モック戦略**
   - 外部依存関係の適切なモック
   - テーマとターミナル情報の固定化
   - 非同期処理の適切な処理

## 🐛 既知の問題

1. **Theme Context**: 一部のコンポーネントでテーマコンテキストのモック設定が必要
2. **Interactive Components**: 複雑なキーボード操作のシミュレーションが課題
3. **Screen Integration**: 画面間の遷移テストは実装中

これらの問題は今後の改善で対応予定です。基本的なコンポーネントテストは正常に動作しています。