# Agent Index - Aztec Liquid Staking Protocol

**Last Updated:** 2025-12-30
**Status:** Phase 2, 4, 4.5 Complete → Ready for Phase 3 (Integration Tests), Phase 5 (Security)

---

## Quick Start for Agents

| I want to work on... | Go to | Start command |
|---------------------|-------|---------------|
| Frontend | `frontend/README.md` | `cd frontend && npm run dev` |
| Bots | `bots/README.md` | `cd bots/staking-keeper && npm run dev` |
| Security | `docs/AGENT-PROMPTS-QUICKREF.md` Prompt 4 | Read contracts first |
| Integration Tests | `docs/TASKS.md` TASK-201+ | Needs aztec-nargo |
| Contracts (review) | `contracts/AGENT_HANDOFF.md` | `nargo test` |

---

## Current Status

### ✅ Complete (Phase 2 - Smart Contracts)
```
contracts/
├── liquid-staking-core/   37 functions ✅
├── rewards-manager/       33 functions ✅
├── vault-manager/         28 functions ✅
├── withdrawal-queue/      24 functions ✅
├── aztec-staking-pool/    21 functions ✅
├── validator-registry/    20 functions ✅
├── staked-aztec-token/    13 functions ✅
└── staking-math-tests/    64 tests ✅
```

### ✅ Complete (Phase 4 - Bots)
```
bots/
├── shared/                5 utilities ✅
├── staking-keeper/        Batch staking ✅
├── rewards-keeper/        Claims + rate updates ✅
├── withdrawal-keeper/     Queue processing ✅
├── monitoring/            Health + alerts ✅
└── k8s/                   6 manifests ✅
```

### ✅ Complete (Phase 4.5 - Frontend)
```
frontend/
├── components/ui/         6 atomic components ✅
├── components/            5 feature components ✅
├── hooks/                 3 mock hooks ✅
└── __tests__/             43 tests passing ✅
```

### 🚀 Ready to Start
- **Integration Tests:** TASK-201-204 (requires aztec-nargo)
- **Security Review:** TASK-401-403 (documentation + audit prep)
- **Deployment:** TASK-501-504 (after security review)

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
# Expected: 64 tests passed

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

## Contract Interface Reference

For frontend and bot developers, here are the key contract functions:

### LiquidStakingCore
```typescript
deposit(amount: u128, exchange_rate: u64, nonce: Field) → u128 // returns stAZTEC
request_withdrawal(st_aztec_amount: u128, exchange_rate: u64, timestamp: u64) → u64 // returns request_id
get_tvl() → u128
get_pending_pool() → u128
is_batch_ready() → bool
```

### StakedAztecToken
```typescript
balance_of(account: AztecAddress) → u128
get_exchange_rate() → u64  // 10000 = 1.0
get_total_supply() → u128
convert_to_aztec(st_aztec_amount: u128) → u128
convert_to_st_aztec(aztec_amount: u128) → u128
```

### WithdrawalQueue
```typescript
get_queue_length() → u64
is_claimable(request_id: u64, current_timestamp: u64) → bool
time_until_claimable(request_id: u64, current_timestamp: u64) → u64
get_request_amount(request_id: u64) → u128
```

### RewardsManager
```typescript
get_exchange_rate() → u64
get_estimated_apy() → u64  // basis points
get_total_rewards() → u128
```

---

*For questions, check `docs/TASKS.md` or contract source files in `contracts/*/src/main.nr`*
