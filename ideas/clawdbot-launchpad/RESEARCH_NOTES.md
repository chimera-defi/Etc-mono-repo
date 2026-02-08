# Clawdbot Launchpad Research Notes

**Status**: Draft | **Last Updated**: Feb 8, 2026

## Upstream Repos and License Signals (GitHub)

| Repo | License | Notes |
|------|---------|------|
| https://github.com/openclaw/openclaw | MIT | Likely canonical upstream by stars. |
| https://github.com/cloudflare/moltworker | Apache-2.0 | Serverless runtime option. |
| https://github.com/liam798/docker-openclawd | Apache-2.0 | DIY Docker installer. |
| https://github.com/miaoxworld/OpenClawInstaller | None detected | Treat as unlicensed; avoid bundling. |

**Implication**: OpenClaw MIT license is compatible with managed hosting. Avoid redistributing unlicensed installers.

## Open Questions -> Options and Tradeoffs

### 1) Hosting Provider (MVP)

| Option | Pros | Cons | Best When |
|--------|------|------|-----------|
| AWS (ECS/Fargate + RDS + S3) | Mature managed services, compliance-ready, strong secrets/logging | Higher cost, more configuration | Enterprise path, strong reliability |
| DigitalOcean (DOKS + Managed PG) | Simple UX, good cost, fast setup | Smaller ecosystem, less enterprise tooling | Fast MVP with moderate scale |
| Hetzner (k3s + managed DB) | Lowest cost, high margins | More ops burden, fewer managed services | Cost-sensitive MVP |

**Recommendation**: If ops headcount is small, choose managed services (AWS or DO).

### Daytona (daytona.io) Evaluation (Redo)

**Key clarification**: Daytona is primarily a **developer workspace** platform (create isolated “workspaces” from a repo and run commands inside them). That maps extremely well to **ephemeral compute** (build/test/repro/support sandboxes), but it is not obviously the right primitive for **persistent, customer-facing bot hosting**.

#### Where Daytona *does* fit Launchpad

- **Build & release pipeline sandboxes**: reproducible environments to build Clawdbot/Moltbot images, run integration tests, and generate SBOMs.
- **Support “repro workspace”** (internal-only): spin up a sealed environment using a customer’s sanitized config snapshot to reproduce bugs without touching prod.
- **Safe plugin/skill validation** (if Launchpad ever supports user-provided skills): execute untrusted code in a tightly sandboxed workspace with strict egress rules.

#### Where Daytona is risky as the *data plane* (hosting bots)

To host bots for paying customers, the platform needs: always-on processes, stable ingress, per-tenant volumes, quotas, egress control, secrets injection/rotation, audit logs, and strong multi-tenant isolation.

Daytona may support some of these depending on how it is deployed (e.g., on Kubernetes), but using it as the primary hosting substrate introduces uncertainty and extra glue:

- **Always-on semantics**: workspaces are designed for “dev sessions”, not necessarily 24/7 daemons with uptime SLOs.
- **Ingress & routing**: customer-friendly subdomains/custom domains + TLS + rate limits are core hosting needs; Daytona’s port-forwarding model may not match.
- **Multi-tenant controls**: strict per-tenant isolation, network policies, and noisy-neighbor protections must be first-class, not bolted on.
- **Secrets lifecycle**: “customer secrets” need KMS-backed storage, short-lived injection, rotation, and audit trails.
- **Billing → enforcement**: suspend/resume, quota enforcement, and metering need to be deterministic and supportable.

**Conclusion (current)**:
- **Use Daytona for internal ephemeral environments** (build/repro/validation) if it saves time.
- **Do not bet Launchpad production hosting on Daytona** unless a small POC proves: persistent volumes, stable ingress, hard multi-tenant isolation, and operational hooks (health checks, restarts, autoscaling, auditability).

#### Minimal POC to validate Daytona (1–2 days)

- Provision Daytona on a small Kubernetes cluster.
- Create 3 “tenant” workspaces from a template that runs a long-lived process.
- Verify:
  - **Persistence**: per-tenant volume survives restart and upgrade.
  - **Stability**: workspace stays up 24h without manual intervention.
  - **Ingress**: stable HTTPS endpoint per workspace with routing you control (not developer port-forward UX).
  - **Isolation**: CPU/mem quotas, network egress restrictions, and tenant separation.
  - **Ops hooks**: restart, upgrade, log collection, health check.

