# Clawdbot Launchpad

**Status**: Research Phase | **Last Updated**: Feb 8, 2026

## Problem Statement

Clawdbot and Moltbot require a reliable, always-on environment. For many users, setting up a VPS, configuring Docker, managing secrets, and keeping services updated is too much friction. The result is drop-off after initial interest, inconsistent uptime, and support burden from setup issues.

## Solution Concept

Create a paid "launchpad" that provisions a secure, persistent runtime (VPS or dedicated container) with Clawdbot or Moltbot (OpenClaw ecosystem) pre-installed. Users can:

1. Pick a plan (shared container or dedicated VPS).
2. Pay a small monthly fee.
3. Deploy with one click.
4. Manage the bot via a simple dashboard (logs, restart, upgrade, backups).

## Target Users

- Non-technical or semi-technical users who want "it just works" hosting.
- Developers who prefer not to manage infrastructure.
- Teams that need reliable uptime without a DevOps team.

## Competitive Landscape (Non-Exhaustive)

| Category | Examples (verify) | Notes |
|---------|-------------------|-------|
| VPS providers | DigitalOcean, Hetzner, Linode, Vultr, Lightsail | Raw infrastructure. More flexible but higher setup friction. |
| PaaS / container hosting | Render, Railway, Fly.io, Koyeb, Northflank | Easier than VPS, but still requires deployment knowledge. |
| Bot hosting providers | Discord/Telegram bot hosts, niche "bot hosting" services | Often lower-cost, but generic and not tailored to Clawdbot/Moltbot. |
| Developer sandboxes | Replit Deployments, Hugging Face Spaces | Easy onramps, but limited control and not always persistent. |
| Open-source bot stacks | [OpenClaw](https://github.com/openclaw/openclaw), [OpenClawd](https://github.com/liam798/docker-openclawd) | DIY hosting with community installers; still self-managed. |

**Gap to exploit**: one-click, opinionated hosting designed specifically for Clawdbot/Moltbot with upgrades, backups, and support included.

### Research Snapshot (GitHub, Feb 2026)

- [openclaw/openclaw](https://github.com/openclaw/openclaw) - Likely canonical OpenClaw repo (verify stars/license).
- [cloudflare/moltworker](https://github.com/cloudflare/moltworker) - OpenClaw running on Cloudflare Workers (verify runtime fit).
- [miaoxworld/OpenClawInstaller](https://github.com/miaoxworld/OpenClawInstaller) - One-click OpenClaw installer (unlicensed signal in notes; avoid bundling).
- [liam798/docker-openclawd](https://github.com/liam798/docker-openclawd) - Docker deployment for OpenClawd/Clawdbot.
- [VoltAgent/awesome-openclaw-skills](https://github.com/VoltAgent/awesome-openclaw-skills) - Ecosystem list.
- [m1heng/clawdbot-feishu](https://github.com/m1heng/clawdbot-feishu) - Integration example.

**What this suggests**:
- There is a large, active OpenClaw ecosystem with multiple deployment options.
- DIY installers exist, but they still require self-hosting and ongoing maintenance.
- A managed, supported hosting layer can differentiate on reliability, updates, and safety.

## Validity & Demand Signals

**Why this could work**:
- Hosting friction is the main barrier for non-technical users.
- Clawdbot/Moltbot have clearer "hosted SaaS" value than most open-source bots.
- The hosting market is large; a niche, tailored solution can win on UX.

**Validation plan**:
1. Landing page with pricing + waitlist.
2. Survey existing Clawdbot users about hosting pain and willingness to pay.
3. Offer a concierge "done-for-you" hosting pilot to 10-20 users.
4. Measure conversion from free self-hosting docs to paid managed hosting.

## Revenue Potential (Assumptions)

**Pricing idea (example)**:
- Starter (shared container): $9/mo
- Pro (small VPS): $25/mo
- Team (dedicated VPS + backups): $59/mo

**Economics model (illustrative)**:
- Shared container COGS: $2-3/user/mo
- Small VPS COGS: $7-10/user/mo
- Team VPS COGS: $18-25/user/mo

**Example MRR scenarios**:
- 100 Starter users * $9 = $900 MRR
- 40 Pro users * $25 = $1,000 MRR
- 10 Team users * $59 = $590 MRR
- **Total example**: ~$2.5k MRR with modest adoption

Upsell paths: paid support, custom domains, scheduled backups, higher uptime SLA.

## Technical Architecture (High-Level)

### Core Components

1. **Web App + Dashboard**
   - Marketing site, signup, billing, bot controls
2. **Control Plane API**
   - User accounts, plans, deployments, lifecycle actions
3. **Provisioning Service**
   - Creates VPS or container, attaches storage, injects secrets
4. **Runtime Layer**
   - Container orchestration (Kubernetes/ECS/Nomad) or VPS fleet
5. **Image Registry**
   - Signed Clawdbot/Moltbot images with versioning
6. **Secrets Manager**
   - API keys, model tokens, user configs
7. **Observability**
   - Logs, metrics, alerting, audit trails

### Data Flow (Simplified)

1. User pays -> billing webhook confirms
2. Control plane creates deployment record
3. Provisioner creates runtime + volume
4. Bot image pulled, secrets injected
5. Bot starts, health checks pass
6. Dashboard shows status, logs, uptime

### Deployment Modes

- **Shared Container**: multi-tenant cluster with strict isolation and quotas.
- **Dedicated VPS**: per-user VM with Docker + systemd, longer setup but stronger isolation.

### Architecture as a Managed Hosting Platform (Senior-Level View)

**Control Plane (multi-tenant SaaS)**
- Auth, billing, plan entitlements, provisioning queues, and audit logs.
- Stripe (or equivalent) webhooks drive provisioning and lifecycle.
- Admin console for support actions (restart, upgrade, restore, suspend).

**Data Plane (runtime)**
- **Shared container tier**: multi-tenant cluster with namespaces, quotas, and network policies.
- **Dedicated tier**: per-user VM with Docker and systemd-managed services.
- Persistent volumes per tenant (bot memory, logs, config).

**Provisioning pipeline**
- Idempotent job system (queue + workers).
- Steps: allocate runtime -> attach storage -> inject secrets -> pull signed image -> health checks -> mark ready.
- Rollback and cleanup on failure to avoid orphaned infra.

**Networking**
- Ingress via HTTPS with per-tenant routing (subdomain or path).
- Egress control (allowlists or per-tenant egress policies).
- Optional static IPs or outbound proxies for enterprise tiers.

**Security**
- Signed images + SBOM and vulnerability scanning.
- Rootless containers, seccomp/AppArmor profiles, dropped capabilities.
- Secrets in a managed KMS/Secrets Manager; short-lived tokens for runtime access.
- Audit trails for user actions and admin access.

**Observability**
- Centralized logs with per-tenant scoping.
- Metrics: uptime, restart count, CPU/memory usage, queue latency.
- Alerting for failed deployments, crash loops, or cost anomalies.

### Docker vs VPS vs Serverless (Tradeoffs)

| Option | Pros | Cons | Best Use |
|--------|------|------|---------|
| Shared containers (K8s/ECS/Nomad) | Low cost per tenant, fast provisioning, strong automation | Harder isolation, noisy neighbor risk | MVP + hobby tiers |
| Dedicated VPS per user | Strong isolation, predictable performance | Higher cost, slower provisioning | Pro/Team tiers, compliance-focused users |
| Serverless/edge (Workers) | Very fast, minimal ops | Runtime limits, storage constraints | Lightweight bots or stateless gateways |

**Recommendation**: start with shared containers for MVP, then add dedicated VPS for higher tiers and enterprise needs.

## Security, Safety, and Scalability

**Isolation & containment**
- Per-tenant namespaces, network policies, and resource quotas
- Rootless containers, seccomp/AppArmor profiles
- No direct shell access unless explicitly granted

**Secrets & data**
- Encrypted secrets at rest and in transit
- Rotate keys and invalidate on cancellation
- Backups with retention policies (opt-in)

**Abuse prevention**
- Rate limits, egress filters, and outbound allowlists
- Automated malware scanning on images
- Account verification for higher tiers

**Reliability**
- Health checks + auto-restart
- Rolling upgrades with version pinning
- Automated failover and restore (for VPS tier)

**Scalability**
- Queue-based provisioning with idempotent tasks
- Horizontal scaling of control plane + workers
- Autoscaling for shared container nodes

## MVP Specification (6-8 Weeks)

**Phase 1 (Core Hosting)**
1. Landing page + billing (Stripe)
2. One-click deploy for Clawdbot (single version)
3. Shared container hosting only
4. Basic dashboard: status, logs, restart, update
5. Manual support workflow (email/Slack)

**Phase 2 (Expansion)**
1. Add Moltbot image + version switching
2. Dedicated VPS tier
3. Backups + restore
4. Usage metrics + alerts

## Open Questions

- What % of users will pay vs. self-host?
- How much support overhead is acceptable?
- Which cloud provider offers the best cost-to-reliability ratio?
- Is "shared container" acceptable for security-sensitive users?
- Do we need region selection at launch?
- What is the definitive upstream repo and license for Clawdbot/Moltbot/OpenClaw?

## Next Steps

1. Build a landing page and waitlist
2. Run a 10-user paid pilot
3. Measure retention and support costs
4. Decide MVP scope and provider

## Current Decision Log

- See `DECISIONS.md` for what is decided vs open.
- See `ARCHITECTURE_DIAGRAMS.md` for human-friendly system diagrams.

---

## Build Readiness (What Is Left)

To one-shot build this with subagents, we still need four concrete artifacts and a short decision pass.

**Artifacts to produce**:
- [PRD](./PRD.md)
- [Technical Spec](./SPEC.md)
- [Task List](./TASKS.md)
- [Subagent Handoff Prompts](./HANDOFF_PROMPTS.md)
- [Research Notes](./RESEARCH_NOTES.md)

**Decision checklist (required before build)**:
1. Canonical upstream repo + license for OpenClaw/Clawdbot/Moltbot.
2. Hosting provider choice for MVP (cost + ops constraints).
3. MVP runtime choice (shared containers only vs VPS tiers).
4. Billing model (monthly vs usage caps, free trial or not).
5. Data retention policy for logs and user secrets.
