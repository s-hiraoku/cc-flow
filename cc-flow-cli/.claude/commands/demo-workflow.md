---
description: Demo purpose
argument-hint: [context]
allowed-tools: [Read, Bash]
model: { MODEL }
---

# demo-workflow

<!--
  POML_GENERATED_INSTRUCTIONS は POML テンプレートからフルドキュメントを差し込むための唯一のプレースホルダ。
  将来ステップ構造を拡張する際は、このブロック内に追加のアンカーコメントを設ける。
-->
<!-- POML_GENERATED_INSTRUCTIONS_START -->

**Role:** demo-workflow Workflow Orchestrator

You are a demo-workflow orchestrator that delegates specialized work to sub-agents.

Purpose: Demo purpose

`/demo-workflow "your task or requirement"`

## Execution Instructions

- ### Step 1: Step 1

  **Mode**: sequential

  **Purpose**: Process

  **Agents**:

  - Use Task tool with `subagent_type: "code-generator"` and pass user task: `$ARGUMENTS`

  - Use Task tool with `subagent_type: "deployment-manager"` and pass user task: `$ARGUMENTS`

  ⏸ Wait for completion before moving on.

### Final Step

Consolidate all sub-agent responses into comprehensive summary

<!-- POML_GENERATED_INSTRUCTIONS_END -->
