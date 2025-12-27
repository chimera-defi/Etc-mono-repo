# Aztec Liquid Staking - Agent Handoff Document

**Session:** claude/aztec-staking-review-NZIom
**Date:** 2025-12-27
**Status:** Core contracts implemented, pending compilation & integration

---

## 🎯 Quick Context (30 seconds)

We're building **stAZTEC** - a liquid staking protocol for Aztec Network. Users deposit AZTEC, receive stAZTEC tokens, earn ~8% APY. Similar to Lido's stETH but for Aztec's ZK rollup.

**Current State:**
- ✅ 6 Noir contracts written (~2,000 lines)
- ⏳ Contracts NOT compiled (requires Docker + aztec-nargo)
- ⏳ Cross-contract integration has TODO stubs
- ⏳ No integration tests yet

---

## 📁 Key Files Map

```
staking/
├── contracts/aztec-staking-pool/
│   ├── src/
│   │   ├── main.nr                    # Original StakingPool (✅ compiled)
│   │   ├── staked_aztec_token.nr      # stAZTEC token (⏳ pending)
│   │   ├── liquid_staking_core.nr     # Entry point (⏳ pending)
│   │   ├── vault_manager.nr           # 200k batching (⏳ pending)
│   │   ├── withdrawal_queue.nr        # 7-day unbonding (⏳ pending)
│   │   └── rewards_manager.nr         # Fee distribution (⏳ pending)
│   ├── COMPILATION-STATUS.md          # Build status & gaps
│   └── Nargo.toml                     # Aztec v2.1.9 deps
│
├── research/aztec/
│   ├── TASKS.md                       # 37 tasks (7 done, 30 remaining)
│   ├── IMPLEMENTATION-PLAN.md         # 6-month roadmap
│   ├── ECONOMICS.md                   # Revenue/cost model
│   ├── ASSUMPTIONS.md                 # Validation log
│   └── EXECUTIVE-SUMMARY.md           # 1-pager
│
└── README.md                          # Project overview
```

---

## 🔧 Architecture (One Diagram)

```
User → LiquidStakingCore.deposit(AZTEC) → mint stAZTEC
         ↓                    ↓              ↓
   VaultManager         StakedAztecToken   WithdrawalQueue
   (batch 200k)         (exchange rate)    (7-day unbond)
         ↓                    ↑
   Aztec Native      ← RewardsManager
   Staking             (claim rewards, update rate)
```

---

## 🚀 Parallel Agent Work Streams

### Stream A: Contract Compilation & Testing
**Goal:** Compile all 6 contracts, fix syntax errors
**Requires:** Docker environment with aztec-nargo
**Deliverable:** All contracts compile, basic unit tests pass

### Stream B: Cross-Contract Integration
**Goal:** Replace TODO stubs with actual contract calls
**Focus Files:** `liquid_staking_core.nr` lines with `// TODO:`
**Deliverable:** Contracts can call each other

### Stream C: Keeper Bot Infrastructure
**Goal:** Build TypeScript bots that trigger on-chain actions
**Focus:** Staking keeper (200k threshold), Rewards keeper (hourly)
**Deliverable:** Bot skeleton with Aztec RPC connection

### Stream D: Integration Tests
**Goal:** End-to-end tests on Aztec sandbox
**Focus:** Deposit → mint → withdraw → claim flow
**Deliverable:** Working test suite in TypeScript

---

## 📋 Immediate Next Tasks (Priority Order)

1. **TASK-001A** - Local sandbox smoke test (Docker required)
2. **TASK-106/107** - Implement deposit/withdraw cross-contract calls
3. **TASK-201** - Integration test: full deposit flow
4. **TASK-301** - Staking keeper bot skeleton

---

## ⚠️ Critical Gotchas

1. **Aztec ≠ EVM**: Don't use Solidity patterns. No `msg.sender`, use `context.msg_sender()`
2. **Fixed arrays only**: Noir has no dynamic arrays. Use `[T; N]` with count tracking
3. **Docker required**: aztec-nargo only works via Docker container
4. **No private→public reads**: Private functions cannot read public storage
5. **Cross-contract calls**: Use `.call(&mut context)` for public, `.enqueue()` for private→public

---

## 🔗 Essential Links

- Aztec Docs: https://docs.aztec.network/
- Token Tutorial: https://docs.aztec.network/developers/docs/tutorials/contract_tutorials/token_contract
- Sandbox Setup: https://docs.aztec.network/developers/docs/getting_started/sandbox
- Devnet RPC: https://next.devnet.aztec-labs.com

---

## 📊 Progress Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Contracts written | 6/6 | 6/6 ✅ |
| Contracts compiled | 1/6 | 6/6 |
| Tasks completed | 7/37 | 37/37 |
| Test coverage | 0% | 80% |
| Integration tests | 0 | 50+ |

---

## 💡 For Director/Coordinator

When spawning parallel agents, use these prompts in the next section.
Each agent should work on a separate stream without blocking others.
Merge points:
- Stream A must complete before Stream D can run integration tests
- Stream B can run in parallel with everything
- Stream C needs contract ABIs from Stream A
