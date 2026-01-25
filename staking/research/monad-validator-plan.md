# Monad Validator Architecture & Work Plan

Brutal truth: this is doable in ~2–3.5 months at 15–25 hrs/week, but uptime discipline and fast incident response are non‑negotiable.

## 1. Architecture (MVP -> VDP -> Small Cluster)

### 1.1 MVP (Single Validator)

1) **Host roles**
   - `validator-1`: validator + local RPC + logs.
2) **Core services**
   - Validator daemon (systemd managed).
   - Basic health checks (local + external).
3) **Minimal paths**
   - Config: `~/.monad/` or `/etc/monad/` (choose one, stay consistent).
   - Logs: `/var/log/monad/`.

### 1.2 Add a Second Node (Geo Diversity)

1) **When**
   - After 2–4 weeks of stable single‑node uptime.
2) **Where**
   - Different provider + region (e.g., us‑east + eu‑west).
3) **How**
   - Add `validator-2` in a new region.
   - Keep a single public endpoint with low‑TTL DNS (60–120s) or a small proxy.
   - Never copy validator keys between hosts.

### 1.3 Monitoring Stack (Later)

1) **Current**
   - systemd + journalctl + external uptime monitor.
2) **Later plug‑in points**
   - Prometheus scrape targets on each validator.
   - Grafana dashboards under `~/infra/monitoring/`.
   - Loki + Promtail on each host.
3) **Where to wire**
   - Systemd overrides: `/etc/systemd/system/monad-validator.service.d/override.conf`.
   - Monitoring configs: `~/infra/monitoring/`.

### 1.4 Notification Channels (Later)

1) **Channels**
   - Telegram bot, Discord webhook, email.
2) **Where to wire**
   - Alertmanager routes in `~/infra/alerting/`.
   - Optional lightweight relay service if needed.

### 1.5 Public Stats Endpoint (Later)

1) **Goal**
   - Provide uptime + sync status to delegators.
2) **Minimal endpoint**
   - `/status` -> `{"uptime":"99.9","block_height":123456,"last_seen":"..."}`
3) **Where to host**
   - Small read‑only service in `~/infra/status-api/`.

### 1.6 Evolve to Small Cluster (No Rework)

1) **Phase 1**
   - Single validator + health checks.
2) **Phase 2**
   - Second validator + geo diversity + failover runbook.
3) **Phase 3**
   - 3–4 nodes (validator, RPC, monitoring, indexer).
4) **Rule**
   - Duplicate configs and adjust; do not redesign from scratch.

---

## 2. Work Plan (Step‑by‑Step)

### 2.1 Week 1–2: MVP Validator + Uptime Proof

1) **Install validator** (one host).
2) **Systemd unit** (skeleton only):
   - `/etc/systemd/system/monad-validator.service`.
3) **Health check**
   - `curl -s <rpc-url> | head -c 200`.
4) **Uptime proof**
   - Create a public uptime monitor (StatusCake/UptimeRobot).
5) **Runbook v1**
   - Restart + rollback steps.

### 2.2 Week 3–6: VDP Readiness

1) **Incident response**
   - 15–30 min response SLA.
2) **Log discipline**
   - Log rotation + disk alerts.
3) **Public reliability signal**
   - Simple status page or uptime link.
4) **Documentation**
   - Weekly outage summary + fix notes.

### 2.3 Week 7–10: Geo Diversity + Monitoring Hooks

1) **Second validator**
   - Different region/provider.
2) **Failover**
   - DNS TTL or proxy with documented switch steps.
3) **Monitoring hooks**
   - Add Prometheus endpoints (no full stack yet).

### 2.4 Week 11–14: Expand Observability + Alerting

1) **Prometheus + Grafana**
   - Basic dashboard: uptime, lag, disk, memory.
2) **Loki + Promtail**
   - Central log search.
3) **Alert channels**
   - Telegram + Discord + email routing.

---

## 3. Top Gotchas & Survival Checklist

### 3.1 Failure Modes (5–7 Most Common)

- **Disk pressure**: logs/snapshots fill volume -> node stalls.
- **Memory starvation**: OOM kills validator.
- **Clock drift**: time skew -> missed blocks.
- **Network instability**: transient drops -> missed attestations.
- **Bad updates**: upgrade without rollback.
- **Key mishandling**: wrong permissions or accidental overwrite.
- **Silent lag**: node up but not syncing or signing.

### 3.2 Proving Uptime to Delegators

1) Public uptime page or monitor link.
2) Daily uptime % posted consistently.
3) Short outage changelog with fixes.

### 3.3 Fastest Ways to Lose VDP Standing

- **Repeated downtime** (pattern matters more than single events).
- **Slow response** (hours without remediation).
- **Missing SLA windows** (if defined by VDP).
- **Sloppy config changes** that break consensus.
- **MEV abuse or policy violations** (if VDP forbids it).

### 3.4 Minimal Routine

- **Daily:** “Check sync, check disk, check alerts, fix fast.”
- **Weekly:** “Review logs, update runbook, test restart + rollback.”

---

Treat Testnet uptime as the #1 priority before anything else.
