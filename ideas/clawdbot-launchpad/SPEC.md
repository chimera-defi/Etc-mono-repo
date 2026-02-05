# Clawdbot Launchpad Technical Spec

**Status**: Draft | **Last Updated**: Feb 5, 2026 | **Owner**: TBD

## System Overview

Clawdbot Launchpad is a multi-tenant control plane that provisions and manages Clawdbot/Moltbot runtimes on shared containers (MVP) and dedicated VPS (Phase 2).

## Deployment Paths (Concrete Defaults)

**Upstream**: openclaw/openclaw (MIT).

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
