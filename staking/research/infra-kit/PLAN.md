# InfraKit Research‑First Plan

## Step 0: Research Checklist (Do First)
1) **eth2‑quickstart**
   - Verify run_1/run_2/exports/common_functions flows.
   - Inspect `install/security/*` and `install/web/*`.
   - Confirm systemd services and firewall/SSL behavior.
2) **Monad infra**
   - Walk all scripts in `staking/monad/infra/scripts/` and mark shared vs Monad‑specific steps.
   - Confirm monitoring stack usage and ports.
3) **Aztec scripts**
   - Review `setup-env`, `smoke-test`, `integration-test`, `local-sandbox-e2e`.
   - Mark these as dev/test tooling only (no production roles).

## Step 1: Extract Shared Primitives
- Provision: base packages + user creation.
- Hardening: SSH, UFW, fail2ban, unattended upgrades, sysctl.
- Services: systemd install helpers + env file handling.
- Monitoring: status endpoint + health checks.

## Step 2: Define Adapters
- Ethereum adapter: wrap run_1/run_2 and client installers (Geth, Prysm, MEV).
- Monad adapter: wrap monad‑bft install + status service + optional Caddy/UFW.
- Aztec adapter: dev/test tooling only until production roles exist.

## Step 3: Architecture & Diagrams
- Produce top‑level architecture (shared primitives → per‑chain stacks).
- Produce flow diagrams for each adapter.
- Produce a proposed file tree for the future `staking/infra-kit/` module layout.

## Step 4: Validate
- Ensure every diagram is grounded in verified scripts.
- Remove unverified claims or placeholders.
