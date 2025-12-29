# Understanding: Uniswap UNIfication Arbitrage

## Context and Research Strategy

This document provides the context needed to understand the Uniswap UNIfication opportunity and guides research for implementation.

---

## What is UNIfication?

UNIfication is a Uniswap governance mechanism that:
1. Collects "dust" (small, leftover tokens) from various Uniswap operations into the **TokenJar** contract
2. Allows anyone to **burn 4,000 UNI tokens** to claim these dusty assets via the **Firepit** contract
3. Creates an arbitrage opportunity when the aggregate value of dusty assets exceeds the burn cost

### The Opportunity

```
Profit = Value(Dusty Assets) - (4,000 × UNI Price) - Gas - Slippage
```

If Profit > 0, execute the claim via `Firepit.release()`.

---

## Key Contracts

### TokenJar (`0xf38521f130fcCF29dB1961597bc5d2b60f995f85`)

**Purpose:** Holds all the dusty assets accumulated by Uniswap

**Key Information Needed:**
- [ ] List of all ERC-20 token balances held
- [ ] Historical deposit patterns
- [ ] Any transfer restrictions

**Research Tasks:**
1. Query all Transfer events TO the TokenJar to identify held tokens
2. Use multicall to batch balance queries
3. Check for UNI-V2 LP positions (especially valuable long-tail)

### Firepit (`0x0D5Cd355e2aBEB8fb1552F56c965B867346d6721`)

**Purpose:** Allows burning UNI to claim assets from TokenJar

**Key Information Needed:**
- [ ] `release()` function signature and parameters
- [ ] `MAX_RELEASE_LENGTH` - maximum assets per claim
- [ ] Current nonce value (increments per claim)
- [ ] Any cooldown periods or restrictions

**Research Tasks:**
1. Fetch ABI from Etherscan
2. Document all public functions
3. Identify any access controls

### UNI Token (`0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984`)

**Purpose:** Must be burned to claim assets

**Key Information:**
- Standard ERC-20
- Must approve Firepit to spend 4,000 UNI
- Current price: ~$6 (verify before execution)

---

## Long-Tail Asset Strategy

### Why Long-Tail?

"Long-tail" refers to obscure tokens with:
- Low individual value (<$1 each)
- High cumulative value when aggregated
- Less competition from other arbitrageurs

### UNI-V2 LP Positions

These are particularly valuable because:
1. They represent liquidity in Uniswap V2 pairs
2. Can be unwound to underlying tokens
3. Often overlooked by simple scanners

**To value UNI-V2 LPs:**
```python
# Pseudocode
pair_contract = web3.eth.contract(lp_address, pair_abi)
reserves = pair_contract.functions.getReserves().call()
total_supply = pair_contract.functions.totalSupply().call()
lp_balance = token_jar_balance

# Value = (LP balance / total supply) × (reserve0_value + reserve1_value)
share = lp_balance / total_supply
value = share * (price(token0) * reserves[0] + price(token1) * reserves[1])
```

---

## MEV Considerations

### Why MEV Protection Matters

When you submit a profitable arbitrage transaction to the public mempool:
1. Searchers can see your pending tx
2. They can front-run by submitting the same claim with higher gas
3. Your tx either fails or you lose the opportunity

### Flashbots Solution

Flashbots provides private transaction submission:
- Transactions go directly to block builders, not the public mempool
- Prevents front-running
- Can use bundles to guarantee inclusion

**Integration:**
```python
from flashbots import Flashbots

flashbots = Flashbots(w3, signature_account)
bundle = [{"signed_transaction": signed_tx}]
flashbots.send_bundle(bundle, target_block_number=w3.eth.block_number + 1)
```

---

## Research Questions to Answer

### Contract Mechanics
1. What is the exact signature of `Firepit.release()`?
2. What is `MAX_RELEASE_LENGTH`?
3. How does nonce management work?
4. Are there any time-based restrictions?

### Asset Valuation
1. How to efficiently enumerate all TokenJar holdings?
2. Best price oracle for long-tail tokens?
3. How to handle tokens with no liquidity?
4. Slippage estimation for LP unwinding?

### Economic Viability
1. Historical arb frequency and sizes?
2. Competition from other bots?
3. Gas cost patterns on mainnet?
4. UNI price volatility impact?

---

## Tools and Resources

### APIs and Services
| Service | Use | Link |
|---------|-----|------|
| Etherscan | ABI queries, tx history | https://etherscan.io |
| CoinGecko | Token prices | https://api.coingecko.com |
| 1inch | Slippage/DEX routing | https://1inch.io |
| The Graph | Historical queries | https://thegraph.com |
| Flashbots | MEV protection | https://docs.flashbots.net |

### Libraries
| Library | Purpose |
|---------|---------|
| web3.py | Ethereum interaction |
| eth-abi | ABI encoding/decoding |
| flashbots | MEV bundle submission |
| requests | API calls |
| sqlite3 | Historical data storage |

---

## Assumptions to Verify

| Assumption | Status | Notes |
|------------|--------|-------|
| Burn threshold is 4,000 UNI | ⬜ Verify | May change via governance |
| Anyone can call release() | ⬜ Verify | Check access controls |
| Assets transfer immediately | ⬜ Verify | No lock-up period? |
| UNI approval is standard ERC-20 | ⬜ Verify | Check for special logic |
| No flash loan protection | ⬜ Verify | Can't arb with borrowed UNI? |

---

## See Also
- [HANDOFF.md](./HANDOFF.md) - Main handoff document
- [TASKS.md](./TASKS.md) - Detailed task breakdown
- [NEXT_STEPS.md](./NEXT_STEPS.md) - Prioritized next steps
