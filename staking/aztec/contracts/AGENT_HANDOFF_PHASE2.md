# Agent Handoff: Phase 2 - Contract Integration & Production Readiness

**Created:** 2025-12-27
**Status:** Phase 1 Complete (Accounting Stubs) | Phase 2 Required (Real Implementation)
**Honest Assessment:** Contracts are 40-60% complete - structure is sound but core functionality is stubbed

---

## Critical Self-Assessment

### What Was Actually Accomplished (Phase 1)
The contracts created are **well-structured accounting prototypes** that:
- Track state variables correctly
- Have proper access control patterns
- Follow Aztec/Noir syntax correctly
- Have 45 unit tests for math logic

### What Was NOT Accomplished (Honest Gaps)
The contracts **DO NOT**:
- Actually transfer AZTEC tokens
- Mint or burn stAZTEC tokens
- Call other contracts (all cross-contract calls are stubbed)
- Allow users to claim withdrawals
- Distribute rewards to users
- Interact with validators

### Severity of Gaps

| Issue | Severity | Impact |
|-------|----------|--------|
| No token transfers | CRITICAL | Deposits don't move money |
| No cross-contract calls | CRITICAL | System doesn't work together |
| Integer overflow in RewardsManager | CRITICAL | Could corrupt exchange rate |
| Duplicate state across contracts | HIGH | State divergence |
| No zero address validation | HIGH | Could brick contracts |
| Missing withdrawal claim | HIGH | Users can't get money back |
| No events/logging | MEDIUM | Can't track activity |
| No emergency functions | MEDIUM | No recovery mechanism |

---

## Current Contract Status

### LiquidStakingCore.nr (313 lines, 27 functions)
**Completion: 50%** - Accounting works, core functionality stubbed

| Function | Status | Notes |
|----------|--------|-------|
| constructor() | COMPLETE | Initializes state correctly |
| set_*() admin functions | COMPLETE | Access control works |
| deposit() | **STUB** | Tracks accounting, no token transfer |
| request_withdrawal() | **STUB** | Tracks request, no token burn |
| trigger_batch_stake() | **STUB** | Moves numbers, no validator interaction |
| View functions | COMPLETE | All read correctly |

**Missing:**
- Token transfer integration (AZTEC in)
- stAZTEC mint call
- WithdrawalQueue.add_request() call
- VaultManager.record_deposit() call
- claim_withdrawal() function entirely missing
- Events for all state changes

### VaultManager.nr (161 lines, 14 functions)
**Completion: 40%** - Basic structure, no validator logic

| Function | Status | Notes |
|----------|--------|-------|
| constructor() | COMPLETE | |
| set_*() functions | COMPLETE | |
| record_deposit() | PARTIAL | Tracking only, no coordination |
| execute_batch_stake() | **STUB** | No validator distribution |
| View functions | COMPLETE | |

**Missing:**
- Validator selection algorithm (round-robin not implemented)
- Actual staking to validators
- Unstaking functionality
- Per-validator balance tracking
- Emergency withdrawal

### RewardsManager.nr (165 lines, 13 functions)
**Completion: 45%** - Math works, integration missing

| Function | Status | Notes |
|----------|--------|-------|
| constructor() | COMPLETE | |
| set_*() functions | COMPLETE | |
| process_rewards() | **HAS BUG** | Integer overflow risk on line 110 |
| claim_protocol_fees() | PARTIAL | Returns amount, no transfer |
| View functions | COMPLETE | |

**Missing:**
- Actual fee token transfer
- User rewards distribution
- Integration with StakedAztecToken for rate updates
- Overflow protection

---

## Phase 2 Tasks (Ordered by Priority)

### CRITICAL - Must Fix Before Any Testing

#### TASK-P2-001: Implement Token Transfer Integration
**Estimated Time:** 8-12 hours
**Blocking:** Everything else

Create actual token transfer calls in LiquidStakingCore:
```noir
// In deposit():
// 1. Call AZTEC token's transferFrom(caller, self, amount)
// 2. Call staked_aztec_token.mint(caller, st_aztec_amount)

// In request_withdrawal():
// 1. Call staked_aztec_token.burn(caller, st_aztec_amount)
// 2. Call withdrawal_queue.add_request(...)
```

**Deliverables:**
- [ ] AZTEC token interface defined
- [ ] Transfer calls implemented in deposit()
- [ ] Burn calls implemented in request_withdrawal()
- [ ] Integration tests passing

---

#### TASK-P2-002: Implement Cross-Contract Calls
**Estimated Time:** 10-16 hours
**Depends On:** TASK-P2-001

Wire up all contract interactions:

