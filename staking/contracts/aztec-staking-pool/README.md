# Aztec Staking Pool Contract

**Status:** ✅ COMPILED SUCCESSFULLY
**Created:** 2025-12-26
**Last Compiled:** 2025-12-27
**Compiler:** aztec-nargo 1.0.0-beta.11 (Aztec v2.1.9)

## Compilation Status

This contract has been successfully compiled with aztec-nargo. See [COMPILATION-STATUS.md](./COMPILATION-STATUS.md) for details.

**Before using this contract in production:**
- Deploy and test on Aztec sandbox
- Deploy and test on devnet
- Write integration tests
- Get a security review
- Implement token transfer integration (currently stubbed)

## Overview

Full Aztec-compatible liquid staking pool contract with:
- Share-based deposit/withdrawal system
- Protocol fee on withdrawals
- Admin controls for pausing and fee management
- View functions for previewing operations

## Contract Features

### Core Functions
- `deposit(amount)` - Deposit tokens, receive pool shares
- `withdraw(shares)` - Burn shares, receive tokens (minus fee)
- `add_rewards(amount)` - Add staking rewards (admin only)
- `collect_fees()` - Withdraw accumulated fees

### View Functions
- `get_total_staked()` - Total tokens in pool
- `get_total_shares()` - Total shares outstanding
- `get_share_balance(account)` - User's share balance
- `get_share_value()` - Current value per share (scaled 1e18)
- `preview_deposit(amount)` - Preview shares for deposit
- `preview_withdraw(shares)` - Preview tokens for withdrawal

### Admin Functions
- `set_fee_bps(fee)` - Set withdrawal fee (max 30%)
- `set_paused(bool)` - Emergency pause
- `set_admin(address)` - Transfer admin

## Compilation

Requires aztec-nargo (not standard nargo):

```bash
# Install Aztec tooling (requires Docker)
bash -i <(curl -s https://install.aztec.network)
aztec-up

# Compile
cd aztec-staking-pool
aztec-nargo compile

# Verify output (759KB artifact)
ls target/staking_pool-StakingPool.json

# Deploy to devnet
aztec deploy StakingPool \
  --node-url https://next.devnet.aztec-labs.com \
  --args <admin_address> <fee_bps> <fee_recipient>
```

## Integration Notes

### TODO Items in Contract
1. **CRITICAL: Token Transfers**: Currently stubbed in `main.nr`.
   - **Action Required:** Implement the `Token` interface trait (see TASKS.md TASK-106) and call `transfer_from` for deposits and `transfer` for withdrawals.
   - `deposit()` needs to pull tokens from caller
   - `withdraw()` needs to send tokens to caller
   - `add_rewards()` needs to receive reward tokens
   - `collect_fees()` needs to send fees to recipient

2. **Authorization**: May need AuthWit integration for delegated operations

3. **Private Functions**: Consider adding private deposit/withdraw for privacy

## Devnet Testing

```bash
# Create account
aztec-wallet create-account --node-url https://next.devnet.aztec-labs.com

# Get test tokens (via sponsored FPC)
# See: https://docs.aztec.network/developers/getting_started_on_devnet

# Deploy and test
aztec deploy StakingPool --args ...
```

## Key Devnet Info

- **RPC**: `https://next.devnet.aztec-labs.com`
- **L1 Chain ID**: 11155111 (Sepolia)
- **Staking Asset (L1)**: `0x3dae418ad4dbd49e00215d24079a10ac3bc9ef4f`
- **Node Version**: 3.0.0-devnet.20251212

## Architecture

```
┌─────────────────────────────────────────┐
│           StakingPool Contract          │
├─────────────────────────────────────────┤
│ Storage:                                │
│   - total_staked: u128                  │
│   - total_shares: u128                  │
│   - shares: Map<Address, u128>          │
│   - admin, fee_bps, fee_recipient       │
│   - pending_fees, paused                │
├─────────────────────────────────────────┤
│ Share Value = total_staked / total_shares│
│                                         │
│ deposit(amt) → shares = amt * total_shares / total_staked
│ withdraw(shares) → amt = shares * total_staked / total_shares
└─────────────────────────────────────────┘
```
