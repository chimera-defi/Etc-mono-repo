# Phase 2 Agent Prompts: Contract Integration & Production Readiness

**Created:** 2025-12-27
**Purpose:** Parallelizable prompts to complete the Aztec staking contracts
**Prerequisite:** Read AGENT_HANDOFF_PHASE2.md first for context
**Status Update:** Enhanced with multi-pass review, progress tracking, and honest assessment requirements

---

## Critical Context for All Agents

**Current State:** Contracts are accounting stubs - they track state but don't actually transfer tokens or call other contracts.

**What's Missing:**
1. Token transfers (AZTEC in, stAZTEC out) - NO actual movement of funds
2. Cross-contract calls (contracts don't talk to each other) - ALL stubbed
3. Withdrawal claiming (users can request but not claim) - MISSING ENTIRELY
4. Overflow protection in RewardsManager - CRITICAL BUG

**Priority:** TASK-P2-001 through P2-005 are CRITICAL and block all other work.

**True Completion Estimate:** ~55% toward production-ready

---

## Mandatory Review Protocol (ALL Agents)

**EVERY agent MUST follow this before marking any deliverable complete:**

### Multi-Step Review Checklist (Per .cursorrules #15, #24)

```
1. DEVELOPER PERSPECTIVE: Can another developer use this?
   - [ ] Code compiles/runs without errors
   - [ ] Dependencies documented
   - [ ] Setup instructions work from scratch

2. REVIEWER PERSPECTIVE: Is this correct?
   - [ ] Logic matches specification
   - [ ] Edge cases handled
   - [ ] No dead code or unused imports
   - [ ] ACTUALLY does what comments claim (not just accounting)

3. USER PERSPECTIVE: Does it actually work?
   - [ ] Happy path tested END-TO-END (not just unit tests)
   - [ ] Error states handled gracefully
   - [ ] Clear error messages
   - [ ] Users can ACTUALLY deposit/withdraw (not just track numbers)

4. MAINTAINER PERSPECTIVE: Can this be maintained?
   - [ ] Code is readable and commented
   - [ ] No hardcoded values (use config)
   - [ ] Tests exist for core functionality
   - [ ] No duplicate state across contracts

5. PM PERSPECTIVE: What could go wrong?
   - [ ] Risks documented
   - [ ] Blockers flagged
   - [ ] Assumptions stated explicitly
   - [ ] Honest assessment of completion (no overclaiming)

6. SECURITY PERSPECTIVE: Is this safe?
   - [ ] Overflow/underflow protection
   - [ ] Zero address validation
   - [ ] Access control verified
   - [ ] Reentrancy considered
```

### Verification Commands (Per .cursorrules #24, #61)

Before marking ANY deliverable complete, run ALL applicable:
```bash
# For Noir contracts
cd ~/contract-name && ~/aztec-bin/nargo compile     # Compilation
cd staking/aztec/contracts/staking-math-tests && ~/.nargo/bin/nargo test  # Unit tests

# Verify changes
git diff                          # Review ALL changes
git status                        # Check for missed files

# Honest verification
# ASK: "Does this function ACTUALLY do X, or just track that X should happen?"
```

---

## Testing Hierarchy

**All testing follows this order - NO EXCEPTIONS:**

```
1. UNIT TESTS (Pure math, no chain)
   - Run: cd staking/aztec/contracts/staking-math-tests && nargo test
   - Why: Fast, catches logic errors early

2. LOCAL SANDBOX (Aztec sandbox on your machine)
   - Run: aztec start --sandbox
   - Why: Fast iteration, no network issues, free
   - MUST test cross-contract calls here

3. LOCAL FORK (Fork of devnet state)
   - Run: aztec start --fork https://next.devnet.aztec-labs.com
   - Why: Real state, local speed

4. DEVNET (https://next.devnet.aztec-labs.com)
   - Why: Public test environment
   - ONLY after local tests pass

5. MAINNET
   - ONLY after full audit and all prior stages pass
```

---

## Progress Tracking Requirements

**EVERY agent MUST maintain progress tracking:**

1. **Update progress.md** after each significant milestone
2. **Be HONEST** about what was accomplished vs what was stubbed
3. **Document blockers** immediately when encountered
4. **Mark completion percentage** accurately (not optimistically)

### Progress Update Template

```markdown
### [Agent Name] Progress Update - [Date]

**Task:** [Task ID and name]
**Status:** [IN PROGRESS / COMPLETE / BLOCKED]
**True Completion:** [X%]

**What was actually done:**
- [Specific deliverable 1]
- [Specific deliverable 2]

**What is still stubbed/incomplete:**
- [Gap 1]
- [Gap 2]

**Blockers:**
- [Blocker 1]

**Next steps:**
- [Step 1]
```

---

## Parallelization Strategy

```
CRITICAL PATH (Sequential - Must Complete in Order):
+-- Agent A: Token Integration (P2-001) - BLOCKS EVERYTHING
|   +-- Completes: AZTEC transfers, stAZTEC minting/burning
|
+-- After A completes:
|   +-- Agent B: Cross-Contract Calls (P2-002) - DEPENDS ON A
|   |   +-- Wire up contract-to-contract communication
|   +-- Agent C: Security Fixes (P2-003, P2-006, P2-008) - PARALLEL WITH B
|       +-- Fix overflow, add validation
|
+-- After B completes:
    +-- Agent D: Withdrawal Claiming (P2-004) - DEPENDS ON B
    +-- Agent E: State Unification (P2-005) - PARALLEL WITH D

INDEPENDENT (Can Run Anytime):
+-- Agent C: Security Fixes (no dependencies)
+-- Agent E: State Unification (no dependencies if careful)
+-- Agent F: Events & Logging (no dependencies)

FINAL PHASE (After D, E Complete):
+-- Agent G: Validator Selection
+-- Agent H: Emergency Functions
+-- Agent I: View Functions
+-- Agent J: Integration Tests
```

---

## PROMPT A: Token Integration Agent (CRITICAL - DO FIRST)

**Priority:** CRITICAL - Blocks all other work
**Estimated Time:** 8-12 hours
**Dependencies:** None
**Testing Environment:** LOCAL SANDBOX ONLY (no testnet until integration)

```text
You are implementing token transfer integration for the Aztec liquid staking protocol.

## CRITICAL CONTEXT
The LiquidStakingCore contract currently DOES NOT transfer any tokens. It only tracks
accounting. Users cannot actually deposit or withdraw - the functions just update numbers.

Your job is to implement REAL token transfers.

## MANDATORY PROGRESS TRACKING
1. Update staking/aztec/progress.md after each milestone
2. Be HONEST about what works vs what's stubbed
3. Mark true completion percentage (not optimistic)

## YOUR TASKS

### Task 1: Define AZTEC Token Interface
Create interface for the native AZTEC token (or mock for testing):

Location: /home/user/Etc-mono-repo/staking/aztec/contracts/liquid-staking-core/src/main.nr

Add near top of file:
```noir
// Interface for AZTEC token (or compatible ERC20-like token)
// In production, replace with actual Aztec token contract interface
trait IAztecToken {
    fn transfer_from(from: AztecAddress, to: AztecAddress, amount: u128);
    fn transfer(to: AztecAddress, amount: u128);
    fn balance_of(account: AztecAddress) -> u128;
}
```

### Task 2: Add aztec_token to Storage
Add to storage struct:
```noir
aztec_token: PublicMutable<AztecAddress, Context>,
```

Add setter with zero address check:
```noir
#[public]
fn set_aztec_token(address: AztecAddress) {
    let caller = context.msg_sender();
    let admin = storage.admin.read();
    assert(caller == admin, "Only admin");
    assert(address != AztecAddress::zero(), "Cannot set zero address");
    storage.aztec_token.write(address);
}
```

### Task 3: Update deposit() Function
Current location: lines 112-144

CURRENT (BROKEN):
```noir
fn deposit(amount: u128) -> pub u128 {
    // ... accounting only, no actual transfer
    st_aztec_amount
}
```

FIXED:
```noir
#[public]
fn deposit(amount: u128) -> pub u128 {
    let paused = storage.paused.read();
    assert(!paused, "Contract is paused");
    assert(amount > 0, "Amount must be greater than zero");

    let caller = context.msg_sender();

    // STEP 1: Transfer AZTEC from user to this contract
    // Note: User must have approved this contract first
    let aztec_token = storage.aztec_token.read();
    IAztecToken::at(aztec_token).transfer_from(
        caller,
        context.this_address(),
        amount
    );

    // STEP 2: Calculate stAZTEC to mint
    let rate = storage.exchange_rate.read();
    let st_aztec_amount = (amount * (BASIS_POINTS as u128)) / (rate as u128);

    // STEP 3: Mint stAZTEC to user
    let st_aztec_token = storage.staked_aztec_token.read();
    StakedAztecToken::at(st_aztec_token).mint(caller, st_aztec_amount);

    // STEP 4: Update accounting
    let current_pending = storage.pending_pool.read();
    storage.pending_pool.write(current_pending + amount);
    let current_total = storage.total_deposited.read();
    storage.total_deposited.write(current_total + amount);

    // STEP 5: Notify VaultManager
    let vault_manager = storage.vault_manager.read();
    VaultManager::at(vault_manager).record_deposit(amount);

    st_aztec_amount
}
```

### Task 4: Update request_withdrawal() Function
Current location: lines 147-176

FIXED:
```noir
#[public]
fn request_withdrawal(st_aztec_amount: u128) -> pub u64 {
    let paused = storage.paused.read();
    assert(!paused, "Contract is paused");
    assert(st_aztec_amount > 0, "Amount must be greater than zero");

    let caller = context.msg_sender();

    // STEP 1: Burn stAZTEC from user
    let st_aztec_token = storage.staked_aztec_token.read();
    StakedAztecToken::at(st_aztec_token).burn(caller, st_aztec_amount);

    // STEP 2: Calculate AZTEC amount
    let rate = storage.exchange_rate.read();
    let aztec_amount = (st_aztec_amount * (rate as u128)) / (BASIS_POINTS as u128);

    // STEP 3: Add to withdrawal queue
    let withdrawal_queue = storage.withdrawal_queue.read();
    let current_timestamp = context.timestamp();
    let request_id = WithdrawalQueue::at(withdrawal_queue).add_request(
        caller,
        st_aztec_amount,
        aztec_amount,
        current_timestamp
    );

    request_id
}
```

### Task 5: Add Contract Interfaces
Define interfaces for cross-contract calls:
```noir
trait IStakedAztecToken {
    fn mint(to: AztecAddress, amount: u128);
    fn burn(from: AztecAddress, amount: u128);
    fn get_exchange_rate() -> u64;
}

trait IWithdrawalQueue {
    fn add_request(user: AztecAddress, shares: u128, amount: u128, timestamp: u64) -> u64;
}

trait IVaultManager {
    fn record_deposit(amount: u128) -> bool;
}
```

## LOCAL-FIRST TESTING (MANDATORY)
1. Compile contract: `cp -r staking/aztec/contracts/liquid-staking-core ~/liquid-staking-core && cd ~/liquid-staking-core && ~/aztec-bin/nargo compile`
2. Run unit tests: `cd staking/aztec/contracts/staking-math-tests && ~/.nargo/bin/nargo test`
3. Start local sandbox: `aztec start --sandbox`
4. Deploy and test transfers locally BEFORE proceeding

## VERIFICATION CHECKLIST (ALL MUST PASS)
- [ ] aztec_token storage variable added
- [ ] set_aztec_token() function added with zero check
- [ ] deposit() calls transfer_from on AZTEC token
- [ ] deposit() calls mint on StakedAztecToken
- [ ] deposit() calls record_deposit on VaultManager
- [ ] request_withdrawal() calls burn on StakedAztecToken
- [ ] request_withdrawal() calls add_request on WithdrawalQueue
- [ ] Contract compiles with aztec-nargo
- [ ] Unit tests pass (run: nargo test)
- [ ] Local sandbox test passes (actual transfers verified)
- [ ] Multi-step review completed (all 6 perspectives)
- [ ] progress.md updated with honest assessment

## OUTPUT FORMAT
Report back with:
1. Functions modified and line numbers
2. New functions/interfaces added
3. Compilation status (with output)
4. Test results (with output)
5. **HONEST ASSESSMENT:** What actually works vs what needs more work
6. Any issues or blockers encountered
7. Updated progress.md excerpt
```

---

## PROMPT B: Cross-Contract Integration Agent

**Priority:** CRITICAL
**Estimated Time:** 10-16 hours
**Dependencies:** PROMPT A complete (token transfers must work first)
**Testing Environment:** LOCAL SANDBOX ONLY

```text
You are implementing cross-contract communication for the Aztec staking protocol.

## CONTEXT
After PROMPT A, the contracts have token transfer code but need proper cross-contract
call patterns following Aztec conventions.

## MANDATORY PROGRESS TRACKING
1. Update staking/aztec/progress.md after each milestone
2. Be HONEST about what works vs what's stubbed
3. Mark true completion percentage (not optimistic)

## AZTEC CROSS-CONTRACT CALL PATTERNS
IMPORTANT: First read current Aztec documentation at:
https://docs.aztec.network/developers/contracts/cross_contract_calls

The pattern may differ from examples below. VERIFY before implementing.

Example pattern (may need adjustment):
```noir
// Define interface
struct ContractName {
    address: AztecAddress
}

impl ContractName {
    fn at(address: AztecAddress) -> Self {
        Self { address }
    }

    fn some_function(&self, context: &mut PublicContext, arg: u128) {
        context.call_public_function(
            self.address,
            compute_selector("some_function(u128)"),
            [arg as Field]
        );
    }
}
```

## YOUR TASKS

### Task 1: Verify Aztec Documentation
1. Read: https://docs.aztec.network/developers/contracts/cross_contract_calls
2. Document the ACTUAL pattern for current Aztec version
3. If different from examples, update all code accordingly

### Task 2: Create Contract Interfaces File
File: /home/user/Etc-mono-repo/staking/aztec/contracts/liquid-staking-core/src/interfaces.nr

```noir
// StakedAztecToken interface
struct StakedAztecTokenInterface {
    address: AztecAddress
}

impl StakedAztecTokenInterface {
    fn at(address: AztecAddress) -> Self { Self { address } }

    fn mint(&self, context: &mut PublicContext, to: AztecAddress, amount: u128) {
        // VERIFY: Implement per current Aztec docs
    }

    fn burn(&self, context: &mut PublicContext, from: AztecAddress, amount: u128) {
        // VERIFY: Implement per current Aztec docs
    }

    fn get_exchange_rate(&self, context: &PublicContext) -> u64 {
        // VERIFY: Implement per current Aztec docs
    }
}

// Add similar for:
// - WithdrawalQueueInterface
// - VaultManagerInterface
// - ValidatorRegistryInterface
// - RewardsManagerInterface
```

### Task 3: Wire Up All Contract Calls

| Caller | Target | Function | When |
|--------|--------|----------|------|
| LiquidStakingCore | StakedAztecToken | mint() | On deposit |
| LiquidStakingCore | StakedAztecToken | burn() | On withdrawal request |
| LiquidStakingCore | VaultManager | record_deposit() | On deposit |
| LiquidStakingCore | WithdrawalQueue | add_request() | On withdrawal request |
| LiquidStakingCore | RewardsManager | get_exchange_rate() | On deposit/withdrawal |
| VaultManager | ValidatorRegistry | get_active_validators() | On batch stake |
| VaultManager | ValidatorRegistry | record_stake() | After staking |
| RewardsManager | StakedAztecToken | update_exchange_rate() | On rewards processing |

### Task 4: Integration Test (LOCAL SANDBOX)
Create integration test that:
1. Deploys all 7 contracts to local sandbox
2. Sets all contract addresses on each other
3. Executes: deposit -> check balances -> request withdrawal -> verify queue
4. Verifies tokens ACTUALLY moved (not just accounting)

## LOCAL-FIRST TESTING (MANDATORY)
1. `aztec start --sandbox` - Start local environment
2. Deploy ALL contracts to local sandbox
3. Wire up contract addresses
4. Execute full deposit flow
5. Verify with `aztec inspect` or similar tools
6. DO NOT proceed to devnet until local works perfectly

## VERIFICATION CHECKLIST (ALL MUST PASS)
- [ ] Aztec docs reviewed and pattern verified
- [ ] Interfaces follow ACTUAL Aztec patterns
- [ ] All cross-contract calls compile
- [ ] Bidirectional calls work (A calls B, B calls A)
- [ ] State updates propagate correctly
- [ ] Error handling for failed calls
- [ ] Local sandbox integration test passes
- [ ] Multi-step review completed (all 6 perspectives)
- [ ] progress.md updated with honest assessment

## IMPORTANT
Aztec's cross-contract call syntax may differ from examples above.
ALWAYS check current Aztec documentation before implementing.
If pattern differs, adapt accordingly and document the correct pattern.

## OUTPUT FORMAT
Report back with:
1. Interfaces created with ACTUAL Aztec pattern used
2. Contract calls wired up (which caller -> target)
3. Local sandbox test results
4. **HONEST ASSESSMENT:** What works end-to-end vs what's partial
5. Blockers or Aztec SDK gaps found
6. Updated progress.md excerpt
```

---

## PROMPT C: Security Fixes Agent

**Priority:** CRITICAL
**Estimated Time:** 4-6 hours
**Dependencies:** None (can run in parallel with A)
**Testing Environment:** Unit tests first, then local sandbox

```text
You are fixing critical security issues in the Aztec staking contracts.

## MANDATORY PROGRESS TRACKING
1. Update staking/aztec/progress.md after each bug fix
2. Document exact lines changed
3. Mark true completion percentage

## CRITICAL BUGS TO FIX

### Bug 1: Integer Overflow in RewardsManager (CRITICAL)
File: /home/user/Etc-mono-repo/staking/aztec/contracts/rewards-manager/src/main.nr
Line: 109-110

CURRENT (BROKEN):
```noir
let total_value = total_staked + net_rewards;
((total_value * 10000) / total_supply) as u64
```

PROBLEM: If total_value is large, multiplying by 10000 overflows u128.

FIX:
```noir
// Overflow-safe rate calculation
fn calculate_new_rate(total_staked: u128, net_rewards: u128, total_supply: u128) -> u64 {
    if total_supply == 0 {
        return 10000;
    }

    let total_value = total_staked + net_rewards;

    // Check for potential overflow before multiplication
    let max_safe_value: u128 = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF / 10000;

    if total_value > max_safe_value {
        // Use lower precision to avoid overflow
        let scaled_value = total_value / 1000;
        let scaled_supply = total_supply / 1000;
        if scaled_supply == 0 {
            10000
        } else {
            ((scaled_value * 10000) / scaled_supply) as u64
        }
    } else {
        ((total_value * 10000) / total_supply) as u64
    }
}
```

### Bug 2: Missing Zero Address Checks (HIGH)
Add to ALL setter functions in ALL contracts:

```noir
fn set_some_address(address: AztecAddress) {
    let caller = context.msg_sender();
    let admin = storage.admin.read();
    assert(caller == admin, "Only admin");
    // ADD THIS LINE:
    assert(address != AztecAddress::zero(), "Cannot set zero address");
    storage.some_address.write(address);
}
```

Files and function counts to update:
- liquid-staking-core/src/main.nr: 7 setter functions
- vault-manager/src/main.nr: 3 setter functions
- rewards-manager/src/main.nr: 4 setter functions
- staked-aztec-token/src/main.nr: 3 setter functions
- withdrawal-queue/src/main.nr: 2 setter functions
- validator-registry/src/main.nr: 2 setter functions

TOTAL: 21 functions need zero address checks

### Bug 3: Missing Input Validation (HIGH)
Add to process_rewards():
```noir
assert(reward_amount > 0, "Reward must be positive");
assert(total_supply > 0, "Supply cannot be zero");
assert(total_staked > 0, "Staked cannot be zero");
assert(timestamp > storage.last_update_timestamp.read(), "Timestamp must increase");
```

Add to execute_batch_stake():
```noir
let active_validators = ValidatorRegistry::at(registry).get_active_validator_count();
assert(active_validators > 0, "No active validators");
```

### Bug 4: Comment Mismatch (LOW)
File: vault-manager/src/main.nr, line 104
CURRENT: `"Only admin or keeper can execute batch stake"`
FIX: `"Only admin can execute batch stake"` (since code only checks admin)

## ADD TESTS FOR EACH FIX
Add to staking-math-tests/src/main.nr:

```noir
#[test]
fn test_overflow_safe_rate_calculation() {
    // Test with large values that would overflow without protection
    let large_staked: u128 = 0xFFFFFFFFFFFFFFFFFFFFFFFF;
    let large_supply: u128 = 0xFFFFFFFFFFFFFFFFFFFFFFF;
    let rate = calculate_new_rate(large_staked, 0, large_supply);
    assert(rate > 0);  // Should not panic/overflow
}

#[test]
fn test_zero_supply_returns_default_rate() {
    let rate = calculate_new_rate(1000000, 100000, 0);
    assert(rate == 10000);
}
```

## VERIFICATION CHECKLIST (ALL MUST PASS)
- [ ] Overflow protection added to RewardsManager (line 109-110)
- [ ] Zero address checks on all 21 setter functions
- [ ] Input validation on process_rewards()
- [ ] Input validation on execute_batch_stake()
- [ ] Comment mismatch fixed
- [ ] All contracts compile: `~/aztec-bin/nargo compile`
- [ ] Unit tests pass: `~/.nargo/bin/nargo test`
- [ ] New tests added for overflow edge cases
- [ ] New tests added for zero address rejection
- [ ] Multi-step review completed (all 6 perspectives)
- [ ] progress.md updated with honest assessment

## OUTPUT FORMAT
Report back with:
1. Each bug fixed with file:line references
2. Number of setter functions updated (should be 21)
3. Tests added with names
4. Compilation status (all contracts)
5. Test results (all tests)
6. **HONEST ASSESSMENT:** Confidence level in fixes
7. Updated progress.md excerpt
```

---

## PROMPT D: Withdrawal Claiming Agent

**Priority:** HIGH
**Estimated Time:** 6 hours
**Dependencies:** PROMPT A and B complete (token transfers and cross-contract calls)
**Testing Environment:** LOCAL SANDBOX

```text
You are implementing the withdrawal claim functionality.

## CONTEXT
Currently users can REQUEST withdrawals but cannot CLAIM them.
The request is tracked but there's no way to get their AZTEC back.
This is a CRITICAL gap - users' funds are effectively locked.

## MANDATORY PROGRESS TRACKING
1. Update staking/aztec/progress.md after each milestone
2. Be HONEST about what works vs what's stubbed
3. This is HIGH priority - users can't get money back without this

## YOUR TASKS

### Task 1: Add claim_withdrawal() to LiquidStakingCore
File: /home/user/Etc-mono-repo/staking/aztec/contracts/liquid-staking-core/src/main.nr

```noir
#[public]
fn claim_withdrawal(request_id: u64) -> pub u128 {
    let paused = storage.paused.read();
    assert(!paused, "Contract is paused");

    let caller = context.msg_sender();

    // Step 1: Get request from WithdrawalQueue
    let withdrawal_queue = storage.withdrawal_queue.read();
    let request_user = WithdrawalQueue::at(withdrawal_queue).get_request_user(request_id);
    assert(caller == request_user, "Not your withdrawal request");

    // Step 2: Check if claimable (unbonding period passed)
    let current_timestamp = context.timestamp();
    let is_claimable = WithdrawalQueue::at(withdrawal_queue).is_claimable(
        request_id,
        current_timestamp
    );
    assert(is_claimable, "Unbonding period not complete");

    // Step 3: Get amount and mark as claimed
    let aztec_amount = WithdrawalQueue::at(withdrawal_queue).claim_withdrawal(
        request_id,
        current_timestamp
    );

    // Step 4: Transfer AZTEC to user (ACTUAL transfer, not just accounting)
    let aztec_token = storage.aztec_token.read();
    IAztecToken::at(aztec_token).transfer(caller, aztec_amount);

    aztec_amount
}
```

### Task 2: Add get_withdrawal_status() View Function
```noir
#[public]
#[view]
fn get_withdrawal_status(request_id: u64) -> pub (AztecAddress, u128, bool, u64) {
    let withdrawal_queue = storage.withdrawal_queue.read();
    let user = WithdrawalQueue::at(withdrawal_queue).get_request_user(request_id);
    let amount = WithdrawalQueue::at(withdrawal_queue).get_request_amount(request_id);
    let fulfilled = WithdrawalQueue::at(withdrawal_queue).is_request_fulfilled(request_id);
    let time_remaining = WithdrawalQueue::at(withdrawal_queue).time_until_claimable(
        request_id,
        context.timestamp()
    );

    (user, amount, fulfilled, time_remaining)
}
```

### Task 3: Ensure WithdrawalQueue Has Required Functions
Verify these exist in withdrawal-queue/src/main.nr:
- get_request_user(request_id) -> AztecAddress
- get_request_amount(request_id) -> u128
- is_claimable(request_id, current_timestamp) -> bool
- is_request_fulfilled(request_id) -> bool
- time_until_claimable(request_id, current_timestamp) -> u64
- claim_withdrawal(request_id, timestamp) -> u128 (marks as claimed, returns amount)

If any missing, implement them.

### Task 4: Handle Liquidity for Claims
```noir
#[public]
fn ensure_liquidity_for_claims() {
    let caller = context.msg_sender();
    let admin = storage.admin.read();
    assert(caller == admin, "Only admin");

    let withdrawal_queue = storage.withdrawal_queue.read();
    let pending = WithdrawalQueue::at(withdrawal_queue).get_total_pending();

    let aztec_token = storage.aztec_token.read();
    let available = IAztecToken::at(aztec_token).balance_of(context.this_address());

    if available < pending {
        let shortfall = pending - available;
        // Log shortfall for keeper bot to handle
        // In production: trigger unstaking from validators
    }
}
```

## LOCAL-FIRST TESTING (MANDATORY)
1. Start local sandbox: `aztec start --sandbox`
2. Deploy contracts
3. Execute: deposit -> wait -> request_withdrawal -> wait unbonding -> claim
4. Verify user receives ACTUAL AZTEC tokens
5. Check contract balance decreased

## VERIFICATION CHECKLIST (ALL MUST PASS)
- [ ] claim_withdrawal() implemented
- [ ] Verifies caller is request owner
- [ ] Checks unbonding period
- [ ] Transfers AZTEC to user (ACTUAL transfer verified)
- [ ] Updates withdrawal queue state
- [ ] get_withdrawal_status() view function works
- [ ] WithdrawalQueue has all required functions
- [ ] ensure_liquidity_for_claims() implemented
- [ ] Local sandbox full flow test passes
- [ ] Multi-step review completed (all 6 perspectives)
- [ ] progress.md updated with honest assessment

## OUTPUT FORMAT
Report back with:
1. Functions implemented with line numbers
2. WithdrawalQueue functions added/verified
3. Local sandbox test results (full flow)
4. **HONEST ASSESSMENT:** Does claim actually transfer tokens?
5. Blockers or issues found
6. Updated progress.md excerpt
```

---

## PROMPT E: State Unification Agent

**Priority:** HIGH
**Estimated Time:** 4 hours
**Dependencies:** None (but coordinate with other agents)
**Testing Environment:** Unit tests + local sandbox

```text
You are unifying state management across the staking contracts.

## PROBLEM
Three contracts track overlapping state independently:
- LiquidStakingCore: total_deposited, pending_pool, total_staked, exchange_rate
- VaultManager: pending_pool, total_staked (DUPLICATE!)
- RewardsManager: current_exchange_rate (DUPLICATE!)

This causes state divergence and bugs.

## MANDATORY PROGRESS TRACKING
1. Update staking/aztec/progress.md after each change
2. Document which state moved where
3. Be careful - wrong changes break everything

## SOLUTION
1. LiquidStakingCore is authoritative for deposits (total_deposited)
2. VaultManager is authoritative for staking (pending_pool going to validators, total_staked with validators)
3. RewardsManager is authoritative for exchange_rate
4. Each reads from the authoritative source, doesn't duplicate

## YOUR TASKS

### Task 1: Update VaultManager
Remove duplicate state, add read functions:

```noir
// REMOVE these from VaultManager storage (they're in LiquidStakingCore):
// pending_pool: PublicMutable<u128, Context>,  // REMOVE - READ FROM LiquidStakingCore

// KEEP these (VaultManager is authoritative for staking):
// total_staked: PublicMutable<u128, Context>,  // VaultManager knows what's with validators

// ADD interface to read from LiquidStakingCore:
fn get_pending_from_core(&self) -> u128 {
    let core = storage.liquid_staking_core.read();
    LiquidStakingCore::at(core).get_pending_pool()
}
```

### Task 2: Update LiquidStakingCore
Read exchange_rate from RewardsManager instead of storing locally:

```noir
// ADD helper function:
fn get_current_exchange_rate(&self) -> u64 {
    let rewards_manager = storage.rewards_manager.read();
    if rewards_manager == AztecAddress::zero() {
        10000 // Default 1:1 if not set
    } else {
        RewardsManager::at(rewards_manager).get_current_exchange_rate()
    }
}

// REMOVE: storage.exchange_rate (use get_current_exchange_rate() instead)
// REMOVE: update_exchange_rate() function (RewardsManager handles this)
```

### Task 3: Document Authoritative Sources
Add comments to each contract:

```noir
// LiquidStakingCore:
// === STATE AUTHORITY ===
// This contract is authoritative for:
// - total_deposited: How much AZTEC users have deposited
// - pending_pool: Deposits waiting to be staked
//
// This contract reads from:
// - RewardsManager: exchange_rate
// - VaultManager: total_staked (with validators)

// VaultManager:
// === STATE AUTHORITY ===
// This contract is authoritative for:
// - total_staked: AZTEC currently staked with validators
// - next_validator_index: Round-robin selection state
//
// This contract reads from:
// - LiquidStakingCore: pending_pool (to know what to stake)

// RewardsManager:
// === STATE AUTHORITY ===
// This contract is authoritative for:
// - current_exchange_rate: stAZTEC to AZTEC conversion rate
// - accumulated_fees: Protocol fees to claim
//
// This contract writes to:
// - StakedAztecToken: update_exchange_rate() after rewards
```

### Task 4: Update Tests
Ensure tests reflect unified state:

```noir
#[test]
fn test_state_authority_deposit() {
    // LiquidStakingCore should update its pending_pool
    // VaultManager should READ from LiquidStakingCore, not track its own
}
```

## VERIFICATION CHECKLIST (ALL MUST PASS)
- [ ] VaultManager doesn't duplicate pending_pool
- [ ] LiquidStakingCore reads rate from RewardsManager
- [ ] All state reads go to authoritative source
- [ ] No circular dependencies (A reads B, B reads A)
- [ ] State authority documented in each contract
- [ ] All contracts compile
- [ ] Unit tests pass
- [ ] Local sandbox test passes with unified state
- [ ] Multi-step review completed (all 6 perspectives)
- [ ] progress.md updated with honest assessment

## OUTPUT FORMAT
Report back with:
1. State variables removed from each contract
2. Read-only getters added
3. State authority documentation added
4. **HONEST ASSESSMENT:** Is state now truly unified?
5. Potential circular dependency risks
6. Updated progress.md excerpt
```

---

## PROMPT F: Events & Logging Agent

**Priority:** MEDIUM
**Estimated Time:** 4 hours
**Dependencies:** None
**Testing Environment:** Local sandbox

```text
You are adding event emission to all staking contracts.

## CONTEXT
Currently no events are emitted. This makes it impossible to:
- Track user activity on-chain
- Build indexers/explorers
- Debug production issues
- Meet audit requirements

## MANDATORY PROGRESS TRACKING
1. Update staking/aztec/progress.md after each contract updated
2. List all events added per contract

## AZTEC EVENT PATTERN
IMPORTANT: Check current Aztec docs for event syntax:
https://docs.aztec.network/developers/contracts/events

Example pattern (verify with docs):
```noir
#[event]
struct Deposit {
    user: AztecAddress,
    aztec_amount: u128,
    st_aztec_amount: u128,
    timestamp: u64
}

// In function:
context.emit_log(Deposit {
    user: caller,
    aztec_amount: amount,
    st_aztec_amount: st_aztec_amount,
    timestamp: context.timestamp()
});
```

## EVENTS TO ADD

### LiquidStakingCore (7 events)
- Deposit(user, aztec_amount, st_aztec_amount, timestamp)
- WithdrawalRequested(user, request_id, st_aztec_amount, aztec_amount, timestamp)
- WithdrawalClaimed(user, request_id, aztec_amount, timestamp)
- BatchStakeTriggered(amount, validator_index, timestamp)
- ContractPaused(admin, timestamp)
- ContractUnpaused(admin, timestamp)
- AdminChanged(old_admin, new_admin, timestamp)

### VaultManager (3 events)
- DepositRecorded(amount, new_pending, timestamp)
- BatchStakeExecuted(amount, validator_index, timestamp)
- ThresholdChanged(old_threshold, new_threshold, timestamp)

### RewardsManager (4 events)
- RewardsProcessed(reward_amount, protocol_fee, net_rewards, new_rate, timestamp)
- ProtocolFeesClaimed(recipient, amount, timestamp)
- ExchangeRateUpdated(old_rate, new_rate, timestamp)
- FeeRateChanged(old_bps, new_bps, timestamp)

### StakedAztecToken (4 events)
- Transfer(from, to, amount)
- Mint(to, amount, minter)
- Burn(from, amount, burner)
- ExchangeRateUpdated(old_rate, new_rate)

### WithdrawalQueue (3 events)
- RequestAdded(request_id, user, shares, amount, timestamp)
- RequestClaimed(request_id, user, amount, timestamp)
- UnbondingPeriodChanged(old_period, new_period)

### ValidatorRegistry (5 events)
- ValidatorAdded(validator, timestamp)
- ValidatorDeactivated(validator, timestamp)
- ValidatorReactivated(validator, timestamp)
- StakeRecorded(validator, amount, total_stake)
- SlashRecorded(validator, amount, slash_count)

TOTAL: 26 events across 6 contracts

## VERIFICATION CHECKLIST (ALL MUST PASS)
- [ ] Events follow ACTUAL Aztec syntax (verified with docs)
- [ ] All 26 events defined
- [ ] All state-changing functions emit events
- [ ] Events include relevant data (user, amounts, timestamps)
- [ ] All contracts compile with events
- [ ] Local sandbox emits events (verified with logs)
- [ ] Multi-step review completed
- [ ] progress.md updated with event count per contract

## OUTPUT FORMAT
Report back with:
1. Events added per contract (count)
2. Aztec event syntax verified (Y/N with docs link)
3. Compilation status
4. Local sandbox event emission verified
5. **HONEST ASSESSMENT:** All events working or any issues?
6. Updated progress.md excerpt
```

---

## Remaining Agent Prompts (Summary)

### PROMPT G: Validator Selection (6 hours)
Implement actual round-robin selection in VaultManager with ValidatorRegistry integration.
- Tracks: next_validator_index
- Skips: inactive validators
- Distributes: stake fairly

### PROMPT H: Emergency Functions (4 hours)
Add emergency withdrawal, emergency pause per function, migration mechanism.
- Emergency pause per function (not just global)
- Emergency withdrawal for admin
- Migration/upgrade mechanism

### PROMPT I: View Functions (3 hours)
Add get_user_effective_balance(), calculate_tvl(), calculate_apy(), estimate_rewards().
- Preview functions for UI
- APY calculation from historical data
- Effective balance (including pending rewards)

### PROMPT J: Integration Tests (8 hours)
Write TASK-201 through TASK-204 using Aztec testing framework.
- Full deposit flow integration test
- Withdrawal flow integration test
- Staking batch trigger test
- Fuzz tests for StakedAztecToken

---

## Coordination Protocol

### Handoff Between Agents

When completing work, update these files:
1. **progress.md** - Update completion status with honest assessment
2. **TASKS.md** - Mark completed tasks with date
3. **AGENT_HANDOFF_PHASE2.md** - Update if status changed

### Conflict Resolution

If two agents modify the same file:
1. First agent commits and pushes
2. Second agent pulls, merges, resolves conflicts
3. Both update progress.md with status

### Definition of Done

A deliverable is TRULY complete when:
1. All checklist items pass
2. Multi-step review completed (ALL 6 perspectives)
3. Tests pass (unit AND local sandbox)
4. Documentation updated
5. progress.md updated with HONEST assessment
6. No "accounting only" stubs remain - ACTUAL functionality works

### Honest Self-Assessment Requirement

After EACH task, agent MUST answer:
1. "Does this ACTUALLY work, or just track that it should work?"
2. "Can a user REALLY deposit/withdraw, or just see numbers change?"
3. "What would break if deployed to mainnet tomorrow?"

---

## Agent Execution Timeline

**Day 1:**
- Start: Agent A (Token Integration) - CRITICAL PATH
- Parallel: Agent C (Security Fixes) - No dependencies

**Day 2:**
- After A: Agent B (Cross-Contract) starts
- Continue: Agent C completes
- Parallel: Agent F (Events) starts

**Day 3:**
- After B: Agent D (Withdrawal) starts
- Parallel: Agent E (State Unification) starts

**Day 4-5:**
- After D, E: Agents G, H, I, J (remaining work)
- Integration testing begins

**Day 6+:**
- Full integration tests (TASK-201-204)
- Devnet deployment (only after all local tests pass)

---

*Last updated: 2025-12-27*
*Quality: Enhanced with multi-pass review, progress tracking, honest assessment requirements*
