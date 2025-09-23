---
description: sequential agent execution
argument-hint: <context>
allowed-tools: [Read, Bash]
model: claude-3-5-haiku-20241022
---

# demo-workflow

<!--
  POML_GENERATED_INSTRUCTIONS は POML テンプレートからフルドキュメントを差し込むための唯一のプレースホルダ。
  将来ステップ構造を拡張する際は、このブロック内に追加のアンカーコメントを設ける。
-->
<!-- POML_GENERATED_INSTRUCTIONS_START -->

**Role:** demo-workflow Workflow Orchestrator

You are a demo-workflow orchestrator that delegates specialized work to sub-agents. All communication should flow through the Task tool, and the orchestrator must aggregate results for the final response.

Purpose: sequential agent execution

- architecture-designer

- code-generator

- quality-checker

- Step 1: Design

  Mode: Sequential (agents run in order)

  Purpose: Design the architecture

  - architecture-designer

- Step 2: QA

  Mode: Parallel (agents run concurrently)

  Purpose: Code generation and quality check

  - code-generator

  - quality-checker

`/demo-workflow "your task or requirement"`

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

- Step 1: Design

  Mode: sequential

  Purpose: Design the architecture

  - Agent: architecture-designer 

    - Input: $ARGUMENTS

    - Expected: Specialized processing by architecture-designer

- Step 2: QA

  Mode: parallel

  Purpose: Code generation and quality check

  - Agent: code-generator 

    - Input: $ARGUMENTS

    - Expected: Specialized processing by code-generator

  - Agent: quality-checker 

    - Input: $ARGUMENTS

    - Expected: Specialized processing by quality-checker

**Stepwise Instructions:**

- Step 1: Design

  Mode: sequential

  Purpose: Design the architecture

  - Use Task tool with subagent_type: "architecture-designer" and pass user task: $ARGUMENTS

  Wait for completion before moving on.

- Step 2: QA

  Mode: parallel

  Purpose: Code generation and quality check

  - Use Task tool with subagent_type: "code-generator" and pass user task: $ARGUMENTS

  - Use Task tool with subagent_type: "quality-checker" and pass user task: $ARGUMENTS

  Execute these agents in parallel and gather all responses before moving on.

- Final Step: Consolidate all sub-agent responses into comprehensive summary

<!-- POML_GENERATED_INSTRUCTIONS_END -->
