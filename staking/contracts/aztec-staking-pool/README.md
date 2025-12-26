# Aztec Staking Pool Contract

**Status:** Draft (requires aztec-nargo for compilation)
**Created:** 2025-12-26

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
# Install Aztec tooling (on machine with Docker)
bash -i <(curl -s https://install.aztec.network)
aztec-up 3.0.0-devnet.20251212

# Compile
cd aztec-staking-pool
aztec-nargo compile

# Deploy to devnet
aztec deploy StakingPool \
  --node-url https://next.devnet.aztec-labs.com \
  --args <admin_address> <fee_bps> <fee_recipient>
```

## Integration Notes

### TODO Items in Contract
1. **Token Transfers**: Currently stubbed. Need to integrate with Aztec token contract:
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
