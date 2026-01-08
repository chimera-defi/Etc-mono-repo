# Staking Keeper Bot

Monitors deposits and executes batch staking when threshold (200k AZTEC) is reached.

## Features

- Watches for deposits in LiquidStakingCore
- Checks if pending pool >= 200k AZTEC threshold
- Executes batch staking via VaultManager
- Round-robin validator selection
- Prometheus metrics
- Health check endpoint

## Configuration

Environment variables:

- `RPC_URL` - Aztec RPC endpoint (default: http://localhost:8080)
- `LIQUID_STAKING_CORE_ADDRESS` - LiquidStakingCore contract address (required)
- `VAULT_MANAGER_ADDRESS` - VaultManager contract address (required)
- `VALIDATOR_REGISTRY_ADDRESS` - ValidatorRegistry contract address (optional)
- `BATCH_THRESHOLD` - Batch threshold in wei (default: 200000000000000000000000)
- `POLL_INTERVAL_MS` - Poll interval in milliseconds (default: 30000)
- `MAX_RETRIES` - Maximum retries for failed operations (default: 3)
- `METRICS_PORT` - Metrics server port (default: 9090)
- `LOG_LEVEL` - Log level: debug, info, warn, error (default: info)

## Running

```bash
npm install
npm run build
npm start
```

## Development

```bash
npm run dev
```

## Testing

```bash
npm test
```

## Metrics

- `/metrics` - Prometheus metrics endpoint
- `/health` - Health check endpoint

## Kubernetes

See `k8s/staking-keeper.yaml` for deployment manifest.
