# Monad Infra Skeleton (MVP)

This folder mirrors the plan in `staking/research/monad-validator-plan.md`.
Keep it minimal and additive; avoid irreversible automation.

## Structure

- `config/` base config + per-node overrides
- `runbook/` operational docs
- `systemd/` service templates + overrides
- `watchers/` placeholders for future monitoring
- `scripts/` minimal helpers (no destructive actions)

## Quick Start (Week 1-2)

1. Choose config root (`/etc/monad` or `~/.monad`) and keep consistent.
2. Copy `systemd/monad-validator.service` to `/etc/systemd/system/`.
3. Update `scripts/healthcheck.sh` with the RPC URL.
4. Record uptime monitor link in `runbook/runbook.md`.

