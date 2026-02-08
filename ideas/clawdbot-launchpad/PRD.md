# Clawdbot Launchpad PRD

**Status**: Draft | **Last Updated**: Feb 8, 2026 | **Owner**: TBD

## Problem

Clawdbot/Moltbot adoption stalls because users must set up, secure, and maintain hosting. The friction is highest for non-technical users, and support load grows as DIY deployments fail.

## Goals

1. Reduce time-to-first-deploy to under 10 minutes.
2. Deliver a reliable, always-on runtime with minimal user ops.
3. Offer a simple paid path with predictable costs.
4. Provide safe defaults for security and secrets handling.
5. Establish a scalable foundation for growth and upgrades.

## Non-Goals

1. Building a full general-purpose PaaS.
2. Supporting every possible bot runtime at launch.
3. Providing shell access by default.
4. Solving complex enterprise compliance in MVP.
5. Replacing upstream Clawdbot/Moltbot development.

## Target Users

- Individuals who want a hosted bot without DevOps.
- Small teams who need reliable uptime and support.
- Developers who prefer managed hosting over DIY.

## Value Proposition

- One-click deploy with managed updates and backups.
- Reliable uptime without infrastructure knowledge.
- Clear pricing with an upgrade path for higher tiers.

## Configuration UX (MVP Definition)

Launchpad’s moat is the **configuration UX**, not raw hosting. “One-click” should mean:
- Guided install wizard (keys validated, safe defaults, test action, health checks).
- A versioned config object per deployment (diff before apply, last-known-good).
- Safe upgrades from the UI (release notes + rollback).

## Migration (Primary Early Offer)

Migration is an explicit go-to-market wedge:
- Self-serve import (sanitized config + data export) with a dry-run boot.
- Concierge migration (paid or bundled) for Pro/Team tiers.
- Cutover gated by automated checks; rollback plan documented.

## Distribution (Tokenized Credits)

“Tokens” are implemented as **off-chain referral credits** in the billing ledger:
- Referrers earn credits redeemable for free months/upgrades/migration fees.
- Referred users receive a first-month discount or migration credit.
- Credits are capped + abuse-protected; not a tradable crypto token in MVP.

## User Journeys (MVP)

1. Visit landing page -> choose plan -> checkout.
2. Guided setup wizard -> connect keys/secrets -> deploy -> run test -> see "ready" status.
3. View logs/diagnostics -> restart -> confirm health.
4. Upgrade plan -> migrate runtime -> keep data.

## MVP Scope

**Phase 0 (Pilot)**:
- Single VPS hosting with Docker + reverse proxy.
- Manual provisioning + limited user count (10-50).
- Basic logs and restart support.

**Phase 1 (MVP)**:
- One-click Clawdbot deploy (single image version).
- Shared container runtime with basic isolation.
- Dashboard for status, logs, restart, update.
- Stripe billing (monthly plans).
- Manual support workflow (email/Slack).

**Phase 2 (Expansion)**:
- Moltbot image + version switching.
- Dedicated VPS tier.
- Backups and restore.
- Basic alerts and usage metrics.
- Admin support console.

## MVP Defaults (Proposed)

1. **Pilot**: single VPS (Hetzner/DO/Vultr) + Docker.
2. **Provider**: AWS ECS/Fargate (alt: DO DOKS) for managed MVP.
3. **Region**: single region at launch.
4. **Trial**: $5 credit with card verification (no free tier).
5. **Logs**: 7-day retention (30-day add-on).
6. **Versioning**: pinned tags + opt-in canary updates.
7. **Support**: tiered (self-serve + human for paid tiers).

## Infra Validation (Redo)

**We have two different infra needs**:
- **Production hosting** (always-on bots): prioritize stability, isolation, secrets, ingress, and operability.
- **Ephemeral workspaces** (build/test/support): prioritize fast, reproducible sandboxes.

**Daytona** is a candidate for **ephemeral workspaces**, not the default for production hosting, unless proven by a short POC.

## Functional Requirements

1. User signup, billing, and plan management.
2. Provisioning workflow with status updates.
3. Dashboard for logs, restart, update actions.
4. Secret injection for API keys and configs.
5. Cancellation with cleanup and data retention rules.

## Non-Functional Requirements

1. Provisioning success rate > 95% for MVP.
2. Provisioning time target < 10 minutes.
3. Availability target 99.5% for shared tier.
4. Secure secrets storage with rotation capability.
5. Audit trail for admin and user actions.

## Pricing & Packaging (Initial)

| Plan | Price | Target | Notes |
|------|------:|--------|------|
| Starter | $9/mo | Individuals | Shared container |
| Pro | $25/mo | Power users | Bigger limits |
| Team | $59/mo | Small teams | Dedicated VPS + backups |

**Initial quota proposal** (align with pricing model):
- Starter: 0.5 vCPU, 1GB RAM, 10GB storage, 7-day logs.
- Pro: 1 vCPU, 2GB RAM, 25GB storage, 30-day logs.
- Team: 2 vCPU, 4GB RAM, 50GB storage, 30-day logs.

## Success Metrics

1. Conversion from waitlist to paid > 10%.
2. Activation rate (deploy within 24h) > 70%.
3. Monthly churn < 6% after 3 months.
4. Support tickets per user < 0.3/month.
5. Gross margin > 60% for MVP tiers.

## Dependencies

1. Upstream repo + license to confirm (candidate: `openclaw/openclaw`, MIT — verify).
2. Cloud provider selection for MVP.
3. Container registry + signing pipeline.
4. Billing provider (Stripe) integration.
5. Secrets manager and KMS availability.

## Risks

1. Unlicensed installers in the ecosystem; avoid bundling them.
2. Noisy neighbor issues on shared containers.
3. Support overhead overwhelms small team.
4. High infra costs reduce margins.
5. Users prefer free DIY installers.

## Open Questions

1. Which cloud provider offers the best cost/ops balance?
2. Confirm log retention costs vs pricing.
3. Confirm trial credit size and abuse controls.
4. Decide if single-region is acceptable for initial launch.
