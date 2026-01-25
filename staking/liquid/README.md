# Liquid Staking (Infra Provider)

This project defines a liquid staking offering that runs on top of our validator infrastructure. It is intentionally minimal and focused on infra readiness, integration points, and operational safety.

## Scope (MVP)

- Validator operations handled by infra provider (this repo’s `staking/monad` stack).
- Delegation UX and liquid staking token mechanics are out of scope for now.
- Integrations focus on stake onboarding, reporting, and ops SLAs.

## Repository Layout

- `spec.md` – MVP requirements and constraints.
- `ops.md` – operational responsibilities and runbooks.
- `interfaces.md` – integration points (status JSON, webhook events, reporting).

## Dependencies

- Monad validator stack: `staking/monad/`
- Status JSON: `/status` endpoint from `staking/monad/scripts/status_server.py`

## Next Steps

- Fill `spec.md` with product and compliance requirements.
- Define SLA terms in `ops.md`.
- Implement webhook/event schema in `interfaces.md`.
