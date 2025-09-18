# React Ink 6.3.0 改善マイグレーションガイド

このガイドでは、CC-Flow CLIのReact Ink実装を最新のベストプラクティスに基づいて改善する手順を説明します。

## 📋 改善概要

### 主な改善点

1. **統一されたテーマシステム** - 色、スペーシング、レイアウトの一元管理
2. **モダンなコンポーネント設計** - 再利用可能で保守性の高いコンポーネント
3. **React Ink 6.3.0最新機能活用** - Spacer, Static, Transform等の組み込みコンポーネント
4. **改善されたフォーカス管理** - useFocus, useFocusManagerの適切な活用
5. **レスポンシブデザイン** - ターミナルサイズに応じた適応的レイアウト

### Before/After比較

| 項目 | 改善前 | 改善後 |
|------|--------|--------|
| テーマ管理 | ハードコード | ThemeProvider + useTheme |
| レイアウト | カスタムFrame | Container + Card + Section |
| フォーカス管理 | 手動実装 | useFocus + FocusableMenu |
| コンポーネント | monolithic | 再利用可能なコンポーネント |
| 既存Inkコンポーネント | 限定的活用 | Spacer, Static, Transform活用 |

## 🚀 ステップバイステップ移行

### Phase 1: 基盤コンポーネント導入

1. **テーマシステム導入**
```bash
# 新しいテーマファイル作成
mkdir -p src/ink/themes
# theme.ts を作成 (提供済み)
```

2. **レイアウトコンポーネント導入**
```bash
# レイアウトコンポーネント作成
mkdir -p src/ink/components
# Layout.tsx を作成 (提供済み)
```

3. **インタラクティブコンポーネント導入**
```bash
# Interactive.tsx を作成 (提供済み)
```

### Phase 2: 画面個別の移行

#### 1. WelcomeScreen
```diff
- import SelectInput from 'ink-select-input';
- import { Frame, ContentLine } from '../components/Frame.js';
+ import { Container, Card, Section, Flex } from '../components/Layout.js';
+ import { FocusableMenu, StatusBar } from '../components/Interactive.js';
+ import { ThemeProvider } from '../themes/theme.js';
+ import BigText from 'ink-big-text';
+ import Gradient from 'ink-gradient';
```

#### 2. MenuScreen
```diff
- <Frame title="メインメニュー" icon="🎯">
+ <Card title="CC-Flow メインメニュー" icon="🎯" variant="primary">
```

#### 3. DirectoryScreen & AgentSelectionScreen
```diff
- 手動のキーボード処理
+ FocusableMenu / CheckboxList コンポーネント使用
```

### Phase 3: 既存コンポーネントの置き換え

#### Frame.tsx → Layout.tsxへの移行

**旧実装 (Frame.tsx):**
```tsx
<Frame title="タイトル" icon="🎯">
  <ContentLine align="center">
    <Text>コンテンツ</Text>
  </ContentLine>
</Frame>
```

**新実装 (Layout.tsx):**
```tsx
<Container centered>
  <Card title="タイトル" icon="🎯" variant="primary">
    <Section spacing="sm">
      <Flex direction="column" align="center">
        <Text>コンテンツ</Text>
      </Flex>
    </Section>
  </Card>
</Container>
```

#### SelectInput → FocusableMenuへの移行

**旧実装:**
```tsx
<SelectInput 
  items={items} 
  onSelect={handleSelect}
  indicatorComponent={CustomIndicator}
  itemComponent={CustomItem}
/>
```

**新実装:**
```tsx
<FocusableMenu
  items={menuItems}
  onSelect={handleSelect}
  showDescription={true}
  focusId="menu-id"
/>
```

## 🎨 新機能の活用

### 1. React Ink 6.3.0 組み込みコンポーネント

#### Spacer - 動的なスペーシング
```tsx
// 垂直スペース
<Box flexDirection="column">
  <Text>上部コンテンツ</Text>
  <Spacer />
  <Text>下部コンテンツ</Text>
</Box>

// 水平スペース
<Box>
  <Text>左</Text>
  <Spacer />
  <Text>右</Text>
</Box>
```

#### Static - 静的コンテンツ表示
```tsx
<Static items={logEntries}>
  {(entry, index) => (
    <Box key={index}>
      <Text color="green">✔ {entry.message}</Text>
    </Box>
  )}
</Static>
```

#### Transform - コンテンツ変換
```tsx
<Transform transform={output => output.toUpperCase()}>
  <Text>this will be uppercase</Text>
</Transform>
```

