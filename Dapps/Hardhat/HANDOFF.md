# Handoff Document — Hardhat Implementation

## Quick Start for Next Agent

```bash
# 1. Navigate to project
cd /workspace/Dapps/Hardhat/app

# 2. Initialize project
npx hardhat init
# Select: Create a TypeScript project

# 3. Install additional dependencies
npm install @openzeppelin/contracts

# 4. Build and test
npx hardhat compile
npx hardhat test
```

## Current Status

| Phase | Status | Notes |
|-------|--------|-------|
| Setup | ⏳ Not Started | Need to run `npx hardhat init` |
| Contracts | ⏳ Not Started | Implement Token + NFT |
| Tests | ⏳ Not Started | Write TypeScript tests |
| Deploy | ⏳ Not Started | Create Ignition modules |

## Your Mission

Implement a complete Hardhat project with:
1. **ERC-20 Token** with mint/burn capabilities
2. **ERC-721 NFT** with metadata URI
3. **Comprehensive tests** using Mocha/Chai
4. **Hardhat Ignition** deployment module
5. **Performance metrics** (compile time, test time, gas)

## Key Files to Create

```
app/
├── hardhat.config.ts     # Config - set solc to 0.8.20+
├── contracts/
│   ├── Token.sol         # ERC-20 implementation
│   └── NFT.sol           # ERC-721 implementation
├── test/
│   ├── Token.ts          # Token tests
│   └── NFT.ts            # NFT tests
└── ignition/
    └── modules/
        └── Deploy.ts     # Deployment module
```

## Important Commands

```bash
# Initialize with TypeScript
npx hardhat init

# Install OpenZeppelin
npm install @openzeppelin/contracts

# Compile
npx hardhat compile

# Test with gas report
REPORT_GAS=true npx hardhat test

# Coverage
npx hardhat coverage

# Deploy locally
npx hardhat node  # terminal 1
npx hardhat ignition deploy ./ignition/modules/Deploy.ts --network localhost  # terminal 2

# Lint
npm run lint
```

## Expected Output

After completion, update:
1. `README.md` - Mark implementation complete
2. `TASKS.md` - Check off completed tasks
3. `../README.md` - Update status table
4. Create `METRICS.md` with performance data

## Contract Requirements

### Token.sol
```solidity
// Required functions:
- constructor(name, symbol, initialSupply)
- mint(to, amount) onlyOwner
- burn(amount)
- Standard ERC-20 (transfer, approve, transferFrom)
```

### NFT.sol
```solidity
// Required functions:
- constructor(name, symbol, baseURI)
- mint(to) onlyOwner -> returns tokenId
- tokenURI(tokenId) -> string
- Standard ERC-721 (transferFrom, safeTransferFrom, approve)
```

## Test Structure Template

```typescript
import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("Token", function () {
  async function deployTokenFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy("MyToken", "MTK", 1000000);
    return { token, owner, addr1, addr2 };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { token, owner } = await loadFixture(deployTokenFixture);
      expect(await token.owner()).to.equal(owner.address);
    });
  });
});
```

## Comparison Notes

When complete, compare against Foundry implementation:
- Compile time
- Test execution time
- Gas usage
- Code verbosity
- Developer experience

## Resources

- [Hardhat Docs](https://hardhat.org/docs)
- [Hardhat Ignition](https://hardhat.org/ignition)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Chai Assertions](https://www.chaijs.com/api/bdd/)

---

**Priority**: Complete P0 tasks first, then P1 tasks.
**Time Estimate**: 1-2 hours for full implementation.
