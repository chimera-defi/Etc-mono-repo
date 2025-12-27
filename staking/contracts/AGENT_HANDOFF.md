# Agent Handoff: Aztec Staking Pool Development

**Created:** 2025-12-27
**Previous Session:** cursor/aztec-staking-smoke-tests-1559
**Status:** Environment verified, ready for contract development

---

## 🚀 Quick Start Prompt for Next Agent

Copy and paste this prompt to the next AI agent:

```
Continue development on the Aztec liquid staking pool smart contracts.

**Current State:**
- Environment is set up with nargo (1.0.0-beta.17) and aztec-nargo (1.0.0-beta.11+aztec)
- Base staking pool contract compiles successfully (759KB artifact)
- 20 staking math unit tests passing
- Devnet accessible at https://next.devnet.aztec-labs.com

**Your Tasks:**
1. First, run the smoke test to verify environment: 
   `/workspace/staking/contracts/aztec-staking-pool/scripts/smoke-test.sh`

2. Review the existing contract at `staking/contracts/aztec-staking-pool/src/main.nr`

3. Based on TASKS.md, scaffold out the remaining contracts:
   - StakedAztecToken.nr (ERC20-like liquid staking token)
   - WithdrawalQueue.nr (FIFO withdrawal queue with unbonding)
   - ValidatorRegistry.nr (validator tracking)

4. Write unit tests for each new contract in staking-math-tests/

**Key Files:**
- Contract: staking/contracts/aztec-staking-pool/src/main.nr
- Tests: staking/contracts/staking-math-tests/src/main.nr
- Tasks: staking/research/aztec/TASKS.md
- Setup Guide: staking/contracts/aztec-staking-pool/QUICKSTART.md

**Important Notes:**
- Aztec-nargo requires working directory under $HOME - copy contracts to ~/aztec-contracts
- Use extracted nargo at ~/aztec-bin/nargo for compilation
- Dependencies are cached at ~/nargo/github.com/AztecProtocol/aztec-packages/v2.1.9/
```

---

## 📋 Pre-Flight Checklist

Before starting development, the next agent should verify the environment:

### Step 1: Verify Tooling

```bash
# Set up PATH
export PATH="$HOME/.nargo/bin:$HOME/aztec-bin:$PATH"

# Check standard nargo (for unit tests)
nargo --version
# Expected: nargo version = 1.0.0-beta.17

# Check aztec-nargo (for contract compilation)
~/aztec-bin/nargo --version
# Expected: Contains "+aztec" in version string
```

### Step 2: Run Smoke Test

```bash
/workspace/staking/contracts/aztec-staking-pool/scripts/smoke-test.sh
```

Expected output:
- ✅ Standard nargo found
- ✅ Aztec nargo found
- ✅ Staking math tests: 20 tests passed
- ✅ Contract artifact exists
- ✅ Devnet reachable

### Step 3: Run Unit Tests

```bash
cd /workspace/staking/contracts/staking-math-tests
nargo test
# Expected: 20 tests passed
```

### Step 4: Verify Contract Compilation

```bash
# Copy to home directory (required for aztec-nargo)
cp -r /workspace/staking/contracts/aztec-staking-pool ~/aztec-contracts

# Compile
cd ~/aztec-contracts
~/aztec-bin/nargo compile

# Verify artifact
ls -la target/staking_pool-StakingPool.json
# Expected: ~759KB file
```

---

## 🏗️ Contract Scaffolding Instructions

### Current Architecture

The existing `StakingPool` contract at `aztec-staking-pool/src/main.nr` is a **monolithic implementation** that combines:
- Deposit/withdrawal logic
- Share accounting
- Fee management
- Admin controls

### Target Architecture (per TASKS.md)

The production system should have **6 separate contracts**:

