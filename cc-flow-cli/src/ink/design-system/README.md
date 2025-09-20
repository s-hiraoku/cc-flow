# CC-Flow TUI Design System

A unified Terminal User Interface design system for the CC-Flow CLI application, based on the polished WelcomeScreen design pattern.

## Overview

This design system provides consistent layout patterns, reusable components, and unified styling guidelines to ensure all screens in the CC-Flow application have a cohesive and professional appearance.

## 🎯 Key Benefits

- **Visual Consistency**: All screens follow the same layout patterns
- **Reduced Code Duplication**: Reusable components eliminate repetitive layout code
- **Maintainability**: Centralized design tokens and patterns
- **Responsive Design**: Automatic terminal size adaptation
- **Accessibility**: Consistent keyboard navigation and focus management
- **Theme Coherence**: Unified color scheme and typography

## 📁 File Structure

```
design-system/
├── ScreenPatterns.ts          # Core design tokens and patterns
├── ScreenComponents.tsx       # Reusable UI components
├── ScreenRecommendations.md   # Screen-specific styling guide
├── examples/                  # Implementation examples
│   ├── MenuScreenExample.tsx
│   ├── DirectoryScreenExample.tsx
│   └── WelcomeScreenRefactored.tsx
├── index.ts                   # Main exports
└── README.md                  # This file
```

## 🚀 Quick Start

### 1. Import the Design System

```typescript
import { 
  UnifiedScreen, 
  ScreenDescription, 
  MenuSection,
  createScreenLayout 
} from '../design-system/index.js';
```

### 2. Define Screen Configuration

```typescript
const config = createScreenLayout('menu', {
  title: '🌊 My Screen Title',
  subtitle: 'Screen description',
  icon: '📁'
});
```

### 3. Use UnifiedScreen Wrapper

```typescript
<UnifiedScreen config={config}>
  <ScreenDescription 
    heading="Main heading text"
    subheading="Supporting description"
  />
  
  <MenuSection 
    items={menuItems}
    onSelect={handleSelect}
  />
</UnifiedScreen>
```

## 🎨 Design Patterns

### Screen Patterns

| Pattern | Use Case | Features |
|---------|----------|----------|
| `welcome` | Landing/welcome screens | Logo, hero text, features, version |
| `menu` | Main menu screens | Title, description, menu, status |
| `selection` | Selection screens | Description, list/menu, hints |
| `configuration` | Config/input screens | Title, forms, validation hints |
| `preview` | Review screens | Left-aligned content, code preview |
| `complete` | Success screens | Success features, next steps |
| `processing` | Loading screens | Progress indicators, status |

### Layout Structure

All screens follow this consistent structure:

```
┌─ Screen Title ─────────────────────────┐
│                                        │
│  [Logo Section]           spacing: sm  │
│  [Hero Text]              spacing: sm  │
│  [Features]               spacing: sm  │
│  [Main Content]           spacing: lg  │
│  [Status Bar]             spacing: sm  │
│  [Version]                spacing: xs  │
│                                        │
└────────────────────────────────────────┘
```

## 🎨 Color Scheme

Based on `theme.colors.hex` from WelcomeScreen:

```typescript
// Brand Colors (Logo gradient)
darkBlue (#1E40AF) → blue (#3B82F6) → lightBlue (#60A5FA)

// Text Hierarchy
Hero Text: lightBlue + bold
Features: green (#10B981)
Headings: lightBlue + bold
Descriptions: cyan
Muted Text: gray
Status Text: blue
```

## 🧩 Core Components

### UnifiedScreen
Main wrapper component that applies consistent layout patterns.

```typescript
<UnifiedScreen 
  config={screenConfig}
  logoLines={LOGO_LINES}      // Optional logo
  heroText="Hero message"     // Optional hero text
  features={featureList}      // Optional feature list
  version="1.0.0"            // Optional version
  statusItems={statusData}    // Optional status items
>
  {/* Custom content */}
</UnifiedScreen>
```

### ScreenDescription
Standardized text sections with consistent typography.

```typescript
<ScreenDescription 
  heading="Main heading"
  subheading="Supporting text"
  description="Additional details"
  align="center"
/>
```

### MenuSection
Consistent menu/list presentation.

```typescript
<MenuSection 
  items={menuItems}
  onSelect={handleSelect}
  showDescription={true}
/>
```

### HintBox
Structured hint/help boxes with consistent styling.

```typescript
<HintBox 
  title="💡 Tips"
  hints={[
    "• First helpful tip",
    "• Second helpful tip"
  ]}
/>
```

