# Clawdbot Launchpad Technical Spec

**Status**: Draft | **Last Updated**: Feb 8, 2026 | **Owner**: TBD

## System Overview

Clawdbot Launchpad is a multi-tenant control plane that provisions and manages Clawdbot/Moltbot runtimes on shared containers (MVP) and dedicated VPS (Phase 2).

## Deployment Paths (Concrete Defaults)

**Upstream**: candidate `openclaw/openclaw` (MIT — verify canonical repo + license).

## Infra Primitive Clarification (Hosting vs Workspaces)

Launchpad has two distinct compute needs:

1. **Production hosting (“data plane”)**: always-on customer bots with SLOs, stable ingress, persistent storage, quotas, secrets, backups, and strong isolation.
2. **Ephemeral compute (“workspaces”)**: short-lived sandboxes to build images, run tests, reproduce issues, or validate untrusted plugins.

**Daytona** fits (2) well, but is **not the default choice** for (1) unless proven by a POC (persistence, ingress, isolation, ops hooks).

### Pilot (Startup-Simple)

- **Cloud**: single VPS (Hetzner/DO/Vultr).  
- **Runtime**: Docker + Compose + Caddy/Traefik.  
- **Database**: Postgres (local or managed).  
- **Queue**: Redis or lightweight job runner.  
- **Secrets**: .env + file-based (short term).  
- **Logs**: container logs + logrotate.  
- **IaC**: simple Terraform or manual provisioning.  

**When**: first 10-50 users or pilot cohort.

### MVP (Managed Scale)

- **Cloud**: AWS (single region for MVP).  
- **Runtime (MVP)**: ECS Fargate (shared containers).  
- **Dedicated tier**: EC2 + Docker + systemd (Phase 2).  
- **Database**: Postgres (RDS).  
- **Queue**: SQS (provisioning jobs).  
- **Secrets**: AWS Secrets Manager + KMS.  
- **Images**: ECR + image scanning + signing.  
- **Logs/Metrics**: CloudWatch Logs + CloudWatch Metrics.  
- **Object storage**: S3 (artifacts, backups).  
- **IaC**: Terraform.  
- **CI/CD**: GitHub Actions.

### Alternatives Considered (Summary)

- **DigitalOcean**: DOKS + Managed Postgres + Spaces (lower cost, fewer enterprise controls).
- **Hetzner**: k3s + Postgres + MinIO (lowest cost, highest ops burden).

## Architecture (Text Diagram)

```
User -> Web App -> Control Plane API -> Provisioning Queue -> Workers
                               |                           |
                               v                           v
                         Billing/Stripe              Runtime (Containers/VPS)
                               |                           |
                               v                           v
                          Database                    Logs/Metrics/Secrets
```

## Core Components

1. **Web App**: marketing, signup, dashboard.
2. **Control Plane API**: auth, billing, deployments, actions.
3. **Provisioning Worker**: idempotent lifecycle jobs.
4. **Runtime Layer**: shared containers (MVP), VPS (Phase 2).
5. **Observability**: logs, metrics, alerts, audits.

## Data Model (Phase 1 Core)

1. `accounts` (user profile, auth, status)
2. `subscriptions` (plan, billing status)
3. `deployments` (runtime config, status)
4. `runtime_instances` (cluster/VPS metadata)
5. `secrets` (encrypted payload + metadata)

### Referral Credits Ledger (Optional in MVP, recommended for GTM)

If we run “tokenized credits” referrals in MVP, model them explicitly:
- `credits_ledger` (account_id, source, amount, currency="credits", created_at, expires_at, metadata)
- `credits_redemptions` (account_id, amount, applied_to_invoice_id, created_at, metadata)

**Rules**: non-transferable by default, capped, anti-abuse checks, and auditable.

### Configuration as a First-Class Object (MVP Requirement)

To support “configuration UX” and safe upgrades, deployments must have a versioned configuration history:

- `config_versions` (deployment_id, version, created_at, created_by, payload_encrypted, status)
- `deployments.current_config_version_id`
- `deployments.last_known_good_config_version_id`

**Operations**
- Apply config: create new `config_version` -> validate -> rollout -> mark LKG on success.
- Rollback: set `current_config_version_id` to LKG -> rollout -> health check.