```
┌─────────────────────────────────────────────────────────────┐
│                    Contract Architecture                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐     ┌──────────────────┐              │
│  │ StakedAztecToken│     │ LiquidStakingCore│              │
│  │   (stAZTEC)     │◄────│   (Entry Point)  │              │
│  │                 │     │                  │              │
│  │ - balances      │     │ - deposit()      │              │
│  │ - transfer()    │     │ - withdraw()     │              │
│  │ - mint/burn     │     │ - accounting     │              │
│  └─────────────────┘     └────────┬─────────┘              │
│                                   │                         │
│         ┌─────────────────────────┼─────────────────┐      │
│         ▼                         ▼                 ▼      │
│  ┌─────────────┐    ┌──────────────────┐  ┌─────────────┐  │
│  │VaultManager │    │ WithdrawalQueue  │  │RewardsManager│  │
│  │             │    │                  │  │             │  │
│  │- validators │    │ - FIFO queue     │  │- claim()    │  │
│  │- batching   │    │ - unbonding      │  │- distribute │  │
│  │- 200k pools │    │ - 7-day period   │  │- fees       │  │
│  └─────────────┘    └──────────────────┘  └─────────────┘  │
│         │                                                   │
│         ▼                                                   │
│  ┌─────────────────┐                                       │
│  │ValidatorRegistry│                                       │
│  │                 │                                       │
│  │ - add/remove    │                                       │
│  │ - status track  │                                       │
│  │ - slashing      │                                       │
│  └─────────────────┘                                       │
└─────────────────────────────────────────────────────────────┘
```

### Scaffolding Order (by dependency)

1. **StakedAztecToken.nr** (TASK-101 to TASK-104)
   - No dependencies
   - ERC20-like token with mint/burn restricted to LiquidStakingCore

2. **ValidatorRegistry.nr** (TASK-111)
   - No dependencies
   - Track validator addresses and status

3. **VaultManager.nr** (TASK-108)
   - Depends on: ValidatorRegistry
   - Pool management and batch staking

4. **WithdrawalQueue.nr** (TASK-110)
   - No dependencies
   - FIFO queue with unbonding period tracking

5. **RewardsManager.nr** (TASK-109)
   - Depends on: StakedAztecToken
   - Rewards collection and exchange rate updates

6. **LiquidStakingCore.nr** (TASK-105 to TASK-107)
   - Depends on: All above contracts
   - Main entry point for users

---

## 📝 Contract Templates

### Template: StakedAztecToken.nr

```noir
// staking/contracts/aztec-staking-pool/src/staked_aztec_token.nr
use dep::aztec::macros::aztec;

#[aztec]
pub contract StakedAztecToken {
    use dep::aztec::protocol_types::address::AztecAddress;
    use dep::aztec::state_vars::{Map, PublicMutable};
    use dep::aztec::macros::{
        functions::{initializer, public, view},
        storage::storage,
    };

    #[storage]
    struct Storage<Context> {
        balances: Map<AztecAddress, PublicMutable<u128, Context>, Context>,
        total_supply: PublicMutable<u128, Context>,
        exchange_rate: PublicMutable<u64, Context>,  // Basis points (10000 = 1.0)
        
        // Access control
        liquid_staking_core: PublicMutable<AztecAddress, Context>,
        rewards_manager: PublicMutable<AztecAddress, Context>,
        admin: PublicMutable<AztecAddress, Context>,
    }

    #[public]
    #[initializer]
    fn constructor(admin: AztecAddress) {
        storage.admin.write(admin);
        storage.total_supply.write(0);
        storage.exchange_rate.write(10000);  // 1.0 initial rate
    }

    // TODO: Implement mint(), burn(), transfer(), set_exchange_rate()
    // See TASK-102, TASK-103, TASK-104 in TASKS.md
}
```

### Template: WithdrawalQueue.nr

```noir
// staking/contracts/aztec-staking-pool/src/withdrawal_queue.nr
use dep::aztec::macros::aztec;

#[aztec]
pub contract WithdrawalQueue {
    use dep::aztec::protocol_types::address::AztecAddress;
    use dep::aztec::state_vars::PublicMutable;
    use dep::aztec::macros::{
        functions::{initializer, public, view},
        storage::storage,
    };

    // Fixed-size queue (Noir doesn't have dynamic arrays)
    global MAX_QUEUE_SIZE: u64 = 10000;
    global UNBONDING_PERIOD: u64 = 604800;  // 7 days in seconds

    #[storage]
    struct Storage<Context> {
        // Queue pointers
        queue_head: PublicMutable<u64, Context>,
        queue_tail: PublicMutable<u64, Context>,
        next_request_id: PublicMutable<u64, Context>,
        
        // Request data (indexed by request_id)
        request_user: Map<u64, PublicMutable<AztecAddress, Context>, Context>,
        request_amount: Map<u64, PublicMutable<u128, Context>, Context>,
        request_timestamp: Map<u64, PublicMutable<u64, Context>, Context>,
        request_fulfilled: Map<u64, PublicMutable<bool, Context>, Context>,
        
        // Access control
        liquid_staking_core: PublicMutable<AztecAddress, Context>,
        admin: PublicMutable<AztecAddress, Context>,
    }

    // TODO: Implement add_request(), process_withdrawals(), check_status()
    // See TASK-110 in TASKS.md
}
```

