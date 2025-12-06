# Hardhat Smart Contract Project

This folder contains a Hardhat-based smart contract project for comparison with Foundry.

## Status: ⏳ Pending Implementation

## Overview

Hardhat is the most popular Ethereum development environment. It's a flexible, extensible, and task-based framework built on Node.js.

### Key Features
- TypeScript-first development
- Hardhat Network (local blockchain)
- Extensive plugin ecosystem
- Hardhat Ignition (deployment framework)
- Excellent debugging with stack traces

## Quick Start

```bash
# Navigate to app folder
cd app

# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Run tests with gas report
REPORT_GAS=true npx hardhat test

# Start local node
npx hardhat node

# Deploy
npx hardhat ignition deploy ./ignition/modules/Deploy.ts
```

## Project Structure

```
app/
├── contracts/           # Smart contracts
│   ├── Token.sol        # ERC-20 Token
│   └── NFT.sol          # ERC-721 NFT
├── test/                # TypeScript tests
│   ├── Token.ts
│   └── NFT.ts
├── ignition/            # Deployment modules
│   └── modules/
│       └── Deploy.ts
├── hardhat.config.ts    # Configuration
├── package.json
└── tsconfig.json
```

## Key Commands

| Command | Description |
|---------|-------------|
| `npx hardhat compile` | Compile contracts |
| `npx hardhat test` | Run tests |
| `npx hardhat test --grep "transfer"` | Run specific tests |
| `npx hardhat coverage` | Generate coverage |
| `npx hardhat node` | Start local node |
| `npx hardhat console` | Interactive console |
| `npx hardhat clean` | Clear cache and artifacts |

## Implementation Goals

- [ ] Initialize Hardhat project with TypeScript
- [ ] Implement ERC-20 Token with minting
- [ ] Implement ERC-721 NFT with metadata
- [ ] Write comprehensive unit tests (Mocha/Chai)
- [ ] Create Hardhat Ignition deployment module
- [ ] Configure plugins (gas reporter, coverage)
- [ ] Document gas usage

## Plugins Used

- `@nomicfoundation/hardhat-toolbox` - Core functionality
- `@nomicfoundation/hardhat-ignition` - Deployment
- `@nomicfoundation/hardhat-verify` - Etherscan verification
- `hardhat-gas-reporter` - Gas usage reporting
- `solidity-coverage` - Test coverage

## Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [Hardhat Tutorial](https://hardhat.org/tutorial)
- [Hardhat Ignition](https://hardhat.org/ignition)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)

---

See `TASKS.md` for detailed implementation tasks.
