# InfraKit Prompts (Next Agent Handoff)

## Prompt 1: License & Inventory
"Check the eth2-quickstart repo licensing and inventory the core scripts. Map each script to a shared InfraKit module (provision, hardening, services, monitoring)."

## Prompt 2: Shared Module Skeleton
"Create `infra/shared/` with minimal, idempotent shell modules for base packages, user creation, SSH hardening, UFW firewall, sysctl tuning, and systemd/env installers. Keep modules chain-agnostic."

## Prompt 3: Adapter Refactor
"Refactor `staking/monad/infra` scripts to call shared modules. Add adapter stubs for Ethereum (exec/cons + MEV-Boost) and Aztec (sequencer/prover) with placeholders for binaries/config."

## Prompt 4: Runbook + Validation
"Add a shared runbook template with per-project overrides, a cross-adapter smoke test, and a VPS dry-run checklist. Verify rollback steps." 
