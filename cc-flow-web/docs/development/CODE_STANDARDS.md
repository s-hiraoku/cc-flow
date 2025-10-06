# Code Standards

Comprehensive coding standards and best practices for CC-Flow Web Editor development.

## 📋 General Principles

### Code Quality Standards
1. **Type Safety**: 100% TypeScript with strict mode
2. **Readability**: Self-documenting code with clear naming
3. **Maintainability**: Modular design with single responsibility
4. **Performance**: Optimized for production use
5. **Accessibility**: WCAG 2.1 AA compliance

### Development Philosophy
- **Convention over Configuration**: Follow established patterns
- **Progressive Enhancement**: Build with graceful degradation
- **Mobile First**: Responsive design from the ground up
- **Test-Driven Development**: Write tests for critical functionality

## 🔧 TypeScript Standards

### Type Definitions
```typescript
// ✅ Good: Explicit, descriptive interfaces
interface WorkflowMetadata {
  workflowName: string;
  workflowPurpose: string;
  workflowModel?: string;
  workflowArgumentHint?: string;
}

// ❌ Bad: Generic, unclear types
interface Data {
  name: string;
  value: any;
}
```

### Type Safety Rules
```typescript
// ✅ Good: Strict typing
function processWorkflow(metadata: WorkflowMetadata): WorkflowConfig {
  return {
    ...metadata,
    workflowSteps: generateSteps(metadata)
  };
}

// ❌ Bad: Any types
function processWorkflow(data: any): any {
  return data;
}
```

### Type Guards
```typescript
// ✅ Good: Runtime type validation
export function isAgentNodeData(data: WorkflowNodeData): data is AgentNodeData {
  return 'agentName' in data && typeof data.agentName === 'string';
}

// Usage
if (isAgentNodeData(node.data)) {
  // TypeScript knows this is AgentNodeData
  console.log(node.data.agentName);
}
```

### Generic Constraints
```typescript
// ✅ Good: Constrained generics
interface APIResponse<T extends Record<string, unknown>> {
  success: boolean;
  data?: T;
  error?: string;
}

// ❌ Bad: Unconstrained generics
interface APIResponse<T> {
  data: T;
}
```

## ⚛️ React Standards

### Component Patterns
```typescript
// ✅ Good: Functional component with proper typing
interface AgentCardProps {
  agent: Agent;
  onDragStart: (agent: Agent) => void;
  className?: string;
}

export default function AgentCard({ agent, onDragStart, className }: AgentCardProps) {
  const handleDragStart = useCallback((event: React.DragEvent) => {
    onDragStart(agent);
  }, [agent, onDragStart]);

  return (
    <Card className={cn("cursor-grab", className)} draggable onDragStart={handleDragStart}>
      <h3>{agent.name}</h3>
      <p>{agent.description}</p>
    </Card>
  );
}
```

### Hook Patterns
```typescript
// ✅ Good: Custom hook with proper return type
interface UseWorkflowEditorReturn {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  metadata: WorkflowMetadata;
  handleNodesChange: (nodes: WorkflowNode[]) => void;
  generatePreviewJSON: () => string;
  canSave: boolean;
}

export function useWorkflowEditor(): UseWorkflowEditorReturn {
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  // ... implementation
  
  return {
    nodes,
    edges,
    metadata,
    handleNodesChange,
    generatePreviewJSON,
    canSave
  };
}
```

### Performance Optimization
```typescript
// ✅ Good: Memoized expensive calculations
const expensiveValue = useMemo(() => {
  return nodes.reduce((acc, node) => {
    return acc + calculateComplexValue(node);
  }, 0);
}, [nodes]);

// ✅ Good: Stable function references
const handleNodeClick = useCallback((nodeId: string) => {
  setSelectedNode(nodeId);
}, []);

// ✅ Good: Memoized components
export default React.memo(function AgentNode({ data }: AgentNodeProps) {
  return <div>{data.label}</div>;
});
```

## 🎨 Styling Standards

