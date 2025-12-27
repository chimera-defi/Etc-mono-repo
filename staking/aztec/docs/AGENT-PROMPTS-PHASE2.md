# Phase 2 Agent Prompts: Contract Integration & Production Readiness

**Created:** 2025-12-27
**Purpose:** Parallelizable prompts to complete the Aztec staking contracts
**Prerequisite:** Read AGENT_HANDOFF_PHASE2.md first for context

---

## Critical Context for All Agents

**Current State:** Contracts are accounting stubs - they track state but don't actually transfer tokens or call other contracts.

**What's Missing:**
1. Token transfers (AZTEC in, stAZTEC out)
2. Cross-contract calls (contracts don't talk to each other)
3. Withdrawal claiming (users can request but not claim)
4. Overflow protection in RewardsManager

**Priority:** TASK-P2-001 through P2-005 are CRITICAL and block all other work.

---

## Parallelization Strategy

```
WEEK 1 (Sequential - Critical Path):
├── Agent A: Token Integration (P2-001) - BLOCKS EVERYTHING
├── After A completes:
│   ├── Agent B: Cross-Contract Calls (P2-002)
│   └── Agent C: Overflow Fix + Validation (P2-003, P2-006, P2-008)

WEEK 2 (Can Parallelize):
├── Agent D: Withdrawal Claiming (P2-004)
├── Agent E: State Unification (P2-005)
├── Agent F: Events & Logging (P2-007)
└── Agent G: Validator Selection (P2-009)

WEEK 3 (Polish):
├── Agent H: Emergency Functions (P2-010)
├── Agent I: View Functions (P2-011)
└── Agent J: Integration Tests (TASK-201-204)
```

---

## PROMPT A: Token Integration Agent (CRITICAL - DO FIRST)

**Priority:** CRITICAL - Blocks all other work
**Estimated Time:** 8-12 hours
**Dependencies:** None

```text
You are implementing token transfer integration for the Aztec liquid staking protocol.

## CRITICAL CONTEXT
The LiquidStakingCore contract currently DOES NOT transfer any tokens. It only tracks
accounting. Users cannot actually deposit or withdraw - the functions just update numbers.

Your job is to implement REAL token transfers.

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

### Task 2: Update deposit() Function
Current (BROKEN - line 112-144):
```noir
fn deposit(amount: u128) -> pub u128 {
    // ... accounting only, no actual transfer
    st_aztec_amount
}
```

Fixed:
```noir
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

### Task 3: Update request_withdrawal() Function
Current (BROKEN - line 147-176):
```noir
fn request_withdrawal(st_aztec_amount: u128) -> pub u64 {
    // ... no token burn, no queue addition
}
```

Fixed:
```noir
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
    let current_timestamp = context.timestamp(); // Or pass as parameter
    let request_id = WithdrawalQueue::at(withdrawal_queue).add_request(
        caller,
        st_aztec_amount,
        aztec_amount,
        current_timestamp
    );

    request_id
}
```

### Task 4: Add aztec_token to Storage
Add to storage struct:
```noir
aztec_token: PublicMutable<AztecAddress, Context>,
```

Add setter:
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

## VERIFICATION CHECKLIST
- [ ] aztec_token storage variable added
- [ ] set_aztec_token() function added with zero check
- [ ] deposit() calls transfer_from on AZTEC token
- [ ] deposit() calls mint on StakedAztecToken
- [ ] deposit() calls record_deposit on VaultManager
- [ ] request_withdrawal() calls burn on StakedAztecToken
- [ ] request_withdrawal() calls add_request on WithdrawalQueue
- [ ] Contract compiles with aztec-nargo
- [ ] Unit tests added for new paths

## OUTPUT FORMAT
Report back with:
1. Functions modified and line numbers
2. New functions/interfaces added
3. Compilation status
4. Test results
5. Any issues or blockers encountered
```

---

## PROMPT B: Cross-Contract Integration Agent

**Priority:** CRITICAL
**Estimated Time:** 10-16 hours
**Dependencies:** PROMPT A complete

```text
You are implementing cross-contract communication for the Aztec staking protocol.

## CONTEXT
After PROMPT A, the contracts have token transfer code but need proper cross-contract
call patterns following Aztec conventions.

## AZTEC CROSS-CONTRACT CALL PATTERNS
In Aztec, cross-contract calls use this pattern:
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
        // Call the function
        context.call_public_function(
            self.address,
            compute_selector("some_function(u128)"),
            [arg as Field]
        );
    }
}
```

## YOUR TASKS

### Task 1: Review Aztec Documentation
Read: https://docs.aztec.network/developers/contracts/cross_contract_calls
Understand the actual cross-contract call pattern for the current Aztec version.

### Task 2: Implement Contract Interfaces
Create proper interfaces for all contracts:

File: /home/user/Etc-mono-repo/staking/aztec/contracts/liquid-staking-core/src/interfaces.nr

```noir
// StakedAztecToken interface
struct StakedAztecTokenInterface {
    address: AztecAddress
}

