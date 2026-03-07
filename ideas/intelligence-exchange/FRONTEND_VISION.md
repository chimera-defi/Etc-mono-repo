## Frontend Vision (Intelligence Exchange)

## Core Surfaces
1. Buyer dashboard
2. Worker dashboard
3. Job queue and result explorer
4. Risk/dispute center
5. Settlement and payout views
6. Job detail state/action inspector (agent-first)

## Buyer Dashboard
1. Live queue and SLA status.
2. Acceptance/rework trends by task class.
3. Spend controls and anomaly alerts.
4. Export panel for completed outputs and execution traces.

## Worker Dashboard
1. Runtime status (manual/scheduled/autonomous).
2. Claimed/completed/rejected jobs.
3. Quality score trend and trust-tier status.
4. Earnings, payout schedule, and policy violations.

## Interaction Model
1. Guardrails are configured before worker can run autonomously.
2. High-risk tasks require explicit approval for lower-trust workers.
3. Critical actions are reversible where feasible (pause/requeue/dispute).
4. Every key lifecycle state is visible via consistent state chips.

## MVP Scope
1. Desktop web primary.
2. Mobile web for monitoring and approval actions.
3. No native app requirement for MVP.

## Wireframe Mapping
1. Buyer console -> queue + mode + policy controls.
2. Worker console -> runtime + guardrails + recent outcomes.
3. Job detail -> deterministic state/action loop visibility.
4. Risk panel -> case triage and escalation operations.
5. Mobile review -> high-risk moderation actions only.
