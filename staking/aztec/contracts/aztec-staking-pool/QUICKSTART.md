# Quick Start Guide for AI Agents

This document provides step-by-step instructions for AI agents to continue development on the Aztec staking pool contracts.

**Last Updated:** 2025-12-27
**Location:** `staking/aztec/` (consolidated)

---

## TL;DR - Fastest Path to Verify Environment

```bash
# Run the smoke test (does everything)
export PATH="$HOME/.nargo/bin:$HOME/aztec-bin:$PATH"
./staking/aztec/scripts/smoke-test.sh
```

Expected output: environment ready, tests passed.

---

## Environment Setup (If Not Already Done)

### Option A: Run Setup Script (Recommended)

```bash
./staking/aztec/scripts/setup-env.sh
```

This script will:
1. Install standard nargo (Noir compiler)
2. Install Docker (if not present)
3. Extract aztec-nargo from Docker image
4. Download Aztec dependencies
5. Verify contract compilation

### Option B: Manual Setup

#### 1. Install Standard Noir Compiler

```bash
# Install noirup (Noir toolchain manager)
curl -L https://raw.githubusercontent.com/noir-lang/noirup/refs/heads/main/install | bash

# Install nargo
~/.nargo/bin/noirup

# Verify
~/.nargo/bin/nargo --version
# Expected: nargo version = 1.0.0-beta.17
```

#### 2. Install Docker (Required for aztec-nargo)

```bash
sudo apt-get update && sudo apt-get install -y docker.io

# Start Docker daemon with special flags (for cloud environments)
sudo dockerd --storage-driver=vfs --data-root=/tmp/docker-data \
    --host unix:///var/run/docker.sock --bridge=none --iptables=false &
sleep 5

# Verify
sudo docker info
```

#### 3. Extract aztec-nargo from Docker

```bash
# Pull Aztec image
sudo docker pull aztecprotocol/aztec:latest

# Extract nargo binary
mkdir -p ~/aztec-bin
sudo docker create --name extract-nargo aztecprotocol/aztec:latest
sudo docker cp extract-nargo:/usr/src/noir/noir-repo/target/release/nargo ~/aztec-bin/
sudo docker rm extract-nargo
sudo chown $USER:$USER ~/aztec-bin/nargo
chmod +x ~/aztec-bin/nargo

# Verify
~/aztec-bin/nargo --version
# Expected: Contains "+aztec" in version string or "1.0.0-beta.11"
```

#### 4. Setup Dependencies

```bash
# Download aztec-packages v2.1.9
mkdir -p ~/nargo/github.com/AztecProtocol/aztec-packages/v2.1.9
curl -L "https://api.github.com/repos/AztecProtocol/aztec-packages/tarball/v2.1.9" \
    -o /tmp/aztec-v2.1.9.tar.gz
tar -xzf /tmp/aztec-v2.1.9.tar.gz -C /tmp
cp -r /tmp/AztecProtocol-aztec-packages-*/* \
    ~/nargo/github.com/AztecProtocol/aztec-packages/v2.1.9/
```

---

## Running Tests

### Unit Tests (45 tests)

```bash
cd staking/aztec/contracts/staking-math-tests
~/.nargo/bin/nargo test
# Expected: 45 tests passed
```

### Run Specific Test

```bash
~/.nargo/bin/nargo test --exact test_first_deposit_1_to_1
```

---

## Compiling Contracts

**IMPORTANT:** aztec-nargo requires the working directory to be under `$HOME`. Always copy contracts before compiling.

### Compile Any Contract

```bash
# Generic pattern
cp -r staking/aztec/contracts/CONTRACT-NAME ~/CONTRACT-NAME
cd ~/CONTRACT-NAME
~/aztec-bin/nargo compile

# Verify artifact exists
ls -la target/*.json
```

### Compile Specific Contracts

```bash
# StakingPool (base contract)
cp -r staking/aztec/contracts/aztec-staking-pool ~/aztec-contracts
cd ~/aztec-contracts && ~/aztec-bin/nargo compile

# StakedAztecToken
cp -r staking/aztec/contracts/staked-aztec-token ~/staked-aztec-token
cd ~/staked-aztec-token && ~/aztec-bin/nargo compile

# WithdrawalQueue
cp -r staking/aztec/contracts/withdrawal-queue ~/withdrawal-queue
cd ~/withdrawal-queue && ~/aztec-bin/nargo compile

# ValidatorRegistry
cp -r staking/aztec/contracts/validator-registry ~/validator-registry
cd ~/validator-registry && ~/aztec-bin/nargo compile
```

---

## Project Structure

