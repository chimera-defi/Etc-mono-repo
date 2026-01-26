# Monad Validator MVP Deploy Checklist

## Pre-flight

- [ ] Host has >= 8–16 GiB RAM for hugepages.
- [ ] Docker + compose installed.
- [ ] Foundry installed (`forge`, `cast`, `anvil`).
- [ ] `RPC_URL` known for status server.

## Install

- [ ] Apply sysctl tuning: `staking/monad/scripts/install_sysctl.sh`.
- [ ] Install validator service: `staking/monad/scripts/install_validator_service.sh`.
- [ ] Install status server: `staking/monad/scripts/install_status_service.sh`.

## Configure

- [ ] Update `/etc/monad/validator.env` as needed.
- [ ] Update `/etc/monad/status.env` with `RPC_URL=...`.
- [ ] (Optional) Configure reverse proxy: `staking/monad/scripts/install_caddy.sh`.

## Verify

- [ ] `curl -fsS http://localhost:8787/status` returns JSON.
- [ ] `staking/monad/scripts/check_rpc.sh <rpc> eth_blockNumber` succeeds.
- [ ] `staking/monad/scripts/e2e_smoke_test.sh` passes.
- [ ] `staking/monad/scripts/preflight_check.sh` passes.

## Rollback

- [ ] Restore `/etc/monad/status.env` and `/etc/monad/validator.env` backups.
- [ ] `systemctl restart monad-status.service`
- [ ] `systemctl restart monad-validator.service`
