import {
  WorkflowNode,
  WorkflowMetadata,
  WorkflowEdge,
  isAgentNode,
  isStepGroupNode,
  isStartNode,
  isEndNode,
  StartNode,
} from "@/types/workflow";

export type WorkflowMode = "sequential" | "parallel";

export interface WorkflowStepPayload {
  title: string;
  mode: WorkflowMode;
  purpose: string;
  agents: string[];
}

export interface CreateWorkflowPayload {
  workflowName: string;
  workflowPurpose: string;
  workflowModel?: string;
  workflowArgumentHint?: string;
  workflowSteps: WorkflowStepPayload[];
}

/**
 * Custom error class for workflow validation failures
 */
export class WorkflowValidationError extends Error {
  constructor(
    message: string,
    public validation: ValidationResult
  ) {
    super(message);
    this.name = "WorkflowValidationError";
  }
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  disconnectedNodes?: WorkflowNode[];
}

/**
 * Builds an adjacency map from edges for graph traversal
 */
function buildAdjacencyMap(edges: WorkflowEdge[]): Map<string, string[]> {
  const map = new Map<string, string[]>();

  for (const edge of edges) {
    const targets = map.get(edge.source) || [];
    targets.push(edge.target);
    map.set(edge.source, targets);
  }

  return map;
}

/**
 * Performs BFS to find all nodes reachable from a starting node
 */
function bfsReachability(
  startNodeId: string,
  adjacencyMap: Map<string, string[]>
): Set<string> {
  const reachable = new Set<string>();
  const queue: string[] = [startNodeId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;

    if (reachable.has(currentId)) continue;
    reachable.add(currentId);

    const neighbors = adjacencyMap.get(currentId) || [];
    queue.push(...neighbors);
  }

  return reachable;
}

/**
 * Detects cycles in the graph using DFS
 */
function hasCycle(nodes: WorkflowNode[], edges: WorkflowEdge[]): boolean {
  const adjacencyMap = buildAdjacencyMap(edges);
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function dfs(nodeId: string): boolean {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    const neighbors = adjacencyMap.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) return true;
      } else if (recursionStack.has(neighbor)) {
        return true; // Cycle detected
      }
    }

    recursionStack.delete(nodeId);
    return false;
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      if (dfs(node.id)) return true;
    }
  }

  return false;
}

/**
 * Validates the workflow graph with strict mode (Option A)
 * Requirements:
 * - Start node must exist
 * - End node must exist
 * - End must be reachable from Start
 * - No disconnected workflow nodes
 * - No cycles allowed
 */
export function validateWorkflowGraph(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): ValidationResult {
  // 1. Check Start node
  const startNode = nodes.find(isStartNode);
  if (!startNode) {
    return { isValid: false, errors: ["Start node is required"] };
  }

  // 2. Check End node
  const endNode = nodes.find(isEndNode);
  if (!endNode) {
    return { isValid: false, errors: ["End node is required"] };
  }

  // 3. Check Start → End reachability
  const adjacencyMap = buildAdjacencyMap(edges);
  const reachable = bfsReachability(startNode.id, adjacencyMap);

  if (!reachable.has(endNode.id)) {
    return {
      isValid: false,
      errors: ["End node is not reachable from Start node"],
    };
  }

  // 4. Check for disconnected workflow nodes
  const workflowNodes = nodes.filter(
    (n) => isAgentNode(n) || isStepGroupNode(n)
  );
  const disconnectedNodes = workflowNodes.filter((n) => !reachable.has(n.id));

  if (disconnectedNodes.length > 0) {
    const nodeIds = disconnectedNodes.map((n) => n.id).join(", ");
    return {
      isValid: false,
      errors: [
        `${disconnectedNodes.length} disconnected nodes found: ${nodeIds}`,
      ],
      disconnectedNodes,
    };
  }

  // 5. Check for cycles
  if (hasCycle(nodes, edges)) {
    return { isValid: false, errors: ["Cycle detected in workflow graph"] };
  }

  return { isValid: true, errors: [] };
}

/**
 * Performs BFS traversal to get workflow nodes in execution order
 */
function bfsTraversal(
  startNode: StartNode,
  adjacencyMap: Map<string, string[]>,
  nodes: WorkflowNode[]
): WorkflowNode[] {
  const visited = new Set<string>();
  const queue: string[] = [startNode.id];
  const result: WorkflowNode[] = [];
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  while (queue.length > 0) {
    const currentId = queue.shift()!;

    if (visited.has(currentId)) continue;
    visited.add(currentId);

    const currentNode = nodeMap.get(currentId);
    if (!currentNode) continue;

    // Add workflow nodes to result (exclude Start/End)
    if (isAgentNode(currentNode) || isStepGroupNode(currentNode)) {
      result.push(currentNode);
    }

    // Enqueue neighbors
    const neighbors = adjacencyMap.get(currentId) || [];
    queue.push(...neighbors.filter((id) => !visited.has(id)));
  }

  return result;
}

/**
 * Converts a workflow node to a workflow step payload
 */
function convertNodeToStep(node: WorkflowNode): WorkflowStepPayload {
  if (isAgentNode(node)) {
    const agentName = node.data.agentName || node.data.label;
    return {
      title: node.data.stepTitle || agentName,
      mode: node.data.stepMode || "sequential",
      purpose: node.data.stepPurpose || "",
      agents: [agentName],
    };
  }

  if (isStepGroupNode(node)) {
    return {
      title: node.data.title,
      mode: node.data.mode,
      purpose: node.data.purpose || "",
      agents: node.data.agents,
    };
  }

  throw new Error(`Unsupported node type for conversion: ${node.type}`);
}

/**
 * Creates a workflow JSON payload from metadata and nodes
 */
/**
 * Creates a workflow JSON payload from metadata, nodes, and edges
 * Uses graph traversal to determine execution order
 * Validates graph structure with strict mode (Option A)
 */
export function createWorkflowJSON(
  metadata: WorkflowMetadata,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): string {
  // 1. Validate graph structure
  const validation = validateWorkflowGraph(nodes, edges);
  if (!validation.isValid) {
    throw new WorkflowValidationError(
      `Invalid workflow: ${validation.errors.join(", ")}`,
      validation
    );
  }

  // 2. Find Start node and build adjacency map
  const startNode = nodes.find(isStartNode)!;
  const adjacencyMap = buildAdjacencyMap(edges);

  // 3. Traverse graph to get execution order
  const orderedNodes = bfsTraversal(startNode, adjacencyMap, nodes);

  // 4. Convert nodes to workflow steps
  const workflowSteps = orderedNodes.map(convertNodeToStep);

  // 5. Build payload
  const payload: CreateWorkflowPayload = {
    workflowName: metadata.workflowName || "",
    workflowPurpose: metadata.workflowPurpose || "",
    workflowModel: metadata.workflowModel || "default",
    workflowArgumentHint: metadata.workflowArgumentHint || "",
    workflowSteps,
  };

  return JSON.stringify(payload, null, 2);
}