## 📏 Spacing System

Consistent spacing based on WelcomeScreen pattern:

- `xs` (1): Version, footer elements
- `sm` (2): Logo, hero, features, status bar
- `md` (3): Default section spacing
- `lg` (4): Menu/interactive sections
- `xl` (5): Major content separation

## 📱 Responsive Design

### Width Calculation
```typescript
cardWidth = min(theme.layout.maxWidth, terminalWidth * 0.9)
contentWidth = cardWidth - paddingX * 2 - 2 // account for borders
```

### Breakpoints
- **Compact Mode**: terminalHeight < 20 || terminalWidth < 70
- **Normal Mode**: Standard layout with full spacing
- **Minimum Viable**: 40x10 character minimum

## 🎯 Screen-Specific Guidelines

### MenuScreen
```typescript
const config = createScreenLayout('menu', {
  title: '🌊 CC-Flow メインメニュー',
  subtitle: 'エージェント連携ワークフロー作成ツール'
});
```

### DirectoryScreen
```typescript
const config = createScreenLayout('selection', {
  title: 'エージェントディレクトリ選択',
  subtitle: 'ワークフロー作成対象の選択',
  icon: '📂'
});
```

### AgentSelectionScreen
```typescript
const config = createScreenLayout('selection', {
  title: 'エージェント選択',
  subtitle: 'ワークフローに含めるエージェントを選択',
  icon: '🤖'
});
```

## 🔧 Migration Guide

### Step 1: Import Design System
```typescript
import { UnifiedScreen, createScreenLayout } from '../design-system/index.js';
```

### Step 2: Replace Layout
```typescript
// BEFORE
<Container centered fullHeight>
  <Card width={cardWidth} align="center">
    {/* manual sections */}
  </Card>
</Container>

// AFTER
<UnifiedScreen config={config}>
  {/* unified components */}
</UnifiedScreen>
```

### Step 3: Use Pre-built Components
Replace manual layout with design system components:
- `Section` → `ScreenDescription` 
- Manual menus → `MenuSection`
- Custom hints → `HintBox`
- Manual status → `ScreenStatusBar`

## 📊 Implementation Priority

### Phase 1: High Priority
1. **MenuScreen** - Minor adjustments needed
2. **DirectoryScreen** - Remove Spacer usage
3. **AgentSelectionScreen** - Add header structure

### Phase 2: Medium Priority  
4. **OrderScreen** - Implement unified layout
5. **WorkflowNameScreen** - Add validation hints
6. **PreviewScreen** - Improve preview layout

### Phase 3: Low Priority
7. **CompleteScreen** - Add success features
8. **ConversionScreen** - Progress tracking
9. **EnvironmentScreen** - Settings management
10. **ConversionCompleteScreen** - Results display

## 🧪 Testing

Run the example implementations to verify design consistency:

```typescript
// Test MenuScreen pattern
import { MenuScreenExample } from './examples/MenuScreenExample.js';

// Test DirectoryScreen pattern  
import { DirectoryScreenExample } from './examples/DirectoryScreenExample.js';

// Test WelcomeScreen refactor
import { WelcomeScreenRefactored } from './examples/WelcomeScreenRefactored.js';
```

## 💡 Best Practices

1. **Always use UnifiedScreen**: Don't manually create Container + Card layouts
2. **Follow spacing patterns**: Use design tokens for consistent spacing
3. **Use semantic components**: ScreenDescription for text, MenuSection for lists
4. **Maintain color hierarchy**: Follow the established color scheme
5. **Test responsiveness**: Verify behavior at different terminal sizes
6. **Keep navigation consistent**: Use standard status bar messages

## 🤝 Contributing

When adding new screen patterns:

1. Define the pattern in `SCREEN_PATTERNS`
2. Create reusable components if needed
3. Add implementation example
4. Update this documentation
5. Test across different terminal sizes

## 📚 References

- **Base Pattern**: [WelcomeScreen.tsx](/Volumes/SSD/development/cc-flow/cc-flow-cli/src/ink/screens/WelcomeScreen.tsx)
- **Theme System**: [theme.ts](/Volumes/SSD/development/cc-flow/cc-flow-cli/src/ink/themes/theme.ts)
- **Layout Components**: [Layout.tsx](/Volumes/SSD/development/cc-flow/cc-flow-cli/src/ink/components/Layout.tsx)
- **Interactive Components**: [Interactive.tsx](/Volumes/SSD/development/cc-flow/cc-flow-cli/src/ink/components/Interactive.tsx)