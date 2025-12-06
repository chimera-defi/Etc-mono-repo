# Next Steps — Hardhat Implementation

## Immediate Actions (Do First)

### Step 1: Environment Setup
```bash
# Check Node.js version (need 18+)
node --version

# Check npm
npm --version
```

### Step 2: Initialize Project
```bash
cd /workspace/Dapps/Hardhat/app
npx hardhat init

# Select: Create a TypeScript project
# Accept default for .gitignore
# Accept default for dependencies
```

### Step 3: Install Dependencies
```bash
npm install @openzeppelin/contracts
```

### Step 4: Configure hardhat.config.ts
```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
};

export default config;
```

---

## Implementation Order

### Phase 1: Core Contracts (Priority: P0)
1. Delete default `Lock.sol` and `Lock.ts` test
2. Create `contracts/Token.sol` (ERC-20)
3. Create `contracts/NFT.sol` (ERC-721)
4. Verify compilation: `npx hardhat compile`

### Phase 2: Testing (Priority: P0)
1. Create `test/Token.ts`
2. Create `test/NFT.ts`
3. Run tests: `npx hardhat test`
4. Ensure good coverage

### Phase 3: Deployment (Priority: P1)
1. Create `ignition/modules/Deploy.ts`
2. Test locally with Hardhat Network
3. Document deployment process

### Phase 4: Metrics (Priority: P0)
1. Record compile time: `time npx hardhat compile`
2. Record test time: `time npx hardhat test`
3. Generate gas report: `REPORT_GAS=true npx hardhat test`
4. Generate coverage: `npx hardhat coverage`

---

## Contract Templates

### Token.sol (ERC-20)
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Token is ERC20, Ownable {
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) Ownable(msg.sender) {
        _mint(msg.sender, initialSupply);
    }
    
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
```

### NFT.sol (ERC-721)
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFT is ERC721, Ownable {
    uint256 private _nextTokenId;
    string private _baseTokenURI;
    
    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI
    ) ERC721(name, symbol) Ownable(msg.sender) {
        _baseTokenURI = baseURI;
    }
    
    function mint(address to) external onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        return tokenId;
    }
    
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
}
```

---

## Test Template

```typescript
import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("Token", function () {
  async function deployTokenFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    
    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy("TestToken", "TST", ethers.parseEther("1000000"));
    
    return { token, owner, addr1, addr2 };
  }

  describe("Deployment", function () {
    it("Should set the right name and symbol", async function () {
      const { token } = await loadFixture(deployTokenFixture);
      expect(await token.name()).to.equal("TestToken");
      expect(await token.symbol()).to.equal("TST");
    });

    it("Should assign total supply to owner", async function () {
      const { token, owner } = await loadFixture(deployTokenFixture);
      expect(await token.balanceOf(owner.address)).to.equal(ethers.parseEther("1000000"));
    });
  });

  describe("Transfers", function () {
    it("Should transfer tokens between accounts", async function () {
      const { token, owner, addr1 } = await loadFixture(deployTokenFixture);
      
      await token.transfer(addr1.address, 100);
      expect(await token.balanceOf(addr1.address)).to.equal(100);
    });
  });
});
```

---

## Ignition Deployment Template

```typescript
// ignition/modules/Deploy.ts
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DeployModule = buildModule("DeployModule", (m) => {
  const token = m.contract("Token", [
    "MyToken",
    "MTK", 
    1_000_000n * 10n ** 18n  // 1M tokens
  ]);
  
  const nft = m.contract("NFT", [
    "MyNFT",
    "MNFT",
    "https://api.example.com/metadata/"
  ]);
  
  return { token, nft };
});

export default DeployModule;
```

---

## Verification Checklist

Before marking complete:
- [ ] `npx hardhat compile` succeeds
- [ ] `npx hardhat test` all pass
- [ ] `npm run lint` no errors
- [ ] Coverage > 80%
- [ ] Gas report generated
- [ ] README updated with actual metrics
- [ ] TASKS.md updated with completion status

---

## After Completion

1. Update `/workspace/Dapps/README.md` status
2. Create `METRICS.md` with benchmark data
3. Note any issues or insights for comparison
4. Compare results with Foundry implementation

---

**Estimated Time**: 1-2 hours
**Dependencies**: Node.js 18+, npm
