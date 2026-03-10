## Agent Handoff: SpecForge (Spec Stage)

### Objective
Validate whether a collaborative markdown + agent patch flow can reliably improve spec quality and reduce time to first commit.

### Must-Haves (Spec Stage)
1. Clear differentiation from incumbent collaborative docs.
2. Explicit patch/merge governance model.
3. Validation metrics for retention, patch acceptance, and throughput gains.
4. Repo generation phase design with scope boundaries.

### Parallel Sub-Agent Prompts (Bounded)
1. Product/UX Agent
   - Scope: `PRD.md`, `USER_FLOWS.md`, `WIREFRAMES.md`
   - Prompt: "Lock primary JTBD, map critical flows, and convert each flow into measurable acceptance criteria with explicit failure/recovery paths."
2. Collaboration-Core Agent
   - Scope: `SPEC.md`
   - Prompt: "Define realtime collaboration state model, event contracts, and merge invariants that are deterministic under concurrent edits."
3. Governance/Safety Agent
   - Scope: `SPEC.md`, `ADVERSARIAL_TESTS.md`, `RISK_REGISTER.md`
   - Prompt: "Define patch governance, approval rules, and rollback/audit semantics; enumerate abuse cases and blocking controls."
4. Export/Handoff Agent
   - Scope: `VISION_AND_FLOW.md`, `AGENT_HANDOFF.md`
   - Prompt: "Define the export bundle contract and repo-generation handoff so downstream coding agents can execute with minimal ambiguity."
5. Validation/Econ Agent
   - Scope: `VALIDATION_PLAN.md`, `GO_NO_GO_SCORECARD.md`, `FINANCIAL_MODEL.md`
   - Prompt: "Produce objective pilot thresholds and kill criteria with instrumentation requirements."

### Merge Contract Across Sub-Agents
1. No section is considered complete without explicit acceptance criteria.
2. All metrics must include data source and owner.
3. Any unresolved ambiguity must produce an ask-user question before merge.
4. End each pass with a concise recap: thesis changes, decisions, open items.

### Acceptance Criteria
1. Spec includes measurable "spec-to-first-commit" targets.
2. Spec includes reliability and safety guardrails for collaboration.
3. Spec includes clear phase gates for repo generation rollout.
4. Agent always outputs end-of-iteration recap with thesis changes and open decisions.
5. User confirms recap alignment before phase completion.
6. Handoff includes parallel execution pack: workstreams, dependency ordering, verification checks, and bounded prompts.
