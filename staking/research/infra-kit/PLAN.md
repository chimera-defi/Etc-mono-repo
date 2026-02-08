# InfraKit Plan (Shared Staking Infra Layer)

## Phase 0: Inventory (Now)
- Confirm current script behaviors (eth2‑quickstart, Monad infra, Aztec dev scripts).
- Capture verified flows in `SPEC.md`.
- Align naming on **InfraKit**.

## Phase 1: Shared Primitive Library (Design‑First)
- Define **shared primitives** (provision, hardening, systemd, monitoring).
- Decide target code location: `staking/infra-kit/shared/`.
- Draft minimal interfaces for each primitive.

## Phase 2: Adapters (Chain‑Specific)
- **Ethereum adapter**: wrap `run_1.sh` / `run_2.sh` into shared primitives.
- **Monad adapter**: refactor `setup_server.sh` flow to call shared primitives.
- **Aztec adapter**: start with dev/test tooling alignment; add production roles later.

## Phase 3: Runbooks + Smoke Tests
- Create per‑adapter runbooks and smoke tests.
- Standardize env paths and systemd conventions.

## Phase 4: Validation
- Dry‑run on clean VPS for each adapter.
- Verify idempotency and non‑destructive behavior.

## Deliverables
- Shared primitives library.
- Adapters for Ethereum + Monad (Aztec dev tooling initially).
- Runbooks + smoke tests.
