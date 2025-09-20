# Repository Guidelines

## Project Structure & Module Organization
Keep application code inside `cc-flow-cli/`, with Ink TUI screens under `src/ink/`, workflow services in `src/services/`, and shared utilities in `src/utils/`. Shell helpers live in `cc-flow-cli/scripts/`, while release tooling sits in `scripts/releases/`. Agent prompt templates belong in `cc-flow-cli/templates/`, and active agent or command definitions are tracked in `.claude/agents/` and `.claude/commands/`. System documentation is stored in `docs/`, and integration specs reside in `test/*.bats`.

## Build, Test, and Development Commands
Run `npm install` from `cc-flow-cli/` after cloning to sync Node 18+ dependencies. Use `npm run dev` for the live-reloading Ink TUI. `npm run build` emits distributable assets; `npm run validate` performs the type check plus bundle verification. Execute `npm run test` for the Vitest suite, `npm run test:watch` during active development, and `npm run test:coverage` before releases to confirm thresholds. From the repo root, `bats test` exercises bash workflow regressions.

## Coding Style & Naming Conventions
TypeScript files follow strict ESM, 2-space indentation, explicit return types, and named exports via barrel modules. Components adopt PascalCase (`WorkflowNameScreen.tsx`), functions stay camelCase, and shared types remain PascalCase. CLI command identifiers use kebab-case. Shell scripts must open with `#!/usr/bin/env bash`, add `set -euo pipefail`, and implement snake_case helpers with `info`, `success`, and `error_exit` messaging.

## Testing Guidelines
Place unit specs next to their sources as `*.spec.ts` or `*.test.ts`, isolating side effects with Vitest mocks that enable `isolate: true`. Keep integration coverage in BATS files that mirror user-facing workflows and clean fixtures in teardown blocks. Ensure `npm run test:coverage` and `bats test` both pass before publishing significant changes.

## Commit & Pull Request Guidelines
Write short, present-tense commit subjects such as `Add workflow preview`, and separate CLI code changes from `.claude` adjustments when possible. Pull requests should outline workflow impact, link any tracked issues, list executed commands (for example `npm run validate` and `bats test`), and attach TUI screenshots or recordings for UI-facing updates.

## Agent & Configuration Tips
Copy `cc-flow-cli/.env.example` to `.env` for local debugging, adjusting flags like `CC_FLOW_LOG_LEVEL` or timeout values instead of patching scripts. Group generated agents by domain within `.claude/agents/` so discovery scans stay fast and ordering metadata remains stable. Update workflow samples in `cc-flow-cli/templates/` whenever command behaviors change.
