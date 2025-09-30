# Workflow Graph Traversal Specification

**Version:** 1.0.0  
**Date:** 2025-09-30  
**Status:** Draft  
**Validation Mode:** Strict (Option A)

---

## 1. Overview

### 1.1 Purpose

This specification defines the graph traversal algorithm for converting visual workflow graphs into executable JSON configurations. The system ensures that workflows respect node connection order and support both sequential and parallel execution patterns.

### 1.2 Motivation

The current `createWorkflowJSON` function only processes `AgentNode` types in isolation, ignoring:
- Start/End node connections
- Graph topology and execution order
- StepGroupNode containers for parallel execution
- Disconnected or invalid node configurations

This specification addresses these limitations by implementing a graph-based traversal system with strict validation.

---

## 2. Node Types

### 2.1 Node Type Definitions

| Node Type | Purpose | Properties |
|-----------|---------|------------|
| **StartNode** | Workflow entry point | `kind: 'start'`, `label`, `description` |
| **AgentNode** | Individual agent execution | `agentName`, `stepTitle`, `stepMode`, `stepPurpose` |
| **StepGroupNode** | Parallel execution container | `title`, `mode`, `purpose`, `agents[]` |
| **EndNode** | Workflow exit point | `kind: 'end'`, `label`, `description` |

### 2.2 Node Type Guards

```typescript
export function isStartNode(node: WorkflowNode): node is StartNode;
export function isEndNode(node: WorkflowNode): node is EndNode;
export function isAgentNode(node: WorkflowNode): node is AgentNode;
export function isStepGroupNode(node: WorkflowNode): node is StepGroupNode;
```

---

## 3. Graph Validation Rules (Strict Mode)

### 3.1 Required Conditions

All conditions must be satisfied for a workflow to be valid:

1. **Start Node Existence**
   - Exactly one `StartNode` must exist
   - Error: `"Start node is required"`

2. **End Node Existence**
   - Exactly one `EndNode` must exist
   - Error: `"End node is required"`

3. **Complete Connectivity**
   - A path must exist from Start to End
   - Error: `"End node is not reachable from Start node"`

4. **No Disconnected Nodes**
   - All workflow nodes (AgentNode, StepGroupNode) must be reachable from Start
   - Error: `"N disconnected nodes found: [node IDs]"`

5. **No Cycles**
   - The graph must be a Directed Acyclic Graph (DAG)
   - Error: `"Cycle detected in workflow graph"`

### 3.2 Validation Algorithm

```typescript
interface ValidationResult {
  isValid: boolean;
  errors: string[];
  disconnectedNodes?: WorkflowNode[];
}

function validateWorkflowGraph(
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
      errors: ["End node is not reachable from Start node"] 
    };
  }

  // 4. Check for disconnected workflow nodes
  const workflowNodes = nodes.filter(
    n => isAgentNode(n) || isStepGroupNode(n)
  );
  const disconnectedNodes = workflowNodes.filter(
    n => !reachable.has(n.id)
  );

  if (disconnectedNodes.length > 0) {
    const nodeIds = disconnectedNodes.map(n => n.id).join(", ");
    return {
      isValid: false,
      errors: [`${disconnectedNodes.length} disconnected nodes found: ${nodeIds}`],
      disconnectedNodes
    };
  }

  // 5. Check for cycles
  if (hasCycle(nodes, edges)) {
    return { isValid: false, errors: ["Cycle detected in workflow graph"] };
  }

  return { isValid: true, errors: [] };
}
```

---

## 4. Graph Traversal Algorithm

### 4.1 Adjacency Map Construction

```typescript
function buildAdjacencyMap(edges: WorkflowEdge[]): Map<string, string[]> {
  const map = new Map<string, string[]>();
  
  for (const edge of edges) {
    const targets = map.get(edge.source) || [];
    targets.push(edge.target);
    map.set(edge.source, targets);
  }
  
  return map;
}
```

### 4.2 BFS Reachability

```typescript
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
```

### 4.3 BFS Traversal for Execution Order

```typescript
function bfsTraversal(
  startNode: StartNode,
  adjacencyMap: Map<string, string[]>,
  nodes: WorkflowNode[]
): WorkflowNode[] {
  const visited = new Set<string>();
  const queue: string[] = [startNode.id];
  const result: WorkflowNode[] = [];
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

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
    queue.push(...neighbors.filter(id => !visited.has(id)));
  }

  return result;
}
```

### 4.4 Cycle Detection

```typescript
function hasCycle(
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): boolean {
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
```

---

## 5. JSON Conversion

### 5.1 Main Conversion Function

```typescript
export function createWorkflowJSON(
  metadata: WorkflowMetadata,
  nodes: WorkflowNode[],
  edges: WorkflowEdge[]
): string {
  // 1. Validate graph
  const validation = validateWorkflowGraph(nodes, edges);
  if (!validation.isValid) {
    throw new WorkflowValidationError(
      `Invalid workflow: ${validation.errors.join(', ')}`,
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
```

### 5.2 Node-to-Step Conversion

```typescript
function convertNodeToStep(node: WorkflowNode): WorkflowStepPayload {
  if (isAgentNode(node)) {
    return {
      title: node.data.stepTitle || node.data.agentName,
      mode: node.data.stepMode || "sequential",
      purpose: node.data.stepPurpose || "",
      agents: [node.data.agentName],
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
```

---

## 6. Error Handling

### 6.1 Custom Error Classes

