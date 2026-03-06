## Agent Handoff: Spec-to-Ship Workspace (Spec Stage)

### Objective
Validate whether a collaborative markdown + agent patch flow can reliably improve spec quality and reduce time to first commit.

### Must-Haves (Spec Stage)
1. Clear differentiation from incumbent collaborative docs.
2. Explicit patch/merge governance model.
3. Validation metrics for retention, patch acceptance, and throughput gains.
4. Repo generation phase design with scope boundaries.

### Execution Tasks
1. Run broad discovery interviews and summarize current workflows.
2. Prototype patch approval flow and run design-partner sessions.
3. Measure patch acceptance and perceived trust.
4. Test export bundle -> repo scaffold handoff.
5. Produce MVP milestone plan and scope cuts.
6. Implement depth-check protocol:
   - detect missing required artifacts
   - trigger targeted continuation questions
   - block completion until recap is delivered

### Acceptance Criteria
1. Spec includes measurable "spec-to-first-commit" targets.
2. Spec includes reliability and safety guardrails for collaboration.
3. Spec includes clear phase gates for repo generation rollout.
4. Agent always outputs end-of-iteration recap with thesis changes and open decisions.
5. User confirms recap alignment before phase completion.
6. Handoff includes parallel execution pack:
   - workstream split
   - dependency ordering
   - verification commands
   - bounded sub-agent prompt templates
