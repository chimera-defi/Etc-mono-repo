# API Documentation: Uniswap SDK Arbitrage

Complete API reference for the Uniswap SDK and custom components.

## Core SDK Classes

### Uniswap

Main class for interacting with Uniswap protocol.

```python
from uniswap_sdk import Uniswap

# Initialize
uni = Uniswap(use_v2=True, use_v3=True)

# With custom solver
from my_solver import CustomSolver
uni = Uniswap(use_solver=CustomSolver())
```

#### Methods

##### `price(token_a, token_b) -> Decimal`

Get liquidity-weighted price between two tokens.

**Parameters:**
- `token_a` (str | ContractInstance): Source token
- `token_b` (str | ContractInstance): Destination token

**Returns:** Decimal - Price of token_a in terms of token_b

**Example:**
```python
>>> uni.price("ETH", "USDC")
Decimal("2000.50")
```

---

##### `swap(have, want, amount_in=None, amount_out=None, sender=None, **kwargs)`

Execute a swap between two tokens.

**Parameters:**
- `have` (str | ContractInstance): Token to sell (optional if `value` provided)
- `want` (str | ContractInstance): Token to buy
- `amount_in` (str | Decimal): Exact amount to sell
- `amount_out` (str | Decimal): Exact amount to buy
- `max_amount_in` (str | Decimal): Maximum willing to sell
- `min_amount_out` (str | Decimal): Minimum willing to accept
- `slippage` (float): Slippage tolerance (0-1)
- `deadline` (timedelta | int): Transaction deadline
- `sender` (AccountAPI): Account executing swap
- `value` (str | int): ETH value for native token swaps
- `private` (bool): Use private mempool (Flashbots)

**Returns:** TransactionAPI - Transaction receipt

**Examples:**
```python
# Exact input swap
tx = uni.swap(
    have="ETH",
    want="USDC",
    amount_in="1 ETH",
    slippage=0.5,  # 0.5%
    deadline=timedelta(minutes=5),
    sender=my_account
)

# Exact output swap
tx = uni.swap(
    have="USDC",
    want="ETH",
    amount_out="1 ETH",
    max_amount_in="2100 USDC",
    sender=my_account
)

# Native ETH swap
tx = uni.swap(
    want="USDC",
    sender=my_account,
    value="1 ether"
)
```

---

##### `solve(order, routes=None) -> Solution`

Find optimal routes for a swap order.

**Parameters:**
- `order` (Order): Order to solve
- `routes` (Iterable[Route]): Routes to consider (optional)

**Returns:** Solution - Dictionary mapping routes to amounts

**Example:**
```python
from uniswap_sdk import Order

order = Order(
    token_in="ETH",
    token_out="USDC",
    amount_in=Decimal("1")
)

solution = uni.solve(order)
# Returns: {(UniswapV2Pair,): Decimal("0.6"), (UniswapV3Pair,): Decimal("0.4")}
```

---

##### `index(tokens=None) -> Iterator`

Index pool states for faster querying.

**Parameters:**
- `tokens` (Iterable): Specific tokens to index (optional)

**Returns:** Iterator of indexed pairs

**Example:**
```python
from ape_tokens import tokens

# Index all tokens
list(uni.index(tokens=tokens))

# Index specific tokens
list(uni.index(tokens=["ETH", "USDC", "DAI"]))
```

---

##### `install(bot, tokens=None)`

Install into Silverback bot for real-time updates.

**Parameters:**
- `bot` (SilverbackBot): Bot instance
- `tokens` (Iterable): Tokens to monitor

**Example:**
```python
from silverback import SilverbackBot
from uniswap_sdk import Uniswap

bot = SilverbackBot()
uni = Uniswap()
uni.install(bot, tokens=["ETH", "USDC", "DAI"])
```

---

## Custom Classes

### MarketState

Represents market state at a point in time.

```python
from simulation import MarketState
from datetime import datetime
from decimal import Decimal

state = MarketState(
    timestamp=datetime.now(),
    token_pair=("ETH", "USDC"),
    dex_prices={
        "UniswapV2": Decimal("2000"),
        "SushiSwap": Decimal("2010")
    },
    gas_price_gwei=Decimal("50")
)
```

#### Attributes
- `timestamp` (datetime): When state was captured
- `token_pair` (tuple[str, str]): Token pair
- `dex_prices` (dict[str, Decimal]): Prices across DEXes
- `gas_price_gwei` (Decimal): Current gas price

