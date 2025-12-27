# Quick Start Guide for AI Agents

This document provides step-by-step instructions for AI agents to continue development on the Aztec staking pool contracts.

**Last Verified:** 2025-12-27
**Session:** cursor/aztec-staking-protocol-development-5e3b

---

## TL;DR - Fastest Path to Verify Environment

```bash
# Run the smoke test (does everything)
export PATH="$HOME/.nargo/bin:$HOME/aztec-bin:$PATH"
/workspace/staking/contracts/aztec-staking-pool/scripts/smoke-test.sh
```

Expected output: **7 tests passed**, environment ready.

---

## Environment Setup (If Not Already Done)

### Option A: Run Setup Script (Recommended)

```bash
/workspace/staking/contracts/aztec-staking-pool/scripts/setup-env.sh
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

### Unit Tests (34 tests)

```bash
cd /workspace/staking/contracts/staking-math-tests
~/.nargo/bin/nargo test
# Expected: 34 tests passed
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
cp -r /workspace/staking/contracts/CONTRACT-NAME ~/CONTRACT-NAME
cd ~/CONTRACT-NAME
~/aztec-bin/nargo compile

# Verify artifact exists
ls -la target/*.json
```

### Compile Specific Contracts

```bash
# StakingPool (base contract)
cp -r /workspace/staking/contracts/aztec-staking-pool ~/aztec-contracts
cd ~/aztec-contracts && ~/aztec-bin/nargo compile

# StakedAztecToken
cp -r /workspace/staking/contracts/staked-aztec-token ~/staked-aztec-token
cd ~/staked-aztec-token && ~/aztec-bin/nargo compile

# WithdrawalQueue
cp -r /workspace/staking/contracts/withdrawal-queue ~/withdrawal-queue
cd ~/withdrawal-queue && ~/aztec-bin/nargo compile

# ValidatorRegistry
cp -r /workspace/staking/contracts/validator-registry ~/validator-registry
cd ~/validator-registry && ~/aztec-bin/nargo compile
```

---

## Project Structure

```
staking/contracts/
├── aztec-staking-pool/          # Base staking pool contract
│   ├── src/
│   │   ├── main.nr              # StakingPool contract (760KB, 19 fn)
│   │   └── staking_math.nr      # Pure math functions
│   ├── scripts/
│   │   ├── setup-env.sh         # Environment setup script
│   │   ├── smoke-test.sh        # Verification script
│   │   └── query-devnet.mjs     # Devnet query utility
│   ├── Nargo.toml
│   ├── QUICKSTART.md            # This file
│   └── README.md
│
├── staked-aztec-token/          # stAZTEC token contract
│   ├── src/main.nr              # (778KB, 16 fn)
│   └── Nargo.toml
│
├── withdrawal-queue/            # Withdrawal queue contract
│   ├── src/main.nr              # (824KB, 19 fn)
│   └── Nargo.toml
│
├── validator-registry/          # Validator tracking contract
│   ├── src/main.nr              # (838KB, 23 fn)
│   └── Nargo.toml
│
├── staking-math-tests/          # Unit tests (34 tests)
│   ├── src/main.nr
│   └── Nargo.toml
│
└── AGENT_HANDOFF.md             # Handoff documentation
```

---

## Contract Status

| Contract | Status | Size | Functions | Notes |
|----------|--------|------|-----------|-------|
| StakingPool | ✅ Complete | 760KB | 19 | Base implementation |
| StakedAztecToken | ✅ Complete | 778KB | 16 | ERC20-like token |
| WithdrawalQueue | ✅ Complete | 824KB | 19 | FIFO with unbonding |
| ValidatorRegistry | ✅ Complete | 838KB | 23 | Validator tracking |
| LiquidStakingCore | ⏳ TODO | - | - | TASK-105 |
| VaultManager | ⏳ TODO | - | - | TASK-108 |
| RewardsManager | ⏳ TODO | - | - | TASK-109 |

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
**Solution:** Use `->` instead of `→`, avoid emojis in comments

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

## Next Tasks (from TASKS.md)

1. **TASK-105:** Create LiquidStakingCore.nr skeleton
2. **TASK-106:** Implement deposit() function
3. **TASK-107:** Implement request_withdrawal() function
4. **TASK-108:** Create VaultManager.nr
5. **TASK-109:** Create RewardsManager.nr

See `staking/research/aztec/TASKS.md` for full task breakdown.

---

## Quick Reference Commands

```bash
# Set up PATH (run at start of session)
export PATH="$HOME/.nargo/bin:$HOME/aztec-bin:$PATH"

# Run smoke test
/workspace/staking/contracts/aztec-staking-pool/scripts/smoke-test.sh

# Run unit tests
cd /workspace/staking/contracts/staking-math-tests && nargo test

# Compile a contract
cp -r /workspace/staking/contracts/YOUR-CONTRACT ~/YOUR-CONTRACT
cd ~/YOUR-CONTRACT && ~/aztec-bin/nargo compile

# Check artifact
python3 -c "import json; d=json.load(open('target/CONTRACT-NAME.json')); print(f'Functions: {len(d[\"functions\"])}')"
```

---

**Last Updated:** 2025-12-27
