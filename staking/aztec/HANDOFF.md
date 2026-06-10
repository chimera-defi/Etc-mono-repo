# Agent Handoff - Aztec Liquid Staking — Compressed 2026-06-07

**Original date:** 2026-01-23 | **Agent:** Claude Opus 4.5 | **Status:** Phase 2 Complete

## What Was Done

1. **Exchange rate security fix:** moved source of truth to `StakedAztecToken` (`total_aztec_backing / total_supply`), removing user-supplied parameter.
2. **ERC20 compat on stAZTEC:** `approve`, `allowance`, `transfer_from`.
3. **Frontend view functions:** `balance_of_in_aztec`, `time_until_claimable`, `get_request`.
4. **Admin functions:** `collect_fees`, `fund_withdrawal_queue`.
5. **Tests:** 74/74 unit, 7/7 smoke, 6/6 integration passing.
6. **Frontend scaffold:** Next.js + Tailwind shell at `staking/aztec/frontend`.

## Current Contracts (3-contract architecture)
```
staked-aztec-token/   # ERC20 + backing tracking, 20 functions
liquid-staking-core/  # Entry point, reads rate from token, 26 functions
withdrawal-queue/     # FIFO 7-day unbonding, 20 functions
staking-math-tests/   # 74 unit tests
```

## Phase 3 Next Actions
1. Deploy to local sandbox: `aztec start --local-network` → deploy in order: StakedAztecToken → WithdrawalQueue → LiquidStakingCore → wire `set_liquid_staking_core`.
2. Run full deposit → withdrawal → claim flow.

## Environment Notes
- Compile contracts under `$HOME` (aztec CLI requirement); use `pushd/popd`.
- Sandbox may kill mid-run; `aztec-wallet` will fail with `host.docker.internal:8080` connection refused — restart sandbox and retry.
- Run tests: `nargo test` in `staking-math-tests/`; `./scripts/smoke-test.sh`; `./scripts/integration-test.sh`.
