# Staking Protocol Handoff - December 2025

**Status:** Architecture Complete | Contracts In-Progress (Stubbed) | Frontend/Infra Not Started
**Priority:** High - Execute Parallel Build Tracks

This document serves as the central entry point for the implementation phase. We are moving from research to execution.

---

## 🚀 Immediate Action Plan (Parallel Tracks)

We are splitting execution into three parallel tracks to accelerate development. Each track can be handled by a specialized agent or developer.

| Track | Focus | Goal | Key Task |
|-------|-------|------|----------|
| **Track A** | 🧠 Smart Contracts | Enable real value transfer (remove stubs) | [TASK-106](./research/aztec/TASKS.md) |
| **Track B** | 🎨 Frontend | Build UI skeleton with mocks | [TASK-205](./research/aztec/TASKS.md) |
| **Track C** | ⚙️ Infrastructure | Scaffold bot monorepo | [TASK-301](./research/aztec/TASKS.md) |

---

## 🤖 Agent Prompts

Copy and paste these prompts to specialized agents to kick off the work.

### Agent 1: Smart Contract Engineer (Track A)
> "You are the Lead Noir Engineer. We have a critical blocker in the `aztec-staking-pool` contract: it calculates shares correctly but cannot move funds.
>
> Please execute **TASK-106** from `staking/research/aztec/TASKS.md`.
> 1. Read `staking/contracts/aztec-staking-pool/src/main.nr`.
> 2. Define the `Token` interface trait at the top of the file (as specified in TASK-106).
> 3. Replace the `TODO` comments in `deposit` and `withdraw` with actual calls to `Token.transfer_from` and `Token.transfer`.
> 4. Compile with `aztec-nargo compile` to verify the interface usage is valid."

### Agent 2: Frontend Developer (Track B)
> "You are the Frontend Lead. We need to start the UI immediately to unblock the product team.
>
> Please execute **TASK-205** from `staking/research/aztec/TASKS.md`.
> 1. Initialize a Next.js 14 + Tailwind project in `staking/frontend`.
> 2. Create the `StakingCard` and `StatsCard` components described in the task.
> 3. Implement the `useStakingContract` hook with **mocked data** (simulated delays/balances) so we can test the UI flow before the contracts are live on testnet."

### Agent 3: Infrastructure Engineer (Track C)
> "You are the DevOps Lead. We need a unified repo for our off-chain bots.
>
> Please execute **TASK-301** from `staking/research/aztec/TASKS.md`.
> 1. Create a `staking/bots` directory.
> 2. Initialize a TypeScript Monorepo (using npm workspaces) with the structure defined in TASK-301 (`apps/staking-keeper`, `apps/rewards-keeper`, `packages/common`).
> 3. Create a basic `Dockerfile` in `apps/staking-keeper` to demonstrate runnability."

---

## 📚 Critical Context

- **Master Plan:** [IMPLEMENTATION-PLAN.md](./research/aztec/IMPLEMENTATION-PLAN.md) - The 6-month roadmap.
- **Task List:** [TASKS.md](./research/aztec/TASKS.md) - detailed specs for every task.
- **Contract Code:** `staking/contracts/aztec-staking-pool/src/main.nr` - The current contract state.

**Note on Environment:**
- Aztec tooling (`aztec-nargo`) requires Docker.
- If running in a restricted environment, you may only be able to modify code and verify standard Noir syntax (`nargo check`), but full compilation might fail. Focus on code correctness first.
