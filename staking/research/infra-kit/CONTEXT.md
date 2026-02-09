# InfraKit Context Scratchpad

## Verified Sources
- eth2‑quickstart scripts: run_1/run_2, install/*, lib/common_functions.sh
- Monad infra scripts: staking/monad/infra/scripts/*
- Aztec dev tooling: staking/aztec/scripts/*

## Open Questions
- Which eth2‑quickstart scripts should become shared primitives vs stay in adapters?
- Should the Monad status server become the default shared status endpoint?
- When will Aztec production role scripts exist (sequencer/prover/validator)?

## Notes
- Control plane is repo‑based in phase 1.
- Web proxy/SSL is optional and chain‑specific in usage but reusable as a primitive.
