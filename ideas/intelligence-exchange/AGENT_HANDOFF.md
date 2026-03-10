## Agent Handoff: Intelligence Exchange (Spec Stage)

### Objective
Validate whether an agent-first execution-capacity exchange can achieve reliable supply, buyer adoption, and healthy margins with acceptable risk.

### Must-Haves (Spec Stage)
1. Clear operating model boundaries and prohibited behavior.
2. Routing + settlement architecture documented with failure modes.
3. Validation plan with explicit success/kill thresholds.
4. Supplier quality and dispute lifecycle requirements.

### Parallel Sub-Agent Prompts (Bounded)
1. Marketplace UX Agent
   - Scope: `PRD.md`, `USER_FLOWS.md`, `WIREFRAMES.md`, `UX_AND_PAYMENTS_FLOW.md`
   - Prompt: "Define buyer/supplier/operator flows with explicit trust moments, failure paths, and measurable conversion points."
2. Protocol/Router Agent
   - Scope: `SPEC.md`, `STATE_MODEL.md`
   - Prompt: "Define job protocol, routing policy, state transitions, and artifact contracts with deterministic replay semantics."
3. Supplier Runtime Agent
   - Scope: `SPEC.md`
   - Prompt: "Define supplier runtime interface and lifecycle, including health checks, capacity advertisement, and graceful drain semantics."
4. Risk and Disputes Agent
   - Scope: `ADVERSARIAL_TESTS.md`, `RISK_REGISTER.md`
   - Prompt: "Enumerate abuse and failure scenarios and specify controls, dispute evidence requirements, and response playbooks."
5. Economics Agent
   - Scope: `FINANCIAL_MODEL.md`, `GO_NO_GO_SCORECARD.md`, `VALIDATION_PLAN.md`
   - Prompt: "Model unit economics, pilot thresholds, and kill criteria with instrumentation requirements and owner mapping."

### Merge Contract Across Sub-Agents
1. Every flow must map to protocol states and test cases.
2. Every metric must name source of truth and review cadence.
3. Open ambiguities must emit ask-user questions before merge.
4. Each pass ends with concise recap: thesis changes, decisions, open items.

### Acceptance Criteria
1. Spec includes measurable pilot success criteria and kill thresholds.
2. Spec includes explicit supplier quality and dispute rules.
3. Spec includes clear phase gates and de-scope logic.
4. Handoff includes parallel execution pack: workstreams, dependencies, verification checks, and bounded prompts.
