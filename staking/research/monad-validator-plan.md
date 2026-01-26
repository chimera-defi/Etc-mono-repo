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
   - Key policy: software keys only (no HSM).

### 1.2 Add a Second Node (Geo Diversity)

1) **When**
   - After 2–4 weeks of stable single‑node uptime.
2) **Where**
   - Different provider + region (e.g., us‑east + eu‑west).
3) **How**
   - Add `validator-2` in a new region.
   - Keep a single public endpoint with low‑TTL DNS (60–120s) or a small proxy.
   - Never copy validator keys between hosts.
   - Keep keys on local disk with strict file permissions (no HSM).

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

### 1.6 Key Management (No HSM)

1) **Policy**
   - Software keys only; no HSM requirement.
2) **Storage**
   - Local disk with minimal permissions; backup encrypted offline only.
3) **Rotation**
   - Document exact rotation steps in the runbook (do not improvise during incidents).

### 1.7 Evolve to Small Cluster (No Rework)

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
   - Optional: `curl -s <rpc-url> | jq -r .result` if JSON‑RPC.
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

### 2.3 Pre‑Testnet Validation (Local + Dry Runs)

1) **Local smoke checks**
   - Process starts cleanly and stays up for 60+ minutes.
   - RPC responds: `curl -s <rpc-url> | head -c 200`.
   - Disk + memory headroom verified (no swap thrash).
2) **Local E2E checks**
   - Sync to a known block height.
   - Validator signs/produces expected events (per docs).
3) **Failure simulation**
   - Restart service twice; confirm recovery time.
   - Force log rotation; confirm no data loss.

### 2.4 Week 7–10: Geo Diversity + Monitoring Hooks

1) **Second validator**
   - Different region/provider.
2) **Failover**
   - DNS TTL or proxy with documented switch steps.
3) **Monitoring hooks**
   - Add Prometheus endpoints (no full stack yet).

### 2.5 Week 11–14: Expand Observability + Alerting

1) **Prometheus + Grafana**
   - Basic dashboard: uptime, lag, disk, memory.
2) **Loki + Promtail**
   - Central log search.
3) **Alert channels**
   - Telegram + Discord + email routing.

## 2.6 Testnet Deploy Requirements (Technical)

1) **Prereqs**
   - Stable node binary/version pinned.
   - Config baseline committed in `~/infra/config/monad/`.
   - Keys generated and stored locally (no HSM).
2) **Host readiness**
   - Time sync enabled (chrony/ntpd).
   - Disk alerts at 80%+.
   - Log rotation enabled.
3) **Testnet bootstrap**
   - Genesis/config pulled from official source.
   - Network connectivity validated (peers reachable).
4) **Post‑deploy verification**
   - Node synced within expected window.
   - RPC responds consistently under light polling.
   - Uptime monitor live and reporting.

## 2.7 Validator Exit Process (TBD by Monad Spec)

1) **Exit trigger**
   - Operator‑initiated exit request (per Monad docs).
2) **Exit phases**
   - Exit requested → cooldown/unbonding → withdrawal unlock.
3) **Operational requirement**
   - Keep the node online until exit finalizes (avoid penalties).
4) **Action items**
   - Record exact exit command + expected time window once docs are confirmed.
   - Define “safe to stop” criteria in the runbook.

## 2.8 Automation (Scripts + Watchers)

### 2.8.1 Scripts (Plan Only)

1) **Deploy helper** (no code yet)
   - Inputs: config path, keys path, chain ID.
2) **Exit helper** (no code yet)
   - Inputs: validator ID, exit reason, confirmation checklist.
3) **Rule**
   - Keep scripts minimal; do not automate irreversible actions without manual confirmation.

### 2.8.2 Chain State Watchers

1) **What to watch**
   - Sync lag, missed slots, validator status, slashing events (if exposed).
2) **Triggers**
   - Alert on lag > threshold or status changes (active → jailed/penalized).
3) **Where to wire**
   - Local watcher service in `~/infra/watchers/` → Alertmanager routes.

## 3. Spec Additions (Keep This Tight)

### 3.1 VDP Rules (TBD, Must Confirm)

1) **Uptime threshold**: `TBD%` (insert official requirement).
2) **Response SLA**: `TBD minutes` to acknowledge/mitigate incidents.
3) **MEV policy**: `TBD` (document allowed/forbidden behaviors).
4) **Proof format**: `TBD` (what the VDP program accepts as evidence).

### 3.2 Evidence Artifacts (Delegator Trust)

1) **Public uptime link** (UptimeRobot/StatusCake).
2) **Weekly reliability note** (short markdown, 5–10 lines).
3) **Changelog of incidents** (date + duration + fix).

### 3.3 Config Layout (No Rework Later)

1) **Single source of truth**
   - `staking/impl/monad/infra/config/` (base config + env templates).
2) **Per‑node overrides**
   - `staking/impl/monad/infra/config/nodes/validator-1/`
   - `staking/impl/monad/infra/config/nodes/validator-2/`
3) **Rule**
   - Keep base config immutable; only override node‑specific values.

### 3.4 Public Landing Page (Infra‑as‑a‑Service)

1) **Purpose**
   - Advertise validator reliability and delegation readiness.
2) **MVP content**
   - Uptime proof link, regions, response SLA, and status endpoint.
3) **Where to host**
   - `~/infra/landing/` (static site, no backend).
4) **Delegation‑ready signal**
   - “Delegation waitlist” link + public status JSON.

---

## 4. Top Gotchas & Survival Checklist

### 4.1 Failure Modes (5–7 Most Common)

- **Disk pressure**: logs/snapshots fill volume -> node stalls.
- **Memory starvation**: OOM kills validator.
- **Clock drift**: time skew -> missed blocks.
- **Network instability**: transient drops -> missed attestations.
- **Bad updates**: upgrade without rollback.
- **Key mishandling**: wrong permissions or accidental overwrite.
- **Silent lag**: node up but not syncing or signing.

### 4.2 Proving Uptime to Delegators

1) Public uptime page or monitor link.
2) Daily uptime % posted consistently.
3) Short outage changelog with fixes.

### 4.3 Fastest Ways to Lose VDP Standing

- **Repeated downtime** beyond VDP threshold (insert exact % once known).
- **Slow response** beyond SLA (insert minutes once known).
- **Missing SLA windows** for incident acknowledgement/resolution.
- **Sloppy config changes** that break consensus.
- **MEV abuse or policy violations** (as defined by VDP).

### 4.4 Minimal Routine

- **Daily:** “Check sync, check disk, check alerts, fix fast.”
- **Weekly:** “Review logs, update runbook, test restart + rollback.”

## 5. Evidence Template (Minimal)

1) **Uptime proof**
   - Link: `https://status.<domain>/` (public monitor).
2) **Weekly reliability note**
   - `docs/uptime/2025-01-07.md` (5–10 lines).
3) **Incident log**
   - `docs/incidents/2025-01-09.md` (duration + cause + fix).

---

Treat Testnet uptime as the #1 priority before anything else.
