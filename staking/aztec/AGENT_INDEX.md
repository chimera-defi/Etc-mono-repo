# Agent Index - Aztec Liquid Staking Protocol

**Last Updated:** 2026-01-23
**Status:** Phase 2 Complete → Phase 3 in progress (local sandbox validated)

---

## Quick Start for Agents

| I want to work on... | Go to | Start command |
|---------------------|-------|---------------|
| Frontend | `PARALLEL_WORK_HANDOFF.md` §Part 1 | (not yet scaffolded) |
| Bots | `PARALLEL_WORK_HANDOFF.md` §Part 2 | `cd bots/staking-keeper && npm run dev` |
| Security | `docs/AGENT-PROMPTS-QUICKREF.md` Prompt 4 | Read contracts first |
| Integration Tests | `docs/TASKS.md` TASK-201+ | Needs aztec-nargo |
| Contracts (review) | `contracts/AGENT_HANDOFF.md` | `nargo test` |

---

## Current Status

### ✅ Complete (Phase 2)
```
contracts/
├── staked-aztec-token/    20 functions ✅
├── liquid-staking-core/   26 functions ✅
├── withdrawal-queue/      20 functions ✅
└── staking-math-tests/    74 tests ✅
```

### 🚀 Ready to Start (Parallel)
- **Frontend (3 agents):** F1 (UI Kit), F2 (Features), F3 (Integration)
- **Bots (2 agents):** B1 (Staking+Rewards), B2 (Withdrawal+Monitoring)
- **Security (1 agent):** Documentation + threat model
- **BD (1 agent):** Partnership research

---

## Key Documents

| Document | Purpose |
|----------|---------|
| `PARALLEL_WORK_HANDOFF.md` | **START HERE** - Agent prompts for frontend + bots |
| `contracts/AGENT_HANDOFF.md` | Contract status and next steps |
| `contracts/HANDOFF_SUMMARY_2025-12-30.md` | Detailed contract review results |
| `docs/TASKS.md` | Task tracking (TASK-XXX references) |
| `docs/FRONTEND_HANDOFF.md` | Frontend design requirements |
| `docs/AGENT-PROMPTS-QUICKREF.md` | All agent prompts (8 total) |

---

## Verification Commands

```bash
# Verify contracts (must pass before other work)
cd /workspace/staking/aztec/contracts/staking-math-tests
~/.nargo/bin/nargo test
# Expected: 74 tests passed

# Verify frontend (after setup)
cd /workspace/staking/aztec/frontend
npm run build && npm run lint && npm test

# Verify bots (after setup)
cd /workspace/staking/aztec/bots/staking-keeper
npm run build && npm run lint && npm test
```

---

## Agent Assignment Matrix

```
┌──────────────────────────────────────────────────────────────────┐
│                        DAY 1                                      │
├──────────────────────────────────────────────────────────────────┤
│  F1: Setup frontend      B1: Setup bots/shared                   │
│  F2: Start features      B2: Start withdrawal-keeper             │
├──────────────────────────────────────────────────────────────────┤
│                        DAY 2                                      │
├──────────────────────────────────────────────────────────────────┤
│  F1: Deliver UI Kit      B1: Deliver staking-keeper              │
│  F2: Continue features   B2: Deliver withdrawal-keeper           │
│  F3: Start integration                                           │
├──────────────────────────────────────────────────────────────────┤
│                        DAY 3                                      │
├──────────────────────────────────────────────────────────────────┤
│  F2: Deliver features    B1: Deliver rewards-keeper              │
│  F3: Continue            B2: Deliver monitoring                  │
├──────────────────────────────────────────────────────────────────┤
│                        DAY 4                                      │
├──────────────────────────────────────────────────────────────────┤
│  F3: Deliver frontend    B1+B2: K8s manifests                    │
│  All: Integration testing                                        │
└──────────────────────────────────────────────────────────────────┘
```

---

## Contract Interface Reference (Current)

For frontend and bot developers, here are the key contract functions:

### LiquidStakingCore
```typescript
deposit(amount: u128, nonce: Field) → u128 // returns stAZTEC
request_withdrawal(st_aztec_amount: u128, timestamp: u64) → u64 // returns request_id
get_total_deposited() → u128
get_pending_pool() → u128
get_total_staked() → u128
```

### StakedAztecToken
```typescript
balance_of(account: AztecAddress) → u128
balance_of_in_aztec(account: AztecAddress) → u128
get_exchange_rate() → u64  // 10000 = 1.0
total_supply() → u128
convert_to_aztec(st_aztec_amount: u128) → u128
convert_to_st_aztec(aztec_amount: u128) → u128
```

### WithdrawalQueue
```typescript
get_request(request_id: u64) → (user, amount, timestamp, fulfilled)
is_claimable(request_id: u64, current_timestamp: u64) → bool
time_until_claimable(request_id: u64, current_timestamp: u64) → u64
get_total_pending() → u128
```

### RewardsManager
```typescript
get_exchange_rate() → u64
get_estimated_apy() → u64  // basis points
get_total_rewards() → u128
```

---

*For questions, check `docs/TASKS.md` or contract source files in `contracts/*/src/main.nr`*
