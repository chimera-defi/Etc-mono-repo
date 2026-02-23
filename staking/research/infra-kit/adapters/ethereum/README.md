# Ethereum Adapter

Adapter for Ethereum node setup in infra-kit framework.

## Commands

| Command | Description |
|---------|-------------|
| `./bootstrap.sh` | System setup + client installation |
| `./preflight.sh` | Pre-installation checks |
| `./smoke.sh` | Post-installation verification |
| `./start.sh` | Start all services |
| `./stop.sh` | Stop all services |
| `./status.sh` | Check service status |
| `./logs.sh [svc] [lines]` | View logs |

## Environment

Uses `exports.sh` for configuration. Override with:
- `ETH_NETWORK` (mainnet/sepolia)
- `EL_CLIENT` (geth/nethermind/erigon)
- `CL_CLIENT` (lighthouse/teku/prysm)

## Multi-Tenant

Set `ENV_CONTRACT` to create isolated setups:
```bash
ENV_CONTRACT=myvalidators ./bootstrap.sh
```
