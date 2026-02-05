# Clawdbot Launchpad

**Status**: Research Phase | **Last Updated**: Feb 5, 2026

## Problem Statement

Clawdbot and Moltbot require a reliable, always-on environment. For many users, setting up a VPS, configuring Docker, managing secrets, and keeping services updated is too much friction. The result is drop-off after initial interest, inconsistent uptime, and support burden from setup issues.

## Solution Concept

Create a paid "launchpad" that provisions a secure, persistent runtime (VPS or dedicated container) with Clawdbot or Moltbot pre-installed. Users can:

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
| Open-source bot stacks | [OpenClawd](https://github.com/liam798/docker-openclawd) | DIY hosting with community installers; still self-managed. |

**Gap to exploit**: one-click, opinionated hosting designed specifically for Clawdbot/Moltbot with upgrades, backups, and support included.

### Research Snapshot (GitHub, Feb 2026)

- [liam798/docker-openclawd](https://github.com/liam798/docker-openclawd) - One-click Docker deployment for OpenClawd/Clawdbot.
- [cloudflare/moltworker](https://github.com/cloudflare/moltworker) - OpenClaw (formerly Moltbot/Clawdbot) running on Cloudflare Workers.
- [miaoxworld/OpenClawInstaller](https://github.com/miaoxworld/OpenClawInstaller) - One-click OpenClaw installer.

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

## Next Steps

1. Build a landing page and waitlist
2. Run a 10-user paid pilot
3. Measure retention and support costs
4. Decide MVP scope and provider
