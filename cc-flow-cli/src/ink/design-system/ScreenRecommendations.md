# CC-Flow TUI Design System - Screen Styling Recommendations

## Overview

This document provides specific styling recommendations for each screen in the cc-flow-cli application, based on the unified design patterns extracted from WelcomeScreen.

## Universal Design Principles

### 1. Layout Structure
- **Container**: Always use `Container` with `centered={true}` and `fullHeight={true}`
- **Card Width**: Use `90%` of terminal width or `theme.layout.maxWidth` (whichever is smaller)
- **Content Width**: Account for borders and padding (cardWidth - paddingX * 2 - 2)
- **Alignment**: Use `align="center"` for most screens

### 2. Section Spacing Pattern
```typescript
// Follow WelcomeScreen spacing pattern:
Logo/Header: spacing="sm"
Hero/Description: spacing="sm" 
Features/Content: spacing="sm"
Menu/Interactive: spacing="lg"
Status Bar: spacing="sm"
Version/Footer: spacing="xs"
```

### 3. Color Hierarchy
```typescript
// Text colors from theme.colors.hex:
Primary Brand: darkBlue → blue → lightBlue (gradient)
Hero Text: lightBlue + bold
Features: green
Headings: lightBlue + bold
Descriptions: cyan
Muted Text: gray
Version: gray
Status Text: blue
```

## Screen-Specific Recommendations

### 1. MenuScreen
**Pattern**: `menu`
**Current Issues**: ✅ Already well-implemented
**Recommendations**:
```typescript
// Apply consistent layout structure
const config = createScreenLayout('menu', {
  title: '🌊 CC-Flow メインメニュー',
  subtitle: 'エージェント連携ワークフロー作成ツール'
});

// Use UnifiedScreen wrapper
<UnifiedScreen 
  config={config}
  statusItems={[
    { key: 'Mode', value: 'Main Menu' },
    { key: 'Version', value: packageJson.version },
    { key: 'Status', value: 'Ready', color: theme.colors.success }
  ]}
>
  <ScreenDescription 
    heading="エージェント連携ワークフロー作成ツール"
    subheading="以下から実行したい操作を選択してください"
  />
  
  <MenuSection 
    items={menuItems}
    onSelect={handleSelect}
  />
  
  <ScreenDescription 
    heading="📝 操作方法:"
    description="↑↓: 選択 | Enter: 実行 | Q: 終了"
    align="center"
  />
</UnifiedScreen>
```

### 2. DirectoryScreen
**Pattern**: `selection`
**Current Issues**: Inconsistent spacing, mixed layout patterns
**Recommendations**:
```typescript
const config = createScreenLayout('selection', {
  title: 'エージェントディレクトリ選択',
  subtitle: 'ワークフロー作成対象の選択',
  icon: '📂'
});

<UnifiedScreen config={config}>
  <ScreenDescription 
    heading="選択したディレクトリ内のエージェントが"
    subheading="ワークフロー作成時に利用可能になります"
  />
  
  <Section title="📁 利用可能なディレクトリ" spacing="sm">
    {isLoading ? (
      <LoadingSpinner text="ディレクトリを読み込み中..." />
    ) : (
      <MenuSection 
        items={directories}
        onSelect={handleSelect}
        showDescription={true}
      />
    )}
  </Section>
  
  <HintBox 
    title="💡 ディレクトリ構成について"
    hints={[
      "• spec/: プロジェクト仕様・要件定義・設計関連",
      "• utility/: 汎用ツール・ヘルパー機能", 
      "• 全体: すべてのエージェントから自由に選択可能"
    ]}
  />
</UnifiedScreen>
```

