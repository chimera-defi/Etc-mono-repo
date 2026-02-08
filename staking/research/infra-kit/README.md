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
**InfraKit** (tentative). Keep naming consistent in docs.

## Control Plane (MVP)
In phase 1, the **control plane is the repo itself** (scripts + runbooks). A hosted control plane
(API/UI) is optional in future phases.

## Docs
- `DESIGN.md` — concise top‑level architecture for human review.
- `SPEC.md` — verified script inventory + mapping into shared primitives.
- `PLAN.md` — phased execution plan.
- `TASKS.md` — checklist of concrete next steps.
- `PROMPTS.md` — handoff prompts for future agents.
