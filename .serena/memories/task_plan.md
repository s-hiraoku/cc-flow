Phase 2 objectives:
1. Extend data model to accept workflowSteps (title, mode, agents) JSON.
2. Update poml template partials to iterate workflowSteps, support sequential/parallel messaging.
3. Update convert_poml_to_markdown to build workflowSteps JSON, pass via pomljs.
4. Adjust CLI (create-workflow.sh) to parse new config/args into workflowSteps.
5. Update tests/docs for multi-step support.