# Quick Start Guide for AI Agents

This document provides step-by-step instructions for AI agents to continue development on the Aztec staking pool contracts.

**Last Updated:** 2025-12-30
**Location:** `staking/aztec/` (consolidated)
**Status:** ✅ All contracts complete, 64/64 tests passing

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

### Unit Tests (64 tests)

```bash
cd staking/aztec/contracts/staking-math-tests
~/.nargo/bin/nargo test
# Expected: 64 tests passed
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
│   ├── aztec-staking-pool/      # Base staking pool (21 fn)
│   ├── staked-aztec-token/      # stAZTEC token (13 fn)
│   ├── withdrawal-queue/        # Withdrawal queue (24 fn)
│   ├── validator-registry/      # Validator tracking (20 fn)
│   ├── liquid-staking-core/     # Main entry point (37 fn)
│   ├── vault-manager/           # Batch staking (28 fn)
│   ├── rewards-manager/         # Exchange rate (33 fn)
│   ├── staking-math-tests/      # Unit tests (64 tests)
│   ├── AGENT_HANDOFF.md         # Development handoff notes
│   └── NOIR_GUIDE.md            # Aztec Noir reference guide
└── scripts/                     # Development scripts
    ├── smoke-test.sh            # Environment verification
    ├── setup-env.sh             # Environment setup
    └── query-devnet.mjs         # Devnet query utility
```

---

## Contract Status

| Contract | Status | Functions | Notes |
|----------|--------|-----------|-------|
| StakingPool | ✅ Complete | 21 | Base staking pool with share accounting |
| StakedAztecToken | ✅ Complete | 13 | stAZTEC ERC20-like token |
| WithdrawalQueue | ✅ Complete | 24 | FIFO queue with unbonding period |
| ValidatorRegistry | ✅ Complete | 20 | Validator tracking & status |
| LiquidStakingCore | ✅ Complete | 37 | Main entry point, 4 cross-contract calls |
| VaultManager | ✅ Complete | 28 | 200k batch staking, round-robin |
| RewardsManager | ✅ Complete | 33 | Exchange rate updates |
| staking-math-tests | ✅ Complete | 64 tests | Pure Noir math tests (all passing)

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

## Completed Tasks

All core contract tasks have been completed:

- ✅ **TASK-101-104:** StakedAztecToken (stAZTEC)
- ✅ **TASK-105:** LiquidStakingCore.nr (main entry point)
- ✅ **TASK-106:** deposit() function with cross-contract calls
- ✅ **TASK-107:** request_withdrawal() function
- ✅ **TASK-108:** VaultManager.nr (batch staking)
- ✅ **TASK-109:** RewardsManager.nr (exchange rate)
- ✅ **TASK-110:** WithdrawalQueue.nr
- ✅ **TASK-111:** ValidatorRegistry.nr
- ✅ **64 unit tests** covering all math functions

## Next Steps

1. **Compilation testing** - Requires aztec-nargo (Docker-based) to verify contracts compile
2. **Integration testing** - Deploy to Aztec sandbox for cross-contract testing
3. **Security review** - Verify function selectors match actual Token contract artifacts

See `staking/aztec/docs/TASKS.md` for full task breakdown.

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

**Last Updated:** 2025-12-30
