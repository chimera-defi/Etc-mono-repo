# Dapp Development Frameworks Comparison

This document provides a detailed comparison of Foundry (Forge) and Hardhat for smart contract development.

## Framework Overview

| Framework | Maintainer | First Release | Language | License |
|-----------|------------|---------------|----------|---------|
| **Foundry** | Paradigm | 2021 | Rust (CLI), Solidity (tests) | MIT/Apache-2.0 |
| **Hardhat** | Nomic Foundation | 2019 | TypeScript/JavaScript | MIT |

## Detailed Comparison Matrix

### Development Experience

| Feature | Foundry | Hardhat | Notes |
|---------|---------|---------|-------|
| **Installation** | `curl -L https://foundry.paradigm.xyz \| bash` | `npm install --save-dev hardhat` | Foundry is standalone, Hardhat needs Node.js |
| **Project Init** | `forge init` | `npx hardhat init` | Both scaffold complete projects |
| **Config Format** | `foundry.toml` | `hardhat.config.ts/js` | Hardhat config is more flexible (code) |
| **IDE Support** | Good (VSCode + solidity ext) | Excellent (many plugins) | Hardhat has better TypeScript integration |
| **Hot Reload** | ❌ | ✅ (with plugins) | Hardhat has watch mode plugins |

### Testing

| Feature | Foundry | Hardhat | Winner |
|---------|---------|---------|--------|
| **Test Language** | Solidity | JavaScript/TypeScript | Tie (preference) |
| **Test Speed** | ⚡ 10-100x faster | Standard | **Foundry** |
| **Fuzzing** | ✅ Built-in | ❌ External tools | **Foundry** |
| **Invariant Testing** | ✅ Built-in | ❌ External tools | **Foundry** |
| **Coverage** | `forge coverage` | `hardhat coverage` | Tie |
| **Gas Snapshots** | `forge snapshot` | Plugin | **Foundry** |
| **Mocking** | `vm.mockCall` | smock/waffle | Tie |
| **Debugging** | `forge debug` (step-through) | `console.log` | **Foundry** |

### Build & Compilation

| Metric | Foundry | Hardhat | Winner |
|--------|---------|---------|--------|
| **Compilation Speed** | Very Fast | Fast | **Foundry** |
| **Incremental Builds** | ✅ | ✅ | Tie |
| **Parallel Compilation** | ✅ | ✅ | Tie |
| **Solc Version Mgmt** | Automatic | Automatic | Tie |
| **Multi-file Output** | ✅ | ✅ | Tie |

### Deployment & Scripting

| Feature | Foundry | Hardhat | Notes |
|---------|---------|---------|-------|
| **Deployment Scripts** | Solidity (`forge script`) | JS/TS scripts | Different paradigms |
| **Deployment Framework** | Manual scripts | Hardhat Ignition | Ignition is more structured |
| **Verification** | `forge verify-contract` | `hardhat verify` | Both integrate with Etherscan |
| **Dry Run** | ✅ `--broadcast` flag | ✅ | Both support simulation |
| **Multi-chain** | ✅ RPC config | ✅ Network config | Tie |

### Tooling & Ecosystem

| Tool | Foundry | Hardhat | Notes |
|------|---------|---------|-------|
| **Package Manager** | Git submodules / soldeer | npm | Hardhat easier for JS devs |
| **Plugin Ecosystem** | Growing (~50+) | Large (300+) | **Hardhat** |
| **OpenZeppelin** | ✅ via forge install | ✅ npm install | Tie |
| **Chainlink** | ✅ | ✅ | Tie |
| **Ethers.js** | ❌ (uses cast) | ✅ Native | Hardhat for ethers |
| **Viem** | ✅ (good integration) | ✅ | Tie |
| **TheGraph** | ✅ | ✅ | Tie |

### Debugging & Analysis

| Feature | Foundry | Hardhat | Notes |
|---------|---------|---------|-------|
| **Stack Traces** | ✅ Detailed | ✅ Good | Both good |
| **Console Logging** | `forge-std/console.sol` | `hardhat/console.sol` | Same API |
| **Step-through Debug** | `forge debug` | ❌ | **Foundry** |
| **Gas Profiling** | `forge test --gas-report` | Plugin | Foundry built-in |
| **Storage Layout** | `forge inspect` | Plugin | Foundry built-in |
| **Slither Integration** | ✅ | ✅ | Tie |

