# OpenClaw / Clawdbot Memory Backup

## Core Idea

Build an AI server-management product where users spin up and operate server fleets with an ops-specialized agent.

Control surfaces:
- Web console (fleet health, approvals, audit timeline)
- CLI (`clawd server add`, `clawd deploy`, `clawd patch`)
- API/SDK for CI/CD integration

## What We Already Have In Repo

- Concept and expansion draft: `ideas/server-management-agent/README.md`
- Runtime backup (root install references): `ai_memory/openclaw_clawdbot_runtime_backup.md`
- Launchpad research pack:
  - `ideas/clawdbot-launchpad/README.md`
  - `ideas/clawdbot-launchpad/PRD.md`
  - `ideas/clawdbot-launchpad/SPEC.md`
  - `ideas/clawdbot-launchpad/COMPETITOR_ANALYSIS.md`
  - `ideas/clawdbot-launchpad/RESEARCH_NOTES.md`

## Key Product Directions

1. SaaS control plane + agent on customer infra
2. CLI-first open core + paid hosted control plane
3. Enterprise self-hosted option (audit and compliance focus)

## Best Initial Niches

- Small teams with 5-200 servers lacking dedicated SRE
- Agencies managing many client environments
- Validator/operator infra (high uptime + auditability requirements)
- Game server fleets requiring repeatable scaling and patching

## Guardrails (Must-Have)

- Explicit approval flow for destructive actions
- Immutable action/audit logs
- Policy constraints (allowlist/denylist commands)
- Runbook-based automation with rollback paths
- Secret handling and key rotation standards

## Near-Term Execution Steps

1. Choose first surface (web-first vs CLI-first) and define MVP scope.
2. Specify runbook taxonomy (patch, backup, deploy, incident triage).
3. Implement minimal control plane + agent daemon with audit log.
4. Pilot with constrained environments and measure MTTR/reliability deltas.

## Global AI Tools & Skills (For This Domain)

- **Primary tools:** `rg` for code/doc search, QMD BM25 for ranked discovery, targeted reads for large specs.
- **Reusable skills:** `napkin` (continuous mistake/preference log), `token-reduce` (low-context retrieval flow).
- **Agent surfaces to plan for:** web console copilot, CLI copilot, API-triggered runbook automation.
