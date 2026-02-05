# Clawdbot Launchpad Research Notes

**Status**: Draft | **Last Updated**: Feb 5, 2026

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