```
staking/aztec/
├── README.md                    # Project index (START HERE)
├── docs/                        # Research and planning
│   ├── EXECUTIVE-SUMMARY.md     # 1-page strategic overview
│   ├── ECONOMICS.md             # Source of truth for numbers
│   ├── ASSUMPTIONS.md           # Assumptions + competitor tracker
│   ├── IMPLEMENTATION-PLAN.md   # 6-month build plan
│   ├── FUNDRAISING.md           # Seed deck outline
│   ├── TASKS.md                 # Discrete task breakdown
│   └── liquid-staking-analysis.md  # Technical architecture
├── contracts/                   # Smart contracts
│   ├── aztec-staking-pool/      # Base staking pool (760KB, 19 fn)
│   ├── staked-aztec-token/      # stAZTEC token (778KB, 16 fn)
│   ├── withdrawal-queue/        # Withdrawal queue (824KB, 19 fn)
│   ├── validator-registry/      # Validator tracking (838KB, 23 fn)
│   ├── liquid-staking-core/     # Main entry point (314 lines, 27 fn)
│   ├── vault-manager/           # Batch pooling (162 lines, 14 fn)
│   ├── rewards-manager/         # Rewards distribution (166 lines, 13 fn)
│   ├── staking-math-tests/      # Unit tests (45 tests)
│   └── AGENT_HANDOFF.md         # Development handoff notes
└── scripts/                     # Development scripts
    ├── smoke-test.sh            # Environment verification
    ├── setup-env.sh             # Environment setup
    └── query-devnet.mjs         # Devnet query utility
```

---

## Contract Status

| Contract | Status | Size | Functions | Notes |
|----------|--------|------|-----------|-------|
| StakingPool | Complete | 760KB | 19 | Base implementation |
| StakedAztecToken | Complete | 778KB | 16 | ERC20-like token |
| WithdrawalQueue | Complete | 824KB | 19 | FIFO with unbonding |
| ValidatorRegistry | Complete | 838KB | 23 | Validator tracking |
| LiquidStakingCore | Complete | 314 lines | 27 | Main entry point |
| VaultManager | Complete | 162 lines | 14 | Batch pooling |
| RewardsManager | Complete | 166 lines | 13 | Rewards distribution |

---

## Common Issues & Solutions

### Issue: "Cannot resolve host: github.com"
**Cause:** Docker container lacks network access
**Solution:** Use extracted nargo binary with pre-downloaded dependencies (as described above)

### Issue: "Due to how we containerize our applications..."
**Cause:** aztec-nargo requires working directory under $HOME
**Solution:** Copy contracts to `~/contract-name` before compiling

### Issue: Boolean OR operator doesn't work
**Cause:** Noir doesn't support `||` for boolean OR
**Solution:** Use bitwise OR `|` with boolean variables:
```noir
let is_admin = caller == admin;
let is_manager = caller == manager;
assert(is_admin | is_manager, "Unauthorized");
```

### Issue: Early return statements fail
**Cause:** Noir doesn't support `return` in the middle of functions
**Solution:** Restructure logic to avoid early returns

### Issue: Non-ASCII character errors
**Cause:** Noir only supports ASCII in comments
**Solution:** Use `->` instead of special arrows, avoid emojis in comments

---

## Devnet Information

- **RPC URL:** `https://next.devnet.aztec-labs.com`
- **L1 Chain ID:** 11155111 (Sepolia)

Test connectivity:
```bash
curl -s -X POST "https://next.devnet.aztec-labs.com" \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","method":"node_getVersion","params":[],"id":1}'
```

---

## All Contracts Complete

All 7 core contracts have been successfully implemented! Next phase:

1. **Integration Testing** - Write comprehensive end-to-end tests
   - Full deposit -> stake -> earn -> withdraw flow
   - Multi-user scenarios with concurrent operations
   - Edge cases and stress testing

2. **Deployment to Devnet** - Deploy all contracts to Aztec devnet
   - Deploy contracts in correct dependency order
   - Verify cross-contract interactions
   - Test on actual Aztec network

3. **Documentation & Security** - Finalize for production
   - Complete API documentation
   - Security review and audit preparation
   - Performance optimization

See `staking/aztec/docs/TASKS.md` for detailed task breakdown.

---

## Quick Reference Commands

```bash
# Set up PATH (run at start of session)
export PATH="$HOME/.nargo/bin:$HOME/aztec-bin:$PATH"

# Run smoke test
./staking/aztec/scripts/smoke-test.sh

# Run unit tests
cd staking/aztec/contracts/staking-math-tests && nargo test

# Compile a contract
cp -r staking/aztec/contracts/YOUR-CONTRACT ~/YOUR-CONTRACT
cd ~/YOUR-CONTRACT && ~/aztec-bin/nargo compile

# Check artifact
python3 -c "import json; d=json.load(open('target/CONTRACT-NAME.json')); print(f'Functions: {len(d[\"functions\"])}')"
```

---

**Last Updated:** 2025-12-27
