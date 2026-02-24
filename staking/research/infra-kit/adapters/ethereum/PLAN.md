# Ethereum Adapter Integration Plan

## Goal
Integrate eth2-quickstart into infra-kit framework properly.

## Current State

### infra-kit Requirements (COMMAND_CONTRACT.md)
Each adapter must implement:
- bootstrap - Full initial setup
- preflight - Validate environment
- smoke - Quick health check
- status - Service status
- start - Start services
- stop - Stop services
- logs - View logs

### eth2-quickstart Structure
```
dev/eth2-quickstart/
├── run_1.sh          # Phase 1: System setup (root)
├── run_2.sh          # Phase 2: Client installation (user)
├── install.sh        # Combined installer
├── exports.sh        # 50+ environment variables
├── lib/              # Common functions
└── install/utils/
    ├── doctor.sh          # Health checks
    ├── start.sh           # Start services
    ├── stop.sh            # Stop services
    └── view_logs.sh       # View logs
```

## Implementation

### File Structure
```
staking/research/infra-kit/
├── adapters/
│   └── ethereum/
│       ├── PLAN.md            # This document
│       ├── ETH2_QUICKSTART    # Path: ../../../../dev/eth2-quickstart
│       ├── bootstrap.sh        # Wrapper: run_1.sh + run_2.sh
│       ├── preflight.sh       # Wrapper: doctor.sh
│       ├── smoke.sh          # Inline: RPC health check
│       ├── status.sh         # Inline: systemctl
│       ├── start.sh          # Wrapper: start.sh
│       ├── stop.sh           # Wrapper: stop.sh
│       └── logs.sh           # Wrapper: view_logs.sh
└── dev/
    └── eth2-quickstart/     # Working code (copied, not forked)
```

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

## Wrapper Pattern

```bash
#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ETH2_PATH="$(cat "$SCRIPT_DIR/ETH2_QUICKSTART")"
exec "$ETH2_PATH/$SCRIPT" "$@"
```

## Environment Mapping

eth2-quickstart → infra-kit ENV_CONTRACT:

| eth2-quickstart | infra-kit |
|----------------|-----------|
| LOGIN_UNAME | STACK_USER |
| NETWORK | STACK_NETWORK |
| 8545 | STACK_RPC_URL |
| 30303 | STACK_P2P_PORT |

## Port Registry

| Port | Service |
|------|---------|
| 8545 | EL RPC |
| 8551 | EL Engine |
| 30303 | EL P2P |
| 5052 | CL RPC |
| 9000 | CL P2P |
| 18550 | MEV-Boost |

## Status

- [x] PLAN.md created
- [x] eth2-quickstart copied to dev/
- [x] Adapter wrappers created
- [ ] Test each command
- [ ] Verify imports work

## Design Principles

1. **Delegate don't duplicate** - Call eth2-quickstart scripts
2. **Thin wrappers** - Minimal logic, just path resolution
3. **Idempotent** - Safe to re-run
4. **Documented** - Each wrapper has --help
5. **Consistent** - Follows COMMAND_CONTRACT.md
