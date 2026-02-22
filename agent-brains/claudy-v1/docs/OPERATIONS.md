# Operations & Infrastructure

System architecture, deployment procedures, monitoring, and recovery.

## Infrastructure Inventory

### ethbig (Main Machine)
- **Role:** Development + execution
- **Specs:** 62 GiB RAM, 2.8 TiB disk, 2 CPU cores (reporting)
- **Services:** OpenClaw Gateway, Ollama, Takopi
- **Status command:** `systemctl is-active openclaw-gateway takopi ollama`
- **Monitoring:** Check via heartbeat every ~60 minutes

### eth2-claw (Edge Server)
- **Role:** Remote deployment testing
- **Specs:** 3.8 GiB RAM, 8.7 GiB disk (65% used), 2 CPU cores
- **IP:** 34.87.182.85
- **SSH User:** abhishek
- **SSH Key:** `openclaw-migration` ED25519
- **Status:** ✅ Accessible, Docker not pre-installed (must deploy)

---

## Health Checks

Automated every heartbeat:

```bash
# Core services
systemctl is-active openclaw-gateway  # Must be "active"
systemctl is-active takopi             # Must be "active"
systemctl is-active ollama             # Must be "active"

# Resources
free -h         # Alert if available RAM < 5 GiB
df -h /         # Alert if disk > 85%
uptime          # Track load average
```

**Alert thresholds:**
- Gateway down → immediate escalation
- Disk > 90% → cleanup + notification
- Load > 4.0 for 10+ min → investigate + scale

---

## Deployment Workflow

### Phase 1: Local Validation
1. Clone repo locally
2. Run lint tests (`./test/run_tests.sh --lint-only`)
3. Run unit tests (`./test/run_tests.sh --unit`)
4. Run docker-compose tests (`./test/docker-compose.yml`)

### Phase 2: Remote Deployment
1. SSH into eth2-claw
2. Clone repo (or pull if already exists)
3. Run docker tests on remote (`ssh eth2-claw "cd /tmp/eth2-quickstart && docker-compose up"`)
4. Monitor logs for failures

### Phase 3: Production Rollout
- Only after Phase 1 & 2 pass with 0 failures
- Use blue-green deployment (two parallel instances)
- Monitor for 24h before cutting traffic

---

## Backup & Recovery

### Critical Artifacts
- Validator keys: Encrypted in `domain/eth2/keys/` (never in git)
- Slashing protection DB: Backed up daily to S3
- Configuration: All in git, reproducible

### Recovery Procedures
- **Node sync loss:** `domain/eth2/recovery/resync_procedures.md`
- **Validator failure:** `domain/eth2/recovery/validator_failover.md`
- **Deployment failure:** `domain/infra/recovery/rollback_procedures.md`

---

## Observability

### Logs
- Location: `/var/log/openclaw/`, `/var/log/eth2-*`
- Format: Structured JSON (queryable)
- Retention: 30 days
- Access: `journalctl -u openclaw-gateway -j` (JSON output)

### Metrics
- Prometheus exposed on `localhost:9090`
- Grafana dashboards in `dashboards/`
- Query examples: `domain/eth2/observability/queries.md`

### Alerts
- Validators not attesting for 2+ slots → page oncall
- Node sync stuck > 1 hour → warning
- Disk > 85% → warning (auto-cleanup attempted)

---

## Scaling

### Horizontal
- Add nodes via docker-compose
- Validators balanced across nodes
- MEV boost in front of all

### Vertical
- Increase RAM (improve validator count)
- Increase CPU (parallel processing)
- Increase disk (archival history)

---

## Maintenance Windows

- **Weekly:** Doc-gardening tasks (Friday 22:00 UTC)
- **Monthly:** Security patches (first Sunday 02:00 UTC)
- **Quarterly:** Major upgrades (planned 4 weeks ahead)

---

_Last reviewed: 2026-02-15 | Next review: 2026-02-29_
