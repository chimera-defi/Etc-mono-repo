# Understanding Document — Foundry

## What is Foundry?

Foundry is a modern smart contract development toolkit written in Rust. It was created by Paradigm and has become a popular alternative to Hardhat/Truffle for Ethereum development.

## Core Philosophy

1. **Speed**: Rust-based tooling is significantly faster than Node.js alternatives
2. **Solidity-First**: Write tests in Solidity, not JavaScript
3. **Native Fuzzing**: Property-based testing built into the framework
4. **Developer Experience**: Modern CLI with excellent ergonomics

## Why Foundry for This Comparison?

| Reason | Details |
|--------|---------|
| Speed | Reports of 10-100x faster test execution |
| Testing Paradigm | Solidity tests = closer to contract logic |
| Built-in Fuzzing | Find edge cases automatically |
| Growing Adoption | Many new projects choose Foundry |
| Modern Tooling | Step-through debugger, gas snapshots |

## Architecture

```
Foundry Toolkit
├── Forge     → Build & Test (like Hardhat core)
├── Cast      → CLI for chain interaction (like ethers.js CLI)
├── Anvil     → Local node (like Hardhat Network)
└── Chisel    → Solidity REPL (unique to Foundry)
```

## Key Concepts

### 1. Test Contracts (not test files)
Tests are Solidity contracts that inherit from `Test`:
```solidity
import "forge-std/Test.sol";
contract MyTest is Test { ... }
```

### 2. Cheatcodes (vm)
The `vm` object provides test utilities:
- `vm.prank(address)` - Impersonate an address
- `vm.warp(timestamp)` - Set block timestamp
- `vm.roll(blockNumber)` - Set block number
- `vm.expectRevert()` - Expect next call to revert
- `vm.mockCall()` - Mock external calls

### 3. Fuzz Testing
Automatic input generation:
```solidity
function testFuzz_Transfer(uint256 amount) public {
    vm.assume(amount <= balance);
    // Test runs with many random amounts
}
```

### 4. Assertions
Similar to other testing frameworks:
```solidity
assertEq(a, b);      // Equal
assertTrue(x);        // True
assertGt(a, b);      // Greater than
assertLt(a, b);      // Less than
```

## Comparison with Hardhat

| Foundry | Hardhat |
|---------|---------|
| `forge build` | `npx hardhat compile` |
| `forge test` | `npx hardhat test` |
| `anvil` | `npx hardhat node` |
| `forge script` | JS deploy scripts |
| `vm.prank()` | `impersonateAccount()` |
| `vm.warp()` | `evm_increaseTime` |

## Known Strengths

1. **Compilation Speed**: Significantly faster due to Rust
2. **Test Speed**: No Node.js overhead
3. **Debugging**: Step-through debugger with `forge debug`
4. **Gas Snapshots**: Track gas changes across commits
5. **Fuzzing**: Find bugs you didn't think to test for

## Known Limitations

1. **Plugin Ecosystem**: Smaller than Hardhat's
2. **JS Integration**: Less natural for frontend devs
3. **Learning Curve**: Different paradigm from JS testing
4. **Package Management**: Git submodules (though Soldeer is emerging)

## What Success Looks Like

1. ✅ Project initializes and compiles
2. ✅ Tests pass with meaningful coverage
3. ✅ Fuzz tests run without finding issues
4. ✅ Deployment scripts work
5. ✅ Metrics collected for comparison
6. ✅ Documentation updated

## Research Questions to Answer

1. How does compilation time compare to Hardhat?
2. How does test execution time compare?
3. Is the Solidity testing paradigm better for finding bugs?
4. How easy is it to debug failing tests?
5. What's the experience like for a Hardhat-experienced dev?

---

**Last Updated**: December 2024
