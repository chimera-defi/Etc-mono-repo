# Clawdbot Launchpad Task List

**Status**: Draft | **Last Updated**: Feb 5, 2026

## Milestones

1. PRD + Spec approved.
2. MVP control plane API online.
3. Shared container runtime working end-to-end.
4. Billing + deployment flow in production.
5. Pilot cohort onboarded.

## Phase 0 - Decisions (Week 0)

**Product**
- Confirm upstream repo + license.
- Decide pricing and trial policy.
- Define MVP scope and success metrics.
- Draft ToS and privacy notes.

**Technical**
- Choose cloud provider.
- Choose orchestrator (K8s/ECS/Nomad).
- Select secrets manager + KMS.
- Define log retention policy.

## Phase 0b - Pilot Build (Week 0-1)

**Single VPS**
- Provision VPS + harden (firewall, updates).
- Install Docker + Compose.
- Set up reverse proxy (Caddy/Traefik).
- Define container template + volumes per tenant.
- Script manual provisioning and cleanup.
- Basic monitoring (uptime + disk alerts).

## Phase 1 - MVP Build (Weeks 1-6)

**Backend / Control Plane**
- Auth + account service.
- Billing integration (Stripe webhooks).
- Deployment service + lifecycle API.
- Provisioning queue + workers.
- Audit log for admin actions.

**Frontend / Dashboard**
- Landing page + pricing.
- Signup + checkout flow.
- Deployment status view.
- Logs and restart actions.
- Settings (plan, cancel).

**Runtime / Infra**
- Shared container cluster setup.
- Namespace isolation + resource limits.
- Image registry + signing pipeline.
- Secrets injection workflow.
- Log aggregation and metrics.

**Security**
- Threat model + risk register.
- Container hardening baseline.
- Egress allowlist rules.
- Admin access controls.
- Incident response checklist.

**QA / Ops**
- Provisioning success tests.
- Smoke tests for deploy/update.
- Backup of config + secrets.
- On-call + support workflow.
- Pilot onboarding checklist.

## Phase 2 - Expansion (Weeks 7-10)

**Product**
- Add Moltbot to plans.
- Dedicated VPS tier definition.
- Backup/restore add-on pricing.

**Engineering**
- VPS provisioning worker.
- Snapshot backup + restore.
- Version pinning + rollbacks.
- Upgrade flow with canary.
- Usage metrics and alerts.

**Operations**
- Admin console for support.
- Cost monitoring dashboards.
- Abuse detection rules.
- Customer success playbook.
