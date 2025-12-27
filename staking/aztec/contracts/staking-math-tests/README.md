# Staking Math Tests

Unit tests for the staking pool math logic, testable with standard Noir (nargo).

## Purpose

These tests verify the core mathematical logic of the staking pool:
- Share minting calculations
- Withdrawal amount calculations
- Fee calculations
- Share value tracking

The tests are separated from the Aztec contract so they can run in CI without requiring the full Aztec toolchain.

## Running Tests

```bash
# Install nargo (if not already installed)
curl -L https://raw.githubusercontent.com/noir-lang/noirup/main/install | bash

# Run tests
cd staking/aztec/contracts/staking-math-tests
nargo test
```

## Test Coverage (34 tests)

### Core Functionality
| Test | Description |
|------|-------------|
| `test_first_deposit_1_to_1` | First deposit mints 1:1 shares |
| `test_proportional_deposit` | Subsequent deposits mint proportionally |
| `test_deposit_after_rewards` | Deposits after rewards get fewer shares |
| `test_withdrawal_1_to_1` | Withdrawal returns proportional tokens |
| `test_withdrawal_after_rewards` | Share value increases with rewards |

### Fee Calculations
| Test | Description |
|------|-------------|
| `test_fee_calculation_10_percent` | 10% fee (1000 bps) |
| `test_fee_calculation_1_percent` | 1% fee (100 bps) |
| `test_fee_calculation_zero` | 0% fee |
| `test_fee_max_30_percent` | Max 30% fee (3000 bps) |
| `test_net_withdrawal_with_fee` | Net amount after fee deduction |

### Share Value
| Test | Description |
|------|-------------|
| `test_share_value_1_to_1` | Initial 1:1 ratio |
| `test_share_value_2_to_1` | 2:1 after rewards |
| `test_share_value_empty_pool` | Default value when empty |
| `test_rewards_increase_share_value` | Rewards boost share value |

### Multi-User Scenarios
| Test | Description |
|------|-------------|
| `test_deposit_withdraw_roundtrip` | Deposit and full withdrawal |
| `test_multiple_depositors_fair_share` | Equal deposits get equal shares |
| `test_late_depositor_gets_fewer_shares` | Late depositors get fewer shares |

### Edge Cases
| Test | Description |
|------|-------------|
| `test_large_numbers` | Large amounts without overflow |
| `test_small_deposit_into_large_pool` | Small deposits in large pools |
| `test_withdrawal_from_empty_pool` | Empty pool edge case |

## Relation to Aztec Contract

These functions mirror the logic in `aztec-staking-pool/src/main.nr`:
- `calculate_shares_to_mint` → `deposit()` logic
- `calculate_withdrawal_amount` → `withdraw()` logic
- `calculate_fee` → fee calculation in `withdraw()`
- `calculate_share_value` → `get_share_value()` logic

Any changes to the Aztec contract's math should be reflected here and tested.

## CI Integration

These tests run automatically on:
- Push to `main` affecting `staking/aztec/contracts/**`
- Pull requests affecting `staking/aztec/contracts/**`

See `.github/workflows/staking-contracts-ci.yml`
