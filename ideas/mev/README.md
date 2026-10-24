# Uniswap UNIfication MEV Bot

> ⚠️ **Status:** 🚧 Planning Phase - Documentation complete, implementation pending

A solver and MEV bot for exploiting the Uniswap UNIfication arbitrage mechanism.

---

## Quick Links by Audience

| Audience | Document | Time | Description |
|----------|----------|------|-------------|
| 🚀 New Agent | [HANDOFF.md](./HANDOFF.md) | 10 min | Start here - full context and prompts |
| 📋 Task Owner | [TASKS.md](./TASKS.md) | 5 min | Detailed task breakdown by phase |
| 🔬 Researcher | [UNDERSTANDING.md](./UNDERSTANDING.md) | 15 min | Contract details and research |
| ⚡ Quick Start | [NEXT_STEPS.md](./NEXT_STEPS.md) | 5 min | Immediate actions to begin |

---

## The Opportunity

**UNIfication** allows burning **4,000 UNI tokens** (~$24,000 at $6/UNI) to claim accumulated "dusty" assets from Uniswap's TokenJar contract.

```
Profit = Value(TokenJar Assets) - Burn Cost - Gas - Slippage
```

When dusty assets exceed the burn cost, there's an arbitrage opportunity.

---

## Architecture Overview

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Monitor    │───▶│  Valuer     │───▶│  Simulator  │
│  (poll JAR) │    │  (price $)  │    │  (dry-run)  │
└─────────────┘    └─────────────┘    └─────────────┘
                                            │
                                            ▼
                        ┌─────────────┐    ┌─────────────┐
                        │  Logger     │◀───│  Executor   │
                        │  (alerts)   │    │  (Flashbots)│
                        └─────────────┘    └─────────────┘
```

**Modules (parallelizable):**
- **monitor.py** - Poll TokenJar for ERC-20 balances
- **valuer.py** - Price assets including UNI-V2 LPs
- **simulator.py** - Dry-run release() calls
- **executor.py** - Execute via Flashbots (MEV protection)
- **logger.py** - Discord/Telegram alerts

---

## Key Contracts

| Contract | Address | Purpose |
|----------|---------|---------|
| TokenJar | `0xf38521f130fcCF29dB1961597bc5d2b60f995f85` | Holds dusty assets |
| Firepit | `0x0D5Cd355e2aBEB8fb1552F56c965B867346d6721` | Burn UNI to claim |
| UNI Token | `0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984` | Token burned |

---

## Project Structure

```
mev/
├── README.md           # This file - navigation hub
├── HANDOFF.md          # Full context for new agents
├── TASKS.md            # Detailed task breakdown
├── UNDERSTANDING.md    # Research and context
├── NEXT_STEPS.md       # Prioritized actions
├── src/                # Source code (TBD)
│   ├── monitor.py
│   ├── valuer.py
│   ├── simulator.py
│   ├── executor.py
│   └── logger.py
├── tests/              # Unit tests (TBD)
├── configs/            # ABIs and config files (TBD)
└── .env.example        # Environment template (TBD)
```

---

## Quick Start

```bash
# 1. Navigate to project
cd /workspace/ideas/mev

# 2. Read the handoff document
cat HANDOFF.md

# 3. Follow immediate actions in NEXT_STEPS.md
# - Set up environment
# - Fetch contract ABIs
# - Run profitability check
```

---

## Timeline Estimate

| Phase | Duration | Parallelizable |
|-------|----------|----------------|
| 1. Setup & Research | 1-2 days | No |
| 2. Module Development | 3-5 days | Yes (5 agents) |
| 3. Integration | 2-3 days | No |
| 4. Deployment | 1-2 days | No |
| **Total** | **1-2 weeks** | Faster with parallel agents |

---

## Risks

| Risk | Mitigation |
|------|------------|
| Front-running | Flashbots MEV bundles |
| Valuation errors | Multiple oracles, conservative buffers |
| Gas spikes | Max gas limits |
| Governance changes | Monitor proposals |
| Competition | Speed + long-tail focus |

---

## Legal Disclaimer

This project is for **educational and arbitrage purposes only**. Ensure compliance with:
- Uniswap governance terms
- Local regulations on MEV/arbitrage
- Smart contract interaction best practices

---

## See Also

- [Uniswap Governance](https://governance.uniswap.org/)
- [Flashbots Documentation](https://docs.flashbots.net/)
- [Web3.py Documentation](https://web3py.readthedocs.io/)
