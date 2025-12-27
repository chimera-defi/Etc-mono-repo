# Agent Handoff: Aztec Staking Pool Development

**Created:** 2025-12-27
**Status:** Core contracts implemented, ready for LiquidStakingCore integration
**Location:** `staking/aztec/` (consolidated directory)

---

## Quick Start Prompt for Next Agent

Copy and paste this prompt to the next AI agent:

```
Continue development on the Aztec liquid staking pool smart contracts.

**Current State:**
- Environment is set up with nargo (1.0.0-beta.17) and aztec-nargo (1.0.0-beta.11+aztec)
- 4 contracts compiled and verified:
  - StakingPool (base contract): 760KB, 19 functions
  - StakedAztecToken: 778KB, 16 functions
  - WithdrawalQueue: 824KB, 19 functions
  - ValidatorRegistry: 838KB, 23 functions
- 34 staking math unit tests passing
- Devnet accessible at https://next.devnet.aztec-labs.com

**Your Tasks:**
1. First, run verification:
   - cd staking/aztec/contracts/staking-math-tests && ~/.nargo/bin/nargo test
   - Expected: 34 tests passed

2. Review existing contracts:
   - staking/aztec/contracts/staked-aztec-token/src/main.nr
   - staking/aztec/contracts/withdrawal-queue/src/main.nr
   - staking/aztec/contracts/validator-registry/src/main.nr

3. Implement TASK-105: LiquidStakingCore.nr
   - Main entry point that integrates all other contracts
   - deposit() - accepts AZTEC, mints stAZTEC
   - request_withdrawal() - burns stAZTEC, queues withdrawal

4. Write integration tests for the full flow

**Key Files:**
- Contracts: staking/aztec/contracts/*/src/main.nr
- Tests: staking/aztec/contracts/staking-math-tests/src/main.nr
- Tasks: staking/aztec/docs/TASKS.md
- Setup Guide: staking/aztec/contracts/aztec-staking-pool/QUICKSTART.md

**Important Notes:**
- Aztec-nargo requires working directory under $HOME - copy contracts before compiling
- Use extracted nargo at ~/aztec-bin/nargo for compilation
- Dependencies are cached at ~/nargo/github.com/AztecProtocol/aztec-packages/v2.1.9/
- Noir doesn't support || operator - use | for boolean OR (e.g., is_admin | is_manager)
- Noir doesn't support early return - restructure logic to avoid return statements
- No non-ASCII characters in comments (use -> instead of special chars)
```

---

## Pre-Flight Checklist

Before starting development, verify the environment:

### Step 1: Verify Tooling

```bash
# Check standard nargo (for unit tests)
~/.nargo/bin/nargo --version
# Expected: nargo version = 1.0.0-beta.17

# Check aztec-nargo (for contract compilation)
~/aztec-bin/nargo --version
# Expected: Contains "+aztec" in version string
```

### Step 2: Run Unit Tests

```bash
cd staking/aztec/contracts/staking-math-tests
~/.nargo/bin/nargo test
# Expected: 34 tests passed
```

### Step 3: Verify Contract Compilation

```bash
# Copy and compile any contract
cp -r staking/aztec/contracts/staked-aztec-token ~/staked-aztec-token
cd ~/staked-aztec-token && ~/aztec-bin/nargo compile
ls -la target/*.json
# Expected: ~778KB artifact
```

---

## Current Contract Architecture

