# Setup Guide: DeFi Arbitrage Project

Complete setup instructions for the Uniswap SDK Arbitrage project.

## Prerequisites

### System Requirements
- **Operating System**: Linux, macOS, or Windows (WSL recommended)
- **Python**: 3.10 or higher
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 1GB free space
- **Internet**: Stable connection required

### Required Accounts
- [Alchemy](https://www.alchemy.com/) or [Infura](https://www.infura.io/) account (free tier OK)
- Ethereum wallet with private key
- (Optional) [Flashbots](https://docs.flashbots.net/) account for MEV protection

## Installation

### Step 1: Verify Python Version

```bash
python3 --version
```

Should show `Python 3.10.x` or higher.

If not installed:
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install python3.10 python3.10-venv python3.10-dev

# macOS (using Homebrew)
brew install python@3.10

# Windows
# Download from https://www.python.org/downloads/
```

---

### Step 2: Navigate to Project Directory

```bash
cd defi_experiments/arb
```

---

### Step 3: Create Virtual Environment

```bash
python3 -m venv venv
```

This creates an isolated Python environment for the project.

---

### Step 4: Activate Virtual Environment

```bash
# Linux/macOS
source venv/bin/activate

# Windows (Command Prompt)
venv\Scripts\activate.bat

# Windows (PowerShell)
venv\Scripts\Activate.ps1
```

You should see `(venv)` in your terminal prompt.

---

### Step 5: Upgrade pip

```bash
pip install --upgrade pip setuptools wheel
```

---

### Step 6: Install Dependencies

```bash
pip install -r requirements.txt
```

This will install:
- eth-ape (Ethereum framework)
- uniswap-sdk dependencies
- pytest (testing)
- silverback (bot framework)
- Analysis libraries (pandas, numpy, matplotlib)

**Time**: 2-5 minutes depending on internet speed.

---

### Step 7: Install Uniswap SDK

```bash
pip install -e .
```

The `-e` flag installs in "editable" mode, allowing you to modify the code.

---

### Step 8: Verify Installation

```bash
# Check Ape installation
ape --version

# Check SDK installation
python -c "import uniswap_sdk; print('SDK installed successfully')"

# Check pytest
pytest --version
```

All commands should complete without errors.

---

## Configuration

### Step 9: Configure Ape

Create or edit `~/.ape/ape-config.yaml`:

```yaml
default_ecosystem: ethereum

ethereum:
  default_network: mainnet
  mainnet:
    default_provider: alchemy
  sepolia:
    default_provider: alchemy

alchemy:
  project_id: ${ALCHEMY_API_KEY}

infura:
  project_id: ${INFURA_API_KEY}
```

---

### Step 10: Set Up RPC Provider

#### Option A: Alchemy (Recommended)

1. Go to [alchemy.com](https://www.alchemy.com/)
2. Sign up (free)
3. Create a new app
4. Select "Ethereum" chain
5. Choose network (Mainnet for production, Sepolia for testing)
6. Copy API key

#### Option B: Infura

1. Go to [infura.io](https://www.infura.io/)
2. Sign up (free)
3. Create new project
4. Copy project ID

---

### Step 11: Create Environment File

Create `.env` in the project directory:

```bash
cat > .env << 'EOF'
# RPC Provider (choose one)
ALCHEMY_API_KEY=your_alchemy_key_here
# INFURA_API_KEY=your_infura_key_here

# Wallet (DO NOT COMMIT THIS FILE!)
PRIVATE_KEY=your_private_key_here

# Bot Configuration
TOKENA=USDT
TOKENB=USDC
REFERENCE_PRICE=1.0
ARBITRAGE_THRESHOLD=0.025
MAX_SWAP_SIZE_TOKENA=100
MAX_SWAP_SIZE_TOKENB=100
USE_PRIVATE_MEMPOOL=false
MEASUREMENT_CRON=*/5 * * * *

# Network (start with testnet!)
NETWORK=ethereum:sepolia:alchemy
EOF
```

**⚠️ SECURITY WARNING**: 
- Never commit `.env` to git
- Keep private keys secret
- Use separate wallet for bot (not your main wallet)

---

### Step 12: Create Wallet

For testing, create a new wallet:

```bash
# Generate new wallet
ape accounts generate test-wallet

# You'll be prompted for a password
# Keep this password safe!
```

To use the wallet in bot:
```bash
# Load in scripts
from ape import accounts
account = accounts.load("test-wallet")
```

---

### Step 13: Get Testnet ETH

For Sepolia testnet:

1. Get your address:
```bash
ape accounts list
# Copy your test-wallet address
```

2. Visit faucet:
   - [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
   - [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)
   - [Chainlink Faucet](https://faucets.chain.link/sepolia)

3. Verify receipt:
```bash
ape console --network ethereum:sepolia:alchemy
>>> accounts.load("test-wallet").balance / 1e18
# Should show balance in ETH
```

---

## Testing Setup

### Step 14: Run Tests

```bash
# Run all tests
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=uniswap_sdk --cov-report=html

# Run specific test file
pytest tests/test_arbitrage_profitability.py -v
```

Expected output:
```
tests/test_arbitrage_profitability.py::TestArbitrageProfitability::test_price_discrepancy_detection PASSED
tests/test_arbitrage_profitability.py::TestArbitrageProfitability::test_triangular_arbitrage_opportunity PASSED
...
================== X passed in Y.YYs ==================
```

---

### Step 15: Run Simulation

```bash
python simulation.py
```

Expected output:
```
Starting Arbitrage Simulation...

============================================================
SIMULATION: Volatility = 1.0%
============================================================

Results:
  Total Opportunities Analyzed: 100
  Profitable Opportunities: 15
  Profitability Rate: 15.00%
  Total Profit: $856.32
  Average Profit per Opportunity: $57.09
  
  Top 3 Opportunities:
    1. UniswapV2 → Curve: $123.45 profit
    2. SushiSwap → UniswapV3: $98.76 profit
    3. UniswapV2 → SushiSwap: $87.65 profit
...
```

---

## Silverback Setup (For Production Bot)

### Step 16: Install Silverback

Already installed via requirements.txt, but verify:

```bash
silverback --version
```

---

### Step 17: Test Bot Locally

```bash
# Test bot syntax
python -c "from bots.arbitrage import bot; print('Bot loaded successfully')"

# Run bot in test mode (local fork)
ape networks run
# In another terminal:
silverback run bots.arbitrage:bot --network ethereum:mainnet-fork:foundry
```

---

## Troubleshooting

### Issue: "Command not found: ape"

**Solution**: Virtual environment not activated.
```bash
source venv/bin/activate
```

---

### Issue: "Module not found: uniswap_sdk"

**Solution**: SDK not installed.
```bash
pip install -e .
```

---

### Issue: "Provider not configured"

**Solution**: Check RPC configuration.
```bash
# Verify API key is set
echo $ALCHEMY_API_KEY

# Test connection
ape console --network ethereum:sepolia:alchemy
>>> chain.blocks.head
```

---

### Issue: "Tests failing"

**Solution**: Check dependencies.
```bash
pip install -r requirements.txt --force-reinstall
```

---

### Issue: "Insufficient funds"

**Solution**: Need testnet ETH.
- Visit Sepolia faucet
- Wait for confirmation
- Check balance: `ape accounts list`

---

### Issue: "Rate limit exceeded"

**Solution**: RPC provider throttling.
- Upgrade to paid tier, or
- Use multiple providers, or
- Reduce polling frequency

---

### Issue: "Gas estimation failed"

**Solution**: Transaction would fail.
- Check token balances
- Verify approvals
- Check pool liquidity
- Reduce trade size

---

## Verification Checklist

Before proceeding to deployment:

- [ ] Python 3.10+ installed
- [ ] Virtual environment activated
- [ ] All dependencies installed
- [ ] Ape configured with RPC provider
- [ ] Wallet created and funded (testnet)
- [ ] Environment variables set
- [ ] Tests pass (pytest)
- [ ] Simulation runs successfully
- [ ] Bot loads without errors
- [ ] Can connect to testnet
- [ ] Can query blockchain data

---

## Next Steps

Setup complete! ✅

Now proceed to:
1. [HANDOFF.md](HANDOFF.md) - Quick start guide
2. [NEXT_STEPS.md](NEXT_STEPS.md) - Action items
3. [UNDERSTANDING.md](UNDERSTANDING.md) - Concepts and strategy

To deploy:
```bash
# Testnet (safe)
silverback run bots.arbitrage:bot --network ethereum:sepolia:alchemy --account test-wallet

# Mainnet (real money, be careful!)
silverback run bots.arbitrage:bot --network ethereum:mainnet:alchemy --account production-wallet
```

---

## Maintenance

### Updating Dependencies

```bash
# Check for updates
pip list --outdated

# Update specific package
pip install --upgrade eth-ape

# Update all packages
pip install --upgrade -r requirements.txt
```

### Cleaning Up

```bash
# Deactivate virtual environment
deactivate

# Remove virtual environment (if needed)
rm -rf venv

# Remove cache files
find . -type d -name __pycache__ -exec rm -rf {} +
find . -type d -name .pytest_cache -exec rm -rf {} +
```

---

## Security Best Practices

1. **Never** commit private keys to git
2. **Always** use `.env` for secrets
3. **Always** use separate wallet for bot
4. **Always** start with testnet
5. **Always** start with small amounts on mainnet
6. **Regularly** rotate API keys
7. **Regularly** backup wallet files
8. **Monitor** for suspicious activity

---

## Support Resources

- **ApeWorX Docs**: https://docs.apeworx.io
- **Silverback Docs**: https://silverback.apeworx.io
- **Uniswap SDK**: https://github.com/ApeWorX/uniswap-sdk
- **Discord**: https://discord.gg/apeworx
- **GitHub Issues**: https://github.com/ApeWorX/uniswap-sdk/issues

---

Last Updated: 2024-11-25
