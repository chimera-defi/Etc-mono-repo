# InfraKit Handoff Prompts

## 1) Verify Ethereum Security & Web Scripts
"Inspect eth2‑quickstart `install/security/*` and `install/web/*` scripts. Document any reusable primitives (SSH, firewall, nginx/ssl) and update SPEC.md."

## 2) Validate Monad Monitoring Stack
"Review staking/monad/infra/monitoring and docker compose usage from bootstrap_all.sh. Confirm ports, services, and required env vars; update SPEC.md and DESIGN.md accordingly."

## 3) Aztec Sandbox E2E
"Inspect staking/aztec/scripts/local-sandbox-e2e.sh to document exact flows and dependencies. Ensure SPEC.md diagram matches."

## 4) InfraKit Skeleton Proposal
"Propose a skeleton layout for staking/infra-kit/ (shared primitives + adapters + runbooks). Keep naming consistent with InfraKit and ensure it matches existing script behaviors."

## 5) Final Review Pass
"Run the multi‑pass `REVIEW_CHECKLIST.md` and resolve any gaps before handoff."
