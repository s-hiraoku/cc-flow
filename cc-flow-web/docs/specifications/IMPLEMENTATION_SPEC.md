# CC-Flow Web Editor Implementation Specification

## Executive Summary

This document provides a comprehensive implementation specification for the cc-flow-web project, a Next.js-based visual workflow editor for the CC-Flow system. The specification details the current implementation status, technical architecture, roadmap, and actionable guidance for developers.

**Current Status (✅ Phase 1 Complete)**
- Next.js 15 app with ReactFlow visual editor running on localhost:3002
- Core component structure implemented: Canvas, AgentPalette, PropertiesPanel
- TypeScript types and API routes functional
- Model selection and real-time JSON preview working

## 1. Implementation Roadmap and Task Breakdown

### Phase 2: Enhanced Functionality (Current Focus)
**Priority: High | Duration: 2-3 weeks**

#### 2.1 Workflow Execution Integration
- [ ] **Task 2.1.1**: Implement workflow execution preview
  - Add `/api/workflows/execute` endpoint
  - Create execution status tracking UI
  - Integrate with cc-flow-cli execution engine
  - **Files**: `src/app/api/workflows/execute/route.ts`, `src/components/panels/ExecutionPanel.tsx`

- [ ] **Task 2.1.2**: Add workflow validation system
  - Implement comprehensive validation rules
  - Add real-time error highlighting in editor
  - Create validation status indicators
  - **Files**: `src/lib/validation.ts`, `src/components/workflow-editor/ValidationOverlay.tsx`

#### 2.2 Step Group Management
- [ ] **Task 2.2.1**: Enhanced step group functionality
  - Implement drag-to-group operations
  - Add sequential/parallel mode toggles
  - Create step group configuration UI
  - **Files**: `src/components/workflow-editor/StepGroupNode.tsx`, `src/lib/step-group-manager.ts`

- [ ] **Task 2.2.2**: Advanced graph analysis
  - Implement dependency cycle detection
  - Add optimal execution order suggestions
  - Create workflow complexity metrics
  - **Files**: `src/lib/graph-analyzer.ts`, `src/components/panels/AnalysisPanel.tsx`

#### 2.3 User Experience Enhancements
- [ ] **Task 2.3.1**: Keyboard navigation and shortcuts
  - Implement standard editor shortcuts (Ctrl+S, Ctrl+Z, Delete)
  - Add node selection and multi-selection
  - Create hotkey help overlay
  - **Files**: `src/hooks/useKeyboardShortcuts.ts`, `src/components/ui/HotkeyHelp.tsx`

- [ ] **Task 2.3.2**: Improved drag-and-drop experience
  - Add visual drop zones and indicators
  - Implement snap-to-grid functionality
  - Create connection guides and suggestions
  - **Files**: `src/components/workflow-editor/DropZone.tsx`, `src/lib/snap-to-grid.ts`

### Phase 3: Advanced Features (Next Phase)
**Priority: Medium | Duration: 2-3 weeks**

#### 3.1 Workflow Templates and Presets
- [ ] **Task 3.1.1**: Template system implementation
- [ ] **Task 3.1.2**: Common workflow patterns library
- [ ] **Task 3.1.3**: Custom template creation and sharing

#### 3.2 Integration and Export Features
- [ ] **Task 3.2.1**: Direct cc-flow-cli integration
- [ ] **Task 3.2.2**: Export to multiple formats (JSON, YAML, POML)
- [ ] **Task 3.2.3**: Import existing workflows

#### 3.3 Collaboration Features
- [ ] **Task 3.3.1**: Workflow sharing and versioning
- [ ] **Task 3.3.2**: Comments and annotation system
- [ ] **Task 3.3.3**: Real-time collaborative editing

## 2. Code Structure and File Organization Patterns

### 2.1 Current Architecture Overview

```
cc-flow-web/
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── api/                 # API Routes
│   │   │   ├── agents/          # Agent discovery
│   │   │   └── workflows/       # Workflow management
│   │   ├── editor/              # Main editor interface
│   │   └── page.tsx             # Landing page
│   ├── components/              # React components
│   │   ├── workflow-editor/     # Core editor components
│   │   ├── panels/              # Side panels (Agent, Properties)
│   │   └── ui/                  # Reusable UI components
│   ├── lib/                     # Business logic and utilities
│   ├── types/                   # TypeScript type definitions
│   └── hooks/                   # Custom React hooks
```

### 2.2 Component Hierarchy and Organization

#### 2.2.1 Core Editor Components

**Canvas Component** (`src/components/workflow-editor/Canvas.tsx`)
```typescript
interface CanvasProps {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  onNodesChange: (nodes: WorkflowNode[]) => void;
  onEdgesChange: (edges: WorkflowEdge[]) => void;
  onConnect: (connection: Connection) => void;
  className?: string;
}

// Implementation patterns:
// - Use ReactFlow hooks for state management
// - Implement custom node types (agent, step-group)
// - Handle drag-and-drop from AgentPalette
// - Provide real-time updates to parent component
```

**Node Components**
- `AgentNode.tsx`: Individual agent representation
- `StepGroupNode.tsx`: Group of agents with execution mode
- `StartNode.tsx`: Workflow start point
- `EndNode.tsx`: Workflow completion point

#### 2.2.2 Panel Components

**AgentPalette** (`src/components/panels/AgentPalette.tsx`)
```typescript
interface AgentPaletteProps {
  agents: Agent[];
  onAgentDragStart: (agent: Agent) => void;
  searchFilter?: string;
  categoryFilter?: string;
}

// Key features:
// - Categorized agent listing
// - Search and filter functionality
// - Drag initiation for Canvas
// - Agent metadata display
```

**PropertiesPanel** (`src/components/panels/PropertiesPanel.tsx`)
```typescript
interface PropertiesPanelProps {
  metadata: WorkflowMetadata;
  onMetadataChange: (metadata: WorkflowMetadata) => void;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNode?: WorkflowNode;
}

// Current implementation includes:
// - Workflow metadata editing
// - Model selection (Claude variants)
// - Real-time JSON preview
// - Workflow statistics
```

### 2.3 Recommended File Organization Patterns

#### 2.3.1 Feature-Based Organization
```
src/
├── features/
│   ├── workflow-editor/
│   │   ├── components/          # Feature-specific components
│   │   ├── hooks/               # Feature-specific hooks
│   │   ├── utils/               # Feature utilities
│   │   └── types.ts             # Feature types
│   ├── agent-management/
│   └── workflow-execution/
```

#### 2.3.2 Component Co-location Pattern
```
src/components/workflow-editor/Canvas/
├── Canvas.tsx                   # Main component
├── Canvas.test.tsx             # Unit tests
├── Canvas.stories.tsx          # Storybook stories
├── hooks/
│   ├── useCanvasDragDrop.ts    # Canvas-specific hooks
│   └── useCanvasKeyboard.ts
└── utils/
    ├── nodePositioning.ts      # Canvas utilities
    └── edgeCalculation.ts
```

## 3. Component Implementation Details and Props Interfaces

### 3.1 Core Type Definitions

```typescript
// src/types/workflow.ts (Current Implementation)
export interface WorkflowMetadata {
  workflowName: string;
  workflowPurpose: string;
  workflowModel?: string;
  workflowArgumentHint?: string;
}

export interface WorkflowNode {
  id: string;
  type: 'agent' | 'step-group' | 'start' | 'end';
  data: WorkflowNodeData;
  position: { x: number; y: number };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  type?: 'default' | 'step';
  data?: {
    condition?: string;
  };
}
```

### 3.2 Enhanced Component Interfaces

#### 3.2.1 Advanced Canvas Props
```typescript
interface EnhancedCanvasProps extends CanvasProps {
  // Selection management
  selectedNodes: string[];
  selectedEdges: string[];
  onSelectionChange: (selection: { nodes: string[]; edges: string[] }) => void;

  // Interaction modes
  mode: 'select' | 'connect' | 'pan';
  onModeChange: (mode: string) => void;

  // Validation and feedback
  validationErrors: ValidationError[];
  showValidation: boolean;

  // Performance optimization
  viewport: ReactFlowViewport;
  onViewportChange: (viewport: ReactFlowViewport) => void;
}
```

#### 3.2.2 Agent Node Enhanced Interface
```typescript
interface AgentNodeData {
  // Core data
  agentName: string;
  agentPath: string;
  label: string;
  description: string;

  // Execution metadata
  executionOrder?: number;
  estimatedDuration?: number;
  dependencies: string[];

  // UI state
  isSelected: boolean;
  hasValidationError: boolean;
  executionStatus?: 'pending' | 'running' | 'completed' | 'error';
}

interface AgentNodeProps {
  data: AgentNodeData;
  selected: boolean;
  onDataChange: (data: Partial<AgentNodeData>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}
```

### 3.3 Props Interface Standards

#### 3.3.1 Event Handler Patterns
```typescript
// Consistent event handler naming
interface ComponentProps {
  // Data handlers (always onXChange)
  onDataChange: (data: T) => void;
  onSelectionChange: (selection: Selection) => void;

  // Action handlers (always onXAction)
  onSave: () => Promise<void>;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;

  // UI interaction handlers
  onFocus: (element: string) => void;
  onBlur: () => void;
  onClick: (event: MouseEvent) => void;
}
```

#### 3.3.2 Configuration Props Pattern
```typescript
interface ComponentConfig {
  // Feature flags
  enableKeyboardShortcuts: boolean;
  enableDragAndDrop: boolean;
  enableMultiSelect: boolean;

  // UI customization
  theme: 'light' | 'dark';
  size: 'sm' | 'md' | 'lg';
  variant: 'default' | 'compact' | 'detailed';

  // Performance settings
  maxNodes: number;
  updateDebounceMs: number;
  enableVirtualization: boolean;
}
```

