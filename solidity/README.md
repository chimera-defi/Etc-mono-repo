# 🔧 Solidity Smart Contract Development Workspace

A comprehensive workspace for experimenting with smart contracts using best-in-class tooling including **Foundry**, **Hardhat**, **Slither**, and more.

## 📁 Project Structure

```
solidity/
├── foundry-project/     # Foundry (Forge) based project
│   ├── src/             # Smart contracts
│   ├── test/            # Solidity tests (including fuzz tests)
│   ├── script/          # Deployment scripts
│   └── lib/             # Dependencies (forge-std)
├── hardhat-project/     # Hardhat based project
│   ├── contracts/       # Smart contracts
│   ├── test/            # TypeScript tests
│   ├── scripts/         # Deployment scripts
│   └── typechain-types/ # Generated TypeScript bindings
├── Makefile             # Unified commands for both projects
├── slither.config.json  # Slither configuration
└── TOOLING_COMPARISON.md
```

## 🚀 Quick Start

### Prerequisites

```bash
# Install Foundry (if not already installed)
curl -L https://foundry.paradigm.xyz | bash
source ~/.bashrc
foundryup

# Install Slither
pip3 install slither-analyzer

# Install Node.js dependencies for Hardhat
cd hardhat-project && npm install
```

### Build & Test

```bash
# Using Make (recommended)
make build      # Build both projects
make test       # Run all tests
make gas        # Generate gas reports
make slither    # Run security analysis

# Or individually:

# Foundry
cd foundry-project
forge build
forge test -vvv                    # Run tests with verbose output
forge test --fuzz-runs 1000        # More extensive fuzzing
forge coverage                      # Code coverage

# Hardhat
cd hardhat-project
npm run compile                     # Compile contracts
npm test                            # Run tests
npm run test:coverage               # Code coverage
npm run test:gas                    # Gas reporting
```

## 📦 Sample Contracts

Both projects include identical contracts for fair comparison:

| Contract | Description |
|----------|-------------|
| `Counter.sol` | Simple counter (Foundry default) |
| `Vault.sol` | ERC20 token vault with shares-based accounting |
| `MultiSigWallet.sol` | N-of-M multi-signature wallet |
| `MockERC20.sol` | Test token with mint/burn |

### Vault Features
- Deposit ERC20 tokens and receive proportional shares
- Withdraw tokens by redeeming shares
- Reentrancy protection
- Admin emergency withdrawal
- Custom errors for gas efficiency

### MultiSig Features
- N-of-M signature threshold
- Submit, confirm, execute, revoke transactions
- Full event logging
- Duplicate owner protection

## 🧪 Testing

### Foundry Tests
- **Unit Tests**: Standard assertions with `assertEq`, `assertTrue`, etc.
- **Fuzz Tests**: Property-based testing with random inputs (prefix: `testFuzz_`)
- **Invariant Tests**: State invariants checked across random sequences

```solidity
// Example fuzz test
function testFuzz_Deposit(uint256 amount) public {
    amount = bound(amount, 1, INITIAL_BALANCE);
    vault.deposit(amount);
    assertEq(vault.shares(alice), amount);
}
```

### Hardhat Tests
- **Fixtures**: Reusable test setup with `loadFixture`
- **Chai Matchers**: Expressive assertions with `expect`
- **Custom Error Support**: `revertedWithCustomError`
- **Event Testing**: `to.emit(contract, "Event")`

```typescript
// Example Hardhat test
it("Should deposit tokens correctly", async function () {
    await vault.connect(alice).deposit(depositAmount);
    expect(await vault.shares(alice.address)).to.equal(depositAmount);
});
```

## 🔒 Security Analysis

### Slither
Run static analysis on your contracts:

```bash
# Analyze Foundry project
cd foundry-project
slither . --config-file ../slither.config.json

# Analyze Hardhat project  
cd hardhat-project
slither . --config-file ../slither.config.json
```

### Common Detectors
- Reentrancy vulnerabilities
- Unchecked external calls
- Integer overflow/underflow
- Arbitrary send of ETH
- Weak PRNG
- And many more...

## ⛽ Gas Optimization

### Foundry Gas Report
```bash
forge test --gas-report
```

### Hardhat Gas Report
```bash
REPORT_GAS=true npx hardhat test
```

### Gas Snapshot (Foundry)
```bash
forge snapshot                     # Create baseline
forge snapshot --check             # Compare against baseline
forge snapshot --diff              # Show differences
```

## 🌐 Local Development

### Anvil (Foundry's Local Node)
```bash
anvil                              # Start local node
# In another terminal:
forge script script/Counter.s.sol --fork-url http://localhost:8545 --broadcast
```

### Hardhat Node
```bash
npx hardhat node                   # Start local node
# In another terminal:
npx hardhat run scripts/deploy.ts --network localhost
```

## 📝 Makefile Commands

| Command | Description |
|---------|-------------|
| `make help` | Show all available commands |
| `make install` | Install all dependencies |
| `make build` | Build both projects |
| `make test` | Run all tests |
| `make coverage` | Generate coverage reports |
| `make gas` | Generate gas reports |
| `make slither` | Run security analysis |
| `make format` | Format Solidity code |
| `make lint` | Check code formatting |
| `make clean` | Clean build artifacts |
| `make all` | Build, test, gas report, and security scan |

## 🔧 Configuration

### Foundry (`foundry.toml`)
- Solidity version: 0.8.20
- Optimizer: enabled (200 runs)
- Fuzz runs: 256 (default), 1000 (CI)
- Invariant depth: 15

### Hardhat (`hardhat.config.ts`)
- Solidity version: 0.8.20
- Optimizer: enabled (200 runs)
- TypeScript support
- Gas reporter integration
- Etherscan verification ready

## 📊 Tooling Comparison

See [TOOLING_COMPARISON.md](./TOOLING_COMPARISON.md) for a detailed comparison between Foundry and Hardhat.

## 🔄 Forking & Extending

This workspace is designed to be forked and extended:

1. **New Contract**: Add `.sol` files to `src/` (Foundry) or `contracts/` (Hardhat)
2. **New Tests**: Add tests in the respective `test/` directories
3. **New Scripts**: Add deployment scripts to `script/` or `scripts/`

### Example: Adding a New Contract

```bash
# Foundry
touch foundry-project/src/MyContract.sol
touch foundry-project/test/MyContract.t.sol

# Hardhat
touch hardhat-project/contracts/MyContract.sol
touch hardhat-project/test/MyContract.test.ts
```

## 📚 Resources

### Documentation
- [Foundry Book](https://book.getfoundry.sh/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Slither Wiki](https://github.com/crytic/slither/wiki)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)

### Learning
- [Solidity by Example](https://solidity-by-example.org/)
- [Smart Contract Security Best Practices](https://consensys.github.io/smart-contract-best-practices/)
- [Damn Vulnerable DeFi](https://www.damnvulnerabledefi.xyz/)

## 🏷️ Version Info

| Tool | Version |
|------|---------|
| Foundry (Forge) | 1.5.0-stable |
| Hardhat | 2.22.x |
| Solidity | 0.8.20 |
| Slither | 0.11.3 |
| OpenZeppelin | 5.0.0 |

## 📄 License

MIT
