# Dapp Framework Comparison: Foundry vs Hardhat

Build identical smart contracts in both frameworks, then compare.

## Status

| Framework | Status | Quick Start |
|-----------|--------|-------------|
| [Foundry](./Foundry/) | ⏳ Pending | `cd Foundry/app && forge test` |
| [Hardhat](./Hardhat/) | ⏳ Pending | `cd Hardhat/app && npx hardhat test` |

## Quick Comparison

| Aspect | Foundry | Hardhat |
|--------|---------|---------|
| **Tests in** | Solidity | TypeScript |
| **Speed** | Faster (Rust) | Standard (Node.js) |
| **Fuzzing** | ✅ Built-in | ❌ External |
| **Plugins** | Growing | Large ecosystem |

## Decision Guide

- **Know JS/TS?** → Hardhat
- **Want speed + fuzzing?** → Foundry
- **Default for new projects** → Either works, Foundry trending

## What to Build

Both frameworks implement:
1. **Token.sol** - ERC-20 with mint/burn
2. **NFT.sol** - ERC-721 with metadata
3. Unit tests for both
4. Deployment scripts

## After Implementation

Record and compare:
- Compile time
- Test execution time  
- Gas per function
- Lines of code
- Developer experience notes
