# ⚔️ Solidity Tooling Comparison: Foundry vs Hardhat

A comprehensive comparison of the two leading smart contract development frameworks.

## 📊 Overview Comparison

| Feature | Foundry | Hardhat |
|---------|---------|---------|
| **Language** | Rust | JavaScript/TypeScript |
| **Test Language** | Solidity | JS/TS (Mocha/Chai) |
| **Speed** | ⚡ Very Fast | 🐢 Moderate |
| **Fuzzing** | ✅ Built-in | ❌ Requires plugins |
| **Invariant Testing** | ✅ Built-in | ❌ Not native |
| **Debugger** | ✅ forge debug | ✅ console.log, Tenderly |
| **TypeScript** | ❌ N/A | ✅ First-class support |
| **Frontend Integration** | 🔸 Manual | ✅ Excellent (ethers.js) |
| **Plugin Ecosystem** | 🔸 Growing | ✅ Extensive |
| **Learning Curve** | Moderate | Easier for JS devs |
| **Maturity** | ~3 years | ~5 years |

## 🚀 Performance

### Compilation Speed
```
Foundry: 1.47s (29 files)
Hardhat: 2.1s (15 files with type generation)
```

### Test Execution
```
Foundry: 32 tests in 229ms (including fuzz + invariant)
Hardhat: 35 tests in 604ms (unit tests only)
```

**Winner: Foundry** - Rust-based compiler and test runner significantly outperform.

## 🧪 Testing Capabilities

### Foundry Testing

**Pros:**
- ✅ Tests written in Solidity (same mental model)
- ✅ Built-in fuzz testing with property-based testing
- ✅ Invariant/stateful testing
- ✅ Cheat codes (`vm.prank`, `vm.warp`, `vm.roll`)
- ✅ Gas snapshots for regression testing
- ✅ Differential testing

**Example Fuzz Test:**
```solidity
function testFuzz_Deposit(uint256 amount) public {
    amount = bound(amount, 1, INITIAL_BALANCE);
    vm.prank(alice);
    vault.deposit(amount);
    assertEq(vault.shares(alice), amount);
}
```

**Example Invariant Test:**
```solidity
function invariant_VaultSolvency() public view {
    if (vault.totalShares() > 0) {
        assertTrue(token.balanceOf(address(vault)) > 0);
    }
}
```

### Hardhat Testing

**Pros:**
- ✅ Familiar for JavaScript/TypeScript developers
- ✅ Rich assertion library (Chai matchers)
- ✅ Easy async/await testing
- ✅ Better for complex multi-contract scenarios
- ✅ Snapshot testing
- ✅ Better DX with IDE support

**Example Test:**
```typescript
it("Should deposit tokens correctly", async function () {
    const { vault, token, alice } = await loadFixture(deployVaultFixture);
    await vault.connect(alice).deposit(ethers.parseEther("100"));
    expect(await vault.shares(alice.address)).to.equal(ethers.parseEther("100"));
});
```

### Feature Comparison

| Feature | Foundry | Hardhat |
|---------|---------|---------|
| Unit Tests | ✅ | ✅ |
| Integration Tests | ✅ | ✅ |
| Fuzz Testing | ✅ Native | 🔸 Plugin (fast-check) |
| Invariant Testing | ✅ Native | ❌ |
| Property-Based | ✅ Native | 🔸 Plugin |
| Time Manipulation | ✅ `vm.warp` | ✅ `time.increase` |
| Block Manipulation | ✅ `vm.roll` | ✅ `mine` |
| Account Impersonation | ✅ `vm.prank` | ✅ `impersonateAccount` |
| Balance Manipulation | ✅ `deal` | ✅ `setBalance` |
| Storage Manipulation | ✅ `vm.store` | ✅ `setStorageAt` |
| Forking | ✅ `--fork-url` | ✅ `forking` config |
| Trace Debugging | ✅ `-vvvv` | 🔸 Tenderly |
| Gas Snapshots | ✅ Native | 🔸 Plugin |

## 🔐 Security Tooling

### Slither Integration

Both frameworks work with Slither:

```bash
# Foundry
cd foundry-project && slither .

# Hardhat
cd hardhat-project && slither .
```

### Other Security Tools

| Tool | Foundry | Hardhat |
|------|---------|---------|
| Slither | ✅ | ✅ |
| Mythril | ✅ | ✅ |
| Echidna | ✅ Native-like | 🔸 Separate |
| Medusa | ✅ Compatible | 🔸 Separate |
| Certora | ✅ | ✅ |
| Aderyn (Cyfrin) | ✅ | ✅ |

## 📦 Dependency Management

### Foundry
```bash
# Install dependency
forge install OpenZeppelin/openzeppelin-contracts

# Update dependency
forge update lib/openzeppelin-contracts

# Remappings (foundry.toml or remappings.txt)
@openzeppelin/=lib/openzeppelin-contracts/
```

### Hardhat
```bash
# Install dependency
npm install @openzeppelin/contracts

# Update
npm update @openzeppelin/contracts

# Import in contract
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
```

**Trade-offs:**
- Foundry: Git submodules (version pinning), no NPM overhead
- Hardhat: NPM packages (familiar), larger ecosystem

## 🌐 Frontend Integration

