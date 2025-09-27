import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useWorkflowSave } from "../useWorkflowSave";
import type {
  WorkflowNode,
  WorkflowEdge,
  WorkflowMetadata,
} from "@/types/workflow";

// Mock fetch
global.fetch = vi.fn();

const mockMetadata: WorkflowMetadata = {
  workflowName: "Test Workflow",
  workflowPurpose: "Test workflow description",
  workflowModel: "claude-3-sonnet",
  workflowArgumentHint: "<test>",
};

const mockNodes: WorkflowNode[] = [
  {
    id: "node-1",
    type: "agent",
    position: { x: 100, y: 100 },
    data: {
      label: "Test Agent 1",
      agentName: "test-agent-1",
      agentPath: "./agents/test-agent-1.md",
      description: "First test agent",
    },
  },
];

const mockEdges: WorkflowEdge[] = [
  {
    id: "edge-1",
    source: "node-1",
    target: "node-2",
    type: "default",
  },
];

describe("useWorkflowSave", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with correct default state", () => {
    const { result } = renderHook(() => useWorkflowSave());

    expect(result.current.saving).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.lastSaved).toBeNull();
    expect(result.current.saveWorkflow).toBeInstanceOf(Function);
  });

  it("should save workflow successfully", async () => {
    const mockResponse = {
      success: true,
      message: "Workflow saved successfully",
      workflowId: "workflow-123",
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const { result } = renderHook(() => useWorkflowSave());

    let saveResult: boolean;
    await act(async () => {
      saveResult = await result.current.saveWorkflow(
        mockMetadata,
        mockNodes,
        mockEdges
      );
    });

    expect(fetch).toHaveBeenCalledWith("/api/workflows", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        metadata: mockMetadata,
        nodes: mockNodes,
        edges: mockEdges,
      }),
    });

    expect(saveResult!).toBe(true);
    expect(result.current.saving).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.lastSaved).toEqual({
      workflowName: mockMetadata.workflowName,
      filename: undefined,
      path: undefined,
    });
  });

  it("should handle save workflow error", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      json: async () => ({ error: "Failed to save workflow" }),
    } as Response);

    const { result } = renderHook(() => useWorkflowSave());

    let saveResult: boolean;
    await act(async () => {
      saveResult = await result.current.saveWorkflow(
        mockMetadata,
        mockNodes,
        mockEdges
      );
    });

    expect(saveResult!).toBe(false);
    expect(result.current.saving).toBe(false);
    expect(result.current.error).toBe("Failed to save workflow");
    expect(result.current.lastSaved).toBeNull();
  });

  it("should handle network error", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useWorkflowSave());

    let saveResult: boolean;
    await act(async () => {
      saveResult = await result.current.saveWorkflow(
        mockMetadata,
        mockNodes,
        mockEdges
      );
    });

    expect(saveResult!).toBe(false);
    expect(result.current.saving).toBe(false);
    expect(result.current.error).toBe("Network error");
    expect(result.current.lastSaved).toBeNull();
  });

  it("should validate workflow name is required", async () => {
    const { result } = renderHook(() => useWorkflowSave());

    const invalidMetadata = {
      ...mockMetadata,
      workflowName: "",
    };

    let saveResult: boolean;
    await act(async () => {
      saveResult = await result.current.saveWorkflow(
        invalidMetadata,
        mockNodes,
        mockEdges
      );
    });

    expect(saveResult!).toBe(false);
    expect(result.current.error).toBe("Workflow name is required");
    expect(fetch).not.toHaveBeenCalled();
    expect(result.current.lastSaved).toBeNull();
  });

  it("should validate workflow name is not just whitespace", async () => {
    const { result } = renderHook(() => useWorkflowSave());

    const invalidMetadata = {
      ...mockMetadata,
      workflowName: "   ",
    };

    let saveResult: boolean;
    await act(async () => {
      saveResult = await result.current.saveWorkflow(
        invalidMetadata,
        mockNodes,
        mockEdges
      );
    });

    expect(saveResult!).toBe(false);
    expect(result.current.error).toBe("Workflow name is required");
    expect(fetch).not.toHaveBeenCalled();
    expect(result.current.lastSaved).toBeNull();
  });

  it("should set saving state during save operation", async () => {
    let resolvePromise: (value: Response) => void;
    const mockPromise = new Promise<Response>((resolve) => {
      resolvePromise = resolve;
    });

    vi.mocked(fetch).mockReturnValue(mockPromise);

    const { result } = renderHook(() => useWorkflowSave());

    // Start save operation
    const savePromise = act(async () => {
      return result.current.saveWorkflow(mockMetadata, mockNodes, mockEdges);
    });

    // Check that saving is true
    expect(result.current.saving).toBe(true);

    // Resolve the fetch
    resolvePromise!({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    await savePromise;

    // Check that saving is false after completion
    expect(result.current.saving).toBe(false);
  });

  it("should handle HTTP error without json response", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
      json: async () => ({}), // No error field
    } as Response);

    const { result } = renderHook(() => useWorkflowSave());

    let saveResult: boolean;
    await act(async () => {
      saveResult = await result.current.saveWorkflow(
        mockMetadata,
        mockNodes,
        mockEdges
      );
    });

    expect(saveResult!).toBe(false);
    expect(result.current.error).toBe("HTTP 404: Not Found");
    expect(result.current.lastSaved).toBeNull();
  });

  it("should clear error on successful save after previous error", async () => {
    const { result } = renderHook(() => useWorkflowSave());

    // First save with error
    vi.mocked(fetch).mockRejectedValue(new Error("Network error"));

    await act(async () => {
      await result.current.saveWorkflow(mockMetadata, mockNodes, mockEdges);
    });

    expect(result.current.error).toBe("Network error");

    // Second save successful
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    await act(async () => {
      await result.current.saveWorkflow(mockMetadata, mockNodes, mockEdges);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.lastSaved).toEqual({
      workflowName: mockMetadata.workflowName,
      filename: undefined,
      path: undefined,
    });
  });
});
