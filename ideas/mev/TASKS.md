# Tasks: Uniswap UNIfication MEV Bot

## Task Breakdown

The build process is divided into phases with parallelizable steps. Total estimated timeline: 1-2 weeks for a single developer, faster with parallel agents.

---

## Phase 1: Research and Setup (Sequential, 1-2 days)

| ID | Task | Status | Owner | Notes |
|----|------|--------|-------|-------|
| 1.1 | Review Uniswap governance proposals on UNIfication | ⬜ Pending | - | Check governance.uniswap.org |
| 1.2 | Query TokenJar ABI from Etherscan | ⬜ Pending | - | Address: 0xf38521f130fcCF29dB1961597bc5d2b60f995f85 |
| 1.3 | Query Firepit ABI from Etherscan | ⬜ Pending | - | Address: 0x0D5Cd355e2aBEB8fb1552F56c965B867346d6721 |
| 1.4 | Set up dev environment | ⬜ Pending | - | Python venv, Web3.py, requests |
| 1.5 | Create .env template | ⬜ Pending | - | RPC URLs, API keys placeholders |
| 1.6 | Document MAX_RELEASE_LENGTH from Firepit | ⬜ Pending | - | Critical for asset selection |

---

## Phase 2: Module Development (Parallel, 3-5 days)

### Module A: Monitoring (`monitor.py`)

| ID | Task | Status | Owner | Parallel? |
|----|------|--------|-------|-----------|
| 2.A.1 | Set up Web3.py connection to mainnet | ⬜ Pending | Agent A | ✅ Yes |
| 2.A.2 | Implement ERC-20 balance fetching | ⬜ Pending | Agent A | ✅ Yes |
| 2.A.3 | Add multicall support for efficiency | ⬜ Pending | Agent A | ✅ Yes |
| 2.A.4 | Implement UNI-V2 LP detection | ⬜ Pending | Agent A | ✅ Yes |
| 2.A.5 | Add SQLite historical tracking | ⬜ Pending | Agent A | ✅ Yes |
| 2.A.6 | Implement rate limit handling | ⬜ Pending | Agent A | ✅ Yes |
| 2.A.7 | Unit tests with mock data | ⬜ Pending | Agent A | ✅ Yes |

### Module B: Valuation (`valuer.py`)

| ID | Task | Status | Owner | Parallel? |
|----|------|--------|-------|-----------|
| 2.B.1 | Integrate CoinGecko API for prices | ⬜ Pending | Agent B | ✅ Yes |
| 2.B.2 | Implement UNI-V2 LP unwinding simulation | ⬜ Pending | Agent B | ✅ Yes |
| 2.B.3 | Add 1inch API for slippage estimation | ⬜ Pending | Agent B | ✅ Yes |
| 2.B.4 | Build optimal subset selection algorithm | ⬜ Pending | Agent B | ✅ Yes |
| 2.B.5 | Calculate profitability score | ⬜ Pending | Agent B | ✅ Yes |
| 2.B.6 | Handle unpriceable tokens (default zero) | ⬜ Pending | Agent B | ✅ Yes |
| 2.B.7 | Unit tests with mock balances | ⬜ Pending | Agent B | ✅ Yes |

### Module C: Simulation (`simulator.py`)

| ID | Task | Status | Owner | Parallel? |
|----|------|--------|-------|-----------|
| 2.C.1 | Implement eth_call dry-run | ⬜ Pending | Agent C | ✅ Yes |
| 2.C.2 | Gas estimation logic | ⬜ Pending | Agent C | ✅ Yes |
| 2.C.3 | Nonce management from contract | ⬜ Pending | Agent C | ✅ Yes |
| 2.C.4 | Array limit validation | ⬜ Pending | Agent C | ✅ Yes |
| 2.C.5 | Generate profitability reports | ⬜ Pending | Agent C | ✅ Yes |
| 2.C.6 | Test edge cases (burn failures, etc.) | ⬜ Pending | Agent C | ✅ Yes |

### Module D: Execution (`executor.py`)

