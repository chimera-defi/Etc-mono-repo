# Foundry Implementation

## Quick Start

```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash && foundryup

# Setup
cd app
forge init --no-commit
forge install OpenZeppelin/openzeppelin-contracts --no-commit

# Add to remappings.txt (verify path after install)
echo '@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/' > remappings.txt
```

## Tasks

### 1. Contracts (in `src/`)
- [ ] `Token.sol` - ERC-20, Ownable, mint/burn
- [ ] `NFT.sol` - ERC-721, Ownable, tokenURI

### 2. Tests (in `test/`)
- [ ] `Token.t.sol` - deploy, transfer, mint, burn, access control
- [ ] `NFT.t.sol` - mint, transfer, tokenURI
- [ ] Add fuzz tests for transfers

### 3. Deployment
- [ ] `script/Deploy.s.sol`

### 4. Metrics
- [ ] `time forge build` → record
- [ ] `time forge test` → record
- [ ] `forge test --gas-report` → save output
- [ ] `forge coverage` → record %

## Contract Templates

```solidity
// src/Token.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Token is ERC20, Ownable {
    constructor(string memory name, string memory symbol, uint256 supply)
        ERC20(name, symbol) Ownable(msg.sender) {
        _mint(msg.sender, supply);
    }
    function mint(address to, uint256 amount) external onlyOwner { _mint(to, amount); }
    function burn(uint256 amount) external { _burn(msg.sender, amount); }
}
```

```solidity
// src/NFT.sol  
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFT is ERC721, Ownable {
    uint256 private _nextTokenId;
    string private _baseTokenURI;

    constructor(string memory name, string memory symbol, string memory baseURI)
        ERC721(name, symbol) Ownable(msg.sender) {
        _baseTokenURI = baseURI;
    }
    function mint(address to) external onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        return tokenId;
    }
    function _baseURI() internal view override returns (string memory) { return _baseTokenURI; }
}
```

## Verification

```bash
forge build      # compiles
forge test       # all pass
forge fmt --check # formatted
```
