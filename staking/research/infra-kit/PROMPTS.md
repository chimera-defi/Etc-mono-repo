# InfraKit Handoff Prompts

## 1) Verify Ethereum Install Scripts
"Inspect eth2‑quickstart install scripts referenced by run_2.sh. Confirm whether systemd units are installed, which config paths are used, and document the exact steps in SPEC.md. Avoid assumptions."

## 2) Validate Monad Monitoring Stack
"Review staking/monad/infra/monitoring and docker compose usage from bootstrap_all.sh. Confirm ports, services, and any required env vars; update SPEC.md and DESIGN.md accordingly."

## 3) Aztec Sandbox E2E
"Inspect staking/aztec/scripts/local-sandbox-e2e.sh to document exact flows and dependencies. Add a short, verified flow diagram to SPEC.md."

## 4) InfraKit Skeleton Proposal
"Propose a skeleton layout for staking/infra-kit/ (shared primitives + adapters + runbooks). Keep naming consistent with InfraKit and ensure it matches existing script behaviors."