| ID | Task | Status | Owner | Parallel? |
|----|------|--------|-------|-----------|
| 2.D.1 | Build tx for Firepit.release() | ⬜ Pending | Agent D | ✅ Yes |
| 2.D.2 | Implement UNI approval flow | ⬜ Pending | Agent D | ✅ Yes |
| 2.D.3 | Integrate Flashbots bundle submission | ⬜ Pending | Agent D | ✅ Yes |
| 2.D.4 | Add back-running protection | ⬜ Pending | Agent D | ✅ Yes |
| 2.D.5 | Implement retry logic | ⬜ Pending | Agent D | ✅ Yes |
| 2.D.6 | Profit margin gating (>10%) | ⬜ Pending | Agent D | ✅ Yes |

### Module E: Logging (`logger.py`)

| ID | Task | Status | Owner | Parallel? |
|----|------|--------|-------|-----------|
| 2.E.1 | Set up structured logging | ⬜ Pending | Agent E | ✅ Yes |
| 2.E.2 | Implement Discord webhook alerts | ⬜ Pending | Agent E | ✅ Yes |
| 2.E.3 | Implement Telegram bot alerts | ⬜ Pending | Agent E | ✅ Yes |
| 2.E.4 | Create metrics collection | ⬜ Pending | Agent E | ✅ Yes |
| 2.E.5 | Build simple dashboard (optional) | ⬜ Pending | Agent E | ✅ Yes |

---

## Phase 3: Integration and Testing (Sequential, 2-3 days)

| ID | Task | Status | Owner | Notes |
|----|------|--------|-------|-------|
| 3.1 | Create main.py orchestrator | ⬜ Pending | - | Loop: monitor → value → simulate → execute |
| 3.2 | Implement inter-module communication | ⬜ Pending | - | JSON/queues/events |
| 3.3 | Test on Goerli/Sepolia fork | ⬜ Pending | - | Or use Foundry anvil |
| 3.4 | Simulate long-tail scenarios | ⬜ Pending | - | Mock dusty tokens/LPs |
| 3.5 | End-to-end integration tests | ⬜ Pending | - | Full flow validation |

---

## Phase 4: Deployment and Monitoring (Sequential, 1-2 days)

| ID | Task | Status | Owner | Notes |
|----|------|--------|-------|-------|
| 4.1 | Create Dockerfile | ⬜ Pending | - | For containerized deployment |
| 4.2 | Set up AWS Lambda or EC2 | ⬜ Pending | - | 24/7 operation |
| 4.3 | Configure alerting for failures | ⬜ Pending | - | Low balance, failed tx |
| 4.4 | Document governance monitoring | ⬜ Pending | - | Watch for param changes |
| 4.5 | Create runbook for operations | ⬜ Pending | - | Start/stop/debug procedures |

---

## Risk Mitigations

| Risk | Mitigation | Task ID |
|------|------------|---------|
| Front-running | Flashbots MEV bundles | 2.D.3 |
| Valuation errors | Multiple price oracles, conservative buffers | 2.B.1, 2.B.6 |
| Gas spikes | Max gas limits in executor | 2.D.6 |
| Contract changes | Governance monitoring | 4.4 |
| RPC rate limits | Rate limit handling in monitor | 2.A.6 |

---

## Agent Assignment Recommendations

For maximum parallelization, assign 5 agents to Phase 2 modules simultaneously:
- **Agent A** → Monitoring Module (2.A.*)
- **Agent B** → Valuation Module (2.B.*)
- **Agent C** → Simulation Module (2.C.*)
- **Agent D** → Execution Module (2.D.*)
- **Agent E** → Logging Module (2.E.*)

All Phase 2 tasks are independent and can run in parallel. Integration (Phase 3) requires all modules complete.

## See Also
- [HANDOFF.md](./HANDOFF.md) - Main handoff document
- [UNDERSTANDING.md](./UNDERSTANDING.md) - Context and research
- [NEXT_STEPS.md](./NEXT_STEPS.md) - Prioritized next steps
