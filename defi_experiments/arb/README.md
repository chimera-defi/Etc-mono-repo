# Uniswap SDK Arbitrage Experimentation

This project explores arbitrage opportunities using the [ApeWorX Uniswap SDK](https://github.com/ApeWorX/uniswap-sdk), providing tools for simulation, testing, and execution of profitable arbitrage strategies across decentralized exchanges.

## Overview

The Uniswap SDK provides a comprehensive toolkit for interacting with Uniswap protocol deployments (V2, V3) and identifying arbitrage opportunities. This experimental setup includes:

- **Simulation Environment**: Test arbitrage strategies without real funds
- **Comprehensive Test Suite**: Validate profitability under various conditions
- **Production Bot**: Ready-to-deploy arbitrage bot using Silverback
- **Analysis Tools**: Evaluate opportunities across multiple DEXes

## Quick Start

### Installation

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install the SDK in development mode
pip install -e .
```

### Run Simulation

```bash
# Run the arbitrage simulation
python simulation.py
```

This will simulate arbitrage opportunities across different market conditions and volatility levels.

### Run Tests

```bash
# Run all tests
pytest tests/test_arbitrage_profitability.py -v

# Run with coverage
pytest tests/ --cov=uniswap_sdk --cov-report=html
```

## Project Structure

```
arb/
├── bots/
│   └── arbitrage.py          # Production arbitrage bot
├── uniswap_sdk/              # Core SDK library
│   ├── main.py               # Main Uniswap class
│   ├── v2.py                 # UniswapV2 implementation
│   ├── v3.py                 # UniswapV3 implementation
│   ├── solver.py             # Route optimization solver
│   └── universal_router.py   # UniversalRouter integration
├── tests/
│   ├── functional/           # Functional tests
│   └── test_arbitrage_profitability.py  # Custom arbitrage tests
├── simulation.py             # Arbitrage simulation script
├── requirements.txt          # Python dependencies
├── setup.py                  # Package setup
└── README.md                 # This file
```

## Key Features

### 1. Multi-DEX Support
- Uniswap V2 and V3
- Integration ready for SushiSwap, Curve, and others
- Cross-protocol arbitrage detection

### 2. Arbitrage Types

**Simple Arbitrage**: Buy low on one DEX, sell high on another
```python
# Example: ETH cheaper on Uniswap, more expensive on Sushiswap
# Buy ETH on Uniswap → Sell ETH on Sushiswap = Profit
```

**Triangular Arbitrage**: Use multiple tokens to create profit loop
```python
# Example: ETH → USDC → DAI → ETH
# If the round-trip multiplier > 1, profit exists
```

**Flash Loan Arbitrage**: Borrow funds, arbitrage, repay in single transaction
```python
# 1. Flash loan 100k USDC
# 2. Buy ETH cheap
# 3. Sell ETH expensive
# 4. Repay loan + fee
# 5. Keep profit
```

### 3. Profitability Factors

The simulation and tests consider:
- **Gas Costs**: Transaction costs in ETH/USD
- **Slippage**: Price impact of large trades
- **Liquidity Depth**: Available liquidity in pools
- **MEV Competition**: Competition from other arbitrageurs
- **Flash Loan Fees**: Cost of borrowing (typically 0.09%)

## Simulation Results

Example output from `simulation.py`:

```
SIMULATION: Volatility = 2.0%
============================================================
Results:
  Total Opportunities Analyzed: 100
  Profitable Opportunities: 23
  Profitability Rate: 23.00%
  Total Profit: $1,847.32
  Average Profit per Opportunity: $80.32

  Top 3 Opportunities:
    1. UniswapV2 → Curve: $156.23 profit
    2. SushiSwap → UniswapV3: $142.87 profit
    3. UniswapV2 → SushiSwap: $131.45 profit
```

## Production Bot Usage

The included arbitrage bot (`bots/arbitrage.py`) uses Silverback for real-time monitoring:

### Configuration

Set environment variables:

```bash
export TOKENA="USDT"
export TOKENB="USDC"
export REFERENCE_PRICE="1.0"
export ARBITRAGE_THRESHOLD="0.025"  # 2.5% minimum profit
export MAX_SWAP_SIZE_TOKENA="1000"
export MAX_SWAP_SIZE_TOKENB="1000"
export USE_PRIVATE_MEMPOOL="true"   # Use Flashbots
```

### Running the Bot

```bash
# Test on local fork
silverback run bots.arbitrage:bot --network ethereum:mainnet-fork:foundry

# Deploy to mainnet (CAUTION: Real money!)
silverback run bots.arbitrage:bot --network ethereum:mainnet:alchemy
```

## Test Coverage

The test suite (`tests/test_arbitrage_profitability.py`) covers:

### Opportunity Detection
- ✅ Price discrepancy detection across DEXes
- ✅ Triangular arbitrage identification
- ✅ Multi-route discovery

### Profitability Analysis
- ✅ Gas cost consideration
- ✅ Slippage impact calculation
- ✅ Minimum profit threshold enforcement
- ✅ Liquidity depth verification

### Execution Mechanics
- ✅ Transaction ordering
- ✅ Revert on loss protection
- ✅ Deadline enforcement

### Simulation & Backtesting
- ✅ Mock price simulation
- ✅ Historical data backtesting
- ✅ Monte Carlo analysis

## Risk Warnings

⚠️ **IMPORTANT**: Arbitrage trading carries significant risks:

1. **Gas Costs**: High gas prices can eliminate profits
2. **MEV Competition**: Sophisticated bots may front-run your transactions
3. **Slippage**: Large trades impact prices
4. **Smart Contract Risk**: Bugs can lead to loss of funds
5. **Market Risk**: Prices move quickly; opportunities vanish
6. **Regulatory Risk**: Compliance requirements vary by jurisdiction

**Recommendation**: 
- Start with simulations only
- Test on testnets thoroughly
- Begin with small amounts
- Monitor closely
- Understand the code completely

## Next Steps

1. **Run Simulations**: `python simulation.py`
2. **Study Results**: Understand profitability factors
3. **Run Tests**: `pytest tests/ -v`
4. **Paper Trade**: Test on mainnet fork
5. **Small Deployment**: Test with minimal funds
6. **Scale Gradually**: Increase size as you gain confidence

## Resources

- [Uniswap SDK GitHub](https://github.com/ApeWorX/uniswap-sdk)
- [Silverback Documentation](https://silverback.apeworx.io)
- [ApeWorX Framework](https://docs.apeworx.io)
- [Uniswap V2 Docs](https://docs.uniswap.org/protocol/V2/introduction)
- [Uniswap V3 Docs](https://docs.uniswap.org/protocol/introduction)
- [Flash Loans](https://docs.aave.com/developers/guides/flash-loans)

## Contributing

This is an experimental project. Improvements welcome:

1. Enhanced simulation scenarios
2. Additional test cases
3. Multi-chain support
4. Advanced solver algorithms
5. Risk management features

## License

This project inherits the Apache 2.0 license from the Uniswap SDK.

See the [LICENSE](LICENSE) file for details.

## Disclaimer

This software is for educational and research purposes only. Not financial advice. Use at your own risk. The authors assume no liability for any losses incurred through use of this software.