### Tailwind CSS Conventions
```typescript
// ✅ Good: Organized, readable classes
<div className={cn(
  // Layout
  "flex items-center justify-between p-4",
  // Styling
  "bg-white border border-gray-200 rounded-lg shadow-sm",
  // States
  "hover:shadow-md focus:ring-2 focus:ring-indigo-500",
  // Responsive
  "sm:p-6 md:flex-row",
  // Conditional
  isSelected && "ring-2 ring-indigo-500",
  className
)}>
```

### Component Variants
```typescript
// ✅ Good: Systematic variant system using cva
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-indigo-600 text-white hover:bg-indigo-700",
        outline: "border border-gray-300 bg-white hover:bg-gray-50",
        ghost: "hover:bg-gray-100",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}
```

## 🏗️ Architecture Standards

### File Organization
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Route groups
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── workflow-editor/  # Feature-specific components
│   ├── panels/          # Layout panels
│   └── common/          # Shared components
├── hooks/                # Custom React hooks
├── services/            # Business logic services
├── lib/                 # Utilities and helpers
├── types/               # TypeScript definitions
└── constants/           # Application constants
```

### Naming Conventions
```typescript
// Files and directories
PascalCase    // React components: AgentCard.tsx
camelCase     // Utilities, hooks: useWorkflowEditor.ts
kebab-case    // Directories: workflow-editor/
UPPER_CASE    // Constants: API_BASE_URL

// Variables and functions
camelCase     // Variables: workflowNodes
camelCase     // Functions: handleNodeClick
PascalCase    // Types/Interfaces: WorkflowMetadata
PascalCase    // Components: AgentCard
```

### Import Organization
```typescript
// ✅ Good: Organized import order
// 1. External libraries
import React, { useState, useCallback } from 'react';
import { NextRequest, NextResponse } from 'next/server';

// 2. Internal utilities
import { cn } from '@/lib/utils';

// 3. Components
import { Card } from '@/components/ui';

// 4. Types
import type { Agent, WorkflowNode } from '@/types';

// 5. Relative imports
import './AgentCard.css';
```

## 📝 Documentation Standards

### Component Documentation
```typescript
/**
 * AgentCard displays an individual agent with drag-and-drop functionality.
 * Used in the AgentPalette to show available agents for workflow creation.
 * 
 * @param agent - Agent data including name, description, and metadata
 * @param onDragStart - Callback fired when drag operation begins
 * @param className - Additional CSS classes for styling
 * 
 * @example
 * ```tsx
 * <AgentCard
 *   agent={myAgent}
 *   onDragStart={(agent) => console.log('Dragging:', agent.name)}
 *   className="custom-card"
 * />
 * ```
 */