| Caller | Target | Function | When |
|--------|--------|----------|------|
| LiquidStakingCore | StakedAztecToken | mint() | On deposit |
| LiquidStakingCore | StakedAztecToken | burn() | On withdrawal request |
| LiquidStakingCore | VaultManager | record_deposit() | On deposit |
| LiquidStakingCore | WithdrawalQueue | add_request() | On withdrawal request |
| LiquidStakingCore | RewardsManager | get_exchange_rate() | On deposit/withdrawal |
| VaultManager | ValidatorRegistry | get_active_validators() | On batch stake |
| RewardsManager | StakedAztecToken | update_exchange_rate() | On rewards processing |

**Deliverables:**
- [ ] Contract interfaces defined for all targets
- [ ] Cross-contract calls implemented
- [ ] State synchronization verified
- [ ] Integration tests for full flows

---

#### TASK-P2-003: Fix Integer Overflow in RewardsManager
**Estimated Time:** 2 hours
**Severity:** CRITICAL

Fix line 110 in rewards-manager/src/main.nr:
```noir
// CURRENT (BUGGY):
let total_value = total_staked + net_rewards;
((total_value * 10000) / total_supply) as u64

// FIXED:
// Option 1: Reorder to prevent overflow
let rate_scaled = (total_staked / total_supply) * 10000;
let reward_contribution = (net_rewards * 10000) / total_supply;
(rate_scaled + reward_contribution) as u64

// Option 2: Check for overflow first
assert(total_value < (u128::MAX / 10000), "Overflow would occur");
```

**Deliverables:**
- [ ] Overflow-safe calculation implemented
- [ ] Edge case tests added
- [ ] Fuzz tests for large values

---

#### TASK-P2-004: Implement Withdrawal Claiming
**Estimated Time:** 6 hours
**Blocking:** Users can't get their money

Add to LiquidStakingCore:
```noir
#[public]
fn claim_withdrawal(request_id: u64) -> pub u128 {
    // 1. Verify caller owns this request
    // 2. Check unbonding period passed (call WithdrawalQueue)
    // 3. Transfer AZTEC to caller
    // 4. Mark request as claimed
    // 5. Emit event
}
```

**Deliverables:**
- [ ] claim_withdrawal() function implemented
- [ ] WithdrawalQueue integration working
- [ ] AZTEC transfer on claim
- [ ] Tests for claim flow

---

#### TASK-P2-005: Unify State Management
**Estimated Time:** 4 hours
**Severity:** HIGH

Eliminate duplicate state tracking:

**Current Problem:**
- LiquidStakingCore tracks: total_deposited, pending_pool, total_staked, exchange_rate
- VaultManager tracks: pending_pool, total_staked
- RewardsManager tracks: current_exchange_rate

**Solution:**
1. LiquidStakingCore is the single source of truth for deposits
2. VaultManager reads from LiquidStakingCore, doesn't duplicate
3. RewardsManager is authoritative for exchange_rate
4. LiquidStakingCore reads rate from RewardsManager

**Deliverables:**
- [ ] Remove duplicate state from VaultManager
- [ ] Add read-only getters for cross-contract queries
- [ ] Update LiquidStakingCore to read rate from RewardsManager
- [ ] Tests verifying state consistency

---

### HIGH Priority - Required for Testnet

#### TASK-P2-006: Add Zero Address Validation
**Estimated Time:** 2 hours

Add to all setter functions:
```noir
fn set_staked_aztec_token(address: AztecAddress) {
    assert(address != AztecAddress::zero(), "Cannot set zero address");
    // ... rest of function
}
```

**Files to update:**
- liquid-staking-core/src/main.nr (6 functions)
- vault-manager/src/main.nr (3 functions)
- rewards-manager/src/main.nr (4 functions)

---

#### TASK-P2-007: Add Event Emission
**Estimated Time:** 4 hours

Define and emit events for:
- Deposit(user, aztec_amount, st_aztec_amount)
- WithdrawalRequested(user, request_id, amount)
- WithdrawalClaimed(user, request_id, amount)
- BatchStaked(validator, amount)
- RewardsProcessed(amount, new_rate)
- FeesClaimed(recipient, amount)
- ExchangeRateUpdated(old_rate, new_rate)

---

#### TASK-P2-008: Add Input Validation
**Estimated Time:** 3 hours

Add validation to all public functions:
```noir
// process_rewards()
assert(reward_amount > 0, "Reward amount must be positive");
assert(total_supply > 0, "Total supply cannot be zero");
assert(timestamp > storage.last_update_timestamp.read(), "Timestamp must increase");
```

---

#### TASK-P2-009: Implement Validator Selection
**Estimated Time:** 6 hours

