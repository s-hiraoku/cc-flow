# Development Guide

This guide covers the complete development workflow for the CC-Flow Web Editor.

## 🚀 Quick Start

### Prerequisites
```bash
# Required
Node.js >= 18.0.0
npm >= 9.0.0

# Optional but recommended
Git >= 2.30.0
VSCode with recommended extensions
```

### Installation
```bash
# Clone and setup
cd cc-flow/cc-flow-web
npm install

# Start development server
npm run dev
```

## 🛠️ Development Workflow

### 1. Project Structure
```
cc-flow-web/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── editor/            # Editor page
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   │   ├── workflow-editor/   # Core editor components
│   │   ├── panels/           # UI panels (AgentPalette, PropertiesPanel)
│   │   ├── ui/               # shadcn/ui components
│   │   └── common/           # Shared components
│   ├── hooks/                # Custom React hooks
│   │   ├── useWorkflowEditor.ts
│   │   ├── useAgents.ts
│   │   └── useWorkflowSave.ts
│   ├── services/             # Business logic services
│   │   ├── WorkflowService.ts
│   │   └── AgentService.ts
│   ├── types/                # TypeScript definitions
│   ├── lib/                  # Utilities and helpers
│   └── constants/            # Application constants
├── docs/                     # Documentation
├── public/                   # Static assets
└── tests/                    # Test configuration
```

### 2. Available Scripts
```bash
# Development
npm run dev              # Start dev server (localhost:3002)
npm run build           # Production build
npm run start           # Production server

# Code Quality
npm run lint            # ESLint checking
npm run type-check      # TypeScript validation
npm run format          # Prettier formatting

# Testing
npm run test            # Run test suite
npm run test:watch      # Watch mode testing
npm run test:coverage   # Coverage report
npm run test:ui         # Visual test runner
```

### 3. Development Server
- **URL**: http://localhost:3002
- **Hot Reload**: Automatic on file changes
- **API Routes**: Available at `/api/*`

## 🏗️ Architecture Overview

### Component Architecture
```
App (layout.tsx)
├── HomePage (/)
└── EditorPage (/editor)
    ├── AgentPalette (left sidebar)
    ├── Canvas (center - ReactFlow)
    └── PropertiesPanel (right sidebar)
```

### Data Flow
```
User Action → Custom Hook → Service Layer → API → Response
     ↓
UI Update ← State Update ← Hook Update ← Service Response
```

### Key Technologies
- **Frontend**: Next.js 15 + React 19
- **Visual Editor**: ReactFlow v12
- **UI Components**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS v4
- **Type System**: TypeScript 5.6
- **Testing**: Vitest + React Testing Library

## 🔧 Development Patterns

### 1. Custom Hooks Pattern
```typescript
// hooks/useWorkflowEditor.ts
export function useWorkflowEditor() {
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [edges, setEdges] = useState<WorkflowEdge[]>([]);
  
  // Business logic methods
  const addNode = useCallback((node: WorkflowNode) => {
    setNodes(prev => [...prev, node]);
  }, []);
  
  return { nodes, edges, addNode };
}
```

### 2. Service Layer Pattern
```typescript
// services/WorkflowService.ts
export class WorkflowService {
  static async saveWorkflow(data: WorkflowSaveRequest) {
    const response = await fetch('/api/workflows', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  }
}
```

### 3. Component Composition
```typescript
// components/workflow-editor/Canvas.tsx
export default function Canvas({ nodes, edges, onNodesChange }) {
  return (
    <ReactFlowProvider>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </ReactFlowProvider>
  );
}
```

## 🧪 Testing Strategy

### Test Structure
```
src/
├── hooks/__tests__/          # Hook unit tests
├── services/__tests__/       # Service unit tests
└── components/__tests__/     # Integration tests
```

### Running Tests
```bash
# Full test suite
npm run test

# Watch mode (development)
npm run test:watch

# Coverage report
npm run test:coverage

# Visual test runner
npm run test:ui
```

### Test Patterns
- **Unit Tests**: Individual functions and hooks
- **Integration Tests**: Component interactions
- **API Tests**: Mocked backend responses
- **E2E Tests**: Complete user workflows (planned)

## 🎯 Development Best Practices

### 1. Code Standards
- **TypeScript**: Strict mode, no `any` types
- **ESLint**: React and TypeScript best practices
- **Prettier**: Consistent formatting
- **File Naming**: PascalCase for components, camelCase for utilities

### 2. Component Guidelines
- Use functional components with hooks
- Implement proper TypeScript interfaces
- Follow shadcn/ui patterns for UI components
- Ensure accessibility compliance

### 3. State Management
- Use React built-in state for local state
- Custom hooks for shared logic
- Service layer for API interactions
- No external state management library needed

### 4. Performance Optimization
- Use React.memo for expensive renders
- Implement useCallback for stable functions
- useMemo for expensive calculations
- Code splitting for large components

## 🐛 Debugging

### Development Tools
1. **React DevTools**: Component inspection
2. **Redux DevTools**: State debugging (if needed)
3. **VS Code Debugger**: Breakpoint debugging
4. **Browser DevTools**: Network and performance

### Common Issues
- **Port conflicts**: Change port in `next.config.ts`
- **Type errors**: Run `npm run type-check`
- **Build failures**: Check `npm run build` output
- **Test failures**: Run `npm run test` for details

## 🔗 Integration Points

### CC-Flow CLI Integration
- Agent discovery from `.claude/agents/`
- Workflow output compatible with CLI
- Shared configuration and constants

### API Endpoints
- `GET /api/agents` - Agent discovery
- `POST /api/workflows` - Workflow saving
- Future: Authentication, versioning

## 📦 Dependencies

### Core Dependencies
```json
{
  "next": "15.5.3",
  "react": "19.1.0",
  "@xyflow/react": "^12.8.5",
  "tailwindcss": "^4"
}
```

### Development Dependencies
```json
{
  "typescript": "^5",
  "vitest": "^2.1.8",
  "@testing-library/react": "^16.1.0",
  "eslint": "^9"
}
```

## 🚀 Deployment

See [Deployment Guide](./DEPLOYMENT.md) for production deployment instructions.

---

**Next Steps**: 
- Review [Code Standards](./CODE_STANDARDS.md)
- Check [Testing Guide](../testing/TESTING_GUIDE.md)
- Read [Technical Architecture](../architecture/TECHNICAL_ARCHITECTURE.md)