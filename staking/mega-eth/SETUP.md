# MegaETH Local Development Setup

This guide covers setting up MegaETH for local development, testing, and validator operations.

## Prerequisites

- **OS:** Linux/macOS/WSL2
- **Node.js:** v18+ (for contract tools)
- **Docker:** (optional, for monitoring stack)
- **Bash:** 4.0+
- **Git:** for version control
- **Internet:** for RPC endpoints (optional, local testing works offline)

## Quick Start (5 minutes)

```bash
# 1. Navigate to project
cd /root/.openclaw/workspace/dev/Etc-mono-repo/staking/mega-eth

# 2. Run setup
./scripts/setup-env.sh

# 3. Validate
./scripts/smoke-test.sh

# Expected output:
# ✅ Environment variables loaded
# ✅ Configuration files verified
# ✅ Directory structure valid
```

## Step-by-Step Setup

### 1. Clone & Navigate

```bash
# Navigate to workspace (if not already there)
cd /root/.openclaw/workspace/dev/Etc-mono-repo
ls staking/mega-eth
```

### 2. Initialize Environment

```bash
# Run setup script (creates .env and validates directory structure)
cd staking/mega-eth
./scripts/setup-env.sh
```

**What it does:**
- Creates `.env` from `.env.example`
- Creates config directory if missing
- Validates script permissions
- Lists required next steps

### 3. Configure Network

Edit `.env` to select your network:

```bash
# Option A: Local development (default)
RPC_URL=http://localhost:8545
CHAIN_ID=1337

# Option B: Sepolia testnet
RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
CHAIN_ID=11155111

# Option C: Goerli testnet
RPC_URL=https://goerli.infura.io/v3/YOUR_INFURA_KEY
CHAIN_ID=5
```

### 4. Configure Staking Parameters

In `.env`, set staking behavior:

```bash
# Deposit limits
MIN_STAKE_AMOUNT=32         # Minimum stake (ETH)
MAX_STAKE_AMOUNT=1000       # Maximum stake (ETH)
QUEUE_TIMEOUT_SECONDS=604800  # 1 week withdrawal queue

# Fee structure (basis points, 1 BPS = 0.01%)
PROTOCOL_FEE_BPS=500        # 5% protocol fee
OPERATOR_FEE_BPS=200        # 2% operator fee (paid to validators)
TREASURY_FEE_BPS=300        # 3% treasury fee (for ops)

# SLA enforcement
SLA_PENALTY_DOWNTIME_MINUTES=60  # Penalty after 1h downtime
SLA_PENALTY_BPS=100              # 1% fee reduction on penalties
```

### 5. Configure Validator Keys

For testnet validator setup:

```bash
# Generate or import validator key
VALIDATOR_PUBKEY=0x<hex_pubkey>
VALIDATOR_WITHDRAWAL_CREDS=0x<hex_withdrawal_creds>

# Or use mock values for testing
# VALIDATOR_PUBKEY=0x8d3bfff9e3fd11bc6dc5aef7ee8b387888e0e60fb4d93c6f28e7b68cd7ad3f6a
# VALIDATOR_WITHDRAWAL_CREDS=0x00abcdef...
```

### 6. Run Smoke Tests

```bash
# Validate configuration (no external dependencies)
./scripts/smoke-test.sh

# Expected output:
# ✅ Environment loaded (.env exists)
# ✅ Required config files present
# ✅ Directory structure valid
# ✅ Validator pubkey format valid
# ✅ Chain ID valid
# ✅ All checks passed!
```

### 7. Verify Connectivity (Optional)

If RPC endpoint is configured:

```bash
# Check endpoint connectivity
./scripts/check-endpoints.sh

# Expected output:
# ✅ RPC endpoint reachable (http://localhost:8545)
# ⚠️  Warning: No external HTTP endpoints configured
# Setup complete. Ready for development.
```

## Directory Structure After Setup

```
mega-eth/
├── .env                     # Your configuration (created by setup)
├── .env.example             # Template (don't edit)
├── scripts/
│   ├── setup-env.sh        # Run once
│   ├── smoke-test.sh       # Run to validate
│   ├── validate-config.sh  # Manual validation
│   └── check-endpoints.sh  # Connectivity check
├── config/
│   ├── .env.example        # Environment template
│   ├── .env.goerli         # Goerli testnet preset
│   ├── .env.sepolia        # Sepolia testnet preset
│   ├── validator.toml.example
│   ├── naas-config.toml.example
│   └── monitoring.env.example
├── docs/                   # Reference documentation
├── monitoring/             # Prometheus + Grafana setup
└── README.md              # Project overview
```

## Configuration Presets

### Local Development

```bash
# Copy local preset
cp config/.env.local .env
./scripts/smoke-test.sh
```

**Defaults:**
- RPC: `http://localhost:8545` (local)
- Chain: 1337
- Min stake: 32 ETH
- Fees: 5% protocol, 2% operator

### Sepolia Testnet

```bash
# Create Infura account first: https://infura.io/
cp config/.env.sepolia .env
# Edit .env and add your INFURA_KEY

./scripts/smoke-test.sh
```

**Defaults:**
- RPC: `https://sepolia.infura.io/v3/YOUR_KEY`
- Chain: 11155111
- Network: Ethereum Sepolia testnet
- Free testnet ETH: https://www.sepoliafaucet.com/

