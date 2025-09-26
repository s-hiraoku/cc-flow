# CC-Flow Web Task Backlog

_Last updated: 2025-09-26_

## Workflow Editor Experience
- [ ] Extend the palette and canvas to support step-group, start, and end nodes with appropriate inspectors (`src/components/panels/AgentPalette.tsx`, `src/components/workflow-editor/*`).
- [ ] Sync React Flow state changes back into the editor hook so edges and node mutations persist (`src/components/workflow-editor/Canvas.tsx`, `src/hooks/useWorkflowEditor.ts`).
- [ ] Replace console alerts with in-app toasts or banners for save/preview feedback on `src/app/editor/page.tsx`.

## Workflow Persistence & APIs
- [ ] Redesign workflow serialization to capture graph structure, step metadata, and execution modes before writing files (`src/app/api/workflows/route.ts`, `src/services/WorkflowService.ts`).
- [ ] Add validation endpoint and shared validation logic to match the specification in `docs/web-editor-design.md`.
- [ ] Introduce configurable storage paths and error handling for workflow exports, including tests for the API layer.

## Documentation & Tooling Alignment
- [ ] Update README and docs to reflect the current implementation status and planned phases (`README.md`, `docs/README.md`).
- [ ] Reconcile Development Guide scripts and port numbers with `package.json` and actual dev server configuration (`docs/development/DEVELOPMENT_GUIDE.md`).
- [ ] Audit documentation references (e.g., API design, deployment) and either create stubs or adjust navigation links.

## Testing & Quality
- [ ] Expand integration tests to cover drag-and-drop flows, node removal, and save workflows with MSW-backed assertions (`src/components/__tests__`).
- [ ] Add unit tests for new validation and serialization logic (`src/services/__tests__`, `src/app/api/*`).
- [ ] Establish coverage reporting in CI and document the command sequence in `docs/testing/TESTING_GUIDE.md`.