In VaultManager, implement actual round-robin:
```noir
fn select_next_validator() -> pub AztecAddress {
    let registry = storage.validator_registry.read();
    let active_count = ValidatorRegistry::at(registry).get_active_validator_count();
    let current_index = storage.next_validator_index.read();

    // Find next active validator
    let next_index = (current_index + 1) % active_count;
    storage.next_validator_index.write(next_index);

    ValidatorRegistry::at(registry).get_validator_at(next_index)
}
```

---

### MEDIUM Priority - Required for Production

#### TASK-P2-010: Add Emergency Functions
- Emergency pause (already exists but not fully utilized)
- Emergency withdrawal for admin
- Emergency fee claim if recipient compromised
- Migration/upgrade mechanism

#### TASK-P2-011: Add Missing View Functions
- get_user_effective_balance()
- calculate_current_tvl()
- get_withdrawal_request_status()
- calculate_apy()
- estimate_rewards()

#### TASK-P2-012: Add Slippage Protection
- Max exchange rate change per update
- Min/max deposit amounts
- Rate freshness checks

---

## Remaining Tasks from TASKS.md

### Phase 3: Integration Testing (Not Started)
- TASK-201: Full Deposit Flow Integration Test
- TASK-202: Withdrawal Flow Integration Test
- TASK-203: Staking Batch Trigger Test
- TASK-204: Fuzz Tests for StakedAztecToken

### Phase 4: Bot Infrastructure (Not Started)
- TASK-301-302: Staking Keeper Bot
- TASK-303: Rewards Keeper Bot
- TASK-304: Withdrawal Keeper Bot
- TASK-305: Monitoring Bot
- TASK-306: Kubernetes Deployment

### Phase 5: Security (Not Started)
- TASK-401: Internal Security Review
- TASK-402: Audit Documentation
- TASK-403: Bug Bounty Program

### Phase 6: Deployment (Not Started)
- TASK-501-504: Mainnet deployment and launch

---

## Testing Requirements Before Handoff

Before moving to Phase 3, verify:

1. **Unit Tests (Currently 45)**
   ```bash
   cd staking/aztec/contracts/staking-math-tests
   nargo test
   # Should pass all 45 tests
   ```

2. **Compilation (All 7 contracts)**
   ```bash
   # For each contract:
   cp -r staking/aztec/contracts/<contract> ~/<contract>
   cd ~/<contract> && ~/aztec-bin/nargo compile
   # Should produce valid JSON artifact
   ```

3. **Integration Test (Manual)**
   - Deploy all contracts to local sandbox
   - Set contract addresses on each other
   - Execute deposit -> batch stake -> rewards -> withdrawal flow
   - Verify all state updates correctly

---

## Environment Setup

```bash
# Install Aztec tooling
bash -i <(curl -s install.aztec.network)

# Verify nargo
~/.nargo/bin/nargo --version

# Extract aztec-nargo
docker create --name extract-nargo aztecprotocol/aztec:latest
docker cp extract-nargo:/usr/src/noir/noir-repo/target/release/nargo ~/aztec-bin/
docker rm extract-nargo

# Start local sandbox
aztec start --sandbox

# Run tests
cd staking/aztec/contracts/staking-math-tests
~/.nargo/bin/nargo test
```

---

## Files Summary

| File | Lines | Functions | Completion |
|------|-------|-----------|------------|
| liquid-staking-core/src/main.nr | 313 | 27 | 50% |
| vault-manager/src/main.nr | 161 | 14 | 40% |
| rewards-manager/src/main.nr | 165 | 13 | 45% |
| staked-aztec-token/src/main.nr | 157 | 16 | 80% |
| withdrawal-queue/src/main.nr | 225 | 19 | 75% |
| validator-registry/src/main.nr | 264 | 23 | 70% |
| aztec-staking-pool/src/main.nr | 260 | 19 | 85% |
| staking-math-tests/src/main.nr | 599 | 45 tests | N/A |

**Overall Estimate:** 55% complete for production readiness

---

## Honest Summary

**What agents said they did:** "Implemented all 7 contracts, resolved TODOs, ready for testing"

**What was actually delivered:** Well-structured contract shells with correct accounting logic but no actual token transfers, cross-contract calls, or user-facing functionality beyond state tracking.

**What's needed for real MVP:**
1. Token transfer integration (CRITICAL)
2. Cross-contract call implementation (CRITICAL)
3. Overflow bug fix (CRITICAL)
4. Withdrawal claiming (CRITICAL)
5. Event emission (HIGH)
6. Input validation (HIGH)

**Estimated remaining work:** 40-60 hours of development + testing

---

*Last updated: 2025-12-27*