### Network & Fork Testing

| Feature | Foundry | Hardhat | Notes |
|---------|---------|---------|-------|
| **Local Node** | `anvil` | `npx hardhat node` | Both work well |
| **Fork Testing** | ✅ Fast | ✅ Good | **Foundry** (faster) |
| **Impersonation** | `vm.prank` | `impersonateAccount` | Tie |
| **Time Manipulation** | `vm.warp` | `evm_increaseTime` | Tie |
| **Block Manipulation** | `vm.roll` | `evm_mine` | Tie |
| **State Persistence** | ✅ | ✅ | Tie |

## AI Development Considerations

| Factor | Foundry | Hardhat | Notes |
|--------|---------|---------|-------|
| **Training Data Size** | Smaller (newer) | Larger | More Hardhat examples exist |
| **StackOverflow Qs** | ~2,000 | ~15,000 | **Hardhat** |
| **GitHub Repos** | Growing | More | **Hardhat** |
| **AI Code Gen Quality** | Good | Very Good | More Hardhat patterns |
| **Documentation** | Excellent (The Book) | Excellent | Tie |

### Code Example Comparison

**Foundry Test:**
```solidity
// test/Token.t.sol
import "forge-std/Test.sol";
import "../src/Token.sol";

contract TokenTest is Test {
    Token token;
    
    function setUp() public {
        token = new Token("Test", "TST", 1000);
    }
    
    function testTransfer() public {
        token.transfer(address(1), 100);
        assertEq(token.balanceOf(address(1)), 100);
    }
    
    function testFuzz_Transfer(uint256 amount) public {
        vm.assume(amount <= 1000);
        token.transfer(address(1), amount);
        assertEq(token.balanceOf(address(1)), amount);
    }
}
```

**Hardhat Test:**
```typescript
// test/Token.ts
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Token", function () {
  it("Should transfer tokens", async function () {
    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy("Test", "TST", 1000);
    
    const [owner, addr1] = await ethers.getSigners();
    await token.transfer(addr1.address, 100);
    
    expect(await token.balanceOf(addr1.address)).to.equal(100);
  });
});
```

## Performance Benchmarks (Expected)

| Metric | Foundry | Hardhat | Difference |
|--------|---------|---------|------------|
| **Compile (100 contracts)** | ~2s | ~10s | 5x faster |
| **Test Suite (1000 tests)** | ~5s | ~60s | 12x faster |
| **Fork Test** | ~1s setup | ~5s setup | 5x faster |
| **Coverage Report** | ~10s | ~30s | 3x faster |

> **Note**: Actual benchmarks will be measured after implementation.

## Recommendations by Use Case

### Use Foundry When:
- You want the fastest test execution
- You prefer writing tests in Solidity
- You need built-in fuzzing and invariant testing
- You want step-through debugging
- You're building performance-critical protocols

### Use Hardhat When:
- Your team is more comfortable with JavaScript/TypeScript
- You need a large plugin ecosystem
- You're integrating with existing JS tooling
- You want Hardhat Ignition for structured deployments
- You have existing Hardhat projects to maintain

### Hybrid Approach:
Many teams use both:
- **Foundry** for testing and local development (speed)
- **Hardhat** for deployment scripts and tooling (ecosystem)

## Integration with Other Tools

| Tool | Foundry | Hardhat |
|------|---------|---------|
| **Remix** | Import via URL | Import via URL |
| **Tenderly** | ✅ | ✅ |
| **Alchemy** | ✅ | ✅ |
| **Infura** | ✅ | ✅ |
| **OpenZeppelin Defender** | ✅ | ✅ |
| **Safe (Gnosis)** | ✅ | ✅ |

## Resources

### Foundry
- **Documentation**: https://book.getfoundry.sh/
- **GitHub**: https://github.com/foundry-rs/foundry
- **Discord**: Paradigm Discord
- **Examples**: https://github.com/foundry-rs/foundry/tree/master/testdata

### Hardhat
- **Documentation**: https://hardhat.org/docs
- **GitHub**: https://github.com/NomicFoundation/hardhat
- **Discord**: Hardhat Discord
- **Tutorials**: https://hardhat.org/tutorial

---

**Last Updated**: December 2024
**Next Update**: After implementation comparison is complete