```
+------------------------------------------------------------------+
|                    Contract Status                                |
+------------------------------------------------------------------+
|                                                                  |
|  +------------------+     +-------------------+                  |
|  | StakedAztecToken |     | LiquidStakingCore |                  |
|  |   COMPLETE       |<----|   TODO            |                  |
|  |   778KB, 16 fn   |     |   (TASK-105)      |                  |
|  |                  |     |                   |                  |
|  | - mint/burn      |     | - deposit()       |                  |
|  | - transfer()     |     | - withdraw()      |                  |
|  | - exchange_rate  |     | - accounting      |                  |
|  +------------------+     +--------+----------+                  |
|                                    |                             |
|         +--------------------------+-----------------+           |
|         |                          |                 |           |
|         v                          v                 v           |
|  +--------------+    +-------------------+  +--------------+     |
|  |VaultManager  |    | WithdrawalQueue   |  |RewardsManager|     |
|  |  TODO        |    |   COMPLETE        |  |  TODO        |     |
|  | (TASK-108)   |    |   824KB, 19 fn    |  | (TASK-109)   |     |
|  |              |    |                   |  |              |     |
|  |- validators  |    | - FIFO queue      |  |- claim()     |     |
|  |- batching    |    | - unbonding       |  |- distribute  |     |
|  |- 200k pools  |    | - 7-day period    |  |- fees        |     |
|  +--------------+    +-------------------+  +--------------+     |
|         |                                                        |
|         v                                                        |
|  +------------------+                                            |
|  |ValidatorRegistry |                                            |
|  |   COMPLETE       |                                            |
|  |   838KB, 23 fn   |                                            |
|  |                  |                                            |
|  | - add/remove     |                                            |
|  | - status track   |                                            |
|  | - slashing       |                                            |
|  +------------------+                                            |
+------------------------------------------------------------------+
```

### Completed Contracts

| Contract | Location | Size | Functions |
|----------|----------|------|-----------|
| StakingPool (base) | `aztec-staking-pool/` | 760KB | 19 |
| StakedAztecToken | `staked-aztec-token/` | 778KB | 16 |
| WithdrawalQueue | `withdrawal-queue/` | 824KB | 19 |
| ValidatorRegistry | `validator-registry/` | 838KB | 23 |

### Next Contracts to Implement

1. **LiquidStakingCore.nr** (TASK-105 to TASK-107)
   - Main entry point for users
   - Integrates all other contracts

2. **VaultManager.nr** (TASK-108)
   - 200k batch pooling
   - Round-robin validator selection

3. **RewardsManager.nr** (TASK-109)
   - Rewards collection
   - Exchange rate updates

---

## Testing Infrastructure

### Test Coverage Analysis

| Function in Contract | Test Coverage |
|---------------------|---------------|
| deposit() share calculation | 5 tests |
| withdraw() amount calculation | 3 tests |
| Fee calculation | 4 tests |
| Share value calculation | 4 tests |
| Multi-user scenarios | 3 tests |
| Edge cases | 3 tests |
| Access control | Not testable without Aztec runtime |
| Pause mechanism | Not testable without Aztec runtime |
| Token transfers | Stubbed in contract, not implemented |

### Testing Limitations

1. **CI Job for Aztec compilation is informational**: Uses `continue-on-error: true` because Aztec tooling requires Docker
2. **Tests are for math only**: These unit tests verify calculations, not contract deployment or access control
3. **Aztec sandbox testing not included**: Full integration tests require local Aztec sandbox

### Running Unit Tests

```bash
cd staking/aztec/contracts/staking-math-tests
~/.nargo/bin/nargo test
# Expected: 34 tests passed
```

### Adding New Tests

Add to `staking-math-tests/src/main.nr`:

```noir
#[test]
fn test_my_new_function() {
    // Test implementation
    assert(1 + 1 == 2);
}
```

### Compiling Aztec Contracts

```bash
# Copy to home directory (required for aztec-nargo)
cp -r staking/aztec/contracts/my-contract ~/my-contract

# Compile
cd ~/my-contract && ~/aztec-bin/nargo compile

# Verify artifact
ls -la target/*.json
```

---

## Contract Template: LiquidStakingCore.nr

