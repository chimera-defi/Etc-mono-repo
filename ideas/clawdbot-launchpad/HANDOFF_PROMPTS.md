# Subagent Handoff Prompts

**Status**: Draft | **Last Updated**: Feb 8, 2026

## How to Use

Run these in parallel as subagents. Each agent should update the referenced doc and leave a short summary at the top.

## 1) Product Manager (PRD Owner)

**Prompt**:
You are the product manager. Update `ideas/clawdbot-launchpad/PRD.md` with concrete goals, scope, pricing, and success metrics. Confirm license constraints and clarify MVP vs Phase 2. Keep the PRD crisp and measurable.

**Deliverables**:
- PRD updated with final goals and metrics.
- Open questions reduced to five or fewer.

## 2) Tech Lead / Architect (Spec Owner)

**Prompt**:
You are the technical lead. Update `ideas/clawdbot-launchpad/SPEC.md` with final architecture decisions, data model, API surface, and provisioning flow. Choose control plane stack and runtime orchestrator. Focus on security, scale, and maintainability.

**Deliverables**:
- Spec updated with chosen stack.
- Clear provisioning state machine.

## 3) Backend Lead

**Prompt**:
You are the backend lead. Produce an implementation plan for the control plane API and provisioning workers. Add details to `TASKS.md` for backend items, including dependencies and rollout order.

**Deliverables**:
- Backend task breakdown in TASKS.
- API endpoints validated against PRD.

## 4) Frontend Lead

**Prompt**:
You are the frontend lead. Define the dashboard UX and page map. Add UI tasks and wireframes (text is fine) to `TASKS.md`. Identify any shared components or design tokens needed.

**Deliverables**:
- Frontend task list.
- Minimal UX flow for deploy and logs.

## 5) DevOps / Platform

**Prompt**:
You are the platform engineer. Decide the MVP runtime (containers vs VPS), propose infra as code, and list the provisioning steps in `SPEC.md`. Add infra tasks to `TASKS.md`.

**Deliverables**:
- Infra plan with IaC tool choice.
- Provisioning pipeline with failure handling.

## 6) Security / Compliance

**Prompt**:
You are the security owner. Create a threat model summary and required controls. Add security tasks to `TASKS.md`, and update `SPEC.md` with security gates and secrets handling.

**Deliverables**:
- Threat model summary.
- Security controls checklist.

## 7) QA / Testing

**Prompt**:
You are the QA owner. Define MVP test strategy: provisioning, uptime, rollback, billing. Add QA tasks to `TASKS.md`.

**Deliverables**:
- Test plan outline.
- Automated test priorities.

## 8) Support / Ops

**Prompt**:
You are operations. Define support workflows, runbooks, and escalation. Add support tasks to `TASKS.md` and note any admin tooling needed.

**Deliverables**:
- Support workflow summary.
- Admin tooling requirements.