**Phase 2 Additions**:
1. `backups` (snapshots + retention)
2. `deployment_versions` (image tag history)
3. `usage_metrics` (limits + billing signals)
4. `audit_logs` (user/admin actions)
5. `support_tickets` (ops workflow)

## API Surface (MVP)

**Auth**
- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/logout`

**Billing**
- `POST /billing/checkout`
- `POST /billing/webhook`
- `POST /billing/cancel`

**Deployments**
- `POST /deployments`
- `GET /deployments/:id`
- `POST /deployments/:id/restart`
- `POST /deployments/:id/update`

**Config**
- `GET /deployments/:id/config`
- `POST /deployments/:id/config` (create new config version + rollout)
- `POST /deployments/:id/rollback` (rollback to last-known-good)

**Logs**
- `GET /deployments/:id/logs`

## Provisioning Workflow

1. Validate plan + quota.
2. Allocate runtime (namespace or VPS).
3. Attach storage and network rules.
4. Inject secrets + config.
5. Pull signed image -> health check -> mark ready.

## Provisioning State Machine (MVP)

`requested` -> `provisioning` -> `configuring` -> `starting` -> `running`  
`running` -> `updating` -> `running`  
`running` -> `failed` (on crash loop or health check failure)  
`failed` -> `restarting` -> `running` (auto-restart policy)  
`running` -> `suspended` (billing delinquent)  
`suspended` -> `running` (on payment)  
`running` -> `terminated` (cancel + retention window)

## Runtime Details

**Single VPS (Pilot)**
- One Docker container per tenant.
- CPU/memory limits via Docker run flags.
- Per-tenant volume for config and bot memory.
- Reverse proxy for subdomains and SSL.

**Shared Containers (MVP)**
- Namespace per tenant.
- Resource limits (CPU, memory, storage).
- Network policies and egress allowlists.
- Per-tenant persistent volume.

**Dedicated VPS (Phase 2)**
- Per-tenant VM with Docker + systemd.
- Encrypted disk + snapshot backups.
- Optional static IP and custom domains.

## Optional: Daytona for Ephemeral Workspaces (Non-Production)

If adopted, Daytona is used for:
- **Image build/test sandboxes** (reproducible, isolated runs).
- **Support reproduction workspaces** (internal-only).
- **Plugin/skill validation** (execute untrusted code with strict egress).

**Explicit non-goal**: Daytona is not used as the customer bot hosting substrate in MVP unless a POC demonstrates:
- persistent volumes per tenant
- stable HTTPS ingress per tenant under our routing/TLS
- quotas + hard isolation + egress restrictions
- reliable restart/health checks + log export

## Default Limits (Initial, adjust after pilot)

| Plan | vCPU | Memory | Storage | Log Retention |
|------|-----:|-------:|--------:|---------------|
| Starter | 0.5 | 1GB | 10GB | 7 days |
| Pro | 1.0 | 2GB | 25GB | 30 days |
| Team (VPS) | 2.0 | 4GB | 50GB | 30 days |

## Security Model

1. Signed images with SBOM and scan gates.
2. Rootless containers with seccomp/AppArmor.
3. Secrets stored in KMS and injected at runtime.
4. Admin actions logged with audit trails.
5. Egress control to reduce abuse risk.

## Observability & SLOs

1. Uptime SLO: 99.5% (shared tier).
2. Provisioning time target: < 10 minutes.
3. Deployment success rate: > 95%.
4. Crash-loop alerts and auto-restart policy.
5. Cost anomaly detection on shared clusters.

## CI/CD and Image Pipeline

1. Build Clawdbot/Moltbot images from upstream tags.
2. Scan + sign images before publish.
3. Push to private registry with version tags.
4. Rollout via canary or staged updates.
5. Allow pinning versions in deployment config.

## Disaster Recovery

1. Daily snapshots for VPS tier.
2. Restore workflow tested monthly.
3. Config and secrets backup encrypted.
4. Regional failover plan for control plane.
5. Runbook for incident response.

## Open Decisions (Remaining)

1. Confirm pilot path (single VPS) vs jump to managed MVP.
2. Region strategy (single region vs multi-region at launch).
3. Free trial policy and abuse controls for trials.
4. Versioning strategy for upstream updates (auto vs pinned).
5. Support model (human-only vs automation + escalation).
