# InfraKit Context Scratchpad

## Verified Sources
- eth2-quickstart scripts: `github.com/chimera-defi/eth2-quickstart` (master, Feb 2026)
  - 60+ scripts: run_1/run_2, install/*, lib/common_functions.sh, test/*
  - 7 execution clients, 6 consensus clients, 5 MEV scripts
  - `common_functions.sh` is ~1000 lines of shared utilities
- Monad infra scripts: `staking/monad/infra/scripts/` (23 files)
- Aztec dev tooling: `staking/aztec/scripts/` (6 scripts + lib/common.sh)
- Aztec node infra: `staking/aztec/infra/scripts/` (3 scripts: setup, bootstrap, healthcheck)

## Resolved Questions
- **eth2-quickstart scope:** Much larger than originally noted. Includes 7 execution clients (not just geth), 6 consensus clients (not just prysm), Commit-Boost/ETHGas preconfirmation protocol, interactive TUI client selection (whiptail), hardware profile detection, CI/CD test suite.
- **Naming convention:** Monad uses snake_case, eth2-quickstart uses snake_case for functions and mixed for files. Aztec uses kebab-case for files. Recommend snake_case for shared primitives.

## Open Questions
- Which eth2-quickstart scripts should become shared primitives vs stay in adapters?
  - **Answer (partially):** Security (UFW, fail2ban, AIDE, SSH hardening), systemd helpers, download/extract, user creation are clearly shared. Client installers, MEV config, relay lists stay in Ethereum adapter.
- Should the Monad status server become the default shared status endpoint?
  - **Recommendation:** Yes. It's clean, generic (uses RPC_URL env var), and has an e2e smoke test.
- When will Aztec production role scripts exist (sequencer/prover/validator)?
  - **Resolved:** Node infra scripts built at `staking/aztec/infra/scripts/`. Roles verified from Aztec CLI source. Sequencer staking blocked on TGE + 200k AZTEC.

## Recent Changes (Feb 2026)
- Aztec scripts now share a common library (`lib/common.sh`).
- Monad `harden_ssh.sh` and `check_rpc.sh` fixed to use `grep` instead of `rg` for portability.
- eth2-quickstart now supports Commit-Boost (alternative to MEV-Boost) and ETHGas preconfirmation protocol.
- eth2-quickstart has a comprehensive `common_functions.sh` that could serve as a reference for the shared primitives layer.

## Notes
- Control plane is repo-based in phase 1.
- Web proxy/SSL is optional and chain-specific in usage but reusable as a primitive.
- eth2-quickstart `common_functions.sh` patterns (logging, systemd helpers, download/extract, firewall) are very close to what InfraKit shared primitives need.
