# Workflow Context Inheritance Specification

## Overview

CC-Flow workflows enable sequential execution of sub-agents where each agent automatically inherits context from previous steps. This document specifies how context inheritance works and provides guidelines for effective workflow design.

## Context Inheritance Mechanism

### How It Works

1. **Parent Orchestrator**: When a workflow command (e.g., `/cc-sdd-workflow`) is executed, a parent orchestrator agent is created
2. **Conversation History**: The orchestrator maintains a conversation history across all sub-agent executions
3. **Automatic Inheritance**: Each sub-agent invoked via the Task tool has access to:
   - Original user input
   - All previous sub-agent responses in the workflow
   - Any files created or modified by previous steps

### Architecture

```
┌─────────────────────────────────────┐
│   Workflow Orchestrator             │
│                                     │
│   Conversation History:             │
│   - User input                      │
│   - Sub-agent 1 response            │
│   - Sub-agent 2 response            │
│   - ...                             │
└─────────────────────────────────────┘
           │
           ├──> Task(steering)     → Response added to history
           │
           ├──> Task(spec-init)    → Sees steering response
           │
           ├──> Task(spec-requirements) → Sees steering + spec-init
           │
           └──> Task(...)           → Sees all previous responses
```

## Execution Flow Example

### Input
```bash
/cc-sdd-workflow "Create a REST API for task management with CRUD operations, user authentication, and task assignment features"
```

### Step-by-Step Execution

1. **Step 1: steering**
   - Input: User's project description
   - Context: User input only
   - Output: Project knowledge base → Added to conversation history

2. **Step 2: spec-init**
   - Input: User's project description
   - Context: User input + steering's output
   - Output: Specification directory structure → Added to history

3. **Step 3: spec-requirements**
   - Input: User's project description
   - Context: User input + steering + spec-init outputs
   - Output: EARS format requirements → Added to history

4. **Step 4: spec-design**
   - Input: User's project description
   - Context: All previous outputs accumulated
   - Output: Technical design document → Added to history

... and so on for remaining steps.

## Key Principles

### 1. No Explicit Context Passing Required

❌ **Not needed**:
```xml
<stepwiseInstructions>
  <item>Pass $STEERING_RESULT to spec-init</item>
  <item>Pass $STEERING_RESULT + $SPEC_INIT_RESULT to spec-requirements</item>
</stepwiseInstructions>
```

✅ **Automatic**:
```xml
<stepwiseInstructions>
  <item>Use Task tool with subagent_type: "steering"</item>
  <item>Use Task tool with subagent_type: "spec-init"</item>
  <item>Use Task tool with subagent_type: "spec-requirements"</item>
</stepwiseInstructions>
```

### 2. Generic Template Design

Workflow templates remain generic and reusable:
- No workflow-specific context passing logic
- No hard-coded variable names
- Works for any sub-agent combination

### 3. File-Based Persistence

Sub-agents should save outputs to files when appropriate:
```bash
# steering saves to:
.kiro/steering.md

# spec-init creates:
.kiro/specs/<feature-name>/

# spec-requirements saves to:
.kiro/specs/<feature-name>/requirements.md
```

Later agents can:
- Read conversation history (automatic)
- Read files created by previous agents (explicit)

## Requirements for Effective Workflows

### 1. Specific User Input

❌ **Ineffective** (too generic):
```bash
/cc-sdd-workflow "test"
```

✅ **Effective** (specific and detailed):
```bash
/cc-sdd-workflow "Create a REST API for task management with the following features:
- CRUD operations for tasks (create, read, update, delete)
- User authentication with JWT tokens
- Task assignment to users
- Task status tracking (todo, in-progress, done)
- Due date management"
```

### 2. Agent Design

Each sub-agent should:
- Accept the accumulated context from conversation history
- Extract relevant information for its specific task
- Save outputs to appropriate files
- Return structured responses that next agents can use

### 3. Sequential Dependencies

Workflows should be designed with clear sequential dependencies:
```
steering (project knowledge)
  → spec-init (create structure)
    → spec-requirements (define requirements)
      → spec-design (technical design)
        → spec-tasks (implementation tasks)
          → spec-impl (execute implementation)
            → validate-gap (verify completion)
```

## Template Structure

### Minimal Template (Current Implementation)

```xml
<poml>
  <include src="partials/role.poml" />
  <include src="partials/task-overview.poml" />
  <!-- example.poml removed to reduce redundancy -->
  <include src="partials/stepwise.poml" />
</poml>
```

### Stepwise Instructions

```xml
<stepwiseInstructions captionStyle="bold">
  <section caption="Stepwise Instructions">
    <list for="step in workflowSteps">
      <item>
        <paragraph>Step {{loop.index + 1}}: {{step.title}}</paragraph>
        <paragraph>Mode: {{step.mode || 'sequential'}}</paragraph>
        <list for="agent in step.agents">
          <item>
            Use Task tool with subagent_type: "{{agent}}" and pass user task: $ARGUMENTS
          </item>
        </list>
        <paragraph>Wait for completion before moving on.</paragraph>
      </item>
    </list>
  </section>
</stepwiseInstructions>
```

## Benefits

1. **Simplicity**: No complex variable management or explicit context passing
2. **Genericity**: Same template works for all workflows
3. **Maintainability**: Clear separation between workflow structure and execution
4. **Flexibility**: Sub-agents can access any previous context as needed
5. **Reliability**: Built-in context inheritance through conversation history

## Limitations and Considerations

### Token Limits
- Long workflows accumulate large conversation histories
- Consider breaking very long workflows into multiple smaller workflows

### File-Based State
- Critical state should be saved to files
- Files provide persistent reference beyond conversation history

### Error Recovery
- If a step fails, subsequent steps still see the partial history
- Design agents to handle incomplete context gracefully

## Testing Context Inheritance

To verify context inheritance works:

1. Create a test workflow with 3+ agents
2. First agent outputs unique marker (e.g., `CONTEXT_TEST_123`)
3. Second agent should reference the marker
4. Third agent should reference outputs from both previous agents

Example test:
```bash
/test-workflow "Generate unique ID: TEST_${RANDOM}"
# Agent 1: Creates ID
# Agent 2: Should see and reference Agent 1's ID
# Agent 3: Should reference both IDs
```

## Version History

- **v1.0** (2025-01-04): Initial specification documenting automatic context inheritance mechanism