impl StakedAztecTokenInterface {
    fn at(address: AztecAddress) -> Self { Self { address } }

    fn mint(&self, context: &mut PublicContext, to: AztecAddress, amount: u128) {
        // Implement cross-contract call
    }

    fn burn(&self, context: &mut PublicContext, from: AztecAddress, amount: u128) {
        // Implement cross-contract call
    }

    fn get_exchange_rate(&self, context: &PublicContext) -> u64 {
        // Implement cross-contract call
    }
}

// Add similar for:
// - WithdrawalQueueInterface
// - VaultManagerInterface
// - ValidatorRegistryInterface
// - RewardsManagerInterface
```

### Task 3: Wire Up All Contract Calls
Update each contract to properly call others:

**LiquidStakingCore calls:**
- StakedAztecToken.mint() on deposit
- StakedAztecToken.burn() on withdrawal
- VaultManager.record_deposit() on deposit
- WithdrawalQueue.add_request() on withdrawal
- RewardsManager.get_exchange_rate() for rate lookups

**VaultManager calls:**
- ValidatorRegistry.get_active_validators() for selection
- ValidatorRegistry.record_stake() after staking

**RewardsManager calls:**
- StakedAztecToken.update_exchange_rate() after rewards

### Task 4: Test Cross-Contract Flow
Create integration test that:
1. Deploys all 7 contracts
2. Sets all contract addresses on each other
3. Executes: deposit -> check balances -> request withdrawal -> verify queue

## VERIFICATION CHECKLIST
- [ ] Interfaces follow Aztec patterns (check docs!)
- [ ] All cross-contract calls compile
- [ ] Bidirectional calls work (A calls B, B calls A)
- [ ] State updates propagate correctly
- [ ] Error handling for failed calls

## IMPORTANT
Aztec's cross-contract call syntax may differ from examples above.
ALWAYS check current Aztec documentation before implementing.
If pattern differs, adapt accordingly and document the correct pattern.
```

---

## PROMPT C: Security Fixes Agent

**Priority:** CRITICAL
**Estimated Time:** 4-6 hours
**Dependencies:** None (can run in parallel with A)

```text
You are fixing critical security issues in the Aztec staking contracts.

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
// Safe calculation that won't overflow
fn process_rewards(...) -> pub u64 {
    // ... existing code ...

    // Overflow-safe rate calculation
    let new_rate = if total_supply == 0 {
        10000
    } else {
        // Split calculation to prevent overflow
        // rate = (total_value / total_supply) * 10000
        // But we need precision, so:
        // rate = (total_value * 10000) / total_supply
        // Check for overflow first
        let max_safe_value = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF / 10000;
        let total_value = total_staked + net_rewards;

        if total_value > max_safe_value {
            // Use lower precision to avoid overflow
            let scaled_value = total_value / 1000; // Lose 3 digits precision
            let scaled_supply = total_supply / 1000;
            if scaled_supply == 0 {
                10000
            } else {
                ((scaled_value * 10000) / scaled_supply) as u64
            }
        } else {
            ((total_value * 10000) / total_supply) as u64
        }
    };

    // ... rest of function
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

Files to update:
- liquid-staking-core/src/main.nr (7 setter functions)
- vault-manager/src/main.nr (3 setter functions)
- rewards-manager/src/main.nr (4 setter functions)
- staked-aztec-token/src/main.nr (3 setter functions)
- withdrawal-queue/src/main.nr (2 setter functions)
- validator-registry/src/main.nr (2 setter functions)

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

## VERIFICATION CHECKLIST
- [ ] Overflow protection added to RewardsManager
- [ ] Zero address checks on all 21 setter functions
- [ ] Input validation on process_rewards()
- [ ] Input validation on execute_batch_stake()
- [ ] All contracts compile
- [ ] Add tests for overflow edge cases
- [ ] Add tests for zero address rejection
```

