# Dapp Framework Comparison: Foundry vs Hardhat

Build identical smart contracts in both frameworks, then compare.

## Status

| Framework | Status | Tests | Quick Start |
|-----------|--------|-------|-------------|
| [Foundry](./Foundry/) | ✅ Complete | 21 passing (+ fuzz) | `cd Foundry/app && forge test` |
| [Hardhat](./Hardhat/) | ✅ Complete | 23 passing | `cd Hardhat/app && npx hardhat test` |
| [**Hybrid**](./Hybrid/) | ✅ **Template** | 23 + 3 | `cd Hybrid/app && forge test` |

> 💡 **Recommended**: Use the [Hybrid template](./Hybrid/) for new projects - combines Foundry (testing) + Hardhat (deployment)

## 📊 Results Summary

| Metric | Foundry | Hardhat | Winner |
|--------|---------|---------|--------|
| **Compile Time** | 0.65s | 1.58s | ✅ Foundry (2.4x) |
| **Test Time** | 0.13s | 1.50s | ✅ Foundry (11.5x) |
| **Dependencies** | 16 MB | 496 MB | ✅ Foundry (31x smaller) |
| **Fuzzing** | ✅ Built-in | ❌ External | ✅ Foundry |
| **Ecosystem** | Growing | Mature | ⚡ Hardhat |

👉 **[Full Comparison Report](./COMPARISON.md)**

## Quick Comparison

| Aspect | Foundry | Hardhat |
|--------|---------|---------|
| **Tests in** | Solidity | TypeScript |
| **Speed** | ⚡ Faster (Rust) | Standard (Node.js) |
| **Fuzzing** | ✅ Built-in | ❌ External |
| **Plugins** | Growing | Large ecosystem |

## Decision Guide

- **Know JS/TS?** → Hardhat
- **Want speed + fuzzing?** → Foundry
- **Default for new projects** → Either works, Foundry trending

## What Was Built

Both frameworks implement identical:
1. **Token.sol** - ERC-20 with mint/burn
2. **NFT.sol** - ERC-721 with metadata
3. Comprehensive unit tests
4. Fuzz tests (Foundry only)
5. Deployment scripts

## Quick Start

### Foundry
```bash
cd Foundry/app
forge test              # Run tests
forge test --gas-report # With gas report
forge coverage          # Coverage report
```

### Hardhat
```bash
cd Hardhat/app
npm install             # Install deps (first time)
npx hardhat test        # Run tests
REPORT_GAS=true npx hardhat test  # With gas
npx hardhat coverage    # Coverage report
```

## Key Metrics Recorded

| Metric | Foundry | Hardhat |
|--------|---------|---------|
| Compile time (clean) | 0.65s | 1.58s |
| Test execution | 0.13s | 1.50s |
| Test coverage | 100% | 100% |
| Dependency size | 16 MB | 496 MB |

## Recommendations

### Use Foundry If:
- ⚡ Speed is critical
- 🧪 You need fuzz testing
- 💾 You want minimal dependencies
- 🔧 You prefer testing in Solidity

### Use Hardhat If:
- 📚 You're comfortable with JS/TS
- 🔌 You need specific plugins
- 📝 You want TypeScript types
- 👥 Your team knows the JS ecosystem

### Both Together
Many teams use both:
- **Foundry** for fast test iteration + fuzzing
- **Hardhat** for complex deployments + plugins
