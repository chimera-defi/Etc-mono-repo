# Dapp Framework Comparison: Foundry vs Hardhat

## Executive Summary

After implementing identical smart contracts (ERC-20 Token and ERC-721 NFT) in both frameworks, Foundry demonstrates significant performance advantages while Hardhat offers a more familiar JavaScript/TypeScript ecosystem.

| Metric | Foundry | Hardhat | Winner |
|--------|---------|---------|--------|
| **Compile Time** | 0.65s | 1.58s | ✅ Foundry (2.4x faster) |
| **Test Execution** | 0.13s | 1.50s | ✅ Foundry (11.5x faster) |
| **Dependency Size** | 16 MB | 496 MB | ✅ Foundry (31x smaller) |
| **Built-in Fuzzing** | ✅ Yes | ❌ No | ✅ Foundry |
| **Test Language** | Solidity | TypeScript | Preference |
| **Ecosystem/Plugins** | Growing | Mature | ⚡ Hardhat |
| **TypeScript Support** | Limited | Native | ⚡ Hardhat |

## Detailed Metrics

### Compilation Performance

| Framework | Clean Build Time | Notes |
|-----------|-----------------|-------|
| **Foundry** | **0.65s** | Rust-based compiler, parallel by default |
| **Hardhat** | 1.58s | Node.js, includes TypeChain generation |

### Test Execution

| Framework | Time | Tests | Fuzz Runs |
|-----------|------|-------|-----------|
| **Foundry** | **0.13s** | 21 | 1280 (5 fuzz tests × 256 runs) |
| **Hardhat** | 1.50s | 23 | 0 (no built-in fuzzing) |

*Foundry is ~11.5x faster even while running 1280 additional fuzz test iterations*

### Test Coverage

| Framework | Lines | Statements | Branches | Functions |
|-----------|-------|------------|----------|-----------|
| Foundry (src/) | 100% | 100% | 100% | 100% |
| Hardhat | 100% | 100% | 100% | 100% |

*Both achieved 100% coverage on contract code*

### Gas Reports (Key Operations)

| Operation | Foundry (avg) | Hardhat (avg) | Difference |
|-----------|---------------|---------------|------------|
| Token.transfer | 51,502 | 52,200 | ~1.4% lower in Foundry |
| Token.mint | 53,442 | 54,190 | ~1.4% lower in Foundry |
| Token.burn | 33,609 | 34,191 | ~1.7% lower in Foundry |
| NFT.mint | 67,175 | 85,859 | ~22% lower in Foundry* |
| NFT.transferFrom | 55,468 | 55,935 | ~0.8% lower in Foundry |

*NFT.mint difference is due to different test scenarios (Foundry runs more iterations in fuzz tests)*

### Lines of Code

| Component | Foundry | Hardhat | Notes |
|-----------|---------|---------|-------|
| Contracts | 83 | 83 | Identical Solidity code |
| Tests | 219 | 232 | Solidity vs TypeScript |
| Deployment | 30 | 13 | Script vs Ignition module |
| Config | 0 | 12 | foundry.toml default vs hardhat.config.ts |
| **Total** | **332** | **340** | Similar total |

### Dependency Footprint

| Framework | Size | Package Count |
|-----------|------|---------------|
| **Foundry** | **16 MB** | 2 (forge-std, openzeppelin) |
| Hardhat | 496 MB | 584 packages |

*Foundry has 31x smaller dependency footprint*

## Feature Comparison

### Testing Capabilities

| Feature | Foundry | Hardhat |
|---------|---------|---------|
| **Fuzz Testing** | ✅ Built-in | ❌ Requires external tools |
| **Invariant Testing** | ✅ Built-in | ❌ Limited support |
| **Symbolic Execution** | Halmos (separate tool) | ❌ No |
| **Snapshot Testing** | ✅ `vm.snapshot()` | ✅ `loadFixture()` |
| **Gas Snapshots** | ✅ `forge snapshot` | ✅ `hardhat-gas-reporter` |
| **Coverage** | ✅ `forge coverage` | ✅ `solidity-coverage` |
| **Mocking** | ✅ Cheatcodes | ✅ hardhat-chai-matchers |

