# Testing Guide

Comprehensive testing strategy and implementation for CC-Flow Web Editor.

## 📊 Testing Overview

### Current Status
- **Test Files**: 7 test suites
- **Total Tests**: 57 tests
- **Coverage Target**: 80%+ for critical components
- **Framework**: Vitest + React Testing Library + MSW

### Test Categories
1. **Unit Tests**: Individual functions and hooks
2. **Integration Tests**: Component interactions  
3. **API Tests**: Backend endpoint testing
4. **E2E Tests**: Complete user workflows (planned)

## 🛠️ Test Setup

### Testing Stack
```typescript
// Core testing libraries
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';

// Mocking
import { server } from '@/test/mocks/server';  // MSW server
```

### Configuration Files
- `vitest.config.ts` - Vitest configuration
- `src/test/setup.ts` - Global test setup
- `src/test/mocks/` - Mock definitions

## 🧪 Test Structure

### Directory Organization
```
src/
├── hooks/__tests__/
│   ├── useWorkflowEditor.test.ts
│   ├── useAgents.test.ts
│   └── useWorkflowSave.test.ts
├── services/__tests__/
│   ├── WorkflowService.test.ts
│   └── AgentService.test.ts
└── components/__tests__/
    ├── DragDropIntegration.test.tsx
    └── WorkflowEditorIntegration.test.tsx
```

## 📝 Test Categories

### 1. Custom Hook Tests

#### useWorkflowEditor Tests
```typescript
describe('useWorkflowEditor', () => {
  it('should initialize with empty nodes and edges', () => {
    const { result } = renderHook(() => useWorkflowEditor());
    
    expect(result.current.nodes).toEqual([]);
    expect(result.current.edges).toEqual([]);
    expect(result.current.canSave).toBe(false);
  });

  it('should update nodes when handleNodesChange is called', () => {
    const { result } = renderHook(() => useWorkflowEditor());
    
    act(() => {
      result.current.handleNodesChange(newNodes);
    });
    
    expect(result.current.nodes).toEqual(newNodes);
  });
});
```

#### useAgents Tests
- Agent loading and error handling
- Search and filtering functionality
- Category management
- API integration validation

#### useWorkflowSave Tests
- Workflow saving with validation
- Error handling for network failures
- Loading state management
- Metadata validation

### 2. Service Layer Tests

#### WorkflowService Tests
```typescript
describe('WorkflowService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should save workflow successfully', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await WorkflowService.saveWorkflow(request);
    
    expect(fetch).toHaveBeenCalledWith('/api/workflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    expect(result).toEqual(mockResponse);
  });
});
```

#### AgentService Tests
- Agent fetching and parsing
- Category filtering
- Search functionality
- Error handling

### 3. Integration Tests

#### Drag & Drop Integration
```typescript
describe('Drag and Drop Integration', () => {
  it('should handle drag start event', () => {
    const mockDataTransfer = {
      setData: vi.fn(),
      setDragImage: vi.fn(),
    };

    fireEvent.dragStart(agentCard!, {
      dataTransfer: mockDataTransfer,
    });

    expect(mockDataTransfer.setData).toHaveBeenCalledWith(
      'application/reactflow', 'agent'
    );
  });
});
```

#### Workflow Editor Integration
- Canvas and panel interactions
- Node selection and updates
- Edge creation and management
- Properties panel updates

## 🏃‍♂️ Running Tests

### Development Commands
```bash
# Run all tests
npm run test

# Watch mode (recommended for development)
npm run test:watch

# Coverage report
npm run test:coverage

# Visual test runner
npm run test:ui

# Run specific test file
npm run test useWorkflowEditor

# Run tests in specific directory
npm run test hooks
```

### CI/CD Commands
```bash
# Production test run
npm run test:run

# Type checking
npm run type-check

# Lint checking
npm run lint
```

## 🎭 Mocking Strategy

### MSW (Mock Service Worker)
```typescript
// src/test/mocks/handlers.ts
export const handlers = [
  http.get('/api/agents', () => {
    return HttpResponse.json({
      success: true,
      agents: mockAgents,
    });
  }),

  http.post('/api/workflows', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      workflowId: 'mock-id',
    });
  }),
];
```

### Component Mocks
```typescript
// React Flow mocking
vi.mock('@xyflow/react', () => ({
  ReactFlow: ({ children, ...props }: any) => 
    React.createElement('div', { 'data-testid': 'react-flow', ...props }, children),
  ReactFlowProvider: ({ children }: any) => children,
  useReactFlow: () => ({
    screenToFlowPosition: vi.fn((pos) => pos),
  }),
}));
```

### Next.js Router Mocking
```typescript
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => '/editor',
}));
```

## 📈 Coverage Targets

### Current Coverage
- **Hooks**: 90%+ (critical business logic)
- **Services**: 85%+ (API interactions)
- **Components**: 70%+ (UI functionality)
- **Integration**: 80%+ (user workflows)

### Coverage Configuration
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
});
```

## 🐛 Testing Best Practices

### 1. Test Organization
- One test file per source file
- Group related tests in `describe` blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

### 2. Mock Management
- Mock external dependencies
- Use MSW for API mocking
- Reset mocks between tests
- Mock at the appropriate level

### 3. Async Testing
```typescript
// Correct async testing
it('should load agents on mount', async () => {
  const { result } = renderHook(() => useAgents());

  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });

  expect(result.current.agents).toEqual(mockAgents);
});
```

### 4. Error Testing
```typescript
// Test error scenarios
it('should handle loading error', async () => {
  vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

  const { result } = renderHook(() => useAgents());

  await waitFor(() => {
    expect(result.current.error).toBe('Network error');
  });
});
```

## 🚀 Continuous Integration

### GitHub Actions (Planned)
```yaml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run test:coverage
```

### Pre-commit Hooks (Recommended)
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run type-check && npm run lint",
      "pre-push": "npm run test:run"
    }
  }
}
```

## 🎯 Testing Checklist

### For New Features
- [ ] Unit tests for business logic
- [ ] Integration tests for user interactions
- [ ] Error handling tests
- [ ] Loading state tests
- [ ] API endpoint tests

### For Bug Fixes
- [ ] Reproduction test case
- [ ] Fix validation test
- [ ] Regression prevention test

### Before Release
- [ ] All tests passing
- [ ] Coverage targets met
- [ ] No TypeScript errors
- [ ] ESLint passing
- [ ] Manual smoke testing

## 📚 Related Documentation

- [Development Guide](../development/DEVELOPMENT_GUIDE.md)
- [Code Standards](../development/CODE_STANDARDS.md)
- [Technical Architecture](../architecture/TECHNICAL_ARCHITECTURE.md)

---

**Test Coverage Goal**: 80%+ overall
**Current Status**: Infrastructure complete, tests implemented
**Next Steps**: E2E testing, performance testing