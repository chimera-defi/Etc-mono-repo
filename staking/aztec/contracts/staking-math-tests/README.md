# Staking Math Tests

Unit tests for staking math logic. Works with standard `nargo` (no aztec-nargo needed).

## Running

```bash
cd staking/aztec/contracts/staking-math-tests
~/.nargo/bin/nargo test
# Expected: 64 tests passed
```

## Coverage

- Share minting/burning calculations
- Exchange rate math
- Fee calculations
- Withdrawal timing (unbonding period)
- Round-robin validator selection
- Integration flow simulations
