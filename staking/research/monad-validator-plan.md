# Monad Validator Plan (Testnet -> VDP -> Small Cluster)

Brutal truth: this is doable in ~2-3.5 months at 15-25 hrs/week, but only if uptime discipline is ruthless and response time is fast. Plan for on-call reality.

## 1. Continuation Checklist (What We Need Next)

1) **Define uptime target** (e.g., 99.5%+ testnet, 99.9%+ VDP).
2) **Pick the smallest viable stack** (1 validator + logs + health checks).
3) **Create a single runbook** (restart, rollback, log triage).
4) **Start public uptime tracking now** (UptimeRobot/StatusCake).
5) **Set alert ownership** (primary + backup responder).

## 2. Where to Add Growth Without Rework

### 2.1 Second Node / Geo Diversity

1) **When:** After 2-4 weeks of stable single-node uptime.
2) **Where:** Different provider + region (e.g., us-east + eu-west).
3) **How (minimal):**
   - Run a second validator; keep a single public endpoint for delegators.
   - Keep validator keys isolated per host; never sync or copy keys between regions.
4) **Failover hint:** DNS with low TTL (60-120s) or a simple proxy.

### 2.2 Observability Stack (Prometheus/Grafana/Loki)

- **Now:** systemd + journalctl + basic health check.
- **Later:**
  1. Prometheus scrape -> Grafana dashboards.
  2. Loki + Promtail on each host.
  3. Alertmanager routes to Telegram/Discord/email.
- **Where to plug:**
  - `~/infra/monitoring/` for configs and dashboards.
  - `/etc/systemd/system/monad-validator.service.d/override.conf` for metrics flags.

### 2.3 Notification Channels (Telegram/Discord/Email)

- **Sources:** systemd health checks, Prometheus alerts, log error patterns.
- **Channels:** Telegram bot, Discord webhook, email for audit.
- **Where to wire:** `~/infra/alerting/` or Alertmanager routes.

### 2.4 Public Stats Endpoint (JSON)

- **Goal:** uptime + sync status for delegators.
- **Minimal endpoint:**
  - `/status` -> `{"uptime": "99.9", "block_height": 123456, "last_seen": "..."}`
- **Where to host:** small read-only service on the same host or a separate VM.

### 2.5 From One Server to a Small Cluster

1) **Phase 1:** single validator + health checks.
2) **Phase 2:** 2 validators + geo diversity + documented failover.
3) **Phase 3:** 3-4 nodes (validator, RPC, monitoring, indexer).
4) **Rule:** never throw away configs; duplicate and adjust.

## 3. What to Build Out (Practical Next Work)

1) **Health checks**
   - Basic `curl` RPC check (e.g., `curl -s <rpc> | head -c 200`).
   - Alert if no response or block height stalls.
2) **Logs and disk guardrails**
   - Log rotation and disk alert threshold (80%+).
3) **Restart discipline**
   - One documented restart path (systemd + rollback).
4) **Public proof of uptime**
   - Simple status page or uptime monitor link.
5) **Incident response**
   - 15-30 min response target; keep a “fix-first, root-cause-later” policy.

## 4. Top Gotchas & Survival Checklist

### 4.1 Failure Modes (5–7 Most Common)

- **Disk pressure:** logs/snapshots fill volume -> node stalls.
- **Memory starvation:** OOM kills validator process.
- **Clock drift:** time skew -> missed blocks.
- **Network instability:** transient drops -> missed attestations.
- **Bad updates:** upgrading without rollback plan.
- **Key mishandling:** wrong permissions or accidental overwrite.
- **Silent lag:** node up but not syncing/signing.

### 4.2 Proving Uptime to Delegators (Simple + Honest)

1) Public uptime page/monitor link.
2) Daily uptime % posted consistently.
3) Short changelog for outages and fixes.

### 4.3 Fastest Ways to Lose VDP Standing

- **Repeated downtime** (pattern matters more than single events).
- **Slow response** (hours without remediation).
- **Missing SLA windows** (if defined by VDP).
- **Sloppy config changes** that break consensus.
- **MEV abuse or policy violations** (if VDP forbids it).

### 4.4 Minimal Daily/Weekly Routine

- **Daily:** “Check sync, check disk, check alerts, fix fast.”
- **Weekly:** “Review logs, update runbook, test restart + rollback.”

---

Treat Testnet uptime as the #1 priority before anything else.