## 4. State Management Patterns and Data Flow

### 4.1 Current State Architecture

#### 4.1.1 Editor Page State Structure
```typescript
// src/app/editor/page.tsx (Current Implementation)
const EditorPage = () => {
  // Core workflow state
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [edges, setEdges] = useState<WorkflowEdge[]>([]);
  const [metadata, setMetadata] = useState<WorkflowMetadata>({
    workflowName: "",
    workflowPurpose: "",
    workflowModel: "default",
    workflowArgumentHint: "",
  });

  // UI state
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  // Event handlers implement unidirectional data flow
  const handleNodesChange = useCallback((newNodes: WorkflowNode[]) => {
    setNodes(newNodes);
    // Additional side effects (validation, analytics, etc.)
  }, []);
};
```

### 4.2 Recommended State Management Patterns

#### 4.2.1 Context-Based State Management
```typescript
// src/contexts/WorkflowContext.tsx
interface WorkflowContextType {
  // State
  workflow: {
    metadata: WorkflowMetadata;
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
  };

  // Actions
  actions: {
    updateMetadata: (metadata: Partial<WorkflowMetadata>) => void;
    addNode: (node: WorkflowNode) => void;
    updateNode: (id: string, updates: Partial<WorkflowNode>) => void;
    removeNode: (id: string) => void;
    addEdge: (edge: WorkflowEdge) => void;
    removeEdge: (id: string) => void;
  };

  // Computed values
  computed: {
    isValid: boolean;
    canSave: boolean;
    executionOrder: string[];
    validationErrors: ValidationError[];
  };
}

const WorkflowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(workflowReducer, initialState);

  // Memoized computed values
  const computed = useMemo(() => ({
    isValid: validateWorkflow(state),
    canSave: state.metadata.workflowName.length > 0,
    executionOrder: calculateExecutionOrder(state.nodes, state.edges),
    validationErrors: validateWorkflowStructure(state),
  }), [state]);

  const value = {
    workflow: state,
    actions: bindActionCreators(actions, dispatch),
    computed,
  };

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  );
};
```

#### 4.2.2 Custom Hooks for State Management
```typescript
// src/hooks/useWorkflowState.ts
export const useWorkflowState = () => {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflowState must be used within WorkflowProvider');
  }
  return context;
};

// src/hooks/useAutoSave.ts
export const useAutoSave = (workflow: Workflow, interval = 30000) => {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const autoSaveInterval = setInterval(async () => {
      if (workflow.metadata.workflowName && !isSaving) {
        setIsSaving(true);
        try {
          await saveWorkflow(workflow);
          setLastSaved(new Date());
        } catch (error) {
          console.error('Auto-save failed:', error);
        } finally {
          setIsSaving(false);
        }
      }
    }, interval);

    return () => clearInterval(autoSaveInterval);
  }, [workflow, interval, isSaving]);

  return { lastSaved, isSaving };
};
```

### 4.3 Data Flow Patterns

#### 4.3.1 Unidirectional Data Flow
```
User Interaction → Action Creator → Reducer → State Update → Component Re-render
                                      ↓
                               Side Effects (API calls, validation)
```

#### 4.3.2 Event-Driven Architecture
```typescript
// src/lib/event-system.ts
interface WorkflowEvent {
  type: string;
  payload: any;
  timestamp: Date;
  source: string;
}

class WorkflowEventBus {
  private listeners: Map<string, Function[]> = new Map();

  emit(event: WorkflowEvent) {
    const handlers = this.listeners.get(event.type) || [];
    handlers.forEach(handler => handler(event));
  }

  on(eventType: string, handler: Function) {
    const handlers = this.listeners.get(eventType) || [];
    this.listeners.set(eventType, [...handlers, handler]);
  }

  off(eventType: string, handler: Function) {
    const handlers = this.listeners.get(eventType) || [];
    this.listeners.set(eventType, handlers.filter(h => h !== handler));
  }
}

// Usage in components
const { emit } = useWorkflowEvents();

const handleNodeAdd = (node: WorkflowNode) => {
  emit({
    type: 'NODE_ADDED',
    payload: { node },
    timestamp: new Date(),
    source: 'AgentPalette'
  });
};
```

## 5. API Implementation with Error Handling

### 5.1 Current API Routes Analysis

#### 5.1.1 Agent Discovery API (`/api/agents`)
**Current Implementation Strengths:**
- Recursive directory scanning
- Category-based organization
- Error handling for file system operations
- Markdown parsing for descriptions

**Recommended Enhancements:**
```typescript
// src/app/api/agents/route.ts (Enhanced)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const agentsPath = join(process.cwd(), AGENTS_BASE_PATH);

    // Implement caching for performance
    const cacheKey = `agents-${category}-${search}-${limit}-${offset}`;
    const cached = await getFromCache(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const allAgents = await scanAgentsDirectory(agentsPath, {
      category,
      search,
      limit,
      offset
    });

    // Enhanced error handling
    const response = {
      agents: allAgents,
      pagination: {
        total: allAgents.length,
        limit,
        offset,
        hasMore: allAgents.length === limit
      },
      categories: await getAvailableCategories(agentsPath)
    };

    await setCache(cacheKey, response, 300); // 5 min cache

    return NextResponse.json(response);
  } catch (error) {
    logger.error('Failed to fetch agents:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch agents',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        code: 'AGENT_FETCH_ERROR'
      },
      { status: 500 }
    );
  }
}
```

#### 5.1.2 Workflow Management API (`/api/workflows`)

**Enhanced Implementation:**
```typescript
// src/app/api/workflows/route.ts (Enhanced)
export async function POST(request: NextRequest) {
  try {
    const body: SaveWorkflowRequest = await request.json();

    // Input validation
    const validationResult = validateWorkflowRequest(body);
    if (!validationResult.valid) {
      return NextResponse.json(
        {
          error: 'Invalid workflow data',
          validationErrors: validationResult.errors
        },
        { status: 400 }
      );
    }

    const { metadata, nodes, edges } = body;

    // Convert and validate workflow structure
    const workflowSteps = await convertToWorkflowSteps(nodes, edges);
    if (workflowSteps.length === 0) {
      return NextResponse.json(
        { error: 'Workflow must contain at least one step' },
        { status: 400 }
      );
    }

    // Create POML workflow with enhanced metadata
    const pomlWorkflow: POMLWorkflow = {
      workflowName: metadata.workflowName,
      workflowPurpose: metadata.workflowPurpose,
      workflowModel: metadata.workflowModel,
      workflowArgumentHint: metadata.workflowArgumentHint,
      workflowSteps,
      metadata: {
        createdAt: new Date().toISOString(),
        version: '1.0.0',
        nodeCount: nodes.length,
        edgeCount: edges.length,
        complexity: calculateComplexity(nodes, edges)
      }
    };

    // Atomic file operations
    const result = await saveWorkflowAtomic(pomlWorkflow);

    return NextResponse.json({
      success: true,
      message: 'Workflow saved successfully',
      ...result
    });

  } catch (error) {
    logger.error('Failed to save workflow:', error);

    // Detailed error responses
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message, code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    if (error instanceof FileSystemError) {
      return NextResponse.json(
        { error: 'Failed to save workflow file', code: 'FILESYSTEM_ERROR' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', code: 'UNKNOWN_ERROR' },
      { status: 500 }
    );
  }
}
```

### 5.2 Enhanced API Routes

#### 5.2.1 Workflow Validation API
```typescript
// src/app/api/workflows/validate/route.ts
export async function POST(request: NextRequest) {
  try {
    const { metadata, nodes, edges } = await request.json();

    const validationResults = await validateWorkflow({
      metadata,
      nodes,
      edges
    });

    return NextResponse.json({
      valid: validationResults.errors.length === 0,
      errors: validationResults.errors,
      warnings: validationResults.warnings,
      suggestions: validationResults.suggestions
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Validation failed' },
      { status: 500 }
    );
  }
}
```

#### 5.2.2 Workflow Execution API
```typescript
// src/app/api/workflows/execute/route.ts
export async function POST(request: NextRequest) {
  try {
    const { workflowId, context, options } = await request.json();

    // Start workflow execution
    const executionId = await startWorkflowExecution(workflowId, context, options);

    return NextResponse.json({
      executionId,
      status: 'started',
      estimatedDuration: await estimateExecutionTime(workflowId)
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to start workflow execution' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const executionId = searchParams.get('executionId');

  if (!executionId) {
    return NextResponse.json(
      { error: 'Execution ID required' },
      { status: 400 }
    );
  }

  try {
    const status = await getExecutionStatus(executionId);
    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get execution status' },
      { status: 500 }
    );
  }
}
```

### 5.3 Error Handling Patterns

#### 5.3.1 Centralized Error Handling
```typescript
// src/lib/api-error-handler.ts
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export const handleAPIError = (error: unknown): NextResponse => {
  if (error instanceof APIError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        details: error.details
      },
      { status: error.status }
    );
  }

  if (error instanceof ValidationError) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.errors
      },
      { status: 400 }
    );
  }

  logger.error('Unhandled API error:', error);

  return NextResponse.json(
    {
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    },
    { status: 500 }
  );
};
```