### 1a) SaaS/PaaS Hosting Options (Managed)

| Option | Pros | Cons | Best When |
|--------|------|------|-----------|
| Render | Simple deploys, managed DB | Limited infra control | Small team, fast MVP |
| Railway | Easy env + DB, fast setup | Cost at scale | Rapid prototyping |
| Fly.io | Global regions, Machines | More infra knowledge | Latency-sensitive apps |
| Koyeb | Serverless containers, autoscale | Smaller ecosystem | Simple stateless services |
| Northflank | CI/CD, multi-env | Pricing complexity | Multi-service apps |
| Cloud Run / App Runner | Fully managed | Vendor-specific constraints | Minimal ops |

### 1b) Self-Hosted PaaS on One VPS

| Option | Pros | Cons |
|--------|------|------|
| Coolify | One-click apps, SSL, DBs | Still requires ops |
| CapRover | Simple Docker app deploys | Less enterprise tooling |
| Dokku | Heroku-like workflows | Limited UI |
| Portainer | UI for containers | Not a full PaaS |

### 1c) Single VPS + Docker (Startup Path)

**Approach**: One VPS runs Docker. Each Clawdbot is a container with its own volume and env config. A reverse proxy (Caddy/Traefik) handles subdomains.

**Pros**:
- Cheapest path to revenue.
- Fastest to build and operate.
- Easy to debug early issues.

**Cons**:
- Single point of failure.
- Noisy neighbor risk.
- Manual scaling and ops load.

**When to use**: First 10-50 users or pilot cohort.

### 2) Orchestrator (Shared Containers)

| Option | Pros | Cons | Best When |
|--------|------|------|-----------|
| ECS/Fargate | No nodes to manage, good isolation controls | AWS lock-in, cost | Ops-light MVP |
| Kubernetes (managed) | Flexible, ecosystem tools | More complexity | Longer-term platform |
| Nomad | Simpler than K8s | Smaller ecosystem | Lean infra teams |

### 3) Secrets Management

| Option | Pros | Cons |
|--------|------|------|
| Cloud-native (AWS/GCP) | Best security integration | Vendor lock-in |
| Vault (self-hosted) | Portable | More ops burden |
| SOPS + KMS | Lightweight | Fewer dynamic secrets |

### 4) Logging Retention

| Option | Pros | Cons |
|--------|------|------|
| 7 days (default) | Lower cost | Short debugging window |
| 30 days (paid) | Better support | Higher storage cost |
| 90 days (enterprise) | Compliance | Higher cost + privacy risk |

### 5) Versioning Strategy

| Option | Pros | Cons |
|--------|------|------|
| Pinned image tags | Stability | Manual updates |
| Auto minor updates | Security patches | Risk of regressions |
| Canary + opt-in | Balanced | More tooling |

### 6) Trial / Free Tier

| Option | Pros | Cons |
|--------|------|------|
| No trial | Low abuse | Slower adoption |
| 7-day trial | Faster adoption | Abuse risk |
| Credits ($5-$10) | Controlled spend | Requires billing flow |

### 7) Region Selection

| Option | Pros | Cons |
|--------|------|------|
| Single region | Simplest | Latency for global users |
| Multi-region | Better latency | Higher ops complexity |

### 8) Support Model

| Option | Pros | Cons |
|--------|------|------|
| Human-only | High quality | Costly |
| Tiered (self-serve + human) | Scalable | Requires automation |
| Community-only | Low cost | Lower reliability |

## Suggested MVP Defaults (Concrete)

1. **Provider**: DigitalOcean or AWS (pick one).
2. **Orchestrator**: ECS/Fargate (AWS) or DOKS (DO).
3. **Log retention**: 7 days default, 30 days for paid tiers.
4. **Versioning**: pinned tags + canary opt-in updates.
5. **Trial**: $5 credit with card verification.
6. **Region**: single region at launch.
7. **Support**: tiered (self-serve + human for paid tiers).
