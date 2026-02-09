# InfraKit Tasks (Next Agent)

## Documentation Pass
- [x] Review `SPEC.md` for accuracy vs scripts (eth2‑quickstart + Monad + Aztec).
- [x] Verify no claims about Aztec validator roles unless backed by scripts/docs.
- [x] Ensure diagrams in `DESIGN.md` and `SPEC.md` align with verified flows.
- [x] Run `REVIEW_CHECKLIST.md` and resolve any gaps.

## Script Inspection (Targeted)
- [x] eth2‑quickstart: inspect `install/security/*` and `install/web/*` for additional reusable primitives.
- [x] eth2‑quickstart: confirm NGINX/SSL install path and service names.
- [x] Monad: confirm monitoring stack (docker compose) expectations and ports.
- [x] Aztec: confirm sandbox E2E flow in `local-sandbox-e2e.sh` (already mapped).

## Architecture Refinement
- [x] Finalize shared primitive interfaces and name them consistently.
- [x] Decide adapter boundaries (Ethereum vs Monad vs Aztec).
- [x] Produce a concise architecture diagram for human review (keep in DESIGN.md).

## Implementation Prep (Future)
- [ ] Propose `staking/infra-kit/` skeleton in a new PR.
- [ ] Add runbook template + smoke test template.