### Foundry
- Manual ABI extraction from `out/` folder
- Can use `forge bind` to generate bindings
- Requires manual setup with ethers.js/viem

### Hardhat
- TypeChain generates TypeScript bindings automatically
- Seamless integration with ethers.js
- `@nomicfoundation/hardhat-toolbox` includes everything

**Winner: Hardhat** - Better DX for frontend developers.

## 📝 Scripting & Deployment

### Foundry Scripts
```solidity
// script/Deploy.s.sol
contract DeployScript is Script {
    function run() external {
        vm.startBroadcast();
        new Vault(tokenAddress);
        vm.stopBroadcast();
    }
}
```
```bash
forge script script/Deploy.s.sol --rpc-url $RPC_URL --broadcast
```

### Hardhat Scripts
```typescript
// scripts/deploy.ts
async function main() {
    const Vault = await ethers.getContractFactory("Vault");
    const vault = await Vault.deploy(tokenAddress);
    await vault.waitForDeployment();
}
```
```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

**Trade-offs:**
- Foundry: Scripts in Solidity (same language, simpler)
- Hardhat: JavaScript flexibility, better for complex deployments

## 🔧 Developer Experience

### IDE Support

| IDE Feature | Foundry | Hardhat |
|-------------|---------|---------|
| VSCode Extension | ✅ Solidity | ✅ Solidity + TS |
| IntelliSense | ✅ | ✅ |
| Go to Definition | ✅ | ✅ |
| Inline Errors | ✅ | ✅ |
| Test Discovery | 🔸 | ✅ |
| Debugging | 🔸 Terminal | ✅ VSCode |

### CLI Experience

**Foundry:**
```bash
forge build              # Compile
forge test -vvvv         # Test with traces
forge coverage           # Coverage
forge fmt                # Format
forge snapshot           # Gas snapshot
cast send ...            # Send transactions
anvil                    # Local node
chisel                   # REPL
```

**Hardhat:**
```bash
npx hardhat compile
npx hardhat test
npx hardhat coverage
npx hardhat node
npx hardhat console
npx hardhat verify
```

## 🎯 When to Use Which

### Choose Foundry When:
- 🔬 Security-focused development (auditing, CTF)
- 🧪 Need fuzz testing and invariant testing
- ⚡ Performance is critical (large test suites)
- 📊 Gas optimization is a priority
- 🔧 Protocol development (DeFi, etc.)
- 🧑‍💻 Prefer writing tests in Solidity

### Choose Hardhat When:
- 🌐 Building dApps with frontend
- 📦 Need extensive plugin ecosystem
- 🔷 Team is JavaScript/TypeScript focused
- 🏢 Enterprise/production deployments
- 🔌 Need specific integrations (OpenZeppelin Defender, etc.)
- 📚 Prefer comprehensive documentation

### Use Both When:
- 🤝 Hybrid approach (Foundry tests + Hardhat deploy)
- 🔄 Migrating between frameworks
- 📋 Different team preferences
- ⚖️ Different needs for different stages

## 🔀 Hybrid Approach

You can use both frameworks together:

```
project/
├── foundry.toml
├── hardhat.config.ts
├── contracts/           # Shared contracts (for Hardhat)
├── src/                 # Symlink to contracts (for Foundry)
├── test/
│   ├── foundry/         # Solidity fuzz/invariant tests
│   └── hardhat/         # Integration tests
└── scripts/             # Hardhat deployment scripts
```

## 📈 Ecosystem Growth

### Foundry (Paradigm)
- Rapidly growing adoption
- Strong DeFi protocol adoption
- Active development (frequent releases)
- Backed by leading crypto VC

### Hardhat (Nomic Foundation)
- Mature and stable
- Industry standard for years
- Huge plugin ecosystem
- Strong enterprise adoption

## 🏆 Verdict

| Criterion | Winner |
|-----------|--------|
| Speed | Foundry |
| Testing Power | Foundry |
| Frontend DX | Hardhat |
| Plugin Ecosystem | Hardhat |
| Learning Curve | Hardhat |
| Security Testing | Foundry |
| Gas Optimization | Foundry |
| Production Deploys | Tie |
| Documentation | Tie |

### Final Recommendation

**For protocol development**: Start with **Foundry** for its superior testing capabilities.

**For dApp development**: Use **Hardhat** for its excellent frontend integration.

**For serious projects**: Consider **both** - Foundry for testing, Hardhat for deployment.

---

## 📚 Additional Resources

### Foundry
- [Foundry Book](https://book.getfoundry.sh/)
- [Foundry GitHub](https://github.com/foundry-rs/foundry)
- [Paradigm's Foundry Blog](https://www.paradigm.xyz/2021/12/introducing-the-foundry-ethereum-development-toolbox)

### Hardhat
- [Hardhat Documentation](https://hardhat.org/docs)
- [Hardhat GitHub](https://github.com/NomicFoundation/hardhat)
- [Nomic Foundation Blog](https://nomic.foundation/blog)

### Tutorials
- [Patrick Collins - Foundry Course](https://github.com/Cyfrin/foundry-full-course-f23)
- [Alchemy - Hardhat Tutorial](https://docs.alchemy.com/docs/how-to-develop-an-nft-smart-contract-erc721-with-alchemy)
- [Smart Contract Programmer](https://solidity-by-example.org/)
