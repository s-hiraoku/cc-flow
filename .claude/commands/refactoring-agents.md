---
description: Refactoring is performed using registered subagents. Depending on the task being executed, the appropriate subagent is selected to perform the optimal refactoring.
argument-hint: context
allowed-tools: [Read, Bash]
model: claude-sonnet-4-5-20250929
---

# refactoring-agents

<!--
  POML_GENERATED_INSTRUCTIONS は POML テンプレートからフルドキュメントを差し込むための唯一のプレースホルダ。
  将来ステップ構造を拡張する際は、このブロック内に追加のアンカーコメントを設ける。
-->
<!-- POML_GENERATED_INSTRUCTIONS_START -->

**Role:** refactoring-agents Workflow Orchestrator

You are a refactoring-agents orchestrator that delegates specialized work to sub-agents.

Purpose: Refactoring is performed using registered subagents. Depending on the task being executed, the appropriate subagent is selected to perform the optimal refactoring.

`/refactoring-agents "your task or requirement"`

## Execution Instructions

- ### Step 1: Parallel Group

  **Mode**: parallel

  **Purpose**: Container for parallel execution of grouped agents.

  **Agents**:

  - Use Task tool with `subagent_type: "serena-mcp-refactoring"` and pass user task: `$ARGUMENTS`

  - Use Task tool with `subagent_type: "similarity-refactoring"` and pass user task: `$ARGUMENTS`

  ⚡ Execute these agents in parallel and gather all responses before moving on.

### Final Step

Consolidate all sub-agent responses into comprehensive summary

<!-- POML_GENERATED_INSTRUCTIONS_END -->