### Development Experience

| Feature | Foundry | Hardhat |
|---------|---------|---------|
| **Test Language** | Solidity | JavaScript/TypeScript |
| **Learning Curve** | Steeper (Solidity tests) | Gentler (JS ecosystem) |
| **IDE Support** | Good (Solidity) | Excellent (TS/JS) |
| **Debugging** | `forge debug`, `-vvvv` | Stack traces, console.log |
| **REPL** | ✅ Chisel | ✅ Console tasks |
| **TypeScript Types** | ❌ Manual | ✅ TypeChain auto-gen |

### Deployment & Tooling

| Feature | Foundry | Hardhat |
|---------|---------|---------|
| **Deployment Scripts** | Solidity scripts | JavaScript/Ignition |
| **Verification** | ✅ `forge verify` | ✅ `hardhat verify` |
| **Local Network** | ✅ Anvil (faster) | ✅ Hardhat Network |
| **Mainnet Forking** | ✅ Fast | ✅ Supported |
| **Plugin Ecosystem** | Growing | Extensive |
| **Task System** | Scripts only | ✅ Custom tasks |

## Recommendations

### Choose Foundry If:
- ⚡ **Speed is critical** - 11x faster tests, 2.4x faster compilation
- 🧪 **You need fuzz testing** - Built-in, no extra setup
- 💾 **Disk space matters** - 31x smaller dependencies
- 🔧 **You prefer Solidity** - Tests in the same language as contracts
- 🏗️ **Building new projects** - Modern tooling, trending in the community

### Choose Hardhat If:
- 📚 **JS/TS ecosystem comfort** - Familiar testing frameworks (Mocha, Chai)
- 🔌 **Need specific plugins** - Larger ecosystem of integrations
- 👥 **Team knows TypeScript** - Lower learning curve
- 📝 **TypeScript types needed** - Auto-generated contract types
- 🏢 **Enterprise support** - More established, Nomic Foundation backing

### Hybrid Approach
Many teams use **both**:
- **Foundry for testing** - Fast iteration, fuzz testing
- **Hardhat for deployment** - Ignition for complex deployments
- **Shared contracts** - Same Solidity code, different test suites

## Framework Versions Tested

| Framework | Version |
|-----------|---------|
| Foundry | 1.5.0-stable (2025-11-26) |
| Hardhat | 2.27.1 |
| Solidity | 0.8.20 (Hardhat) / 0.8.30 (Foundry) |
| OpenZeppelin | 5.5.0 (Foundry) / 5.x (Hardhat) |

## Additional Comparison Points Discovered

### During Implementation:
1. **Error Messages**: Foundry's error messages are more concise; Hardhat provides more verbose stack traces
2. **Hot Reload**: Foundry's `forge test --watch` is faster than Hardhat's watch mode
3. **CI/CD**: Foundry requires fewer dependencies to install, faster CI pipelines
4. **Dependency Management**: Foundry uses git submodules (simpler), Hardhat uses npm (more familiar)
5. **Contract Size Reporting**: Both support it, Foundry via `forge build --sizes`
6. **Solidity Version**: Foundry defaults to latest, Hardhat requires explicit config

### Production Considerations:
1. **Audit Compatibility**: Both widely accepted by auditors
2. **Upgrade Patterns**: Both support proxy patterns equally
3. **Multi-chain**: Both support arbitrary RPC endpoints
4. **Gas Optimization**: Foundry's optimizer settings are simpler to configure

---

*Comparison conducted: December 2025*
*Test environment: Linux, Node.js v22.21.1, Foundry 1.5.0*

**Note**: Timing metrics are approximate and may vary by ~20% between runs. Gas values are from actual test execution.
