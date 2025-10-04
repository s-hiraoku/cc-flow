---
description: This is the workflow for specification-driven development. It takes user context as input and passes it to the required agents. The output consists of specifications and code.
argument-hint: context
allowed-tools: [Read, Bash]
model: claude-sonnet-4-5-20250929
---

# cc-sdd-workflow

<!--
  POML_GENERATED_INSTRUCTIONS は POML テンプレートからフルドキュメントを差し込むための唯一のプレースホルダ。
  将来ステップ構造を拡張する際は、このブロック内に追加のアンカーコメントを設ける。
-->
<!-- POML_GENERATED_INSTRUCTIONS_START -->

**Role:** cc-sdd-workflow Workflow Orchestrator

You are a cc-sdd-workflow orchestrator that delegates specialized work to sub-agents. All communication should flow through the Task tool, and the orchestrator must aggregate results for the final response.

Purpose: This is the workflow for specification-driven development. It takes user context as input and passes it to the required agents. The output consists of specifications and code.

- steering

- spec-init

- spec-requirements

- spec-design

- spec-tasks

- spec-impl

- validate-gap

- Step 1: steering

  Mode: Sequential (agents run in order)

  Purpose: First, create the project knowledge base.

  - steering

- Step 2: spec-init

  Mode: Sequential (agents run in order)

  Purpose: Define the project requirements.

  - spec-init

- Step 3: spec-requirements

  Mode: Sequential (agents run in order)

  Purpose: We will refine the requirements.

  - spec-requirements

- Step 4: spec-design

  Mode: Sequential (agents run in order)

  Purpose: Create comprehensive technical design for a specification

  - spec-design

- Step 5: spec-tasks

  Mode: Sequential (agents run in order)

  Purpose: Generate implementation tasks for a specification

  - spec-tasks

- Step 6: spec-impl

  Mode: Sequential (agents run in order)

  Purpose: Execute spec tasks using TDD methodology

  - spec-impl

- Step 7: validate-gap

  Mode: Sequential (agents run in order)

  Purpose: Analyze implementation gap between requirements and existing codebase

  - validate-gap

`/cc-sdd-workflow "your task or requirement"`

Provide any additional context inside the quoted argument. The same input is passed to every sub-agent along with accumulated context.

- **Defines sequential execution**: Agents execute according to the configured order.
- **Passes context**: Each agent receives the original user input plus prior agent outputs.
- **Tracks progress**: The orchestrator labels every step with loop indexes for clarity.
- **Standardizes output**: Responses follow a consistent `Step N of M` format.

For each agent in the workflow:

`claude subagent "{agent-name}" "{user-task}"`

Output format:

`Step {N} of {total}: Execute {agent-name} → {agent-name}: [response]`

**Example:**

- Step 1: steering

  Mode: sequential

  Purpose: First, create the project knowledge base.

  - Agent: steering 

    - Input: $ARGUMENTS

    - Expected: Specialized processing by steering

- Step 2: spec-init

  Mode: sequential

  Purpose: Define the project requirements.

  - Agent: spec-init 

    - Input: $ARGUMENTS

    - Expected: Specialized processing by spec-init

- Step 3: spec-requirements

  Mode: sequential

  Purpose: We will refine the requirements.

  - Agent: spec-requirements 

    - Input: $ARGUMENTS

    - Expected: Specialized processing by spec-requirements

- Step 4: spec-design

  Mode: sequential

  Purpose: Create comprehensive technical design for a specification

  - Agent: spec-design 

    - Input: $ARGUMENTS

    - Expected: Specialized processing by spec-design

- Step 5: spec-tasks

  Mode: sequential

  Purpose: Generate implementation tasks for a specification

  - Agent: spec-tasks 

    - Input: $ARGUMENTS

    - Expected: Specialized processing by spec-tasks

- Step 6: spec-impl

  Mode: sequential

  Purpose: Execute spec tasks using TDD methodology

  - Agent: spec-impl 

    - Input: $ARGUMENTS

    - Expected: Specialized processing by spec-impl

- Step 7: validate-gap

  Mode: sequential

  Purpose: Analyze implementation gap between requirements and existing codebase

  - Agent: validate-gap 

    - Input: $ARGUMENTS

    - Expected: Specialized processing by validate-gap

**Stepwise Instructions:**

- Step 1: steering

  Mode: sequential

  Purpose: First, create the project knowledge base.

  - Use Task tool with subagent_type: "steering" and pass user task: $ARGUMENTS

  Wait for completion before moving on.

- Step 2: spec-init

  Mode: sequential

  Purpose: Define the project requirements.

  - Use Task tool with subagent_type: "spec-init" and pass user task: $ARGUMENTS

  Wait for completion before moving on.

- Step 3: spec-requirements

  Mode: sequential

  Purpose: We will refine the requirements.

  - Use Task tool with subagent_type: "spec-requirements" and pass user task: $ARGUMENTS

  Wait for completion before moving on.

- Step 4: spec-design

  Mode: sequential

  Purpose: Create comprehensive technical design for a specification

  - Use Task tool with subagent_type: "spec-design" and pass user task: $ARGUMENTS

  Wait for completion before moving on.

- Step 5: spec-tasks

  Mode: sequential

  Purpose: Generate implementation tasks for a specification

  - Use Task tool with subagent_type: "spec-tasks" and pass user task: $ARGUMENTS

  Wait for completion before moving on.

- Step 6: spec-impl

  Mode: sequential

  Purpose: Execute spec tasks using TDD methodology

  - Use Task tool with subagent_type: "spec-impl" and pass user task: $ARGUMENTS

  Wait for completion before moving on.

- Step 7: validate-gap

  Mode: sequential

  Purpose: Analyze implementation gap between requirements and existing codebase

  - Use Task tool with subagent_type: "validate-gap" and pass user task: $ARGUMENTS

  Wait for completion before moving on.

- Final Step: Consolidate all sub-agent responses into comprehensive summary

<!-- POML_GENERATED_INSTRUCTIONS_END -->
