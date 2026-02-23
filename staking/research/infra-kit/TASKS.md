# InfraKit Tasks (Next Agent)

## Documentation Pass
- [x] Review `SPEC.md` for accuracy vs scripts (eth2-quickstart + Monad + Aztec).
- [x] Verify no claims about Aztec validator roles unless backed by scripts/docs.
- [x] Ensure diagrams in `DESIGN.md` and `SPEC.md` align with verified flows.
- [x] Run `REVIEW_CHECKLIST.md` and resolve any gaps.
- [x] Update SPEC.md with full eth2-quickstart script inventory (7 EL, 6 CL, 5 MEV, utils, tests).
- [x] Update CONTEXT.md with resolved questions and recent changes.

## Script Inspection (Targeted)
- [x] eth2-quickstart: inspect `install/security/*` and `install/web/*` for additional reusable primitives.
- [x] eth2-quickstart: confirm NGINX/SSL install path and service names.
- [x] eth2-quickstart: catalog all execution/consensus/MEV clients.
- [x] eth2-quickstart: review `lib/common_functions.sh` as shared primitives reference.
- [x] Monad: confirm monitoring stack (docker compose) expectations and ports.
- [x] Aztec: confirm sandbox E2E flow in `local-sandbox-e2e.sh` (already mapped).

## Script Refinement (Completed)
- [x] Create Aztec `lib/common.sh` shared library (colors, env detection, binary finders, test tracking).
- [x] Refactor all Aztec scripts to use common library.
- [x] Add `--help` flag to all Aztec scripts.
- [x] Remove hardcoded paths from `local-sandbox-e2e.sh` (use env vars with defaults).
- [x] Fix Monad `harden_ssh.sh` and `check_rpc.sh` to use `grep` instead of `rg`.
- [x] Add `scripts/README.md` for Aztec scripts directory.

## Architecture Refinement
- [x] Finalize shared primitive interfaces and name them consistently.
- [x] Decide adapter boundaries (Ethereum vs Monad vs Aztec).
- [x] Produce a concise architecture diagram for human review (keep in DESIGN.md).

## Aztec Node Infra (Completed)
- [x] Spec out Aztec network roles from CLI source (AZTEC_NODE_SPEC.md).
- [x] Build `setup_aztec_node.sh` mirroring Monad `setup_server.sh`.
- [x] Build `bootstrap_aztec.sh` mirroring Monad `bootstrap_all.sh`.
- [x] Build `check_aztec_node.sh` health check.
- [x] Add infra/README.md with usage docs.

## Implementation Prep (Future)
- [ ] Propose `staking/infra-kit/` skeleton in a new PR.
- [ ] Extract shared primitives from Monad scripts into `infra-kit/shared/`.
- [ ] Create Ethereum adapter wrapping eth2-quickstart scripts.
- [ ] Create Monad adapter wrapping monad infra scripts.
- [ ] Create Aztec adapter wrapping infra + dev tooling scripts.
- [ ] Add runbook template + smoke test template.
- [ ] Add shellcheck CI for all shell scripts.
- [ ] Standardize naming convention (snake_case) across shared primitives.
