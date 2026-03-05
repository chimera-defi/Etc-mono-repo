# Aztec Node Infrastructure

Server provisioning scripts for running Aztec network nodes. This mirrors the
Monad infra pattern (`staking/monad/infra/`) and is designed to plug into the
future InfraKit shared primitives layer.

**Status:** Works for local setup and testnet node startup. Sequencer staking requires TGE + 200k AZTEC.

## Scripts

| Script | Purpose | Runs As |
|--------|---------|---------|
| `setup_aztec_node.sh` | Core setup: user, CLI, sysctl, systemd services, firewall | root |
| `bootstrap_aztec.sh` | Full bootstrap: wraps setup + monitoring + hardening + L1 check | root |
| `check_aztec_node.sh` | Health check: node version + L2 tips | any |
| `cleanup_local_aztec.sh` | Cleanup local Aztec runtime data + test containers/images | any |

## Local Cleanup

```bash
# Preview what would be cleaned
./scripts/cleanup_local_aztec.sh --dry-run

# Clean Aztec-local artifacts (data, aztec containers/images)
./scripts/cleanup_local_aztec.sh --yes

# Also include broader blockchain test containers/images
./scripts/cleanup_local_aztec.sh --yes --include-blockchain
```

## Quick Start (testnet)

```bash
# Required testnet endpoints (Sepolia execution + consensus)
export AZTEC_NETWORK="testnet"
export ETHEREUM_HOSTS="https://ethereum-sepolia-rpc.publicnode.com"
export L1_CONSENSUS_HOST_URLS="https://ethereum-sepolia-beacon-api.publicnode.com"
export P2P_IP="127.0.0.1"

# Node only
sudo ./scripts/setup_aztec_node.sh --with-firewall

# Node + sequencer
sudo ./scripts/setup_aztec_node.sh --with-sequencer --with-firewall --with-caddy

# Full bootstrap with hardening + monitoring
sudo ./scripts/bootstrap_aztec.sh --with-sequencer --with-firewall --with-hardening --with-monitoring
```

## Quick Start (mainnet)

```bash
export AZTEC_NETWORK="mainnet"
# Optional override; defaults to 2.1.11 for mainnet if omitted
export AZTEC_IMAGE_TAG="2.1.11"
export ETHEREUM_HOSTS="https://ethereum-rpc.publicnode.com"
export L1_CONSENSUS_HOST_URLS="https://ethereum-beacon-api.publicnode.com"
export P2P_IP="127.0.0.1"
sudo ./scripts/setup_aztec_node.sh --with-firewall
```

## Verified Mainnet Sync (2026-03-04 UTC)

Validated locally with:

```bash
VERSION=2.1.11 aztec start --node --archiver --network mainnet \
  --l1-rpc-urls https://ethereum-rpc.publicnode.com \
  --l1-consensus-host-urls https://ethereum-beacon-api.publicnode.com \
  --p2p.p2pIp 127.0.0.1
```

Observed proof points:
- `Initial archiver sync to L1 block 24584575 complete` at `14:04:47Z`
- `Aztec Node version: 2.1.11` at `14:04:52Z`
- `Aztec Server listening on port 8080` at `14:04:53Z`
- `node_getNodeInfo` returned `l1ChainId: 1`, `nodeVersion: 2.1.11`
- `node_getL2Tips` returned live head data (latest block `112280` during validation)

Measured startup timing from this run:
- Archiver catch-up to initial sync complete: about `2m 06s`
- Initial sync complete to RPC serving: about `6s`
- Total to serving RPC: about `2m 12s`

## Quick Start (devnet)

```bash
export AZTEC_NETWORK="devnet"
export P2P_IP="127.0.0.1"
sudo ./scripts/setup_aztec_node.sh --with-firewall
```

`AZTEC_IMAGE_TAG` defaults:
- `testnet`: `4.0.3`
- `mainnet`: `2.1.11`
- others (including `devnet`): `latest`

## Quick Start (local sandbox)

For local development without systemd services:

```bash
# Terminal 1
AZTEC_IMAGE_TAG=3.0.0-devnet.20251212 aztec start --sandbox

# Terminal 2
./scripts/check_aztec_node.sh http://localhost:8080
aztec get-node-info --node-url http://localhost:8080 --json
```

`--sandbox` runs a full local stack (node + sequencer + prover + PXE + local anvil).

## Roles

| Role | Flag | systemd Unit | Requires |
|------|------|-------------|----------|
| Node | (always) | `aztec-node.service` | L1 RPC endpoint |
| Sequencer | `--with-sequencer` | `aztec-sequencer.service` | L1 key + 200k AZTEC stake |
| Prover | `--with-prover` | `aztec-prover.service` | CPU/RAM for ZK proofs |

## Config Files

| File | Purpose |
|------|---------|
| `/etc/aztec/node.env` | Network, Aztec image tag, L1 execution+consensus RPCs, P2P IP, data dir, ports |
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
