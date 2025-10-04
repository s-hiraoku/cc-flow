# Editor Components

This directory contains the main editor page components for the CC-Flow Web Editor.

## Architecture

The editor components follow a hierarchical structure:

```
EditorPage (src/app/editor/page.tsx)
├── EditorToolbar
│   └── Navigation, stats, action buttons
├── EditorNotificationArea
│   ├── WorkflowProgressIndicator
│   │   ├── StepIcon (for each step)
│   │   └── ErrorDetails (if error)
│   └── WorkflowSuccessMessage
└── Canvas, AgentPalette, PropertiesPanel (from other directories)
```

## Components

### Main Components

#### `EditorToolbar`
Displays navigation, workflow statistics, and action buttons.

**Props:**
- `nodeCount: number` - Number of nodes in workflow
- `edgeCount: number` - Number of connections
- `canSave: boolean` - Whether workflow can be saved
- `generating: boolean` - Whether generation is in progress
- `onPreviewJSON: () => void` - Preview JSON handler
- `onGenerateWorkflow: () => void` - Generate workflow handler

#### `EditorNotificationArea`
Manages the display of progress indicators and success messages.

**Props:**
- `generating: boolean` - Whether generation is in progress
- `currentStep?: WorkflowStep` - Current generation step
- `error?: GenerateError | null` - Error information
- `result?: GenerateResult | null` - Success result
- `showSuccessMessage: boolean` - Whether to show success message
- `isSuccessVisible: boolean` - Animation state for success message

#### `WorkflowProgressIndicator`
Displays step-by-step progress of workflow generation.

**Props:**
- `currentStep?: WorkflowStep` - Current generation step
- `error?: GenerateError | null` - Error information

#### `WorkflowSuccessMessage`
Displays success message with auto-hide animation.

**Props:**
- `commandName?: string` - Generated command name
- `commandPath?: string` - Path to generated command
- `isVisible: boolean` - DOM visibility
- `isAnimating: boolean` - CSS animation state

### Sub-components

#### `StepIcon`
Icon component for workflow steps with different states (error, active, completed, pending).

#### `ErrorDetails`
Displays detailed error information including step, message, and optional details.

## Types

### `WorkflowStep`
```typescript
type WorkflowStep =
  | 'validating'
  | 'generating-json'
  | 'executing-script'
  | 'reading-output'
  | 'complete';
```

### `GenerateError`
```typescript
interface GenerateError {
  step: WorkflowStep;
  message: string;
  details?: string[];
}
```

### `GenerateResult`
```typescript
interface GenerateResult {
  commandName: string;
  commandPath: string;
}
```

## Constants

### `WORKFLOW_STEPS`
Array of step configurations with name and label.

### `STEP_ORDER`
Array defining the execution order of workflow steps.

## Usage Example

```tsx
import { EditorToolbar, EditorNotificationArea } from '@/components/editor';

function EditorPage() {
  // ... hooks and state

  return (
    <div>
      <EditorToolbar
        nodeCount={nodes.length}
        edgeCount={edges.length}
        canSave={canSave}
        generating={generating}
        onPreviewJSON={handlePreviewJSON}
        onGenerateWorkflow={handleGenerateWorkflow}
      />

      <EditorNotificationArea
        generating={generating}
        currentStep={currentStep}
        error={generateError}
        result={generateResult}
        showSuccessMessage={showSuccessMessage}
        isSuccessVisible={isSuccessVisible}
      />
    </div>
  );
}
```

## Design Principles

1. **Single Responsibility**: Each component has one clear purpose
2. **Composition**: Complex components are built from smaller, reusable pieces
3. **Type Safety**: All props and state are properly typed
4. **Separation of Concerns**: Logic, presentation, types, and constants are separated
5. **Maintainability**: Well-documented with JSDoc comments and clear naming

## File Structure

```
src/components/editor/
├── README.md                        # This file
├── index.ts                         # Public API exports
├── types.ts                         # TypeScript type definitions
├── constants.ts                     # Shared constants
├── EditorToolbar.tsx                # Toolbar component
├── EditorNotificationArea.tsx       # Notification area component
├── WorkflowProgressIndicator.tsx    # Progress indicator component
├── WorkflowSuccessMessage.tsx       # Success message component
├── StepIcon.tsx                     # Step icon sub-component
└── ErrorDetails.tsx                 # Error details sub-component
```
