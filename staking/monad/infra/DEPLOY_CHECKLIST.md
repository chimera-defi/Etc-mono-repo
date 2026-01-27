# Monad Validator MVP Deploy Checklist

## Pre-flight

- [ ] Host has >= 8–16 GiB RAM for hugepages.
- [ ] Docker + compose installed.
- [ ] Foundry installed (`forge`, `cast`, `anvil`).
- [ ] `RPC_URL` known for status server.

## Install

- [ ] Apply sysctl tuning: `staking/monad/infra/scripts/install_sysctl.sh`.
- [ ] Create `monad` system user: `staking/monad/infra/scripts/create_monad_user.sh`.
- [ ] Install validator binary/config: `staking/monad/infra/scripts/install_validator_binary.sh <bin> <config>`.
- [ ] Install validator service: `staking/monad/infra/scripts/install_validator_service.sh`.
- [ ] Install status server: `staking/monad/infra/scripts/install_status_service.sh`.
- [ ] (Optional) Run all setup steps: `staking/monad/infra/scripts/setup_server.sh`.
- [ ] (Optional) Full bootstrap: `staking/monad/infra/scripts/bootstrap_all.sh`.
- [ ] (Optional) Install firewall rules: `staking/monad/infra/scripts/install_firewall_ufw.sh`.
- [ ] (Optional) Monitoring stack: `staking/monad/infra/monitoring/README.md`.

## Configure

- [ ] Update `/etc/monad/validator.env` as needed.
- [ ] Update `/etc/monad/status.env` with `RPC_URL=...`.
- [ ] (Optional) Configure reverse proxy: `staking/monad/infra/scripts/install_caddy.sh`.
- [ ] Update status domain/email defaults if not using `liquidmonad.xyz`.

## Verify

- [ ] `curl -fsS http://localhost:8787/status` returns JSON.
- [ ] `staking/monad/infra/scripts/check_rpc.sh <rpc> eth_blockNumber` succeeds.
- [ ] `staking/monad/infra/scripts/e2e_smoke_test.sh` passes.
- [ ] `staking/monad/infra/scripts/preflight_check.sh` passes.
- [ ] (Optional) Monitoring stack up: `staking/monad/infra/monitoring/` (Prometheus/Grafana/Loki).
- [ ] (Optional) Full setup guide followed: `staking/monad/infra/SETUP.md`.

## Network Hardening

- [ ] Block public access to `:8787`; expose only via reverse proxy.
- [ ] Allow `22/tcp` and `80/443` if using Caddy; deny other inbound.

## Rollback

- [ ] Restore `/etc/monad/status.env` and `/etc/monad/validator.env` backups.
- [ ] `systemctl restart monad-status.service`
- [ ] `systemctl restart monad-validator.service`