```typescript
export class WorkflowValidationError extends Error {
  constructor(
    message: string,
    public validation: ValidationResult
  ) {
    super(message);
    this.name = "WorkflowValidationError";
  }
}
```

### 6.2 Error Messages

| Error Type | Message Template | User Action |
|------------|------------------|-------------|
| No Start Node | "Start node is required" | Add a Start node to the canvas |
| No End Node | "End node is required" | Add an End node to the canvas |
| Unreachable End | "End node is not reachable from Start node" | Connect Start to End with edges |
| Disconnected Nodes | "N disconnected nodes found: [IDs]" | Connect all nodes to the main path |
| Cycle Detected | "Cycle detected in workflow graph" | Remove circular connections |

---

## 7. Test Scenarios

### 7.1 Valid Workflows

#### Test Case 1: Simple Sequential Flow
```
Start → Agent1 → Agent2 → End
```
**Expected:** Valid, 2 steps (Agent1, Agent2)

#### Test Case 2: Parallel Group
```
Start → StepGroup(Agent1, Agent2) → End
```
**Expected:** Valid, 1 step with mode="parallel", agents=[Agent1, Agent2]

#### Test Case 3: Mixed Flow
```
Start → Agent1 → StepGroup(Agent2, Agent3) → Agent4 → End
```
**Expected:** Valid, 3 steps in order

### 7.2 Invalid Workflows

#### Test Case 4: Missing Start
```
Agent1 → Agent2 → End
```
**Expected:** Error: "Start node is required"

#### Test Case 5: Missing End
```
Start → Agent1 → Agent2
```
**Expected:** Error: "End node is required"

#### Test Case 6: Disconnected Node
```
Start → Agent1 → End
Agent2 (no connections)
```
**Expected:** Error: "1 disconnected nodes found: Agent2"

#### Test Case 7: Unreachable End
```
Start → Agent1
Agent2 → End (not connected to Start)
```
**Expected:** Error: "End node is not reachable from Start node"

#### Test Case 8: Cycle
```
Start → Agent1 → Agent2 → Agent1 (cycle)
```
**Expected:** Error: "Cycle detected in workflow graph"

---

## 8. Implementation Files

### 8.1 Modified Files

| File | Changes |
|------|---------|
| `cc-flow-web/src/utils/workflowUtils.ts` | Add validation, traversal, and conversion functions |
| `cc-flow-web/src/hooks/useWorkflowSave.ts` | Pass `edges` parameter to `createWorkflowJSON` |

### 8.2 New Test Files

| File | Purpose |
|------|---------|
| `cc-flow-web/src/utils/__tests__/workflowGraphTraversal.test.ts` | Unit tests for traversal algorithm |
| `cc-flow-web/src/utils/__tests__/workflowValidation.test.ts` | Unit tests for validation logic |

---

## 9. Type Definitions

### 9.1 Existing Types (Reference)

```typescript
export interface WorkflowNode<T extends WorkflowNodeData = WorkflowNodeData> {
  id: string;
  type: 'agent' | 'step-group' | 'start' | 'end';
  data: T;
  position: { x: number; y: number };
  selected?: boolean;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
}

export interface WorkflowStepPayload {
  title: string;
  mode: "sequential" | "parallel";
  purpose: string;
  agents: string[];
}
```

---

## 10. Performance Considerations

### 10.1 Complexity Analysis

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| Build adjacency map | O(E) | O(V + E) |
| BFS traversal | O(V + E) | O(V) |
| Cycle detection | O(V + E) | O(V) |
| Overall | O(V + E) | O(V + E) |

Where:
- V = number of nodes
- E = number of edges

### 10.2 Optimization Notes

- For typical workflows (< 100 nodes), performance is negligible
- Adjacency map is built once and reused
- Early termination on validation errors

---

## 11. Future Enhancements

### 11.1 Potential Features

1. **Warning Mode**
   - Allow disconnected nodes with warnings instead of errors
   - Useful for draft workflows

2. **Multiple Paths**
   - Support conditional branching
   - Add edge conditions for dynamic routing

3. **Subgraph Validation**
   - Validate nested workflow structures
   - Support recursive workflow composition

4. **Visual Feedback**
   - Highlight validation errors on canvas
   - Show reachability visualization

---

## 12. References

- [ReactFlow Documentation](https://reactflow.dev/)
- [Graph Theory: BFS Algorithm](https://en.wikipedia.org/wiki/Breadth-first_search)
- [DAG and Topological Sorting](https://en.wikipedia.org/wiki/Topological_sorting)

---

## 13. Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-09-30 | Initial specification with strict validation mode |

---

## 14. Appendix: Example JSON Output

### Input Graph
```
Start → Agent1 → StepGroup(Agent2, Agent3) → Agent4 → End
```

### Output JSON
```json
{
  "workflowName": "my-workflow",
  "workflowPurpose": "Example workflow",
  "workflowModel": "default",
  "workflowArgumentHint": "<context>",
  "workflowSteps": [
    {
      "title": "Agent 1",
      "mode": "sequential",
      "purpose": "First step",
      "agents": ["agent1"]
    },
    {
      "title": "Parallel Processing",
      "mode": "parallel",
      "purpose": "Process in parallel",
      "agents": ["agent2", "agent3"]
    },
    {
      "title": "Agent 4",
      "mode": "sequential",
      "purpose": "Final step",
      "agents": ["agent4"]
    }
  ]
}
```