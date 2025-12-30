# stAZTEC Keeper Bots

Three keeper bots for the stAZTEC liquid staking protocol:

1. **Staking Keeper** - Monitors deposits and executes batch staking when threshold (200k AZTEC) is reached
2. **Rewards Keeper** - Periodically claims rewards and updates exchange rate
3. **Withdrawal Keeper** - Monitors withdrawal queue and processes claimable withdrawals

## Architecture

```
bots/
├── shared/          # Shared utilities (Aztec client, logger, metrics, retry)
├── staking-keeper/   # Staking bot
├── rewards-keeper/   # Rewards bot
├── withdrawal-keeper/ # Withdrawal bot
└── k8s/              # Kubernetes manifests
```

## Shared Utilities

- **AztecClient** - Mock Aztec client (replace with real SDK when available)
- **Logger** - Structured logging with log levels
- **Metrics** - Prometheus metrics collection
- **Retry** - Exponential backoff retry logic

## Setup

### Install Dependencies

```bash
# Install shared utilities
cd bots/shared
npm install

# Install each bot
cd ../staking-keeper && npm install
cd ../rewards-keeper && npm install
cd ../withdrawal-keeper && npm install
```

### Build

```bash
# Build shared utilities first
cd bots/shared
npm run build

# Build each bot
cd ../staking-keeper && npm run build
cd ../rewards-keeper && npm run build
cd ../withdrawal-keeper && npm run build
```

## Running Locally

### Staking Keeper

```bash
cd bots/staking-keeper
RPC_URL=http://localhost:8080 \
LIQUID_STAKING_CORE_ADDRESS=0x... \
VAULT_MANAGER_ADDRESS=0x... \
npm start
```

### Rewards Keeper

```bash
cd bots/rewards-keeper
RPC_URL=http://localhost:8080 \
REWARDS_MANAGER_ADDRESS=0x... \
VAULT_MANAGER_ADDRESS=0x... \
npm start
```

### Withdrawal Keeper

```bash
cd bots/withdrawal-keeper
RPC_URL=http://localhost:8080 \
WITHDRAWAL_QUEUE_ADDRESS=0x... \
LIQUID_STAKING_CORE_ADDRESS=0x... \
npm start
```

## Kubernetes Deployment

1. Create ConfigMap with contract addresses:
```bash
kubectl apply -f bots/k8s/configmap.yaml
# Edit configmap.yaml with actual addresses
kubectl apply -f bots/k8s/configmap.yaml
```

2. Deploy bots:
```bash
kubectl apply -f bots/k8s/staking-keeper.yaml
kubectl apply -f bots/k8s/rewards-keeper.yaml
kubectl apply -f bots/k8s/withdrawal-keeper.yaml
```

## Testing

```bash
# Test shared utilities
cd bots/shared
npm test

# Test each bot (when tests are added)
cd ../staking-keeper && npm test
cd ../rewards-keeper && npm test
cd ../withdrawal-keeper && npm test
```

## Metrics

Each bot exposes Prometheus metrics on `/metrics`:

- **Staking Keeper** (port 9090): `staking_keeper_*` metrics
- **Rewards Keeper** (port 9091): `rewards_keeper_*` metrics
- **Withdrawal Keeper** (port 9092): `withdrawal_keeper_*` metrics

Health check endpoints available at `/health` on each bot.

## Development Status

✅ **Complete:**
- Shared utilities (Aztec client mock, logger, metrics, retry)
- Staking keeper bot (watcher + executor)
- Rewards keeper bot (processor)
- Withdrawal keeper bot (processor)
- Kubernetes manifests
- Basic test structure

⚠️ **TODO:**
- Replace mock AztecClient with real AztecJS SDK
- Add unit tests for each bot (80%+ coverage target)
- Add integration tests with mocked contracts
- Implement actual reward claiming from validators
- Implement liquidity buffer management (unstaking)

## Notes

- AztecClient is currently a mock - replace with real AztecJS SDK when available
- All bots use structured logging (JSON format)
- All bots expose Prometheus metrics
- All bots have health check endpoints
- Kubernetes manifests include health checks and resource limits
