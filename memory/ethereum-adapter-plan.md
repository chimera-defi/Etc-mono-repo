# Ethereum Adapter Integration Plan

**Goal:** Integrate eth2-quickstart into infra-kit framework

---

## Current State

### infra-kit Already Has
- `COMMAND_CONTRACT.md` - 7 required commands
- `ENV_CONTRACT.md` - Environment variable mappings
- `PORT_REGISTRY.md` - Port allocations

### eth2-quickstart Already Has
- `run_1.sh` - System setup (root)
- `run_2.sh` - Client installation (user)
- `install.sh` - Combined installer
- `doctor.sh` - Health checks
- `start.sh` - Start services
- `stop.sh` - Stop services
- `view_logs.sh` - View logs
- `exports.sh` - 50+ environment variables

---

## Gap Analysis

| infra-kit Command | eth2-quickstart | Adapter Needed |
|-----------------|----------------|----------------|
| bootstrap | run_1.sh + run_2.sh | wrapper.sh |
| preflight | doctor.sh | wrapper.sh |
| smoke | doctor.sh (partial) | wrapper.sh |
| status | systemctl | status.sh |
| start | install/utils/start.sh | wrapper.sh |
| stop | install/utils/stop.sh | wrapper.sh |
| logs | install/utils/view_logs.sh | wrapper.sh |

---

## Adapter Structure

```
staking/research/infra-kit/
├── adapters/
│   └── ethereum/
│       ├── PLAN.md              # This document
│       ├── ETH2_QUICKSTART      # Path to eth2-quickstart
│       ├── bootstrap.sh         # Wraps run_1.sh + run_2.sh
│       ├── preflight.sh         # Wraps doctor.sh
│       ├── smoke.sh             # Wraps doctor.sh --quick
│       ├── status.sh            # systemctl status
│       ├── start.sh             # Wraps start.sh
│       ├── stop.sh              # Wraps stop.sh
│       └── logs.sh              # Wraps view_logs.sh
```

---

## Implementation Details

### bootstrap.sh
```bash
#!/bin/bash
# Delegates to eth2-quickstart

ETH2_PATH="$(cat ETH2_QUICKSTART)"

if [[ $EUID -eq 0 ]]; then
    "$ETH2_PATH/run_1.sh"
else
    "$ETH2_PATH/run_2.sh" "$@"
fi
```

### preflight.sh
```bash
#!/bin/bash
# Run doctor.sh for health checks

ETH2_PATH="$(cat ETH2_QUICKSTART)"
"$ETH2_PATH/install/utils/doctor.sh" "$@"
```

### smoke.sh
```bash
#!/bin/bash
# Quick health check

# Check EL RPC
curl -s -X POST localhost:8545 -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","method":"eth_blockNumber","id":1}' | jq -e '.result' >/dev/null

# Check CL sync
curl -s localhost:5052/eth/v1/node/syncing | jq -e '.data' >/dev/null
```

### status.sh
```bash
#!/bin/bash
systemctl status eth1 beacon-chain --no-pager
```

---

## Environment Mapping

eth2-quickstart exports.sh → infra-kit ENV_CONTRACT:

| eth2-quickstart | infra-kit |
|----------------|-----------|
| LOGIN_UNAME | STACK_USER |
| NETWORK | STACK_NETWORK |
| 8545 (RPC) | STACK_RPC_URL |
| 30303 | STACK_P2P_PORT |
| 6060 | STACK_METRICS_PORT |

---

## Port Registry

Already defined in PORT_REGISTRY.md (引用):

| Port | Service |
|------|---------|
| 8545 | EL RPC |
| 8551 | EL Engine |
| 30303 | EL P2P |
| 5052 | CL RPC |
| 9000 | CL P2P |
| 18550 | MEV-Boost |

---

## Files to Create

| File | Lines | Purpose |
|------|-------|---------|
| adapters/ethereum/PLAN.md | 100 | This plan |
| adapters/ethereum/ETH2_QUICKSTART | 1 | Path reference |
| adapters/ethereum/bootstrap.sh | 15 | Delegate to run_1/2.sh |
| adapters/ethereum/preflight.sh | 10 | Delegate to doctor.sh |
| adapters/ethereum/smoke.sh | 15 | RPC health check |
| adapters/ethereum/status.sh | 5 | systemctl status |
| adapters/ethereum/start.sh | 10 | Delegate to start.sh |
| adapters/ethereum/stop.sh | 10 | Delegate to stop.sh |
| adapters/ethereum/logs.sh | 15 | Delegate to view_logs.sh |

**Total: ~180 lines** (mostly delegation)

---

## Design Principles

1. **Delegate don't duplicate** - Call eth2-quickstart scripts
2. **Thin wrappers** - Minimal logic, just path resolution and argument passing
3. **Idempotent** - Safe to re-run
4. **Documented** - Each wrapper has --help
5. **Consistent** - Follows COMMAND_CONTRACT.md exactly

---

## Next Steps

1. Create adapters/ethereum/ directory
2. Create ETH2_QUICKSTART file with path
3. Create each wrapper script
4. Test each command
5. Add to infra-kit README

---

## Reference

- eth2-quickstart: `/root/.openclaw/workspace/dev/eth2-quickstart/`
- infra-kit: `/root/.openclaw/workspace/staking/research/infra-kit/`
- COMMAND_CONTRACT.md
- ENV_CONTRACT.md
- PORT_REGISTRY.md
