# Aztec Node Infrastructure

Server provisioning scripts for running Aztec network nodes. This mirrors the
Monad infra pattern (`staking/monad/infra/`) and is designed to plug into the
future InfraKit shared primitives layer.

**Status:** Skeleton / devnet-ready. Sequencer staking requires TGE + 200k AZTEC.

## Scripts

| Script | Purpose | Runs As |
|--------|---------|---------|
| `setup_aztec_node.sh` | Core setup: user, CLI, sysctl, systemd services, firewall | root |
| `bootstrap_aztec.sh` | Full bootstrap: wraps setup + monitoring + hardening + L1 check | root |
| `check_aztec_node.sh` | Health check: node version + L2 tips | any |

## Quick Start (devnet)

```bash
# Set L1 RPC endpoint (required)
export ETHEREUM_HOSTS="https://your-ethereum-rpc-endpoint.com"

# Node only
sudo ./scripts/setup_aztec_node.sh --with-firewall

# Node + sequencer
sudo ./scripts/setup_aztec_node.sh --with-sequencer --with-firewall --with-caddy

# Full bootstrap with hardening + monitoring
sudo ./scripts/bootstrap_aztec.sh --with-sequencer --with-firewall --with-hardening --with-monitoring
```

## Roles

| Role | Flag | systemd Unit | Requires |
|------|------|-------------|----------|
| Node | (always) | `aztec-node.service` | L1 RPC endpoint |
| Sequencer | `--with-sequencer` | `aztec-sequencer.service` | L1 key + 200k AZTEC stake |
| Prover | `--with-prover` | `aztec-prover.service` | CPU/RAM for ZK proofs |

## Config Files

| File | Purpose |
|------|---------|
| `/etc/aztec/node.env` | Network, L1 RPC, data dir, ports |
| `/etc/aztec/sequencer.env` | L1 private key, coinbase, fee recipient |
| `/etc/aztec/prover.env` | Prover broker URL |

## Ports

| Port | Service | Firewall |
|------|---------|----------|
| 8080 | Node RPC | Local only (proxy via Caddy) |
| 8880 | Admin API | Deny external |
| 40400/tcp+udp | P2P | Allow |

## Architecture Comparison

See `staking/research/infra-kit/AZTEC_NODE_SPEC.md` for the full gap analysis
and comparison with Ethereum and Monad setup scripts.
