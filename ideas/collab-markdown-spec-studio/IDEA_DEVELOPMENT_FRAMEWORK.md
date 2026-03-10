## Idea Development Framework (SpecForge Candidate Feature)

### Objective
Standardize how an agent takes a rough idea to a decision-ready spec pack with consistent depth, explicit gaps, and user alignment checkpoints.

### Depth Standard (Definition of "Fleshed Out")
An idea is "fleshed out" only when all of the following exist:
1. `EXECUTIVE_SUMMARY` with one-line thesis, wedge, top risks.
2. `PRD` with users, scope, GTM, business model, kill criteria.
3. `SPEC` with architecture, components, data model, APIs, NFRs, phase plan.
4. `ARCHITECTURE_DIAGRAMS` with value flow and failure/recovery.
5. `VALIDATION_PLAN` plus measurable go/no-go scorecard.
6. `RISK_REGISTER` and baseline `FINANCIAL_MODEL`.
7. `AGENT_HANDOFF` with implementation readiness criteria.
8. UX pack:
   - `UX_PRINCIPLES.md`
   - `USER_FLOWS.md`
   - `FRONTEND_VISION.md`
   - `WIREFRAMES.md` (lo-fi text/ASCII acceptable)
9. Competitor tracking:
   - `COMPETITOR_ANALYSIS.md`
   - `COMPETITOR_MATRIX.md` with named competitors and capability scoring

### Agent Flow (Broad -> Deep)
1. Frame: restate idea, non-goals, and success condition in plain language.
2. Probe: ask targeted questions until missing constraints are explicit.
3. Structure: produce first-pass pack skeletons.
4. Stress-test: run adversarial and feasibility passes.
5. Refine: tighten scope, assumptions, and economics.
6. Align: summarize final concept and confirm user intent match.

### Required Questioning Behavior
If required depth artifacts are missing, the agent must ask focused continuation questions instead of ending early.

Priority question categories:
1. User and pain: who pays, who uses, what is urgent now.
2. Scope and constraints: MVP boundaries, excluded features, timeline.
3. Economics: pricing logic, cost drivers, margin assumptions.
4. Architecture: control points, failure handling, trust boundaries.
5. GTM: first segment, acquisition channel, validation signal.
6. Risks: legal/policy/abuse/reliability failure modes.
7. Competition: named alternatives, why we still win, and where we are weaker.

### End-of-Iteration Recap Protocol
At the end of each major iteration, the agent must provide:
1. Current one-paragraph product thesis.
2. "What changed" from prior iteration.
3. Open decisions requiring user input.
4. Current go/no-go posture and why.
5. UX drift note: what changed in user journey/screens and why.

### Exit Gates Before Build
1. Spec completeness gate: all depth-standard artifacts present.
2. Consistency gate: no contradiction across PRD/SPEC/financial/risk docs.
3. Validation gate: pilot plan has measurable pass/fail thresholds.
4. Alignment gate: user confirms final summary matches intended vision.
5. UX gate: user flows and wireframes cover primary and failure paths.

### Meta Learnings to Propagate (From Prior Idea Evolution)
1. Phase-gate scope early (MVP, Phase 2, later) to avoid architecture sprawl.
2. Keep explicit decision gates with kill criteria tied to measurable outcomes.
3. Prefer prototype-first validation for highest-risk assumptions.
4. Produce implementation-oriented artifacts that parallel agents can execute from.
5. Preserve a concise executive layer for humans and a deep build layer for agents.

### Parallel Execution Pack Standard
For implementation-ready handoff, include:
1. Workstream split (`frontend`, `backend`, `data`, `infra`, `qa`).
2. Dependency map for task ordering (what must land first).
3. Acceptance criteria per task with objective checks.
4. Verification commands (lint/test/smoke) per workstream.
5. Prompt templates for sub-agents with bounded scope and output format.

### Productization in SpecForge
This framework can become a guided wizard in SpecForge:
1. Stepwise prompts with required-field checks.
2. Auto-generated artifact skeletons from user answers.
3. Agent-generated gap prompts when sections are weak.
4. Recap panel that tracks idea drift across iterations.
5. Final "implementation-ready" checklist with blockers.
