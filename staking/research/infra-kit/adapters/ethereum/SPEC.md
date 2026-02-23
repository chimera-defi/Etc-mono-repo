# Ethereum Adapter Specification

**Based on:** eth2-quickstart analysis + infra-kit COMMAND_CONTRACT

---

## Overview

This adapter provides full Ethereum staking node setup via `bootstrap.sh` with support for:
- Multiple execution clients (Geth, Nethermind, Erigon, Reth)
- Multiple consensus clients (Lighthouse, Prysm, Teku, Lodestar, Nimbus)
- Optional MEV-Boost or Commit-Boost
- Mainnet and Sepolia networks

---

## Command Interface

All 7 required commands per COMMAND_CONTRACT:

| Command | Status | Description |
|---------|--------|-------------|
| bootstrap | ✅ Implemented | Phase 1 + Phase 2 |
| preflight | ✅ Implemented | Environment validation |
| smoke | ✅ Implemented | Health check |
| status | ✅ Implemented | Service status |
| start | ✅ Implemented | Start services |
| stop | ✅ Implemented | Stop services |
| logs | ✅ Implemented | View logs |

---

## Usage

```bash
# Full bootstrap with defaults (geth + lighthouse)
./bootstrap.sh

# Custom clients
./bootstrap.sh --execution reth --consensus lighthouse --mev mev-boost

# With custom network
./bootstrap.sh --network sepolia --execution nethermind --consensus prysm
```

---

## Environment Variables

### From exports.sh (defaults)

| Variable | Default | Description |
|----------|---------|-------------|
| `STACK_NAME` | ethereum | Stack identifier |
| `NETWORK` | mainnet | Network |
| `EL_CLIENT` | geth | Execution client |
| `CL_CLIENT` | lighthouse | Consensus client |
| `MEV_BOOST` | mev-boost | MEV solution |
| `LOGIN_UNAME` | eth | System user |
| `FEE_RECIPIENT` | 0xa1fea... | Fee recipient |
| `MAX_PEERS` | 100 | P2P peer limit |

### Client-Specific Ports

| Client | HTTP RPC | WS | Engine | P2P |
|--------|----------|-----|--------|-----|
| Geth | 8545 | 8546 | 8551 | 30303 |
| Nethermind | 8545 | 8546 | 8551 | 30303 |
| Erigon | 8545 | 8546 | 8551 | 30303 |
| Reth | 8545 | - | 8551 | 30303 |
| Lighthouse | 5052 | - | - | 9000 |
| Prysm | 4000 | - | - | 13000 |
| Teku | 5051 | - | - | 9000 |

---

## Phase Details

### Phase 1: System Setup (root)

1. Create user `eth-ethereum`
2. Configure firewall (ports 30303, 8545, 8551, 9000, 5052, 6060, 18550)
3. Generate JWT secret at `/var/lib/ethereum/secrets/jwt.hex`
4. Create data directories
5. Set ownership

### Phase 2: Client Installation (non-root)

1. Download and install execution client
2. Download and install consensus client
3. Optionally install MEV-Boost/Commit-Boost
4. Create systemd service units
5. Enable services (not started - user must start)

---

## Idempotency

- User creation: skipped if exists
- Firewall rules: added with comments, safe to re-run
- JWT secret: skipped if exists
- Service files: overwritten on each run

---

## Exit Codes

| Code | Meaning |
|------|----------|
| 0 | Success |
| 1 | Error (missing dependency, invalid client) |
| 2 | Invalid arguments |

---

## Files

```
adapters/ethereum/
├── bootstrap.sh      # Main bootstrap (this spec)
├── preflight.sh      # Pre-flight checks
├── smoke.sh          # Health verification
├── status.sh         # Service status
├── start.sh          # Start services
├── stop.sh           # Stop services
├── logs.sh           # View logs
├── exports.sh        # Environment defaults
└── README.md         # This file
```
