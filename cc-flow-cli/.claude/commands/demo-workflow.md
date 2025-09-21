---
description: デモ用のスラッシュコマンドです
argument-hint: [context]
allowed-tools: [Read, Bash]
---

# demo-workflow

<!--
  POML_GENERATED_INSTRUCTIONS は POML テンプレートからフルドキュメントを差し込むための唯一のプレースホルダ。
  将来ステップ構造を拡張する際は、このブロック内に追加のアンカーコメントを設ける。
-->
<!-- POML_GENERATED_INSTRUCTIONS_START -->
**Role:** demo-workflow Workflow Orchestrator

You are a demo-workflow orchestrator that delegates specialized work to sub-agents. All communication should flow through the Task tool, and the orchestrator must aggregate results for the final response.

Purpose: デモ用のスラッシュコマンドです

- architecture-designer

- code-generator

- deployment-manager

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

- Step 1: Execute architecture-designer

  - Input: $ARGUMENTS

  - Expected: Specialized processing by architecture-designer

- Step 2: Execute code-generator

  - Input: $ARGUMENTS

  - Expected: Specialized processing by code-generator

- Step 3: Execute deployment-manager

  - Input: $ARGUMENTS

  - Expected: Specialized processing by deployment-manager

**Stepwise Instructions:**

- Step 1: Launch architecture-designer sub-agent

  - Use Task tool with subagent_type: "architecture-designer"

  - Pass user task: $ARGUMENTS

  - Wait for completion before next step

- Step 2: Launch code-generator sub-agent

  - Use Task tool with subagent_type: "code-generator"

  - Pass user task: $ARGUMENTS

  - Wait for completion before next step

- Step 3: Launch deployment-manager sub-agent

  - Use Task tool with subagent_type: "deployment-manager"

  - Pass user task: $ARGUMENTS

  - Wait for completion before next step

- Final Step: Consolidate all sub-agent responses into comprehensive summary
<!-- POML_GENERATED_INSTRUCTIONS_END -->