#### 5.3.2 Client-Side Error Handling
```typescript
// src/lib/api-client.ts
export class APIClient {
  private baseURL: string;

  constructor(baseURL = '/api') {
    this.baseURL = baseURL;
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new APIError(
          errorData.error || 'Request failed',
          response.status,
          errorData.code || 'UNKNOWN_ERROR',
          errorData.details
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }

      // Network or parsing errors
      throw new APIError(
        'Network error occurred',
        0,
        'NETWORK_ERROR',
        error
      );
    }
  }

  // Convenience methods
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

// Usage in components
const useAPIClient = () => {
  const client = useMemo(() => new APIClient(), []);

  const saveWorkflow = useCallback(async (workflow: Workflow) => {
    try {
      return await client.post('/workflows', workflow);
    } catch (error) {
      if (error instanceof APIError) {
        // Handle specific error types
        switch (error.code) {
          case 'VALIDATION_ERROR':
            toast.error('Please fix validation errors before saving');
            break;
          case 'FILESYSTEM_ERROR':
            toast.error('Failed to save workflow file');
            break;
          default:
            toast.error('Failed to save workflow');
        }
      }
      throw error;
    }
  }, [client]);

  return { saveWorkflow };
};
```

## 6. Testing Strategy and Quality Assurance

### 6.1 Testing Architecture

#### 6.1.1 Testing Pyramid Structure
```
E2E Tests (Cypress/Playwright)        [10%]
    ↓
Integration Tests (React Testing Library)  [20%]
    ↓
Unit Tests (Jest/Vitest)              [70%]
```

#### 6.1.2 Unit Testing Strategy
```typescript
// src/components/workflow-editor/__tests__/Canvas.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Canvas from '../Canvas';
import { WorkflowNode, WorkflowEdge } from '@/types/workflow';

const mockNodes: WorkflowNode[] = [
  {
    id: 'node-1',
    type: 'agent',
    position: { x: 100, y: 100 },
    data: {
      label: 'Test Agent',
      agentName: 'test-agent',
      agentPath: '/path/to/agent',
      description: 'Test agent description'
    }
  }
];

const mockEdges: WorkflowEdge[] = [];

const CanvasWrapper = ({ children }: { children: React.ReactNode }) => (
  <DndProvider backend={HTML5Backend}>
    {children}
  </DndProvider>
);

describe('Canvas Component', () => {
  const mockProps = {
    nodes: mockNodes,
    edges: mockEdges,
    onNodesChange: jest.fn(),
    onEdgesChange: jest.fn(),
    onConnect: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders canvas with nodes', () => {
    render(
      <CanvasWrapper>
        <Canvas {...mockProps} />
      </CanvasWrapper>
    );

    expect(screen.getByText('Test Agent')).toBeInTheDocument();
  });

  it('calls onNodesChange when node is moved', async () => {
    const { container } = render(
      <CanvasWrapper>
        <Canvas {...mockProps} />
      </CanvasWrapper>
    );

    const node = container.querySelector('[data-id="node-1"]');
    expect(node).toBeInTheDocument();

    // Simulate drag operation
    fireEvent.mouseDown(node!);
    fireEvent.mouseMove(node!, { clientX: 200, clientY: 200 });
    fireEvent.mouseUp(node!);

    expect(mockProps.onNodesChange).toHaveBeenCalled();
  });

  it('handles agent drop from palette', () => {
    const { container } = render(
      <CanvasWrapper>
        <Canvas {...mockProps} />
      </CanvasWrapper>
    );

    const canvas = container.querySelector('.react-flow');

    // Simulate drop event
    const dropEvent = new Event('drop', { bubbles: true });
    Object.defineProperty(dropEvent, 'dataTransfer', {
      value: {
        getData: jest.fn()
          .mockReturnValueOnce('agent')
          .mockReturnValueOnce(JSON.stringify({
            name: 'new-agent',
            path: '/path/to/new-agent',
            description: 'New agent'
          }))
      }
    });

    fireEvent(canvas!, dropEvent);

    expect(mockProps.onNodesChange).toHaveBeenCalled();
  });
});
```

#### 6.1.3 API Testing Strategy
```typescript
// src/app/api/__tests__/agents.test.ts
import { GET } from '../agents/route';
import { NextRequest } from 'next/server';
import { jest } from '@jest/globals';
import fs from 'fs/promises';

// Mock file system
jest.mock('fs/promises');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('/api/agents', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns agents list successfully', async () => {
    // Mock file system responses
    mockFs.readdir.mockResolvedValue(['spec', 'utility'] as any);
    mockFs.stat.mockResolvedValue({ isDirectory: () => true } as any);
    mockFs.readFile.mockResolvedValue(`
# Test Agent
This is a test agent for unit testing.
    `);

    const request = new NextRequest('http://localhost:3000/api/agents');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.categories).toBeDefined();
    expect(Array.isArray(data.categories.spec?.agents)).toBe(true);
  });

  it('handles file system errors gracefully', async () => {
    mockFs.readdir.mockRejectedValue(new Error('Permission denied'));

    const request = new NextRequest('http://localhost:3000/api/agents');
    const response = await GET(request);

    expect(response.status).toBe(500);

    const data = await response.json();
    expect(data.error).toBe('Failed to fetch agents');
  });

  it('filters agents by category', async () => {
    const request = new NextRequest('http://localhost:3000/api/agents?category=spec');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    // Verify only spec category agents are returned
  });
});
```

### 6.2 Integration Testing

#### 6.2.1 Component Integration Tests
```typescript
// src/__tests__/integration/workflow-creation.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditorPage from '@/app/editor/page';
import { server } from '@/mocks/server';

describe('Workflow Creation Integration', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('completes full workflow creation flow', async () => {
    const user = userEvent.setup();

    render(<EditorPage />);

    // Wait for agents to load
    await waitFor(() => {
      expect(screen.getByText('Agent Palette')).toBeInTheDocument();
    });

    // Create workflow name
    const nameInput = screen.getByLabelText('Workflow Name');
    await user.type(nameInput, 'test-workflow');

    // Add purpose
    const purposeInput = screen.getByLabelText('Purpose');
    await user.type(purposeInput, 'Test workflow for integration testing');

    // Drag agent to canvas
    const agent = screen.getByText('test-agent');
    const canvas = screen.getByTestId('workflow-canvas');

    // Simulate drag and drop
    fireEvent.dragStart(agent);
    fireEvent.dragOver(canvas);
    fireEvent.drop(canvas);

    // Verify node appears on canvas
    await waitFor(() => {
      expect(screen.getByText('test-agent')).toBeInTheDocument();
    });

    // Save workflow
    const saveButton = screen.getByText('Save Workflow');
    await user.click(saveButton);

    // Verify success message
    await waitFor(() => {
      expect(screen.getByText(/Workflow.*saved successfully/)).toBeInTheDocument();
    });
  });
});
```

#### 6.2.2 API Integration Tests
```typescript
// src/__tests__/integration/api-workflow.test.ts
import { testApiHandler } from 'next-test-api-route-handler';
import * as workflowsHandler from '@/app/api/workflows/route';

describe('/api/workflows integration', () => {
  it('saves and retrieves workflow', async () => {
    const testWorkflow = {
      metadata: {
        workflowName: 'test-integration-workflow',
        workflowPurpose: 'Integration test workflow'
      },
      nodes: [
        {
          id: 'node-1',
          type: 'agent',
          data: { agentName: 'test-agent', label: 'Test Agent' },
          position: { x: 0, y: 0 }
        }
      ],
      edges: []
    };

    // Test POST
    await testApiHandler({
      handler: workflowsHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'POST',
          body: JSON.stringify(testWorkflow)
        });

        expect(res.status).toBe(200);

        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.filename).toContain('test-integration-workflow');
      }
    });
  });
});
```

### 6.3 End-to-End Testing

#### 6.3.1 Playwright E2E Tests
```typescript
// e2e/workflow-editor.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Workflow Editor E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/editor');
    await page.waitForLoadState('networkidle');
  });

  test('creates a complete workflow', async ({ page }) => {
    // Fill workflow metadata
    await page.fill('[data-testid="workflow-name"]', 'e2e-test-workflow');
    await page.fill('[data-testid="workflow-purpose"]', 'End-to-end test workflow');

    // Select model
    await page.click('[data-testid="model-select"]');
    await page.click('text=Claude Sonnet 4');

    // Drag agent from palette to canvas
    const agent = page.locator('[data-testid="agent-spec-agent"]');
    const canvas = page.locator('[data-testid="workflow-canvas"]');

    await agent.dragTo(canvas, {
      targetPosition: { x: 200, y: 200 }
    });

    // Verify node appears
    await expect(page.locator('.react-flow__node')).toBeVisible();

    // Add second agent
    const utilityAgent = page.locator('[data-testid="agent-utility-agent"]');
    await utilityAgent.dragTo(canvas, {
      targetPosition: { x: 400, y: 200 }
    });

    // Connect nodes
    const firstNode = page.locator('.react-flow__node').first();
    const secondNode = page.locator('.react-flow__node').last();

    await firstNode.locator('.react-flow__handle-right').click();
    await secondNode.locator('.react-flow__handle-left').click();

    // Verify connection
    await expect(page.locator('.react-flow__edge')).toBeVisible();

    // Save workflow
    await page.click('[data-testid="save-workflow"]');

    // Verify success message
    await expect(page.locator('text=saved successfully')).toBeVisible();

    // Verify JSON preview
    const jsonPreview = page.locator('[data-testid="json-preview"]');
    await expect(jsonPreview).toContainText('e2e-test-workflow');
    await expect(jsonPreview).toContainText('workflowSteps');
  });

  test('validates workflow before saving', async ({ page }) => {
    // Try to save without workflow name
    await page.click('[data-testid="save-workflow"]');

    // Should show validation error
    await expect(page.locator('text=Workflow name is required')).toBeVisible();

    // Fill required fields
    await page.fill('[data-testid="workflow-name"]', 'validation-test');

    // Should be able to save now
    await page.click('[data-testid="save-workflow"]');
    await expect(page.locator('text=saved successfully')).toBeVisible();
  });

  test('handles keyboard shortcuts', async ({ page }) => {
    // Add agent to canvas
    const agent = page.locator('[data-testid="agent-spec-agent"]');
    const canvas = page.locator('[data-testid="workflow-canvas"]');
    await agent.dragTo(canvas);

    // Select node
    await page.click('.react-flow__node');

    // Delete with keyboard shortcut
    await page.keyboard.press('Delete');

    // Verify node is removed
    await expect(page.locator('.react-flow__node')).not.toBeVisible();
  });
});
```

