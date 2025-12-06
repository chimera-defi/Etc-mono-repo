# Foundry (Forge) Smart Contract Project

This folder contains a Foundry-based smart contract project for comparison with Hardhat.

## Status: ⏳ Pending Implementation

## Overview

Foundry is a blazing-fast, portable, and modular toolkit for Ethereum application development written in Rust.

### Components
- **Forge**: Testing framework (like Truffle, Hardhat)
- **Cast**: CLI for interacting with contracts
- **Anvil**: Local Ethereum node (like Ganache, Hardhat Network)
- **Chisel**: Solidity REPL

## Quick Start

```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Navigate to app folder
cd app

# Build contracts
forge build

# Run tests
forge test

# Run tests with gas report
forge test --gas-report

# Deploy (dry run)
forge script script/Deploy.s.sol --rpc-url <RPC_URL>
```

## Project Structure

```
app/
├── src/              # Smart contracts
│   ├── Token.sol     # ERC-20 Token
│   └── NFT.sol       # ERC-721 NFT
├── test/             # Solidity tests
│   ├── Token.t.sol
│   └── NFT.t.sol
├── script/           # Deployment scripts
│   └── Deploy.s.sol
├── lib/              # Dependencies (git submodules)
└── foundry.toml      # Configuration
```

## Key Commands

| Command | Description |
|---------|-------------|
| `forge build` | Compile contracts |
| `forge test` | Run tests |
| `forge test -vvvv` | Verbose test output |
| `forge test --match-test testName` | Run specific test |
| `forge coverage` | Generate coverage report |
| `forge snapshot` | Gas snapshot |
| `forge debug` | Step-through debugger |
| `anvil` | Start local node |
| `cast` | CLI for contract interaction |

## Implementation Goals

- [ ] Initialize Foundry project
- [ ] Implement ERC-20 Token with minting
- [ ] Implement ERC-721 NFT with metadata
- [ ] Write comprehensive unit tests
- [ ] Add fuzz tests
- [ ] Create deployment scripts
- [ ] Document gas usage

## Resources

- [Foundry Book](https://book.getfoundry.sh/)
- [Foundry GitHub](https://github.com/foundry-rs/foundry)
- [forge-std](https://github.com/foundry-rs/forge-std)
- [OpenZeppelin Contracts](https://github.com/OpenZeppelin/openzeppelin-contracts)

---

See `TASKS.md` for detailed implementation tasks.
