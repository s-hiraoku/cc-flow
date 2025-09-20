# CC-Flow Responsive TUI Design System

This guide explains how to use CC-Flow's responsive Terminal User Interface (TUI) system that adapts beautifully to terminal widths from 40-120+ characters.

## Key Features

### 🎯 **Mobile-First Responsive Design**
- **Breakpoints**: 40 (tiny), 60 (small), 80 (medium), 100 (large), 120+ (xlarge)
- **Dynamic width calculation** with optimal content-to-padding ratios
- **Progressive enhancement** - more features on wider terminals
- **Minimum readability guarantee** - always usable at 40 chars

### 🎨 **Clean, Minimal Spacing**
- **Adaptive padding**: 1px (tiny) → 2px (small) → 3px (medium) → 4px+ (large)
- **Smart content flow** with responsive margins
- **No excessive whitespace** - efficient use of screen real estate
- **Consistent visual hierarchy** across all screen sizes

## Core Components

### 1. **UITheme.responsive** - The Foundation

```typescript
// Get adaptive dimensions
const { width } = UITheme.getTerminalSize();
const boxWidth = UITheme.responsive.getBoxWidth(width);
const contentWidth = UITheme.responsive.getContentWidth(width);
const padding = UITheme.responsive.getPadding(width);

// Breakpoint checking
if (width <= UITheme.responsive.breakpoints.tiny) {
  // Ultra-compact layout for 40-char terminals
} else if (width <= UITheme.responsive.breakpoints.small) {
  // Compact layout for 60-char terminals  
}
```

### 2. **Headers & Footers** - Fully Responsive

```typescript
// Responsive header with icon and title truncation
const headerLines = UITheme.createHeader("Workflow Setup", "🚀");

// Responsive footer that matches header width
const footer = UITheme.createFooter();
```

**What happens at different widths:**
- **40 chars**: Title truncated, minimal borders
- **60 chars**: Full title, compact spacing
- **80+ chars**: Full title, generous spacing, enhanced visual hierarchy

### 3. **Content Lines** - Smart Padding & Alignment

```typescript
// Auto-adapts padding and handles overflow
const contentLine = UITheme.createContentLine("Your content here", 'left');

// Center alignment with responsive padding
const centeredLine = UITheme.createContentLine("Status: Complete", 'center');

// Right alignment
const rightLine = UITheme.createContentLine("100%", 'right');
```

**Responsive behavior:**
- **Tiny terminals (≤40)**: 1px padding, truncate with ellipsis
- **Small terminals (41-60)**: 2px padding, smart wrapping
- **Medium+ terminals (61+)**: 3-4px padding, full content display

### 4. **Progress Bars** - Adaptive Width

```typescript
// Automatically scales bar width based on terminal size
const progressBar = UITheme.createProgressBar(7, 10);

// Output examples:
// 40 chars: "7/10 70%"           (compact format)
// 80 chars: "██████████░░░ 70%"  (full visual bar)
```

### 5. **Box Containers** - Complete Responsive Layout

```typescript
const box = UITheme.createBox("Agent Selection", [
  "Choose agents for your workflow:",
  "",
  "✓ spec-init - Initialize project structure", 
  "○ spec-design - Create architecture",
  "○ spec-impl - Implement features"
], {
  padding: true,      // Auto-adapts padding to terminal width
  icon: "📋"         // Icon in header
});

box.forEach(line => console.log(line));
```

## Screen Layout Patterns

### 1. **Form Layouts** - Progressive Enhancement

```typescript
export class MyFormScreen extends BaseScreen {
  render(): string[] {
    return this.createFormLayout("Configuration", [
      {
        label: "Project Name",
        value: this.projectName,
        required: true,
        type: "text"
      },
      {
        label: "Include Tests",
        value: this.includeTests ? "Yes" : "No", 
        type: "checkbox"
      }
    ], [
      { key: "Enter", description: "Continue" },
      { key: "Esc", description: "Cancel" }
    ]);
  }
}
```

**Responsive features:**
- Field spacing adapts to terminal width
- Error messages formatted appropriately  
- Navigation help uses full/compact format based on space

### 2. **List Layouts** - Checkbox & Selection UI

```typescript
export class AgentSelectionScreen extends BaseScreen {
  render(): string[] {
    return this.createListLayout("Select Agents", [
      {
        label: "spec-init",
        description: "Initialize project structure",
        selected: true,
        icon: "🚀"
      },
      {
        label: "spec-design", 
        description: "Create architecture",
        selected: false,
        icon: "🎨"
      }
    ], {
      multiSelect: true,
      showCounter: true,
      actions: [
        { key: "Space", description: "Toggle" },
        { key: "Enter", description: "Confirm" }
      ]
    });
  }
}
```