### 2. テーマシステムの活用

```tsx
const MyComponent: React.FC = () => {
  const theme = useTheme();
  
  return (
    <Box borderColor={theme.colors.primary} padding={theme.spacing.md}>
      <Text color={theme.colors.text.primary}>
        テーマに基づくスタイリング
      </Text>
    </Box>
  );
};
```

### 3. フォーカス管理

```tsx
const FocusComponent: React.FC = () => {
  const { isFocused } = useFocus({ id: 'my-component' });
  const { focusNext, focusPrevious } = useFocusManager();
  
  useInput((input, key) => {
    if (!isFocused) return;
    
    if (key.tab) focusNext();
    if (key.shift && key.tab) focusPrevious();
  });
  
  return (
    <Text color={isFocused ? 'cyan' : 'white'}>
      フォーカス可能コンポーネント
    </Text>
  );
};
```

## 📦 推奨パッケージ追加

### 必須追加パッケージ
```bash
npm install --save \
  ink-table@^3.0.0 \
  ink-multi-select@^2.0.0 \
  ink-progress-bar@^3.0.0 \
  ink-confirm-input@^3.0.0
```

### オプション追加パッケージ
```bash
npm install --save \
  ink-markdown@^1.0.0 \
  ink-quicksearch@^2.0.0 \
  ink-divider@^3.0.0
```

## 🔧 マイグレーション後の利点

### 1. 保守性の向上
- **統一されたスタイリング**: テーマシステムにより一元管理
- **再利用可能なコンポーネント**: DRY原則の遵守
- **標準化された相互作用**: 一貫したUX

### 2. 開発効率の向上
- **型安全性**: TypeScriptによる強い型付け
- **コンポーネント設計**: プロップスによる柔軟性
- **デバッグの容易さ**: 明確な責任分割

### 3. ユーザーエクスペリエンスの向上
- **レスポンシブデザイン**: ターミナルサイズ対応
- **一貫したナビゲーション**: 統一されたキーボード操作
- **視覚的な改善**: Gradient, BigText等のエフェクト

### 4. React Ink最新機能活用
- **パフォーマンス**: 最適化されたレンダリング
- **アクセシビリティ**: スクリーンリーダー対応
- **拡張性**: エコシステムパッケージとの連携

## 🧪 テスト戦略

### 1. コンポーネントテスト
```tsx
import { render } from 'ink-testing-library';
import { MenuScreen } from './MenuScreen';

test('MenuScreen renders correctly', () => {
  const { lastFrame } = render(
    <MenuScreen onSelect={jest.fn()} />
  );
  
  expect(lastFrame()).toContain('CC-Flow メインメニュー');
});
```

### 2. インタラクションテスト
```tsx
import { render } from 'ink-testing-library';
import { FocusableMenu } from './Interactive';

test('FocusableMenu handles keyboard input', () => {
  const onSelect = jest.fn();
  const { stdin } = render(
    <FocusableMenu items={testItems} onSelect={onSelect} />
  );
  
  stdin.write('\r'); // Enter key
  expect(onSelect).toHaveBeenCalled();
});
```

## 📝 移行チェックリスト

- [ ] テーマシステム導入
- [ ] レイアウトコンポーネント作成
- [ ] インタラクティブコンポーネント作成
- [ ] WelcomeScreen移行
- [ ] MenuScreen移行
- [ ] DirectoryScreen移行
- [ ] AgentSelectionScreen移行
- [ ] 既存Frame.tsxの段階的廃止
- [ ] 推奨パッケージ追加
- [ ] テスト実装
- [ ] ドキュメント更新

## 🚨 注意事項

1. **段階的移行**: 一度にすべて変更せず、画面単位で移行
2. **テスト**: 各移行ステップでテストを実行
3. **フォールバック**: 古いコンポーネントは移行完了まで保持
4. **依存関係**: 新パッケージの互換性を確認
5. **パフォーマンス**: 新コンポーネントのレンダリング速度を監視

## 📚 追加リソース

- [React Ink公式ドキュメント](https://github.com/vadimdemedes/ink)
- [React Ink エコシステム](https://github.com/vadimdemedes/ink#useful-components)
- [TypeScript + React Ink ベストプラクティス](https://github.com/vadimdemedes/ink/tree/master/examples)

この移行ガイドに従って実装することで、モダンで保守性の高いReact Ink アプリケーションに改善できます。