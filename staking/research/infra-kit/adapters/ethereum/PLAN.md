# Ethereum Adapter Integration Plan

**Goal:** Integrate eth2-quickstart into infra-kit framework

---

## Current State

### infra-kit Commands (COMMAND_CONTRACT.md)
Each adapter must implement:
- bootstrap, preflight, smoke, status, start, stop, logs

### eth2-quickstart Scripts
- run_1.sh - System setup (root)
- run_2.sh - Client installation (user)
- doctor.sh - Health checks
- start.sh - Start services
- stop.sh - Stop services
- view_logs.sh - View logs
- exports.sh - Environment variables

---

## Adapter Structure

```
adapters/ethereum/
├── PLAN.md              # This document
├── ETH2_QUICKSTART     # Path to eth2-quickstart
├── bootstrap.sh        # run_1.sh + run_2.sh
├── preflight.sh       # doctor.sh
├── smoke.sh           # Quick health check
├── status.sh          # systemctl status
├── start.sh           # start.sh
├── stop.sh            # stop.sh
└── logs.sh            # view_logs.sh
```

---

## Command Mapping

| infra-kit | eth2-quickstart | Implementation |
|----------|-----------------|----------------|
| bootstrap | run_1.sh + run_2.sh | Delegate |
| preflight | doctor.sh | Delegate |
| smoke | curl RPC | Inline |
| status | systemctl | Inline |
| start | start.sh | Delegate |
| stop | stop.sh | Delegate |
| logs | view_logs.sh | Delegate |

---

## Design Principle

**Delegate don't duplicate** - Thin wrappers only.

This approach:
1. Reuses working eth2-quickstart code
2. Minimal maintenance
3. Follows COMMAND_CONTRACT.md
4. Easy to swap implementations later

---

## Reference

- eth2-quickstart: dev/eth2-quickstart/
- infra-kit: staking/research/infra-kit/