### 6.4 Testing Configuration

#### 6.4.1 Jest Configuration
```javascript
// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};

module.exports = createJestConfig(customJestConfig);
```

#### 6.4.2 Testing Setup
```typescript
// jest.setup.js
import '@testing-library/jest-dom';
import { server } from './src/mocks/server';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

// Mock React Flow
jest.mock('@xyflow/react', () => ({
  ...jest.requireActual('@xyflow/react'),
  useReactFlow: () => ({
    fitView: jest.fn(),
    zoomIn: jest.fn(),
    zoomOut: jest.fn(),
  }),
}));

// Setup MSW
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## 7. Build and Deployment Configuration

### 7.1 Build Configuration

#### 7.1.1 Next.js Configuration
```typescript
// next.config.ts (Enhanced)
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable SWC for faster builds
  swcMinify: true,

  // Performance optimizations
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },

  // Bundle analysis
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimize bundle size
    if (!dev) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          reactflow: {
            test: /[\\/]node_modules[\\/]@xyflow[\\/]/,
            name: 'reactflow',
            chunks: 'all',
          },
        },
      };
    }

    // Add bundle analyzer in development
    if (dev && process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          openAnalyzer: true,
        })
      );
    }

    return config;
  },

  // Environment variables
  env: {
    AGENTS_PATH: process.env.AGENTS_PATH || '../.claude/agents',
    WORKFLOWS_PATH: process.env.WORKFLOWS_PATH || '../workflows',
    NODE_ENV: process.env.NODE_ENV,
  },

  // Output configuration
  output: 'standalone',

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

#### 7.1.2 TypeScript Configuration
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES2022"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/types/*": ["./src/types/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/utils/*": ["./src/utils/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": [
    "node_modules",
    ".next",
    "dist",
    "coverage"
  ]
}
```

#### 7.1.3 Build Scripts
```json
{
  "scripts": {
    "dev": "next dev -p 3002",
    "build": "next build",
    "start": "next start -p 3002",
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "analyze": "ANALYZE=true npm run build",
    "validate": "npm run type-check && npm run lint && npm run test",
    "clean": "rm -rf .next dist coverage"
  }
}
```

### 7.2 Development Environment

#### 7.2.1 Environment Variables
```bash
# .env.local (Development)
NODE_ENV=development
AGENTS_PATH=../.claude/agents
WORKFLOWS_PATH=../workflows
NEXT_PUBLIC_API_URL=http://localhost:3002/api

# Development flags
ANALYZE=false
DEBUG_MODE=true
LOG_LEVEL=debug

# Performance monitoring
ENABLE_PERFORMANCE_MONITORING=true
```

```bash
# .env.production (Production)
NODE_ENV=production
AGENTS_PATH=/app/.claude/agents
WORKFLOWS_PATH=/app/workflows
NEXT_PUBLIC_API_URL=/api

# Security
ENABLE_SECURITY_HEADERS=true
ENABLE_CSP=true

# Performance
ENABLE_ANALYTICS=false
ENABLE_ERROR_REPORTING=true
```

#### 7.2.2 Development Setup Script
```bash
#!/bin/bash
# scripts/dev-setup.sh

echo "Setting up CC-Flow Web development environment..."

# Install dependencies
npm install

# Create necessary directories
mkdir -p ../.claude/agents
mkdir -p ../workflows

# Copy sample agents if they don't exist
if [ ! -d "../.claude/agents/spec" ]; then
  echo "Creating sample agents..."
  mkdir -p ../.claude/agents/spec
  cat > ../.claude/agents/spec/sample-agent.md << EOF
# Sample Agent

This is a sample agent for development and testing.

## Description
A simple agent that demonstrates the basic structure.
EOF
fi

# Setup environment file
if [ ! -f ".env.local" ]; then
  cp .env.example .env.local
  echo "Created .env.local from example"
fi

# Install Playwright browsers for E2E testing
npx playwright install

echo "Development setup complete!"
echo "Run 'npm run dev' to start the development server"
```

### 7.3 Production Deployment

#### 7.3.1 Docker Configuration
```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3002

ENV PORT 3002
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  cc-flow-web:
    build: .
    ports:
      - "3002:3002"
    environment:
      - NODE_ENV=production
      - AGENTS_PATH=/app/.claude/agents
      - WORKFLOWS_PATH=/app/workflows
    volumes:
      - ./.claude:/app/.claude:ro
      - ./workflows:/app/workflows
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3002/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

#### 7.3.2 CI/CD Pipeline
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run type-check

      - name: Lint
        run: npm run lint

      - name: Unit tests
        run: npm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3

      - name: Install Playwright
        run: npx playwright install

      - name: E2E tests
        run: npm run test:e2e

      - name: Build application
        run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v4

      - name: Setup Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: cc-flow-web:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

## 8. Integration Testing with cc-flow CLI

### 8.1 CLI Integration Architecture

#### 8.1.1 Command Integration
```typescript
// cc-flow-cli/src/commands/web.ts
import { spawn, ChildProcess } from 'child_process';
import { join } from 'path';
import open from 'open';

interface WebCommandOptions {
  port: number;
  open: boolean;
  dev: boolean;
  verbose: boolean;
}

export class WebEditorLauncher {
  private server: ChildProcess | null = null;
  private webAppPath: string;

  constructor() {
    this.webAppPath = join(__dirname, '../../../cc-flow-web');
  }

  async launch(options: WebCommandOptions): Promise<void> {
    try {
      // Check if web app exists
      await this.validateWebApp();

      // Start Next.js server
      await this.startServer(options);

      // Wait for server to be ready
      await this.waitForServer(options.port);

      console.log(`🌐 Web editor started at http://localhost:${options.port}`);

      // Open browser if requested
      if (options.open) {
        await open(`http://localhost:${options.port}/editor`);
      }

      // Setup graceful shutdown
      this.setupShutdownHandlers();

    } catch (error) {
      console.error('Failed to launch web editor:', error);
      throw error;
    }
  }

  private async validateWebApp(): Promise<void> {
    const packageJsonPath = join(this.webAppPath, 'package.json');

    try {
      await fs.access(packageJsonPath);
    } catch (error) {
      throw new Error(
        'CC-Flow Web app not found. Please ensure cc-flow-web is installed.'
      );
    }
  }

  private async startServer(options: WebCommandOptions): Promise<void> {
    const command = options.dev ? 'dev' : 'start';
    const args = ['run', command];

    this.server = spawn('npm', args, {
      cwd: this.webAppPath,
      env: {
        ...process.env,
        PORT: options.port.toString(),
        NODE_ENV: options.dev ? 'development' : 'production',
        AGENTS_PATH: process.env.AGENTS_PATH || '.claude/agents',
        WORKFLOWS_PATH: process.env.WORKFLOWS_PATH || 'workflows',
      },
      stdio: options.verbose ? 'inherit' : 'pipe',
    });

    this.server.on('error', (error) => {
      throw new Error(`Failed to start web server: ${error.message}`);
    });
  }

  private async waitForServer(port: number, timeout = 30000): Promise<void> {
    const startTime = Date.now();
    const url = `http://localhost:${port}`;

    while (Date.now() - startTime < timeout) {
      try {
        const response = await fetch(`${url}/api/health`);
        if (response.ok) {
          return;
        }
      } catch (error) {
        // Server not ready yet, continue waiting
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    throw new Error(`Web server failed to start within ${timeout}ms`);
  }

  private setupShutdownHandlers(): void {
    const shutdown = () => {
      if (this.server) {
        console.log('\nShutting down web editor...');
        this.server.kill('SIGTERM');

        // Force kill after 5 seconds
        setTimeout(() => {
          if (this.server && !this.server.killed) {
            this.server.kill('SIGKILL');
          }
        }, 5000);
      }
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  }
}

// Command definition
export const webCommand = {
  command: 'web [options]',
  describe: 'Launch web-based workflow editor',
  builder: (yargs: any) =>
    yargs
      .option('port', {
        alias: 'p',
        type: 'number',
        default: 3002,
        describe: 'Port number for web server'
      })
      .option('open', {
        alias: 'o',
        type: 'boolean',
        default: true,
        describe: 'Automatically open browser'
      })
      .option('dev', {
        alias: 'd',
        type: 'boolean',
        default: false,
        describe: 'Start in development mode'
      })
      .option('verbose', {
        alias: 'v',
        type: 'boolean',
        default: false,
        describe: 'Enable verbose logging'
      }),
  handler: async (args: any) => {
    const launcher = new WebEditorLauncher();
    await launcher.launch(args);
  }
};
```

#### 8.1.2 Bidirectional Communication
```typescript
// src/lib/cli-integration.ts
export class CLIIntegration {
  private static instance: CLIIntegration;
  private cliPath: string;

  private constructor() {
    this.cliPath = process.env.CLI_PATH || 'cc-flow';
  }

  static getInstance(): CLIIntegration {
    if (!CLIIntegration.instance) {
      CLIIntegration.instance = new CLIIntegration();
    }
    return CLIIntegration.instance;
  }

  async executeWorkflow(workflowPath: string, context: string): Promise<{
    success: boolean;
    output: string;
    error?: string;
  }> {
    return new Promise((resolve) => {
      const process = spawn(this.cliPath, [workflowPath, context], {
        stdio: 'pipe',
        shell: true
      });

      let output = '';
      let error = '';

      process.stdout?.on('data', (data) => {
        output += data.toString();
      });

      process.stderr?.on('data', (data) => {
        error += data.toString();
      });

      process.on('close', (code) => {
        resolve({
          success: code === 0,
          output,
          error: error || undefined
        });
      });

      process.on('error', (err) => {
        resolve({
          success: false,
          output: '',
          error: err.message
        });
      });
    });
  }

  async getAgentList(): Promise<Agent[]> {
    // Use CLI to discover agents instead of file system directly
    return new Promise((resolve, reject) => {
      const process = spawn(this.cliPath, ['agents', 'list', '--json'], {
        stdio: 'pipe',
        shell: true
      });

      let output = '';

      process.stdout?.on('data', (data) => {
        output += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          try {
            const agents = JSON.parse(output);
            resolve(agents);
          } catch (error) {
            reject(new Error('Failed to parse agent list JSON'));
          }
        } else {
          reject(new Error('Failed to get agent list from CLI'));
        }
      });
    });
  }

  async validateWorkflow(workflow: Workflow): Promise<ValidationResult> {
    const tempFile = await this.createTempWorkflowFile(workflow);

    try {
      return new Promise((resolve) => {
        const process = spawn(this.cliPath, ['validate', tempFile], {
          stdio: 'pipe',
          shell: true
        });

        let output = '';

        process.stdout?.on('data', (data) => {
          output += data.toString();
        });

        process.on('close', (code) => {
          resolve({
            valid: code === 0,
            errors: code !== 0 ? [output] : [],
            warnings: []
          });
        });
      });
    } finally {
      await fs.unlink(tempFile);
    }
  }

  private async createTempWorkflowFile(workflow: Workflow): Promise<string> {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cc-flow-'));
    const tempFile = path.join(tempDir, 'temp-workflow.json');

    await fs.writeFile(tempFile, JSON.stringify(workflow, null, 2));

    return tempFile;
  }
}
```

### 8.2 Integration Testing Strategy

#### 8.2.1 CLI-Web Integration Tests
```typescript
// src/__tests__/integration/cli-integration.test.ts
import { CLIIntegration } from '@/lib/cli-integration';
import { spawn } from 'child_process';

// Mock CLI for testing
jest.mock('child_process');
const mockSpawn = spawn as jest.MockedFunction<typeof spawn>;

describe('CLI Integration', () => {
  let cliIntegration: CLIIntegration;

  beforeEach(() => {
    cliIntegration = CLIIntegration.getInstance();
    jest.clearAllMocks();
  });

  it('executes workflow through CLI', async () => {
    const mockProcess = {
      stdout: { on: jest.fn() },
      stderr: { on: jest.fn() },
      on: jest.fn((event, callback) => {
        if (event === 'close') {
          callback(0); // Success exit code
        }
      })
    };

    mockSpawn.mockReturnValue(mockProcess as any);

    const result = await cliIntegration.executeWorkflow('test-workflow', 'test context');

    expect(result.success).toBe(true);
    expect(mockSpawn).toHaveBeenCalledWith(
      expect.any(String),
      ['test-workflow', 'test context'],
      expect.any(Object)
    );
  });

  it('gets agent list from CLI', async () => {
    const mockAgents = [
      { name: 'agent1', path: '/path/to/agent1' },
      { name: 'agent2', path: '/path/to/agent2' }
    ];

    const mockProcess = {
      stdout: { on: jest.fn((event, callback) => {
        if (event === 'data') {
          callback(JSON.stringify(mockAgents));
        }
      })},
      stderr: { on: jest.fn() },
      on: jest.fn((event, callback) => {
        if (event === 'close') {
          callback(0);
        }
      })
    };

    mockSpawn.mockReturnValue(mockProcess as any);

    const agents = await cliIntegration.getAgentList();

    expect(agents).toEqual(mockAgents);
    expect(mockSpawn).toHaveBeenCalledWith(
      expect.any(String),
      ['agents', 'list', '--json'],
      expect.any(Object)
    );
  });
});
```

#### 8.2.2 End-to-End CLI Integration
```typescript
// e2e/cli-integration.spec.ts
import { test, expect } from '@playwright/test';
import { spawn } from 'child_process';
import path from 'path';

test.describe('CLI-Web Integration E2E', () => {
  let cliProcess: any;

  test.beforeAll(async () => {
    // Start web editor through CLI
    cliProcess = spawn('npm', ['run', 'cli', 'web', '--port', '3003'], {
      cwd: path.join(__dirname, '../'),
      stdio: 'pipe'
    });

    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 10000));
  });

  test.afterAll(async () => {
    if (cliProcess) {
      cliProcess.kill('SIGTERM');
    }
  });

  test('launches web editor from CLI', async ({ page }) => {
    await page.goto('http://localhost:3003/editor');

    // Verify editor loads
    await expect(page.locator('h1:has-text("Workflow Editor")')).toBeVisible();

    // Verify agents are loaded
    await expect(page.locator('[data-testid="agent-palette"]')).toBeVisible();
  });

  test('creates workflow and executes through CLI', async ({ page }) => {
    await page.goto('http://localhost:3003/editor');

    // Create simple workflow
    await page.fill('[data-testid="workflow-name"]', 'cli-integration-test');
    await page.fill('[data-testid="workflow-purpose"]', 'Test CLI integration');

    // Add agent
    const agent = page.locator('[data-testid="agent-spec-agent"]');
    const canvas = page.locator('[data-testid="workflow-canvas"]');
    await agent.dragTo(canvas);

    // Save workflow
    await page.click('[data-testid="save-workflow"]');
    await expect(page.locator('text=saved successfully')).toBeVisible();

    // Execute workflow through CLI (simulated)
    const executeButton = page.locator('[data-testid="execute-workflow"]');
    await executeButton.click();

    await page.fill('[data-testid="execution-context"]', 'Test execution context');
    await page.click('[data-testid="confirm-execute"]');

    // Verify execution status
    await expect(page.locator('[data-testid="execution-status"]')).toBeVisible();
  });
});
```

## 9. Performance Optimization Techniques

### 9.1 React and Next.js Optimizations

#### 9.1.1 Component Optimization
```typescript
// src/components/workflow-editor/Canvas.tsx (Optimized)
import React, { useCallback, useMemo, memo } from 'react';
import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';

