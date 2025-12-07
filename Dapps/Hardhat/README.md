# Hardhat Implementation

## Quick Start

```bash
cd app
npx hardhat init  # Select: TypeScript project
npm install @openzeppelin/contracts
```

## Tasks

### 1. Contracts (in `contracts/`)
- [ ] `Token.sol` - ERC-20, Ownable, mint/burn
- [ ] `NFT.sol` - ERC-721, Ownable, tokenURI

### 2. Tests (in `test/`)
- [ ] `Token.ts` - deploy, transfer, mint, burn, access control
- [ ] `NFT.ts` - mint, transfer, tokenURI

### 3. Deployment
- [ ] `ignition/modules/Deploy.ts`

### 4. Metrics
- [ ] `time npx hardhat compile` → record
- [ ] `time npx hardhat test` → record
- [ ] `REPORT_GAS=true npx hardhat test` → save output
- [ ] `npx hardhat coverage` → record %

## Contract Templates

Same as Foundry - use identical `Token.sol` and `NFT.sol`.

## Test Template

```typescript
// test/Token.ts
import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("Token", function () {
  async function deployFixture() {
    const [owner, addr1] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy("Test", "TST", ethers.parseEther("1000000"));
    return { token, owner, addr1 };
  }

  it("Should deploy with correct supply", async function () {
    const { token, owner } = await loadFixture(deployFixture);
    expect(await token.balanceOf(owner.address)).to.equal(ethers.parseEther("1000000"));
  });

  it("Should transfer tokens", async function () {
    const { token, addr1 } = await loadFixture(deployFixture);
    await token.transfer(addr1.address, 100);
    expect(await token.balanceOf(addr1.address)).to.equal(100);
  });
});
```

## Ignition Template

```typescript
// ignition/modules/Deploy.ts
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("Deploy", (m) => {
  const token = m.contract("Token", ["MyToken", "MTK", 1_000_000n * 10n ** 18n]);
  const nft = m.contract("NFT", ["MyNFT", "MNFT", "https://api.example.com/"]);
  return { token, nft };
});
```

## Verification

```bash
npx hardhat compile  # compiles
npx hardhat test     # all pass
```
