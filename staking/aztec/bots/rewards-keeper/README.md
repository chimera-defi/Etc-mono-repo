# Rewards Keeper Bot

Periodically claims rewards from validators and processes them via RewardsManager to update the exchange rate and distribute protocol fees.

## Features

- Scheduled reward claiming (configurable interval, default: 24 hours)
- Claims rewards from all staked validators
- Processes rewards via RewardsManager
- Updates exchange rate
- Distributes protocol fees (50% insurance, 50% treasury)
- Prometheus metrics
- Health check endpoint

## Configuration

Environment variables:

- `RPC_URL` - Aztec RPC endpoint (default: http://localhost:8080)
- `REWARDS_MANAGER_ADDRESS` - RewardsManager contract address (required)
- `VAULT_MANAGER_ADDRESS` - VaultManager contract address (required)
- `LIQUID_STAKING_CORE_ADDRESS` - LiquidStakingCore contract address (optional)
- `CLAIM_INTERVAL_MS` - Claim interval in milliseconds (default: 86400000 = 24 hours)
- `MAX_RETRIES` - Maximum retries for failed operations (default: 3)
- `METRICS_PORT` - Metrics server port (default: 9091)
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

See `k8s/rewards-keeper.yaml` for deployment manifest.
