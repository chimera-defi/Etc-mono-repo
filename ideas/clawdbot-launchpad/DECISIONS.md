# Launchpad Decision Log (MVP → Phase 2)

**Last Updated**: Feb 8, 2026

This is the “single page” future agents should use to understand what’s decided vs open.

## Decisions (lock before build)

### Product
- **MVP wedge**: migration-first pilot + configuration-first UI (wizard + upgrades + rollback).
- **MVP non-goals**: arbitrary code/plugins; shell access by default; multi-region.
- **Trial policy**: (TBD) $ credit with card verification vs no trial.
- **Referral credits (“tokens”)**: off-chain credits ledger (non-transferable, capped, audited).

### Trust & Safety
- **Runtime policy**: signed images only (MVP).
- **Secrets posture**: encrypted at rest, short-lived injection where possible, audit logs for access.
- **Data retention**: (TBD) log retention + config backup retention + deletion workflow.

### Infra (hosting vs workspaces)
- **Production hosting substrate**: (TBD) ECS/Fargate vs managed K8s vs VPS-per-tenant.
- **Ephemeral workspaces**: optional Daytona for internal build/repro/validation only.

## Acceptance Criteria (MVP “done”)

- **Time-to-ready**: deploy reaches `running` + passes health check within 10 minutes (p95).
- **Wizard success**: keys validated + “send test message” succeeds.
- **Upgrades**: one-click upgrade + one-click rollback to last-known-good.
- **Diagnostics**: user can export a sanitized diagnostics bundle (logs + runtime metadata + config version id).
- **Isolation**: per-tenant resource limits + basic egress controls.

