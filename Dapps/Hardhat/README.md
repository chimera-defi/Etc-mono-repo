# Hardhat Implementation

## Status: ✅ Complete

All contracts, tests, and deployment scripts implemented and passing.

## Quick Start

```bash
cd app
npm install                      # Install dependencies (first time)
npx hardhat test                 # Run all tests (23 passing)
REPORT_GAS=true npx hardhat test # With gas report
npx hardhat coverage             # Coverage report (100%)
```

## What's Implemented

### Contracts (in `contracts/`)
- ✅ `Token.sol` - ERC-20, Ownable, mint/burn
- ✅ `NFT.sol` - ERC-721, Ownable, tokenURI, totalMinted

### Tests (in `test/`)
- ✅ `Token.ts` - 11 tests
  - Deployment, transfers, minting, burning, access control
- ✅ `NFT.ts` - 12 tests
  - Deployment, minting, transfers, tokenURI

### Deployment
- ✅ `ignition/modules/Deploy.ts` - Ignition deployment module

## Metrics

| Metric | Value |
|--------|-------|
| Compile time | 1.58s |
| Test execution | 1.50s |
| Tests passing | 23/23 |
| Coverage | 100% |
| Dependencies | 496 MB (584 packages) |

## Test Output

```
NFT
  Deployment (3 tests)
  Minting (3 tests)
  Transfers (3 tests)
  Token URI (3 tests)

Token
  Deployment (3 tests)
  Transfers (4 tests)
  Minting (2 tests)
  Burning (2 tests)

23 passing (526ms)
```

## Gas Report (Key Functions)

| Contract | Function | Avg Gas |
|----------|----------|---------|
| Token | transfer | 52,200 |
| Token | mint | 54,190 |
| Token | burn | 34,191 |
| NFT | mint | 85,859 |
| NFT | transferFrom | 55,935 |

## Project Structure

```
app/
├── contracts/
│   ├── Token.sol          # ERC-20 implementation
│   └── NFT.sol            # ERC-721 implementation
├── test/
│   ├── Token.ts           # Token tests (TypeScript)
│   └── NFT.ts             # NFT tests (TypeScript)
├── ignition/
│   └── modules/
│       └── Deploy.ts      # Ignition deployment module
├── hardhat.config.ts      # Configuration
├── tsconfig.json          # TypeScript config
├── package.json           # Dependencies
└── node_modules/          # Installed packages
```

## Commands Reference

```bash
# Build
npx hardhat compile
npx hardhat clean          # Clear cache

# Test
npx hardhat test           # Run all tests
npx hardhat test --grep "Token"  # Filter tests
REPORT_GAS=true npx hardhat test  # With gas

# Coverage
npx hardhat coverage

# Deploy (local)
npx hardhat node           # Start local node (terminal 1)
npx hardhat ignition deploy ignition/modules/Deploy.ts --network localhost

# Console
npx hardhat console        # Interactive REPL
```

## TypeScript Types

Hardhat with `@nomicfoundation/hardhat-toolbox` auto-generates TypeScript types via TypeChain:

```typescript
import { Token } from "../typechain-types";

const token: Token = await ethers.getContractAt("Token", address);
// Full IntelliSense support!
```

## Hardhat Version

```
Hardhat 2.27.1
Solidity 0.8.20
OpenZeppelin 5.x
Node.js v22.21.1
```

## Ignition Deployment

The Ignition module provides declarative deployment:

```typescript
// ignition/modules/Deploy.ts
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DeployModule = buildModule("Deploy", (m) => {
  const token = m.contract("Token", ["MyToken", "MTK", 1_000_000n * 10n ** 18n]);
  const nft = m.contract("NFT", ["MyNFT", "MNFT", "https://api.example.com/"]);
  return { token, nft };
});

export default DeployModule;
```

Features:
- Automatic dependency resolution
- Deployment caching
- Resume failed deployments
- Verification support
