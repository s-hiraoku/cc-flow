# Repository Guidelines

## Project Structure & Module Organization
- App code lives in `cc-flow-cli/`; TUI screens stay in `src/ink/`, services in `src/services/`, and shared helpers in `src/utils/`.
- Shell automation tools reside in `cc-flow-cli/scripts/` and release utilities in `scripts/releases/`.
- Agent templates are under `cc-flow-cli/templates/`; active agent and command configs live in `.claude/agents/` and `.claude/commands/`.
- System docs are stored in `docs/`; integration tests use BATS in `test/*.bats`.

## Build, Test, and Development Commands
- `cd cc-flow-cli && npm install` — install Node 18+ dependencies after cloning.
- `npm run dev` — launch the Ink TUI with live reload for local iteration.
- `npm run build` or `npm run validate` — produce `dist/` assets or run type-check plus bundle validation.
- `npm run test`, `npm run test:watch`, `npm run test:coverage` — execute Vitest suites, watch for changes, or collect coverage reports.
- From the repo root run `bats test` to execute bash workflow regression tests.

## Coding Style & Naming Conventions
- TypeScript uses strict ESM, 2-space indentation, explicit return types, and named exports from barrel files.
- Components are PascalCase (e.g., `WorkflowNameScreen.tsx`); functions camelCase; shared types PascalCase; generated CLI IDs kebab-case.
- Shell scripts begin with `#!/usr/bin/env bash` plus `set -euo pipefail`, using snake_case helpers and `info`/`success`/`error_exit` messaging.

## Testing Guidelines
- Unit specs sit beside sources as `*.spec.ts` or `*.test.ts`; isolate external effects with Vitest mocks (`isolate: true`).
- Mirror shell features with BATS files (e.g., `create-workflow.bats`) and clean fixtures during teardown.
- Run `npm run test:coverage` before releases and update workflow samples in `cc-flow-cli/templates/` when behaviors change.

## Commit & Pull Request Guidelines
- Follow short, present-tense commit subjects (e.g., `Add workflow preview`), keeping CLI code and `.claude` updates separate when possible.
- PRs should note workflow impact, list executed commands (`npm run validate`, `bats test`), and attach TUI screenshots or recordings for UI changes.

## Agent & Configuration Tips
- Copy `cc-flow-cli/.env.example` to `.env` for local debugging and adjust `CC_FLOW_LOG_LEVEL` or timeouts instead of editing scripts.
- Group generated agents by domain (e.g., `.claude/agents/spec/`) so discovery scans remain quick and ordering metadata stays intact.