---

## 🧪 Testing Instructions

### Adding Unit Tests

Unit tests go in `staking-math-tests/src/main.nr`. This uses **standard Noir** (not Aztec-specific), so tests run fast without Docker.

```noir
// Add to staking-math-tests/src/main.nr

// ============ NEW TEST FUNCTIONS ============

#[test]
fn test_exchange_rate_calculation() {
    // Test that exchange rate correctly converts AZTEC to stAZTEC
    let aztec_amount: u128 = 1000;
    let exchange_rate: u64 = 12000;  // 1.2 (20% appreciation)
    
    // stAZTEC = AZTEC * 10000 / exchange_rate
    let st_aztec = (aztec_amount * 10000) / (exchange_rate as u128);
    assert(st_aztec == 833);  // 1000 / 1.2 = 833.33
}

#[test]
fn test_withdrawal_queue_fifo() {
    // Test FIFO ordering
    // ... implement test
}
```

### Running Tests

```bash
# Run all unit tests
cd /workspace/staking/contracts/staking-math-tests
nargo test

# Run specific test
nargo test --exact test_exchange_rate_calculation
```

### Compiling Aztec Contracts

```bash
# Copy updated contracts to home directory
cp -r /workspace/staking/contracts/aztec-staking-pool ~/aztec-contracts

# Compile
cd ~/aztec-contracts
~/aztec-bin/nargo compile

# Check for errors
cat target/staking_pool-StakingPool.json | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'Functions: {len(d[\"functions\"])}')"
```

---

## 📚 Key Resources

| Resource | Location |
|----------|----------|
| Main contract | `staking/contracts/aztec-staking-pool/src/main.nr` |
| Math functions | `staking/contracts/aztec-staking-pool/src/staking_math.nr` |
| Unit tests | `staking/contracts/staking-math-tests/src/main.nr` |
| Task breakdown | `staking/research/aztec/TASKS.md` |
| Architecture spec | `staking/research/aztec/liquid-staking-analysis.md` |
| Assumptions | `staking/research/aztec/ASSUMPTIONS.md` |
| Quick setup | `staking/contracts/aztec-staking-pool/QUICKSTART.md` |

### External Documentation

- [Aztec Token Tutorial](https://docs.aztec.network/developers/docs/tutorials/contract_tutorials/token_contract)
- [Noir Language Reference](https://noir-lang.org/docs)
- [Aztec Developer Docs](https://docs.aztec.network/developers)

---

## ⚠️ Known Issues & Workarounds

### Issue 1: "Cannot resolve host: github.com"
**Cause:** Docker container lacks network access
**Solution:** Use extracted nargo binary at `~/aztec-bin/nargo` with pre-downloaded dependencies

### Issue 2: "Due to how we containerize our applications..."
**Cause:** aztec-nargo requires working directory under $HOME
**Solution:** Copy contracts to `~/aztec-contracts` before compiling

### Issue 3: Docker daemon won't start
**Cause:** Restricted cloud environment
**Solution:** 
```bash
sudo dockerd --storage-driver=vfs --data-root=/tmp/docker-data \
    --host unix:///var/run/docker.sock --bridge=none --iptables=false &
```

### Issue 4: "dump_bash_state: command not found"
**Cause:** Shell environment artifact (harmless)
**Solution:** Ignore - doesn't affect functionality

---

## ✅ Definition of Done

For each new contract:

1. [ ] Contract compiles with `aztec-nargo compile`
2. [ ] All pure functions have unit tests in `staking-math-tests/`
3. [ ] Unit tests pass: `nargo test`
4. [ ] Contract artifact is valid JSON
5. [ ] Functions documented with comments
6. [ ] TASKS.md updated with completion status

---

## 🎯 Recommended Next Steps

1. **Run smoke test** to verify environment still works
2. **Review TASKS.md** for detailed task specifications
3. **Start with TASK-101** (StakedAztecToken skeleton)
4. **Add unit tests** as you implement each function
5. **Update TASKS.md** as you complete each task

Good luck! 🚀
