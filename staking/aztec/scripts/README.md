# Aztec Liquid Staking Scripts

Development and testing toolchain for the Aztec liquid staking contracts.

**Important:** These are **dev/test tooling only** -- not production node operations.
For node/sequencer/prover provisioning, see `staking/aztec/infra/`.

## Scripts

| Script | Purpose | Docker Required |
|--------|---------|-----------------|
| `setup-env.sh` | Install nargo, aztec-nargo, dependencies | Optional (full mode) |
| `smoke-test.sh` | Verify toolchain and run unit tests | Optional (full mode) |
| `compile-contracts.sh` | Compile one or all Aztec contracts | Yes (Aztec CLI) |
| `integration-test.sh` | Compile contracts, test TXE, verify selectors | Yes |
| `local-sandbox-e2e.sh` | Full deploy + staking flow on local sandbox | Yes |
| `query-devnet.mjs` | Query Aztec L2 devnet info via AztecJS | No |

## Shared Library

All bash scripts source `lib/common.sh` which provides:
- Color constants and logging helpers (`log_info`, `log_warn`, `log_error`)
- Test tracking (`pass`, `fail`, `skip`, `print_test_summary`)
- Environment detection (`detect_environment`)
- Binary finders (`find_nargo`, `find_aztec_nargo`, `find_aztec_cli`)
- Contract helpers (`check_contract_project`, `artifact_has_bytecode`)
- Devnet connectivity (`check_devnet_connectivity`)
- Argument parsing (`has_flag`, `show_help_if_requested`)

## Quick Start

```bash
# Minimal setup (no Docker required)
./scripts/setup-env.sh --minimal
./scripts/smoke-test.sh --minimal

# Full setup (Docker required)
./scripts/setup-env.sh
./scripts/smoke-test.sh

# Run unit tests directly
cd contracts/staking-math-tests && nargo test

# Compile all contracts (Aztec CLI required)
./scripts/compile-contracts.sh

# Compile a single contract
./scripts/compile-contracts.sh staked-aztec-token

# Integration tests (Docker required)
./scripts/integration-test.sh

# Full E2E on local sandbox (Aztec CLI required)
./scripts/local-sandbox-e2e.sh
```

## Environment Variables

| Variable | Default | Used By |
|----------|---------|---------|
| `AZTEC_BIN` | Auto-detected | `local-sandbox-e2e.sh` |
| `WALLET_BIN` | Auto-detected | `local-sandbox-e2e.sh` |
| `NODE_URL` | `http://localhost:8080` | `local-sandbox-e2e.sh` |
| `DEPLOY_TIMEOUT` | `300` | `local-sandbox-e2e.sh` |
| `AZTEC_DEVNET_URL` | `https://next.devnet.aztec-labs.com` | `smoke-test.sh`, `integration-test.sh` |
| `AZTEC_PACKAGES_VERSION` | `v3.0.3` | `local-sandbox-e2e.sh` |
| `AZTEC_COMPILE_DIR` | `~/aztec-contracts` | `compile-contracts.sh` |

## Contract Architecture (v3.0.x)

- **StakedAztecToken** -- Liquid staking token (stAZTEC)
- **LiquidStakingCore** -- Main entry point for deposits/withdrawals
- **WithdrawalQueue** -- FIFO unbonding queue with 7-day period
- **staking-math-tests** -- 74 unit tests for economic math (pure Noir)
