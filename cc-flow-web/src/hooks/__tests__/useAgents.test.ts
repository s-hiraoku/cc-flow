import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAgents } from '../useAgents';
import type { Agent } from '@/types/agent';

// Mock fetch
global.fetch = vi.fn();

const mockAgents: Agent[] = [
  {
    name: 'Test Agent 1',
    description: 'First test agent',
    category: 'spec',
    path: './agents/spec/agent-1.md',
  },
  {
    name: 'Test Agent 2',
    description: 'Second test agent',
    category: 'utility',
    path: './agents/utility/agent-2.md',
  },
];

const mockApiResponse = {
  categories: {
    spec: {
      name: 'spec',
      path: './agents/spec',
      agents: [mockAgents[0]],
    },
    utility: {
      name: 'utility',
      path: './agents/utility',
      agents: [mockAgents[1]],
    },
  },
};

describe('useAgents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse,
    } as Response);
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useAgents());

    expect(result.current.agents).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.refetch).toBeInstanceOf(Function);
  });

  it('should load agents on mount', async () => {
    const { result } = renderHook(() => useAgents());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(fetch).toHaveBeenCalledWith('/api/agents');
    expect(result.current.agents).toEqual(mockAgents);
    expect(result.current.error).toBeNull();
  });

  it('should handle loading error', async () => {
    const error = new Error('Failed to load agents');
    vi.mocked(fetch).mockRejectedValue(error);

    const { result } = renderHook(() => useAgents());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.agents).toEqual([]);
    expect(result.current.error).toBe('Failed to load agents');
  });

  it('should handle HTTP error response', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    } as Response);

    const { result } = renderHook(() => useAgents());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.agents).toEqual([]);
    expect(result.current.error).toBe('Failed to fetch agents: 500 Internal Server Error');
  });

  it('should refetch agents when refetch is called', async () => {
    const { result } = renderHook(() => useAgents());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(fetch).toHaveBeenCalledTimes(1);

    // Call refetch
    await result.current.refetch();

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(result.current.agents).toEqual(mockAgents);
  });

  it('should handle empty categories response', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ categories: {} }),
    } as Response);

    const { result } = renderHook(() => useAgents());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.agents).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should handle malformed categories response', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        categories: {
          spec: {
            name: 'spec',
            // Missing agents array
          },
          utility: {
            name: 'utility',
            agents: mockAgents[1], // Not an array
          },
        },
      }),
    } as Response);

    const { result } = renderHook(() => useAgents());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.agents).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should handle network error during refetch', async () => {
    // Initial successful load
    const { result } = renderHook(() => useAgents());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.agents).toEqual(mockAgents);

    // Mock network error for refetch
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

    await result.current.refetch();

    // Should show error and clear agents
    expect(result.current.error).toBe('Network error');
    expect(result.current.loading).toBe(false);
  });

  it('should reset error on successful refetch', async () => {
    // Initial error
    vi.mocked(fetch).mockRejectedValue(new Error('Initial error'));

    const { result } = renderHook(() => useAgents());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Initial error');

    // Successful refetch
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse,
    } as Response);

    await result.current.refetch();

    expect(result.current.error).toBeNull();
    expect(result.current.agents).toEqual(mockAgents);
  });
});