export default function AgentCard({ agent, onDragStart, className }: AgentCardProps) {
```

### API Documentation
```typescript
/**
 * Saves a workflow configuration to the file system.
 * 
 * @param data - Complete workflow data including metadata, nodes, and edges
 * @returns Promise resolving to save confirmation with file path
 * @throws Error if validation fails or file system operation fails
 * 
 * @example
 * ```typescript
 * const result = await WorkflowService.saveWorkflow({
 *   metadata: { workflowName: 'my-workflow', workflowPurpose: 'Test' },
 *   nodes: [agentNode1, agentNode2],
 *   edges: [connection1]
 * });
 * ```
 */
static async saveWorkflow(data: WorkflowSaveRequest): Promise<WorkflowSaveResponse>
```

### README Standards
```markdown
# Component/Module Name

Brief description of purpose and functionality.

## Usage

Basic usage examples with code snippets.

## API Reference

Detailed parameter and return value documentation.

## Examples

Real-world usage scenarios.

## Testing

How to test this component/module.
```

## 🧪 Testing Standards

### Test Structure
```typescript
describe('ComponentName', () => {
  beforeEach(() => {
    // Setup before each test
  });

  describe('when condition', () => {
    it('should perform expected behavior', () => {
      // Arrange
      const props = { /* test props */ };
      
      // Act
      render(<ComponentName {...props} />);
      
      // Assert
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });
});
```

### Test Naming
```typescript
// ✅ Good: Descriptive test names
it('should display agent name and description')
it('should call onDragStart when drag begins')
it('should show error message when save fails')

// ❌ Bad: Generic test names
it('should work')
it('should render')
it('should handle click')
```

### Mock Patterns
```typescript
// ✅ Good: Specific, controlled mocks
const mockAgent: Agent = {
  name: 'Test Agent',
  description: 'Test description',
  category: 'spec',
  path: './test-agent.md'
};

vi.mock('@/services/AgentService', () => ({
  AgentService: {
    fetchAgents: vi.fn().mockResolvedValue([mockAgent])
  }
}));
```

## 🚀 Performance Standards

### Bundle Optimization
```typescript
// ✅ Good: Dynamic imports for heavy components
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// ✅ Good: Code splitting at route level
const EditorPage = lazy(() => import('@/app/editor/page'));

// ✅ Good: Conditional loading
const AdminPanel = lazy(() => 
  import('./AdminPanel').then(module => ({ default: module.AdminPanel }))
);
```

### React Performance
```typescript
// ✅ Good: Avoid unnecessary re-renders
const MemoizedComponent = React.memo(function Component({ data }: Props) {
  return <div>{data.name}</div>;
});

// ✅ Good: Stable dependencies
const handleClick = useCallback(() => {
  onUpdate(id);
}, [onUpdate, id]); // Only id needed, not full object

// ✅ Good: Efficient state updates
setNodes(prevNodes => prevNodes.map(node => 
  node.id === targetId ? { ...node, selected: true } : node
));
```

## 🔒 Security Standards

### Input Validation
```typescript
// ✅ Good: Server-side validation
function validateWorkflowRequest(body: unknown): WorkflowSaveRequest {
  if (!body || typeof body !== 'object') {
    throw new Error('Invalid request body');
  }
  
  const data = body as Record<string, unknown>;
  
  if (!data.metadata || typeof data.metadata !== 'object') {
    throw new Error('Invalid metadata');
  }
  
  return data as WorkflowSaveRequest;
}
```

### XSS Prevention
```typescript
// ✅ Good: Sanitized content rendering
import DOMPurify from 'dompurify';

function SafeHTML({ content }: { content: string }) {
  const sanitized = DOMPurify.sanitize(content);
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}
```

## 📱 Accessibility Standards

### ARIA Implementation
```typescript
// ✅ Good: Comprehensive ARIA attributes
<button
  aria-label={`Drag ${agent.name} to canvas`}
  aria-describedby={`${agent.name}-description`}
  role="button"
  tabIndex={0}
  onKeyDown={handleKeyDown}
>
  <span id={`${agent.name}-description`} className="sr-only">
    {agent.description}
  </span>
  {agent.name}
</button>
```

### Keyboard Navigation
```typescript
// ✅ Good: Keyboard support
const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault();
      onSelect();
      break;
    case 'Escape':
      onDeselect();
      break;
  }
}, [onSelect, onDeselect]);
```

## 🔧 Linting Configuration

### ESLint Rules
```json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "react-hooks/exhaustive-deps": "error",
    "react/prop-types": "off"
  }
}
```

### Pre-commit Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

## 📚 Code Review Checklist

### Functionality
- [ ] Code works as intended
- [ ] Edge cases are handled
- [ ] Error handling is comprehensive
- [ ] Performance is acceptable

### Code Quality
- [ ] TypeScript strict mode compliance
- [ ] No ESLint warnings
- [ ] Consistent formatting
- [ ] Clear, descriptive naming

### Testing
- [ ] Unit tests for new functionality
- [ ] Integration tests for user workflows
- [ ] Test coverage meets requirements
- [ ] Tests are reliable and fast

### Documentation
- [ ] Code is self-documenting
- [ ] Complex logic has comments
- [ ] API changes are documented
- [ ] README updates if needed

---

**Code Standards Version**: 2.0
**Last Updated**: 2025-01-26
**Enforcement**: ESLint + TypeScript + Pre-commit hooks