#### Methods

##### `price_spread() -> Decimal`
Calculate price spread across DEXes.

##### `best_buy_dex() -> str`
Identify DEX with lowest price.

##### `best_sell_dex() -> str`
Identify DEX with highest price.

---

### ArbitrageOpportunity

Represents a potential arbitrage opportunity.

```python
from simulation import ArbitrageOpportunity

opp = ArbitrageOpportunity(
    market_state=state,
    buy_dex="UniswapV2",
    sell_dex="SushiSwap",
    buy_price=Decimal("2000"),
    sell_price=Decimal("2010"),
    gross_profit_per_unit=Decimal("10"),
    estimated_gas_cost_usd=Decimal("30"),
    trade_size=Decimal("5")
)
```

#### Methods

##### `net_profit() -> Decimal`
Calculate net profit after gas costs.

##### `is_profitable(min_profit_threshold: Decimal = Decimal("10")) -> bool`
Check if opportunity meets threshold.

##### `roi_percentage() -> Decimal`
Calculate return on investment percentage.

---

### ArbitrageSimulator

Simulates arbitrage opportunities.

```python
from simulation import ArbitrageSimulator

sim = ArbitrageSimulator(gas_price_eth=Decimal("0.001"))
```

#### Methods

##### `generate_market_state(token_pair, base_price, volatility) -> MarketState`

Generate random market state.

**Parameters:**
- `token_pair` (tuple): Token pair to simulate
- `base_price` (Decimal): Base price for pair
- `volatility` (float): Price volatility (0-1)

**Returns:** MarketState

---

##### `analyze_opportunity(market_state, trade_size, eth_price_usd) -> ArbitrageOpportunity`

Analyze market state for arbitrage.

**Parameters:**
- `market_state` (MarketState): Current market state
- `trade_size` (Decimal): Trade size
- `eth_price_usd` (Decimal): ETH price for gas calculation

**Returns:** ArbitrageOpportunity

---

##### `run_simulation(num_iterations, token_pair, base_price, volatility, trade_size) -> dict`

Run complete simulation.

**Parameters:**
- `num_iterations` (int): Number of iterations
- `token_pair` (tuple): Token pair to simulate
- `base_price` (Decimal): Base price
- `volatility` (float): Volatility factor
- `trade_size` (Decimal): Trade size per opportunity

**Returns:** Dictionary with simulation results

**Example:**
```python
results = sim.run_simulation(
    num_iterations=100,
    token_pair=("ETH", "USDC"),
    base_price=Decimal("2000"),
    volatility=0.02,
    trade_size=Decimal("1")
)

print(f"Profitability Rate: {results['profitability_rate_pct']}%")
print(f"Total Profit: ${results['total_profit_usd']}")
```

---

##### `get_best_opportunities(top_n: int = 10) -> List[ArbitrageOpportunity]`

Get top N opportunities from last simulation.

**Parameters:**
- `top_n` (int): Number of opportunities to return

**Returns:** List of ArbitrageOpportunity

---

##### `print_opportunity_report(opportunity: ArbitrageOpportunity)`

Print detailed report for an opportunity.

---

## Silverback Bot API

### Decorators

#### `@bot.on_startup()`
Run function when bot starts.

```python
@bot.on_startup()
async def initialize(startup_state):
    bot.state.balance = get_balance()
    return {"initialized": True}
```

---

#### `@bot.on_(event, **filters)`
React to blockchain events.

```python
@bot.on_(token.Transfer, receiver=bot.signer)
async def handle_transfer(log):
    print(f"Received {log.amount} tokens")
```

---

#### `@bot.cron(schedule)`
Run function on schedule (cron syntax).

```python
@bot.cron("*/5 * * * *")  # Every 5 minutes
async def check_price(timestamp):
    return uni.price("ETH", "USDC")
```

**Cron Syntax:**
```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Day of week (0-6, Sun-Sat)
│ │ │ └───── Month (1-12)
│ │ └─────── Day of month (1-31)
│ └───────── Hour (0-23)
└─────────── Minute (0-59)
```

---

#### `@bot.on_metric(name, **conditions)`
React to metric values.

```python
@bot.on_metric("price_delta", lt=-10)  # Less than -10
async def buy_opportunity(delta):
    # Price dropped, buy opportunity
    execute_buy()

@bot.on_metric("price_delta", gt=10)  # Greater than 10
async def sell_opportunity(delta):
    # Price increased, sell opportunity
    execute_sell()
```

