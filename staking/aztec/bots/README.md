# Aztec Liquid Staking - Keeper Bots

Bot infrastructure for the stAZTEC liquid staking protocol.

## Architecture

```
bots/
├── shared/              # Shared utilities (Aztec client, logger, metrics)
├── staking-keeper/      # Monitors deposits, executes batch staking
├── rewards-keeper/      # Claims rewards, updates exchange rate
├── withdrawal-keeper/   # Processes withdrawal queue
├── monitoring/          # Validator health, TVL, alerting
└── k8s/                 # Kubernetes deployment manifests
```

## Quick Start

### Development (Mock Mode)

```bash
# Install shared dependencies
cd shared && npm install && npm run build && cd ..

# Run any keeper bot
cd staking-keeper && npm install && npm run dev
cd rewards-keeper && npm install && npm run dev
cd withdrawal-keeper && npm install && npm run dev
cd monitoring && npm install && npm run dev
```

### Production (Kubernetes)

```bash
# Create namespace
kubectl apply -f k8s/namespace.yaml

# Configure secrets (EDIT first!)
kubectl apply -f k8s/secrets.yaml

# Deploy config and bots
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/staking-keeper.yaml
kubectl apply -f k8s/rewards-keeper.yaml
kubectl apply -f k8s/withdrawal-keeper.yaml
kubectl apply -f k8s/monitoring.yaml
```

## Bots Overview

### Staking Keeper

- **Purpose**: Batch user deposits and stake to validators
- **Trigger**: When pending pool >= 200k AZTEC
- **Actions**:
  1. Select next validator (round-robin)
  2. Execute batch stake through VaultManager
  3. Update accounting

### Rewards Keeper

- **Purpose**: Claim staking rewards and update exchange rate
- **Schedule**: Every hour (configurable)
- **Actions**:
  1. Query pending rewards for each validator
  2. Call `process_rewards()` to claim
  3. Distribute 10% protocol fee to treasury
  4. Update stAZTEC exchange rate

### Withdrawal Keeper

- **Purpose**: Process the withdrawal queue
- **Schedule**: Every 5 minutes (configurable)
- **Actions**:
  1. Check which requests are past unbonding period
  2. Ensure liquidity buffer has sufficient funds
  3. Process claims

### Monitoring

- **Purpose**: Health checks and alerting
- **Schedule**: Every minute
- **Checks**:
  - Validator online status
  - TVL changes (alert on >10% drop)
  - Exchange rate (alert on >1% drop)
  - Queue backlog

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `AZTEC_RPC_URL` | Aztec RPC endpoint | `http://localhost:8080` |
| `BOT_PRIVATE_KEY` | Private key for signing | Required |
| `BATCH_THRESHOLD` | Staking threshold (wei) | 200k AZTEC |
| `POLLING_INTERVAL` | Check interval (ms) | 60000 |
| `METRICS_PORT` | Prometheus port | 9090-9093 |

### Alert Channels

Set these environment variables to enable alerts:

- **Telegram**: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`
- **Slack**: `SLACK_WEBHOOK_URL`
- **PagerDuty**: `PAGERDUTY_SERVICE_KEY`

## Metrics

All bots expose Prometheus metrics at `/metrics`:

| Metric | Description |
|--------|-------------|
| `aztec_staking_batches_processed_total` | Staking batches executed |
| `aztec_pending_pool_size_aztec` | Current pending pool |
| `aztec_rewards_claimed_total` | Total rewards claimed |
| `aztec_exchange_rate_basis_points` | Current rate (10000 = 1.0) |
| `aztec_withdrawals_processed_total` | Withdrawals completed |
| `aztec_withdrawal_queue_length` | Queue size |
| `aztec_tvl_total_usd` | Total value locked (USD) |
| `aztec_validator_count` | Validator counts by status |
| `aztec_transaction_latency_seconds` | TX confirmation time |
| `aztec_bot_uptime_seconds` | Bot uptime |

## Health Endpoints

Each bot exposes:

- `GET /health` - Health status (200 or 503)
- `GET /ready` - Readiness check (200)
- `GET /metrics` - Prometheus metrics

## Testing

```bash
# Run tests for each bot
cd shared && npm test
cd staking-keeper && npm test
cd rewards-keeper && npm test
cd withdrawal-keeper && npm test
cd monitoring && npm test
```

## Docker Build

```bash
# Build from bots/ directory
docker build -f staking-keeper/Dockerfile -t aztec-staking/staking-keeper .
docker build -f rewards-keeper/Dockerfile -t aztec-staking/rewards-keeper .
docker build -f withdrawal-keeper/Dockerfile -t aztec-staking/withdrawal-keeper .
docker build -f monitoring/Dockerfile -t aztec-staking/monitoring .
```

## Important Notes

1. **NOT EVM**: These bots use AztecJS, NOT ethers.js/viem
2. **Mock Mode**: Uses simulated data by default
3. **Private Key Security**: Never commit real private keys
4. **Single Instance**: Run one instance per bot type

## Aztec SDK Integration

The current implementation uses a mock Aztec client. When the real AztecJS SDK is available:

1. Update `shared/src/aztec-client.ts`
2. Replace mock methods with actual SDK calls
3. Test against local sandbox first
4. Deploy to devnet for integration testing

```typescript
// Example real integration (when SDK available)
import { createAztecNodeClient } from '@aztec/aztec.js/node';

const node = createAztecNodeClient('https://next.devnet.aztec-labs.com');
```
