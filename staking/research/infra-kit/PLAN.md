# InfraKit Integration Plan (Shared Control Plane)

## Phase 0: Due Diligence

1) Confirm licensing or obtain explicit permission for reuse.
2) Inventory eth2-quickstart scripts and map them to InfraKit modules.
3) Identify overlap with staking/monad/infra scripts.

## Phase 1: Shared Infra Skeleton

1) Create `infra/shared/` with reusable modules (InfraKit core):
   - `provision/` (user creation, base packages, updates)
   - `hardening/` (ssh hardening, firewall, fail2ban, sysctl)
   - `services/` (systemd helpers, env templates)
   - `monitoring/` (status endpoints, metrics wiring)
2) Keep project-specific adapters minimal:
   - `staking/monad/infra` becomes a thin wrapper around shared modules.
   - Future ETH2/validator projects can use the same layer.

## Phase 2: Script Reuse + Refactor

1) Extract eth2-quickstart primitives (run_1.sh, exports.sh, client selection,
   service install) into shared modules.
2) Replace duplicated logic in staking/monad/infra scripts with shared modules.
3) Add compatibility shims for different chains (ports, binaries, config paths).

## Phase 3: Ops Standards

1) Standardize env files, log locations, and systemd units.
2) Add a single runbook template + project overrides.
3) Add smoke-test scripts that run across projects.

## Phase 4: Validation

1) Dry-run on a clean VPS (provision -> harden -> install -> status check).
2) Verify rollback paths and non-destructive behavior.
3) Document verified server profiles.

## Deliverables

- Shared infra modules (shell/Python) with clear interfaces.
- Project adapters for staking/monad and future validator stacks.
- Unified runbook, checklists, and smoke tests.

## Validator Similarities & Differences (High Level)

References:
- Ethereum nodes & clients: https://ethereum.org/developers/docs/nodes-and-clients/
- Monad docs: https://docs.monad.xyz/
- Aztec docs: https://docs.aztec.network/

Similarities (shared InfraKit scope):
- Server provisioning, hardening, and monitoring.
- Systemd service management and env config.
- RPC health checks and status endpoints.

Differences (adapter scope):
- **Ethereum:** execution + consensus clients (beacon chain).
- **Monad:** monad-bft validator (single L1 stack).
- **Aztec:** L2 rollup roles (sequencer/prover/committee), different node types.

## Diagram (Plan Flow)

```
Phase 0  ->  Phase 1  ->  Phase 2  ->  Phase 3  ->  Phase 4
Licensing    Shared       Refactor     Standards    Validation
Inventory    Modules      Adapters     Runbooks     Proof
Overlap      Skeleton     Reuse         Smoke tests  VPS dry-run
```
