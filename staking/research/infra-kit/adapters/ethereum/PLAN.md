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

## Implementation

### wrapper.sh pattern (delegates to eth2-quickstart):
```bash
#!/bin/bash
ETH2="$(cat ETH2_QUICKSTART)"
"$ETH2/$SCRIPT" "$@"
```

### Inline for simple commands:
```bash
#!/bin/bash
systemctl status eth1 beacon-chain
```

---

## Environment Mapping

| eth2-quickstart | infra-kit |
|----------------|-----------|
| LOGIN_UNAME | STACK_USER |
| NETWORK | STACK_NETWORK |
| 8545 | STACK_RPC_URL |
| 30303 | STACK_P2P_PORT |

---

## Port Registry

| Port | Service |
|------|---------|
| 8545 | EL RPC |
| 8551 | EL Engine |
| 30303 | EL P2P |
| 5052 | CL RPC |
| 9000 | CL P2P |
| 18550 | MEV-Boost |

---

## Files

| File | Lines | Notes |
|------|-------|-------|
| PLAN.md | 80 | This |
| ETH2_QUICKSTART | 1 | Path |
| bootstrap.sh | 15 | Delegate |
| preflight.sh | 10 | Delegate |
| smoke.sh | 15 | Inline |
| status.sh | 5 | Inline |
| start.sh | 10 | Delegate |
| stop.sh | 10 | Delegate |
| logs.sh | 15 | Delegate |

---

## Reference

- eth2-quickstart: dev/eth2-quickstart/
- infra-kit: staking/research/infra-kit/
