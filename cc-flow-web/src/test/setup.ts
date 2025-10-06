import '@testing-library/jest-dom';
import React from 'react';
import { beforeAll, afterEach, afterAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from './mocks/server';

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset any runtime request handlers after each test
afterEach(() => {
  server.resetHandlers();
  cleanup();
});

// Clean up after the tests are finished
afterAll(() => server.close());

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/editor',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock React DnD
vi.mock('react-dnd', () => ({
  useDrag: () => [
    { isDragging: false },
    vi.fn<() => void>(),
    vi.fn<() => void>(),
  ],
  useDrop: () => [
    { isOver: false },
    vi.fn<() => void>(),
  ],
  DndProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock ReactFlow
vi.mock('@xyflow/react', () => ({
  ReactFlow: ({ children, ...props }: Record<string, unknown> & { children?: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'react-flow', ...props }, children),
  Background: () => React.createElement('div', { 'data-testid': 'react-flow-background' }),
  MiniMap: () => React.createElement('div', { 'data-testid': 'react-flow-minimap' }),
  Panel: ({
    children,
    position,
    className,
    style,
  }: {
    children?: React.ReactNode;
    position?: string;
    className?: string;
    style?: React.CSSProperties;
  }) =>
    React.createElement(
      'div',
      {
        'data-testid': `react-flow-panel-${position ?? 'default'}`,
        className,
        style,
      },
      children,
    ),
  Handle: ({ type, position, ...props }: { type: string; position: string; [key: string]: unknown }) =>
    React.createElement('div', { 'data-testid': `handle-${type}-${position}`, ...props }),
  Position: {
    Top: 'top',
    Right: 'right',
    Bottom: 'bottom',
    Left: 'left',
  },
  useNodesState: <T,>(initialNodes: T[]) => [
    initialNodes,
    vi.fn(),
    vi.fn(),
  ],
  useEdgesState: <T,>(initialEdges: T[]) => [
    initialEdges,
    vi.fn(),
    vi.fn(),
  ],
  addEdge: vi.fn(),
  applyNodeChanges: vi.fn(),
  applyEdgeChanges: vi.fn(),
  ReactFlowProvider: ({ children }: { children: React.ReactNode }) => children,
  useReactFlow: () => ({
    screenToFlowPosition: vi.fn((pos) => pos),
    flowToScreenPosition: vi.fn((pos) => pos),
    zoomIn: vi.fn(),
    zoomOut: vi.fn(),
    fitView: vi.fn(),
  }),
  useStore: (
    selector: (
      state: {
        nodesDraggable: boolean;
        nodesConnectable: boolean;
        elementsSelectable: boolean;
      },
    ) => boolean,
  ) =>
    selector({
      nodesDraggable: true,
      nodesConnectable: true,
      elementsSelectable: true,
    }),
  useStoreApi: () => ({
    setState: vi.fn(),
  }),
}));

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
