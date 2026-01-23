# Development Progress

**Status:** ✅ Phase 2 Complete - Production-ready contracts with v3.0.x

---

## Environment Status ✅

| Tool | Version | Status |
|------|---------|--------|
| Docker | 28.2.2 | ✅ Working |
| noirup/nargo | 1.0.0-beta.18 | ✅ Installed |
| aztec CLI | 3.0.0-devnet.20251212 | ✅ Installed |
| aztec-packages | v3.0.3 | ✅ Dependencies updated |

---

## What Works

```bash
# Unit tests (74/74 passing)
cd contracts/staking-math-tests && ~/.nargo/bin/nargo test
# 74 tests passed ✅

# Smoke test (7/7 passing)
./scripts/smoke-test.sh

# Integration test (6/6 passing)
./scripts/integration-test.sh

# All 3 core contracts compile successfully
cd ~/aztec-contracts/staked-aztec-token && aztec compile   # 832 KB
cd ~/aztec-contracts/liquid-staking-core && aztec compile  # 844 KB
cd ~/aztec-contracts/withdrawal-queue && aztec compile     # 836 KB
```

```bash
# Local sandbox start (no devnet usage)
aztec start --local-network
# Verify node responds
curl -s -X POST http://localhost:8080 -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"node_getVersion","params":[],"id":1}'
```

```bash
# Token contract (for sandbox E2E)
cd /root/nargo/github.com/AztecProtocol/aztec-packages/v3.0.3/noir-projects/noir-contracts
aztec compile --package token_contract
```

## In Progress / Known Issues

- Local sandbox E2E (`scripts/local-sandbox-e2e.sh`) can stall on token deployment if the sandbox process is reclaimed or slow to respond.
- The Aztec CLI runs inside Docker; ensure the sandbox stays up long enough for wallet deploys to complete.
- If the sandbox process dies, inspect `/tmp/aztec-local.log` for OOM or network errors.

---

## Function Selector Verification ✅

```
transfer_in_public((Field),(Field),u128,Field) -> 0x8c9e5472
mint((Field),u128,u128) -> 0x342cb4ce
burn((Field),u128) -> 0x2dcbea8b
add_request((Field),u128,u64) -> 0x9833d028
```

Verified via `FunctionSelector.fromSignature` (Aztec stdlib v3.0.3).

---

## Contract Architecture (Production-Ready)

| Contract | Functions | Artifact Size | Status |
|----------|-----------|---------------|--------|
| StakedAztecToken | 20 | 832 KB | ✅ Compiles |
| LiquidStakingCore | 26 | 844 KB | ✅ Compiles |
| WithdrawalQueue | 20 | 836 KB | ✅ Compiles |
| **Total** | **66** | **2.5 MB** | **3/3 ✅** |

### Core Flow
```
User deposits AZTEC -> LiquidStakingCore.deposit() -> Mints stAZTEC (StakedAztecToken)
User withdraws -> LiquidStakingCore.request_withdrawal() -> Creates unbonding request (WithdrawalQueue)
After 7 days -> WithdrawalQueue.claim_withdrawal() -> Returns AZTEC to user
```

### Key Features (NEW)
- **ERC20-compatible stAZTEC**: approve(), allowance(), transfer_from() for DeFi composability
- **Exchange rate source of truth**: Rate computed from total_aztec_backing / total_supply
- **Frontend-friendly views**: balance_of_in_aztec(), time_until_claimable(), get_request()
- **Fee collection**: collect_fees() transfers accumulated fees to treasury

---

## API Reference

### StakedAztecToken (stAZTEC)
```noir
// User functions
transfer(to, amount)
transfer_from(from, to, amount)
approve(spender, amount)

// View functions (for frontend)
balance_of(account) -> u128
balance_of_in_aztec(account) -> u128  // Shows AZTEC value
allowance(owner, spender) -> u128
total_supply() -> u128
get_exchange_rate() -> u64  // 10000 = 1:1
convert_to_aztec(st_aztec_amount) -> u128
convert_to_st_aztec(aztec_amount) -> u128

// Admin only (called by LiquidStakingCore)
mint(to, st_aztec_amount, aztec_backing)
burn(from, st_aztec_amount) -> u128
add_rewards(reward_amount)
```

### LiquidStakingCore
```noir
// User functions
deposit(amount, nonce) -> u128  // Returns stAZTEC minted
request_withdrawal(st_aztec_amount, timestamp) -> u64  // Returns request_id

// Admin functions
add_rewards(amount)
notify_staked(amount)
collect_fees(nonce) -> u128
fund_withdrawal_queue(amount, nonce)
set_paused(paused)

// View functions (for frontend)
get_total_deposited() -> u128
get_pending_pool() -> u128
get_total_staked() -> u128
get_accumulated_fees() -> u128
get_protocol_fee_bps() -> u64
get_min_deposit() -> u128
is_paused() -> bool
get_staked_aztec_token() -> AztecAddress
get_withdrawal_queue() -> AztecAddress
```

### WithdrawalQueue
```noir
// User functions
claim_withdrawal(request_id, current_timestamp) -> u128

// View functions (for frontend)
get_request(request_id) -> (user, amount, timestamp, fulfilled)
get_request_amount(request_id) -> u128
get_request_user(request_id) -> AztecAddress
get_request_timestamp(request_id) -> u64
is_request_fulfilled(request_id) -> bool
is_claimable(request_id, current_timestamp) -> bool
time_until_claimable(request_id, current_timestamp) -> u64
get_total_pending() -> u128
get_unbonding_period() -> u64
get_next_request_id() -> u64
```

---

## Test Coverage

| Test Suite | Tests | Status |
|------------|-------|--------|
| staking-math-tests | 74 | ✅ All passing |
| smoke-test.sh | 8 | ✅ All passing (sandbox E2E optional) |
| integration-test.sh | 6 | ✅ All passing |

Test categories:
- Basic math (shares, fees, exchange rates)
- Cross-contract flow simulations
- ERC20 allowance/transfer flows
- Withdrawal queue timing
- Multi-user proportional ownership
- Rate-only-increases invariant

---

## Next Steps (Phase 3)

1. **Deploy to Aztec devnet** for full E2E testing
2. **Verify function selectors** against production Token ABI
3. **Build frontend integration** using view functions
4. **Add private transfer support** (optional enhancement)
5. **Security audit** before mainnet deployment

---

## Breaking Changes (v2.1.9 -> v3.0.x)

See `contracts/NOIR_GUIDE.md` section 1.1 for full migration guide.

Key changes:
- `#[public]` -> `#[external("public")]`
- `storage.field` -> `self.storage.field`
- `context.msg_sender()` -> `self.msg_sender().unwrap()`
- `context.this_address()` -> `self.address`
- Cross-contract calls: `self.context.call_public_function(..., GasOpts::default())`
- Add `use dep::aztec::protocol_types::traits::ToField` for `.to_field()` calls

---

## Commands Reference

```bash
# Run all tests
cd staking/aztec/contracts/staking-math-tests && ~/.nargo/bin/nargo test

# Run smoke test
./staking/aztec/scripts/smoke-test.sh

# Run integration test
./staking/aztec/scripts/integration-test.sh

# Compile a contract
cp -r staking/aztec/contracts/staked-aztec-token ~/aztec-contracts/
pushd ~/aztec-contracts/staked-aztec-token && aztec compile; popd

# Install Aztec CLI (first time setup)
bash -i <(curl -s https://install.aztec.network)
aztec-up 3.0.0-devnet.20251212
```
