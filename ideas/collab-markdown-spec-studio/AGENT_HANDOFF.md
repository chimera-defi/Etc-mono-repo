## Agent Handoff: SpecForge (Spec Stage)

### Objective
Validate whether a collaborative spec IDE with depth gates and governed agent patch review can reliably improve spec quality, reduce time to first commit, and support example authoring -> spec -> code runs on selected `ideas/` packs.

### Must-Haves (Spec Stage)
1. Clear differentiation from incumbent collaborative docs.
2. Explicit patch/merge governance model.
3. Validation metrics for repeated authoring behavior, patch trust, and throughput gains.
4. Repo generation phase design with scope boundaries and curated example rollout.
5. CRDT collaboration plan that preserves reviewability and attribution.

### Parallel Sub-Agent Prompts (Bounded)
1. Product/UX Agent
   - Scope: `PRD.md`, `USER_FLOWS.md`, `WIREFRAMES.md`
   - Prompt: "Lock the primary JTBD as a spec IDE with depth gates, map critical authoring flows, and convert each flow into measurable acceptance criteria with explicit failure/recovery paths."
2. Collaboration-Core Agent
   - Scope: `SPEC.md`, `TECH_STACK.md`
   - Prompt: "Define realtime collaboration state model, CRDT/editor boundary, recommended stack, event contracts, and merge invariants that are deterministic under concurrent edits."
3. Governance/Safety Agent
   - Scope: `SPEC.md`, `ADVERSARIAL_TESTS.md`, `RISK_REGISTER.md`
   - Prompt: "Define patch governance, approval rules, and rollback/audit semantics; enumerate abuse cases and blocking controls."
4. Export/Handoff Agent
   - Scope: `VISION_AND_FLOW.md`, `AGENT_HANDOFF.md`
   - Prompt: "Define the export bundle contract and example-first repo-generation handoff so downstream coding agents can execute with minimal ambiguity."
5. Validation/Econ Agent
   - Scope: `VALIDATION_PLAN.md`, `GO_NO_GO_SCORECARD.md`, `FINANCIAL_MODEL.md`
   - Prompt: "Produce objective pilot thresholds and kill criteria with instrumentation requirements, authoring-first metrics, and a seat-plus-usage financial model."

### Merge Contract Across Sub-Agents
1. No section is considered complete without explicit acceptance criteria.
2. All metrics must include data source and owner.
3. Any unresolved ambiguity must produce an ask-user question before merge.
4. End each pass with a concise recap: thesis changes, decisions, open items.
5. Any patch/merge design must preserve attribution and deterministic replay.

### Acceptance Criteria
1. Spec includes measurable "spec-to-first-commit" targets.
2. Spec includes reliability and safety guardrails for collaboration.
3. Spec includes clear phase gates for repo generation rollout.
4. Agent always outputs end-of-iteration recap with thesis changes and open decisions.
5. User confirms recap alignment before phase completion.
6. Handoff includes parallel execution pack: workstreams, dependency ordering, verification checks, and bounded prompts.
7. Example-run strategy uses selected `ideas/` packs as benchmarks, not as a substitute for real-user authoring validation.

### Implementation Notes
1. Use off-the-shelf collaboration libraries where possible.
2. Prefer TDD for contracts, merge invariants, export determinism, and depth-gate behavior.
3. Multi-agent runs may simulate one "human" actor for regression and soak testing, but real human sessions remain the source of product validation.
