# Aztec Staking Pool Contract

Base staking pool with share-based deposit/withdrawal.

## Functions

| Function | Description |
|----------|-------------|
| `deposit(amount)` | Deposit tokens, receive shares |
| `withdraw(shares)` | Burn shares, receive tokens |
| `add_rewards(amount)` | Add rewards (admin) |
| `collect_fees()` | Withdraw fees |

## View Functions

- `get_total_staked()`, `get_total_shares()`
- `get_share_balance(account)`, `get_share_value()`
- `preview_deposit(amount)`, `preview_withdraw(shares)`

## Compilation

Requires `aztec-nargo` (not standard `nargo`):

```bash
aztec-nargo compile
```

## Architecture

```
Share Value = total_staked / total_shares

deposit(amt) → shares = amt * total_shares / total_staked
withdraw(shares) → amt = shares * total_staked / total_shares
```