interface CanvasProps {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  onNodesChange: (nodes: WorkflowNode[]) => void;
  onEdgesChange: (edges: WorkflowEdge[]) => void;
  onConnect: (connection: Connection) => void;
}

const Canvas = memo<CanvasProps>(({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
}) => {
  // Memoize node types to prevent recreation
  const nodeTypes = useMemo(() => ({
    agent: AgentNode,
    'step-group': StepGroupNode,
  }), []);

  // Memoize ReactFlow props to prevent unnecessary re-renders
  const reactFlowProps = useMemo(() => ({
    nodes,
    edges,
    nodeTypes,
    onNodesChange,
    onEdgesChange,
    onConnect,
    fitView: true,
    minZoom: 0.1,
    maxZoom: 2,
    defaultViewport: { x: 0, y: 0, zoom: 1 },
  }), [nodes, edges, nodeTypes, onNodesChange, onEdgesChange, onConnect]);

  // Optimize drag and drop handlers
  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();

    const reactFlowBounds = (event.target as Element).getBoundingClientRect();
    const agentData = JSON.parse(event.dataTransfer.getData('application/agent'));

    // Use RAF for smooth UI updates
    requestAnimationFrame(() => {
      const newNode = createAgentNode(agentData, {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      onNodesChange([...nodes, newNode]);
    });
  }, [nodes, onNodesChange]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  return (
    <div
      className="h-full w-full"
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      <ReactFlow {...reactFlowProps}>
        <Background
          color="#e5e7eb"
          gap={20}
          size={1}
        />
        <Controls />
        <MiniMap
          nodeColor="#6366f1"
          maskColor="rgba(0,0,0,0.1)"
        />
      </ReactFlow>
    </div>
  );
});

Canvas.displayName = 'Canvas';

export default Canvas;
```

#### 9.1.2 State Management Optimization
```typescript
// src/hooks/useOptimizedWorkflowState.ts
import { useReducer, useMemo, useCallback } from 'react';
import { produce } from 'immer';

interface WorkflowState {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  metadata: WorkflowMetadata;
  ui: {
    selectedNodes: string[];
    selectedEdges: string[];
    viewport: ReactFlowViewport;
  };
}

type WorkflowAction =
  | { type: 'ADD_NODE'; payload: WorkflowNode }
  | { type: 'UPDATE_NODE'; payload: { id: string; updates: Partial<WorkflowNode> } }
  | { type: 'REMOVE_NODE'; payload: string }
  | { type: 'ADD_EDGE'; payload: WorkflowEdge }
  | { type: 'REMOVE_EDGE'; payload: string }
  | { type: 'UPDATE_METADATA'; payload: Partial<WorkflowMetadata> }
  | { type: 'SET_SELECTION'; payload: { nodes: string[]; edges: string[] } }
  | { type: 'UPDATE_VIEWPORT'; payload: ReactFlowViewport };

const workflowReducer = produce((draft: WorkflowState, action: WorkflowAction) => {
  switch (action.type) {
    case 'ADD_NODE':
      draft.nodes.push(action.payload);
      break;

    case 'UPDATE_NODE':
      const nodeIndex = draft.nodes.findIndex(n => n.id === action.payload.id);
      if (nodeIndex !== -1) {
        Object.assign(draft.nodes[nodeIndex], action.payload.updates);
      }
      break;

    case 'REMOVE_NODE':
      draft.nodes = draft.nodes.filter(n => n.id !== action.payload);
      // Remove connected edges
      draft.edges = draft.edges.filter(e =>
        e.source !== action.payload && e.target !== action.payload
      );
      break;

    case 'ADD_EDGE':
      draft.edges.push(action.payload);
      break;

    case 'REMOVE_EDGE':
      draft.edges = draft.edges.filter(e => e.id !== action.payload);
      break;

    case 'UPDATE_METADATA':
      Object.assign(draft.metadata, action.payload);
      break;

    case 'SET_SELECTION':
      draft.ui.selectedNodes = action.payload.nodes;
      draft.ui.selectedEdges = action.payload.edges;
      break;

    case 'UPDATE_VIEWPORT':
      draft.ui.viewport = action.payload;
      break;
  }
});

export const useOptimizedWorkflowState = (initialState: WorkflowState) => {
  const [state, dispatch] = useReducer(workflowReducer, initialState);

  // Memoized selectors to prevent unnecessary re-renders
  const selectors = useMemo(() => ({
    getNodeById: (id: string) => state.nodes.find(n => n.id === id),
    getEdgeById: (id: string) => state.edges.find(e => e.id === id),
    getSelectedNodes: () => state.nodes.filter(n =>
      state.ui.selectedNodes.includes(n.id)
    ),
    getConnectedEdges: (nodeId: string) => state.edges.filter(e =>
      e.source === nodeId || e.target === nodeId
    ),
    getExecutionOrder: () => calculateExecutionOrder(state.nodes, state.edges),
  }), [state]);

  // Optimized action creators
  const actions = useMemo(() => ({
    addNode: (node: WorkflowNode) => dispatch({ type: 'ADD_NODE', payload: node }),
    updateNode: (id: string, updates: Partial<WorkflowNode>) =>
      dispatch({ type: 'UPDATE_NODE', payload: { id, updates } }),
    removeNode: (id: string) => dispatch({ type: 'REMOVE_NODE', payload: id }),
    addEdge: (edge: WorkflowEdge) => dispatch({ type: 'ADD_EDGE', payload: edge }),
    removeEdge: (id: string) => dispatch({ type: 'REMOVE_EDGE', payload: id }),
    updateMetadata: (updates: Partial<WorkflowMetadata>) =>
      dispatch({ type: 'UPDATE_METADATA', payload: updates }),
    setSelection: (nodes: string[], edges: string[]) =>
      dispatch({ type: 'SET_SELECTION', payload: { nodes, edges } }),
    updateViewport: (viewport: ReactFlowViewport) =>
      dispatch({ type: 'UPDATE_VIEWPORT', payload: viewport }),
  }), []);

  return {
    state,
    actions,
    selectors,
  };
};
```

### 9.2 ReactFlow Performance Optimization

#### 9.2.1 Node Virtualization
```typescript
// src/components/workflow-editor/VirtualizedCanvas.tsx
import React, { useMemo } from 'react';
import { ReactFlow, useReactFlow } from '@xyflow/react';
import { FixedSizeList as List } from 'react-window';

interface VirtualizedCanvasProps {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  onNodesChange: (nodes: WorkflowNode[]) => void;
  onEdgesChange: (edges: WorkflowEdge[]) => void;
}

const VirtualizedCanvas: React.FC<VirtualizedCanvasProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
}) => {
  const { getViewport } = useReactFlow();

  // Calculate visible nodes based on viewport
  const visibleNodes = useMemo(() => {
    const viewport = getViewport();
    const viewportBounds = {
      left: -viewport.x / viewport.zoom,
      top: -viewport.y / viewport.zoom,
      right: (-viewport.x + window.innerWidth) / viewport.zoom,
      bottom: (-viewport.y + window.innerHeight) / viewport.zoom,
    };

    // Only render nodes within the viewport (with some padding)
    const padding = 200;
    return nodes.filter(node => {
      const nodeRect = {
        left: node.position.x - padding,
        top: node.position.y - padding,
        right: node.position.x + 200 + padding, // Assuming node width ~200px
        bottom: node.position.y + 100 + padding, // Assuming node height ~100px
      };

      return !(
        nodeRect.right < viewportBounds.left ||
        nodeRect.left > viewportBounds.right ||
        nodeRect.bottom < viewportBounds.top ||
        nodeRect.top > viewportBounds.bottom
      );
    });
  }, [nodes, getViewport]);

  // Only render edges connected to visible nodes
  const visibleEdges = useMemo(() => {
    const visibleNodeIds = new Set(visibleNodes.map(n => n.id));
    return edges.filter(edge =>
      visibleNodeIds.has(edge.source) || visibleNodeIds.has(edge.target)
    );
  }, [edges, visibleNodes]);

  return (
    <ReactFlow
      nodes={visibleNodes}
      edges={visibleEdges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      // Performance optimizations
      panOnDrag={true}
      panOnScroll={false}
      zoomOnScroll={false}
      zoomOnPinch={false}
      zoomOnDoubleClick={false}
      preventScrolling={false}
      nodesDraggable={true}
      nodesConnectable={true}
      elementsSelectable={true}
      selectNodesOnDrag={false}
      // Reduce re-renders
      onlyRenderVisibleElements={true}
    />
  );
};
```

#### 9.2.2 Debounced Updates
```typescript
// src/hooks/useDebouncedWorkflow.ts
import { useMemo, useCallback, useRef } from 'react';
import { debounce } from 'lodash-es';

interface DebouncedWorkflowOptions {
  saveDelay?: number;
  validationDelay?: number;
  previewDelay?: number;
}

export const useDebouncedWorkflow = (
  workflow: Workflow,
  options: DebouncedWorkflowOptions = {}
) => {
  const {
    saveDelay = 2000,
    validationDelay = 500,
    previewDelay = 300,
  } = options;

  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const validationTimeoutRef = useRef<NodeJS.Timeout>();
  const previewTimeoutRef = useRef<NodeJS.Timeout>();

  // Debounced save function
  const debouncedSave = useMemo(
    () => debounce(async (workflow: Workflow) => {
      try {
        await saveWorkflow(workflow);
        console.log('Workflow auto-saved');
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, saveDelay),
    [saveDelay]
  );

  // Debounced validation
  const debouncedValidate = useMemo(
    () => debounce(async (workflow: Workflow) => {
      try {
        const result = await validateWorkflow(workflow);
        // Update validation state
      } catch (error) {
        console.error('Validation failed:', error);
      }
    }, validationDelay),
    [validationDelay]
  );

  // Debounced preview update
  const debouncedPreview = useMemo(
    () => debounce((workflow: Workflow) => {
      // Update JSON preview
      const previewJSON = generateWorkflowJSON(workflow);
      // Update preview state
    }, previewDelay),
    [previewDelay]
  );

  // Trigger debounced operations when workflow changes
  useEffect(() => {
    debouncedSave(workflow);
    debouncedValidate(workflow);
    debouncedPreview(workflow);

    return () => {
      debouncedSave.cancel();
      debouncedValidate.cancel();
      debouncedPreview.cancel();
    };
  }, [workflow, debouncedSave, debouncedValidate, debouncedPreview]);

  return {
    save: debouncedSave,
    validate: debouncedValidate,
    updatePreview: debouncedPreview,
  };
};
```

### 9.3 Bundle Optimization

#### 9.3.1 Code Splitting
```typescript
// src/app/editor/page.tsx (Code Split)
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Lazy load heavy components
const Canvas = dynamic(
  () => import('@/components/workflow-editor/Canvas'),
  {
    ssr: false,
    loading: () => <LoadingSpinner message="Loading canvas..." />
  }
);

const AgentPalette = dynamic(
  () => import('@/components/panels/AgentPalette'),
  {
    loading: () => <LoadingSpinner message="Loading agents..." />
  }
);

const PropertiesPanel = dynamic(
  () => import('@/components/panels/PropertiesPanel'),
  {
    loading: () => <LoadingSpinner message="Loading properties..." />
  }
);

export default function EditorPage() {
  return (
    <div className="h-screen flex bg-gray-50">
      <Suspense fallback={<LoadingSpinner message="Loading editor..." />}>
        <AgentPalette />
        <div className="flex-1">
          <Canvas />
        </div>
        <PropertiesPanel />
      </Suspense>
    </div>
  );
}
```

#### 9.3.2 Web Workers for Heavy Computations
```typescript
// src/workers/workflow-analyzer.worker.ts
import { WorkflowNode, WorkflowEdge } from '@/types/workflow';

interface AnalysisRequest {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  analysisType: 'dependencies' | 'cycles' | 'optimization';
}

interface AnalysisResult {
  dependencies: Map<string, string[]>;
  cycles: string[][];
  recommendations: string[];
  complexity: number;
}

self.onmessage = function(e: MessageEvent<AnalysisRequest>) {
  const { nodes, edges, analysisType } = e.data;

  try {
    const result: AnalysisResult = {
      dependencies: analyzeDependencies(nodes, edges),
      cycles: detectCycles(nodes, edges),
      recommendations: generateRecommendations(nodes, edges),
      complexity: calculateComplexity(nodes, edges)
    };

    self.postMessage({ success: true, result });
  } catch (error) {
    self.postMessage({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

function analyzeDependencies(nodes: WorkflowNode[], edges: WorkflowEdge[]): Map<string, string[]> {
  const dependencies = new Map<string, string[]>();

  for (const node of nodes) {
    const deps = edges
      .filter(edge => edge.target === node.id)
      .map(edge => edge.source);
    dependencies.set(node.id, deps);
  }

  return dependencies;
}

function detectCycles(nodes: WorkflowNode[], edges: WorkflowEdge[]): string[][] {
  // Implement cycle detection algorithm
  const graph = buildAdjacencyList(nodes, edges);
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const cycles: string[][] = [];

  function dfs(nodeId: string, path: string[]): void {
    visited.add(nodeId);
    recursionStack.add(nodeId);
    path.push(nodeId);

    const neighbors = graph.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        dfs(neighbor, [...path]);
      } else if (recursionStack.has(neighbor)) {
        // Found a cycle
        const cycleStart = path.indexOf(neighbor);
        cycles.push(path.slice(cycleStart));
      }
    }

    recursionStack.delete(nodeId);
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      dfs(node.id, []);
    }
  }

  return cycles;
}

function calculateComplexity(nodes: WorkflowNode[], edges: WorkflowEdge[]): number {
  // Calculate cyclomatic complexity
  const v = nodes.length; // vertices
  const e = edges.length; // edges
  const p = 1; // connected components (assuming single component)

  return e - v + 2 * p;
}

function generateRecommendations(nodes: WorkflowNode[], edges: WorkflowEdge[]): string[] {
  const recommendations: string[] = [];

  // Check for isolated nodes
  const connectedNodes = new Set([
    ...edges.map(e => e.source),
    ...edges.map(e => e.target)
  ]);

  const isolatedNodes = nodes.filter(n => !connectedNodes.has(n.id));
  if (isolatedNodes.length > 0) {
    recommendations.push(`${isolatedNodes.length} isolated nodes detected. Consider connecting them or removing them.`);
  }

  // Check for bottlenecks
  const inDegree = new Map<string, number>();
  const outDegree = new Map<string, number>();

  for (const edge of edges) {
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    outDegree.set(edge.source, (outDegree.get(edge.source) || 0) + 1);
  }

  const bottlenecks = nodes.filter(n => (inDegree.get(n.id) || 0) > 3);
  if (bottlenecks.length > 0) {
    recommendations.push(`Potential bottlenecks detected: ${bottlenecks.map(n => n.data.label).join(', ')}`);
  }

  return recommendations;
}

function buildAdjacencyList(nodes: WorkflowNode[], edges: WorkflowEdge[]): Map<string, string[]> {
  const graph = new Map<string, string[]>();

  for (const node of nodes) {
    graph.set(node.id, []);
  }

  for (const edge of edges) {
    const neighbors = graph.get(edge.source) || [];
    neighbors.push(edge.target);
    graph.set(edge.source, neighbors);
  }

  return graph;
}
```

```typescript
// src/hooks/useWorkflowAnalysis.ts
import { useMemo, useEffect, useState } from 'react';
import { WorkflowNode, WorkflowEdge } from '@/types/workflow';

export const useWorkflowAnalysis = (nodes: WorkflowNode[], edges: WorkflowEdge[]) => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [worker, setWorker] = useState<Worker | null>(null);

  // Initialize worker
  useEffect(() => {
    const workflowWorker = new Worker('/workers/workflow-analyzer.worker.js');
    setWorker(workflowWorker);

    workflowWorker.onmessage = (e: MessageEvent) => {
      const { success, result, error } = e.data;
      if (success) {
        setAnalysis(result);
      } else {
        console.error('Workflow analysis failed:', error);
      }
      setLoading(false);
    };

    return () => {
      workflowWorker.terminate();
    };
  }, []);

  // Trigger analysis when nodes or edges change
  useEffect(() => {
    if (worker && nodes.length > 0) {
      setLoading(true);
      worker.postMessage({
        nodes,
        edges,
        analysisType: 'dependencies'
      });
    }
  }, [worker, nodes, edges]);

  return {
    analysis,
    loading,
    refetch: () => {
      if (worker) {
        setLoading(true);
        worker.postMessage({ nodes, edges, analysisType: 'dependencies' });
      }
    }
  };
};
```

## 10. Maintenance and Troubleshooting Guides

### 10.1 Common Issues and Solutions

#### 10.1.1 ReactFlow Issues

**Issue: Nodes not rendering correctly**
```typescript
// Problem: Nodes appear but without content
// Solution: Check node data structure and component registration

// Debug steps:
1. Verify node types are registered
const nodeTypes = useMemo(() => ({
  agent: AgentNode,
  'step-group': StepGroupNode,
}), []);

2. Check node data structure
console.log('Node data:', nodes.map(n => ({ id: n.id, type: n.type, data: n.data })));

3. Verify component exports
// AgentNode.tsx
export default function AgentNode({ data, selected }: NodeProps) {
  return (
    <div className="agent-node">
      {data.label}
    </div>
  );
}
```

**Issue: Drag and drop not working**
```typescript
// Problem: Agents can't be dragged from palette to canvas
// Solution: Check HTML5 drag and drop implementation

// Debug steps:
1. Verify drag event handlers
const handleDragStart = (event: React.DragEvent, agent: Agent) => {
  event.dataTransfer.setData('application/reactflow', 'agent');
  event.dataTransfer.setData('application/agent', JSON.stringify(agent));
  event.dataTransfer.effectAllowed = 'move';
};

2. Check drop event handlers
const onDrop = useCallback((event: React.DragEvent) => {
  event.preventDefault();

  // Debug: Log drag data
  console.log('Drop data:', {
    type: event.dataTransfer.getData('application/reactflow'),
    agent: event.dataTransfer.getData('application/agent')
  });

  // Verify data exists
  if (!event.dataTransfer.getData('application/reactflow')) {
    console.error('No drag data found');
    return;
  }
}, []);

3. Check canvas drag over handler
const onDragOver = useCallback((event: React.DragEvent) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
}, []);
```

#### 10.1.2 API Issues

**Issue: Agent discovery fails**
```typescript
// Problem: /api/agents returns empty or error
// Solution: Check file system permissions and paths

// Debug script: debug-agents.js
const fs = require('fs').promises;
const path = require('path');

async function debugAgentDiscovery() {
  const agentsPath = path.join(process.cwd(), '../.claude/agents');

  try {
    console.log('Checking agents path:', agentsPath);

    // Check if directory exists
    await fs.access(agentsPath);
    console.log('✅ Agents directory exists');

    // List directory contents
    const entries = await fs.readdir(agentsPath);
    console.log('Directory contents:', entries);

    // Check each entry
    for (const entry of entries) {
      const fullPath = path.join(agentsPath, entry);
      const stats = await fs.stat(fullPath);

      if (stats.isDirectory()) {
        console.log(`📁 ${entry}/`);
        const subEntries = await fs.readdir(fullPath);
        console.log(`  Contents: ${subEntries.join(', ')}`);
      } else {
        console.log(`📄 ${entry}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);

    if (error.code === 'ENOENT') {
      console.log('Creating agents directory...');
      await fs.mkdir(agentsPath, { recursive: true });
      console.log('✅ Directory created');
    }
  }
}

debugAgentDiscovery();
```

**Issue: Workflow save fails**
```typescript
// Problem: POST /api/workflows returns 500 error
// Solution: Check file permissions and validation

// Debug middleware
export async function POST(request: NextRequest) {
  console.log('=== Workflow Save Debug ===');

  try {
    const body = await request.json();
    console.log('Request body keys:', Object.keys(body));
    console.log('Metadata:', body.metadata);
    console.log('Nodes count:', body.nodes?.length);
    console.log('Edges count:', body.edges?.length);

    // Validate required fields
    if (!body.metadata?.workflowName) {
      console.error('❌ Missing workflow name');
      return NextResponse.json(
        { error: 'Workflow name is required' },
        { status: 400 }
      );
    }

    // Check workflows directory
    const workflowsPath = path.join(process.cwd(), WORKFLOWS_BASE_PATH);
    console.log('Workflows path:', workflowsPath);

    try {
      await fs.access(workflowsPath);
      console.log('✅ Workflows directory exists');
    } catch (error) {
      console.log('Creating workflows directory...');
      await fs.mkdir(workflowsPath, { recursive: true });
      console.log('✅ Directory created');
    }

    // Continue with save logic...

  } catch (error) {
    console.error('❌ Save error:', error);
    console.error('Stack trace:', error.stack);

    return NextResponse.json(
      {
        error: 'Failed to save workflow',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
```

#### 10.1.3 Performance Issues

**Issue: Slow rendering with many nodes**
```typescript
// Problem: Editor becomes sluggish with >50 nodes
// Solution: Implement virtualization and optimization

// Performance monitoring hook
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    nodeCount: 0,
    edgeCount: 0,
    memoryUsage: 0
  });

  const measureRender = useCallback((nodeCount: number, edgeCount: number) => {
    const startTime = performance.now();

    // Use RAF to measure after render
    requestAnimationFrame(() => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      setMetrics({
        renderTime,
        nodeCount,
        edgeCount,
        memoryUsage: (performance as any).memory?.usedJSHeapSize || 0
      });

      // Log performance warnings
      if (renderTime > 100) {
        console.warn(`Slow render detected: ${renderTime.toFixed(2)}ms`);
      }

      if (nodeCount > 100) {
        console.warn(`High node count: ${nodeCount} nodes`);
      }
    });
  }, []);

  return { metrics, measureRender };
};

// Usage in Canvas component
const Canvas = ({ nodes, edges, ...props }) => {
  const { measureRender } = usePerformanceMonitor();

  useEffect(() => {
    measureRender(nodes.length, edges.length);
  }, [nodes.length, edges.length, measureRender]);

  // Rest of component...
};
```

### 10.2 Monitoring and Debugging

#### 10.2.1 Error Boundary Implementation
```typescript
// src/components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);

    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Send error to monitoring service
    if (process.env.NODE_ENV === 'production') {
      this.reportError(error, errorInfo);
    }
  }

  private reportError(error: Error, errorInfo: ErrorInfo) {
    // Send to monitoring service (e.g., Sentry, LogRocket)
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Example: Send to logging endpoint
    fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorReport)
    }).catch(err => {
      console.error('Failed to report error:', err);
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo.componentStack}
          </details>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage in app
export default function EditorPage() {
  return (
    <ErrorBoundary
      fallback={<ErrorFallback />}
      onError={(error, errorInfo) => {
        console.error('Editor error:', error, errorInfo);
      }}
    >
      <div className="h-screen flex bg-gray-50">
        <AgentPalette />
        <Canvas />
        <PropertiesPanel />
      </div>
    </ErrorBoundary>
  );
}
```

#### 10.2.2 Logging and Analytics
```typescript
// src/lib/logger.ts
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, any>;
  stack?: string;
}

export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  private constructor() {
    this.logLevel = process.env.NODE_ENV === 'development'
      ? LogLevel.DEBUG
      : LogLevel.INFO;
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>) {
    if (level < this.logLevel) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
      stack: level === LogLevel.ERROR ? new Error().stack : undefined
    };

    this.logs.push(entry);

    // Keep logs under limit
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output
    const logMethod = {
      [LogLevel.DEBUG]: console.debug,
      [LogLevel.INFO]: console.info,
      [LogLevel.WARN]: console.warn,
      [LogLevel.ERROR]: console.error
    }[level];

    logMethod(`[${entry.timestamp.toISOString()}] ${message}`, context || '');

    // Send to remote logging in production
    if (process.env.NODE_ENV === 'production' && level >= LogLevel.WARN) {
      this.sendToRemote(entry);
    }
  }

  private async sendToRemote(entry: LogEntry) {
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
    } catch (error) {
      console.error('Failed to send log to remote:', error);
    }
  }

  debug(message: string, context?: Record<string, any>) {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, any>) {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, context?: Record<string, any>) {
    this.log(LogLevel.ERROR, message, context);
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }
}

export const logger = Logger.getInstance();

// Usage tracking
export const useAnalytics = () => {
  const trackEvent = useCallback((eventName: string, properties: Record<string, any> = {}) => {
    logger.info(`Analytics: ${eventName}`, properties);

    // Send to analytics service
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_ANALYTICS_ID) {
      // Example: Google Analytics, Mixpanel, etc.
      (window as any).gtag?.('event', eventName, properties);
    }
  }, []);

  const trackWorkflowAction = useCallback((action: string, workflowData: any) => {
    trackEvent('workflow_action', {
      action,
      nodeCount: workflowData.nodes?.length || 0,
      edgeCount: workflowData.edges?.length || 0,
      workflowName: workflowData.metadata?.workflowName || 'unnamed'
    });
  }, [trackEvent]);

  return { trackEvent, trackWorkflowAction };
};
```

### 10.3 Maintenance Procedures

#### 10.3.1 Regular Maintenance Tasks
```bash
#!/bin/bash
# scripts/maintenance.sh

echo "🔧 Starting CC-Flow Web maintenance..."

# 1. Update dependencies
echo "📦 Checking for dependency updates..."
npm outdated
npm audit
npm audit fix --audit-level moderate

# 2. Clean build artifacts
echo "🧹 Cleaning build artifacts..."
rm -rf .next
rm -rf dist
rm -rf coverage
npm run clean

# 3. Run full test suite
echo "🧪 Running tests..."
npm run validate

# 4. Check bundle size
echo "📊 Analyzing bundle size..."
npm run analyze

# 5. Check for security issues
echo "🔒 Security audit..."
npm audit --audit-level high

# 6. Update README and documentation
echo "📚 Checking documentation..."
# Add documentation checks here

echo "✅ Maintenance complete!"
```

#### 10.3.2 Performance Monitoring
```typescript
// src/lib/performance-monitor.ts
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private observer: PerformanceObserver | null = null;
  private vitals: Map<string, number> = new Map();

  private constructor() {
    this.initializeObserver();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initializeObserver() {
    if (typeof window === 'undefined') return;

    try {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.processEntry(entry);
        }
      });

      this.observer.observe({
        entryTypes: ['navigation', 'measure', 'paint', 'largest-contentful-paint']
      });
    } catch (error) {
      console.warn('Performance Observer not supported:', error);
    }
  }

  private processEntry(entry: PerformanceEntry) {
    switch (entry.entryType) {
      case 'navigation':
        const navEntry = entry as PerformanceNavigationTiming;
        this.vitals.set('load_time', navEntry.loadEventEnd - navEntry.loadEventStart);
        this.vitals.set('dom_content_loaded', navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart);
        break;

      case 'paint':
        if (entry.name === 'first-contentful-paint') {
          this.vitals.set('fcp', entry.startTime);
        }
        break;

      case 'largest-contentful-paint':
        this.vitals.set('lcp', entry.startTime);
        break;
    }

    // Send metrics to monitoring service
    this.reportMetrics();
  }

  private reportMetrics() {
    const metrics = Object.fromEntries(this.vitals);

    // Report to analytics
    if (process.env.NEXT_PUBLIC_ANALYTICS_ID) {
      logger.info('Performance metrics', metrics);
    }
  }

  measureWorkflowOperation(name: string, operation: () => Promise<any>) {
    const startTime = performance.now();

    return operation().finally(() => {
      const duration = performance.now() - startTime;
      this.vitals.set(`workflow_${name}`, duration);

      logger.debug(`Workflow operation ${name} took ${duration.toFixed(2)}ms`);
    });
  }

  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.vitals);
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();
```

#### 10.3.3 Health Check Endpoint
```typescript
// src/app/api/health/route.ts
import { NextResponse } from 'next/server';
import { join } from 'path';
import { access } from 'fs/promises';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  checks: {
    [key: string]: {
      status: 'pass' | 'fail';
      details?: string;
      responseTime?: number;
    };
  };
}

export async function GET() {
  const startTime = Date.now();
  const health: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0',
    checks: {}
  };

  try {
    // Check file system access
    const agentsPath = join(process.cwd(), '../.claude/agents');
    const checkStart = Date.now();

    try {
      await access(agentsPath);
      health.checks.agents_directory = {
        status: 'pass',
        responseTime: Date.now() - checkStart
      };
    } catch (error) {
      health.checks.agents_directory = {
        status: 'fail',
        details: 'Agents directory not accessible',
        responseTime: Date.now() - checkStart
      };
      health.status = 'degraded';
    }

    // Check workflows directory
    const workflowsPath = join(process.cwd(), '../workflows');
    const workflowCheckStart = Date.now();

    try {
      await access(workflowsPath);
      health.checks.workflows_directory = {
        status: 'pass',
        responseTime: Date.now() - workflowCheckStart
      };
    } catch (error) {
      health.checks.workflows_directory = {
        status: 'fail',
        details: 'Workflows directory not accessible',
        responseTime: Date.now() - workflowCheckStart
      };
      health.status = 'degraded';
    }

    // Check memory usage
    const memoryUsage = process.memoryUsage();
    const memoryMB = memoryUsage.heapUsed / 1024 / 1024;

    health.checks.memory = {
      status: memoryMB < 512 ? 'pass' : 'fail',
      details: `${memoryMB.toFixed(2)} MB used`
    };

    if (memoryMB > 512) {
      health.status = 'degraded';
    }

    // Overall response time
    health.checks.response_time = {
      status: 'pass',
      responseTime: Date.now() - startTime
    };

  } catch (error) {
    health.status = 'unhealthy';
    health.checks.general = {
      status: 'fail',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }

  const statusCode = health.status === 'healthy' ? 200 :
                    health.status === 'degraded' ? 200 : 503;

  return NextResponse.json(health, { status: statusCode });
}
```

## Conclusion

This comprehensive implementation specification provides a detailed roadmap for developing and maintaining the cc-flow-web project. The specification covers all aspects from basic implementation to advanced optimization techniques, ensuring that developers have actionable guidance for building a robust, performant, and maintainable visual workflow editor.

### Key Implementation Priorities

1. **Phase 2 Enhancements**: Focus on workflow execution integration and validation systems
2. **Performance Optimization**: Implement virtualization, debouncing, and web workers for large workflows
3. **Testing Coverage**: Maintain high test coverage with comprehensive unit, integration, and E2E tests
4. **CLI Integration**: Ensure seamless bidirectional communication with cc-flow-cli
5. **Monitoring**: Implement comprehensive error tracking and performance monitoring

### Success Metrics

- **Performance**: Sub-100ms render times for workflows with up to 50 nodes
- **Reliability**: 99.9% uptime with comprehensive error handling
- **User Experience**: Intuitive drag-and-drop workflow creation with real-time feedback
- **Integration**: Seamless workflow execution through cc-flow-cli
- **Maintainability**: High test coverage and comprehensive documentation

This specification serves as a living document that should be updated as the project evolves and new requirements emerge.