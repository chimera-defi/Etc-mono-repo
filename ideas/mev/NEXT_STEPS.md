# Next Steps: Uniswap UNIfication MEV Bot

## Prioritized Action Items

This document provides a clear path forward for agents starting work on this project.

---

## Immediate Actions (Start Here)

### Priority 0: Environment Setup (30 minutes)

```bash
# 1. Create project structure
cd /workspace/ideas/mev
mkdir -p src tests configs

# 2. Initialize Python environment
python3 -m venv venv
source venv/bin/activate

# 3. Install core dependencies
pip install web3 requests python-dotenv

# 4. Create .env file
cat > .env.example << 'EOF'
# Ethereum RPC
ETH_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
# Or Alchemy: https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY

# APIs
ETHERSCAN_API_KEY=YOUR_KEY
COINGECKO_API_KEY=YOUR_KEY  # Optional, for higher rate limits

# Wallet (DO NOT COMMIT .env!)
PRIVATE_KEY=0x...
WALLET_ADDRESS=0x...

# Alerts (Optional)
DISCORD_WEBHOOK_URL=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
EOF
```

### Priority 1: Contract Research (1 hour)

```bash
# Fetch ABIs from Etherscan
# TokenJar
curl "https://api.etherscan.io/api?module=contract&action=getabi&address=0xf38521f130fcCF29dB1961597bc5d2b60f995f85" > configs/tokenjar_abi.json

# Firepit
curl "https://api.etherscan.io/api?module=contract&action=getabi&address=0x0D5Cd355e2aBEB8fb1952F56c965B867346d6721" > configs/firepit_abi.json
```

**Document findings in UNDERSTANDING.md:**
- [ ] `release()` function signature
- [ ] `MAX_RELEASE_LENGTH` value
- [ ] Nonce mechanism
- [ ] Any access controls

### Priority 2: Quick Profitability Check (2 hours)

Before building the full bot, verify opportunity exists:

```python
# Quick script to check TokenJar value
from web3 import Web3
import json

# Connect
w3 = Web3(Web3.HTTPProvider(os.getenv('ETH_RPC_URL')))

# Known tokens to check
TOKENS = {
    'WETH': '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    'USDC': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    'USDT': '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    'UNI': '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
}

TOKEN_JAR = '0xf38521f130fcCF29dB1961597bc5d2b60f995f85'

# ERC-20 ABI (balanceOf only)
ERC20_ABI = [{"inputs":[{"name":"account","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]

for name, addr in TOKENS.items():
    contract = w3.eth.contract(address=addr, abi=ERC20_ABI)
    balance = contract.functions.balanceOf(TOKEN_JAR).call()
    print(f"{name}: {balance}")
```

---

## Phase-by-Phase Execution

### Phase 1 Complete Checklist

Before moving to Phase 2:
- [ ] .env.example created with all required variables
- [ ] ABIs fetched and saved to configs/
- [ ] `release()` function documented
- [ ] `MAX_RELEASE_LENGTH` known
- [ ] Quick profitability check shows opportunity exists
- [ ] UNI price volatility understood

### Phase 2 Parallel Kickoff

**For Agent Coordinator:**

Spawn 5 parallel agents with these specific prompts:

#### Agent A: Monitoring Module
```
Read /workspace/ideas/mev/HANDOFF.md, then build monitor.py:
- Use Web3.py to poll TokenJar (0xf38521f130fcCF29dB1961597bc5d2b60f995f85)
- Fetch all ERC-20 balances including UNI-V2 LPs
- Output JSON: {token_address: {balance, decimals, symbol}}
- Add SQLite tracking
- Include RPC rate limit handling
```

#### Agent B: Valuation Module
```
Read /workspace/ideas/mev/HANDOFF.md, then build valuer.py:
- Take monitor.py JSON output as input
- Price tokens via CoinGecko API
- Simulate UNI-V2 LP unwinding for value
- Use 1inch API for slippage estimation
- Output profitability score considering 4000 UNI burn cost
```

#### Agent C: Simulation Module
```
Read /workspace/ideas/mev/HANDOFF.md, then build simulator.py:
- Dry-run Firepit.release() using eth_call
- Estimate gas costs
- Manage nonce from contract state
- Output: profitability report with risks
```

#### Agent D: Execution Module
```
Read /workspace/ideas/mev/HANDOFF.md, then build executor.py:
- Build and sign Firepit.release() transactions
- Handle UNI approval flow
- Integrate Flashbots for MEV protection
- Only execute if >10% profit margin
```

#### Agent E: Logging Module
```
Read /workspace/ideas/mev/HANDOFF.md, then build logger.py:
- Set up structured logging to file
- Discord webhook alerts for opportunities
- Telegram bot alerts (optional)
- Track metrics: arb frequency, profits, gas costs
```

---

## Success Criteria

### Minimum Viable Product (MVP)
- [ ] Can enumerate TokenJar holdings
- [ ] Can value holdings (within 10% accuracy)
- [ ] Can simulate release() transactions
- [ ] Can execute via Flashbots
- [ ] Alerts on profitable opportunities

### Production Ready
- [ ] 24/7 operation with auto-restart
- [ ] Handles all error cases gracefully
- [ ] Historical tracking and analytics
- [ ] < 5% false positive rate on profitability
- [ ] Documented runbook for operations

---

## Risk Checkpoints

Before each phase transition, verify:

### Before Phase 2 → Phase 3
- [ ] All 5 modules have unit tests passing
- [ ] ABIs are correctly parsed
- [ ] API rate limits are handled
- [ ] Slippage estimates are conservative

### Before Phase 3 → Phase 4
- [ ] End-to-end test on testnet/fork
- [ ] Flashbots integration tested
- [ ] Profit calculations verified manually
- [ ] Gas estimates accurate within 20%

### Before Production
- [ ] Wallet has sufficient UNI + ETH
- [ ] Alerts configured and tested
- [ ] Monitoring dashboards working
- [ ] Runbook reviewed

---

## Common Pitfalls to Avoid

1. **Overestimating long-tail value** - Many obscure tokens have zero liquidity
2. **Ignoring slippage** - Large LP positions can have significant slippage when unwinding
3. **Missing nonce updates** - Each release() increments the nonce; track it
4. **Public mempool exposure** - ALWAYS use Flashbots for execution
5. **UNI price volatility** - A 10% UNI pump can wipe out profit margin

---

## See Also
- [HANDOFF.md](./HANDOFF.md) - Main handoff document
- [TASKS.md](./TASKS.md) - Detailed task breakdown
- [UNDERSTANDING.md](./UNDERSTANDING.md) - Context and research
