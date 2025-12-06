# Dapp Development Framework Comparison

Comparison of smart contract development frameworks for building decentralized applications (Dapps).

## Frameworks

| Framework | Language | Status | Tests | Quick Start |
|-----------|----------|--------|-------|-------------|
| [Foundry](./Foundry/) | Solidity | ⏳ Pending | — | `cd Foundry/app && forge build` |
| [Hardhat](./Hardhat/) | Solidity/TS | ⏳ Pending | — | `cd Hardhat/app && npx hardhat compile` |

## Framework Comparison Summary

| Aspect | Foundry (Forge) | Hardhat |
|--------|-----------------|---------|
| **Language** | Solidity (tests too!) | JavaScript/TypeScript |
| **Speed** | ⚡ Very Fast (Rust) | Moderate (Node.js) |
| **Test Language** | Solidity | JS/TS (Mocha/Chai) |
| **Fuzzing** | ✅ Built-in | ❌ Requires plugins |
| **Debugging** | `forge debug` | `console.log` + Hardhat Network |
| **Gas Reports** | ✅ Built-in | ✅ Plugin (hardhat-gas-reporter) |
| **Deployment** | `forge script` | Hardhat Ignition / scripts |
| **Plugin Ecosystem** | Growing | Large & Mature |
| **Learning Curve** | Moderate (Solidity-native) | Easy (familiar JS tooling) |
| **AI Training Data** | Smaller (newer) | Larger (more examples) |

## Development Scores (Estimated)

| Rank | Framework | Score | Best For |
|------|-----------|-------|----------|
| 🥇 | **Hardhat** | TBD | JS/TS devs, large plugin ecosystem |
| 🥈 | **Foundry** | TBD | Performance, Solidity-native testing |

> **Note**: Scores will be updated after implementations are complete and compared.

## Quick Decision Guide

```
Already comfortable with JavaScript/TypeScript?
  → YES: Hardhat (familiar tooling)
  → NO: Continue

Need fastest possible test execution?
  → YES: Foundry (10-100x faster)
  → NO: Continue

Want to write tests in Solidity?
  → YES: Foundry
  → NO: Hardhat

Need extensive plugin ecosystem?
  → YES: Hardhat
  → NO: Either works

Default for new projects:
  → Foundry (better DX, faster tests)
  → or Hardhat (if team knows JS better)
```

## What We'll Build

Each framework will implement a **simple Token + NFT project** with:
- ERC-20 Token contract
- ERC-721 NFT contract
- Unit tests for both
- Deployment scripts
- Gas usage comparison

This provides a fair comparison of:
- Development workflow
- Testing patterns
- Build/test speed
- Debugging experience
- Deployment process

## Project Structure

Each framework folder contains:
- `README.md` - Setup and usage instructions
- `TASKS.md` - Task backlog for implementation
- `HANDOFF.md` - Quick start for agents
- `UNDERSTANDING.md` - Research context
- `NEXT_STEPS.md` - Prioritized action items
- `app/` - The actual smart contract project

## Detailed Analysis

See `.artifacts/` folder for detailed comparison documents:
- `FRAMEWORK_COMPARISON.md` - Full framework comparison matrix
- `TLDR_SUMMARY.md` - Quick summary and recommendations

---

## Implementation Status

| Phase | Foundry | Hardhat | Description |
|-------|---------|---------|-------------|
| 1. Setup | ⏳ | ⏳ | Initialize project, install deps |
| 2. Contracts | ⏳ | ⏳ | ERC-20 + ERC-721 contracts |
| 3. Tests | ⏳ | ⏳ | Unit tests with coverage |
| 4. Deploy | ⏳ | ⏳ | Deployment scripts |
| 5. Compare | ⏳ | ⏳ | Performance benchmarks |

**Status Legend**: ✅ Complete | ⏳ Pending | 🚧 In Progress

---

**Status**: Phase 0 - Framework setup and task planning