---

## Environment Variables

### Bot Configuration

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `TOKENA` | string | - | First token symbol |
| `TOKENB` | string | - | Second token symbol |
| `REFERENCE_PRICE` | float | - | Expected price ratio |
| `ARBITRAGE_THRESHOLD` | float | `0.025` | Min profit (2.5%) |
| `MAX_SWAP_SIZE_TOKENA` | float | `inf` | Max trade size (Token A) |
| `MAX_SWAP_SIZE_TOKENB` | float | `inf` | Max trade size (Token B) |
| `INTERMEDIATE_TOKENS` | string | - | Comma-separated tokens |
| `USE_PRIVATE_MEMPOOL` | bool | `false` | Use Flashbots |
| `MEASUREMENT_CRON` | string | `*/5 * * * *` | Price check schedule |

### Network Configuration

| Variable | Type | Description |
|----------|------|-------------|
| `ALCHEMY_API_KEY` | string | Alchemy API key |
| `INFURA_API_KEY` | string | Infura project ID |
| `NETWORK` | string | Network to use |

---

## CLI Commands

### uni (Uniswap SDK CLI)

```bash
# Get price
uni price ETH USDC

# Execute swap
uni swap --have ETH --want USDC --amount-in "1 ETH" --sender my-account

# List pools
uni pools ETH USDC

# Show version
uni --version

# Help
uni --help
```

### ape (Eth-Ape CLI)

```bash
# List accounts
ape accounts list

# Generate account
ape accounts generate <name>

# Console
ape console --network ethereum:sepolia:alchemy

# Run script
ape run scripts/deploy.py

# Test
ape test tests/
```

### silverback (Bot Framework CLI)

```bash
# Run bot
silverback run bots.arbitrage:bot --network ethereum:sepolia:alchemy

# Run with account
silverback run bots.arbitrage:bot --account test-wallet

# Worker mode (production)
silverback worker bots.arbitrage:bot --network ethereum:mainnet:alchemy
```

---

## Common Patterns

### Safe Swap with Protections

```python
from datetime import timedelta

tx = uni.swap(
    have="ETH",
    want="USDC",
    amount_in="1 ETH",
    min_amount_out="1950 USDC",  # Protect against slippage
    deadline=timedelta(minutes=2),  # Expire if not mined soon
    sender=account,
    private=True  # Use Flashbots
)
```

---

### Monitoring Loop

```python
import asyncio

async def monitor_arbitrage():
    while True:
        price_uni = uni.price("ETH", "USDC")
        price_sushi = sushi.price("ETH", "USDC")
        
        spread = abs(price_uni - price_sushi)
        
        if spread > MIN_SPREAD:
            execute_arbitrage(price_uni, price_sushi)
        
        await asyncio.sleep(5)
```

---

### Flash Loan Arbitrage

```python
# Borrow from Aave
flash_loan_amount = Decimal("100000")  # 100k USDC

# Execute arbitrage
profit = execute_cross_dex_arbitrage(flash_loan_amount)

# Repay loan + fee
repay_amount = flash_loan_amount * Decimal("1.0009")

if profit > repay_amount:
    print(f"Profit: ${profit - repay_amount}")
else:
    print("Would not be profitable, transaction will revert")
```

---

## Error Handling

### Common Exceptions

```python
from ape.exceptions import ContractLogicError, InsufficientFundsError

try:
    tx = uni.swap(...)
except ContractLogicError as e:
    # Swap would fail (slippage, insufficient liquidity, etc.)
    print(f"Swap failed: {e}")
except InsufficientFundsError:
    # Not enough ETH for gas or tokens for swap
    print("Insufficient funds")
except Exception as e:
    # Other errors
    print(f"Unexpected error: {e}")
```

---

## Performance Tips

1. **Index pools before use**
   ```python
   list(uni.index(tokens=tokens))  # Slow once, fast many times
   ```

2. **Use Silverback for real-time**
   ```python
   uni.install(bot)  # Automatic updates
   ```

3. **Batch operations**
   ```python
   # Bad: Multiple queries
   price1 = uni.price("ETH", "USDC")
   price2 = uni.price("ETH", "DAI")
   
   # Better: Single solve with multiple routes
   solution = uni.solve(order, routes=all_routes)
   ```

4. **Cache frequently used values**
   ```python
   gas_price = chain.blocks.head.base_fee  # Cache this
   ```

---

Last Updated: 2024-11-25
