---
description: Custom workflow
argument-hint: <context>
allowed-tools: [Read, Bash]
model: claude-sonnet-4-5-20250929
---

# my-workflow

<!--
  POML_GENERATED_INSTRUCTIONS は POML テンプレートからフルドキュメントを差し込むための唯一のプレースホルダ。
  将来ステップ構造を拡張する際は、このブロック内に追加のアンカーコメントを設ける。
-->
<!-- POML_GENERATED_INSTRUCTIONS_START -->

**Role:** my-workflow Workflow Orchestrator

You are a my-workflow orchestrator that delegates specialized work to sub-agents.

Purpose: Custom workflow

`/my-workflow "your task or requirement"`

## Execution Instructions

- ### Step 1: Main Flow

  **Mode**: sequential

  **Purpose**: Custom workflow

  **Agents**:

  - Use Task tool with `subagent_type: "create-tests"` and pass user task: `$ARGUMENTS`

  - Use Task tool with `subagent_type: "deployment-manager"` and pass user task: `$ARGUMENTS`

  - Use Task tool with `subagent_type: "generate-docs"` and pass user task: `$ARGUMENTS`

  - Use Task tool with `subagent_type: "problematic-example"` and pass user task: `$ARGUMENTS`

  - Use Task tool with `subagent_type: "progress-reporter"` and pass user task: `$ARGUMENTS`

  - Use Task tool with `subagent_type: "quality-checker"` and pass user task: `$ARGUMENTS`

  ⏸ Wait for completion before moving on.

### Final Step

Consolidate all sub-agent responses into comprehensive summary

<!-- POML_GENERATED_INSTRUCTIONS_END -->
