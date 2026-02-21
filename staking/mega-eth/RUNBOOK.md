# MegaETH Operational Runbook

This runbook covers day-to-day operational procedures, monitoring, troubleshooting, and emergency response for MegaETH.

## Table of Contents

1. [Quick Reference](#quick-reference)
2. [Daily Operations](#daily-operations)
3. [Monitoring & Alerting](#monitoring--alerting)
4. [Troubleshooting](#troubleshooting)
5. [Emergency Procedures](#emergency-procedures)
6. [Maintenance Windows](#maintenance-windows)

## Quick Reference

### Critical Commands

```bash
# Check health
./scripts/smoke-test.sh

# Validate config
./scripts/validate-config.sh

# Check endpoints
./scripts/check-endpoints.sh

# View logs
tail -f logs/validator.log
tail -f logs/protocol.log
```

### Key Files

| File | Purpose | Edit Frequency |
|------|---------|-----------------|
| `.env` | Configuration | Weekly |
| `logs/validator.log` | Validator events | Read daily |
| `logs/protocol.log` | Smart contract events | Read daily |
| `config/monitoring.env` | Alert thresholds | Monthly |

### Emergency Hotline

**If validator is down:**
1. Run `./scripts/smoke-test.sh`
2. Check `logs/validator.log`
3. See [Emergency Procedures](#emergency-procedures)

---

## Daily Operations

### Morning Checklist (5 min)

```bash
# 1. Verify environment is loaded
source .env
echo "RPC: $RPC_URL, Chain: $CHAIN_ID"

# 2. Check validator health
./scripts/check-endpoints.sh

# 3. Review logs for errors
grep ERROR logs/validator.log | tail -5

# 4. Verify monitoring is running
docker ps | grep -E "prometheus|grafana"
```

### Monitoring Dashboard

Access Grafana for visual health:

```bash
# Start monitoring (if not running)
docker-compose -f monitoring/docker-compose.yml up -d

# Open dashboard
# URL: http://localhost:3000
# Navigate to "MegaETH Validator Dashboard"
```

**Key Metrics:**
- `validator_is_proposing` - Should be true
- `validator_balance_eth` - Should be stable or increasing
- `validator_uptime_percent` - Should be >99%
- `network_participation_rate` - Should be >95%

### Weekly Checklist (30 min)

```bash
# 1. Review performance metrics
# - Check Grafana dashboard for past 7 days
# - Note any downtime or anomalies

# 2. Update configuration if needed
nano .env
./scripts/validate-config.sh

# 3. Verify backups
ls -la backups/
# Should have daily backups from past 7 days

# 4. Check pending updates
# See "Maintenance Windows" section
```

---

## Monitoring & Alerting

### Prometheus Setup

```bash
# Start Prometheus (collects metrics)
docker-compose -f monitoring/docker-compose.yml up -d prometheus

# Access metrics
# URL: http://localhost:9090
# Query examples:
# - validator_balance_eth
# - validator_uptime_percent
# - network_participation_rate
```

### Grafana Setup

```bash
# Start Grafana (visualizes metrics)
docker-compose -f monitoring/docker-compose.yml up -d grafana

# Initial login
# URL: http://localhost:3000
# User: admin
# Pass: admin (change on first login!)

# Add Prometheus data source
# URL: http://prometheus:9090
```

### Key Alerts

**Alert Triggers:**

| Alert | Threshold | Action |
|-------|-----------|--------|
| Validator Down | >5 min offline | Page on-call |
| Balance Declining | <32 ETH | Check SLA penalties |
| Network Participation | <95% | Review attestations |
| High CPU | >80% | Restart validator |
| Disk Full | >90% usage | Archive logs |

### Log Locations

```bash
# Validator logs
tail -f logs/validator.log

# Protocol logs (smart contract events)
tail -f logs/protocol.log

# System logs
tail -f logs/system.log

# Combined view
tail -f logs/*.log | grep -E "ERROR|WARN"
```

### Alert Configuration

Edit alert thresholds:

```bash
# Edit monitoring configuration
nano config/monitoring.env

# Key variables:
ALERT_DOWNTIME_MINUTES=5       # Alert if down >5 min
ALERT_BALANCE_THRESHOLD=32     # Alert if balance <32 ETH
ALERT_PARTICIPATION=95         # Alert if <95% participating
ALERT_EMAIL=ops@team.com       # Recipient

# Apply changes
docker-compose -f monitoring/docker-compose.yml restart
```

---

## Troubleshooting

### Validator Is Offline

**Symptoms:**
- `validator_is_proposing` = false
- Grafana shows red status
- Logs show connection errors

**Steps:**

```bash
# 1. Check environment
source .env
echo "RPC: $RPC_URL"

# 2. Test RPC connectivity
curl -X POST $RPC_URL \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Expected: {"result":"0x..."}

# 3. Check validator pubkey
echo "Validator: $VALIDATOR_PUBKEY"

# 4. Check logs
grep "ERROR\|connection\|timeout" logs/validator.log | tail -10

# 5. Restart validator
./scripts/restart-validator.sh

# 6. Verify recovery
./scripts/check-endpoints.sh
```

### Balance Declining (SLA Penalties)

**Symptoms:**
- `validator_balance_eth` decreasing
- Protocol events show slashing events
- Uptime metrics < 100%

**Steps:**

```bash
# 1. Check uptime
grep "downtime\|offline" logs/validator.log

# 2. Review SLA penalties
grep "penalty\|slashing" logs/protocol.log

# 3. Check configuration
grep "SLA_PENALTY" .env

# 4. If caused by validator downtime:
#    - Check hardware
#    - Verify network connectivity
#    - Review "Validator Is Offline" section above

# 5. If penalties are correct:
#    - This is expected; review SLA_PENALTY_BPS in .env
#    - If too aggressive, adjust: nano .env
```

### RPC Endpoint Timeout

**Symptoms:**
- Validator logs show "timeout"
- Grafana unable to fetch metrics
- `check-endpoints.sh` fails

**Steps:**

```bash
# 1. Test connectivity
ping -c 3 infura.io        # For Infura
timeout 5 curl -I $RPC_URL # For custom endpoint

# 2. Check configuration
grep RPC_URL .env

# 3. Verify no firewall blocks
# (For local development, should be unrestricted)

# 4. Switch endpoint if needed
# Edit .env:
# RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY

./scripts/check-endpoints.sh
```

### High CPU Usage

**Symptoms:**
- System load > 80%
- Validator logs show processing delays
- Dashboard shows CPU alert

**Steps:**

```bash
# 1. Identify what's consuming CPU
top -n 1 | head -15

# 2. Check if it's the validator
ps aux | grep validator

# 3. If validator is consuming >50% CPU:
#    - Reduce validator count (if running multiple)
#    - Restart validator: ./scripts/restart-validator.sh
#    - Check hardware specs (see VALIDATOR_SPEC.md)

# 4. If other process:
#    - Stop unnecessary services
#    - Increase resources if needed
```

### Disk Full

**Symptoms:**
- Logs show "no space left"
- Validator stops writing logs
- System becomes unresponsive

**Steps:**

```bash
# 1. Check disk usage
df -h

# 2. Find large files
du -sh logs/*
du -sh backups/*

# 3. Archive old logs
./scripts/archive-logs.sh

# 4. Clean old backups
./scripts/clean-backups.sh --older-than 30 days

# 5. Verify recovery
df -h
./scripts/check-endpoints.sh
```

---

## Emergency Procedures

### Validator Crashed

**Response Time:** Immediate (5 minutes)

```bash
# 1. Assess (30 seconds)
./scripts/smoke-test.sh
tail -20 logs/validator.log

# 2. Recover (2 minutes)
./scripts/restart-validator.sh

# 3. Verify (1 minute)
sleep 60
./scripts/check-endpoints.sh

# 4. Communicate (1 minute)
# - Update team Slack/Discord
# - Expected recovery time: <5 min
```

### Suspected Attack/Compromise

**Response Time:** Urgent (15 minutes)

```bash
# 1. Isolate
# - Stop validator immediately
docker-compose down  # If using Docker
# Or: pkill -f validator_process

# 2. Assess
# - Review logs for suspicious activity
grep "suspicious\|attack\|malicious" logs/*.log
# - Check recent transactions
# - Verify validator keys not exposed

# 3. Notify
# - Alert security team
# - File incident report
# - Do NOT restart without all-clear

# 4. Recovery (after investigation)
# - Rotate keys if needed
# - Update configuration
# - Restart in clean environment
```

### Network Partition (Validator Isolated)

**Response Time:** Immediate (ongoing monitoring)

```bash
# 1. Detect (automatic via monitoring)
# - Grafana alert: validator_is_proposing = false
# - Network participation drops to 0%

# 2. Assess connectivity
ping -c 5 <gateway>
curl -I $RPC_URL

# 3. If internet down:
# - Wait for network recovery (no action needed)
# - Validator will auto-sync when online
# - Expect ~15 min catchup time

# 4. If local issue:
./scripts/restart-validator.sh

# 5. Verify recovery
watch -n 5 ./scripts/check-endpoints.sh
```

### Loss of RPC Access

**Response Time:** 10 minutes

```bash
# 1. Identify issue
grep "connection\|refused\|timeout" logs/validator.log

# 2. Switch to backup RPC
# Edit .env with fallback endpoint
nano .env
# Change RPC_URL to backup

./scripts/check-endpoints.sh

# 3. If no backup available:
# - Check network.json for additional endpoints
# - Contact RPC provider
# - Consider local node (long-term)

# 4. Update team
# - Notify operations
# - Update status page
```

### Slashing Event Detected

**Response Time:** Within 24 hours

```bash
# 1. Investigate immediately
grep "slashing\|penalty" logs/protocol.log

# 2. Analyze root cause
# - Was downtime >60 min?
# - Was there a validator client bug?
# - Was there a network partition?

# 3. Prevent recurrence
# - If downtime: upgrade hardware or improve network
# - If bug: upgrade validator client version
# - Update monitoring thresholds

# 4. Document
# - File incident report
# - Update SLA_ENFORCEMENT.md if needed

# 5. Communicate
# - Inform affected stakers
# - Explain root cause
# - Detail prevention measures
```

---

## Maintenance Windows

### Weekly (Sunday 2 AM UTC)

```bash
# 1. Log rotation
./scripts/rotate-logs.sh

# 2. Backup verification
./scripts/verify-backups.sh

# 3. Health check
./scripts/smoke-test.sh
./scripts/check-endpoints.sh
```

### Monthly (First Sunday 2 AM UTC)

```bash
# 1. Configuration review
# Review and update .env if needed
nano .env
./scripts/validate-config.sh

# 2. Dependency updates
# Check for new validator client versions
# Check for security patches

# 3. Monitoring review
# - Review Grafana for trends
# - Update alert thresholds if needed
# - Review SLA compliance

# 4. Capacity planning
# - Review disk usage trends
# - Plan upgrades if >80% capacity
```

### Quarterly (Jan 1, Apr 1, Jul 1, Oct 1)

```bash
# 1. Full audit
./scripts/full-audit.sh

# 2. Security review
# - Check for exposed keys
# - Review access logs
# - Audit configuration

# 3. Performance review
# - Analyze 90-day metrics
# - Compare to baselines
# - Identify optimization opportunities

# 4. Planning
# - Update operational roadmap
# - Plan major upgrades
# - Budget for infrastructure
```

### Planned Downtime

**Procedure:**

```bash
# 1. Notify stakers (72 hours in advance)
# - Send announcement
# - Explain expected impact
# - Provide ETA

# 2. Schedule off-peak time
# - Avoid validator proposal slots
# - Avoid network-wide events

# 3. Pre-maintenance checks
./scripts/backup-everything.sh
./scripts/smoke-test.sh

# 4. Perform maintenance
# - Execute upgrade
# - Verify functionality
# - Test recovery

# 5. Post-maintenance verification
./scripts/check-endpoints.sh
./scripts/smoke-test.sh

# 6. Communicate completion
# - Send notification
# - Provide status update
```

---

## Contacts & Escalation

### On-Call Schedule

**Primary:** ops-primary@team.com (pagerduty)  
**Secondary:** ops-secondary@team.com (pagerduty)  
**Team Lead:** ops-lead@team.com  

### Escalation Policy

| Severity | Response Time | Escalate After |
|----------|---------------|-----------------|
| Critical (validator down) | 5 min | 15 min if unresolved |
| High (balance declining) | 30 min | 1 hour if unresolved |
| Medium (alerts) | 2 hours | 4 hours if unresolved |
| Low (logging) | 1 day | 3 days if unresolved |

### External Contacts

**RPC Provider:** Infura support  
**Ethereum:** ethereum.org/en/developers/  
**Validator Docs:** https://docs.prysm.io/  

---

## Glossary

- **SLA:** Service Level Agreement (uptime commitment)
- **BPS:** Basis points (0.01% each)
- **Slashing:** Penalty for misbehavior
- **Attestation:** Validator's cryptographic commitment
- **Proposal:** Validator's block creation
- **Downtime:** Validator offline >1 block

---

**Last Updated:** February 21, 2026  
**Status:** Production  
**Review Frequency:** Monthly