---

## PROMPT D: Withdrawal Claiming Agent

**Priority:** HIGH
**Estimated Time:** 6 hours
**Dependencies:** PROMPT A, B

```text
You are implementing the withdrawal claim functionality.

## CONTEXT
Currently users can REQUEST withdrawals but cannot CLAIM them.
The request is tracked but there's no way to get their AZTEC back.

## YOUR TASKS

### Task 1: Add claim_withdrawal() to LiquidStakingCore
File: /home/user/Etc-mono-repo/staking/aztec/contracts/liquid-staking-core/src/main.nr

Add function:
```noir
#[public]
fn claim_withdrawal(request_id: u64) -> pub u128 {
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

    // Step 4: Transfer AZTEC to user
    let aztec_token = storage.aztec_token.read();
    IAztecToken::at(aztec_token).transfer(caller, aztec_amount);

    // Step 5: Emit event (if events implemented)
    // emit WithdrawalClaimed { user: caller, request_id, amount: aztec_amount };

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

### Task 3: Handle Liquidity for Claims
When users claim, we need AZTEC available. Add liquidity management:

```noir
#[public]
fn ensure_liquidity_for_claims() {
    let caller = context.msg_sender();
    let admin = storage.admin.read();
    assert(caller == admin, "Only admin");

    // Check pending withdrawals
    let withdrawal_queue = storage.withdrawal_queue.read();
    let pending = WithdrawalQueue::at(withdrawal_queue).get_total_pending();

    // Check available liquidity
    let aztec_token = storage.aztec_token.read();
    let available = IAztecToken::at(aztec_token).balance_of(context.this_address());

    // If not enough, need to unstake from validators
    if available < pending {
        let shortfall = pending - available;
        // Trigger unstaking (implementation depends on Aztec staking mechanism)
        // This may require waiting for unbonding
    }
}
```

## VERIFICATION CHECKLIST
- [ ] claim_withdrawal() implemented
- [ ] Verifies caller is request owner
- [ ] Checks unbonding period
- [ ] Transfers AZTEC to user
- [ ] Updates withdrawal queue state
- [ ] get_withdrawal_status() view function works
- [ ] Tests for full withdrawal flow
```

---

## PROMPT E: State Unification Agent

**Priority:** HIGH
**Estimated Time:** 4 hours
**Dependencies:** None

```text
You are unifying state management across the staking contracts.

## PROBLEM
Three contracts track overlapping state independently:
- LiquidStakingCore: total_deposited, pending_pool, total_staked, exchange_rate
- VaultManager: pending_pool, total_staked
- RewardsManager: current_exchange_rate

This causes state divergence.

## SOLUTION
1. LiquidStakingCore is authoritative for deposits (total_deposited)
2. VaultManager is authoritative for staking (pending_pool going to validators, total_staked with validators)
3. RewardsManager is authoritative for exchange_rate
4. Each reads from the authoritative source, doesn't duplicate

## YOUR TASKS

### Task 1: Update VaultManager
Remove duplicate state, add read functions:

```noir
// REMOVE these from VaultManager storage:
// pending_pool: PublicMutable<u128, Context>,  // READ FROM LiquidStakingCore

// KEEP:
// total_staked: PublicMutable<u128, Context>,  // Only VaultManager knows what's with validators

// ADD interface to read from LiquidStakingCore:
fn get_pending_from_core() -> u128 {
    let core = storage.liquid_staking_core.read();
    LiquidStakingCore::at(core).get_pending_pool()
}
```

### Task 2: Update LiquidStakingCore
Read exchange_rate from RewardsManager instead of storing locally:

```noir
// CHANGE deposit() and request_withdrawal() to:
fn get_current_exchange_rate() -> u64 {
    let rewards_manager = storage.rewards_manager.read();
    if rewards_manager == AztecAddress::zero() {
        10000 // Default if not set
    } else {
        RewardsManager::at(rewards_manager).get_current_exchange_rate()
    }
}

// REMOVE local exchange_rate updates
// REMOVE update_exchange_rate() function (RewardsManager handles this)
```

### Task 3: Document Authoritative Sources
Add comments to each contract:

```noir
// === STATE AUTHORITY ===
// This contract is authoritative for:
// - total_deposited: How much AZTEC users have deposited
// - pending_pool: Deposits waiting to be staked
//
// This contract reads from:
// - RewardsManager: exchange_rate
// - VaultManager: total_staked (with validators)
```

## VERIFICATION CHECKLIST
- [ ] VaultManager doesn't duplicate pending_pool
- [ ] LiquidStakingCore reads rate from RewardsManager
- [ ] All state reads go to authoritative source
- [ ] No circular dependencies
- [ ] Tests pass with unified state
```

---

## PROMPT F: Events & Logging Agent

**Priority:** MEDIUM
**Estimated Time:** 4 hours
**Dependencies:** None

```text
You are adding event emission to all staking contracts.

## AZTEC EVENT PATTERN
Check Aztec docs for current event syntax. Example pattern:
```noir
// In contract:
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

### LiquidStakingCore
- Deposit(user, aztec_amount, st_aztec_amount, timestamp)
- WithdrawalRequested(user, request_id, st_aztec_amount, aztec_amount, timestamp)
- WithdrawalClaimed(user, request_id, aztec_amount, timestamp)
- BatchStakeTriggered(amount, validator_index, timestamp)
- ContractPaused(admin, timestamp)
- ContractUnpaused(admin, timestamp)
- AdminChanged(old_admin, new_admin, timestamp)

### VaultManager
- DepositRecorded(amount, new_pending, timestamp)
- BatchStakeExecuted(amount, validator_index, timestamp)
- ThresholdChanged(old_threshold, new_threshold, timestamp)

### RewardsManager
- RewardsProcessed(reward_amount, protocol_fee, net_rewards, new_rate, timestamp)
- ProtocolFeesClaimed(recipient, amount, timestamp)
- ExchangeRateUpdated(old_rate, new_rate, timestamp)
- FeeRateChanged(old_bps, new_bps, timestamp)

### StakedAztecToken
- Transfer(from, to, amount)
- Mint(to, amount, minter)
- Burn(from, amount, burner)
- ExchangeRateUpdated(old_rate, new_rate)

### WithdrawalQueue
- RequestAdded(request_id, user, shares, amount, timestamp)
- RequestClaimed(request_id, user, amount, timestamp)
- UnbondingPeriodChanged(old_period, new_period)

### ValidatorRegistry
- ValidatorAdded(validator, timestamp)
- ValidatorDeactivated(validator, timestamp)
- ValidatorReactivated(validator, timestamp)
- StakeRecorded(validator, amount, total_stake)
- SlashRecorded(validator, amount, slash_count)

## VERIFICATION CHECKLIST
- [ ] Events follow Aztec syntax (check docs!)
- [ ] All state-changing functions emit events
- [ ] Events include relevant data
- [ ] Events compile correctly
- [ ] Test event emission
```

---

## Remaining Agent Prompts

### PROMPT G: Validator Selection (6 hours)
Implement actual round-robin selection in VaultManager with ValidatorRegistry integration.

### PROMPT H: Emergency Functions (4 hours)
Add emergency withdrawal, emergency pause per function, migration mechanism.

### PROMPT I: View Functions (3 hours)
Add get_user_effective_balance(), calculate_tvl(), calculate_apy(), estimate_rewards().

### PROMPT J: Integration Tests (8 hours)
Write TASK-201 through TASK-204 using Aztec testing framework.

---

## Agent Execution Order

**Critical Path (Sequential):**
```
Day 1: PROMPT A (Token Integration) - MUST COMPLETE FIRST
Day 2: PROMPT B (Cross-Contract) + PROMPT C (Security Fixes) - Parallel
Day 3: PROMPT D (Withdrawal) + PROMPT E (State) - After B completes
```

**Parallel Work (Days 2-4):**
```
PROMPT C: Security Fixes (no dependencies)
PROMPT F: Events (no dependencies)
PROMPT E: State Unification (no dependencies)
```

**Final Phase (Days 4-5):**
```
PROMPT G, H, I, J after core integration complete
```

---

*Last updated: 2025-12-27*
