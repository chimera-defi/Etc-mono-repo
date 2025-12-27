# Quick Start Guide for AI Agents

This document provides instructions for AI agents to continue development on the Aztec staking pool contract.

## Environment Setup (5-10 minutes)

### 1. Install Standard Noir Compiler

```bash
# Install noirup (Noir toolchain manager)
curl -L https://raw.githubusercontent.com/noir-lang/noirup/refs/heads/main/install | bash
source ~/.bashrc

# Install nargo
~/.nargo/bin/noirup

# Verify
~/.nargo/bin/nargo --version
# Expected: nargo version = 1.0.0-beta.17
```

### 2. Install Aztec-Specific Compiler

**Option A: Via Docker (recommended if Docker works)**
```bash
# Install Docker if needed
sudo apt-get update && sudo apt-get install -y docker.io

# Install Aztec tooling
bash -i <(curl -s https://install.aztec.network)

# Verify
~/.aztec/bin/aztec-nargo --version
```

**Option B: Extract from Docker image (for restricted environments)**
```bash
# Start Docker with special flags if needed
sudo dockerd --storage-driver=vfs --data-root=/tmp/docker-data \
    --host unix:///var/run/docker.sock --bridge=none --iptables=false &

# Extract aztec-nargo binary
mkdir -p ~/aztec-bin
docker create --name extract-nargo aztecprotocol/aztec:latest
docker cp extract-nargo:/usr/src/noir/noir-repo/target/release/nargo ~/aztec-bin/
docker rm extract-nargo

# Verify
~/aztec-bin/nargo --version
# Expected: Contains "+aztec" in version string
```

### 3. Setup Dependencies (if using extracted nargo)

```bash
# Download aztec-packages v2.1.9
curl -L "https://api.github.com/repos/AztecProtocol/aztec-packages/tarball/v2.1.9" \
    -o /tmp/aztec-v2.1.9.tar.gz
tar -xzf /tmp/aztec-v2.1.9.tar.gz -C /tmp

# Set up dependency cache
mkdir -p ~/nargo/github.com/AztecProtocol/aztec-packages/v2.1.9
cp -r /tmp/AztecProtocol-aztec-packages-*/* \
    ~/nargo/github.com/AztecProtocol/aztec-packages/v2.1.9/
```

## Running Tests

### Unit Tests (Staking Math)
```bash
cd /workspace/staking/contracts/staking-math-tests
~/.nargo/bin/nargo test
# Expected: 20 tests passed
```

### Compile Aztec Contract
```bash
# Copy contract to home directory (required for aztec-nargo)
cp -r /workspace/staking/contracts/aztec-staking-pool ~/aztec-contracts

# Compile
cd ~/aztec-contracts
~/aztec-bin/nargo compile
# OR if using Docker-based aztec-nargo:
# ~/.aztec/bin/aztec-nargo compile

# Verify artifact
ls -la target/staking_pool-StakingPool.json
# Expected: ~759KB file
```

### Run Smoke Test
```bash
export PATH="$HOME/.nargo/bin:$HOME/aztec-bin:$PATH"
/workspace/staking/contracts/aztec-staking-pool/scripts/smoke-test.sh
```

## Project Structure

```
staking/contracts/
├── aztec-staking-pool/          # Main Aztec contract
│   ├── src/
│   │   ├── main.nr              # Contract implementation
│   │   └── staking_math.nr      # Pure math functions
│   ├── target/                  # Compiled artifacts
│   ├── scripts/
│   │   ├── smoke-test.sh        # Verification script
│   │   └── query-devnet.mjs     # Devnet query utility
│   ├── Nargo.toml               # Package config
│   ├── README.md                # Contract documentation
│   ├── COMPILATION-STATUS.md    # Compilation details
│   └── QUICKSTART.md            # This file
│
└── staking-math-tests/          # Unit tests (standard Noir)
    ├── src/main.nr              # 20 test functions
    ├── Nargo.toml
    └── README.md
```

## Key Files to Know

| File | Purpose |
|------|---------|
| `aztec-staking-pool/src/main.nr` | Main contract code with all functions |
| `aztec-staking-pool/Nargo.toml` | Dependencies (aztec-packages v2.1.9) |
| `staking-math-tests/src/main.nr` | Unit tests for staking math |
| `research/aztec/TASKS.md` | Task breakdown and progress |
| `research/aztec/ASSUMPTIONS.md` | Validation log and assumptions |

## Contract Functions

The compiled contract exposes these functions:

**Core Operations:**
- `deposit(amount)` - Deposit tokens, receive shares
- `withdraw(shares)` - Burn shares, receive tokens
- `add_rewards(amount)` - Add staking rewards (admin)
- `collect_fees()` - Withdraw accumulated fees

**View Functions:**
- `get_total_staked()` - Total tokens in pool
- `get_total_shares()` - Total shares outstanding
- `get_share_balance(account)` - User's share balance
- `get_share_value()` - Current value per share
- `preview_deposit(amount)` - Preview shares for deposit
- `preview_withdraw(shares)` - Preview tokens for withdrawal

**Admin Functions:**
- `set_fee_bps(fee)` - Set withdrawal fee (max 30%)
- `set_paused(bool)` - Emergency pause
- `set_admin(address)` - Transfer admin

## Devnet Information

- **RPC URL:** `https://next.devnet.aztec-labs.com`
- **L1 Chain ID:** 11155111 (Sepolia)
- **Node Version:** 3.0.0-devnet.20251212

Test connectivity:
```bash
curl -s -X POST "https://next.devnet.aztec-labs.com" \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","method":"node_getL2Tips","params":[],"id":1}'
```

## Next Steps (from TASKS.md)

1. **TASK-002:** Deploy Test Validator (requires full Docker)
2. **TASK-003:** Measure Testnet Transaction Costs
3. **TASK-101+:** Implement additional contract features

## Troubleshooting

**"Cannot resolve host: github.com" during compilation**
- The Docker container lacks network access
- Solution: Use extracted nargo binary with pre-downloaded dependencies

**"Due to how we containerize our applications..."**
- aztec-nargo requires working directory under $HOME
- Solution: Copy contract to ~/aztec-contracts before compiling

**Docker daemon won't start**
- Try: `sudo dockerd --bridge=none --iptables=false &`
- Or: Extract nargo binary from existing Docker image

## Verification Checklist

Before making changes, verify the environment works:

- [ ] `nargo --version` shows 1.0.0-beta.17+
- [ ] `~/aztec-bin/nargo --version` shows +aztec variant
- [ ] `nargo test` in staking-math-tests passes (20 tests)
- [ ] Contract compiles (759KB artifact)
- [ ] Devnet is reachable

---

**Last Verified:** 2025-12-27
**Session:** cursor/aztec-staking-smoke-tests-1559