```noir
use dep::aztec::macros::aztec;

#[aztec]
pub contract LiquidStakingCore {
    use dep::aztec::protocol_types::address::AztecAddress;
    use dep::aztec::state_vars::{Map, PublicMutable};
    use dep::aztec::macros::{
        functions::{initializer, public, view},
        storage::storage,
    };

    #[storage]
    struct Storage<Context> {
        total_deposited: PublicMutable<u128, Context>,
        pending_pool: PublicMutable<u128, Context>,

        // Contract references
        staked_aztec_token: PublicMutable<AztecAddress, Context>,
        withdrawal_queue: PublicMutable<AztecAddress, Context>,
        validator_registry: PublicMutable<AztecAddress, Context>,

        admin: PublicMutable<AztecAddress, Context>,
        paused: PublicMutable<bool, Context>,
    }

    #[public]
    #[initializer]
    fn constructor(admin_: AztecAddress) {
        storage.admin.write(admin_);
        storage.total_deposited.write(0);
        storage.pending_pool.write(0);
        storage.paused.write(false);
    }

    #[public]
    fn deposit(amount: u128) -> pub u128 {
        assert(!storage.paused.read(), "Contract is paused");
        assert(amount > 0, "Amount must be positive");

        // TODO: Get exchange rate from StakedAztecToken
        // TODO: Calculate stAZTEC to mint
        // TODO: Call StakedAztecToken.mint()
        // TODO: Update accounting

        0 // Return stAZTEC minted
    }

    #[public]
    fn request_withdrawal(st_aztec_amount: u128) -> pub u64 {
        assert(!storage.paused.read(), "Contract is paused");
        assert(st_aztec_amount > 0, "Amount must be positive");

        // TODO: Call StakedAztecToken.burn()
        // TODO: Calculate AZTEC amount
        // TODO: Call WithdrawalQueue.add_request()

        0 // Return request ID
    }
}
```

---

## Key Resources

| Resource | Location |
|----------|----------|
| Main README | `staking/aztec/README.md` |
| **Noir Guide** | `staking/aztec/contracts/NOIR_GUIDE.md` |
| StakedAztecToken | `staking/aztec/contracts/staked-aztec-token/src/main.nr` |
| WithdrawalQueue | `staking/aztec/contracts/withdrawal-queue/src/main.nr` |
| ValidatorRegistry | `staking/aztec/contracts/validator-registry/src/main.nr` |
| Unit tests | `staking/aztec/contracts/staking-math-tests/src/main.nr` |
| Task breakdown | `staking/aztec/docs/TASKS.md` |
| Architecture spec | `staking/aztec/docs/liquid-staking-analysis.md` |
| Smoke test | `staking/aztec/scripts/smoke-test.sh` |

### External Documentation

- [Aztec Token Tutorial](https://docs.aztec.network/developers/docs/tutorials/contract_tutorials/token_contract)
- [Noir Language Reference](https://noir-lang.org/docs)
- [Aztec Developer Docs](https://docs.aztec.network/developers)

---

## Known Issues & Workarounds

### Issue 1: "Cannot resolve host: github.com"
**Cause:** Docker container lacks network access
**Solution:** Use extracted nargo binary at `~/aztec-bin/nargo` with pre-downloaded dependencies

### Issue 2: "Due to how we containerize our applications..."
**Cause:** aztec-nargo requires working directory under $HOME
**Solution:** Copy contracts to `~/contract-name` before compiling

### Issue 3: Boolean OR operator
**Cause:** Noir doesn't support `||` for boolean OR
**Solution:** Use bitwise OR `|` with boolean variables:
```noir
let is_admin = caller == admin;
let is_manager = caller == manager;
assert(is_admin | is_manager, "Unauthorized");
```

### Issue 4: Early return statements
**Cause:** Noir doesn't support `return` in the middle of functions
**Solution:** Restructure logic to avoid early returns

### Issue 5: Non-ASCII characters
**Cause:** Noir only supports ASCII in comments
**Solution:** Use `->` instead of special arrows, avoid emojis in code comments

---

## Definition of Done

For each new contract:

1. [ ] Contract compiles with `aztec-nargo compile`
2. [ ] All pure functions have unit tests in `staking-math-tests/`
3. [ ] Unit tests pass: `nargo test`
4. [ ] Contract artifact is valid JSON
5. [ ] Functions documented with comments
6. [ ] TASKS.md updated with completion status

---

## Recommended Next Steps

1. **Implement TASK-105** (LiquidStakingCore skeleton)
2. **Implement TASK-106** (deposit function with cross-contract calls)
3. **Implement TASK-107** (withdrawal request function)
4. **Write integration tests** for full deposit -> withdraw flow
5. **Update TASKS.md** as you complete each task

---

**Last Updated:** 2025-12-27
