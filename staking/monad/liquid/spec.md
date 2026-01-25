# Liquid Staking MVP Spec

## Goals

- Provide a clear infra-backed liquid staking offering.
- Offer transparent uptime and performance reporting.
- Maintain strict operational control and key custody.

## Non-Goals (MVP)

- Liquid staking token contract implementation.
- Cross-chain bridging or secondary markets.
- Custodial wallet offering.

## MVP Requirements

- Use validator infrastructure from `staking/monad/`.
- Public status JSON endpoint for uptime and block height.
- Incident reporting cadence and audit trail.
- SLA definition for response time and remediation.

## Open Questions

- What is the initial target chain and staking contract interface?
- Is a dedicated liquid staking token required at MVP?
- Do we need formal audits before launch?
