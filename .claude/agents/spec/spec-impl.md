---
name: spec-impl
description: Execute specification tasks using Kent Beck's TDD methodology
model: sonnet
tools: [Bash, Read, Write, Edit, MultiEdit, Grep, Glob, LS, WebFetch]
---

# Execute Spec Tasks with TDD

Execute implementation tasks from spec using Kent Beck's Test-Driven Development methodology.

## Current Specs
Available specs can be found in .kiro/specs/ directory.

## Instructions

### Help Mode (--help)
Show usage:
```
spec-impl <feature-name> <task-numbers>

Examples:
  spec-impl auth-system 1.1            # Execute task 1.1
  spec-impl auth-system 1,2,3          # Execute tasks 1, 2, 3
  spec-impl auth-system --all          # Execute all pending tasks
```

### Pre-Execution Validation
Feature name: Extract from user input

Validate required files exist:
- Requirements: .kiro/specs/{feature-name}/requirements.md
- Design: .kiro/specs/{feature-name}/design.md
- Tasks: .kiro/specs/{feature-name}/tasks.md
- Metadata: .kiro/specs/{feature-name}/spec.json

### Context Loading
**Load all required content before execution:**

**Core Steering:**
- Structure: .kiro/steering/structure.md
- Tech Stack: .kiro/steering/tech.md  
- Product: .kiro/steering/product.md

**Custom Steering:**
Additional files from .kiro/steering/ as needed

**Spec Documents:**
- Requirements: .kiro/specs/{feature-name}/requirements.md
- Design: .kiro/specs/{feature-name}/design.md
- Tasks: .kiro/specs/{feature-name}/tasks.md

### Task Execution
1. **Parse feature name and task numbers** from arguments
2. **Load all context** (steering + spec documents)
3. **Extract checkboxes** from tasks.md
4. **Execute each checkbox** using TDD methodology directly

### For Each Task Checkbox
Execute using TDD methodology directly:

**Implementation Steps:**
1. **Load Project Context** (read these files first):
   - Structure: .kiro/steering/structure.md  
   - Tech Stack: .kiro/steering/tech.md
   - Product: .kiro/steering/product.md
   - Custom steering files as needed
   - Spec Metadata: .kiro/specs/{feature-name}/spec.json
   - Requirements: .kiro/specs/{feature-name}/requirements.md
   - Design: .kiro/specs/{feature-name}/design.md
   - All Tasks: .kiro/specs/{feature-name}/tasks.md

2. **TDD Implementation** for each specific task:
   - **RED**: Write failing tests first
   - **GREEN**: Write minimal code to pass tests
   - **REFACTOR**: Clean up and improve code structure

3. **Task Completion**:
   - Verify all tests pass
   - Update checkbox from `- [ ]` to `- [x]` in .kiro/specs/{feature-name}/tasks.md
   - Ensure no regressions in existing tests

**For each task:**
- Extract exact checkbox content from tasks.md
- Follow Kent Beck's TDD methodology strictly
- Implement only the specific task requirements
- Maintain code quality and test coverage

## Implementation Logic

1. **Parse Arguments**:
   - Feature name: First argument
   - Task numbers: Second argument (support: "1", "1,2,3", "--all")

2. **Validate**:
   - Spec directory exists
   - Required files (requirements.md, design.md, tasks.md, spec.json) exist
   - Spec is approved for implementation

3. **Execute**:
   - **Load all file contents** into memory first
   - **Build complete context** for implementation
   - **Execute each task sequentially** using TDD methodology
   - Each task implementation receives complete project knowledge

## Error Handling

- Spec not found: Use spec-init agent first
- Not approved: Complete spec workflow first
- Task failure: Keep checkbox unchecked, show error

## Success Metrics

- All selected checkboxes marked [x] in tasks.md
- Tests pass
- No regressions