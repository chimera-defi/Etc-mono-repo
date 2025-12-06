# Next Steps — Foundry Implementation

## Immediate Actions (Do First)

### Step 1: Environment Setup
```bash
# Check if Foundry is installed
forge --version

# If not installed:
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### Step 2: Initialize Project
```bash
cd /workspace/Dapps/Foundry/app
forge init --no-commit
```

### Step 3: Install Dependencies
```bash
forge install OpenZeppelin/openzeppelin-contracts --no-commit

# Create remappings
echo '@openzeppelin/=lib/openzeppelin-contracts/' > remappings.txt
```

### Step 4: Configure foundry.toml
```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
solc = "0.8.20"
optimizer = true
optimizer_runs = 200

[fuzz]
runs = 256
```

---

## Implementation Order

### Phase 1: Core Contracts (Priority: P0)
1. Delete default `Counter.sol` and `Counter.t.sol`
2. Create `src/Token.sol` (ERC-20)
3. Create `src/NFT.sol` (ERC-721)
4. Verify compilation: `forge build`

### Phase 2: Testing (Priority: P0)
1. Create `test/Token.t.sol`
2. Create `test/NFT.t.sol`
3. Run tests: `forge test`
4. Add fuzz tests for edge cases

### Phase 3: Deployment (Priority: P1)
1. Create `script/Deploy.s.sol`
2. Test locally with Anvil
3. Document deployment process

### Phase 4: Metrics (Priority: P0)
1. Record compile time: `time forge build`
2. Record test time: `time forge test`
3. Generate gas report: `forge test --gas-report`
4. Generate coverage: `forge coverage`

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

## Verification Checklist

Before marking complete:
- [ ] `forge build` succeeds
- [ ] `forge test` all pass
- [ ] `forge fmt --check` no issues
- [ ] Coverage > 80%
- [ ] Gas report generated
- [ ] README updated with actual metrics
- [ ] TASKS.md updated with completion status

---

## After Completion

1. Update `/workspace/Dapps/README.md` status
2. Create `METRICS.md` with benchmark data
3. Note any issues or insights for comparison
4. Proceed to verify Hardhat implementation matches

---

**Estimated Time**: 1-2 hours
**Dependencies**: Foundry toolchain installed
