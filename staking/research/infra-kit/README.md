# InfraKit: Shared Staking Infra Layer (Research)

This folder defines the **shared staking infra layer** for validator operations across chains
(Ethereum, Monad, Aztec, etc.). The goal is to **reuse common server‑ops primitives** while
keeping chain‑specific logic in thin adapters.

Sources reviewed:
- https://eth2quickstart.com/
- https://github.com/chimera-defi/eth2-quickstart (default branch `master`)
- `staking/monad/infra/scripts/` (current production scripts)
- `staking/aztec/scripts/` (Aztec dev + testing toolchain)

## Working Name
**InfraKit** (tentative). Alternative names can be decided later; keep naming consistent in docs.

## What Exists vs What Is Planned
- **Exists today:** eth2‑quickstart scripts + Monad infra scripts + Aztec dev/test scripts.
- **Planned:** a shared module library + per‑chain adapters built from the existing scripts.

## Concise Architecture (Human Review)
See `DESIGN.md` for the top‑level architecture and diagrams.

## Docs
- `DESIGN.md` — concise top‑level architecture for human review.
- `SPEC.md` — verified script inventory + mapping into shared primitives.
- `PLAN.md` — phased execution plan for next agents.
- `TASKS.md` — checklist of concrete next steps.
- `PROMPTS.md` — handoff prompts for future agents.
