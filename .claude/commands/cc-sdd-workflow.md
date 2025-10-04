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

You are a cc-sdd-workflow orchestrator that delegates specialized work to sub-agents.

Purpose: This is the workflow for specification-driven development. It takes user context as input and passes it to the required agents. The output consists of specifications and code.

`/cc-sdd-workflow "your task or requirement"`

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