### 3. AgentSelectionScreen
**Pattern**: `selection`
**Current Issues**: Missing consistent header/description layout
**Recommendations**:
```typescript
const config = createScreenLayout('selection', {
  title: 'エージェント選択',
  subtitle: 'ワークフローに含めるエージェントを選択',
  icon: '🤖'
});

<UnifiedScreen config={config}>
  <ScreenDescription 
    heading={`${targetPath} ディレクトリから選択`}
    subheading="複数のエージェントを選択できます"
  />
  
  <Section spacing="lg">
    <CheckboxList
      items={availableAgents}
      selectedItems={selectedAgents}
      onToggle={handleToggle}
      showDescription={true}
    />
  </Section>
  
  <ScreenDescription 
    heading={`選択済み: ${selectedAgents.size}個のエージェント`}
    align="center"
  />
</UnifiedScreen>
```

### 4. OrderScreen
**Pattern**: `configuration`
**Current Issues**: Needs consistent status display
**Recommendations**:
```typescript
const config = createScreenLayout('configuration', {
  title: 'エージェント実行順序設定',
  subtitle: 'ワークフローの実行順序を指定',
  icon: '🔢'
});

<UnifiedScreen config={config}>
  <ScreenDescription 
    heading="数字キーで順序を指定してください"
    subheading="1から始まる連続した番号を入力"
  />
  
  <Section spacing="lg">
    <AgentOrderList 
      agents={selectedAgents}
      order={currentOrder}
      onOrderChange={handleOrderChange}
    />
  </Section>
  
  <HintBox 
    title="💡 順序設定のヒント"
    hints={[
      "• 数字キー(1-9)で順序を設定",
      "• Enterで次の画面へ進む", 
      "• 全てのエージェントに順序を設定してください"
    ]}
  />
</UnifiedScreen>
```

### 5. WorkflowNameScreen
**Pattern**: `configuration`
**Recommendations**:
```typescript
const config = createScreenLayout('configuration', {
  title: 'ワークフロー名設定',
  subtitle: 'スラッシュコマンド名を入力',
  icon: '📝'
});

<UnifiedScreen config={config}>
  <ScreenDescription 
    heading="ワークフロー名を入力してください"
    subheading="この名前でスラッシュコマンドが作成されます"
  />
  
  <Section spacing="lg">
    <InputField
      label="ワークフロー名"
      value={workflowName}
      onChange={setWorkflowName}
      placeholder="例: my-workflow"
    />
  </Section>
  
  <HintBox 
    title="💡 命名規則"
    hints={[
      "• 英数字とハイフンのみ使用可能",
      "• 既存のコマンド名は使用できません",
      "• 分かりやすい名前をつけてください"
    ]}
  />
</UnifiedScreen>
```

### 6. PreviewScreen
**Pattern**: `preview`
**Recommendations**:
```typescript
const config = createScreenLayout('preview', {
  title: 'ワークフロー設定確認',
  subtitle: '作成前の最終確認',
  icon: '👀',
  align: 'left'
});

<UnifiedScreen config={config}>
  <Section spacing="sm">
    <WorkflowSummary 
      name={workflowName}
      agents={orderedAgents}
      targetPath={targetPath}
    />
  </Section>
  
  <Section spacing="lg">
    <PreviewCode 
      pomlContent={generatedPOML}
      commandContent={generatedCommand}
    />
  </Section>
  
  <ScreenDescription 
    heading="⚠️ 確認事項"
    description="上記の内容でワークフローを作成します。よろしいですか？"
    align="center"
  />
</UnifiedScreen>
```

### 7. CompleteScreen
**Pattern**: `complete`
**Recommendations**:
```typescript
const config = createScreenLayout('complete', {
  title: '✅ ワークフロー作成完了',
  subtitle: '正常に作成されました',
  icon: '🎉'
});

<UnifiedScreen 
  config={config}
  features={[
    '🎯 ワークフローが正常に作成されました',
    '⚡ スラッシュコマンドが利用可能になりました'
  ]}
  version={packageJson.version}
>
  <ScreenDescription 
    heading={`/${workflowName} コマンドを使用できます`}
    subheading="Claude Codeで新しいワークフローをお試しください"
  />
  
  <Section spacing="lg">
    <CompletionDetails 
      workflowName={workflowName}
      createdFiles={createdFiles}
      nextSteps={nextSteps}
    />
  </Section>
</UnifiedScreen>
```

