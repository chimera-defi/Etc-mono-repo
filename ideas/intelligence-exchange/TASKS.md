# Intelligence Exchange Task List (Build-Ready)

## Milestones
1. Spec package complete and approved.
2. Discovery interviews complete with summary report.
3. Concierge pilot launched with design partners.
4. Pilot economics and risk review complete.
5. Build/no-build decision recorded.

## Phase 0 (Spec Lock)
- [ ] Finalize operating model: agent-first job marketplace with cloud-backed fulfillment.
- [ ] Finalize default payment path and optional rails expansion sequence.
- [ ] Finalize pilot success/kill thresholds.
- [ ] Finalize seller quality and onboarding checklist.

## Parallel Workstreams (AgentCon Kickoff)

### WS-1 Marketplace Product and UX
- [ ] Lock primary personas (buyer, supplier, operator) and top workflows.
- [ ] Define first-transaction success criteria and drop-off recovery.
- [ ] Define marketplace trust UX (quality signals, dispute posture, transparency).
- Deliverables: updated `PRD.md`, `USER_FLOWS.md`, `WIREFRAMES.md`.
- Done when: first-time buyer and supplier flows are measurable end-to-end.

### WS-2 Job Protocol and Routing
- [ ] Define job schema, SLA fields, and acceptance state machine.
- [ ] Define broker routing policy and fallback behavior.
- [ ] Define result artifact contract and provenance metadata.
- Deliverables: `SPEC.md` protocol sections + state update in `STATE_MODEL.md`.
- Done when: a job can be routed, fulfilled, validated, and settled deterministically.

### WS-3 Supplier Runtime and Agent Connector
- [ ] Define supplier agent runtime contract (local/hosted black-box execution).
- [ ] Define heartbeat, capability advertisement, and health checks.
- [ ] Define sandbox and egress policy expectations.
- Deliverables: runtime section in `SPEC.md` + operator checklist.
- Done when: supplier lifecycle (register -> available -> executing -> drained) is fully specified.

### WS-4 Risk, Abuse, and Disputes
- [ ] Define fraud/throttle/quality abuse controls.
- [ ] Define dispute lifecycle with evidence requirements.
- [ ] Define audit log and incident response minimums.
- Deliverables: `ADVERSARIAL_TESTS.md`, `RISK_REGISTER.md`, dispute policy appendix.
- Done when: top abuse scenarios have preventative and corrective controls.

### WS-5 Economics and Payments
- [ ] Define pricing model, fee model, and payout cadence.
- [ ] Define settlement flow and reconciliation controls.
- [ ] Define optional payment-rail expansion plan and gating rules.
- Deliverables: `FINANCIAL_MODEL.md`, payment section in `SPEC.md`, `UX_AND_PAYMENTS_FLOW.md`.
- Done when: per-job unit economics and break-even assumptions are testable.

### WS-6 Validation and Pilot Ops
- [ ] Run 15 discovery interviews.
- [ ] Run 3-5 concierge pilot accounts.
- [ ] Measure buyer value, supplier reliability, and operator burden.
- [ ] Measure fraud/dispute rate and SLA adherence.
- Deliverables: pilot report + go/no-go recommendation.
- Done when: scorecard in `GO_NO_GO_SCORECARD.md` is fully evaluated.

## Dependency Order
1. WS-1 and WS-6 start immediately.
2. WS-2 starts after WS-1 flow lock.
3. WS-3 and WS-4 start once WS-2 schema draft is stable.
4. WS-5 starts with WS-2 and finalizes before pilot expansion.

## One-Shot Build Readiness Gates
- [ ] Versioned protocol schema with example payloads and error envelopes.
- [ ] Explicit lifecycle state model with transition guards.
- [ ] End-to-end happy path + failure path tests mapped to each key flow.
- [ ] Local dev fixture pack and synthetic jobs for deterministic testing.
- [ ] "First 60 minutes" operator runbook validated by a fresh agent.

## Phase 1 (Validation)
- [ ] Execute WS-6 and publish synthesis.
- [ ] Refine MVP scope to minimum defensible marketplace.
- [ ] Capture explicit de-scope list for post-MVP.

## Phase 2 (Decision)
- [ ] Publish validation report.
- [ ] Decide continue/pivot/stop.
- [ ] If continue: freeze MVP scope and implementation sequence.