**Adaptive behavior:**
- **Narrow terminals**: Hide descriptions, compact spacing
- **Wide terminals**: Show full descriptions, generous spacing
- Counter format adapts to available space

### 3. **Status/Result Layouts** - Clean Feedback

```typescript
export class CompleteScreen extends BaseScreen {
  render(): string[] {
    return this.createStatusLayout(
      "Workflow Created",
      "success", 
      "Your spec-workflow is ready to use!",
      [
        "Generated: .claude/commands/spec-workflow.md",
        "Agents: spec-init → spec-design → spec-impl", 
        "Run: /spec-workflow \"your task\""
      ],
      [
        { key: "Enter", description: "Exit" },
        { key: "r", description: "Create Another" }
      ]
    );
  }
}
```

## Advanced Responsive Techniques

### 1. **Conditional Content Based on Width**

```typescript
const { width } = UITheme.getTerminalSize();
const lines: string[] = [];

// Show detailed help only on wider terminals
if (width >= UITheme.responsive.breakpoints.medium) {
  lines.push(UITheme.createContentLine("💡 Tip: Use arrow keys to navigate"));
  lines.push(UITheme.createEmptyLine());
}

// Always show essential content
lines.push(UITheme.createContentLine("Essential information here"));
```

### 2. **Responsive Tables & Columns**

```typescript
// Auto-adapting table that stacks on narrow terminals
const tableLines = LayoutManager.createTable(agents, [
  { key: 'name', title: 'Agent', width: 15 },
  { key: 'description', title: 'Description' }, // Flexible width
  { key: 'selected', title: '✓', width: 3, align: 'center' }
], {
  alternatingRows: true,
  showHeaders: width >= 60  // Hide headers on tiny terminals
});
```

### 3. **Smart Navigation Help**

```typescript
// Automatically switches between formats
const navHelp = UITheme.createNavigationHelp([
  { key: "←→", description: "Navigate" },
  { key: "Enter", description: "Select" },
  { key: "Esc", description: "Cancel" }
]);

// 40 chars: "←→:Navigate • Enter:Select • Esc:Cancel"
// 80 chars: "[←→] Navigate  [Enter] Select  [Esc] Cancel"
```

## Migration from Fixed Layout

### Before (Fixed Width Issues)
```typescript
// OLD: Fixed width causing problems
static readonly dimensions = {
  boxWidth: 47,        // ❌ Fixed width
  contentWidth: 45,    // ❌ Fixed width  
  padding: 1           // ❌ Fixed padding
};

// OLD: Hardcoded footer
static createFooter(): string {
  return '└─────────────────────────────────────────┘'; // ❌ Fixed width
}
```

### After (Responsive System)
```typescript
// NEW: Responsive system
const boxWidth = UITheme.responsive.getBoxWidth(terminalWidth);    // ✅ Dynamic
const contentWidth = UITheme.responsive.getContentWidth(terminalWidth); // ✅ Dynamic
const padding = UITheme.responsive.getPadding(terminalWidth);      // ✅ Dynamic

// NEW: Responsive footer
const footer = UITheme.createFooter(terminalWidth); // ✅ Adapts to width
```

## Best Practices

### ✅ **Do**
- Use `UITheme.createBox()` for consistent responsive containers
- Check terminal width before adding optional content
- Use `createContentLine()` for all text that needs proper padding
- Leverage the responsive spacing system (`UITheme.responsive.spacing`)
- Test your layouts at 40, 60, 80, and 100+ character widths

### ❌ **Don't**
- Use fixed widths or hardcoded padding values
- Create custom box drawing without the responsive system
- Assume terminal width - always check with `getTerminalSize()`
- Add excessive whitespace - let the system handle spacing
- Ignore narrow terminal users - 40 chars is the minimum target

## Testing Your Responsive Design

```bash
# Test different terminal widths
export COLUMNS=40 && npm run dev   # Tiny terminal
export COLUMNS=60 && npm run dev   # Small terminal  
export COLUMNS=80 && npm run dev   # Medium terminal
export COLUMNS=100 && npm run dev  # Large terminal
export COLUMNS=120 && npm run dev  # Extra large terminal

# Or resize your terminal and observe the adaptive behavior
```

## Key Improvements Achieved

1. **Dynamic width calculation** - No more fixed 47-character boxes
2. **Optimal spacing ratios** - Clean layouts without excessive whitespace  
3. **Mobile-first approach** - Works beautifully down to 40 characters
4. **Progressive enhancement** - More features on wider terminals
5. **Consistent visual hierarchy** - Maintainable design system

Your TUI now adapts seamlessly from narrow 40-character terminals to wide 120+ character displays while maintaining excellent readability and clean aesthetics at every size.