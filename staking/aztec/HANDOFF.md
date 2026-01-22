# Agent Handoff - Aztec Liquid Staking

**Date:** 2026-01-22
**Previous Agent:** Claude Opus 4.5
**Status:** Phase 2 Complete - Ready for Devnet Deployment

---

## What Was Done This Session

### 1. Contract Architecture Review & Security Fixes
- Identified critical security issue: user-provided exchange_rate parameters
- Fixed by making StakedAztecToken the source of truth for exchange rate
- Exchange rate now computed from `total_aztec_backing / total_supply`

### 2. ERC20 Compatibility Added to stAZTEC
- `approve(spender, amount)` - Grant spending allowance
- `allowance(owner, spender)` - View allowance
- `transfer_from(from, to, amount)` - Delegated transfers
- This enables stAZTEC to be used in DeFi protocols

### 3. Frontend-Friendly View Functions Added
- `balance_of_in_aztec(account)` - Shows stAZTEC balance in AZTEC terms
- `time_until_claimable(request_id, timestamp)` - Countdown for withdrawals
- `get_request(request_id)` - Full request details tuple
- Various getters for contract state

### 4. New Admin Functions
- `collect_fees(nonce)` - Transfer accumulated fees to treasury
- `fund_withdrawal_queue(amount, nonce)` - Fund queue for withdrawals

### 5. Comprehensive Test Suite
- Added 10 new integration tests (74 total, all passing)
- Updated smoke-test.sh for 3-contract architecture
- Created integration-test.sh for full verification

---

## Current State

### Contracts (All Compile Successfully)
```
staking/aztec/contracts/
├── staked-aztec-token/      # 20 functions, 832 KB
├── liquid-staking-core/     # 26 functions, 844 KB
├── withdrawal-queue/        # 20 functions, 836 KB
└── staking-math-tests/      # 74 unit tests
```

### Tests
- **Unit tests:** 74/74 passing (`nargo test`)
- **Smoke test:** 7/7 passing (`./scripts/smoke-test.sh`)
- **Integration test:** 6/6 passing (`./scripts/integration-test.sh`)

### Key Files Modified
- `contracts/staked-aztec-token/src/main.nr` - ERC20 + backing tracking
- `contracts/liquid-staking-core/src/main.nr` - Reads rate from token
- `contracts/withdrawal-queue/src/main.nr` - Frontend view functions
- `contracts/staking-math-tests/src/main.nr` - 10 new tests
- `scripts/smoke-test.sh` - Updated for 3-contract structure
- `scripts/integration-test.sh` - New comprehensive test script
- `PROGRESS.md` - Full documentation update

---

## What Needs To Be Done (Phase 3)

### Priority 1: Devnet Deployment
1. Start Aztec sandbox locally or connect to devnet
2. Deploy all 3 contracts in order:
   - StakedAztecToken
   - WithdrawalQueue
   - LiquidStakingCore
3. Configure contract references (set_liquid_staking_core, etc.)
4. Test full deposit/withdrawal flow

### Priority 2: Function Selector Verification
The contracts use these selectors for cross-contract calls:
```
transfer_in_public((Field),(Field),u128,Field) -> 0x8c9e5472
mint((Field),u128,u128) -> needs verification
burn((Field),u128) -> 0x2dcbea8b
add_request((Field),u128,u64) -> needs verification
```
Verify these against actual Aztec Token contract ABI.

### Priority 3: Frontend Integration
Use these view functions:
```typescript
// Display user's staking position
const stAztecBalance = await token.balance_of(user);
const aztecValue = await token.balance_of_in_aztec(user);
const rate = await token.get_exchange_rate();

// Display withdrawal status
const request = await queue.get_request(requestId);
const timeLeft = await queue.time_until_claimable(requestId, now);
const canClaim = await queue.is_claimable(requestId, now);

// Display protocol stats
const totalDeposited = await core.get_total_deposited();
const totalStaked = await core.get_total_staked();
const fees = await core.get_accumulated_fees();
```

### Priority 4: Optional Enhancements
- Add private transfer support (Aztec privacy features)
- Add batch withdrawal claims
- Add slashing support (currently rate only increases)

---

## Environment Setup (For New Agents)

```bash
# Run tests
cd staking/aztec/contracts/staking-math-tests && ~/.nargo/bin/nargo test

# Run smoke test
./staking/aztec/scripts/smoke-test.sh

# Compile contracts (must be under $HOME)
cp -r staking/aztec/contracts/staked-aztec-token ~/aztec-contracts/
pushd ~/aztec-contracts/staked-aztec-token && ~/aztec-bin/aztec-nargo compile; popd
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Frontend (Web App)                           │
│  - Shows stAZTEC balance and AZTEC value                           │
│  - Shows pending withdrawal requests with time remaining           │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────────┐
│                    LiquidStakingCore                                 │
│  Entry point for all user interactions                               │
│                                                                      │
│  deposit(amount, nonce) -> stAZTEC                                   │
│  request_withdrawal(st_aztec_amount, timestamp) -> request_id       │
└────────────┬────────────────────────────────┬───────────────────────┘
             │                                │
┌────────────▼────────────────┐  ┌────────────▼────────────────┐
│    StakedAztecToken         │  │    WithdrawalQueue          │
│    (stAZTEC - ERC20)        │  │    (FIFO unbonding)         │
│                             │  │                              │
│  • mint/burn (core only)    │  │  • add_request (core only)  │
│  • transfer/transfer_from   │  │  • claim_withdrawal (user)  │
│  • approve/allowance        │  │  • 7-day unbonding period   │
│                             │  │                              │
│  Exchange Rate =            │  │  View: get_request(),       │
│  backing / supply           │  │  time_until_claimable()     │
└─────────────────────────────┘  └─────────────────────────────┘
```

---

## Git Commits This Session

```
414957d Enhance Aztec staking contracts with production-ready features
46f3744 Update smoke test and add integration tests for 3-contract architecture
689b2d0 Simplify Aztec staking contracts and migrate to v3.0.x API
```

---

## Notes for Next Agent

1. **Don't modify exchange rate logic** - It's designed to be the source of truth
2. **Rate only increases** - This is intentional (no slashing support yet)
3. **MIN_DEPOSIT is 1 AZTEC** - Prevents dust attacks
4. **Contracts must be compiled under $HOME** - aztec-nargo limitation
5. **Use pushd/popd for compilation** - cd doesn't work well in the environment

Good luck!
