# InfraKit Tasks (Next Agent)

## Documentation Pass
- [ ] Review `SPEC.md` for accuracy vs scripts (eth2‑quickstart + Monad + Aztec).
- [ ] Verify no claims about Aztec validator roles unless backed by scripts/docs.
- [ ] Ensure diagrams in `DESIGN.md` and `SPEC.md` align with verified flows.

## Script Inspection (Targeted)
- [ ] eth2‑quickstart: inspect install scripts to confirm systemd unit behavior.
- [ ] Monad: confirm monitoring stack (docker compose) expectations.
- [ ] Aztec: confirm sandbox E2E flow in `local-sandbox-e2e.sh`.

## Architecture Refinement
- [ ] Finalize shared primitive interfaces and name them consistently.
- [ ] Decide adapter boundaries (Ethereum vs Monad vs Aztec).
- [ ] Produce a concise architecture diagram for human review (keep in DESIGN.md).

## Implementation Prep (Future)
- [ ] Propose `staking/infra-kit/` skeleton in a new PR.
- [ ] Add runbook template + smoke test template.