### Goerli Testnet

```bash
# For earlier testnet
cp config/.env.goerli .env
# Edit and add endpoint

./scripts/smoke-test.sh
```

## Running Validators Locally (Simulation)

### 1. Mock Validator Stack

```bash
# Start mock validator (logs to stdout)
./scripts/start-mock-validator.sh 0

# Output:
# Mock validator initialized
# - Pubkey: 0x8d3b...
# - Status: staking
# - Next check: in 60s
```

### 2. Monitor Via Docker (Optional)

```bash
# Start Prometheus + Grafana
docker-compose -f monitoring/docker-compose.yml up -d

# Access Grafana
# URL: http://localhost:3000
# User: admin
# Pass: admin
```

## Testing the Setup

### 1. Smoke Test (No Dependencies)

```bash
./scripts/smoke-test.sh
```

Tests:
- ✅ Environment variables
- ✅ Configuration files
- ✅ Directory structure
- ✅ Format validation

### 2. Connectivity Test (Requires RPC)

```bash
./scripts/check-endpoints.sh
```

Tests:
- ✅ RPC endpoint reachable
- ✅ Chain ID matches
- ✅ Latest block available

### 3. Configuration Validation

```bash
./scripts/validate-config.sh
```

Tests:
- ✅ All required keys present
- ✅ Values in valid ranges
- ✅ Addresses are checksummed
- ✅ Fees sum to reasonable total

## Configuration Reference

### Environment Variables

```bash
# Network Configuration
RPC_URL                          # RPC endpoint (required for testnet)
CHAIN_ID                         # Network ID: 1337/5/11155111
NETWORK_NAME                     # Human-readable name

# Staking Parameters
MIN_STAKE_AMOUNT                 # Minimum stake in ETH
MAX_STAKE_AMOUNT                 # Maximum stake in ETH
QUEUE_TIMEOUT_SECONDS            # Withdrawal queue timeout

# Fee Structure (basis points)
PROTOCOL_FEE_BPS                 # Protocol fee (1-1000 BPS)
OPERATOR_FEE_BPS                 # Operator/validator fee
TREASURY_FEE_BPS                 # Treasury/ops fee

# SLA Enforcement
SLA_PENALTY_DOWNTIME_MINUTES     # Minutes before penalty triggers
SLA_PENALTY_BPS                  # Fee reduction on downtime

# Validator Keys
VALIDATOR_PUBKEY                 # Validator public key
VALIDATOR_WITHDRAWAL_CREDS       # Withdrawal address

# Monitoring (optional)
PROMETHEUS_URL                   # Prometheus endpoint
GRAFANA_URL                      # Grafana endpoint
ALERT_EMAIL                      # Alert recipient
```

### Example Configurations

**Conservative (5% fees, high security):**
```bash
PROTOCOL_FEE_BPS=500
OPERATOR_FEE_BPS=200
TREASURY_FEE_BPS=300
SLA_PENALTY_BPS=100
```

**Aggressive (3% fees, faster growth):**
```bash
PROTOCOL_FEE_BPS=200
OPERATOR_FEE_BPS=100
TREASURY_FEE_BPS=100
SLA_PENALTY_BPS=50
```

## Troubleshooting

### Issue: "setup-env.sh: permission denied"

```bash
# Fix permissions
chmod +x scripts/*.sh

# Retry
./scripts/setup-env.sh
```

### Issue: "RPC endpoint unreachable"

```bash
# Check configuration
grep RPC_URL .env

# Test locally (if running local node)
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Use testnet instead
cp config/.env.sepolia .env
# Add INFURA_KEY
./scripts/smoke-test.sh
```

### Issue: Smoke test fails with "config files missing"

```bash
# Create missing config directory
mkdir -p config

# Copy templates
cp config/.env.example .env

# Validate
./scripts/validate-config.sh
```

### Issue: "Invalid validator pubkey format"

```bash
# Pubkey must be 0x-prefixed hex
# Valid: 0x8d3bfff9e3fd11bc6dc5aef7ee8b387888e0e60fb4d93c6f28e7b68cd7ad3f6a
# Invalid: 8d3bfff9e3fd11bc6dc5aef7ee8b387888e0e60fb4d93c6f28e7b68cd7ad3f6a

# Generate mock key for testing
VALIDATOR_PUBKEY=0x$(openssl rand -hex 32)
echo "VALIDATOR_PUBKEY=$VALIDATOR_PUBKEY" >> .env
```

## Next Steps

1. **Read the Runbook:** `cat RUNBOOK.md` for operational procedures
2. **Explore Architecture:** `cat DESIGN.md` for system design
3. **Run Mock Validator:** `./scripts/start-mock-validator.sh 0`
4. **Start Monitoring:** `docker-compose -f monitoring/docker-compose.yml up`
5. **Join Testnet:** Deploy to Goerli and test with real validator

## Support

For issues or questions:

1. Check [RUNBOOK.md](RUNBOOK.md) for troubleshooting
2. Review [DESIGN.md](DESIGN.md) for architecture context
3. Check script logs: `./scripts/smoke-test.sh -v` (verbose mode)
4. Open an issue in the repo

---

**Setup Estimated Time:** 5-10 minutes  
**Last Updated:** February 21, 2026  
**Status:** Production Ready
