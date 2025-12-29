# Handoff Document: Building a Solver and MEV Bot for Uniswap UNIfication Arbitrage

## Document Overview
This handoff document provides a comprehensive blueprint for a future agent (e.g., an AI developer or automation specialist) to build a solver and MEV (Miner Extractable Value) bot exploiting the Uniswap UNIfication mechanism. Based on the provided context from Uniswap's TokenJar (0xf38521f130fcCF29dB1961597bc5d2b60f995f85) and Firepit (0x0D5Cd355e2aBEB8fb1552F56c965B867346d6721) contracts, the opportunity involves burning 4,000 UNI tokens (0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984) to claim undervalued "dusty" assets, including long-tail tokens like UNI-V2 LP positions, when their aggregate value exceeds the burn cost plus fees.

The system aims to automate monitoring, valuation, and execution while minimizing risks like front-running via MEV protection. The design emphasizes parallelization for efficiency: tasks are broken into independent modules that can run concurrently (e.g., via multi-threading, async processing, or distributed agents).

Key goals:
- Detect profitable arbs in real-time, focusing on long-tail assets (obscure ERC-20s and LPs with low individual but high cumulative value).
- Simulate and execute claims securely.
- Integrate MEV strategies (e.g., Flashbots) for private tx submission.
- Handle edge cases: nonce management, max asset array limits (from Firepit ABI), slippage in liquidations, and UNI price volatility.

Assumptions:
- Ethereum mainnet access via RPC (e.g., Infura/Alchemy).
- Wallet with sufficient UNI and ETH for gas.
- Development in Python (Web3.py) or Solidity for solvers.
- Compliance: This is for educational/arbitrage purposes; ensure legal alignment with Uniswap governance.

## Contract Addresses (Ethereum Mainnet)

| Contract | Address | Purpose |
|----------|---------|---------|
| TokenJar | `0xf38521f130fcCF29dB1961597bc5d2b60f995f85` | Holds dusty assets |
| Firepit | `0x0D5Cd355e2aBEB8fb1552F56c965B867346d6721` | Burn UNI to claim assets |
| UNI Token | `0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984` | Token to burn |

## Parallelized Prompt Structure
To enable parallel development and execution, the overall system is framed as a master prompt with sub-prompts for modular components. The master prompt orchestrates the bot, while sub-prompts define independent tasks that can be assigned to separate agents or threads. Each sub-prompt is self-contained, with inputs/outputs for integration.

### Master Prompt for the Agent
"You are an expert blockchain developer building a full-stack solver and MEV bot for Uniswap UNIfication arbitrage. Using Web3.py, Etherscan APIs, and MEV tools like Flashbots, create a system that monitors TokenJar balances, values assets (including long-tail UNI-V2 LPs), checks profitability against a 4,000 UNI burn (current threshold), and executes claims via Firepit.release() when profitable. Prioritize long-tail arbs by aggregating dusty tokens. Implement MEV protection to avoid front-running. Break the build into parallel tasks: monitoring, valuation, simulation, execution, and logging. Output code modules, deployment instructions, and a main script to run the bot continuously."

### Sub-Prompts for Parallelized Tasks
These can be executed in parallel by assigning them to different agents/threads. Each outputs artifacts (e.g., code files, configs) that feed into the master integration.

#### 1. Monitoring Module Prompt (Parallel Task: Real-time data polling)
"Develop a Python module (monitor.py) using Web3.py to poll the TokenJar contract (address: 0xf38521f130fcCF29dB1961597bc5d2b60f995f85) every 5-10 minutes for all ERC-20 balances. Use multicall or The Graph for efficiency to fetch balances of major tokens (USDT, WETH, USDC, WBTC, PAXG) and long-tail assets (scan for all non-zero holdings, especially UNI-V2 LPs). Output a JSON of {token_address: balance} and trigger valuation if total estimated value > $20,000 (buffer for UNI at ~$6). Include error handling for RPC rate limits and integrate with a database (e.g., SQLite) for historical tracking."

#### 2. Valuation Module Prompt (Parallel Task: Asset pricing and liquidation simulation)
"Create a valuation module (valuer.py) that takes a JSON of TokenJar balances and computes aggregate USD value. Use CoinGecko API for prices; for UNI-V2 LPs, simulate unwinding (fetch reserves via Uniswap V2 factory, calculate underlying value, estimate slippage via 1inch API). Focus on long-tail: group small balances (<$1 each) and find optimal subsets within Firepit's max release array length (query ABI for MAX_RELEASE_LENGTH). Output profitability score: (total_value - (4000 * UNI_price) - gas_estimate - slippage_buffer). Handle obscure tokens by defaulting to zero if unpriceable."

#### 3. Simulation Module Prompt (Parallel Task: Dry-run testing)
"Build a simulation module (simulator.py) using Web3.py to dry-run Firepit.release() calls. Input: asset array from valuer. Simulate tx with eth_call, estimate gas, and predict post-claim TokenJar state. Test edge cases: nonce increments (start from current nonce via contract query), array limits, and burn failures. Output a report: 'Profitable: Yes/No, Expected Profit: $X, Risks: [list]'. Integrate with valuation output for iterative optimization of asset selections."

#### 4. Execution Module Prompt (Parallel Task: Tx building and MEV submission)
"Develop an execution module (executor.py) for live claims. Using a private key/wallet, build and sign tx for Firepit.release(nonce, assets, recipient). Ensure UNI approval (infinite if needed). For MEV: Use Flashbots (mev-share or bundle) to submit privately, avoiding mempool exposure. Include back-running protection and retry logic. Trigger only if simulation confirms >10% profit margin. Log tx hashes and outcomes."

#### 5. Logging and Alerting Module Prompt (Parallel Task: Monitoring and notifications)
"Create a logging module (logger.py) with Discord/Telegram alerts for detected arbs and executions. Use logging libraries to track all module outputs in a central dashboard (e.g., via Prometheus or simple file). Include metrics: arb frequency, historical profits, UNI burn impacts. Run as a background service that aggregates data from other modules."

## Quick Start for New Agents

1. **Read this document** - Understand the opportunity and architecture
2. **Review TASKS.md** - See detailed task breakdown by phase
3. **Check UNDERSTANDING.md** - Research context and contract details
4. **Follow NEXT_STEPS.md** - Prioritized action items

## See Also
- [TASKS.md](./TASKS.md) - Detailed task breakdown
- [UNDERSTANDING.md](./UNDERSTANDING.md) - Context and research
- [NEXT_STEPS.md](./NEXT_STEPS.md) - Prioritized next steps
- [README.md](./README.md) - Project overview
