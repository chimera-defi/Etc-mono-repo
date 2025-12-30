# Withdrawal Keeper Bot

Monitors withdrawal queue and processes claimable withdrawals. Manages liquidity buffer and triggers unstaking if needed.

## Features

- Monitors withdrawal queue for claimable requests
- Processes withdrawals after unbonding period
- Manages liquidity buffer
- Triggers unstaking if liquidity buffer is low
- Prometheus metrics
- Health check endpoint

## Configuration

Environment variables:

- `RPC_URL` - Aztec RPC endpoint (default: http://localhost:8080)
- `WITHDRAWAL_QUEUE_ADDRESS` - WithdrawalQueue contract address (required)
- `LIQUID_STAKING_CORE_ADDRESS` - LiquidStakingCore contract address (required)
- `VAULT_MANAGER_ADDRESS` - VaultManager contract address (optional)
- `POLL_INTERVAL_MS` - Poll interval in milliseconds (default: 60000)
- `MIN_LIQUIDITY_BUFFER` - Minimum liquidity buffer in wei (default: 100000000000000000000000)
- `MAX_RETRIES` - Maximum retries for failed operations (default: 3)
- `METRICS_PORT` - Metrics server port (default: 9092)
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

See `k8s/withdrawal-keeper.yaml` for deployment manifest.
