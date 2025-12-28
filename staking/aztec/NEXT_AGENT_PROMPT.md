# Next Agent Prompt: Aztec Development Environment Setup

**Priority:** 🔴 CRITICAL - Do this FIRST before any other work
**Estimated Time:** 1-2 hours
**Goal:** Get Aztec contracts compiling and sandbox running locally

---

## Your Mission

The Aztec Liquid Staking contracts are **fully implemented** (176 functions, 64 unit tests passing), but we **cannot compile or test them** because:

1. `aztec-nargo` (the Aztec contract compiler) is not installed
2. Docker is not available in this environment
3. The Aztec sandbox is not running

**Your job is to fix the development environment so we can compile contracts and run integration tests.**

---

## Quick Context

```bash
# Current state - unit tests pass
cd /workspace/staking/aztec/contracts/staking-math-tests
~/.nargo/bin/nargo test  # ✅ 64 tests pass

# But contract compilation fails - needs aztec-nargo
cd /workspace/staking/aztec/contracts/liquid-staking-core
~/.nargo/bin/nargo check  # ❌ Panics on #[aztec] macros
```

The contracts use `#[aztec]` macros that **only work with `aztec-nargo`**, not standard `nargo`.

---

## Option A: Get Docker Working (Preferred)

Docker would give us immediate access to the full Aztec toolchain.

### Step 1: Check Docker Status
```bash
# Check if Docker is installed but not running
which docker
docker --version
systemctl status docker 2>/dev/null || service docker status 2>/dev/null

# Check if we can start it
sudo systemctl start docker 2>/dev/null
sudo service docker start 2>/dev/null
```

### Step 2: If Docker Works, Pull Aztec Image
```bash
# Pull the official Aztec image
docker pull aztecprotocol/aztec:latest

# Extract aztec-nargo
docker run --rm -v ~/aztec-bin:/out aztecprotocol/aztec:latest \
  cp /usr/local/bin/aztec-nargo /out/

# Verify
~/aztec-bin/aztec-nargo --version
```

### Step 3: Compile Contracts
```bash
cd /workspace/staking/aztec/contracts/liquid-staking-core
~/aztec-bin/aztec-nargo compile
```

### Step 4: Start Sandbox
```bash
# Run Aztec sandbox in Docker
docker run -d -p 8080:8080 -p 8545:8545 aztecprotocol/aztec:latest start --sandbox

# Verify
curl http://localhost:8080/status
```

---

## Option B: Native Installation (If Docker Unavailable)

If Docker cannot be made to work, try installing the Aztec toolchain natively.

### Method 1: Use aztec-up Installer
```bash
# Official Aztec installer (may require Docker internally)
curl -s https://install.aztec.network | bash

# This should install:
# - aztec-nargo (contract compiler)
# - aztec (CLI tool)
# - aztec-wallet
# - Required libraries
```

### Method 2: Build from Source
```bash
# Clone Aztec packages repo
git clone https://github.com/AztecProtocol/aztec-packages.git
cd aztec-packages

# Check build requirements
cat docs/docs/developers/getting_started.md

# The build process is complex - document what you find
```

### Method 3: Download Pre-built Binaries
```bash
# Check GitHub releases for pre-built binaries
# https://github.com/AztecProtocol/aztec-packages/releases

# Look for:
# - aztec-nargo-linux-amd64 or similar
# - Any standalone binary distributions
```

---

## Option C: Use GitHub Actions (Fallback)

If local setup is impossible, we can use CI for compilation:

1. Create `.github/workflows/aztec-compile.yml`
2. Use official Aztec Docker image in CI
3. Compile contracts and cache artifacts
4. Download artifacts for local testing

```yaml
# Example workflow structure
name: Compile Aztec Contracts
on: [push, workflow_dispatch]
jobs:
  compile:
    runs-on: ubuntu-latest
    container: aztecprotocol/aztec:latest
    steps:
      - uses: actions/checkout@v4
      - name: Compile contracts
        run: |
          cd staking/aztec/contracts/liquid-staking-core
          aztec-nargo compile
      - uses: actions/upload-artifact@v4
        with:
          name: contract-artifacts
          path: staking/aztec/contracts/*/target/
```

---

## Verification Checklist

When you've set up the environment, verify with these commands:

```bash
# 1. aztec-nargo is available
aztec-nargo --version
# Expected: aztec-nargo 1.0.0-beta.X or similar

# 2. Contracts compile
cd /workspace/staking/aztec/contracts/liquid-staking-core
aztec-nargo compile
# Expected: Compiles without errors, creates target/ directory

# 3. Sandbox is running (if Docker available)
curl http://localhost:8080/status
# Expected: JSON response with node info
```

---

## What NOT To Do

1. ❌ Don't modify the contract code - it's complete and tested
2. ❌ Don't try to make contracts work with standard `nargo` - they need `aztec-nargo`
3. ❌ Don't spend more than 30 minutes on any single approach before trying alternatives
4. ❌ Don't skip documenting what you tried - even failures are valuable

---

## Files to Update When Done

1. **Update `/workspace/staking/aztec/PROGRESS.md`** with:
   - Which installation method worked
   - Exact commands used
   - Any issues encountered

2. **Update `/workspace/staking/aztec/contracts/AGENT_HANDOFF.md`** with:
   - Environment setup instructions
   - Prerequisites verified

3. **Create `/workspace/staking/aztec/scripts/setup-env.sh`** with:
   - Automated environment setup script
   - So future agents can reproduce

---

## Reference Information

### Current Nargo Version
```bash
~/.nargo/bin/nargo --version
# nargo version = 1.0.0-beta.3
# This is BASE Noir, not Aztec - that's why contracts fail
```

### Contract Locations
```
/workspace/staking/aztec/contracts/
├── aztec-staking-pool/      # Base staking pool
├── liquid-staking-core/     # Main entry point
├── rewards-manager/         # Exchange rate management
├── staked-aztec-token/      # stAZTEC token
├── staking-math-tests/      # ✅ Pure Noir, works with nargo
├── validator-registry/      # Validator tracking
├── vault-manager/           # Batch staking
└── withdrawal-queue/        # Withdrawal management
```

### Useful Links
- Aztec Docs: https://docs.aztec.network/
- Aztec GitHub: https://github.com/AztecProtocol/aztec-packages
- Noir Language: https://noir-lang.org/docs/

---

## Success Criteria

You're done when:

1. ✅ `aztec-nargo compile` succeeds on at least one contract
2. ✅ Contract artifacts (`.json` files) are generated in `target/`
3. ✅ Environment setup is documented and reproducible
4. ✅ (Bonus) Sandbox running and responding to API calls

**Start with Option A (Docker). If that fails within 30 minutes, move to Option B. Document everything.**

---

## After Environment Works: Write Real Integration Tests

Once the environment is working, integration tests need to be written FROM SCRATCH. The previous "integration tests" were fake stubs that tested nothing.

Real integration tests must:
1. Deploy actual contracts to sandbox
2. Call contract methods
3. Assert on actual return values and state changes
4. Not just `console.log()` and return
