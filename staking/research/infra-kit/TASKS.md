# InfraKit Tasks (Execution Checklist)

## Phase 0: Due Diligence
- [ ] Confirm eth2-quickstart license or obtain written permission.
- [ ] Inventory eth2-quickstart scripts (run_1.sh, run_2.sh, exports.sh, select_clients.sh).
- [ ] Map scripts to InfraKit modules (provision/hardening/services/monitoring).

## Phase 1: Shared Skeleton
- [ ] Create `infra/shared/` structure with empty modules.
- [ ] Add minimal shell helpers for: base packages, create user, ssh hardening, ufw, sysctl.
- [ ] Add systemd + env install helpers.
- [ ] Add monitoring helpers (status server + RPC probe).

## Phase 2: Refactor Adapters
- [ ] Convert `staking/monad/infra/scripts/setup_server.sh` to call shared modules.
- [ ] Create Ethereum adapter stub (exec/cons + mev-boost placeholders).
- [ ] Create Aztec adapter stub (sequencer/prover placeholders).

## Phase 3: Standards
- [ ] Add shared runbook template + project overrides.
- [ ] Add smoke-test script that runs across adapters.
- [ ] Document config path standards (`/etc/<project>` + `/opt/<project>`).

## Phase 4: Validation
- [ ] Clean VPS dry run (provision -> harden -> install -> status check).
- [ ] Rollback test.
- [ ] Record verified server profile + logs.