### 8. ConversionScreen
**Pattern**: `processing`
**Recommendations**:
```typescript
const config = createScreenLayout('processing', {
  title: 'コマンド変換中',
  subtitle: 'スラッシュコマンドをエージェントに変換しています',
  icon: '🔄'
});

<UnifiedScreen 
  config={config}
  customStatusMessage="変換処理中..."
>
  <Section spacing="lg">
    <ProgressSpinner text="ファイルを解析中..." />
  </Section>
  
  <ConversionProgress 
    currentStep={currentStep}
    totalSteps={totalSteps}
    currentFile={currentFile}
  />
</UnifiedScreen>
```

### 9. EnvironmentScreen
**Pattern**: `selection`
**Recommendations**:
```typescript
const config = createScreenLayout('selection', {
  title: '環境設定',
  subtitle: 'CC-Flow実行環境の設定',
  icon: '⚙️'
});

<UnifiedScreen config={config}>
  <ScreenDescription 
    heading="環境設定を確認・変更してください"
    subheading="プロジェクトに最適な設定を選択"
  />
  
  <Section spacing="lg">
    <EnvironmentSettings 
      settings={environmentSettings}
      onSettingChange={handleSettingChange}
    />
  </Section>
  
  <HintBox 
    title="💡 推奨設定"
    hints={[
      "• デフォルト設定で多くの場合に対応可能",
      "• プロジェクト固有の要件がある場合のみ変更",
      "• 設定は後から変更可能です"
    ]}
  />
</UnifiedScreen>
```

### 10. ConversionCompleteScreen
**Pattern**: `complete`
**Recommendations**:
```typescript
const config = createScreenLayout('complete', {
  title: '✅ 変換完了',
  subtitle: 'スラッシュコマンドの変換が完了しました',
  icon: '🎯'
});

<UnifiedScreen 
  config={config}
  features={[
    '🔄 スラッシュコマンドが正常に変換されました',
    '📁 新しいエージェントファイルが作成されました'
  ]}
  version={packageJson.version}
>
  <ConversionResults 
    convertedCommands={convertedCommands}
    createdAgents={createdAgents}
    backupLocation={backupLocation}
  />
</UnifiedScreen>
```

## Implementation Priority

### Phase 1: Core Components (High Priority)
1. **MenuScreen** - Already well-implemented, minor adjustments
2. **DirectoryScreen** - Remove `Spacer` usage, standardize layout
3. **AgentSelectionScreen** - Add consistent header structure

### Phase 2: Configuration Screens (Medium Priority)
4. **OrderScreen** - Implement unified layout structure
5. **WorkflowNameScreen** - Add hint box and validation
6. **PreviewScreen** - Improve code preview layout

### Phase 3: Completion Screens (Low Priority)
7. **CompleteScreen** - Add success features and version display
8. **ConversionScreen** - Implement progress tracking
9. **EnvironmentScreen** - Add settings management
10. **ConversionCompleteScreen** - Show conversion results

## Key Benefits

1. **Visual Consistency**: All screens follow the same layout patterns
2. **User Experience**: Predictable navigation and interaction patterns
3. **Maintainability**: Reusable components reduce code duplication
4. **Accessibility**: Consistent focus management and keyboard navigation
5. **Responsive Design**: Automatic terminal size adaptation
6. **Theme Coherence**: Unified color scheme and typography

## Migration Strategy

1. Import design system components: `import { UnifiedScreen, ScreenDescription, etc. } from '../design-system/ScreenComponents.js'`
2. Replace existing layout with `UnifiedScreen` wrapper
3. Use pre-built components (`ScreenDescription`, `MenuSection`, `HintBox`, etc.)
4. Apply consistent color scheme using `getScreenColors(theme)`
5. Test terminal responsiveness and keyboard navigation