# InfraKit Cross-Stack Environment Contract (v0)

Purpose: define a minimum shared env shape across Ethereum (`eth2-quickstart`), Aztec, and Monad setups.

## 1) Base contract (stack-agnostic)

Required logical keys:
- `STACK_NAME` — logical stack id (`ethereum`, `aztec`, `monad`, ...)
- `STACK_USER` — OS service user
- `STACK_DATA_DIR` — primary data directory
- `STACK_RPC_URL` — primary local RPC URL used by health/status checks
- `STACK_P2P_PORT` — primary inbound P2P port
- `STACK_METRICS_PORT` — primary metrics port (or `none`)
- `STACK_SERVICE_NAME` — canonical primary systemd service name

Optional logical keys:
- `STACK_ADMIN_PORT` — admin API port
- `STACK_STATUS_PORT` — status endpoint port
- `STACK_NETWORK` — chain network id/name
- `STACK_ENV_FILE` — canonical env file path

## 2) Current mapping by stack

### Ethereum (eth2-quickstart)
- `STACK_NAME=ethereum`
- `STACK_USER=${LOGIN_UNAME}`
- `STACK_DATA_DIR` → client-specific (`GETH_DATADIR`, `NETHERMIND_*`, etc.)
- `STACK_RPC_URL=http://127.0.0.1:${NETHERMIND_HTTP_PORT:-8545}` (example)
- `STACK_P2P_PORT=${ETHREX_P2P_PORT:-30303}` (example; client-dependent)
- `STACK_METRICS_PORT=${METRICS_PORT:-6060}`
- `STACK_SERVICE_NAME=eth1` (legacy naming in current scripts)
- `EL_CLIENT` — execution layer client (`geth`, `nethermind`, `reth`, `besu`, `erigon`, `ethereumjs`)
- `CL_CLIENT` — consensus layer client (`teku`, `nimbus`, `prysm`, `lodestar`, `grandine`, `reth`)
- `MEV_BOOST_ENABLED` — whether MEV-Boost is enabled (`true`/`false`)
- `NETWORK` — Ethereum network (`mainnet`, `holesky`, `sepolia`)

### Aztec infra
- `STACK_NAME=aztec`
- `STACK_USER=aztec`
- `STACK_DATA_DIR=${AZTEC_DATA_DIR:-/var/lib/aztec}`
- `STACK_RPC_URL=http://127.0.0.1:${AZTEC_PORT:-8080}`
- `STACK_P2P_PORT=${AZTEC_P2P_PORT:-40400}`
- `STACK_METRICS_PORT=none` (not standardized in current infra scripts)
- `STACK_SERVICE_NAME=aztec-node`
- `STACK_ADMIN_PORT=${AZTEC_ADMIN_PORT:-8880}`
- `STACK_ENV_FILE=/etc/aztec/node.env`

### Monad infra
- `STACK_NAME=monad`
- `STACK_USER=monad`
- `STACK_DATA_DIR=/var/lib/monad`
- `STACK_RPC_URL=${RPC_URL:-http://127.0.0.1:8080}`
- `STACK_P2P_PORT` → not standardized in current docs/scripts
- `STACK_METRICS_PORT=9100` (common node exporter usage in monitoring stacks)
- `STACK_SERVICE_NAME=monad-validator`
- `STACK_STATUS_PORT=${STATUS_PORT:-8787}`
- `STACK_ENV_FILE=/etc/monad/status.env`

## 3) Adoption guidance

1. Adapters may keep native env names, but should expose or derive the logical keys above.
2. Preflight/smoke scripts should log the resolved logical keys at startup.
3. CI should eventually assert each adapter documents these mappings in one place.
